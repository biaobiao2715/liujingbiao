<template>
  <el-dialog
    :model-value="visible"
    width="50%"
    class="repayment-plan-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-title">还款计划</div>
    </template>

    <div v-loading="loading" class="dialog-content">
      <div class="top-actions">
        <div class="buttons">
          <el-button type="primary" @click="handleSubmit">提交修改信息</el-button>
          <el-button @click="handleClose">返回</el-button>
        </div>
        <div class="contract-upload">
          <div class="upload-row">
            <div class="label">贷款合同：</div>
            <div class="upload-inline" :class="{ 'uploading-layout': contractFiles.length && contractFiles[0].status === 'uploading' }">
              <div class="contract-files" v-if="contractFiles.length">
                <div class="contract-file-item">
                  <template v-if="contractFiles[0].status === 'success'">
                    <el-link 
                      :href="contractFiles[0].serverUrl || contractFiles[0].url" 
                      target="_blank" 
                      type="primary" 
                      class="contract-link"
                    >
                      {{ contractFiles[0].displayName || contractFiles[0].name }}
                    </el-link>
                    <el-icon 
                      class="file-remove-icon" 
                      @click.stop="handleDeleteFile" 
                      title="删除文件"
                    >
                      <Close />
                    </el-icon>
                  </template>
                  <template v-else-if="contractFiles[0].status === 'uploading'">
                    <div class="uploading-status">
                      <el-icon class="uploading-icon"><Loading /></el-icon>
                      <span class="uploading-text">上传中...</span>
                    </div>
                  </template>
                </div>
              </div>
              <el-upload
                v-if="!contractFiles.length || (contractFiles.length > 0 && contractFiles[0].status !== 'success')"
                ref="uploaderRef"
                :file-list="contractFiles"
                action="#"
                accept=".pdf,.doc,.docx"
                :http-request="handleUpload"
                :before-upload="beforeUpload"
                :on-remove="handleContractRemove"
                :limit="1"
                class="contract-uploader"
              >
                <el-button type="primary" icon="Upload">点击上传</el-button>
                <template #tip>
                  <div class="upload-tip">支持 Word/PDF 格式，文件大小不超过200MB</div>
                </template>
              </el-upload>
            </div>
          </div>
          <!-- <div class="tips-card">贷款合同可重复上传，还款计划的期数、日期需生成的，请仔细校验，允许修改，还款金额需为整数。</div> -->
        </div>
      </div>

      <div class="plan-grid">
        <div class="plan-card" v-for="item in plans" :key="item.loanPeriod">
          <div class="card-content">
            <el-form label-width="80px" class="plan-form">
              <el-form-item label="期数：">
                <el-input v-model="item.loanPeriod" disabled />
              </el-form-item>
              <el-form-item label="还款日期：">
                <el-date-picker v-model="item.repaymentDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
              </el-form-item>
              <el-form-item label="还款金额：">
                <div class="amount-input">
                  <el-input v-model="item.totalAmount" type="number" :min="0" :step="1" />
                  <span class="unit">元</span>
                </div>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadUserFile } from 'element-plus';
import { Close, Loading } from '@element-plus/icons-vue';
import { getRepaymentPlan, updateRepaymentPlan, getRemainingDetail, uploadFile as uploadContractFile, deleteFile as deleteContractFile } from '@/api/creditPlatform/loanApplications';
import { uploadByChunks } from '@/utils/chunkUpload';

interface ContractFile extends UploadUserFile {
  ossId?: string | number;
  fileName?: string;
  fileType?: string;
  url?: string;
  serverUrl?: string; // 后端返回的地址
  percentage?: number;
  status?: 'ready' | 'uploading' | 'success' | 'fail';
  displayName?: string;
}

const props = defineProps<{
  visible: boolean;
  data: {
    id?: string | number;
    plans?: Array<{ period: number; repayDate: string; amount: number }>;
    contractFiles?: string[];
  } | null;
}>();

const emit = defineEmits<{ (event: 'update:visible', payload: boolean): void }>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const plans = ref<any[]>([]);
const contractFiles = ref<ContractFile[]>([]);
const uploaderRef = ref();
const objectUrls = new Map<string, string>();

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 获取还款计划详情
const fetchRepaymentPlan = async () => {
  if (!props.data?.id) return;

  loading.value = true;
  try {
    const response: any = await getRepaymentPlan(props.data.id);
    plans.value = response;
  } catch (error) {
    console.error('获取还款计划失败:', error);
  } finally {
    loading.value = false;
  }
};
// 获取合同地址
const fetchContractUrl = async () => {
  if (!props.data?.id) return;

  try {
    const response: any = await getRemainingDetail(props.data.id);
    if (response.code === 200 && response.data) {
      const contractUrl = response.data.contractUrl || '';
      const contractName = response.data.contractName || '';
      if (contractUrl) {
        contractFiles.value = [
          {
            name: contractName,
            displayName: contractName,
            url: contractUrl,
            serverUrl: contractUrl,
            uid: Date.now(),
            status: 'success'
          }
        ];
      }
    }
  } catch (error) {
    console.error('获取合同地址失败:', error);
  }
};

// 监听弹窗打开，调用接口获取数据
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.data?.id) {
      fetchRepaymentPlan();
      fetchContractUrl();
    }
  },
  { immediate: true }
);

// 上传前验证
const beforeUpload = (file: any) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
    file.type
  );

  if (!isValidType) {
    ElMessage.error('只能上传 Word/PDF 格式的文件！');
    return false;
  }

  // 重复文件拦截（按名称简单判断）
  if (contractFiles.value.some((f) => (f.fileName || f.name) === file.name)) {
    ElMessage.error('已选择相同文件，请勿重复上传');
    return false;
  }

  // 文件大小限制（200MB，与视频文件相同）
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > 200) {
    ElMessage.error('上传文件大小不能超过200MB!');
    return false;
  }

  // 限制只能上传一个文件
  if (contractFiles.value.length >= 1) {
    ElMessage.error('只能上传一个合同文件');
    return false;
  }

  return true;
};

// 自定义上传
const handleUpload = (req: any) =>
  new Promise(async (resolve, reject) => {
    const rawFile = req.file;
    // 先创建本地预览并标记上传中
    const tempUrl = URL.createObjectURL(rawFile);
    const tempItem: ContractFile = {
      fileName: rawFile.name,
      name: rawFile.name,
      displayName: rawFile.name,
      url: tempUrl,
      fileType: '0', // 合同文件类型
      status: 'uploading',
      percentage: 0
    };
    // 上传中时显示上传状态
    contractFiles.value = [tempItem];
    try {
      // 大文件：使用分片上传
      if (rawFile.size > MAX_SIZE) {
        const res: any = await uploadByChunks(rawFile, (percent: number) => {
          if (typeof req.onProgress === 'function') req.onProgress({ percent });
        });
        // 上传成功后，更新文件信息并显示
        const uploadedFile: ContractFile = {
          fileName: res.fileName || rawFile.name,
          name: res.fileName || rawFile.name,
          displayName: res.fileName || rawFile.name,
          url: tempUrl,
          serverUrl: res.url,
          ossId: res.ossId,
          fileType: '0',
          status: 'success',
          percentage: 100
        };
        contractFiles.value = [uploadedFile];
        ElMessage.success('文件上传成功');
        if (typeof req.onSuccess === 'function') req.onSuccess(res);
        return resolve(uploadedFile);
      }

      // 小文件：FormData 普通上传
      const fd = new FormData();
      fd.append('file', rawFile);
      const response: any = await uploadContractFile(fd);
      const data = response?.data || {};
      const fileName = data.fileName || rawFile.name;
      // 上传成功后，更新文件信息并显示
      const uploadedFile: ContractFile = {
        fileName: fileName,
        name: fileName,
        displayName: fileName,
        url: tempUrl,
        serverUrl: data.url,
        ossId: data.ossId,
        fileType: '0',
        status: 'success',
        percentage: 100
      };
      contractFiles.value = [uploadedFile];
      ElMessage.success('文件上传成功');
      if (typeof req.onSuccess === 'function') req.onSuccess(data);
      return resolve(uploadedFile);
    } catch (error: any) {
      ElMessage.error(error?.msg || '文件上传失败，请重试');
      const idx = contractFiles.value.indexOf(tempItem);
      if (idx > -1) contractFiles.value.splice(idx, 1);
      try {
        URL.revokeObjectURL(tempUrl);
      } catch {}
      try {
        (uploaderRef.value as any)?.handleRemove(tempItem);
      } catch {}
      if (typeof req.onError === 'function') req.onError(error);
      reject(error);
    }
  });

const removeFileManually = (file: ContractFile) => {
  try {
    (uploaderRef.value as any)?.handleRemove(file);
  } catch (error) {
    console.error(error);
  }
};

// 删除文件
const handleDeleteFile = async () => {
  if (!contractFiles.value.length) return;

  const file = contractFiles.value[0];
  await handleContractRemove(file);
};

const handleContractRemove = async (file: ContractFile) => {
  if (file?.ossId) {
    try {
      await deleteContractFile([file.ossId]);
    } catch (error: any) {
      ElMessage.error(error?.msg || '删除文件失败，请重试');
      return;
    }
  }
  const idx = contractFiles.value.findIndex((f) => f.url === file.url || f.serverUrl === file.serverUrl);
  if (idx > -1) contractFiles.value.splice(idx, 1);
  // 清理本地 blob URL
  if (file?.url && file.url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(file.url);
    } catch {}
  }
};

// 提交修改信息
const handleSubmit = async () => {
  if (!props.data?.id) return;

  try {
    loading.value = true;

    // 获取当前上传文件的 ossId
    const currentOssId = contractFiles.value.length > 0 && contractFiles.value[0]?.ossId 
      ? String(contractFiles.value[0].ossId) 
      : undefined;

    // 直接传递还款计划数组
    const response = await updateRepaymentPlan(props.data.id, currentOssId, plans.value);

    if (response.code === 200) {
      ElMessage.success('提交成功');
      emit('update:visible', false);
    } else {
      ElMessage.error(response.msg || '提交失败');
    }
  } catch (error) {
    console.error('提交失败:', error);
    ElMessage.error('提交失败');
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls.clear();
  // 清理所有本地 blob URL
  contractFiles.value.forEach((file) => {
    if (file?.url && file.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(file.url);
      } catch {}
    }
  });
});
</script>

<style scoped lang="scss">
.dialog-content {
  min-height: 400px;
}

.top-actions {
  margin-bottom: 20px;

  .buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .contract-upload {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .upload-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .label {
      font-weight: 600;
      color: #303133;
    }

    .upload-inline {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      &.uploading-layout {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .contract-files {
      display: flex;
      align-items: center;
    }

    .contract-file-item {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;

        .file-remove-icon {
          opacity: 1;
        }
      }
    }

    .contract-link {
      font-size: 14px;
    }

    .uploading-status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      font-size: 14px;

      .uploading-icon {
        animation: rotating 2s linear infinite;
      }

      .uploading-text {
        color: #409eff;
      }
    }

    @keyframes rotating {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .file-remove-icon {
      position: absolute;
      top: -6px;
      right: -6px;
      font-size: 16px;
      color: #f56c6c;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      background: white;
      border-radius: 50%;
      padding: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        color: #f23030;
      }
    }

    .contract-uploader {
      display: inline-flex;
      align-items: center;

      // 隐藏 el-upload 自带的文件列表和进度条
      :deep(.el-upload-list) {
        display: none;
      }

      .upload-tip {
        color: #909399;
        font-size: 12px;
        margin-left: 12px;
      }
    }

    .tips-card {
      background: #fff6d9;
      border: 1px solid #fbd786;
      border-radius: 4px;
      padding: 10px 12px;
      color: #735c0f;
      font-size: 13px;
      min-width: 240px;
    }
  }
}

.plan-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.plan-card {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #fff;
  padding: 16px 30px;
  flex: 1 1 calc((100% - 32px) / 3);
  min-width: 320px;

  .plan-form {
    :deep(.el-form-item) {
      margin-bottom: 12px;
    }

    :deep(.el-input__wrapper) {
      width: 100%;
    }

    :deep(.el-form-item__label) {
      white-space: nowrap;
    }
  }

  .amount-input {
    display: flex;
    align-items: center;
    gap: 4px;

    .unit {
      color: #909399;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
