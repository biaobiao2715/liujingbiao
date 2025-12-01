<template>
  <el-dialog :model-value="visible" width="900px" class="loan-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">{{ dialogTitle }}</div>
    </template>
    <div v-loading="loading">
      <div class="detail-section">
        <div class="section-title">企业基础信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in companyInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
          <el-descriptions-item label="营业执照">
            <template v-if="companyLicenseList.length">
              <el-image
                v-for="(img, idx) in companyLicenseList"
                :key="idx"
                :src="img.url"
                :preview-src-list="companyLicenseList"
                fit="cover"
                class="license-image"
              />
            </template>
            <span v-else>--</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">法人信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in legalInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">申请人信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in applicantInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
          <el-descriptions-item label="个人身份证明" :span="2">
            <template v-if="applicantIdPhotos.length">
              <el-image v-for="(img, idx) in applicantIdPhotos" :key="idx" :src="img" :preview-src-list="applicantIdPhotos" class="license-image" />
            </template>
            <span v-else>--</span>
          </el-descriptions-item>
          <el-descriptions-item label="授权文件" :span="2">
            <template v-if="applicantAuthFiles.length">
              <div v-for="(file, idx) in applicantAuthFiles" :key="idx" class="file-item">
                <el-button 
                  type="primary" 
                  link 
                  @click="handleViewFile(file)"
                  class="file-link"
                >
                  <el-icon><Document /></el-icon>
                  授权文件{{ applicantAuthFiles.length > 1 ? (idx + 1) : '' }}
                </el-button>
              </div>
            </template>
            <div v-else class="file-placeholder">暂无文件</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">贷款信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in loanInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
          <el-descriptions-item label="银行卡正反面" :span="2">
            <template v-if="bankCardImages.length">
              <el-image v-for="(img, idx) in bankCardImages" :key="idx" :src="img" :preview-src-list="bankCardImages" class="license-image" />
            </template>
            <span v-else>--</span>
          </el-descriptions-item>
        </el-descriptions>
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
          <el-form-item label="审批意见" prop="opinion">
            <el-select v-model="approvalForm.opinion" :disabled="isApprovalReadonly">
              <el-option label="同意" value="agree" />
              <el-option label="不同意" value="reject" />
            </el-select>
          </el-form-item>
          <el-form-item label="放款日期" prop="loanDate" :required="approvalForm.opinion !== 'reject'">
            <el-date-picker v-model="approvalForm.loanDate" type="date" placeholder="选择日期" style="width: 100%" :disabled="isApprovalReadonly" />
          </el-form-item>
          <el-form-item
            label="第一期还款日期"
            prop="firstRepaymentDate"
            :required="approvalForm.opinion !== 'reject'"
          >
            <el-date-picker
              v-model="approvalForm.firstRepaymentDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              :disabled="isApprovalReadonly"
            />
          </el-form-item>
          <el-form-item label="贷款合同" prop="contractId" class="contract-field" :required="approvalForm.opinion !== 'reject'">
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
import { computed, reactive, watch, ref, nextTick, getCurrentInstance, toRefs } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Document } from '@element-plus/icons-vue';
import { getRemainingDetail, getEnterprise, auditLoanApplication, uploadFile } from '@/api/creditPlatform/loanApplications';
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

// ==================== 字典数据 ====================
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { repayment_method, review_status } = toRefs<any>(
  proxy?.useDict('repayment_method', 'review_status')
);

// ==================== 状态管理 ====================
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
  return (_rule: any, value: any, callback: (error?: Error) => void) => {
    if (approvalForm.opinion === 'reject') {
      callback();
      return;
    }
    if (value === undefined || value === null || value === '') {
      callback(new Error(message));
    } else {
      callback();
    }
  };
};
const submittingApproval = ref(false);
const contractUploading = ref(false);
const currentApprovalAction = ref<'agree' | 'reject' | null>(null);

// ==================== 常量定义 ====================
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
  opinion: [{ required: true, message: '请选择审批意见', trigger: 'change' }],
  loanDate: [
    { validator: createConditionalRequiredValidator('请选择放款日期'), trigger: 'change' }
  ],
  firstRepaymentDate: [
    { validator: createConditionalRequiredValidator('请选择第一期还款日期'), trigger: 'change' }
  ],
  contractId: [
    { validator: createConditionalRequiredValidator('请上传贷款合同'), trigger: 'change' }
  ]
};

// ==================== 工具函数 ====================
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

// ==================== 数据获取 ====================
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
      merged = { ...merged, ...res.data };
    }
    
    // 获取企业信息
    const lenderId = merged.lenderId;
    if (lenderId) {
      try {
        const extra = await getEnterprise(lenderId);
        if (extra?.code === 200 && extra.data) {
          merged = { ...merged, ...extra.data };
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
const mapCompanyInfo = (row: Record<string, any>) => {
  const registerRegion = [row.province, row.city, row.district].filter(Boolean).join('');
  
  return [
    { label: '供应商编号', value: formatValue(getFieldValue(row, ['enterpriseNumber', 'supplierNo'])) },
    { label: '审核状态', value: mapValue(REVIEW_STATUS_MAP, row.reviewStatus) },
    { label: '供应商名称', value: formatValue(row.companyName) },
    { label: '社会统一信用代码', value: formatValue(getFieldValue(row, ['licenseNumber', 'creditCode'])) },
    { label: '注册资本', value: formatValue(getFieldValue(row, ['signUpCapital', 'registeredCapital'])) },
    { label: '注册日期', value: formatValue(getFieldValue(row, ['createTime', 'registerDate'])) },
    { label: '注册地址', value: registerRegion || formatValue(row.registerAddress) },
    { label: '办公地址', value: formatValue(row.officeAddress) },
    { label: '资质等级', value: mapValue(CREDENTIAL_LEVEL_MAP, getFieldValue(row, ['credentialLevel', 'qualification'])) },
    { label: '信用等级', value: mapValue(CREDIT_LEVEL_MAP, row.creditLevel) },
    { label: '经营范围', value: formatValue(row.businessScope) }
  ];
};

/**
 * 映射法人信息
 */
const mapLegalInfo = (row: Record<string, any>) => {
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
const mapApplicantInfo = (row: Record<string, any>) => {
  const birthday = getFieldValue(row, ['birthday', 'birthDate']) || 
                   extractBirthdayFromId(getFieldValue(row, ['idCardNumber', 'idNumber']));
  
  return [
    { label: '申请人', value: formatValue(getFieldValue(row, ['realName', 'applicantName'])) },
    { label: '出生年月', value: formatValue(birthday) },
    { label: '联系电话', value: formatValue(getFieldValue(row, ['contactPhone', 'phone', 'applicantPhone'])) }
  ];
};

/**
 * 映射贷款信息
 */
const mapLoanInfo = (row: Record<string, any>) => {
  const repayment = getFieldValue(row, ['repaymentMethod', 'repaymentType']);
  const repaymentText = repayment ? getRepaymentMethodLabel(repayment) : undefined;
  
  return [
    { label: '贷款金额', value: formatValue(row.loanAmount) },
    { label: '贷款期限', value: formatValue(row.loanTerm) },
    { label: '还款方式', value: formatValue(repaymentText) },
    { label: '收款银行卡', value: formatValue(getFieldValue(row, ['collectionAccountName', 'bankName'])) },
    { label: '银行卡号', value: formatValue(getFieldValue(row, ['bankAccountNumber', 'bankCardNo'])) },
    { label: '申请时间', value: formatValue(getFieldValue(row, ['createTime', 'applyTime'])) }
  ];
};

// ==================== 计算属性 ====================
const currentDetail = computed(() => detailData.value || {});

const companyInfoList = computed(() => mapCompanyInfo(detailData.value || {}));

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

const applicantAuthFiles = computed(() => {
  const row = detailData.value || {};
  return collectUrls(row.authorizationUrl);
});

const loanInfoList = computed(() => mapLoanInfo(detailData.value || {}));

const bankCardImages = computed(() => {
  const row = detailData.value || {};
  return collectUrls(row.bankFrontUrl, row.bankBackUrl);
});

const dialogTitle = computed(() => {
  return props.mode === 'approval' ? '企业贷款申请审核' : '贷款申请详情（企业）';
});

const isApprovalMode = computed(() => props.mode === 'approval');
const isApprovalReadonly = computed(() => !isApprovalMode.value);
const isApproveAgree = computed(() => approvalForm.opinion === 'agree');

const isPendingStatus = computed(() => {
  const status = detailData.value?.applyStatus;
  if (status !== undefined && status !== null && status !== '') {
    if (PENDING_STATUS_CODES.has(String(status))) {
      return true;
    }
  }
  const label = getApplyStatusLabel(status) || 
                detailData.value?.applyStatusName || 
                detailData.value?.applyStatusLabel || '';
  const labelText = String(label);
  return labelText.includes('待审') || labelText.includes('待审核');
});

const hasCompletedResult = computed(() => {
  const status = detailData.value?.applyStatus;
  return status === '2' || status === '3';
});

const showApprovalTip = computed(() => 
  !isApprovalMode.value && isPendingStatus.value && !hasCompletedResult.value
);

const approvalTipMessage = computed(() => 
  '当前申请状态为待审核，请前往审批流程处理。'
);

const showApprovalForm = computed(() => 
  (isApprovalMode.value && !hasCompletedResult.value) || 
  (!isApprovalMode.value && hasCompletedResult.value)
);

// ==================== 审批表单处理 ====================
/**
 * 规范化合同文件
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
 * 填充审批表单
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

// ==================== 监听器 ====================
watch(
  [() => props.visible, () => props.data?.id],
  ([visible, id], [prevVisible, prevId]) => {
    if (visible && (!prevVisible || id !== prevId)) {
      fetchDetail();
    }
  }
);

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

const handleContractUpload = async (options: any) => {
  if (isApprovalReadonly.value) {
    options?.onError?.(new Error('仅可查看'));
    return;
  }
  const formData = new FormData();
  formData.append('file', options.file);
  contractUploading.value = true;
  try {
    const res = await uploadFile(formData);
    if (res && res.code === 200 && res.data) {
      const resData = res.data;
      const fileInfo = {
        name: resData.fileName || resData.originalFilename || options.file.name,
        url: resData.url || resData.fileUrl || resData.path,
        id: resData.contractId || resData.ossId || resData.id || resData.fileId || '',
        ossId: resData.ossId
      };
      if (!fileInfo.url) {
        throw new Error('上传返回结果缺少文件地址');
      }
      approvalForm.contractFiles = [fileInfo];
      approvalForm.contractId = String(fileInfo.ossId || fileInfo.id || '');
      approvalFormRef.value?.validateField?.('contractId');
      options.onSuccess?.(res, options.file);
      ElMessage.success('合同上传成功');
    } else {
      throw new Error(res?.msg || '合同上传失败');
    }
  } catch (error: any) {
    options.onError?.(error);
    ElMessage.error(error?.message || '合同上传失败');
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
    const backendMessage =
      responseData?.msg || error?.msg || error?.message || responseData?.message;
    const isCancelledError =
       backendMessage?.includes('该贷款申请已取消，不能进行审核');
    if (!isCancelledError) {
      ElMessage.error(backendMessage || '审批提交失败');
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
    background-color: #F7F8FA;
    padding: 24px;
  }

  

  :deep(.el-descriptions) {
    background-color: transparent;
    
    .el-descriptions__label {
      background-color: #FAFAFA;
      color: #606266;
      font-weight: 500;
    }
    
    .el-descriptions__content {
      background-color: #ffffff;
      color: #303133;
    }
    
    .el-descriptions__table {
      border: 1px solid #E5E5E5;
    }
    
    .el-descriptions__table td,
    .el-descriptions__table th {
      border: 1px solid #E5E5E5;
    }
  }
}

.detail-section {
  margin-bottom: 20px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #E5E5E5;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  color: #303133;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background-color: #108C58;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.license-image {
  width: 92px;
  height: 64px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #E5E5E5;
  background-color: #ffffff;
}

.image-placeholder,
.card-placeholder {
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

</style>
