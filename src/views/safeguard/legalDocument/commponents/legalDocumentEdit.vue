<!--
    标题: legalDocumentEdit.vue
    功能: 编辑/查看法律文书模版
    说明: 编辑/查看法律文书模版弹窗
    当前版本: 1.0
    开发信息: Created by 邓和杰 2025-11-20
-->
<template>
  <el-dialog
    :model-value="visible"
    width="900px"
    :title="isViewMode ? '查看法律文书详情' : '编辑法律文书模版'"
    align-center
    :close-on-click-modal="false"
    :show-close="false"
    @close="handleClose"
    class="legal-edit-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="170px"
      class="legal-edit-form"
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <el-form-item :label="isViewMode ? '文书名称' : '法律文书模版名称'" prop="legalDocumentName">
        <el-input v-model="formData.legalDocumentName" placeholder="请输入法律文书模版名称" maxlength="30" show-word-limit :disabled="isViewMode" />
        <p v-if="!formData.legalDocumentName && !isViewMode" class="tip-text">请输入法律文书模版名称，最多支持30个汉字</p>
      </el-form-item>

      <el-form-item label="法律文书模版编号">
        <el-input v-model="formData.legalDocumentCode" disabled />
      </el-form-item>

      <el-form-item label="法律文书模版文件" prop="legalFiles" v-if="!isViewMode">
        <el-upload
          ref="uploadRef"
          class="upload-wrapper"
          :file-list="[]"
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleUploadChange"
          accept=".pdf,.doc,.docx"
          :disabled="loading"
        >
          <el-button type="primary" :loading="uploadLoading">
            <el-icon class="el-icon--left"><UploadFilled /></el-icon>
            上传文件
          </el-button>
          <span class="upload-placeholder">请上传文件</span>
        </el-upload>
      </el-form-item>

      <div>
        <el-table v-if="formData.legalFiles.length" :data="formData.legalFiles" border class="file-table" size="small">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="fileTypeText" label="附件类型" width="120" align="center" />
          <el-table-column prop="originalName" label="附件名称" min-width="200" />
          <el-table-column prop="fileSize" label="附件大小" width="120" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="version" :label="isViewMode ? '版本号' : '最新版本号'" width="120" align="center" />
          <el-table-column v-if="!isViewMode" prop="uploadTime" label="最新上传时间" width="180" align="center" />
          <el-table-column v-if="!isViewMode" label="备注" min-width="180">
            <template #default>
              <el-input v-model="formData.legalFiles[0].remark" placeholder="请输入备注内容" maxlength="100" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row, $index }">
              <el-button v-if="isViewMode" link type="primary" @click="handleDownloadFile(row)">下载</el-button>
              <el-button v-else link type="danger" @click="handleRemoveFile($index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="history-section">
        <div class="history-header">
          <el-icon><Document /></el-icon>
          <span>历史版本</span>
        </div>
        <el-table :data="pagedHistoryList" border size="small">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="updateTime" label="修改时间" width="180" align="center" />
          <el-table-column prop="fileName" label="附件名称" min-width="200" />
          <el-table-column prop="fileSize" label="附件大小" width="120" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="version" label="历史版本" width="120" align="center" />
          <el-table-column prop="remark" label="备注" min-width="180" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDownload(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="history-pagination" v-if="historyList.length">
          <el-pagination
            background
            layout="sizes, prev, pager, next"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="historyPagination.pageSize"
            :current-page="historyPagination.page"
            :total="historyList.length"
            @current-change="handleHistoryPageChange"
            @size-change="handleHistorySizeChange"
          />
        </div>
      </div>

      <el-form-item label="所属状态" prop="status">
        <el-select v-if="!isViewMode" v-model="formData.status" placeholder="请选择">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span v-else>{{ statusText }}</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="!isViewMode" type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
        <el-button :disabled="loading" @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Document } from '@element-plus/icons-vue';
import { ossUploadImage } from '@/api/supplier/productManagement/product';

interface LegalFile {
  fileType?: string;
  fileTypeText?: string;
  originalName: string;
  fileSize: number;
  version?: string;
  uploadTime?: string;
  remark?: string;
  ossId?: string;
  url?: string;
}

interface HistoryFile {
  fileName: string;
  updateTime: string;
  fileSize: number;
  version: string;
  remark?: string;
  url?: string;
}

// 是否成功上传文件
const isUpload = ref(false);

const props = defineProps<{
  modelValue: boolean;
  data?: {
    legalDocumentName?: string;
    legalDocumentCode?: string;
    status?: string;
    legalFiles?: LegalFile[];
    historyList?: HistoryFile[];
    currentVersion?: string;
  };
  loading?: boolean;
  mode?: 'edit' | 'view';
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'submit', data: any): void;
}>();

const formRef = ref();
const uploadRef = ref();
const uploadLoading = ref(false);
const currentVersion = ref('1.0');

const formData = reactive({
  legalDocumentName: '',
  legalDocumentCode: '',
  status: '',
  remark: '',
  legalFiles: [] as LegalFile[]
});

const historyList = ref<HistoryFile[]>([]);
const historyPagination = reactive({
  page: 1,
  pageSize: 10
});
const visible = computed(() => props.modelValue);
const loading = computed(() => props.loading || false);
const isViewMode = computed(() => props.mode === 'view');
const pagedHistoryList = computed(() => {
  const start = (historyPagination.page - 1) * historyPagination.pageSize;
  return historyList.value.slice(start, start + historyPagination.pageSize);
});

const statusOptions = [
  { value: '0', label: '启用' },
  { value: '1', label: '禁用' }
];

const statusText = computed(() => {
  const option = statusOptions.find((item) => item.value === formData.status);
  return option?.label || '--';
});

const formRules = {
  legalDocumentName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  legalFiles: [{ required: true, message: '请上传文件', trigger: 'change' }],
  status: [{ required: true, message: '请选择所属状态', trigger: 'change' }]
};

const applyData = (val?: typeof props.data) => {
  formData.legalDocumentName = val?.legalDocumentName || '';
  formData.legalDocumentCode = val?.legalDocumentCode || '';
  formData.status = val?.status || '';
  formData.remark = val?.remark || '';
  formData.legalFiles = val?.legalFiles?.map((item) => ({ ...item })) || [];
  historyList.value = val?.historyList?.map((item) => ({ ...item })) || [];
  currentVersion.value = val?.currentVersion || val?.legalFiles?.[0]?.version || historyList.value[0]?.version || '1.0';
  isUpload.value = false;
  historyPagination.page = 1;
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      applyData(props.data);
    } else {
      resetForm();
    }
  }
);

watch(
  () => props.data,
  (val) => {
    if (props.modelValue) {
      applyData(val);
    }
  },
  { deep: true }
);

const resetForm = () => {
  formData.legalDocumentName = '';
  formData.legalDocumentCode = '';
  formData.status = '';
  formData.remark = '';
  formData.legalFiles = [];
  historyList.value = [];
  currentVersion.value = '1.0';
  isUpload.value = false;
  historyPagination.page = 1;
  uploadRef.value?.clearFiles?.();
  formRef.value?.resetFields?.();
};

const formatFileSize = (size: number) => {
  if (size === undefined || size === null) return '--';
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(2)}KB`;
  return `${(kb / 1024).toFixed(2)}MB`;
};

const padZero = (num: number) => num.toString().padStart(2, '0');

const formatDateTime = (value?: string | number | Date) => {
  if (value === undefined || value === null || value === '') return '--';
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else if (/^\d+$/.test(value)) {
    const numeric = Number(value);
    date = new Date(value.length === 10 ? numeric * 1000 : numeric);
  } else {
    date = new Date(value.replace(/-/g, '/'));
  }
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(
    date.getHours()
  )}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
};

const getNextVersion = (version?: string) => {
  const [majorStr = '1', minorStr = '0'] = (version || '1.0').split('.');
  let major = Number(majorStr);
  let minor = Number(minorStr);
  if (Number.isNaN(major)) major = 1;
  if (Number.isNaN(minor)) minor = 0;
  minor = Math.max(0, Math.floor(minor));
  if (minor >= 9) {
    major += 1;
    minor = 0;
  } else {
    minor += 1;
  }
  return `${major}.${minor}`;
};

const validateFile = (file: File) => {
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

const handleUploadChange = async (file: any) => {
  const raw = file?.raw;
  if (!raw || !validateFile(raw)) return;
  uploadLoading.value = true;
  try {
    const response = await ossUploadImage({ file: raw });
    const data = response?.data || {};
    let nextVersion = currentVersion.value;
    if (!isUpload.value) {
      nextVersion = getNextVersion(currentVersion.value);
      currentVersion.value = nextVersion;
      isUpload.value = true;
    } else {
      nextVersion = currentVersion.value;
    }
    const uploadTimestamp = data.uploadTime || data.createTime || Date.now();
    const uploadTimeText = formatDateTime(uploadTimestamp);
    const newFile: LegalFile = {
      fileType: 'document',
      fileTypeText: '文档',
      originalName: data.originalName || raw.name,
      fileSize: data.fileSize || raw.size,
      version: nextVersion,
      uploadTime: uploadTimeText,
      remark: '',
      ossId: data.ossId,
      url: data.url
    };
    formData.legalFiles = [newFile];
    formRef.value?.validateField?.('legalFiles');
    ElMessage.success('文件上传成功');
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败，请稍后再试');
  } finally {
    uploadLoading.value = false;
  }
};

const handleRemoveFile = (index: number) => {
  formData.legalFiles.splice(index, 1);
};

const handleDownload = async (file: HistoryFile) => {
  if (!file.url) {
    ElMessage.error('下载地址不存在');
    return;
  }
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.fileName || '文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

const handleDownloadFile = async (file: LegalFile) => {
  if (!file.url) {
    ElMessage.error('下载地址不存在');
    return;
  }
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.originalName || '文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

const handleHistoryPageChange = (page: number) => {
  historyPagination.page = page;
};

const handleHistorySizeChange = (size: number) => {
  historyPagination.pageSize = size;
  historyPagination.page = 1; // 改变每页条数时重置到第一页
};

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    const hasNewUpload = isUpload.value;
    emit('submit', {
      ...formData,
      legalFiles: hasNewUpload ? formData.legalFiles : [],
      historyList: historyList.value,
      currentVersion: currentVersion.value,
      remark: formData.legalFiles[0].remark
    });
  });
};

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped lang="scss">
.legal-edit-dialog {
  .el-dialog__body {
    padding-top: 10px;
  }
}

.legal-edit-form {
  .tip-text {
    margin-top: 4px;
    color: #f56c6c;
    font-size: 12px;
  }

  .upload-wrapper {
    margin-bottom: 12px;

    .upload-placeholder {
      margin-left: 12px;
      color: #f56c6c;
      font-size: 12px;
    }
  }

  .file-table {
    margin-top: 12px;
  }

  .history-section {
    margin: 24px 0 12px;

    .history-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .history-pagination {
      display: flex;
      justify-content: flex-end;
      padding: 12px 0 0;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}
</style>
