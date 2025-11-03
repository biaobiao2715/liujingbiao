<!--
  标题: ContentEditDialog.vue
  功能: 普法内容新增/编辑弹窗
  说明: 用于新增和编辑普法内容
  当前版本: 1.0
-->
<template>
  <div class="content-edit-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <!-- 基础信息区域 -->
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

      <!-- 正文编辑区域 -->
      <el-form-item label="正文编辑" prop="contentContent" required>
        <div class="editor-container">
          <!-- 富文本编辑器 -->
          <div class="editor-wrapper">
            <Editor v-model="formData.contentContent" :height="500" :minHeight="500" />
          </div>
          
          <!-- 文章目录 -->
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

      <!-- 附件上传区域 -->
      <div class="attachment-section">
        <div class="attachment-title">附件上传</div>
        <el-upload
          action="#"
          :auto-upload="false"
          accept=".jpg,.jpeg,.png,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt"
          :show-file-list="false"
          :on-change="handleFileChange"
        >
          <el-button type="primary" plain>
            <el-icon class="el-icon--left"><Upload /></el-icon>
            添加附件
          </el-button>
          <template #tip>
            <div class="upload-tip">支持格式：图片(jpg/jpeg/png)、文档(pdf/doc/docx/ppt/pptx/xls/xlsx/txt)，单个文件最大100MB</div>
          </template>
        </el-upload>

        <!-- 附件列表 -->
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

      <!-- 表单操作按钮 -->
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
import { ref, onMounted, getCurrentInstance, toRefs, watch } from 'vue';
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

// 使用字典数据
const { legal_popularize_type } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_type')
);

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 加载状态
const loading = ref(false);

// 表单数据
const formData = ref({
  id: undefined as number | undefined,
  contentTitle: '',
  contentType: '',
  contentStatus: '',
  contentSummary: '',
  contentContent: ''
});

// 附件列表
const attachmentList = ref<Array<{
  ossId?: number;
  fileName: string;
  originalName: string;
  fileSuffix: string;
  url: string;
  fileSize?: string;
  uid?: string;
}>>([]);

// 文章目录列表
const tocList = ref<Array<{
  id: string;
  text: string;
  tag: string;
  level: number;
}>>([]);

// 表单验证规则
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

/** 获取内容详情 */
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
      
      // 将接口返回的数据赋值给表单
      formData.value = {
        id: data.id,
        contentTitle: data.contentTitle || '',
        contentType: data.contentType || '',
        contentStatus: data.contentStatus || '',
        contentSummary: data.contentSummary || '',
        contentContent: data.contentContent || ''
      };
      
      // 加载附件数据
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
    console.error('获取内容详情失败:', error);
    ElMessage.error('获取内容详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 提交表单 */
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    const confirmMsg = props.type === 'add' 
      ? '确定要发布此普法内容吗？发布后用户将可以看到此内容。'
      : '确定要保存并发布此普法内容吗？';
    
    await ElMessageBox.confirm(confirmMsg, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    saving.value = true;
    
    // 构建提交数据
    const submitData = {
      ...(props.type === 'edit' ? { id: formData.value.id } : {}),
      contentTitle: formData.value.contentTitle,
      contentType: formData.value.contentType,
      contentStatus: formData.value.contentStatus,
      contentSummary: formData.value.contentSummary,
      contentContent: formData.value.contentContent,
      ossVoList: attachmentList.value
    };
    
    // 调用对应的接口
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
      console.error('操作失败:', error);
      ElMessage.error('操作失败，请稍后重试');
    }
  } finally {
    saving.value = false;
  }
};

/** 取消 */
const emitCancel = () => {
  emit('cancel');
};

/** 监听内容变化，自动生成文章目录 */
watch(
  () => formData.value.contentContent,
  (newContent) => {
    if (!newContent) {
      tocList.value = [];
      return;
    }
    
    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;
      const headings = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      
      tocList.value = Array.from(headings).map((el, idx) => {
        const tagName = el.tagName.toUpperCase();
        const level = parseInt(tagName.substring(1)); // H1 -> 1, H2 -> 2, etc.
        
        return {
          id: `toc-heading-${idx}`,
          text: el.textContent?.trim() || '无标题',
          tag: tagName,
          level: level
        };
      });
    } catch (error) {
      console.error('生成目录失败:', error);
      tocList.value = [];
    }
  },
  { immediate: true }
);

/** 滚动到指定标题位置 */
const scrollToHeading = (id: string) => {
  // 在实际的富文本编辑器内容中查找对应的标题元素
  // 由于编辑器可能在 iframe 或 shadow DOM 中，这里提供一个通用的实现
  try {
    const editorElement = document.querySelector('.editor-wrapper');
    if (editorElement) {
      const targetElement = editorElement.querySelector(`#${id}`);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        ElMessage.info('正在编辑中，目录跳转功能将在保存后生效');
      }
    }
  } catch (error) {
    console.error('滚动失败:', error);
  }
};

/** 文件大小格式化 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/** 文件验证 */
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

/** 处理文件上传 */
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
    console.error('附件上传失败:', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
  }
};

/** 预览/下载文件 */
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
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败，请重试');
  }
};

/** 删除文件 */
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
    .catch(() => {
      // 用户取消删除
    });
};

// 页面加载时的处理
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

// 编辑器容器 - 左右布局
.editor-container {
  display: flex;
  gap: 0;
  width: 100%;
  min-height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

// 编辑器包装器 - 左侧主编辑区
.editor-wrapper {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-right: 1px solid #dcdfe6;
  
  :deep(.w-e-text-container) {
    border: none !important;
    border-radius: 0;
  }
  
  :deep(.w-e-toolbar) {
    border: none !important;
    border-bottom: 1px solid #dcdfe6 !important;
    border-radius: 0;
    background-color: #fafafa;
  }
  
  :deep(.w-e-text-placeholder) {
    color: #c0c4cc;
    font-style: normal;
  }
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

// 表单操作按钮
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

// 附件上传区域
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

// 响应式设计
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

// 中等屏幕优化
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

