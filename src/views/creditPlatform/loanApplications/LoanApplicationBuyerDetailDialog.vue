<template>
  <el-dialog
    :model-value="visible"
    width="50%"
    class="buyer-detail-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-title">{{ dialogTitle }}</div>
    </template>
    <div v-loading="loading">
      <div class="detail-section">
        <div class="section-title">个人信息</div>
        <el-form :model="detail" label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="姓名">
                <el-input :model-value="detail.user.name" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出生年月">
                <el-input :model-value="detail.user.birthday" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号">
                <el-input :model-value="detail.user.idNumber" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号">
                <el-input :model-value="detail.user.phone" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="联系地址">
                <el-input :model-value="detail.user.address" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="身份证正反面">
                <template v-if="detail.user.idPhotos.length">
                  <el-image
                    v-for="(img, idx) in detail.user.idPhotos"
                    :key="idx"
                    :src="img"
                    :preview-src-list="detail.user.idPhotos"
                    class="identity-image"
                  />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="detail-section">
        <div class="section-title">贷款信息</div>
        <el-form :model="detail" label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="申请日期">
                <el-input :model-value="detail.loan.applyDate" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="贷款金额">
                <el-input :model-value="detail.loan.amount" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="还款周期">
                <el-input :model-value="detail.loan.period" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="还款方式">
                <el-input :model-value="detail.loan.repaymentType" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收款卡银行">
                <el-input :model-value="detail.loan.bank" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡号">
                <el-input :model-value="detail.loan.bankCardNo" disabled></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="银行卡正反面">
                <template v-if="detail.loan.cardPhotos.length">
                  <el-image
                    v-for="(img, idx) in detail.loan.cardPhotos"
                    :key="idx"
                    :src="img"
                    :preview-src-list="detail.loan.cardPhotos"
                    class="identity-image"
                  />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="detail-section">
        <div class="section-title">产品信息</div>
        <div class="product-link">
          <el-button type="primary" plain @click="handleViewProductDetail">查看产品信息</el-button>
        </div>
      </div>

      <div class="detail-section approval-section">
        <div class="section-title">审批信息</div>
        <el-alert v-if="showApprovalTip" :title="approvalTipMessage" type="warning" show-icon :closable="false" class="tips" />
        <el-form
          v-if="showApprovalForm"
          ref="approvalFormRef"
          :model="approvalForm"
          :rules="approvalRules"
          label-width="100px"
          class="approval-form no-wrap-label"
        >
          <el-form-item label="审批意见" prop="opinion" class="required-field">
            <el-select v-model="approvalForm.opinion" :disabled="isApprovalReadonly">
              <el-option label="同意" value="agree" />
              <el-option label="不同意" value="reject" />
            </el-select>
          </el-form-item>
          <el-form-item 
            label="放款日期" 
            prop="loanDate" 
            :class="{ 'required-field': approvalForm.opinion !== 'reject' }"
            class="date-picker-field"
          >
            <el-date-picker v-model="approvalForm.loanDate" type="date" placeholder="选择日期" style="width: 100%" :disabled="isApprovalReadonly" />
          </el-form-item>
          <el-form-item 
            label="第一期还款日期" 
            prop="firstRepaymentDate"
            :class="{ 'required-field': approvalForm.opinion !== 'reject' }"
            class="date-picker-field"
          >
            <el-date-picker
              v-model="approvalForm.firstRepaymentDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              :disabled="isApprovalReadonly"
            />
          </el-form-item>
          <el-form-item 
            label="贷款合同" 
            prop="contractId" 
            :class="['contract-field', { 'required-field': approvalForm.opinion !== 'reject' }]"
          >
            <template v-if="isApprovalMode">
              <div class="contract-upload-wrapper">
                <div class="contract-files" v-if="approvalForm.contractFiles.length">
                  <div v-for="(file, idx) in approvalForm.contractFiles" :key="file.url || idx" class="contract-file-item">
                    <el-link :href="file.url" target="_blank" type="primary">
                      {{ file.name || `合同文件${idx + 1}` }}
                    </el-link>
                    <el-icon class="file-remove-icon" @click="handleRemoveFile" title="删除文件">
                      <Close />
                    </el-icon>
                  </div>
                </div>
                <el-upload
                  v-if="!approvalForm.contractFiles.length"
                  class="contract-uploader inline-uploader"
                  :disabled="contractUploading || submittingApproval"
                  accept=".pdf,.doc,.docx"
                  :limit="1"
                  :file-list="approvalForm.contractFiles"
                  :http-request="handleContractUpload"
                  :on-remove="handleRemoveFile"
                  :show-file-list="false"
                >
                  <el-button type="primary" :loading="contractUploading" icon="Upload"> 点击上传 </el-button>
                  <template #tip>
                    <div class="upload-tip">支持 Word/PDF 格式，单文件上传</div>
                  </template>
                </el-upload>
              </div>
            </template>
            <template v-else>
              <div class="contract-files-view" v-if="approvalForm.contractFiles.length">
                <el-button
                  v-for="(file, idx) in approvalForm.contractFiles"
                  :key="file.url || idx"
                  type="primary"
                  link
                  @click="handleViewFile(file.url)"
                  class="contract-view-btn"
                >
                  <el-icon><Document /></el-icon>
                  {{ file.name || `合同文件${idx + 1}` }}
                </el-button>
              </div>
              <span v-else>--</span>
            </template>
          </el-form-item>
          <div class="approval-actions" v-if="isApprovalMode">
            <el-button
              type="primary"
              :loading="submittingApproval && currentApprovalAction === 'agree'"
              :disabled="submittingApproval || contractUploading"
              @click="handleSubmitApproval('agree')"
            >
              审批通过
            </el-button>
            <el-button
              :loading="submittingApproval && currentApprovalAction === 'reject'"
              :disabled="submittingApproval || contractUploading"
              @click="handleSubmitApproval('reject')"
            >
              审批驳回
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">返回</el-button>
    </template>
    <ProductDetailDialog v-model:visible="productDetailVisible" :product-id="currentDetail.productId" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive, nextTick, getCurrentInstance, toRefs } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Document } from '@element-plus/icons-vue';
import { getRemainingDetail, auditLoanApplication, uploadFile } from '@/api/creditPlatform/loanApplications';
import { uploadByChunks } from '@/utils/chunkUpload';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import ProductDetailDialog from './ProductDetailDialog.vue';

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
  mode?: 'detail' | 'approval';
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
  (event: 'refresh'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { repayment_method, review_status } = toRefs<any>(proxy?.useDict('repayment_method', 'review_status'));

const MB = 1024 * 1024;
const LARGE_FILE_CHUNK_THRESHOLD = 1 * MB;

const loading = ref(false);
const detailData = ref<Record<string, any>>({});
const productDetailVisible = ref(false);

const approvalFormRef = ref<FormInstance>();
const approvalForm = reactive({
  opinion: 'agree',
  rejectionReason: '',
  loanDate: '',
  firstRepaymentDate: '',
  contractId: '',
  contractFiles: [] as any[]
});

const createConditionalRequiredValidator = (message: string) => {
  return (rule: any, value: any, callback: (error?: Error) => void) => {
    if (approvalForm.opinion === 'reject') {
      callback();
      return;
    }
    if (value === undefined || value === null || value === '') {
      const errorMessage = rule.message || message;
      callback(new Error(errorMessage));
    } else {
      callback();
    }
  };
};
const submittingApproval = ref(false);
const contractUploading = ref(false);
const currentApprovalAction = ref<'agree' | 'reject' | null>(null);

// 还款方式备用映射（当字典数据不可用时使用）
const REPAYMENT_METHOD_MAP: Record<string, string> = {
  '0': '等额本息',
  '2': '等额本金',
  '3': '先息后本',
  '4': '先本后息'
};

// 申请状态备用映射（当字典数据不可用时使用）
const APPLY_STATUS_MAP: Record<string, string> = {
  '0': '待审核',
  '1': '待审核',
  '2': '审批通过',
  '3': '审批驳回',
  '99': '审批异常'
};

const approvalRules: FormRules = {
  opinion: [{ required: true, message: '请选择审批意见', trigger: 'change' }],
  loanDate: [
    { 
      required: true,
      message: '请选择放款日期', 
      trigger: 'change',
      validator: createConditionalRequiredValidator('请选择放款日期')
    }
  ],
  firstRepaymentDate: [
    { 
      required: true,
      message: '请选择第一期还款日期', 
      trigger: 'change',
      validator: createConditionalRequiredValidator('请选择第一期还款日期')
    }
  ],
  contractId: [
    { 
      required: true,
      message: '请上传贷款合同', 
      trigger: 'change',
      validator: createConditionalRequiredValidator('请上传贷款合同')
    }
  ]
};
/**
 * 格式化值，空值返回 '--'
 */
const formatValue = (value: any): string => {
  if (value === undefined || value === null || value === '') return '--';
  return String(value);
};

/**
 * 从身份证号提取生日
 */
const extractBirthdayFromId = (id: string | undefined | null): string => {
  const value = (id || '').trim();
  if (!value) return '';

  if (/^\d{17}[\dXx]$/.test(value)) {
    const birth = value.substring(6, 14);
    return `${birth.substring(0, 4)}-${birth.substring(4, 6)}-${birth.substring(6, 8)}`;
  }

  if (/^\d{15}$/.test(value)) {
    const birth = value.substring(6, 12);
    return `19${birth.substring(0, 2)}-${birth.substring(2, 4)}-${birth.substring(4, 6)}`;
  }

  return '';
};

/**
 * 判断是否为URL
 */
const isUrl = (value: string): boolean => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.startsWith('http') || lower.startsWith('//') || lower.includes('/');
};

/**
 * 收集URL列表
 */
const collectUrls = (...sources: any[]): string[] => {
  const urls: string[] = [];

  const processItem = (item: any) => {
    if (!item) return;

    if (Array.isArray(item)) {
      item.forEach(processItem);
      return;
    }

    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed && isUrl(trimmed)) urls.push(trimmed);
      return;
    }

    if (typeof item === 'object') {
      const url = (item.url || item.fileUrl || item.path || item.src || '').toString().trim();
      if (url && isUrl(url)) urls.push(url);
    }
  };

  sources.forEach(processItem);
  return urls;
};

/**
 * 获取字段值
 */
const getFieldValue = (row: Record<string, any>, fieldNames: string[]): any => {
  for (const fieldName of fieldNames) {
    if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
      return row[fieldName];
    }
  }
  return undefined;
};

/**
 * 从字典获取标签
 */
const getRepaymentMethodLabel = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '--';

  // 优先使用字典数据
  if (repayment_method?.value && Array.isArray(repayment_method.value) && repayment_method.value.length > 0) {
    const match = repayment_method.value.find((item: any) => String(item.value) === String(value));
    if (match?.label) {
      return match.label;
    }
  }

  // 备用映射
  return REPAYMENT_METHOD_MAP[String(value)] || '--';
};

/**
 * 从字典获取申请状态标签（优先使用字典，否则使用备用映射）
 */
const getApplyStatusLabel = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '--';

  // 优先使用字典数据
  if (review_status?.value && Array.isArray(review_status.value) && review_status.value.length > 0) {
    const match = review_status.value.find((item: any) => String(item.value) === String(value));
    if (match?.label) {
      return match.label;
    }
  }

  // 备用映射
  return APPLY_STATUS_MAP[String(value)] || '--';
};

/**
 * 获取详情数据
 */
const fetchDetail = async () => {
  if (!props.data?.id) {
    detailData.value = props.data || {};
    return;
  }

  loading.value = true;
  try {
    const res = await getRemainingDetail(props.data.id);
    if (res?.code === 200 && res.data) {
      detailData.value = { ...props.data, ...res.data };
    } else {
      detailData.value = props.data || {};
    }

    // 初始化审批表单
    if (props.mode === 'approval') {
      resetApprovalForm();
    } else {
      hydrateApprovalForm(detailData.value);
    }
  } catch (error) {
    console.error('获取申请详情失败:', error);
    detailData.value = props.data || {};
  } finally {
    loading.value = false;
  }
};

/**
 * 用户信息
 */
const mapUserInfo = (row: Record<string, any>) => {
  const birthday = getFieldValue(row, ['birthday', 'birthDate']) || extractBirthdayFromId(getFieldValue(row, ['idCardNumber', 'idNumber']));

  return {
    name: formatValue(getFieldValue(row, ['realName', 'name'])),
    birthday: formatValue(birthday),
    idNumber: formatValue(getFieldValue(row, ['idCardNumber'])),
    phone: formatValue(getFieldValue(row, ['contactPhone', 'phone'])),
    address: formatValue(getFieldValue(row, ['contactAddress', 'address'])),
    idPhotos: collectUrls(row.idFrontUrl, row.idBackUrl, row.idCardPhotoFront, row.idCardPhotoBack)
  };
};

/**
 * 贷款信息
 */
const mapLoanInfo = (row: Record<string, any>) => {
  const repaymentMethod = getFieldValue(row, ['repaymentMethod', 'repaymentType']);
  const repaymentTypeText = repaymentMethod ? getRepaymentMethodLabel(repaymentMethod) : undefined;

  return {
    applyDate: formatValue(getFieldValue(row, ['createTime', 'applyTime'])),
    amount: formatValue(row.loanAmount),
    period: formatValue(row.loanTerm),
    repaymentType: formatValue(repaymentTypeText),
    bank: formatValue(getFieldValue(row, ['collectionBankCode', 'bankName'])),
    bankCardNo: formatValue(getFieldValue(row, ['bankAccountNumber', 'bankCardNo'])),
    cardPhotos: collectUrls(row.bankFrontUrl, row.bankBackUrl, row.bankCardPhotoFront, row.bankCardPhotoBack)
  };
};

/**
 * 审批信息
 */
const mapApprovalInfo = (row: Record<string, any>) => {
  return {
    opinion: formatValue(getFieldValue(row, ['reviewNotes', 'rejectionReason'])),
    loanDate: formatValue(row.loanDate),
    firstRepaymentDate: formatValue(row.firstRepaymentDate),
    contractFiles: collectUrls(row.contractFiles, row.contractUrl)
  };
};

const currentDetail = computed(() => detailData.value || {});

const detail = computed(() => {
  const row = detailData.value || {};
  return {
    user: mapUserInfo(row),
    loan: mapLoanInfo(row),
    approval: mapApprovalInfo(row)
  };
});

const dialogTitle = computed(() => {
  return props.mode === 'approval' ? '个人贷款申请审核' : '贷款申请详情（个人）';
});

const isApprovalMode = computed(() => props.mode === 'approval');
const isApprovalReadonly = computed(() => !isApprovalMode.value);

const PENDING_STATUS_CODES = new Set(['0', '1']);

const isPendingStatus = computed(() => {
  const status = detailData.value?.applyStatus;
  if (status !== undefined && status !== null && status !== '') {
    if (PENDING_STATUS_CODES.has(String(status))) {
      return true;
    }
  }
  const label = getApplyStatusLabel(status) || detailData.value?.applyStatusName || detailData.value?.applyStatusLabel || '';
  const labelText = String(label);
  return labelText.includes('待审') || labelText.includes('待审核');
});

const hasCompletedResult = computed(() => {
  const status = detailData.value?.applyStatus;
  return status === '2' || status === '3';
});

const showApprovalTip = computed(() => !isApprovalMode.value && isPendingStatus.value && !hasCompletedResult.value);

const approvalTipMessage = computed(() => '当前申请状态为待审核，请前往审批流程处理。');

const showApprovalForm = computed(() => (isApprovalMode.value && !hasCompletedResult.value) || (!isApprovalMode.value && hasCompletedResult.value));

/**
 * 合同文件
 */
const normalizeContractFiles = (row: Record<string, any>) => {
  const baseName = row.contractFileName || '合同文件';
  const files = collectUrls(row.contractFiles, row.contractFileUrl, row.contractUrl);
  if (!files.length) return [];

  return files.map((url: string, index: number) => ({
    name: files.length === 1 ? baseName : `${baseName}${index + 1}`,
    url,
    id: row.contractId || ''
  }));
};

/**
 * 审批表单
 */
const hydrateApprovalForm = (row: Record<string, any>) => {
  approvalForm.rejectionReason = row.rejectionReason || '';
  approvalForm.loanDate = row.loanDate || '';
  approvalForm.firstRepaymentDate = row.firstRepaymentDate || '';
  approvalForm.contractId = row.contractId || '';

  if (row.applyStatus === '3') {
    approvalForm.opinion = 'reject';
  } else if (row.applyStatus === '2') {
    approvalForm.opinion = 'agree';
  }

  approvalForm.contractFiles = normalizeContractFiles(row);
};

/**
 * 重置审批表单
 */
const resetApprovalForm = () => {
  approvalForm.opinion = 'agree';
  approvalForm.rejectionReason = '';
  approvalForm.loanDate = '';
  approvalForm.firstRepaymentDate = '';
  approvalForm.contractId = '';
  approvalForm.contractFiles = [];
  currentApprovalAction.value = null;
  nextTick(() => {
    approvalFormRef.value?.clearValidate();
  });
};

watch([() => props.visible, () => props.data?.id], ([visible, id], [prevVisible, prevId]) => {
  if (visible && (!prevVisible || id !== prevId)) {
    fetchDetail();
  }
});

watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetApprovalForm();
    }
  }
);

watch(
  () => approvalForm.opinion,
  (val) => {
    if (!approvalFormRef.value) return;
    if (val === 'reject') {
      approvalFormRef.value.clearValidate?.(['loanDate', 'firstRepaymentDate', 'contractId']);
    } else {
      nextTick(() => {
        approvalFormRef.value?.validateField?.(['loanDate', 'firstRepaymentDate', 'contractId']);
      });
    }
  }
);

const uploadAttachmentFile = async (file: File, options?: { uid?: string }) => {
  const modal = (proxy as any)?.$modal;
  const useChunkUpload = file.size > LARGE_FILE_CHUNK_THRESHOLD;

  modal?.loading?.(useChunkUpload ? '正在分片上传，请稍候...' : '正在上传附件，请稍候...');

  try {
    let uploadResult: any = {};

    if (useChunkUpload) {
      uploadResult = await uploadByChunks(file, (percent) => {
        modal?.setLoadingText?.(`正在分片上传...${percent}%`);
      });
      // 分片上传返回的数据结构：mergeRes.data = { url, fileName, ossid }
      // 兼容处理不同的返回格式和字段名
      if (uploadResult && !uploadResult.ossId && !uploadResult.ossid && uploadResult.data) {
        uploadResult = uploadResult.data;
      }
    } else {
      const response = await ossUploadImage({ file });
      uploadResult = response?.data || {};
    }

    // 兼容 ossId 和 ossid 两种字段名（API 返回可能是 ossid）
    const ossId = uploadResult?.ossId || uploadResult?.ossid || uploadResult?.data?.ossId || uploadResult?.data?.ossid;
    if (!ossId) {
      throw new Error('上传失败，未获取到文件标识');
    }

    return {
      ossId,
      fileName: file.name,
      originalName: file.name,
      url: uploadResult?.url || uploadResult?.data?.url || uploadResult?.fileUrl || '',
      uid: options?.uid || `${Date.now()}_${Math.random().toString(36).slice(2)}`
    };
  } catch (error) {
    console.error('上传文件失败', error);
    throw error;
  } finally {
    modal?.closeLoading?.();
  }
};

const handleContractUpload = async (options: any) => {
  if (isApprovalReadonly.value) {
    options?.onError?.(new Error('仅可查看'));
    return;
  }
  contractUploading.value = true;
  try {
    const uploadResult = await uploadAttachmentFile(options.file);
    
    if (uploadResult?.ossId) {
      const fileInfo = {
        name: uploadResult.originalName || options.file.name,
        url: uploadResult.url,
        id: uploadResult.ossId,
        ossId: uploadResult.ossId
      };
      if (!fileInfo.url) {
        throw new Error('上传返回结果缺少文件地址');
      }
      approvalForm.contractFiles = [fileInfo];
      approvalForm.contractId = String(fileInfo.ossId || fileInfo.id || '');
      approvalFormRef.value?.validateField?.('contractId');
      options.onSuccess?.(uploadResult, options.file);
      ElMessage.success('合同上传成功');
    } else {
      throw new Error('上传失败，未获取到文件标识');
    }
  } catch (error: any) {
    const errorMsg = error?.message || error?.msg || error?.response?.data?.msg || '合同上传失败';
    options.onError?.(error);
    ElMessage.error(errorMsg);
  } finally {
    contractUploading.value = false;
  }
};

const handleRemoveFile = () => {
  if (isApprovalReadonly.value) return;
  approvalForm.contractFiles = [];
  approvalForm.contractId = '';
  approvalFormRef.value?.validateField?.('contractId');
};

const handleSubmitApproval = async (action: 'agree' | 'reject') => {
  currentApprovalAction.value = action;
  approvalForm.opinion = action;
  await nextTick();
  try {
    await approvalFormRef.value?.validate();
  } catch (error) {
    currentApprovalAction.value = null;
    return;
  }
  if (!detailData.value?.id && !props.data?.id) {
    ElMessage.error('缺少申请ID，无法提交审批');
    currentApprovalAction.value = null;
    return;
  }
  submittingApproval.value = true;
  try {
    const payload = {
      ...detailData.value,
      id: detailData.value?.id || props.data?.id,
      applyStatus: action === 'agree' ? '2' : '3',
      rejectionReason: approvalForm.rejectionReason,
      loanDate: approvalForm.loanDate,
      firstRepaymentDate: approvalForm.firstRepaymentDate,
      contractId: approvalForm.contractId
    };
    const res = await auditLoanApplication(payload);
    if (res && res.code === 200) {
      ElMessage.success(action === 'agree' ? '审批通过成功' : '审批驳回成功');
      emit('refresh');
      emit('update:visible', false);
    } else {
      throw new Error(res?.msg || '审批提交失败');
    }
  } catch (error: any) {
    const responseData = error?.response?.data || error?.data || error;
    const backendMessage = responseData?.msg || error?.msg || error?.message || responseData?.message;
    const isCancelledError = backendMessage?.includes('该贷款申请已取消，不能进行审核');
    if (!isCancelledError) {
      ElMessage.error(backendMessage || '审批提交失败');
    }
  } finally {
    submittingApproval.value = false;
    currentApprovalAction.value = null;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};

const handleViewFile = (fileUrl: string) => {
  if (!fileUrl) {
    ElMessage.warning('文件地址不存在');
    return;
  }
  window.open(fileUrl, '_blank');
};

const handleViewProductDetail = () => {
  if (!currentDetail.value.productId) {
    ElMessage.warning('产品ID不存在');
    return;
  }
  productDetailVisible.value = true;
};
</script>

<style scoped lang="scss">
.no-wrap-label {
  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}

.buyer-detail-dialog {
  :deep(.el-dialog__body) {
    background-color: #f7f8fa;
    padding: 24px;
  }

  :deep(.el-descriptions) {
    background-color: transparent;

    .el-descriptions__label {
      background-color: #fafafa;
      color: #606266;
      font-weight: 500;
    }

    .el-descriptions__content {
      background-color: #ffffff;
      color: #303133;
    }

    .el-descriptions__table {
      border: 1px solid #e5e5e5;
    }

    .el-descriptions__table td,
    .el-descriptions__table th {
      border: 1px solid #e5e5e5;
    }
  }
}

.detail-section {
  margin-bottom: 20px;
  background: #ffffff;
  // border-radius: 8px;
  padding: 20px 24px;
  // box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
  // border-radius: 8px 8px 8px 8px;

  // 去掉表单的默认样式
  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    background-color: transparent !important;
    cursor: default !important;
    resize: none !important;
  }

  // 输入框 value 样式
  :deep(.el-input__inner),
  :deep(.el-input.is-disabled .el-input__inner),
  :deep(.el-input.is-disabled .el-input__wrapper .el-input__inner) {
    cursor: default !important;
    font-weight: 400 !important;
    font-size: 14px !important;
    color: #3d3d3d !important;
    -webkit-text-fill-color: #3d3d3d !important;
  }

  :deep(.el-textarea__inner),
  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    box-shadow: none !important;
    background-color: transparent !important;
    cursor: default !important;
    resize: none !important;
    font-weight: 400 !important;
    font-size: 14px !important;
    color: #3d3d3d !important;
    -webkit-text-fill-color: #3d3d3d !important;
  }

  // 表单 label 样式
  :deep(.el-form-item__label) {
    font-weight: 400;
    font-size: 14px;
    color: rgba(61, 61, 61, 0.5);
  }
}

.section-title {
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  color: #108c58;

  &::before {
    content: '';
    width: 2px;
    height: 13px;
    background-color: #108c58;
    border-radius: 4px;
    margin-right: 5px;
  }
}

.identity-image {
  width: 92px;
  height: 64px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #e5e5e5;
  background-color: #ffffff;
}

.image-placeholder {
  width: 92px;
  height: 64px;
  border: 1px dashed #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  background: #fff;
}

.product-link {
  display: flex;
  justify-content: center;
}

.approval-section {
  .tips {
    margin-bottom: 16px;
  }
}

.approval-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.contract-files,
.contract-field .contract-files {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .contract-file {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #409eff;
    font-size: 13px;

    span {
      color: #606266;
    }
  }
}

.contract-files-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.contract-view-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 14px;

  .el-icon {
    font-size: 16px;
  }

  &:hover {
    opacity: 0.8;
  }
}

.contract-field {
  :deep(.el-form-item__content) {
    width: 100%;
  }

  .contract-upload-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .contract-files {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .contract-file-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    width: fit-content;

    &:hover {
      background-color: #f5f7fa;

      .file-remove-icon {
        opacity: 1;
      }
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

  .inline-uploader {
    display: inline-flex;
    align-items: center;
  }

  .upload-tip {
    color: #909399;
    font-size: 12px;
    margin-left: 12px;
  }
}

.required-field {
  :deep(.el-form-item__label) {
    &::before {
      content: '*';
      color: #f56c6c;
      margin-right: 4px;
    }
  }
}

// 调整日期选择器清除图标位置
.approval-form {
  :deep(.el-date-editor) {
    .el-input__suffix {
      right: 8px;
    }
    
    .el-input__suffix-inner {
      .el-input__clear {
        margin-right: 4px;
      }
    }
  }
}

// 日期选择器字段边框
.date-picker-field {
  :deep(.el-date-editor) {
    .el-input__wrapper {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
    }
  }
}
</style>
