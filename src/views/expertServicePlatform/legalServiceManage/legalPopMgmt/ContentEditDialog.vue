<!--
  标题: ContentEditDialog.vue
  功能: 普法内容新增/编辑弹窗
  说明: 用于新增和编辑普法内容
  当前版本: 1.0
-->
<template>
  <div class="content-edit-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="普法标题" prop="contentTitle" required>
            <el-input 
              v-model="formData.contentTitle" 
              placeholder="请输入标题内容" 
              maxlength="30"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布状态" prop="contentStatus" required>
            <el-select v-model="formData.contentStatus" placeholder="请选择" style="width: 100%" clearable>
              <el-option label="启用" value="3" />
              <el-option label="禁用" value="2" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="普法简介" prop="contentSummary" required>
            <el-input 
              v-model="formData.contentSummary" 
              type="textarea" 
              :rows="3" 
              placeholder="请输入简介"
              maxlength="60"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="普法类别" prop="contentType" required>
            <el-select v-model="formData.contentType" placeholder="请选择" style="width: 100%" clearable>
              <el-option 
                v-for="item in legal_popularize_type" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="正文编辑" prop="contentContent" required>
        <div class="editor-container">
          <div class="editor-wrapper">
            <Editor 
              v-model="formData.contentContent" 
              :height="500" 
              :minHeight="500" 
              :fileSize="10"
              :key="editorKey"
            />
          </div>
          
          <div class="toc-sidebar">
            <div class="toc-header">文章目录</div>
            <div class="toc-content">
              <div v-if="tocList.length > 0" class="toc-list">
                <div 
                  v-for="item in tocList" 
                  :key="item.id" 
                  :class="['toc-item', `toc-level-${item.level}`]"
                  @click="scrollToHeading(item.id)"
                >
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

      <div class="attachment-section">
        <div class="attachment-title">附件上传</div>
        <el-upload
          action="#"
          :auto-upload="false"
          accept=".jpg,.jpeg,.png,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt"
          :show-file-list="false"
          :on-change="handleFileChange"
        >
          <el-button v-throttle v-hasPermi="['system:oss:upload']" type="primary" plain>
            <el-icon class="el-icon--left"><Upload /></el-icon>
            添加附件
          </el-button>
          <template #tip>
            <div class="upload-tip">支持格式：图片(jpg/jpeg/png)、文档(pdf/doc/docx/ppt/pptx/xls/xlsx/txt)，单个文件最大100MB</div>
          </template>
        </el-upload>

        <el-table v-if="attachmentList.length > 0" :data="attachmentList" stripe class="attachment-table">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="fileName" label="附件名称" align="left" :show-overflow-tooltip="true" />
          <el-table-column prop="fileSize" label="文件大小" width="120" align="center" />
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button type="primary" link @click="handlePreviewFile(scope.row)">
                <el-icon><View /></el-icon>
                预览
              </el-button>
              <el-button type="danger" link @click="handleRemoveFile(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '发布' : '保存' }}
        </el-button>
        <el-button @click="emitCancel">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, watch, nextTick } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, View, Delete, Document } from '@element-plus/icons-vue';
import { 
  getContentDetail, 
  addContent,
  editContent
} from '@/api/expertServicePlatform/legalServiceManage/contentManage';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { legal_popularize_type } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_type')
);

const formRef = ref();
const saving = ref(false);
const loading = ref(false);
const editorKey = ref(0);

const formData = ref({
  id: undefined as number | undefined,
  contentTitle: '',
  contentType: '',
  contentStatus: '',
  contentSummary: '',
  contentContent: ''
});

const attachmentList = ref<Array<{
  ossId?: number;
  fileName: string;
  originalName: string;
  fileSuffix: string;
  url: string;
  fileSize?: string;
  uid?: string;
}>>([]);

const tocList = ref<Array<{
  id: string;
  text: string;
  tag: string;
  level: number;
}>>([]);

const rules = {
  contentTitle: [
    { required: true, message: '请输入普法标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  contentStatus: [
    { required: true, message: '请选择发布状态', trigger: 'change' }
  ],
  contentSummary: [
    { required: true, message: '请输入普法简介', trigger: 'blur' },
    { min: 5, max: 60, message: '简介长度在 5 到 60 个字符', trigger: 'blur' }
  ],
  contentType: [
    { required: true, message: '请选择普法类别', trigger: 'change' }
  ],
  contentContent: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ]
};

const fetchContentDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    const response: any = await getContentDetail(props.id as number);
    
    if (response && response.code === 200) {
      const data = response.data;
      
      if (!data) {
        ElMessage.error('获取内容详情失败：数据为空');
        return;
      }
      
      let contentContent = data.contentContent || '';
      if (!contentContent || (typeof contentContent === 'string' && contentContent.trim() === '')) {
        contentContent = '';
      }
      
      formData.value = {
        id: data.id,
        contentTitle: data.contentTitle || '',
        contentType: data.contentType || '',
        contentStatus: data.contentStatus || '',
        contentSummary: data.contentSummary || '',
        contentContent: contentContent
      };
      
      editorKey.value += 1;
      await nextTick();
      await nextTick();
      
      if (data.ossVoList && Array.isArray(data.ossVoList) && data.ossVoList.length > 0) {
        attachmentList.value = data.ossVoList.map((item: any) => ({
          ossId: item.ossId,
          fileName: item.fileName || item.originalName,
          originalName: item.originalName || item.fileName,
          fileSuffix: item.fileSuffix,
          url: item.url,
          fileSize: item.fileSize || '--'
        }));
      } else {
        attachmentList.value = [];
      }
    } else {
      ElMessage.error(response?.msg || '获取内容详情失败');
    }
  } catch (error) {
    ElMessage.error('获取内容详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    const contentContent = formData.value.contentContent || '';
    const textContent = contentContent.replace(/<[^>]*>/g, '').trim();
    if (!textContent || textContent === '') {
      ElMessage.warning('请输入正文内容');
      return;
    }
    
    const confirmMsg = props.type === 'add' 
      ? '确定要发布此普法内容吗？发布后用户将可以看到此内容。'
      : '确定要保存并发布此普法内容吗？';
    
    await ElMessageBox.confirm(confirmMsg, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    saving.value = true;
    
    const submitData = {
      ...(props.type === 'edit' ? { id: formData.value.id } : {}),
      contentTitle: formData.value.contentTitle,
      contentType: formData.value.contentType,
      contentStatus: formData.value.contentStatus,
      contentSummary: formData.value.contentSummary,
      contentContent: contentContent,
      ossVoList: attachmentList.value
    };
    
    const api = props.type === 'add' ? addContent : editContent;
    const response: any = await api(submitData);
    
    if (response && response.code === 200) {
      ElMessage.success(props.type === 'add' ? '普法内容发布成功' : '普法内容修改成功');
      emit('success');
    } else {
      ElMessage.error(response?.msg || '操作失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请稍后重试');
    }
  } finally {
    saving.value = false;
  }
};

const emitCancel = () => {
  emit('cancel');
};

const isUpdatingFromWatch = ref(false);

watch(
  () => formData.value.contentContent,
  (val) => {
    if (isUpdatingFromWatch.value) {
      return;
    }
    
    if (!val || val.trim() === '' || val.trim() === '<p></p>') {
      tocList.value = [];
      return;
    }
    
    try {
      const div = document.createElement('div');
      div.innerHTML = val;
      const headings = div.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hasIdHeadings = Array.from(headings).filter((el) => (el as HTMLElement).id);
      const needsUpdate = headings.length > 0 && hasIdHeadings.length !== headings.length;
      
      tocList.value = Array.from(headings).map((el, idx) => {
        const tagName = el.tagName.toUpperCase();
        const level = parseInt(tagName.substring(1));
        const headingEl = el as HTMLElement;
        
        if (!headingEl.id) {
          headingEl.id = `toc-${idx}`;
        }
        
        return {
          id: headingEl.id,
          text: el.textContent?.trim() || '无标题',
          tag: tagName,
          level: level
        };
      });
      
      if (needsUpdate) {
        isUpdatingFromWatch.value = true;
        nextTick(() => {
          formData.value.contentContent = div.innerHTML;
          nextTick(() => {
            isUpdatingFromWatch.value = false;
          });
        });
      }
    } catch (error) {
      tocList.value = [];
    }
  },
  { immediate: true }
);

const scrollToHeading = (id: string) => {
  try {
    const editor = document.querySelector('.ql-editor');
    if (editor) {
      const el = editor.querySelector(`#${id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  } catch (error) {
    // ignore
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const validateFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'jpeg', 'png'];
  const docExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  const allExt = [...imageExt, ...docExt];

  if (!allExt.includes(ext)) {
    ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
    return false;
  }

  const MB = 1024 * 1024;
  const limit = imageExt.includes(ext) ? 10 * MB : 100 * MB;
  if (file.size > limit) {
    ElMessage.error(imageExt.includes(ext) ? '图片文件最大10MB' : '文档文件最大100MB');
    return false;
  }
  
  return true;
};

const handleFileChange = async (file: any) => {
  if (!validateFile(file.raw)) return;
  
  (proxy as any)?.$modal?.loading('正在上传附件，请稍候...');
  
  try {
    const response = await ossUploadImage({ file: file.raw });
    
    if (response.code === 200 && response.data?.ossId) {
      attachmentList.value.push({
        ossId: response.data.ossId,
        fileName: response.data.fileName,
        originalName: file.raw.name,
        fileSuffix: file.raw.type,
        url: response.data.url,
        fileSize: formatFileSize(file.raw.size),
        uid: file.uid
      });
      ElMessage.success('附件上传成功');
    } else {
      ElMessage.error(response?.msg || '上传失败，请重试');
    }
  } catch (error) {
    ElMessage.error('上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
  }
};

const handlePreviewFile = async (file: any) => {
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.originalName || file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    ElMessage.success('文件下载成功');
  } catch (error) {
    ElMessage.error('文件下载失败，请重试');
  }
};

const handleRemoveFile = (file: any) => {
  ElMessageBox.confirm('确定要删除该附件吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = attachmentList.value.findIndex(
        (item) => item.uid === file.uid || item.ossId === file.ossId
      );
      if (index !== -1) {
        attachmentList.value.splice(index, 1);
        ElMessage.success('附件删除成功');
      }
    })
    .catch(() => {});
};

watch(
  () => props.id,
  (newId) => {
    if (props.type === 'edit' && newId) {
      fetchContentDetail();
    } else if (props.type === 'add') {
      formData.value = {
        id: undefined,
        contentTitle: '',
        contentType: '',
        contentStatus: '',
        contentSummary: '',
        contentContent: ''
      };
      attachmentList.value = [];
      tocList.value = [];
      editorKey.value += 1;
    }
  },
  { immediate: true }
);

onMounted(() => {
  if (props.type === 'edit' && props.id) {
    fetchContentDetail();
  }
});
</script>

<style scoped lang="scss">
.content-edit-dialog {
  padding: 20px 0;
}

.editor-container {
  display: flex;
  gap: 0;
  width: 100%;
  min-height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

.editor-wrapper {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-right: 1px solid #dcdfe6;
  
  :deep(.ql-toolbar) {
    border: none !important;
    border-bottom: 1px solid #dcdfe6 !important;
    border-radius: 0;
    background-color: #fafafa;
  }
  
  :deep(.ql-container) {
    border: none !important;
    border-radius: 0;
  }
  
  :deep(.ql-editor) {
    min-height: 450px;
  }
}

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

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  gap: 12px;
  
  .el-button {
    min-width: 100px;
  }
}

.attachment-section {
  margin: 32px 0;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  
  .attachment-title {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16px;
    position: relative;
    padding-left: 12px;
    
    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background-color: #409eff;
      border-radius: 2px;
    }
  }
  
  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.6;
  }
  
  .attachment-table {
    margin-top: 20px;
    
    :deep(.el-button) {
      padding: 4px 8px;
      
      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }
  
  .toc-sidebar {
    width: 100%;
    min-width: 100%;
    max-height: 300px;
    
    .toc-list {
      max-height: 200px;
    }
  }
  
  .form-actions {
    .el-button {
      width: 100%;
    }
  }
  
  .attachment-section {
    .attachment-table {
      :deep(.el-table__body-wrapper) {
        overflow-x: auto;
      }
    }
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .toc-sidebar {
    width: 200px;
    min-width: 200px;
    padding: 16px;
  }
  
  .editor-container {
    gap: 16px;
  }
}
</style>

