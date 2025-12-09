<!--
  标题: enterprise/index.vue
  功能: 知识库编辑
  说明: 用于知识库编辑
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="kb-edit">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="form-wrap">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="文章标题" prop="articleTitle">
            <el-input v-model="form.articleTitle" maxlength="30" show-word-limit placeholder="请输入标题，最多30个字" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>
        <el-col :span="12">
          <el-form-item label="文章类别" prop="articleType">
            <el-select v-model="form.articleType" placeholder="请选择" clearable filterable style="width: 100%">
              <el-option v-for="d in article_type" :key="d.value" :label="d.label" :value="String(d.value)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>
        <el-col :span="12">
          <el-form-item label="文章摘要" prop="articleSummary">
            <el-input v-model="form.articleSummary" type="textarea" :rows="5" placeholder="请输入文章摘要" maxlength="200" show-word-limit />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="正文编辑" prop="articleContent">
            <div style="display: flex">
              <!-- 编辑器区 -->
              <div style="flex: 1">
                <Editor v-model="form.articleContent" :height="500" :minHeight="500" />
              </div>
              <!-- 文章目录 -->
              <div class="toc-sidebar">
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
          </el-form-item>
        </el-col>
      </el-row>

      <div class="title-text">附件上传</div>
      <el-upload action="#" :auto-upload="false" :accept="acceptTypes" :show-file-list="false" :on-change="handleChange">
        <div class="upload-btn">
          <el-button v-throttle plain style="color: #108c58; border-color: #108c58">
            <img src="@/assets/images/register5.svg" class="el-icon-view" />添加附件
          </el-button>
        </div>
      </el-upload>

      <!-- 隐藏的重新上传文件选择器 -->
      <input ref="reuploadInputRef" type="file" style="display: none" :accept="acceptTypes" @change="handleReuploadChange" />

      <div class="h20"></div>

      <el-table :data="fileListtable" stripe>
        <el-table-column type="index" label="序号" width="55" />
        <el-table-column prop="fileName" label="附件名" />
        <el-table-column label="操作" width="250">
          <template #default="scope">
            <el-button type="primary" v-throttle link @click="reuploadFile(scope.row)"> 重新上传 </el-button>
            <el-button type="primary" v-throttle link @click="removeFile(scope.row)"> 删除 </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="h20"></div>

      <el-col :span="12">
        <el-form-item label="上传主图" prop="articleCover" class="uploadcss">
          <el-upload
            action="#"
            :auto-upload="false"
            :accept="'.jpg,.jpeg,.png'"
            list-type="picture-card"
            :file-list="coverFileList"
            :on-change="handleCoverChange"
            :on-remove="handleCoverRemove"
            :on-preview="previewCover"
            :show-file-list="true"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
          <div>注：支持jpg、png两种格式，大小不超过10MB。</div>
        </el-form-item>
      </el-col>
      <el-col :span="12"></el-col>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="启用状态" prop="articleStatus">
            <el-select v-model="form.articleStatus" placeholder="请选择" clearable filterable style="width: 100%">
              <el-option v-for="d in article_status" :key="d.value" :label="d.label" :value="String(d.value)" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="flex-center-end">
        <el-button v-throttle @click="emitCancel">返回</el-button>
        <el-button v-throttle type="primary" @click="submit()">发布</el-button>
      </div>
    </el-form>
    <!-- 主图预览对话框 -->
    <el-dialog v-model="previewVisible" title="主图预览" width="600px" :append-to-body="true" :close-on-click-modal="true">
      <div class="preview-wrap">
        <el-image v-if="previewUrl" :src="previewUrl" fit="contain" style="width: 100%; height: 420px" :preview-src-list="[previewUrl]" />
        <div v-else class="preview-empty">暂无预览</div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, getCurrentInstance, type ComponentInternalInstance, computed } from 'vue';
import { addArticle, getArticle, updateArticle, ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { uploadByChunks } from '@/utils/chunkUpload';
import { Plus, ZoomIn, Delete, Document } from '@element-plus/icons-vue';
const props = defineProps<{ id?: string | number }>();
const emit = defineEmits(['success', 'cancel']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));

const article_status = computed(() => [
  { value: '2', label: '已启用' },
  { value: '3', label: '已禁用' }
]);
const form = ref<any>({
  articleTitle: '',
  articleType: '',
  articleContent: '',
  articleCover: '',
  articleStatus: '2'
});
const formRef = ref();
const fileListtable = ref<Array<any>>([]);
// 主图文件列表（最多1个）
const coverFileList = ref<Array<any>>([]);
// 预览对话框
const previewVisible = ref(false);
const previewUrl = ref<string>('');
const tocList = ref([]); // 目录列表
const rules = {
  articleTitle: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { validator: (_: any, v: string, cb: any) => (v && v.length <= 30 ? cb() : cb(new Error('标题最多30个字'))), trigger: 'blur' }
  ],
  articleType: [{ required: true, message: '请选择文章类别', trigger: 'change' }],
  articleSummary: [{ required: true, message: '请输入文章摘要,最多输入200个字', trigger: 'change' }],
  articleContent: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
  articleCover: [{ required: true, message: '请上传主图', trigger: 'change' }],
  articleStatus: [{ required: true, message: '请选择文章状态', trigger: 'change' }]
};

// 文件类型分类与锁
const imageExt = ['jpg', 'jpeg', 'png'];
const videoExt = ['mp4', 'mov', 'avi'];
const docExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
const allExt = [...imageExt, ...videoExt, ...docExt];
const lockedCategory = ref<'image' | 'video' | 'doc' | null>(null);

const getCategoryByExt = (ext: string) => {
  if (imageExt.includes(ext)) return 'image' as const;
  if (videoExt.includes(ext)) return 'video' as const;
  if (docExt.includes(ext)) return 'doc' as const;
  return null;
};

// 根据锁定类别动态限制选择器的 accept
const acceptTypes = computed(() => {
  if (lockedCategory.value === 'image') return '.jpg,.jpeg,.png';
  if (lockedCategory.value === 'video') return '.mp4,.mov,.avi';
  if (lockedCategory.value === 'doc') return '.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt';
  return '.jpg,.jpeg,.png,.mp4,.mov,.avi,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt';
});

const emitCancel = () => emit('cancel');

// 防止 watch 内部再次赋值造成递归
const internalUpdating = ref(false);
// 监听内容变化，自动生成目录（只在需要时回写）
watch(
  () => form.value.articleContent,
  (val) => {
    if (internalUpdating.value) return; // 跳过内部更新触发
    if (!val) {
      tocList.value = [];
      return;
    }
    const div = document.createElement('div');
    div.innerHTML = val;
    const headings = div.querySelectorAll('h1, h2, h3');
    const newToc: Array<any> = [];
    let changed = false;
    headings.forEach((el, idx) => {
      // 保留已有 id，若无则生成（减少不必要的整体 HTML 重写）
      if (!el.id) {
        el.id = `toc-${idx}`;
        changed = true;
      }
      newToc.push({
        text: (el.textContent || '').trim(),
        tag: el.tagName.toLowerCase(),
        id: el.id,
        level: Number(el.tagName.substring(1))
      });
    });
    tocList.value = newToc;
    if (changed) {
      const newHtml = div.innerHTML;
      if (newHtml !== val) {
        internalUpdating.value = true;
        form.value.articleContent = newHtml;
        queueMicrotask(() => (internalUpdating.value = false));
      }
    }
  },
  { flush: 'post' }
);

function scrollTo(id: string) {
  const editor = document.querySelector('.ql-editor');
  if (editor) {
    const el = editor.querySelector(`#${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
const submit = async () => {
  await formRef.value?.validate();
  const payload = {
    ...form.value,
    ossVoList: fileListtable.value
  };
  const api = props.id ? updateArticle : addArticle;
  const res = await api(payload);
  if ((res?.code ?? 200) === 200) {
    ElMessage.success(props.id ? '保存成功' : '新增成功');
    emit('success');
  }
};

const validateFile = (file: File) => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!allExt.includes(ext)) {
    ElMessage.error(`${ext.toUpperCase() || '该'}文件格式不正确，上传失败`);
    return false;
  }
  const category = getCategoryByExt(ext);
  if (!category) {
    ElMessage.error('不支持的文件类型');
    return false;
  }
  // 锁定类别不匹配时拒绝
  if (lockedCategory.value && lockedCategory.value !== category) {
    ElMessage.error(
      lockedCategory.value === 'image'
        ? '当前已锁定为图片类型，只能继续上传图片'
        : lockedCategory.value === 'video'
          ? '当前已锁定为视频类型，只能继续上传视频'
          : '当前已锁定为文档类型，只能继续上传文档'
    );
    return false;
  }
  const MB = 1024 * 1024;
  const limit = category === 'image' ? 10 * MB : category === 'video' ? 500 * MB : 100 * MB;
  if (file.size > limit) {
    ElMessage.error(category === 'image' ? '图片最大10MB' : category === 'video' ? '视频最大500MB' : '文档最大100MB');
    return false;
  }
  return true;
};

// 通过文件对象执行上传，返回标准化的附件对象
const buildUploadPayload = async (file: File, progressPrefix: string) => {
  const res: any = await uploadByChunks(file, (percent: number) => {
    console.log(`${progressPrefix}分片上传进度:`, percent + '%');
  });

  if (!res || !res.ossId) throw new Error('分片上传失败');

  return {
    ossId: res.ossId,
    fileName: res.fileName || file.name,
    name: res.fileName || file.name,
    originalName: res.fileName || file.name,
    fileSuffix: file.type,
    url: res.url
  };
};

const handleChange = async (file: any) => {
  const raw: File | undefined = file?.raw;
  if (!raw) return;
  if (!validateFile(raw)) return;
  proxy?.$modal.loading('正在上传附件，请稍候...');
  try {
    const payload = await buildUploadPayload(raw, '上传');
    fileListtable.value.push({ uid: file.uid || Date.now().toString(), ...payload });
    // 首次成功上传后锁定类别
    if (!lockedCategory.value && fileListtable.value.length === 1) {
      const ext = (payload.fileName.split('.').pop() || '').toLowerCase();
      lockedCategory.value = getCategoryByExt(ext);
    }
  } catch (error) {
    console.error('上传失败:', error);
    // ElMessage.error('上传失败，请重试');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

// 主图上传：仅允许图片、大小不超过10MB、始终只有一张
const handleCoverChange = async (file: any) => {
  const raw: File | undefined = file?.raw;
  if (!raw) return;
  const ext = (raw.name.split('.').pop() || '').toLowerCase();
  if (!['jpg', 'jpeg', 'png'].includes(ext)) {
    ElMessage.error('主图仅支持JPG/PNG格式');
    return;
  }
  const MB = 1024 * 1024;
  if (raw.size > 10 * MB) {
    ElMessage.error('主图大小不能超过10MB');
    return;
  }
  proxy?.$modal.loading('正在上传主图，请稍候...');
  try {
    const payload = await buildUploadPayload(raw, '主图');
    form.value.articleCover = payload.url;
    coverFileList.value = [
      {
        uid: file.uid || Date.now().toString(),
        name: payload.fileName,
        url: payload.url,
        ossId: payload.ossId,
        status: 'success'
      }
    ];
  } catch (error) {
    console.error('主图上传失败:', error);
    // ElMessage.error('主图上传失败，请重试');
  } finally {
    proxy?.$modal.closeLoading();
  }
};

const handleCoverRemove = (file?: any) => {
  coverFileList.value = [];
  form.value.articleCover = '';
  // 移除后触发该字段校验
  formRef.value?.validateField?.('articleCover');
};

const previewCover = (file: any) => {
  const url = file?.url || form.value.articleCover;
  if (url) {
    previewUrl.value = url;
    previewVisible.value = true;
  }
};

// 重新上传功能：点击后弹出文件选择并替换该行内容
const reuploadIndex = ref<number | null>(null);
const reuploadInputRef = ref<HTMLInputElement | null>(null);
const reuploadFile = (row: any) => {
  reuploadIndex.value = fileListtable.value.indexOf(row);
  if (reuploadIndex.value === -1) {
    ElMessage.error('未找到要替换的附件');
    return;
  }
  reuploadInputRef.value?.click();
};

const handleReuploadChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  input.value = '';
  if (!validateFile(file)) return;
  if (reuploadIndex.value == null || reuploadIndex.value < 0) {
    ElMessage.error('未指定替换行');
    return;
  }
  proxy?.$modal.loading('正在重新上传，请稍候...');
  try {
    const payload = await buildUploadPayload(file, '重新上传');
    fileListtable.value.splice(reuploadIndex.value, 1, { uid: Date.now().toString(), ...payload });
    ElMessage.success('重新上传成功');
  } catch (err) {
    console.error('重新上传失败:', err);
    // ElMessage.error('重新上传失败，请重试');
  } finally {
    proxy?.$modal.closeLoading();
    reuploadIndex.value = null;
  }
};

// 删除：支持 uid / ossId / url 任一匹配
const removeFile = (file: any) => {
  const index = fileListtable.value.findIndex((f) => f.uid === file?.uid || f.ossId === file?.ossId || f.url === file?.url);
  if (index !== -1) fileListtable.value.splice(index, 1);
  if (fileListtable.value.length === 0) lockedCategory.value = null;
};

onMounted(async () => {
  if (props.id) {
    const res = await getArticle(props.id);
    if ((res?.code ?? 500) === 200) {
      form.value = {
        ...form.value,
        ...res.data
      };
      // 主图和规格数据不带入
      if (res.data.ossVoList && Array.isArray(res.data.ossVoList)) {
        fileListtable.value = res.data.commonRelevanceFilesVos.map((f: any) => ({
          fileName: f.remoteOssVos?.[0]?.originalName || '文章附件',
          url: f.remoteOssVos?.[0]?.url,
          ossId: f.remoteOssVos?.[0]?.ossId,
          path: f.remoteOssVos?.[0]?.url,
          name: f.remoteOssVos?.[0]?.originalName,
          originalName: f.remoteOssVos?.[0]?.originalName,
          fileSuffix: f.remoteOssVos?.[0]?.fileSuffix
        }));
        // 根据已有附件确定锁定类别
        const first = fileListtable.value[0];

        const ext = (String(first.fileName).split('.').pop() || '').toLowerCase();
        lockedCategory.value = getCategoryByExt(ext);
      }

      // 带入主图展示
      if (res.data.articleCover) {
        // 设置表单字段，满足必填校验与提交
        form.value.articleCover = res.data.articleCover;
        coverFileList.value = [
          {
            uid: Date.now().toString(),
            name: '主图',
            url: res.data.articleCover,
            status: 'success'
          }
        ];
      }
    } else {
      // ElMessage.error(res?.msg ?? '获取文章信息失败');
    }
  }
});
</script>

<style scoped lang="scss">
.kb-edit {
  padding: 20px;
  background: #fff;

  .form-wrap {
    margin-top: 16px;
  }

  .side-card {
    height: 100%;
  }
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20px;
}

.h20 {
  height: 20px;
}

.toc-container {
  cursor: pointer;
  width: 120px;
  height: 200px;
  background-color: #b42020;
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

.uploadcss {
  ::v-deep .el-form-item__content {
    white-space: nowrap;
    display: inline-block;
  }

  ::v-deep .el-upload-list--picture-card {
    display: block;
    height: 114px;
  }
  ::v-deep .el-upload-list--picture-card .el-upload-list__item {
    width: 106px;
    height: 106px;
  }
  ::v-deep .el-upload--picture-card {
    width: 106px;
    height: 106px;
    line-height: 106px;
    float: left;
    margin: 0 8px 8px 0;
  }
}
</style>
