<!--
  标题: CourseDetailComponent.vue
  功能: 信贷产品详情组件
  说明: 显示保险产品的详细信息，包括保险产品名称、保险产品描述、保险产品图片、保险产品价格、保险产品时长、保险产品讲师等。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->

<template>
  <div>
    <div class="details_title">
      <div class="item-left">
        <div class="item_productName">{{ form?.productName }}</div>
        <dict-text class="item_type" :options="prod_credit_type" :value="form.productType ?? ''" />
        <div class="item_productIntro">{{ form?.productIntro }}</div>
        <div class="kpi-list">
          <div class="kpi-list-li">
            <div class="kpi-list-li-num">{{ form?.maxLoanAmount }}万</div>
            <div class="kpi-list-li-text">最高额度</div>
          </div>
          <div class="kpi-list-li">
            <div class="kpi-list-li-num">{{ form.loanCycle.split(',').pop() }}个月</div>
            <div class="kpi-list-li-text">贷款最长周期</div>
          </div>
          <div class="kpi-list-li">
            <div class="kpi-list-li-num" :class="{ 'kpi-list-li-num--small': !isSingleRepaymentMethod }">
              {{ repaymentMethodDisplay }}
            </div>
            <div class="kpi-list-li-text">还款方式</div>
          </div>
        </div>
      </div>
      <div class="item-right" v-if="addShow">
        <div class="loan-card">
          <div class="loan-card__title">
            <span class="loan-card__title-line"></span>
            <span class="loan-card__title-text">可贷款金额预估</span>
            <span class="loan-card__title-line"></span>
          </div>
          <div class="loan-card__field-label">贷款金额（万元）</div>
          <div class="loan-card__amount-box">
            {{ showAmount ? amountDisplay : '*******' }}
          </div>
          <div class="loan-card__actions">
            <el-button type="primary" class="loan-btn-main" @click="revealAmount">查看可贷金额</el-button>
            <el-button class="loan-btn-outline" plain @click="handleApply">立即申请</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-content detail-content--advantages">
      <div class="detail-content_title">产品优势</div>
      <div class="content-display" v-html="form?.productAdvantages"></div>
    </div>

    <div class="detail-flex">
      <div class="detail-content detail-content--applicable">
        <div class="detail-content_title">适用对象</div>
        <div class="content-display" v-html="form?.applicableInstructions"></div>
      </div>

      <div class="detail-content detail-content--conditions">
        <div class="detail-content_title">申请条件</div>
        <div class="content-display" v-html="form?.applicationInstructions"></div>
      </div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">合作机构</div>
      <div v-if="firstAttachment" class="attachment-item" @click="downloadAttachmentByObj(firstAttachment)">
        <span class="attachment-name">{{ firstAttachment.originalName }}</span>
        <span class="attachment-click">下载</span>
      </div>
      <div v-else class="attachment-empty">暂无附件</div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">产品备注</div>
      <div class="remark">{{ form?.productRemark || '暂无备注' }}</div>
    </div>

    <div style="height: 197px"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { eventBus } from '@/utils/eventBus';
import { getCreditProductsVersionDetailNoTenant, getCreditProductMoney } from '@/api/financeFront/LoanProducts/index';
const props = defineProps({
  id: {
    type: String || Number,
    required: null
  }
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_credit_type, loan_cycle, repayment_method } = toRefs<any>(proxy?.useDict('prod_credit_type', 'loan_cycle', 'repayment_method'));

const form = ref({
  productId: '', // 产品ID
  productVersion: '', // 产品版本号
  productName: '',
  productType: '',
  productIntro: '',
  productAdvantages: '',
  guaranteePlan: '',
  applicationInstructions: '',
  branchOfficeAttachment: '',
  productRemark: '',
  applicableInstructions: '',
  maxLoanAmount: '',
  repaymentMethod: '',
  loanCycle: ''
});

const addShow = ref(true);
const showAmount = ref(false);
const maxAmount = ref('');
const minAmount = ref('');

// 额度展示：若最小值与最大值相同，仅展示一个值，否则展示区间
const amountDisplay = computed(() => {
  const min = String(minAmount.value ?? '').trim();
  const max = String(maxAmount.value ?? '').trim();
  if (!min && !max) return '';
  if (min && max && min === max) return `${max}`;
  if (min && max) return `${min}  ~  ${max}`;
  // 兜底：若只有其中一个
  return `${min || max}`;
});

const revealAmount = () => {
  showAmount.value = !showAmount.value;
};

// 立即申请
const handleApply = () => {
  eventBus.emit('showComponentByCommand', {
    type: 'LoanProductsComponentApplyForm',
    productId: props.id
  });
};

const attachments = computed(() => (form.value as any).ossFileVo || []);
const firstAttachment = computed(() => attachments.value[0] || null);

// 还款方式显示：
// - 当只有一个方式时，使用大号字体
// - 当有多个方式时，按“方式1 | 方式2 | ...”拼接，并使用小号字体
const repaymentMethodList = computed<string[]>(() => {
  const raw = (form.value.repaymentMethod || '').toString();
  if (!raw) return [];
  // 支持以逗号分隔的值列表
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
});

const repaymentMethodMap = computed<Record<string, string>>(() => {
  // 将 `repayment_method` 字典转为 {value: label}
  const dictArr = (repayment_method?.value || []) as Array<{ label?: string; value?: string | number }>;
  const map: Record<string, string> = {};
  dictArr.forEach((item) => {
    const key = String(item.value ?? '');
    const val = String(item.label ?? '');
    if (key) map[key] = val;
  });
  return map;
});

const repaymentMethodDisplay = computed<string>(() => {
  const list = repaymentMethodList.value;
  if (!list.length) return '';
  const map = repaymentMethodMap.value;
  const labels = list.map((code) => map[code] ?? code);
  // 多个时使用 “ | ” 拼接
  return labels.length === 1 ? labels[0] : labels.join(' | ');
});

const isSingleRepaymentMethod = computed<boolean>(() => repaymentMethodList.value.length <= 1);

const downloadAttachmentByObj = async (file?: { originalName?: string; url?: string }) => {
  if (!file?.url) {
    ElMessage.warning('附件不存在或无下载地址');
    return;
  }
  try {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error('网络错误');
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.originalName || '附件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

onMounted(() => {
  getArticleDetail();
  getLoanAmount();
});

// 详情
const getArticleDetail = async () => {
  const res = await getCreditProductsVersionDetailNoTenant(props.id);
  if (res.code === 200) {
    form.value = res.data || {};
  }
};

const getLoanAmount = async () => {
  const res = await getCreditProductMoney(props.id);
  if (res.code === 200) {
    // 保持字符串，避免模板拼接出现 [object Object]
    maxAmount.value = String(res.data.maxAmount ?? '');
    minAmount.value = String(res.data.minAmount ?? '');
  }
};
</script>

<style scoped lang="scss">
.details_title {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  gap: 90px;
  margin-bottom: 20px;
  padding: 40px 30px;
  border-radius: 8px 8px 8px 8px;
  /* 图片在上层，渐变在底层，确保图片可见 */
  background:
    url('@/assets/images/finance/loan-hero-decoration.png') right bottom / 224px 231px no-repeat,
    linear-gradient(319deg, #108c58 0%, rgba(16, 140, 105, 0.76) 100%);
}
.item-left {
  flex: 1 1 auto;
  min-width: 0;
}
.item-right {
  width: 317px;
  // height: 305px;
  border-radius: 8px;
  flex: 0 0 317px;
  padding: 0 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;

  /* 背景优化：保留白色底色 + 分离尺寸，稍作内边距偏移避免紧贴边缘 */
  background: #ffffff url('@/assets/images/finance/loan-card-corner.png') no-repeat right 12px top 12px;
  background-size: 71px 77px;
  /* 视网膜屏细节提升（可选） */
  image-rendering: -webkit-optimize-contrast;
}

/* 贷款卡片内部布局 */
.loan-card {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}
.loan-card__title {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 23px;
}
.loan-card__title-text {
  height: 24px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 20px;
  color: #108c58;
  line-height: 24px;
}
.loan-card__title-line {
  flex: 1 1 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(16, 140, 88, 0.2) 0%, rgba(16, 140, 88, 0.6) 50%, rgba(16, 140, 88, 0.2) 100%);
}
.loan-card__field-label {
  height: 24px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #3d3d3d;
  line-height: 24px;
  margin-bottom: 10px;
}
.loan-card__amount-box {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: #108c58;
  letter-spacing: 0.5px;

  width: 100%;
  height: 32px;
  background: #f7f8fa;
  border-radius: 4px 4px 4px 4px;
  margin-bottom: 43px;
}

.loan-card__actions {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.loan-btn-main {
  flex: 1 1 0;
  background: #108c58;
  border-color: #108c58;
  font-weight: 500;
  height: 32px;
  border-radius: 4px 4px 4px 4px;
}
.loan-btn-main:hover {
  background: #0d7248;
  border-color: #0d7248;
}
.loan-btn-outline {
  flex: 1 1 0;
  font-weight: 500;
  color: #108c58;
  border: 1px solid #108c58;
  background: #ffffff;
  height: 32px;
  border-radius: 4px 4px 4px 4px;
}
.loan-btn-outline:hover {
  background: rgba(16, 140, 88, 0.06);
  color: #0d7248;
  border-color: #0d7248;
}

.item_productName {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 50px;
  color: #ffffff;
  line-height: 69px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 22px;
}

.item_type {
  width: 328px;
  height: 58px;
  line-height: 58px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 30px;
  color: #ffffff;
  text-align: left;
  background: linear-gradient(270deg, rgba(5, 238, 130, 0) 0%, rgba(255, 255, 255, 0.34) 100%);
  border-radius: 0px 0px 0px 0px;
  margin-bottom: 19px;
  padding-left: 20px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.item_productIntro {
  margin-top: 12px;
  font-size: 16px;
  color: #ffffff;
  line-height: 28px;
}

.item-end {
  height: 20px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #3d3d3d;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.detail-flex {
  display: flex;
  gap: 20px;
}

.detail-content {
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  margin-bottom: 20px;
}

/* 右下角背景图（根据需要替换各自的图片路径） */
.detail-content--advantages {
  min-height: 105px;
  background: #ffffff url('@/assets/images/finance/section-advantages-decoration.png') no-repeat right 18px bottom 10px;
  background-size: 85px auto;
}
.detail-content--applicable {
  min-height: 111px;
  background: #ffffff url('@/assets/images/finance/loan-applicable-decoration.png') no-repeat right 0px bottom 0px;
  background-size: 135px 111px auto;
}
.detail-content--conditions {
  min-height: 111px;
  background: #ffffff url('@/assets/images/finance/loan-conditions-decoration.png') no-repeat right 0px bottom 0px;
  background-size: 135px 111px auto;
}

.detail-content_title {
  height: 24px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
  line-height: 24px;
  display: flex;
  align-items: center;
}

.detail-content_title::before {
  content: '';
  display: inline-block;
  width: 2px;
  height: 10px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 4px;
}

.remark {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #3d3d3d;
  line-height: 24px;
}

/* 三等分指标区域（白色分隔线） */
.kpi-list {
  display: flex;
  align-items: center;
  width: 100%;
  margin-top: 24px;
  color: #ffffff;
}
.kpi-list-li {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 86px;
}
.kpi-list-li:not(:last-child) {
  position: relative;
}
.kpi-list-li:not(:last-child)::after {
  content: '';
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 1px;
  height: 40px; /* 依据设计稿大致高度，可再微调 */
  background: rgba(255, 255, 255, 0.9);
}
.kpi-list-li-num {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 30px;
  color: #ffffff;
  height: 41px;
  line-height: 41px;
  margin-bottom: 10px;
  white-space: nowrap;
}
.kpi-list-li-num--small {
  font-size: 20px;
  line-height: 41px;
}
.kpi-list-li-text {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
  height: 22px;
  line-height: 22px;
}

/* 优化最后一列（还款方式）左侧与白色分隔线的视觉间距 */
.kpi-list-li:last-child .kpi-list-li-num,
.kpi-list-li:last-child .kpi-list-li-text {
  padding-left: 12px;
}

.attachment-item {
  display: inline-flex; /* 允许宽度随内容撑开 */
  align-items: center; /* 垂直居中 "下载" */
  width: fit-content; /* 根据内容自适应宽度 */
  max-width: 100%; /* 避免超出父容器 */
  padding: 8px 16px; /* 内边距 */
  margin-top: 15px;
  background: #f6f7fb;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #3d3d3d;
  box-sizing: border-box;
  min-height: 36px;
}

.attachment-name {
  flex: 0 1 auto; /* 不强制占满，跟随内容 */
  word-break: break-all; /* 避免超长不换行导致溢出 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 20px;
}

.attachment-click {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
  cursor: pointer;
  margin-left: 58px;
}

.content-display {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  line-height: 1.8;
  min-height: 400px;

  :deep(img) {
    max-width: 100%;
    height: auto;
  }

  :deep(p) {
    margin-bottom: 1em;
  }

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4),
  :deep(h5),
  :deep(h6) {
    margin-top: 1.5em;
    margin-bottom: 0.8em;
    font-weight: 600;
  }
}
</style>
