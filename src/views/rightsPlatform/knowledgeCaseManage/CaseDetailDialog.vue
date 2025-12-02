<!-- 
标题：    CaseDetailDialog.vue
功能：    知识库案件新增/编辑弹窗
说明：    配合知识库案件管理列表使用
当前版本：1.0
开发信息：Created by Cursor AI 2025-11-19
修改人信息：
修改内容：
-->
<template>
  <el-dialog
    :model-value="visible"
    :title="dialogTitle"
    width="50%"
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" v-loading="loading">
      <el-form-item label="案件名称" prop="knowledgeCaseName" required>
        <el-input 
          v-model="formData.knowledgeCaseName" 
          placeholder="请输入知识库案件名称" 
          :disabled="mode === 'view'"
          maxlength="30"
          show-word-limit
          clearable
        />
      </el-form-item>
      
      <el-form-item label="正文编辑" prop="knowledgeCaseContent" required>
        <div class="editor-container">
          <div class="editor-wrapper">
            <Editor 
              v-model="formData.knowledgeCaseContent" 
              :height="500" 
              :minHeight="500" 
              :fileSize="10"
              :key="editorKey"
            />
          </div>
          
          <TocSidebar
            :content="formData.knowledgeCaseContent"
            editor-container=".w-e-text-container"
            :auto-scroll="true"
            @toc-click="handleTocClick"
            @active-change="handleActiveChange"
            @content-update="handleContentUpdate"
            ref="tocSidebarRef"
          />
        </div>
      </el-form-item>

      <el-form-item label="附件上传" v-if="mode !== 'view'">
        <el-upload
          ref="uploadRef"
          action="#"
          :auto-upload="false"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          :show-file-list="false"
          :limit="1"
          :on-change="handleFileChange"
          :on-exceed="handleExceed"
        >
          <el-button type="primary" plain>
            <el-icon class="el-icon--left"><Upload /></el-icon>
            {{ attachmentList.length > 0 ? '重新上传' : '上传附件' }}
          </el-button>
          <template #tip>
            <div class="upload-tip">
              非必填，仅支持 PDF、Word(doc/docx)、Excel(xls/xlsx)，仅可上传一个，单个文件最大100MB
            </div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="附件列表" v-if="visibleAttachmentList.length > 0">
        <el-table :data="visibleAttachmentList" stripe border class="attachment-table">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="附件类型" width="120" align="center">
            <template #default="scope">
              <span>{{ getFileTypeText(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="originalName" label="法律文书模版" align="left" :show-overflow-tooltip="true" />
          <el-table-column prop="fileSize" label="附件大小" width="120" align="center" />
          <el-table-column label="操作" width="200" align="center" v-if="mode !== 'view'">
            <template #default="scope">
              <el-button type="primary" link @click="triggerReUpload">
                <el-icon><Upload /></el-icon>
                重新上传
              </el-button>
              <el-button type="danger" link @click="handleRemoveFile(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" align="center" v-else>
            <template #default="scope">
              <el-button type="primary" link @click="handleDownloadFile(scope.row)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleClose">返回</el-button>
      <el-button type="primary" v-if="mode !== 'view'" :loading="saving" @click="handleSubmit">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance, withDefaults, defineAsyncComponent, nextTick } from 'vue';
import type { FormInstance, FormRules, UploadInstance } from 'element-plus';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Download, Delete } from '@element-plus/icons-vue';
import { addKnowledgeCase, updateKnowledgeCase, fetchKnowledgeCaseDetail, fetchKnowledgeCaseList } from '@/api/rightsPlatform/knowledgeCaseManage/index';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { uploadByChunks } from '@/utils/chunkUpload';
import { downloadFileByUrl } from '@/utils/downloadFileByUrl';
import TocSidebar from '@/components/Tocsidebar/index.vue';

const Editor = defineAsyncComponent(() => import('@/components/Editor/index.vue'));

const props = withDefaults(
  defineProps<{
    visible: boolean;
    mode: 'view' | 'edit' | 'add';
    detail?: Record<string, any>;
  }>(),
  {
    visible: false,
    mode: 'add'
  }
);

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const formRef = ref<FormInstance>();
const loading = ref(false);
const saving = ref(false);
const editorKey = ref(0);
const tocSidebarRef = ref();
const uploadRef = ref<UploadInstance>();

const formData = ref({
  id: undefined as number | undefined,
  knowledgeCaseName: '',
  knowledgeCaseContent: ''
});

const attachmentList = ref<Array<{
  ossId?: number;
  fileName?: string;
  originalName: string;
  fileSuffix?: string;
  url: string;
  fileSize?: string;
  fileType?: string;
  foreignType?: string;
}>>([]);

// 仅当附件类型有值时才显示在列表中；如果后端未返回附件类型，则不展示附件部分
const visibleAttachmentList = computed(() =>
  attachmentList.value.filter((item) => {
    const type = item.fileType != null ? String(item.fileType).trim() : '';
    const ossId = item.ossId != null ? String(item.ossId).trim() : '';
    const originalName = (item.originalName ?? '').trim();
    const fileName = (item.fileName ?? '').trim();
    const nameProvided = originalName !== '' || fileName !== '';
    return type !== '' && ossId !== '' && nameProvided;
  })
);

const rules: FormRules = {
  knowledgeCaseName: [
    { required: true, message: '请输入知识库案件名称', trigger: 'blur' },
    { min: 1, max: 30, message: '名称长度在 1 到 30 个字符', trigger: 'blur' }
  ],
  knowledgeCaseContent: [
    { required: true, message: '请输入正文内容', trigger: 'blur' },
    { 
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.trim() === '' || value.replace(/<[^>]*>/g, '').trim() === '') {
          callback(new Error('请输入正文内容'));
        } else {
          callback();
        }
      }, 
      trigger: 'blur' 
    }
  ]
};

const dialogTitle = computed(() => {
  if (props.mode === 'add') return '新增案件分析';
  if (props.mode === 'edit') return '编辑案件';
  return '查看案件';
});

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// 获取文件类型文本
const getFileTypeText = (file: any): string => {
  const fileType = file.fileType;
  if (fileType === '0') return '图片';
  if (fileType === '1') return '视频';
  if (fileType === '2') return '文档';
  if (fileType === '99') return '其他';
  return '未知';
};

// 判断文件类型
const getFileType = (fileName: string, fileType?: string): string => {
  if (fileType) return fileType;
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'jpeg', 'png'];
  const videoExt = ['mp4', 'mov', 'avi'];
  const docExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  
  if (imageExt.includes(ext)) return '0';
  if (videoExt.includes(ext)) return '1';
  if (docExt.includes(ext)) return '2';
  return '99';
};

const normalizeAttachment = (item: any) => ({
  ossId: item.ossId,
  fileName: item.fileName || item.originalName,
  originalName: item.originalName || item.fileName || '附件',
  fileSuffix: item.fileSuffix || '',
  url: item.url || '',
  fileSize: item.fileSize || '--',
  fileType: item.fileType || getFileType(item.originalName || item.fileName || '', item.fileType),
  foreignType: item.foreignType || '1'
});

const checkCaseNameDuplicate = async (): Promise<boolean> => {
  const name = formData.value.knowledgeCaseName?.trim();
  if (!name) return false;
  try {
    const response: any = await fetchKnowledgeCaseList({
      knowledgeCaseName: name,
      pageNum: 1,
      pageSize: 1
    });
    const list = response?.rows || response?.data?.records || response?.data || [];
    if (!Array.isArray(list) || list.length === 0) return false;
    const existItem = list.find((item: any) => item?.knowledgeCaseName === name);
    if (!existItem) return false;
    if (props.mode === 'edit') {
      const currentId = formData.value.id || props.detail?.id;
      if (currentId && String(existItem.id) === String(currentId)) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('案件名称去重校验失败:', error);
    ElMessage.error('案件名称校验失败，请稍后重试');
    return true;
  }
};

// 验证文件
const validateFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const allowedExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];

  if (!allowedExt.includes(ext)) {
    ElMessage.error('仅支持 PDF、Word、Excel 文件');
    return false;
  }

  const MB = 1024 * 1024;
  const limit = 100 * MB;
  if (file.size > limit) {
    ElMessage.error('文件最大100MB');
    return false;
  }

  return true;
};

// 处理文件上传
const handleExceed = () => {
  ElMessage.warning('仅支持上传一个附件，如需更换请重新上传');
};

const handleFileChange = async (file: any) => {
  if (!validateFile(file.raw)) return;

  const MB = 1024 * 1024;
  const LARGE_FILE_CHUNK_THRESHOLD = 100 * MB; // 文件大于100MB时使用分片上传
  const useChunkUpload = file.raw.size > LARGE_FILE_CHUNK_THRESHOLD;
  const modal = (proxy as any)?.$modal;
  modal?.loading?.(useChunkUpload ? '正在分片上传，请稍候...' : '正在上传附件，请稍候...');

  try {
    let response: any;
    
    if (useChunkUpload) {
      const chunkRes = await uploadByChunks(file.raw, (percent) => {
        modal?.setLoadingText?.(`正在分片上传...${percent}%`);
      });
      // 分片上传返回的数据结构可能是 { url, fileName, ossid } 或 { data: { url, fileName, ossId } }
      // 统一处理，兼容不同的返回格式
      let chunkData = chunkRes;
      if (chunkRes && !chunkRes.ossId && !chunkRes.ossid && chunkRes.data) {
        chunkData = chunkRes.data;
      }
      // 兼容 ossId 和 ossid 两种字段名
      const ossId = chunkData?.ossId || chunkData?.ossid || chunkData?.data?.ossId || chunkData?.data?.ossid;
      response = {
        code: 200,
        data: {
          ossId: ossId,
          fileName: chunkData?.fileName || chunkData?.data?.fileName || file.raw.name,
          url: chunkData?.url || chunkData?.data?.url || ''
        }
      };
    } else {
      response = await ossUploadImage({ file: file.raw });
    }

    if (response.code === 200 && response.data?.ossId) {
      const fileType = getFileType(file.raw.name);
      const newAttachment = {
        ossId: response.data.ossId,
        fileName: response.data.fileName,
        originalName: file.raw.name,
        fileSuffix: file.raw.type,
        url: response.data.url,
        fileSize: formatFileSize(file.raw.size),
        fileType: fileType,
        foreignType: '1' // 根据接口文档，1表示法律文书模版等
      };
      if (attachmentList.value.length > 0) {
        attachmentList.value = [newAttachment];
        ElMessage.success('附件已重新上传并覆盖原文件');
      } else {
        attachmentList.value = [newAttachment];
        ElMessage.success('附件上传成功');
      }
    } else {
      ElMessage.error(response?.msg || '上传失败，请重试');
    }
  } catch (error) {
    console.error('附件上传失败:', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    modal?.closeLoading?.();
  }
};

// 下载文件
const handleDownloadFile = (row: any) => {
  if (row.url) {
    downloadFileByUrl(row.url, row.originalName || row.fileName || '附件');
  } else {
    ElMessage.warning('文件地址不存在');
  }
};

// 删除文件
const handleRemoveFile = (row: any) => {
  const idx = attachmentList.value.findIndex((item) => 
    (item.ossId && row.ossId && String(item.ossId) === String(row.ossId)) ||
    (item.url === row.url)
  );
  if (idx > -1) {
    attachmentList.value = [];
    uploadRef.value?.clearFiles();
    ElMessage.success('删除成功');
  }
};

const triggerReUpload = () => {
  if (props.mode === 'view') return;
  (uploadRef.value as any)?.$el?.querySelector('input')?.click();
};

// 获取详情
const fetchDetail = async () => {
  if (props.mode === 'add' || !props.detail?.id) {
    formData.value = {
      id: undefined,
      knowledgeCaseName: '',
      knowledgeCaseContent: ''
    };
    attachmentList.value = [];
    return;
  }

  loading.value = true;
  try {
    const response: any = await fetchKnowledgeCaseDetail(props.detail.id);
    
    if (response && response.code === 200) {
      const data = response.data;
      formData.value = {
        id: data.id,
        knowledgeCaseName: data.knowledgeCaseName || '',
        knowledgeCaseContent: data.knowledgeCaseContent || ''
      };

      editorKey.value += 1;
      await nextTick();
      await nextTick();

      // 处理附件列表
      // 判断附件是否为空：如果关键字段都是空字符串，则不显示附件
      const isAttachmentEmpty = (file: any) => {
        if (!file || typeof file !== 'object') return true;
        const fileType = (file.fileType || '').trim();
        const originalName = (file.originalName || '').trim();
        // 如果 fileType 和 originalName 都是空字符串，则认为附件为空（即使 ossId 有值）
        return fileType === '' && originalName === '';
      };

      if (data.protectionFiles && Array.isArray(data.protectionFiles)) {
        const validFiles = data.protectionFiles.filter(file => !isAttachmentEmpty(file));
        attachmentList.value = validFiles.length > 0 ? [normalizeAttachment(validFiles[0])] : [];
      } else if (data.protectionFiles && typeof data.protectionFiles === 'object') {
        // 单个附件对象
        if (!isAttachmentEmpty(data.protectionFiles)) {
          attachmentList.value = [normalizeAttachment(data.protectionFiles)];
        } else {
          attachmentList.value = [];
        }
      } else {
        attachmentList.value = [];
      }
    } else {
      ElMessage.error(response?.msg || '获取详情失败');
    }
  } catch (error) {
    console.error('获取详情失败:', error);
    ElMessage.error('获取详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      fetchDetail();
    } else {
      formRef.value?.resetFields();
      formData.value = {
        id: undefined,
        knowledgeCaseName: '',
        knowledgeCaseContent: ''
      };
      attachmentList.value = [];
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};

// 目录相关回调
const handleTocClick = (_item: any) => {
  // 目录点击行为交由 TocSidebar 内部滚动处理
};

const handleActiveChange = (_id: string) => {
  // 激活项变化，按需扩展
};

const handleContentUpdate = (updatedContent: string) => {
  // 由目录组件在必要时回写处理后的内容（包含标题锚点等）
  formData.value.knowledgeCaseContent = updatedContent;
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;

    const contentContent = formData.value.knowledgeCaseContent || '';
    const textContent = contentContent.replace(/<[^>]*>/g, '').trim();
    if (!textContent || textContent === '') {
      ElMessage.warning('请输入正文内容');
      return;
    }

    const isDuplicate = await checkCaseNameDuplicate();
    if (isDuplicate) {
      ElMessage.warning('案件名称已存在，请修改');
      return;
    }

    saving.value = true;

    // 构建提交数据
    const submitData: any = {
      knowledgeCaseName: formData.value.knowledgeCaseName,
      knowledgeCaseContent: contentContent
    };

    // 如果有附件，添加 protectionFiles；如果在编辑时删除了附件，主动传空字段让后端清空
    if (attachmentList.value.length > 0) {
      // 根据接口文档，protectionFiles 可以是单个对象或数组
      // 这里保持单对象结构，和后端 Bo 类型保持一致
      const attachment = attachmentList.value[0];
      submitData.protectionFiles = {
        foreignType: attachment.foreignType || '1',
        fileType: attachment.fileType || '2',
        ossId: attachment.ossId != null ? String(attachment.ossId) : '',
        fileSize: attachment.fileSize || '',
        originalName: attachment.originalName || attachment.fileName || ''
      };
    } else {
      // 无附件（无论新增还是编辑场景），传递各字段为空字符串，避免 null，方便后端统一处理清空逻辑
      submitData.protectionFiles = {
        foreignType: '',
        fileType: '',
        ossId: '',
        fileSize: '',
        originalName: ''
      };
    }

    // 编辑时需要添加id
    if (props.mode === 'edit' && formData.value.id) {
      submitData.id = formData.value.id;
      const response: any = await updateKnowledgeCase(submitData);
      if (response && response.code === 200) {
        ElMessage.success('提交成功');
        emit('confirm');
        handleClose();
      } else {
        ElMessage.error(response?.msg || '编辑失败，请稍后重试');
      }
    } else {
      // 新增
      const response: any = await addKnowledgeCase(submitData);
      if (response && response.code === 200) {
        ElMessage.success('提交成功');
        emit('confirm');
        handleClose();
      } else {
        ElMessage.error(response?.msg || '新增失败，请稍后重试');
      }
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('操作失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped lang="scss">
.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  line-height: 1.6;
}

.attachment-table {
  margin-top: 20px;
  width: 100%;
  
  :deep(.el-button) {
    padding: 4px 8px;
    font-size: 14px;
    
    .el-icon {
      margin-right: 4px;
    }
  }
}

:deep(.el-dialog__footer) {
  .el-button {
    font-size: 14px;
  }
}

.attachment-info {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f9fafc;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.attachment-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.attachment-name {
  font-weight: 500;
  color: #303133;
}

.attachment-size {
  color: #909399;
}

.attachment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
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
  
  :deep(.w-e-text-container) {
    min-height: 500px;
  }
}

:deep(.toc-sidebar) {
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
    max-height: 500px;
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
    
    &.toc-active {
      background-color: #e6f4ff;
      color: #409eff;
      font-weight: 500;
      
      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background-color: #409eff;
        border-radius: 0 2px 2px 0;
      }
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

@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }
  
  :deep(.toc-sidebar) {
    width: 100%;
    min-width: 100%;
    max-height: 300px;
    
    .toc-list {
      max-height: 200px;
    }
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  :deep(.toc-sidebar) {
    width: 200px;
    min-width: 200px;
    padding: 16px;
  }
  
  .editor-container {
    gap: 16px;
  }
}
</style>
