<!--
  标题: creditPlatform/loanApplications/LoanApplicationDetailDialog.vue
  功能: 企业贷款申请详情
  说明: 企业贷款申请详情
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

<template>
  <el-dialog :model-value="visible" width="50%" class="loan-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">{{ dialogTitle }}</div>
    </template>
    <div v-loading="loading">
      <div class="detail-section">
        <FormHeader title="企业基础信息" />
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col v-for="item in companyInfoListBefore" :key="item.label" :span="12">
              <el-form-item :label="item.label">
                <template v-if="item.color">
                  <span :style="{ color: item.color }" style="margin-top: 4px; margin-left: 10px">{{ item.value }}</span>
                </template>
                <el-input v-else :model-value="item.value" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 注册地址、办公地址（左）和 营业执照（右，占两行高度） -->
          <el-row :gutter="20" class="detail-form address-license-row">
            <el-col :span="12">
              <el-form-item label="注册地址">
                <el-input :model-value="registerAddress" disabled />
              </el-form-item>
              <el-form-item label="办公地址">
                <el-input :model-value="officeAddress" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12" class="license-col">
              <el-form-item label="营业执照">
                <template v-if="companyLicenseList.length">
                  <el-image
                    v-for="(img, idx) in companyLicenseList"
                    :key="idx"
                    :src="img.url"
                    :preview-src-list="companyLicenseList.map((i) => i.url)"
                    :initial-index="idx"
                    fit="cover"
                    class="license-image-large"
                  />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="detail-form">
            <el-col v-for="item in companyInfoListAfter" :key="item.label" :span="item.span || 12">
              <el-form-item :label="item.label">
                <template v-if="item.color">
                  <span :style="{ color: item.color }" style="margin-top: 4px; margin-left: 10px">{{ item.value }}</span>
                </template>
                <el-input v-else-if="!item.isTextarea" :model-value="item.value" disabled />
                <el-input v-else type="textarea" :model-value="item.value" :autosize="{ minRows: 2, maxRows: 4 }" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="detail-section">
        <FormHeader title="法人信息" />
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col v-for="item in legalInfoList" :key="item.label" :span="item.span || 12">
              <el-form-item :label="item.label">
                <el-input :model-value="item.value" disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="detail-section">
        <FormHeader title="申请人信息" />
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col v-for="item in applicantInfoList" :key="item.label" :span="item.span || 12">
              <el-form-item :label="item.label">
                <el-input :model-value="item.value" disabled />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="身份证正面">
                <template v-if="applicantIdFrontPhoto">
                  <el-image :src="applicantIdFrontPhoto" :preview-src-list="applicantIdPhotos" :initial-index="0" class="license-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证反面">
                <template v-if="applicantIdBackPhoto">
                  <el-image :src="applicantIdBackPhoto" :preview-src-list="applicantIdPhotos" :initial-index="1" class="license-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="detail-form">
            <el-col :span="24">
              <el-form-item label="授权文件">
                <template v-if="applicantAuthFiles.length">
                  <div v-for="(file, idx) in applicantAuthFiles" :key="idx" class="file-item">
                    <el-button type="primary" link @click="handleViewFile(typeof file === 'string' ? file : file.url)" class="file-link">
                      <el-icon><Document /></el-icon>
                      {{ typeof file === 'string' ? `授权文件${applicantAuthFiles.length > 1 ? idx + 1 : ''}` : file.name }}
                    </el-button>
                  </div>
                </template>
                <div v-else class="file-placeholder">暂无文件</div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="detail-section">
        <FormHeader title="贷款信息" />
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col v-for="item in loanInfoList" :key="item.label" :span="item.span || 12">
              <el-form-item :label="item.label">
                <el-input :model-value="item.value" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡正面">
                <template v-if="bankCardFrontImage">
                  <el-image :src="bankCardFrontImage" :preview-src-list="bankCardImages" :initial-index="0" class="license-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡反面">
                <template v-if="bankCardBackImage">
                  <el-image :src="bankCardBackImage" :preview-src-list="bankCardImages" :initial-index="1" class="license-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="产品详情">
                <el-button type="primary" style="margin-left: 11px" @click="handleViewProductDetail">查看</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="detail-section approval-section">
        <FormHeader title="审批信息" />
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
            <el-input
              v-model="approvalForm.opinion"
              type="textarea"
              placeholder="请输入..."
              :disabled="isApprovalReadonly"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </el-form-item>
          <el-row :gutter="20" style="margin-top: 18px">
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
import { computed, reactive, watch, ref, nextTick, getCurrentInstance, toRefs } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Document, Loading } from '@element-plus/icons-vue';
import {
  getRemainingDetail,
  getEnterprise,
  auditLoanApplication,
  uploadFile as uploadContractFile,
  deleteFile as deleteContractFile
} from '@/api/creditPlatform/loanApplications';
import { uploadByChunks } from '@/utils/chunkUpload';
import ProductDetailDialog from './ProductDetailDialog.vue';
import FormHeader from '@/components/FormHeader/index.vue';

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

// ==================== 字典数据 ====================
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

// ==================== 状态管理 ====================
const loading = ref(false);
const detailData = ref<Record<string, any>>({});
const productDetailVisible = ref(false);

const approvalFormRef = ref<FormInstance>();
const approvalForm = reactive({
  opinion: '',
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
const currentApprovalAction = ref<'agree' | 'reject' | null>(null);

const REVIEW_STATUS_MAP: Record<string, string> = {
  '0': '待审核',
  '1': '审核通过',
  '99': '审核退回'
};

const CREDENTIAL_LEVEL_MAP: Record<string, string> = {
  '0': '一级认证',
  '1': '二级认证',
  '2': '三级认证'
};

const CREDIT_LEVEL_MAP: Record<string, string> = {
  '0': '优秀',
  '1': '良好',
  '2': '一般',
  '3': '一般以下',
  '99': '较差'
};

// 申请状态备用映射（当字典数据不可用时使用）
const APPLY_STATUS_MAP: Record<string, string> = {
  '0': '待审核',
  '1': '待审核',
  '2': '审批通过',
  '3': '审批驳回',
  '99': '审批异常'
};

const ID_CARD_TYPE_MAP: Record<string, string> = {
  '0': '身份证',
  '1': '护照',
  '2': '其他'
};

// 还款方式备用映射（当字典数据不可用时使用）
const REPAYMENT_METHOD_MAP: Record<string, string> = {
  '0': '等额本息',
  '2': '等额本金',
  '3': '先息后本',
  '4': '先本后息'
};

const PENDING_STATUS_CODES = new Set(['0', '1']);

const approvalRules: FormRules = {
  opinion: [{ required: true, message: '请输入审核意见', trigger: 'blur' }],
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
 * 映射值到对应文本
 */
const mapValue = (map: Record<string, string>, value: any): string => {
  if (value === undefined || value === null || value === '') return '--';
  return map[String(value)] || '--';
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
 * 获取字段值（支持多个备选字段名）
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
 * 从字典获取标签（优先使用字典，否则使用备用映射）
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
 * 从字典获取银行名称
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
    // 获取申请详情
    const res = await getRemainingDetail(props.data.id);

    let merged: Record<string, any> = props.data ? { ...props.data } : {};

    if (res?.code === 200 && res.data) {
      merged = {
        ...merged,
        ...res.data,
        createTime: res.data.createTime
      };
    }

    // 获取企业信息
    const lenderId = merged.lenderId;
    if (lenderId) {
      try {
        const extra = await getEnterprise(lenderId);

        if (extra?.code === 200 && extra.data) {
          merged = {
            ...extra.data,
            ...merged,
            enterpriseCreateTime: extra.data.createTime // 企业注册时间单独存储
          };
        }
      } catch (error) {
        console.error('获取企业信息失败:', error);
      }
    }

    detailData.value = merged;

    // 初始化审批表单
    if (props.mode === 'approval') {
      resetApprovalForm();
    } else {
      // 详情模式下，填充已有数据
      hydrateApprovalForm(merged);
    }
  } catch (error) {
    console.error('获取申请详情失败:', error);
    detailData.value = props.data || {};
  } finally {
    loading.value = false;
  }
};

// ==================== 数据映射 ====================
/**
 * 映射企业基础信息
 */
type DetailField = {
  label: string;
  value: string;
  span?: number;
  isTextarea?: boolean;
  isImage?: boolean;
};

// 注册地址、办公地址之前的字段
const companyInfoListBefore = computed(() => {
  const row = detailData.value || {};
  const reviewStatusValue = mapValue(REVIEW_STATUS_MAP, row.reviewStatus);
  const getReviewStatusColor = (status: string | undefined) => {
    if (status === '0') return '#FF7B00'; // 待审核
    if (status === '1') return '#108C58'; // 审核通过
    if (status === '99') return '#F23255'; // 审核退回
    return undefined;
  };
  const reviewStatusColor = getReviewStatusColor(row.reviewStatus);
  return [
    { label: '供应商编号', value: formatValue(getFieldValue(row, ['enterpriseNumber', 'supplierNo'])) },
    { label: '审核状态', value: reviewStatusValue, color: reviewStatusColor },
    { label: '供应商名称', value: formatValue(row.companyName) },
    { label: '社会统一信用代码', value: formatValue(getFieldValue(row, ['licenseNumber', 'creditCode'])) },
    { label: '注册资本', value: formatValue(getFieldValue(row, ['signUpCapital', 'registeredCapital'])) },
    { label: '注册日期', value: formatValue(getFieldValue(row, ['enterpriseCreateTime', 'registerDate'])) }
  ];
});

// 注册地址
const registerAddress = computed(() => {
  const row = detailData.value || {};
  const registerRegion = [row.province, row.city, row.district].filter(Boolean).join('');
  return registerRegion || formatValue(row.registerAddress);
});

// 办公地址
const officeAddress = computed(() => {
  const row = detailData.value || {};
  return formatValue(row.officeAddress);
});

// 注册地址、办公地址之后的字段
const companyInfoListAfter = computed(() => {
  const row = detailData.value || {};
  const credentialLevel = getFieldValue(row, ['credentialLevel', 'qualification']);
  const getCredentialLevelColor = (level: string | undefined) => {
    if (level === '0') return '#108C58';
    if (level === '1') return '#008CFF';
    if (level === '2') return '#FF7B00';
    return undefined;
  };
  return [
    { label: '资质等级', value: mapValue(CREDENTIAL_LEVEL_MAP, credentialLevel), color: getCredentialLevelColor(credentialLevel) },
    { label: '信用等级', value: mapValue(CREDIT_LEVEL_MAP, row.creditLevel) },
    { label: '经营范围', value: formatValue(row.businessScope), span: 24, isTextarea: true }
  ];
});

/**
 * 映射法人信息
 */
const mapLegalInfo = (row: Record<string, any>): DetailField[] => {
  return [
    { label: '法人姓名', value: formatValue(getFieldValue(row, ['legalPersonName', 'legalPerson'])) },
    { label: '证件类型', value: mapValue(ID_CARD_TYPE_MAP, getFieldValue(row, ['legalPersonIdCardType', 'certificateType'])) },
    { label: '证件号码', value: formatValue(getFieldValue(row, ['legalPersonIdCardNumber', 'certificateNumber', 'legalPersonContactPhone'])) },
    { label: '联系电话', value: formatValue(getFieldValue(row, ['legalPersonContactPhone', 'phoneNumber'])) }
  ];
};

/**
 * 映射申请人信息
 */
const mapApplicantInfo = (row: Record<string, any>): DetailField[] => {
  const birthday = getFieldValue(row, ['birthday', 'birthDate']) || extractBirthdayFromId(getFieldValue(row, ['idCardNumber', 'idNumber']));

  return [
    { label: '申请人', value: formatValue(getFieldValue(row, ['realName', 'applicantName'])) },
    { label: '出生年月', value: formatValue(birthday) },
    { label: '联系电话', value: formatValue(getFieldValue(row, ['contactPhone', 'phone', 'applicantPhone'])) }
  ];
};

/**
 * 映射贷款信息
 */
const mapLoanInfo = (row: Record<string, any>): DetailField[] => {
  const repayment = getFieldValue(row, ['repaymentMethod', 'repaymentType']);
  const repaymentText = repayment ? getRepaymentMethodLabel(repayment) : undefined;
  const bankCode = getFieldValue(row, ['collectionBankCode', 'bankCode']);
  const bankLabel = getBankLabel(bankCode);
  const bankDisplay = bankLabel !== '--' ? bankLabel : formatValue(getFieldValue(row, ['collectionAccountName', 'bankName']));

  const amount = row.loanAmount;
  const amountText = amount === undefined || amount === null || amount === '' ? '--' : `${amount} 万元`;

  return [
    { label: '贷款金额', value: amountText },
    { label: '贷款期限', value: row.loanTerm ? `${row.loanTerm} 期` : '--' },
    { label: '还款方式', value: formatValue(repaymentText) },
    { label: '收款银行卡', value: bankDisplay },
    { label: '银行卡号', value: formatValue(getFieldValue(row, ['bankAccountNumber', 'bankCardNo'])) },
    { label: '申请时间', value: formatValue(row.createTime) }
  ];
};

// ==================== 计算属性 ====================
const currentDetail = computed(() => detailData.value || {});

const companyLicenseList = computed(() => {
  const row = detailData.value || {};
  const licenses = [];

  if (Array.isArray(row.licenses)) {
    licenses.push(...row.licenses);
  }

  if (row.url) {
    licenses.push({ url: row.url });
  }

  return licenses;
});

const legalInfoList = computed(() => mapLegalInfo(detailData.value || {}));

const applicantInfoList = computed(() => mapApplicantInfo(detailData.value || {}));

const applicantIdPhotos = computed(() => {
  const row = detailData.value || {};
  return collectUrls(row.idFrontUrl, row.idBackUrl, row.idBackUr, row.idCardUrl, row.idcardUrl, row.idcardUr);
});

const applicantIdFrontPhoto = computed(() => {
  const row = detailData.value || {};
  return row.idFrontUrl || row.idCardUrl || applicantIdPhotos.value[0] || '';
});

const applicantIdBackPhoto = computed(() => {
  const row = detailData.value || {};
  return row.idBackUrl || row.idBackUr || applicantIdPhotos.value[1] || '';
});

const applicantAuthFiles = computed(() => {
  const row = detailData.value || {};
  const urls = collectUrls(row.authorizationUrl);
  const fileName = row.authorizationFileName;

  // 如果有文件名，返回包含文件名和URL的对象数组
  if (fileName && urls.length > 0) {
    return urls.map((url, idx) => ({
      url,
      name: urls.length === 1 ? fileName : `${fileName}${idx + 1}`
    }));
  }

  // 如果没有文件名，返回URL数组
  return urls;
});

const loanInfoList = computed(() => mapLoanInfo(detailData.value || {}));

const bankCardImages = computed(() => {
  const row = detailData.value || {};
  return collectUrls(row.bankFrontUrl, row.bankBackUrl);
});

const bankCardFrontImage = computed(() => {
  const row = detailData.value || {};
  return row.bankFrontUrl || bankCardImages.value[0] || '';
});

const bankCardBackImage = computed(() => {
  const row = detailData.value || {};
  return row.bankBackUrl || bankCardImages.value[1] || '';
});

const dialogTitle = computed(() => {
  return props.mode === 'approval' ? '企业贷款申请审核' : '贷款申请详情（企业）';
});
const isApprovalMode = computed(() => props.mode === 'approval');
// 详情模式下始终只读，审批模式下可编辑
const isApprovalReadonly = computed(() => {
  return props.mode !== 'approval';
});

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

// ==================== 审批表单处理 ====================
/**
 * 规范化合同文件
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
 * 填充审批表单
 */
const hydrateApprovalForm = (row: Record<string, any>) => {
  approvalForm.loanDate = row.loanDate || '';
  approvalForm.firstRepaymentDate = row.firstRepaymentDate || '';
  approvalForm.contractId = row.contractId || '';
  approvalForm.opinion = row.reviewNotes || '';

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
  approvalForm.loanDate = '';
  approvalForm.firstRepaymentDate = '';
  approvalForm.contractId = '';
  approvalForm.contractFiles = [];
  currentApprovalAction.value = null;
  nextTick(() => {
    approvalFormRef.value?.clearValidate();
  });
};

// ==================== 监听器 ====================
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

// 监听放款日期变化，如果第一期还款日在放款日期之前或同一天则清空
watch(
  () => approvalForm.loanDate,
  (newLoanDate) => {
    if (newLoanDate && approvalForm.firstRepaymentDate) {
      const loanDate = new Date(newLoanDate);
      loanDate.setHours(0, 0, 0, 0);
      const firstRepaymentDate = new Date(approvalForm.firstRepaymentDate);
      firstRepaymentDate.setHours(0, 0, 0, 0);
      if (firstRepaymentDate.getTime() <= loanDate.getTime()) {
        approvalForm.firstRepaymentDate = '';
      }
    }
  }
);

// ==================== 事件处理 ====================
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
  await nextTick();
  try {
    if (action === 'reject') {
      // 驳回只校验审批意见
      await approvalFormRef.value?.validateField('opinion');
    } else {
      // 通过校验所有字段
      await approvalFormRef.value?.validate();
    }
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
      reviewNotes: approvalForm.opinion,
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
</script>

<style scoped lang="scss">
.no-wrap-label {
  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}
.loan-detail-dialog {
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
  border-bottom: 1px dashed #e5e5e5;

  &:last-child {
    border-bottom: none;
  }

  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    background-color: transparent !important;
    cursor: default !important;
    resize: none !important;
  }

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

  :deep(.el-form-item__label),
  :deep(.el-descriptions__label) {
    font-weight: 400;
    font-size: 14px;
    color: rgba(61, 61, 61, 0.5);
  }

  :deep(.el-form-item__content) {
    justify-content: flex-start;
  }

  :deep(.el-descriptions__content) {
    font-weight: 400;
    font-size: 14px;
    color: #3d3d3d;
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

  .tips {
    margin-bottom: 16px;
  }
}

.license-image {
  width: 92px;
  height: 64px;
  border-radius: 4px;
  margin-right: 8px;
  margin-left: 11px;
  border: 1px solid #e5e5e5;
  background-color: #ffffff;

  :deep(img) {
    object-fit: cover;
  }
}

.license-image-large {
  width: 120px;
  height: 90px;
  border-radius: 4px;
  margin-left: 11px;
  border: 1px solid #e5e5e5;
  background-color: #ffffff;

  :deep(img) {
    object-fit: cover;
  }
}

.address-license-row {
  .license-col {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
}

.approval-actions {
  margin-top: 32px;
  display: flex;
  justify-content: right;
}

.contract-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contract-files-view {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.file-item {
  margin-bottom: 8px;
}

.file-link {
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

.file-placeholder {
  color: #909399;
  font-size: 14px;
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
    margin-top: 10px;
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

  :deep(.el-form-item__error) {
    padding-top: 10px;
  }
}
</style>

<style lang="scss">
.loan-detail-dialog {
  .el-dialog__header {
    border-bottom: 1px dashed var(--brder-color) !important;
    margin-bottom: 0 !important;
    padding-bottom: 10px !important;
  }
}
</style>
