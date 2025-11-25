<template>
  <el-dialog :model-value="visible" width="900px" class="repayment-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">贷后管理详情（企业）</div>
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
                :src="img.url || img"
                :preview-src-list="companyLicenseList.map((item: any) => item.url || item)"
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
            <template v-else>
              <span>--</span>
            </template>
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
              <el-image
                v-for="(img, idx) in bankCardImages"
                :key="idx"
                :src="img"
                :preview-src-list="bankCardImages"
                class="license-image"
              />
            </template>
            <span v-else>--</span>
          </el-descriptions-item>
        </el-descriptions>
        <div class="product-link">
          <el-button type="primary" plain @click="handleViewProductDetail">查看产品信息</el-button>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">查看合同</div>
        <div class="contract-section">
          <el-button type="primary" @click="handleViewContract">查看合同详情</el-button>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">还款计划</div>
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

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

// ==================== 字典数据 ====================
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { repayment_method } = toRefs<any>(
  proxy?.useDict('repayment_method')
);

// ==================== 状态管理 ====================
const loading = ref(false);
const detailRow = ref<Record<string, any>>(props.data || {});
const currentDetail = computed(() => detailRow.value || {});
const productDetailVisible = ref(false);
const repaymentPlanVisible = ref(false);

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
const formatValue = (value: any) => {
  if (value === undefined || value === null || value === '') return '--';
  return value;
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

const mapValue = (map: Record<string, string>, value: any) => {
  if (value === undefined || value === null || value === '') return '--';
  return map[String(value)] || '--';
};

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

const isLikelyUrl = (value: string) => {
  if (!value) return false;
  const lower = value.toLowerCase();
  return lower.startsWith('http') || lower.startsWith('//') || lower.includes('/');
};

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

const companyInfoList = computed(() => {
  const row = detailRow.value;
  const registerRegion = [row.province, row.city, row.district].filter(Boolean).join('');
  return [
    { label: '供应商编号', value: formatValue(row.enterpriseNumber || row.supplierNo) },
    { label: '审核状态', value: mapValue(reviewStatusMap, row.reviewStatus) },
    { label: '供应商名称', value: formatValue(row.companyName) },
    { label: '社会统一信用代码', value: formatValue(row.licenseNumber || row.creditCode) },
    { label: '注册资本', value: formatValue(row.signUpCapital || row.registeredCapital) },
    { label: '注册日期', value: formatValue(row.createTime || row.registerDate) },
    { label: '注册地址', value: registerRegion ? registerRegion : formatValue(row.registerAddress) },
    { label: '办公地址', value: formatValue(row.officeAddress) },
    { label: '资质等级', value: mapValue(credentialLevelMap, row.credentialLevel || row.qualification) },
    { label: '信用等级', value: mapValue(creditLevelMap, row.creditLevel) },
    { label: '经营范围', value: formatValue(row.businessScope) }
  ];
});

const companyLicenseList = computed(() => {
  const row = detailRow.value;
  const licenses = [];
  
  // 从 licenses 数组获取
  if (Array.isArray(row.licenses)) {
    licenses.push(...row.licenses);
  }
  
  // 从 url 字段获取营业执照
  if (row.url) {
    licenses.push({ url: row.url });
  }
  
  return licenses;
});

const legalInfoList = computed(() => {
  const row = detailRow.value;
  return [
    { label: '法人姓名', value: formatValue(row.legalPersonName || row.legalPerson) },
    { label: '证件类型', value: mapValue(idCardTypeMap, row.legalPersonIdCardType || row.certificateType) },
    { label: '证件号码', value: formatValue(row.legalPersonIdCardNumber || row.certificateNumber || row.legalPersonContactPhone) },
    { label: '联系电话', value: formatValue(row.legalPersonContactPhone || row.phoneNumber) }
  ];
});

const applicantInfoList = computed(() => {
  const row = detailRow.value;
  const birthday = row.birthday || row.birthDate || extractBirthdayFromId(row.idCardNumber || row.idNumber);
  return [
    { label: '申请人', value: formatValue(row.realName || row.applicantName) },
    { label: '出生年月', value: formatValue(birthday) },
    { label: '联系电话', value: formatValue(row.contactPhone || row.phone || row.applicantPhone) }
  ];
});

const applicantIdPhotos = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.idFrontUrl, row.idBackUrl, row.idBackUr, row.idCardUrl, row.idcardUrl, row.idcardUr);
});

const applicantAuthFiles = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.authorizationUrl);
});

const loanInfoList = computed(() => {
  const row = detailRow.value;
  const repayment = row.repaymentMethod || row.repaymentType;
  const repaymentText = repayment ? getRepaymentMethodLabel(repayment) : undefined;
  return [
    { label: '贷款金额', value: formatValue(row.loanAmount) },
    { label: '贷款期限', value: formatValue(row.loanTerm) },
    { label: '还款方式', value: formatValue(repaymentText) },
    { label: '收款银行卡', value: formatValue(row.collectionAccountName || row.bankName) },
    { label: '银行卡号', value: formatValue(row.bankAccountNumber || row.bankCardNo) },
    { label: '申请时间', value: formatValue(row.createTime || row.applyTime) }
  ];
});

const bankCardImages = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.bankFrontUrl, row.bankBackUrl);
});

const handleClose = () => {
  emit('update:visible', false);
};

const handleViewProductDetail = () => {
  if (!currentDetail.value.productId) {
    ElMessage.warning('产品ID不存在');
    return;
  }
  productDetailVisible.value = true;
};

// 处理文件查看
const handleViewFile = (fileUrl: string) => {
  if (!fileUrl) {
    ElMessage.warning('文件地址不存在');
    return;
  }
  window.open(fileUrl, '_blank');
};

const handleViewContract = () => {
  // 从多个可能的位置获取合同地址
  const contractUrl = currentDetail.value?.contractUrl || 
                     currentDetail.value?.contractFileUrl ||
                     props.data?.contractUrl ||
                     props.data?.contractFileUrl;
  
  if (!contractUrl) {
    ElMessage.warning('暂无合同文件');
    return;
  }
  
  // 在新窗口中打开合同地址
  window.open(contractUrl, '_blank');
};

const handleViewRepaymentPlan = () => {
  repaymentPlanVisible.value = true;
};
</script>

<style scoped lang="scss">
.repayment-detail-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.detail-section {
  margin-bottom: 20px;
  background: #fefefe;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
  padding: 16px 20px;
  box-shadow: 0 2px 10px rgba(31, 45, 61, 0.06);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  color: #303133;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background-color: #409eff;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.license-image {
  width: 92px;
  height: 64px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #ebeef5;
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
