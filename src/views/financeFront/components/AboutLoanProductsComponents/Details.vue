<!--
  标题: CourseDetailComponent.vue
  功能: 保险产品详情组件
  说明: 显示保险产品的详细信息，包括保险产品名称、保险产品描述、保险产品图片、保险产品价格、保险产品时长、保险产品讲师等。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->

<template>
  <div>
    <div class="details_title">
      <div class="item-left">
        <div class="item_productName">{{ form?.productName }}fffff</div>
        <dict-text class="item_type" :options="product_insurance_type" :value="form.productType ?? ''" />
        <div class="item_productIntro">{{ form?.productIntro }}</div>
        <div class="kpi-list">
          <div class="kpi-list-li">
            <div class="kpi-list-li-num">500万</div>
            <div class="kpi-list-li-text">最高额度</div>
          </div>
          <div class="kpi-list-li">
            <div class="kpi-list-li-num">500万</div>
            <div class="kpi-list-li-text">最高额度</div>
          </div>
          <div class="kpi-list-li">
            <div class="kpi-list-li-num">500万</div>
            <div class="kpi-list-li-text">最高额度</div>
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
            {{ showAmount ? estimatedAmount : '*******' }}
          </div>
          <div class="loan-card__actions">
            <el-button type="primary" class="loan-btn-main" @click="revealAmount">查看可贷金额</el-button>
            <el-button class="loan-btn-outline" plain @click="handleApply">立即申请</el-button>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">保险特点</div>
      <div v-html="form?.productAdvantages"></div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">保障计划</div>
      <div v-html="form?.guaranteePlan"></div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">申请条件</div>
      <div v-html="form?.applicationInstructions"></div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">网点清单</div>
      <div>{{ form.branchOfficeAttachment }}</div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">产品备注</div>
      <div class="remark">{{ form?.productRemark }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { eventBus } from '@/utils/eventBus';
import { getInsuranceProductsVersion } from '@/api/financeFront/Insuranceproduct/index';
const props = defineProps({
  id: {
    type: String || Number,
    required: null
  }
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { product_insurance_type } = toRefs<any>(proxy?.useDict('product_insurance_type'));

const form = ref({
  productName: '',
  productType: '',
  productIntro: '',
  productAdvantages: '',
  guaranteePlan: '',
  applicationInstructions: '',
  branchOfficeAttachment: '',
  productRemark: ''
});
const addShow = ref(true);
const showAmount = ref(false);
const estimatedAmount = ref('100.56');

const revealAmount = () => {
  showAmount.value = !showAmount.value;
};

// 立即申请
const handleApply = () => {
  eventBus.emit('showComponentByCommand', { type: 'LoanProductsComponentEdit' });
};

onMounted(() => {
  getArticleDetail();
});

// 详情
const getArticleDetail = async () => {
  const res = await getInsuranceProductsVersion(props.id);
  if (res.code === 200) {
    form.value = res.data || {};
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
  background: linear-gradient(319deg, #108c58 0%, rgba(16, 140, 105, 0.76) 100%);
}
.item-left {
  flex: 1 1 auto;
  min-width: 0;
}
.item-right {
  width: 317px;
  height: 305px;
  background: #ffffff;
  border-radius: 8px;
  flex: 0 0 317px;
  padding: 0 20px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 394px;
  height: 69px;
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
  font-style: normal;
  text-transform: none;
  background: linear-gradient(270deg, rgba(5, 238, 130, 0) 0%, rgba(255, 255, 255, 0.34) 100%);
  border-radius: 0px 0px 0px 0px;
  margin-bottom: 19px;
  padding-left: 20px;
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

.detail-content {
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  margin-bottom: 20px;
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
}
.kpi-list-li-text {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 16px;
  color: #ffffff;
  height: 22px;
  line-height: 22px;
}
</style>
