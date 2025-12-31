<!--
  标题: creditPlatform/repaymentPlans/RepaymentDetailDialog.vue
  功能: 企业贷后管理详情
  说明: 企业贷后管理详情
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

<template>
  <el-dialog :model-value="visible" width="50%" class="repayment-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">贷后管理详情（企业）</div>
    </template>
    <div v-loading="loading">
      <div class="detail-section">
        <FormHeader title="企业基础信息" />
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col v-for="item in companyInfoListBefore" :key="item.label" :span="item.span || 12">
              <el-form-item :label="item.label">
                <el-input v-if="!item.isTextarea" :model-value="item.value" disabled />
                <el-input v-else type="textarea" :model-value="item.value" :autosize="{ minRows: 2, maxRows: 4 }" disabled />
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
                    :src="img"
                    :preview-src-list="companyLicenseList"
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
                <el-input v-if="!item.isTextarea" :model-value="item.value" disabled />
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
          </el-row>
          <el-row :gutter="20" class="detail-form">
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

      <div class="detail-section" style="padding-bottom: 24px">
        <FormHeader title="查看合同" />
        <div class="contract-section">
          <el-button type="primary" @click="handleViewContract">查看合同详情</el-button>
        </div>
      </div>

      <div class="detail-section">
        <FormHeader title="还款计划" />
        <div class="repayment-section">
          <el-button type="success" @click="handleViewRepaymentPlan">查看还款计划</el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">返回</el-button>
    </template>
    <ProductDetailDialog v-model:visible="productDetailVisible" :product-id="currentDetail.productId" />
    <RepaymentPlanDialog v-model:visible="repaymentPlanVisible" :data="props.data" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { getRemainingDetail, getEnterprise } from '@/api/creditPlatform/loanApplications';
import ProductDetailDialog from '../loanApplications/ProductDetailDialog.vue';
import RepaymentPlanDialog from './RepaymentPlanDialog.vue';
import FormHeader from '@/components/FormHeader/index.vue';

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

// ==================== 字典数据 ====================
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { repayment_method, bank_code } = toRefs<any>(proxy?.useDict('repayment_method', 'bank_code'));

// ==================== 状态管理 ====================
const loading = ref(false);
const detailRow = ref<Record<string, any>>(props.data || {});
const currentDetail = computed(() => detailRow.value || {});
const productDetailVisible = ref(false);
const repaymentPlanVisible = ref(false);

type DetailField = {
  label: string;
  value: string;
  span?: number;
  isTextarea?: boolean;
  isImage?: boolean;
};

const reviewStatusMap: Record<string, string> = {
  '0': '待审核',
  '1': '审核通过',
  '99': '审核退回'
};

const credentialLevelMap: Record<string, string> = {
  '0': '一级认证',
  '1': '二级认证',
  '2': '三级认证'
};

const creditLevelMap: Record<string, string> = {
  '0': '优秀',
  '1': '良好',
  '2': '一般',
  '3': '一般以下',
  '99': '较差'
};

const idCardTypeMap: Record<string, string> = {
  '0': '身份证',
  '1': '护照',
  '2': '其他'
};

// ==================== 常量定义 ====================
// 还款方式备用映射（当字典数据不可用时使用）
const REPAYMENT_METHOD_MAP: Record<string, string> = {
  '0': '等额本息',
  '2': '等额本金',
  '3': '先息后本',
  '4': '先本后息'
};

// ==================== 工具函数 ====================
/**
 * 将空值（undefined、null、空字符串）转换为 '--'，其他值原样返回
 */
const formatValue = (value: any) => {
  if (value === undefined || value === null || value === '') return '--';
  return value;
};

/**
 * 将值格式化为带单位的字符串，空值返回 '--'
 */
const formatWithUnit = (value: any, unit: string) => {
  if (value === undefined || value === null || value === '') return '--';
  return `${value}${unit}`;
};

/**
 * 从字典获取还款方式标签（优先使用字典，否则使用备用映射）
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
 * 根据映射表将值转换为对应的标签，空值或未匹配返回 '--'
 */
const mapValue = (map: Record<string, string>, value: any) => {
  if (value === undefined || value === null || value === '') return '--';
  return map[String(value)] || '--';
};

/**
 * 根据 bank_code 字典获取银行名称
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

/**
 * 从身份证号提取生日
 */
const extractBirthdayFromId = (id: string | undefined | null) => {
  const value = (id || '').trim();
  if (!value) return '';
  if (/^\d{17}[\dXx]$/.test(value)) {
    const birth = value.substring(6, 14);
    const year = birth.substring(0, 4);
    const month = birth.substring(4, 6);
    const day = birth.substring(6, 8);
    return `${year}-${month}-${day}`;
  }
  if (/^\d{15}$/.test(value)) {
    const birth = value.substring(6, 12);
    const year = `19${birth.substring(0, 2)}`;
    const month = birth.substring(2, 4);
    const day = birth.substring(4, 6);
    return `${year}-${month}-${day}`;
  }
  return '';
};

/**
 * 判断是否为URL
 */
const isLikelyUrl = (value: string) => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.startsWith('http') || lower.startsWith('//') || lower.includes('/');
};

/**
 * 收集URL
 * 从多个数据源中提取URL，支持字符串、数组、对象等多种格式
 * 对象中会尝试从 url、fileUrl、path、src 等字段提取
 */
const collectUrls = (...sources: any[]): string[] => {
  const urls: string[] = [];
  const append = (item: any) => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(append);
      return;
    }
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed && isLikelyUrl(trimmed)) urls.push(trimmed);
      return;
    }
    if (typeof item === 'object') {
      const url = (item.url || item.fileUrl || item.path || item.src || '').toString().trim();
      if (url && isLikelyUrl(url)) urls.push(url);
    }
  };
  sources.forEach(append);
  return urls;
};

/**
 * 获取详情数据
 */
const fetchDetail = async () => {
  if (!props.data?.id) {
    detailRow.value = props.data || {};
    return;
  }
  loading.value = true;
  try {
    let merged: Record<string, any> = props.data ? { ...props.data } : {};
    const res = await getRemainingDetail(props.data.id);
    if (res && res.code === 200 && res.data) {
      merged = { ...merged, ...res.data };
    }
    // 获取企业信息
    const lenderId = merged.lenderId;
    if (lenderId) {
      try {
        const extra = await getEnterprise(lenderId);
        if (extra && extra.code === 200 && extra.data) {
          merged = { ...merged, ...extra.data };
        }
      } catch (error) {
        console.error('获取企业信息失败:', error);
      }
    }
    detailRow.value = merged;
  } catch (error) {
    console.error('获取贷后详情失败:', error);
    detailRow.value = props.data || {};
  } finally {
    loading.value = false;
  }
};

watch([() => props.visible, () => props.data?.id], ([visible, id], [prevVisible, prevId]) => {
  if (visible && (!prevVisible || id !== prevId)) {
    fetchDetail();
  }
});

/**
 * 企业基础信息列表
 */
const companyInfoList = computed<DetailField[]>(() => {
  const row = detailRow.value;
  const registerRegion = [row.province, row.city, row.district].filter(Boolean).join('');
  return [
    { label: '供应商编号', value: formatValue(row.enterpriseNumber || row.supplierNo) },
    { label: '审核状态', value: mapValue(reviewStatusMap, row.reviewStatus) },
    { label: '供应商名称', value: formatValue(row.companyName) },
    { label: '社会统一信用代码', value: formatValue(row.licenseNumber || row.creditCode) },
    { label: '注册资本', value: formatValue(row.signUpCapital || row.registeredCapital) },
    { label: '注册日期', value: formatValue(row.createTime || row.registerDate) },
    { label: '资质等级', value: mapValue(credentialLevelMap, row.credentialLevel || row.qualification) },
    { label: '信用等级', value: mapValue(creditLevelMap, row.creditLevel) },
    { label: '经营范围', value: formatValue(row.businessScope), span: 24, isTextarea: true }
  ];
});

// 注册地址、办公地址之前的字段
const companyInfoListBefore = computed<DetailField[]>(() => {
  const row = detailRow.value;
  return [
    { label: '供应商编号', value: formatValue(row.enterpriseNumber || row.supplierNo) },
    { label: '审核状态', value: mapValue(reviewStatusMap, row.reviewStatus) },
    { label: '供应商名称', value: formatValue(row.companyName) },
    { label: '社会统一信用代码', value: formatValue(row.licenseNumber || row.creditCode) },
    { label: '注册资本', value: formatValue(row.signUpCapital || row.registeredCapital) },
    { label: '注册日期', value: formatValue(row.createTime || row.registerDate) }
  ];
});

// 注册地址
const registerAddress = computed(() => {
  const row = detailRow.value;
  const registerRegion = [row.province, row.city, row.district].filter(Boolean).join('');
  return registerRegion || formatValue(row.registerAddress);
});

// 办公地址
const officeAddress = computed(() => {
  const row = detailRow.value;
  return formatValue(row.officeAddress);
});

// 注册地址、办公地址之后的字段
const companyInfoListAfter = computed<DetailField[]>(() => {
  const row = detailRow.value;
  return [
    { label: '资质等级', value: mapValue(credentialLevelMap, row.credentialLevel || row.qualification) },
    { label: '信用等级', value: mapValue(creditLevelMap, row.creditLevel) },
    { label: '经营范围', value: formatValue(row.businessScope), span: 24, isTextarea: true }
  ];
});

/**
 * 企业营业执照图片列表
 */
const companyLicenseList = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.licenses, row.url);
});

/**
 * 法人信息列表
 */
const legalInfoList = computed<DetailField[]>(() => {
  const row = detailRow.value;
  return [
    { label: '法人姓名', value: formatValue(row.legalPersonName || row.legalPerson) },
    { label: '证件类型', value: mapValue(idCardTypeMap, row.legalPersonIdCardType || row.certificateType) },
    { label: '证件号码', value: formatValue(row.legalPersonIdCardNumber || row.certificateNumber || row.legalPersonContactPhone) },
    { label: '联系电话', value: formatValue(row.legalPersonContactPhone || row.phoneNumber) }
  ];
});

/**
 * 申请人相关信息，包括从身份证号提取生日
 */
const applicantInfoList = computed<DetailField[]>(() => {
  const row = detailRow.value;
  const birthday = row.birthday || row.birthDate || extractBirthdayFromId(row.idCardNumber || row.idNumber);
  return [
    { label: '申请人', value: formatValue(row.realName || row.applicantName) },
    { label: '出生年月', value: formatValue(birthday) },
    { label: '联系电话', value: formatValue(row.contactPhone || row.phone || row.applicantPhone) }
  ];
});

/**
 * 申请人身份证照片列表
 */
const applicantIdPhotos = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.idFrontUrl, row.idBackUrl, row.idBackUr, row.idCardUrl, row.idcardUrl, row.idcardUr);
});

const applicantIdFrontPhoto = computed(() => {
  const row = detailRow.value;
  return row.idFrontUrl || row.idCardUrl || applicantIdPhotos.value[0] || '';
});

const applicantIdBackPhoto = computed(() => {
  const row = detailRow.value;
  return row.idBackUrl || row.idBackUr || applicantIdPhotos.value[1] || '';
});

/**
 * 申请人授权文件列表
 */
const applicantAuthFiles = computed(() => {
  const row = detailRow.value;
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

/**
 * 贷款信息列表
 */
const loanInfoList = computed<DetailField[]>(() => {
  const row = detailRow.value;
  const repayment = row.repaymentMethod || row.repaymentType;
  const repaymentText = repayment ? getRepaymentMethodLabel(repayment) : undefined;
  const bankCode = row.collectionBankCode || row.bankCode;
  const bankLabel = getBankLabel(bankCode);
  const bankDisplay = bankLabel !== '--' ? bankLabel : formatValue(row.collectionAccountName || row.bankName);
  return [
    { label: '贷款金额', value: formatWithUnit(row.loanAmount, ' 万元') },
    { label: '贷款期限', value: formatWithUnit(row.loanTerm, ' 期') },
    { label: '还款方式', value: formatValue(repaymentText) },
    { label: '收款银行卡', value: bankDisplay },
    { label: '银行卡号', value: formatValue(row.bankAccountNumber || row.bankCardNo) },
    { label: '申请时间', value: formatValue(row.createTime || row.applyTime) }
  ];
});

/**
 * 银行卡正反面图片列表
 */
const bankCardImages = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.bankFrontUrl, row.bankBackUrl);
});

const bankCardFrontImage = computed(() => {
  const row = detailRow.value;
  return row.bankFrontUrl || bankCardImages.value[0] || '';
});

const bankCardBackImage = computed(() => {
  const row = detailRow.value;
  return row.bankBackUrl || bankCardImages.value[1] || '';
});

/**
 * 关闭对话框
 */
const handleClose = () => {
  emit('update:visible', false);
};

/**
 * 查看产品详情
 */
const handleViewProductDetail = () => {
  if (!currentDetail.value.productId) {
    ElMessage.warning('产品ID不存在');
    return;
  }
  productDetailVisible.value = true;
};

/**
 * 查看文件
 */
const handleViewFile = (fileUrl: string) => {
  if (!fileUrl) {
    ElMessage.warning('文件地址不存在');
    return;
  }
  window.open(fileUrl, '_blank');
};

/**
 * 查看合同
 */
const handleViewContract = () => {
  // 从多个可能的位置获取合同地址
  const contractUrl =
    currentDetail.value?.contractUrl || currentDetail.value?.contractFileUrl || props.data?.contractUrl || props.data?.contractFileUrl;

  if (!contractUrl) {
    ElMessage.warning('暂无合同文件');
    return;
  }

  // 在新窗口中打开合同地址
  window.open(contractUrl, '_blank');
};

/**
 * 查看还款计划
 */
const handleViewRepaymentPlan = () => {
  repaymentPlanVisible.value = true;
};
</script>

<style scoped lang="scss">
.repayment-detail-dialog {
  :deep(.el-dialog__body) {
    background-color: #f7f8fa;
    padding: 24px;
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

  :deep(.el-form-item__label) {
    font-weight: 400;
    font-size: 14px;
    color: rgba(61, 61, 61, 0.5);
  }

  :deep(.el-form-item__content) {
    justify-content: flex-start;
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

.license-image {
  width: 92px;
  height: 64px;
  border-radius: 4px;
  margin-right: 8px;
  margin-left: 11px;
  border: 1px solid #e5e5e5;
  background-color: #ffffff;
}

.license-image-large {
  width: 120px;
  height: 90px;
  border-radius: 4px;
  margin-left: 11px;
  border: 1px solid #e5e5e5;
  background-color: #ffffff;
}

.address-license-row {
  .license-col {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
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

.product-link {
  display: flex;
  justify-content: center;
}

.contract-section,
.repayment-section {
  display: flex;
  justify-content: center;
}
</style>

<style lang="scss">
.repayment-detail-dialog {
  .el-dialog__header {
    margin-bottom: 0 !important;
    padding-bottom: 10px !important;
    border-bottom: 1px dashed var(--brder-color) !important;
  }
}
</style>
