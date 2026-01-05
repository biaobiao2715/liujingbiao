<template>
  <div>
    <el-upload
      v-if="type === 'url'"
      :action="upload.url"
      :before-upload="handleBeforeUpload"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      class="editor-img-uploader"
      name="file"
      :show-file-list="false"
      :headers="upload.headers"
      multiple
    >
      <i ref="uploadRef"></i>
    </el-upload>
  </div>
  <div class="editor">
    <quill-editor
      ref="quillEditorRef"
      v-model:content="content"
      content-type="html"
      :options="options"
      :style="styles"
      @text-change="(e: any) => $emit('update:modelValue', content)"
    />
  </div>
</template>

<script setup lang="ts">
import '@vueup/vue-quill/dist/vue-quill.snow.css';

import { QuillEditor, Quill } from '@vueup/vue-quill';
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from '@/utils/request';
import { ElMessage } from 'element-plus';
import { nextTick } from 'vue';

defineEmits(['update:modelValue']);

const props = defineProps({
  /* 编辑器的内容 */
  modelValue: propTypes.string,
  /* 高度 */
  height: propTypes.number.def(400),
  /* 最小高度 */
  minHeight: propTypes.number.def(400),
  /* 只读 */
  readOnly: propTypes.bool.def(false),
  /* 上传文件大小限制(MB) */
  fileSize: propTypes.number.def(5),
  /* 类型（base64格式、url格式） */
  type: propTypes.string.def('url'),
  // 是否展示工具栏
  showToolbar: propTypes.bool.def(true)
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const upload = reactive<UploadOption>({
  headers: globalHeaders(),
  url: import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload'
});
const quillEditorRef = ref();
const uploadRef = ref<HTMLDivElement>();

const options = ref<any>({
  theme: 'snow',
  bounds: document.body,
  debug: 'warn',
  modules: {
    // 工具栏配置
    toolbar: props.showToolbar
      ? {
          container: [
            ['bold', 'italic', 'underline', 'strike'], // 加粗 斜体 下划线 删除线
            ['blockquote', 'code-block'], // 引用  代码块
            [{ list: 'ordered' }, { list: 'bullet' }], // 有序、无序列表
            [{ indent: '-1' }, { indent: '+1' }], // 缩进
            [{ size: ['small', false, 'large', 'huge'] }], // 字体大小
            [{ header: [1, 2, 3, 4, 5, 6, false] }], // 标题
            [{ color: [] }, { background: [] }], // 字体颜色、字体背景颜色
            [{ align: [] }], // 对齐方式
            ['clean'], // 清除文本格式
            ['link', 'image', 'video'] // 链接、图片、视频
          ],
          handlers: {
            image: (value: boolean) => {
              if (value) {
                // 调用element图片上传
                uploadRef.value.click();
              }
            },
            header: (value: number | string | boolean) => {
              const quill = toRaw(quillEditorRef.value).getQuill();
              const range = quill.getSelection(true);

              if (!range || range.length === 0) {
                // 如果没有选中文字，提示用户
                ElMessage.warning('请先选中要设置为标题的文本');
                return;
              }

              // 获取选中的文本
              const selectedText = quill.getText(range.index, range.length);
              if (!selectedText || selectedText.trim() === '') {
                ElMessage.warning('选中的文本为空，无法设置为标题');
                return;
              }

              // 获取选中文本所在的行/块
              const [line, offset] = quill.getLine(range.index);
              if (!line) return;

              const lineStart = line.offset();
              const lineLength = line.length();
              const isFullLine = range.index === lineStart && range.length === lineLength;

              if (isFullLine) {
                // 如果选中的是整行，直接应用 header 格式到这一行
                if (value !== false) {
                  // 先移除可能存在的其他格式
                  quill.formatLine(range.index, 1, 'header', false);
                  // 再应用新的 header 格式
                  quill.formatLine(range.index, 1, 'header', value);
                } else {
                  quill.formatLine(range.index, 1, 'header', false);
                }
                // 确保格式已应用，并触发更新
                quill.setSelection(range.index + range.length);
              } else {
                // 如果只选中了部分文本，将选中文本提取为独立的标题行
                const headerText = selectedText.trim();

                // 获取当前行的完整文本和格式
                const lineText = quill.getText(lineStart, lineLength);
                const beforeText = lineText.substring(0, range.index - lineStart);
                const afterText = lineText.substring(range.index + range.length - lineStart);
                const lineFormats = quill.getFormat(lineStart, lineLength);

                // 删除整行内容
                quill.deleteText(lineStart, lineLength);

                let insertPos = lineStart;

                // 插入前面的文本（如果有），保持原有格式，但移除 header 格式
                if (beforeText) {
                  const beforeFormats = { ...lineFormats };
                  delete beforeFormats.header; // 确保前面的文本不是标题
                  quill.insertText(insertPos, beforeText, beforeFormats, 'user');
                  insertPos += beforeText.length;
                  // 如果前面有文本，需要换行
                  if (beforeText.trim()) {
                    quill.insertText(insertPos, '\n', 'user');
                    insertPos += 1;
                  }
                }

                // 插入标题文本（先插入文本，再应用格式）
                quill.insertText(insertPos, headerText, 'user');

                // 在标题后插入换行，确保标题是独立的块
                quill.insertText(insertPos + headerText.length, '\n', 'user');

                // 应用 header 格式到刚插入的文本行（必须在插入换行后应用，才能正确创建标题块）
                quill.formatLine(insertPos, 1, 'header', value);

                insertPos += headerText.length + 1; // +1 是换行符

                // 插入后面的文本（如果有），保持原有格式，但移除 header 格式
                if (afterText) {
                  const afterFormats = { ...lineFormats };
                  delete afterFormats.header; // 确保后面的文本不是标题
                  quill.insertText(insertPos, afterText, afterFormats, 'user');
                }

                // 设置光标位置到标题文本末尾
                quill.setSelection(insertPos - (afterText ? afterText.length + 1 : 1));
              }

              // 触发内容更新，确保目录能够识别新标题
              // 通过更新 content ref 来触发 v-model 更新
              nextTick(() => {
                const newContent = quill.root.innerHTML;
                if (content.value !== newContent) {
                  content.value = newContent;
                }
              });
            }
          }
        }
      : false
  },
  placeholder: '请输入内容',
  readOnly: props.readOnly
});

const styles = computed(() => {
  const style: any = {};
  if (props.minHeight) {
    style.minHeight = `${props.minHeight}px`;
  }
  if (props.height) {
    style.height = `${props.height}px`;
  }
  return style;
});

const content = ref('');
watch(
  () => props.modelValue,
  (v: string) => {
    if (v !== content.value) {
      content.value = v || '<p></p>';
    }
  },
  { immediate: true }
);

// 图片上传成功返回图片地址
const handleUploadSuccess = (res: any) => {
  // 如果上传成功
  if (res.code === 200) {
    // 获取富文本实例
    const quill = toRaw(quillEditorRef.value).getQuill();
    // 获取光标位置
    const length = quill.selection.savedRange.index;
    // 插入图片，res为服务器返回的图片链接地址
    quill.insertEmbed(length, 'image', res.data.url);
    // 调整光标到最后
    quill.setSelection(length + 1);
    proxy?.$modal.closeLoading();
  } else {
    proxy?.$modal.msgError('图片插入失败');
    proxy?.$modal.closeLoading();
  }
};

// 图片上传前拦截
const handleBeforeUpload = (file: any) => {
  const type = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg'];
  const isJPG = type.includes(file.type);
  //检验文件格式
  if (!isJPG) {
    proxy?.$modal.msgError(`图片格式错误!`);
    return false;
  }
  // 校检文件大小
  if (props.fileSize) {
    const isLt = file.size / 1024 / 1024 < props.fileSize;
    if (!isLt) {
      proxy?.$modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB!`);
      return false;
    }
  }
  proxy?.$modal.loading('正在上传文件，请稍候...');
  return true;
};

// 图片失败拦截
const handleUploadError = (err: any) => {
  proxy?.$modal.msgError('上传文件失败');
};
</script>

<style>
.editor-img-uploader {
  display: none;
}
.editor,
.ql-toolbar {
  width: 100%;
  white-space: pre-wrap !important;
  line-height: normal !important;
}
.quill-img {
  display: none;
}
.ql-snow .ql-tooltip[data-mode='link']::before {
  content: '请输入链接地址:';
}
.ql-snow .ql-tooltip.ql-editing a.ql-action::after {
  border-right: 0;
  content: '保存';
  padding-right: 0;
}
.ql-snow .ql-tooltip[data-mode='video']::before {
  content: '请输入视频地址:';
}
.ql-snow .ql-picker.ql-size .ql-picker-label::before,
.ql-snow .ql-picker.ql-size .ql-picker-item::before {
  content: '14px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='small']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='small']::before {
  content: '10px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='large']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='large']::before {
  content: '18px';
}
.ql-snow .ql-picker.ql-size .ql-picker-label[data-value='huge']::before,
.ql-snow .ql-picker.ql-size .ql-picker-item[data-value='huge']::before {
  content: '32px';
}
.ql-snow .ql-picker.ql-header .ql-picker-label::before,
.ql-snow .ql-picker.ql-header .ql-picker-item::before {
  content: '文本';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='1']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='1']::before {
  content: '标题1';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='2']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='2']::before {
  content: '标题2';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='3']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='3']::before {
  content: '标题3';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='4']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='4']::before {
  content: '标题4';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='5']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='5']::before {
  content: '标题5';
}
.ql-snow .ql-picker.ql-header .ql-picker-label[data-value='6']::before,
.ql-snow .ql-picker.ql-header .ql-picker-item[data-value='6']::before {
  content: '标题6';
}
.ql-snow .ql-picker.ql-font .ql-picker-label::before,
.ql-snow .ql-picker.ql-font .ql-picker-item::before {
  content: '标准字体';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='serif']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='serif']::before {
  content: '衬线字体';
}
.ql-snow .ql-picker.ql-font .ql-picker-label[data-value='monospace']::before,
.ql-snow .ql-picker.ql-font .ql-picker-item[data-value='monospace']::before {
  content: '等宽字体';
}
</style>
