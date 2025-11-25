<template>
  <el-dialog
    :model-value="visible"
    width="1300px"
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
            <div class="upload-inline">
              <div class="contract-files" v-if="contractFiles.length">
                <div class="contract-file-item">
                  <el-link :href="contractFiles[0].url" target="_blank" type="primary" class="contract-link">
                    {{ contractFiles[0].displayName || contractFiles[0].name }}
                  </el-link>
                  <el-icon class="file-remove-icon" @click="handleDeleteFile" title="删除文件">
                    <Close />
                  </el-icon>
                </div>
              </div>
              <el-upload
                v-if="!contractFiles.length"
                :auto-upload="true"
                action="#"
                accept=".pdf,.doc,.docx"
                :file-list="contractFiles"
                list-type="text"
                :show-file-list="false"
                :http-request="handleUpload"
                :before-upload="beforeUpload"
                :on-remove="handleContractRemove"
                class="contract-uploader"
              >
                <el-button type="primary" icon="Upload">点击上传</el-button>
                <template #tip>
                  <div class="upload-tip">支持 Word/PDF 格式</div>
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
                  <el-input v-model="item.principalAmount" type="number" :min="0" :step="1" />
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
        <el-button type="primary" plain @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue';
import { ElMessage } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { getRepaymentPlan, updateRepaymentPlan, getRemainingDetail, uploadFile, deleteFile } from '@/api/creditPlatform/loanApplications';
const props = defineProps<{
  visible: boolean;
  data: {
    id?: string | number;
    plans?: Array<{ period: number; repayDate: string; amount: number }>;
    contractFiles?: string[];
  } | null;
}>();

const emit = defineEmits<{ (event: 'update:visible', payload: boolean): void }>();

const loading = ref(false);
const plans = ref<any[]>([]);
const contractFiles = ref<any[]>([]); //合同地址
const uploadedOssId = ref<string>(''); //上传后的ossId
const objectUrls = new Map<string, string>();

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
      const contractUrl = response.data.contractUrl || response.data.url || '';
      if (contractUrl) {
        contractFiles.value = [
          {
            name: '贷款合同',
            displayName: '贷款合同',
            url: contractUrl,
            uid: 'contract-file'
          }
        ];
      }
    }
  } catch (error) {
    console.error('获取合同地址失败:', error);
  }
};
const normalizeFiles = (files: Array<any> = []) =>
  files.map((item, index) => {
    if (typeof item === 'string') {
      return { name: item, displayName: item, url: item, uid: `preset-${index}` };
    }
    if (!item.url && item.raw) {
      const url = URL.createObjectURL(item.raw);
      objectUrls.set(item.uid, url);
      item.url = url;
    }
    if (!item.displayName) {
      item.displayName = item.name || `文件${index + 1}`;
    }
    return item;
  });

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
  const isLt10M = file.size / 1024 / 1024 < 10;

  if (!isValidType) {
    ElMessage.error('只能上传 Word/PDF 格式的文件！');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB！');
    return false;
  }
  return true;
};

// 自定义上传
const handleUpload = async (options: any) => {
  const { file } = options;
  const formData = new FormData();
  formData.append('file', file);

  try {
    loading.value = true;
    const response = await uploadFile(formData);
    if (response.code === 200 && response.data) {
      // 保存上传成功的文件信息和ossId
      uploadedOssId.value = response.data.ossId;
      contractFiles.value = [
        {
          name: response.data.fileName || file.name,
          displayName: response.data.fileName || file.name,
          url: response.data.url,
          ossId: response.data.ossId,
          uid: file.uid
        }
      ];
      ElMessage.success('上传成功');
    } else {
      ElMessage.error(response.msg || '上传失败');
    }
  } catch (error) {
    console.error('上传失败:', error);
    ElMessage.error('上传失败');
  } finally {
    loading.value = false;
  }
};

// 删除文件
const handleDeleteFile = () => {
  if (!contractFiles.value.length) return;

  // 直接清空文件列表，不调用删除接口
  contractFiles.value = [];
  ElMessage.success('删除成功');
};

const handleContractRemove = (file: any, fileList: any[]) => {
  if (objectUrls.has(file.uid)) {
    URL.revokeObjectURL(objectUrls.get(file.uid)!);
    objectUrls.delete(file.uid);
  }
  contractFiles.value = normalizeFiles(fileList);
};

const previewFile = () => {
  if (contractFiles.value.length) {
    const file = contractFiles.value[0];
    if (file.url) {
      window.open(file.url, '_blank');
    }
  }
};

// 提交修改信息
const handleSubmit = async () => {
  if (!props.data?.id) return;

  try {
    loading.value = true;

    // 直接传递还款计划数组
    const response = await updateRepaymentPlan(props.data.id, uploadedOssId.value || undefined, plans.value);

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
});
</script>

<style scoped lang="scss">
.repayment-plan-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
  }
}

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
  text-align: center;
}
</style>
