<!--
    标题: legalDocumentAdd.vue
    功能: 新增法律文书模版
    说明: 新增法律文书模版弹窗
    当前版本: 1.0
    开发信息: Created by 邓和杰 2025-11-20
-->
<template>
  <el-dialog :model-value="formVisible" width="50%" :title="dialogTitle" align-center :close-on-click-modal="false" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="200px" class="legal-edit-form">
      <el-form-item label="法律文书名称模版" prop="legalDocumentName">
        <el-input v-model="formData.legalDocumentName" placeholder="请输入法律文书模版名称" maxlength="30" show-word-limit />
      </el-form-item>

      <el-form-item label="法律文书模版文件" prop="attachments">
        <el-upload
          class="upload-button"
          :file-list="[]"
          :auto-upload="false"
          :show-file-list="false"
          :before-upload="handleBeforeUpload"
          :on-change="handleFileUpload"
          accept=".pdf,.doc,.docx"
        >
          <el-button type="primary" :loading="uploadLoading">
            <el-icon class="el-icon--left"><UploadFilled /></el-icon>
            上传文件
          </el-button>
        </el-upload>
      </el-form-item>

      <el-table v-if="formData.attachments.length" :data="formData.attachments" size="small">
        <el-table-column type="index" label="序号" width="70" />
        <el-table-column prop="fileTypeText" label="附件类型" width="120" align="center" />
        <el-table-column prop="originalName" label="附件名称" min-width="200" />
        <el-table-column prop="fileSize" label="附件大小" width="120">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本号" width="120" />
        <el-table-column label="操作" width="100">
          <template #default="{ $index }">
            <el-button type="text" @click="handleRemoveAttachment($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- <el-form-item label="所属状态" prop="status">
        <el-select v-model="formData.status" placeholder="请选择">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item> -->
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
        <el-button :disabled="loading" @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import { ossUploadImage } from '@/api/supplier/productManagement/product';
import { uploadByChunks } from '@/utils/chunkUpload';
import { createLegalDocument } from '@/api/safeguard/legalDocument';

interface AttachmentItem {
  fileType: string;
  fileTypeText: string;
  originalName: string;
  fileSize: number;
  version?: string;
  ossId?: string;
  url?: string;
}

const props = defineProps<{
  modelValue: boolean;
  data?: {
    legalDocumentName?: string;
    // status?: string;
    attachments?: AttachmentItem[];
  };
  title?: string;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'submit', data: any): void;
}>();

const formRef = ref();
const uploadLoading = ref(false);

const formData = reactive({
  legalDocumentName: '',
  attachments: [] as AttachmentItem[]
  // status: ''
});
const statusOptions = [
  { value: '0', label: '启用' },
  { value: '1', label: '禁用' }
];

const formRules = {
  legalDocumentName: [{ required: true, message: '请输入法律文书模版名称', trigger: 'blur' }],
  attachments: [{ required: true, message: '请至少上传一个文件', trigger: 'change' }]
  // status: [{ required: true, message: '请选择所属状态', trigger: 'change' }]
};

const dialogTitle = computed(() => props.title || '新增法律文书模版');
const formVisible = computed(() => props.modelValue);
const loading = computed(() => props.loading || false);

const resetForm = () => {
  formData.legalDocumentName = '';
  formData.attachments = [];
  // formData.status = '';
  formRef.value?.resetFields?.();
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      formData.legalDocumentName = props.data?.legalDocumentName || '';
      // formData.status = props.data?.status || '';
      formData.attachments = props.data?.attachments?.map((item) => ({ ...(item as AttachmentItem) })) || [];
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const formatFileSize = (size: number) => {
  if (!size && size !== 0) return '--';
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(2)}KB`;
  return `${(kb / 1024).toFixed(2)}MB`;
};

const handleBeforeUpload = (file: File) => {
  const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ext = file.name.split('.').pop()?.toLowerCase();
  const extAllowed = ['pdf', 'doc', 'docx'].includes(ext || '');
  const sizeLimit = file.size / 1024 / 1024 < 100;
  if (!allowed.includes(file.type) && !extAllowed) {
    ElMessage.error('仅支持上传 pdf、word 文件');
    return false;
  }
  if (!sizeLimit) {
    ElMessage.error('文件大小不能超过100MB');
    return false;
  }
  return true;
};

const handleFileUpload = async (uploadFile: any) => {
  const rawFile = uploadFile?.raw;
  if (!rawFile || !handleBeforeUpload(rawFile)) return;
  uploadLoading.value = true;
  try {
    // const response = await ossUploadImage({ file: rawFile });
    // 使用分片上传
    const response: any = await uploadByChunks(rawFile, (p) => {
      console.log(`上传进度: ${p}%`);
    });
    console.log(response, rawFile, '切片成功了');
    const data = response?.data || {};
    const item: AttachmentItem = {
      fileType: 'document',
      fileTypeText: '文档',
      originalName: data.originalName || rawFile.name,
      fileSize: data.fileSize || rawFile.size,
      version: formData.attachments.length ? formData.attachments[formData.attachments.length - 1].version : '1.0',
      ossId: data.ossId,
      url: data.url
    };
    formData.attachments = [item];
    formRef.value?.validateField?.('attachments');
    ElMessage.success('文件上传成功');
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败，请稍后重试');
  } finally {
    uploadLoading.value = false;
  }
};

const handleRemoveAttachment = (index: number) => {
  formData.attachments.splice(index, 1);
};

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    emit('submit', {
      ...formData,
      attachments: formData.attachments,
      currentVersion: formData.attachments?.[0]?.version || '1.0'
    });
  });
};

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped lang="scss">
:deep(.el-button) {
  border-radius: 4px !important;
}

.legal-edit-form {
  .tip-text {
    margin: 4px 0 0;
    color: #f56c6c;
    font-size: 12px;
  }

  .upload-button {
    display: flex;
    align-items: center;
    gap: 12px;

    .upload-placeholder {
      color: #f56c6c;
      font-size: 12px;
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
}
</style>
