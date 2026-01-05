<template>
  <div class="editor-container flex">
    <div class="editor-wrapper">
      <div ref="toolbarRef" style="border: 1px solid rgb(220, 223, 230);"></div>
      <div ref="editorRef" :style="styles"></div>
    </div>

    <!-- 文章目录 -->
    <div class="toc-sidebar" v-if="showCatalogue">
      <div class="toc-header">文章目录</div>
      <div class="toc-content">
        <div v-if="tocList.length > 0" class="toc-list">
          <div v-for="item in tocList" :key="item.id" :class="['toc-item', `toc-level-${item.level}`]" @click="scrollTo(item.id)">
            <span class="toc-text">{{ item.text }}</span>
          </div>
        </div>
        <div v-else class="toc-empty">
          <el-icon class="empty-icon"><Document /></el-icon>
          <p class="empty-text">暂无目录</p>
          <p class="empty-tip">使用标题格式编辑内容后将自动生成目录</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch, computed } from 'vue';
import { createEditor, createToolbar } from '@wangeditor/editor';
import type { IDomEditor } from '@wangeditor/editor';
import { ElMessage } from 'element-plus';
import { propTypes } from '@/utils/propTypes';
import { globalHeaders } from '@/utils/request';

interface TocItem {
  id: string; // w-e-element-xxx
  text: string;
  level: number;
}

/* emits */
const emit = defineEmits(['update:modelValue']);

/* props */
const props = defineProps({
  modelValue: propTypes.string,
  height: propTypes.number.def(400),
  minHeight: propTypes.number.def(400),
  readOnly: propTypes.bool.def(false),
  fileSize: propTypes.number.def(5),
  showToolbar: propTypes.bool.def(true),
  showCatalogue: propTypes.bool.def(false)
});

/* refs */
const editorRef = ref<HTMLDivElement | null>(null);
const toolbarRef = ref<HTMLDivElement | null>(null);
let editor: IDomEditor | null = null;

const tocList = ref<any[]>([]);
let isUpdatingHtml = false;

/* style */
const styles = computed(() => ({
  height: `${props.height}px`,
  minHeight: `${props.minHeight}px`,
  border: '1px solid #dcdfe6'
}));

/* mount */
onMounted(() => {
  if (!editorRef.value) return;

  editor = createEditor({
    selector: editorRef.value,
    html: props.modelValue || '',
    config: {
      readOnly: props.readOnly,
      placeholder: '请输入内容',
      MENU_CONF: {
        uploadImage: {
          fieldName: 'file',
          maxFileSize: props.fileSize * 1024 * 1024,
          allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml'],
          headers: globalHeaders(),
          server: import.meta.env.VITE_APP_BASE_API + '/resource/oss/upload',
          customInsert(res: any, insertFn: (url: string) => void) {
            if (res?.code !== 200) {
              ElMessage.error('图片上传失败');
              return;
            }
            // ✅ 插入图片（原生支持选中 & 缩放）
            insertFn(res.data.url);
          }
        }
      },
      onChange(editor) {
        const html = editor.getHtml();
        tocList.value = props.showCatalogue ? buildTocFromEditor() : [];
        emit('update:modelValue', html);
      }
    }
  });

  if (props.showToolbar && toolbarRef.value) {
    createToolbar({
      editor,
      selector: toolbarRef.value
    });
  }
});

/* watch v-model */
watch(
  () => props.modelValue,
  (v) => {
    if (!editor || isUpdatingHtml) return;
    if (v !== editor.getHtml()) {
      editor.setHtml(v || '');
    }
  }
);

const buildTocFromEditor = () => {
  const root = editorRef.value;
  if (!root) return [];

  const headings = root.querySelectorAll<HTMLElement>('h1,h2,h3,h4,h5,h6');

  const toc: TocItem[] = [];

  headings.forEach((el) => {
    const id = el.id;
    if (!id) return;

    const level = Number(el.tagName.replace('H', ''));
    const text = el.innerText.trim();

    if (!text) return;

    toc.push({
      id,
      text,
      level
    });
  });

  return toc;
};

const scrollTo = (id: string) => {
  const root = editorRef.value;
  if (!root) return;

  const target = root.querySelector<HTMLElement>(`#${id}`);
  if (!target) return;

  target.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });

  // 2️⃣ 闪烁高亮
  flashHighlight(target);
};

const flashHighlight = (el: HTMLElement) => {
  el.classList.remove('toc-flash'); // 防止连续点击不生效
  void el.offsetWidth; // 强制 reflow，重置动画
  el.classList.add('toc-flash');

  // 动画结束后自动移除（双保险）
  setTimeout(() => {
    el.classList.remove('toc-flash');
  }, 1000);
};

/* destroy */
onBeforeUnmount(() => {
  editor?.destroy();
  editor = null;
});
</script>

<style scoped lang="scss">
.editor-wrapper {
  width: 100%;
}

// 文章目录侧边栏 - 右侧
.toc-sidebar {
  width: 260px;
  min-width: 260px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .toc-header {
    padding: 16px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    background: #ebebeb;
    border-bottom: 1px solid #dcdfe6;
    text-align: center;
  }

  .toc-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 3px;

      &:hover {
        background-color: #909399;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #e4e7ed;
    }
  }

  .toc-list {
    max-height: none;
  }

  .toc-item {
    padding: 8px 10px;
    margin-bottom: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #606266;
    font-size: 13px;
    line-height: 1.5;
    position: relative;

    &:hover {
      background-color: #e4e7ed;
      color: #409eff;
    }

    &:active {
      background-color: #d9dcdf;
    }

    .toc-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // 不同层级的缩进
    &.toc-level-1 {
      font-weight: 600;
      font-size: 13px;
      color: #303133;
      padding-left: 10px;
    }

    &.toc-level-2 {
      padding-left: 20px;
      font-size: 12px;
    }

    &.toc-level-3 {
      padding-left: 30px;
      font-size: 12px;
      color: #909399;
    }

    &.toc-level-4,
    &.toc-level-5,
    &.toc-level-6 {
      padding-left: 40px;
      font-size: 12px;
      color: #a8abb2;
    }
  }

  .toc-empty {
    text-align: center;
    padding: 60px 20px;
    color: #909399;

    .empty-icon {
      font-size: 36px;
      color: #c0c4cc;
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 13px;
      color: #909399;
      margin: 8px 0 4px;
    }

    .empty-tip {
      font-size: 11px;
      color: #c0c4cc;
      line-height: 1.6;
      margin: 0;
      padding: 0 10px;
    }
  }
}


</style>


<style lang="scss">
  /* 建议放到全局样式 */
.toc-flash {
  animation: tocFlashBg 1s ease-out;
}

@keyframes tocFlashBg {
  0% {
    background-color: rgba(64, 158, 255, 0.35); // element-plus 主色
  }
  100% {
    background-color: transparent;
  }
}
</style>