<!--
  标题: creditPlatform/loanApplications/LoanApplicationBuyerDetailDialog.vue
  功能: 个人贷款申请详情
  说明: 个人贷款申请详情
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

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
            <el-col :span="12">
              <el-form-item label="身份证正面">
                <template v-if="detail.user.idFrontPhoto">
                  <el-image :src="detail.user.idFrontPhoto" :preview-src-list="detail.user.idPhotos" class="identity-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证反面">
                <template v-if="detail.user.idBackPhoto">
                  <el-image :src="detail.user.idBackPhoto" :preview-src-list="detail.user.idPhotos" class="identity-image" />
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
                <el-input :model-value="detail.loan.period ? `${detail.loan.period} 期` : ''" disabled></el-input>
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
            <el-col :span="12">
              <el-form-item label="银行卡正面">
                <template v-if="detail.loan.cardFrontPhoto">
                  <el-image :src="detail.loan.cardFrontPhoto" :preview-src-list="detail.loan.cardPhotos" class="identity-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡反面">
                <template v-if="detail.loan.cardBackPhoto">
                  <el-image :src="detail.loan.cardBackPhoto" :preview-src-list="detail.loan.cardPhotos" class="identity-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品详情">
                <template v-if="detail.loan.cardBackPhoto">
                  <el-button type="primary" style="margin-left: 11px" @click="handleViewProductDetail">查看</el-button>
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <!-- <div class="detail-section">
        <div class="section-title">产品信息</div>
        <div class="product-link">
          <el-button type="primary" plain @click="handleViewProductDetail">查看产品信息</el-button>
        </div>
      </div> -->

      <div class="detail-section approval-section">
        <div class="section-title">审批信息</div>
        <el-alert v-if="showApprovalTip" :title="approvalTipMessage" type="warning" show-icon :closable="false" class="tips" />
        <el-form
          v-if="showApprovalForm"
          ref="approvalFormRef"
          :model="approvalForm"
          :rules="isApprovalMode ? approvalRules : {}"
          label-width="140px"
          class="approval-form no-wrap-label"
        >
          <el-form-item label="审批意见" prop="opinion" class="required-field">
            <el-select v-model="approvalForm.opinion" placeholder="请选择" :disabled="isApprovalReadonly" style="width: 100%">
              <el-option label="同意" value="agree" />
              <el-option label="驳回" value="reject" />
            </el-select>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="放款日期" prop="loanDate" class="required-field date-picker-field">
                <el-date-picker
                  v-model="approvalForm.loanDate"
                  type="date"
                  placeholder="请选择"
                  style="width: 100%"
                  :disabled="isApprovalReadonly"
                  :disabledDate="disablePastDates"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="第一期还款日" prop="firstRepaymentDate" class="required-field date-picker-field">
                <el-date-picker
                  v-model="approvalForm.firstRepaymentDate"
                  type="date"
                  placeholder="请选择"
                  style="width: 100%"
                  :disabled="isApprovalReadonly"
                  :disabledDate="disableFirstRepaymentDates"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="贷款合同" prop="contractId" :class="['contract-field', { 'required-field': approvalForm.opinion !== 'reject' }]">
            <template v-if="isApprovalMode">
              <div class="contract-upload-wrapper">
                <div class="contract-files" v-if="approvalForm.contractFiles.length">
                  <div v-for="(file, idx) in approvalForm.contractFiles" :key="file.url || file.serverUrl || idx" class="contract-file-item">
                    <template v-if="file.status === 'success'">
                      <el-link :href="file.serverUrl || file.url" target="_blank" type="primary">
                        {{ file.displayName || file.name || `合同文件${idx + 1}` }}
                      </el-link>
                      <el-icon class="file-remove-icon" @click="handleRemoveFile" title="删除文件">
                        <Close />
                      </el-icon>
                    </template>
                    <template v-else-if="file.status === 'uploading'">
                      <div class="uploading-status">
                        <el-icon class="uploading-icon"><Loading /></el-icon>
                        <span class="uploading-text">上传中...</span>
                      </div>
                    </template>
                  </div>
                </div>
                <el-upload
                  v-if="
                    !approvalForm.contractFiles.length ||
                    (approvalForm.contractFiles.length > 0 && approvalForm.contractFiles[0].status === 'success')
                  "
                  class="contract-uploader inline-uploader"
                  :disabled="submittingApproval"
                  accept=".pdf,.doc,.docx"
                  :limit="1"
                  :file-list="approvalForm.contractFiles"
                  :http-request="handleContractUpload"
                  :before-upload="beforeUpload"
                  :on-remove="handleRemoveFile"
                  :show-file-list="false"
                >
                  <el-button type="primary" icon="Upload"> 上传文件 </el-button>
                  <!-- <template #tip>
                    <div class="upload-tip">支持 Word/PDF 格式，单文件上传</div>
                  </template> -->
                </el-upload>
              </div>
            </template>
            <template v-else>
              <div class="contract-files-view" v-if="approvalForm.contractFiles.length">
                <el-button
                  v-for="(file, idx) in approvalForm.contractFiles"
                  :key="file.url || file.serverUrl || idx"
                  type="primary"
                  link
                  @click="handleViewFile(file.serverUrl || file.url)"
                  class="contract-view-btn"
                >
                  <el-icon><Document /></el-icon>
                  {{ file.displayName || file.name || `合同文件${idx + 1}` }}
                </el-button>
              </div>
              <span v-else>--</span>
            </template>
          </el-form-item>
          <div class="approval-actions" v-if="isApprovalMode">
            <el-button
              type="danger"
              plain
              :loading="submittingApproval && currentApprovalAction === 'reject'"
              :disabled="submittingApproval"
              @click="handleSubmitApproval('reject')"
            >
              审批驳回
            </el-button>
            <el-button
              type="primary"
              :loading="submittingApproval && currentApprovalAction === 'agree'"
              :disabled="submittingApproval"
              @click="handleSubmitApproval('agree')"
            >
              审批通过
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
    <template #footer v-if="!isApprovalMode">
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
import { Close, Document, Loading } from '@element-plus/icons-vue';
import {
  getRemainingDetail,
  auditLoanApplication,
  uploadFile as uploadContractFile,
  deleteFile as deleteContractFile
} from '@/api/creditPlatform/loanApplications';
import { uploadByChunks } from '@/utils/chunkUpload';
import ProductDetailDialog from './ProductDetailDialog.vue';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    data: Record<string, any> | null;
    mode?: 'detail' | 'approval';
  }>(),
  {
    mode: 'detail'
  }
);

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
  (event: 'refresh'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { repayment_method, review_status, bank_code } = toRefs<any>(proxy?.useDict('repayment_method', 'review_status', 'bank_code'));

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// 禁止选择当天及之前的日期，只能选择明天及以后
const disablePastDates = (time: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return time.getTime() <= today.getTime();
};

// 第一期还款日期禁用规则：必须在放款日期之后
const disableFirstRepaymentDates = (time: Date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 禁止选择今天及之前
  if (time.getTime() <= today.getTime()) {
    return true;
  }

  // 如果已选择放款日期，禁止选择放款日期及之前的日期
  if (approvalForm.loanDate) {
    const loanDate = new Date(approvalForm.loanDate);
    loanDate.setHours(0, 0, 0, 0);
    return time.getTime() <= loanDate.getTime();
  }

  return false;
};

const loading = ref(false);
const detailData = ref<Record<string, any>>({});
const productDetailVisible = ref(false);

const approvalFormRef = ref<FormInstance>();
const approvalForm = reactive({
  opinion: '',
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

// 第一期还款日期验证器
const validateFirstRepaymentDate = (rule: any, value: any, callback: (error?: Error) => void) => {
  if (approvalForm.opinion === 'reject') {
    callback();
    return;
  }

  if (!value) {
    callback(new Error('请选择第一期还款日期'));
    return;
  }

  // 验证第一期还款日期必须在放款日期之后
  if (approvalForm.loanDate) {
    const loanDate = new Date(approvalForm.loanDate);
    loanDate.setHours(0, 0, 0, 0);
    const firstRepaymentDate = new Date(value);
    firstRepaymentDate.setHours(0, 0, 0, 0);

    if (firstRepaymentDate.getTime() <= loanDate.getTime()) {
      callback(new Error('第一期还款日期必须在放款日期之后'));
      return;
    }
  }

  callback();
};
const submittingApproval = ref(false);
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
  opinion: [{ required: true, message: '请输入审批意见', trigger: 'blur' }],
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
      validator: validateFirstRepaymentDate
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
 * 获取银行名称
 */
const getBankLabel = (value: string | number | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '--';
  if (bank_code?.value && Array.isArray(bank_code.value) && bank_code.value.length > 0) {
    const match = bank_code.value.find((item: any) => String(item.value) === String(value));
    if (match?.label) {
      return match.label;
    }
  }
  return '--';
};

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
      // 详情模式下，填充已有数据（如果有）
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
  const idPhotos = collectUrls(row.idFrontUrl, row.idBackUrl, row.idCardPhotoFront, row.idCardPhotoBack);

  return {
    name: formatValue(getFieldValue(row, ['realName', 'name'])),
    birthday: formatValue(birthday),
    idNumber: formatValue(getFieldValue(row, ['idCardNumber'])),
    phone: formatValue(getFieldValue(row, ['contactPhone', 'phone'])),
    address: formatValue(getFieldValue(row, ['contactAddress', 'address'])),
    idPhotos,
    idFrontPhoto: row.idFrontUrl || row.idCardPhotoFront || idPhotos[0] || '',
    idBackPhoto: row.idBackUrl || row.idCardPhotoBack || idPhotos[1] || ''
  };
};

/**
 * 贷款信息
 */
const mapLoanInfo = (row: Record<string, any>) => {
  const repaymentMethod = getFieldValue(row, ['repaymentMethod', 'repaymentType']);
  const repaymentTypeText = repaymentMethod ? getRepaymentMethodLabel(repaymentMethod) : undefined;
  const bankCode = getFieldValue(row, ['collectionBankCode', 'bankCode']);
  const bankLabel = getBankLabel(bankCode);
  const bankDisplay = bankLabel !== '--' ? bankLabel : formatValue(getFieldValue(row, ['collectionBankCode', 'bankName']));

  const amount = row.loanAmount;
  const amountText = amount === undefined || amount === null || amount === '' ? '--' : `${amount} 万元`;
  const cardPhotos = collectUrls(row.bankFrontUrl, row.bankBackUrl, row.bankCardPhotoFront, row.bankCardPhotoBack);

  return {
    applyDate: formatValue(getFieldValue(row, ['createTime', 'applyTime'])),
    amount: amountText,
    period: formatValue(row.loanTerm),
    repaymentType: formatValue(repaymentTypeText),
    bank: bankDisplay,
    bankCardNo: formatValue(getFieldValue(row, ['bankAccountNumber', 'bankCardNo'])),
    cardPhotos,
    cardFrontPhoto: row.bankFrontUrl || row.bankCardPhotoFront || cardPhotos[0] || '',
    cardBackPhoto: row.bankBackUrl || row.bankCardPhotoBack || cardPhotos[1] || ''
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
// 详情模式下始终只读，审批模式下可编辑
const isApprovalReadonly = computed(() => {
  // 如果 mode 是 'approval'，则可编辑（返回 false）
  // 否则（'detail' 或 undefined），则只读（返回 true）
  return props.mode !== 'approval';
});

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

// 详情模式下，待审核状态显示提示
const showApprovalTip = computed(() => !isApprovalMode.value && isPendingStatus.value && !hasCompletedResult.value);

const approvalTipMessage = computed(() => '当前申请状态为待审核，请前往审批流程处理。');

// 审批模式下，待审核或已完成都显示表单；详情模式下，只有已完成才显示表单
const showApprovalForm = computed(() => {
  if (isApprovalMode.value) {
    return isPendingStatus.value || hasCompletedResult.value;
  } else {
    return hasCompletedResult.value;
  }
});

/**
 * 合同文件
 */
const normalizeContractFiles = (row: Record<string, any>) => {
  const baseName = row.contractName || '合同文件';
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

  // 详情模式下清除校验
  nextTick(() => {
    approvalFormRef.value?.clearValidate();
  });
};

/**
 * 重置审批表单
 */
const resetApprovalForm = () => {
  approvalForm.opinion = '';
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

// 监听放款日期变化，重新验证第一期还款日期
watch(
  () => approvalForm.loanDate,
  () => {
    if (approvalForm.firstRepaymentDate && approvalFormRef.value) {
      nextTick(() => {
        approvalFormRef.value?.validateField?.('firstRepaymentDate');
      });
    }
  }
);

// 上传前验证
const beforeUpload = (file: any) => {
  const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(
    file.type
  );

  if (!isValidType) {
    return false;
  }

  // 重复文件拦截（按名称简单判断）
  if (approvalForm.contractFiles.some((f) => (f.fileName || f.name) === file.name)) {
    return false;
  }

  // 文件大小限制（200MB）
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > 200) {
    return false;
  }

  // 限制只能上传一个文件
  if (approvalForm.contractFiles.length >= 1) {
    return false;
  }

  return true;
};

const handleContractUpload = (req: any) =>
  new Promise(async (resolve, reject) => {
    if (isApprovalReadonly.value) {
      req?.onError?.(new Error('仅可查看'));
      return reject(new Error('仅可查看'));
    }

    const rawFile = req.file;
    // 先创建本地预览并标记上传中
    const tempUrl = URL.createObjectURL(rawFile);
    const tempItem: any = {
      fileName: rawFile.name,
      name: rawFile.name,
      displayName: rawFile.name,
      url: tempUrl,
      fileType: '0', // 合同文件类型
      status: 'uploading',
      percentage: 0
    };
    approvalForm.contractFiles = [tempItem];
    try {
      // 大文件：使用分片上传
      if (rawFile.size > MAX_SIZE) {
        const res: any = await uploadByChunks(rawFile, (percent: number) => {
          tempItem.percentage = Math.min(99, Math.max(0, Math.floor(percent)));
          if (typeof req.onProgress === 'function') req.onProgress({ percent });
        });
        tempItem.fileName = res.fileName || rawFile.name;
        tempItem.name = res.fileName || rawFile.name;
        tempItem.displayName = res.fileName || rawFile.name;
        // 保存后端地址到 serverUrl，url 保持本地 blob URL 用于显示
        tempItem.serverUrl = res.url;
        tempItem.ossId = res.ossId;
        tempItem.id = res.ossId;
        tempItem.status = 'success';
        tempItem.percentage = 100;
        approvalForm.contractId = String(res.ossId || '');
        // 强制触发响应更新，避免状态仍显示“上传中”
        approvalForm.contractFiles = [{ ...tempItem }];
        // 清除并重新校验合同字段，移除“请上传合同”提示
        nextTick(() => {
          approvalFormRef.value?.clearValidate?.('contractId');
          approvalFormRef.value?.validateField?.('contractId');
        });
        ElMessage.success('合同上传成功');
        if (typeof req.onSuccess === 'function') req.onSuccess(res);
        return resolve(tempItem);
      }

      // 小文件：FormData 普通上传
      const fd = new FormData();
      fd.append('file', rawFile);
      const response: any = await uploadContractFile(fd);
      const data = response?.data || {};
      const fileName = data.fileName || rawFile.name;
      tempItem.fileName = fileName;
      tempItem.name = fileName;
      tempItem.displayName = fileName;
      // 保存后端地址到 serverUrl，url 保持本地 blob URL 用于显示
      tempItem.serverUrl = data.url;
      tempItem.ossId = data.ossId;
      tempItem.id = data.ossId;
      tempItem.status = 'success';
      tempItem.percentage = 100;
      approvalForm.contractId = String(data.ossId || '');
      // 强制触发响应更新，避免状态仍显示“上传中”
      approvalForm.contractFiles = [{ ...tempItem }];
      // 清除并重新校验合同字段，移除“请上传合同”提示
      nextTick(() => {
        approvalFormRef.value?.clearValidate?.('contractId');
        approvalFormRef.value?.validateField?.('contractId');
      });
      ElMessage.success('合同上传成功');
      if (typeof req.onSuccess === 'function') req.onSuccess(data);
      return resolve(tempItem);
    } catch (error: any) {
      const idx = approvalForm.contractFiles.indexOf(tempItem);
      if (idx > -1) approvalForm.contractFiles.splice(idx, 1);
      approvalForm.contractId = '';
      try {
        URL.revokeObjectURL(tempUrl);
      } catch {}
      if (typeof req.onError === 'function') req.onError(error);
      reject(error);
    }
  });

const handleRemoveFile = async (file?: any) => {
  if (isApprovalReadonly.value) return;

  const fileToRemove = file || approvalForm.contractFiles[0];
  if (!fileToRemove) return;

  if (fileToRemove?.ossId) {
    try {
      await deleteContractFile([fileToRemove.ossId]);
    } catch (error: any) {
      return;
    }
  }

  const idx = approvalForm.contractFiles.findIndex((f) => f.url === fileToRemove.url || f.serverUrl === fileToRemove.serverUrl);
  if (idx > -1) {
    approvalForm.contractFiles.splice(idx, 1);
  }
  // 确保完全清空，避免残留导致校验仍不通过
  approvalForm.contractFiles = [];
  approvalForm.contractId = '';

  // 清理本地 blob URL
  if (fileToRemove?.url && fileToRemove.url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(fileToRemove.url);
    } catch {}
  }

  // 清理校验提示
  nextTick(() => {
    approvalFormRef.value?.clearValidate?.('contractId');
    approvalFormRef.value?.validateField?.('contractId');
  });
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

.drawer-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.detail-section {
  margin-bottom: 20px;
  background: #ffffff;
  // border-radius: 8px;
  padding: 10px 24px;
  border-bottom: 1px dashed #e5e5e5;
  // box-shadow: 0px 4px 10px 0px rgba(0,0,0,0.3);
  // border-radius: 8px 8px 8px 8px;

  &:last-child {
    border-bottom: none;
  }

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

  :deep(.el-form-item__content) {
    justify-content: flex-start;
  }
}

// 审批信息区域的输入框需要背景色
.approval-section {
  :deep(.el-input__wrapper) {
    background-color: #f5f7fa !important;
  }

  :deep(.el-textarea__inner),
  :deep(.el-textarea.is-disabled .el-textarea__inner) {
    background-color: #f5f7fa !important;
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
  margin-left: 11px;
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
  justify-content: right;
  gap: 5px;
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
  // 审批意见文本域样式
  :deep(.el-textarea__inner) {
    background-color: #f5f7fa !important;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    resize: vertical !important;
  }

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

  // 详情模式下，所有字段置灰
  :deep(.el-select.is-disabled),
  :deep(.el-date-editor.is-disabled),
  :deep(.el-select[disabled]),
  :deep(.el-date-editor[disabled]) {
    .el-input__wrapper {
      background-color: #f5f7fa !important;
      cursor: not-allowed;
    }

    .el-input__inner {
      color: #c0c4cc !important;
      cursor: not-allowed;
    }
  }

  // 确保 disabled 状态下的样式
  :deep(.el-select.is-disabled .el-input__wrapper),
  :deep(.el-date-editor.is-disabled .el-input__wrapper) {
    background-color: #f5f7fa !important;
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

<style lang="scss">
.buyer-detail-dialog {
  .el-dialog__header {
    margin-bottom: 0 !important;
    padding-bottom: 10px !important;
    border-bottom: 1px dashed var(--brder-color) !important;
  }
}
</style>
