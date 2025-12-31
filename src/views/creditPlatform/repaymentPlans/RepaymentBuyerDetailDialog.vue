<!--
  标题: creditPlatform/repaymentPlans/RepaymentBuyerDetailDialog.vue
  功能: 个人贷后管理详情
  说明: 个人贷后管理详情
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

<template>
  <el-dialog
    :model-value="visible"
    width="50%"
    class="buyer-repayment-detail-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-title">贷后管理详情（个人）</div>
    </template>
    <div v-loading="loading">
      <div class="detail-section">
        <FormHeader title="用户信息" />
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="姓名">
                <el-input :model-value="detail.user.name" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="出生年月">
                <el-input :model-value="detail.user.birthday" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号">
                <el-input :model-value="detail.user.idNumber" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="手机号">
                <el-input :model-value="detail.user.phone" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="联系地址">
                <el-input :model-value="detail.user.address" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证正面">
                <template v-if="detail.user.idFrontPhoto">
                  <el-image :src="detail.user.idFrontPhoto" :preview-src-list="detail.user.idPhotos" :initial-index="0" class="identity-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证反面">
                <template v-if="detail.user.idBackPhoto">
                  <el-image :src="detail.user.idBackPhoto" :preview-src-list="detail.user.idPhotos" :initial-index="1" class="identity-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>

      <div class="detail-section">
        <FormHeader title="贷款信息" />
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="申请日期">
                <el-input :model-value="detail.loan.applyDate" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="贷款金额">
                <el-input :model-value="detail.loan.amount === '--' ? '--' : `${detail.loan.amount} 万元`" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="还款周期">
                <el-input :model-value="detail.loan.period ? `${detail.loan.period} 期` : ''" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="还款方式">
                <el-input :model-value="detail.loan.repaymentType" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="收款卡银行">
                <el-input :model-value="detail.loan.bank" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡号">
                <el-input :model-value="detail.loan.bankCardNo" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡正面">
                <template v-if="detail.loan.cardFrontPhoto">
                  <el-image :src="detail.loan.cardFrontPhoto" :preview-src-list="detail.loan.cardPhotos" :initial-index="0" class="identity-image" />
                </template>
                <span v-else>--</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="银行卡反面">
                <template v-if="detail.loan.cardBackPhoto">
                  <el-image :src="detail.loan.cardBackPhoto" :preview-src-list="detail.loan.cardPhotos" :initial-index="1" class="identity-image" />
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

      <div class="detail-section">
        <el-form label-width="140px">
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="合同信息">
                <el-button type="primary" style="margin-left: 11px" @click="handleViewContract">查看</el-button>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20" class="detail-form">
            <el-col :span="12">
              <el-form-item label="还款计划">
                <el-button type="primary" style="margin-left: 11px" @click="handleViewRepaymentPlan">查看</el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
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
import { getRemainingDetail } from '@/api/creditPlatform/loanApplications';
import ProductDetailDialog from '../loanApplications/ProductDetailDialog.vue';
import RepaymentPlanDialog from './RepaymentPlanDialog.vue';
import FormHeader from '@/components/FormHeader/index.vue';

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{ (event: 'update:visible', payload: boolean): void }>();

// ==================== 字典数据 ====================
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { repayment_method, bank_code } = toRefs<any>(proxy?.useDict('repayment_method', 'bank_code'));

// ==================== 状态管理 ====================
const loading = ref(false);
const detailRow = ref<Record<string, any>>(props.data || {});
const currentDetail = computed(() => detailRow.value || {});
const productDetailVisible = ref(false);
const repaymentPlanVisible = ref(false);

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

// ==================== 工具函数 ====================
/**
 * 将空值（undefined、null、空字符串）转换为 '--'，其他值原样返回
 */
const fallback = (value: any) => {
  if (value === undefined || value === null || value === '') return '--';
  return value;
};

// 还款方式备用映射（当字典数据不可用时使用）
const REPAYMENT_METHOD_MAP: Record<string, string> = {
  '0': '等额本息',
  '2': '等额本金',
  '3': '先息后本',
  '4': '先本后息'
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

// ==================== 计算属性 ====================
/**
 * 用户信息和贷款信息，包括从身份证号提取生日、获取还款方式标签、银行名称等
 */
const detail = computed(() => {
  const row = detailRow.value || {};
  const birthday = row.birthday || row.birthDate || extractBirthdayFromId(row.idCardNumber || row.idNumber);
  const repaymentMethod = row.repaymentMethod || row.repaymentType;
  const repaymentTypeText = repaymentMethod ? getRepaymentMethodLabel(repaymentMethod) : undefined;
  const bankCode = row.collectionBankCode || row.bankCode;
  const bankLabel = getBankLabel(bankCode);
  const bankDisplay = bankLabel !== '--' ? bankLabel : fallback(row.collectionBankCode || row.bankName);
  const idPhotos = collectUrls(row.idFrontUrl, row.idBackUrl, row.idCardPhotoFront, row.idCardPhotoBack);
  const cardPhotos = collectUrls(row.bankFrontUrl, row.bankBackUrl, row.bankCardPhotoFront, row.bankCardPhotoBack);

  return {
    user: {
      name: fallback(row.realName || row.name),
      birthday: fallback(birthday),
      idNumber: fallback(row.idCardNumber),
      phone: fallback(row.contactPhone || row.phone),
      address: fallback(row.contactAddress || row.address),
      idPhotos,
      idFrontPhoto: row.idFrontUrl || row.idCardPhotoFront || idPhotos[0] || '',
      idBackPhoto: row.idBackUrl || row.idCardPhotoBack || idPhotos[1] || ''
    },
    loan: {
      applyDate: fallback(row.createTime || row.applyTime),
      amount: fallback(row.loanAmount),
      period: fallback(row.loanTerm),
      repaymentType: fallback(repaymentTypeText),
      bank: bankDisplay,
      bankCardNo: fallback(row.bankAccountNumber || row.bankCardNo),
      cardPhotos,
      cardFrontPhoto: row.bankFrontUrl || row.bankCardPhotoFront || cardPhotos[0] || '',
      cardBackPhoto: row.bankBackUrl || row.bankCardPhotoBack || cardPhotos[1] || ''
    }
  };
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
.buyer-repayment-detail-dialog {
  :deep(.el-dialog__body) {
    background-color: #f7f8fa;
    padding: 24px;
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

  :deep(.el-form-item__label) {
    font-weight: 400;
    font-size: 14px;
    color: rgba(61, 61, 61, 0.5);
  }

  :deep(.el-form-item__content) {
    justify-content: flex-start;
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
</style>

<style lang="scss">
.buyer-repayment-detail-dialog {
  .el-dialog__header {
    margin-bottom: 0 !important;
    padding-bottom: 10px !important;
    border-bottom: 1px dashed var(--brder-color) !important;
  }
}
</style>
