<!--
  标题: index.vue
  功能: 金融首页
  说明: 展示金融相关的首页内容
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-13
-->
<template>
  <div class="finance-container">
    <!-- 导航栏 -->
    <HeaderComponent />
    <!-- 搜索组件 -->
    <SearchComponent />

    <div v-show="showArea === 'area'">
      <!-- banner -->
      <BannerComponent />
      <!-- 贷款产品 -->
      <LoanProductsComponent />
      <el-row>
        <el-col :span="16">
          <!-- 保险产品 -->
          <InsuranceproductComponent />
        </el-col>
        <el-col :span="8">
          <!-- 风险案例 -->
          <RiskCasesComponent />
        </el-col>
      </el-row>

      <!-- 政策法规 -->
      <PolicyRulesComponent />
    </div>

    <div v-if="showArea !== 'area'" class="detail-container">
      <!-- detail-container 设置背景颜色  detail-content 设置宽度 -->
      <div class="detail-content">
        <!-- 面包屑导航 -->
        <el-breadcrumb :separator-icon="ArrowRight" class="mb-24">
          <el-breadcrumb-item @click="showArea = 'area'" style="cursor: pointer">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ secondTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 信贷产品列表 -->
        <AboutLoanProductsComponentList v-if="showArea === 'LoanProductsComponentList'" />
        <!-- 信贷产品详情 -->
        <AboutLoanProductsComponentDetails v-if="showArea === 'LoanProductsComponentDetails'" :id="id" />
        <!-- 信贷产品申请表单 -->
        <AboutLoanProductsComponentApplyForm v-if="showArea === 'LoanProductsComponentApplyForm'" :id="id" />
        <!-- 保险产品列表 -->
        <AboutInsuranceproductComponentList v-if="showArea === 'InsuranceproductComponentList'" />
        <!-- 保险产品详情 -->
        <AboutInsuranceproductComponentDetails v-if="showArea === 'InsuranceproductComponentDetails'" :id="id" />
        <!-- 风险案例列表 -->
        <AboutRiskCasesComponentList v-if="showArea === 'RiskCasesComponentList'" />
        <!-- 风险案例详情 -->
        <AboutRiskCasesComponentDetails v-if="showArea === 'RiskCasesComponentDetails'" :id="id" />
        <!-- 政策法规列表 -->
        <AboutPolicyRulesComponentList v-if="showArea === 'PolicyRulesComponentList'" />
        <!-- 政策法规详情 -->
        <AboutPolicyRulesComponentDetails v-if="showArea === 'PolicyRulesComponentDetails'" :id="id" />
        <!-- 个人中心 -->
        <PersonalCenterComponent v-if="showArea === 'PersonalCenter'" :activeTab="personalActivityTab" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';

import HeaderComponent from './components/HeaderComponent.vue';
import SearchComponent from './components/SearchComponent.vue';
import BannerComponent from './components/BannerComponent.vue';
import LoanProductsComponent from './components/LoanProductsComponent.vue';
import RiskCasesComponent from './components/RiskCasesComponent.vue';
import PolicyRulesComponent from './components/PolicyRulesComponent.vue';
import InsuranceproductComponent from './components/InsuranceproductComponent.vue';
import { eventBus } from '@/utils/eventBus';

// 详情相关组件按需异步加载，减少首屏体积
const AboutLoanProductsComponentList = defineAsyncComponent(() => import('./components/AboutLoanProductsComponents/list.vue')); // 信贷产品列表组件
const AboutLoanProductsComponentDetails = defineAsyncComponent(() => import('./components/AboutLoanProductsComponents/Details.vue')); // 信贷产品详情组件
const AboutLoanProductsComponentApplyForm = defineAsyncComponent(() => import('./components/AboutLoanProductsComponents/ApplyForm.vue')); // 信贷产品申请表单组件
const AboutInsuranceproductComponentList = defineAsyncComponent(() => import('./components/AboutInsuranceproductComponents/list.vue')); // 保险产品列表组件
const AboutInsuranceproductComponentDetails = defineAsyncComponent(() => import('./components/AboutInsuranceproductComponents/Details.vue')); // 保险产品详情组件
const AboutRiskCasesComponentList = defineAsyncComponent(() => import('./components/AboutRiskCasesComponents/list.vue')); // 风险案例列表组件
const AboutRiskCasesComponentDetails = defineAsyncComponent(() => import('./components/AboutRiskCasesComponents/Details.vue')); // 风险案例详情组件
const AboutPolicyRulesComponentList = defineAsyncComponent(() => import('./components/AboutPolicyRulesComponents/list.vue')); // 政策法规列表组件
const AboutPolicyRulesComponentDetails = defineAsyncComponent(() => import('./components/AboutPolicyRulesComponents/Details.vue')); // 政策法规详情组件
const PersonalCenterComponent = defineAsyncComponent(() => import('./components/PersonalCenter/index.vue')); // 个人中心组件
// 类型定义
type DetailView =
  | 'area'
  | 'LoanProductsComponentList'
  | 'LoanProductsComponentDetails'
  | 'LoanProductsComponentApplyForm'
  | 'InsuranceproductComponentList'
  | 'InsuranceproductComponentDetails'
  | 'RiskCasesComponentList'
  | 'RiskCasesComponentDetails'
  | 'PolicyRulesComponentList'
  | 'PolicyRulesComponentDetails'
  | 'PersonalCenter';

interface DetailPayload {
  id: string | number;
  type: Exclude<DetailView, 'area'>;
}

const id = ref<string>(''); // 详情ID统一为字符串，便于下游组件类型一致

const showArea = ref<DetailView>('area');

const personalActivityTab = ref('');

const TITLE_MAP: Record<Exclude<DetailView, 'area'>, string> = {
  LoanProductsComponentList: '信贷产品列表',
  LoanProductsComponentDetails: '信贷产品详情',
  LoanProductsComponentApplyForm: '申请信贷产品',
  InsuranceproductComponentList: '保险产品列表',
  InsuranceproductComponentDetails: '保险产品详情',
  RiskCasesComponentList: '风险案例列表',
  RiskCasesComponentDetails: '风险案例详情',
  PolicyRulesComponentList: '政策法规列表',
  PolicyRulesComponentDetails: '政策法规详情',
  PersonalCenter: '个人中心'
};

const secondTitle = computed(() => (showArea.value === 'area' ? '' : TITLE_MAP[showArea.value]));

onMounted(() => {
  eventBus.on('showComponentByCommand', (data: any) => {
    showArea.value = data.type;
    id.value = data?.id;
    personalActivityTab.value = data.command;
  });
});
</script>

<style scoped lang="scss">
.finance-container {
  // padding: 0 16%;
  min-width: 1400px;
  background-color: #f6f7fb;
}

.detail-container {
  background: #f6f7fb;
}

.detail-content {
  width: 1495px;
  margin: 0 auto;
}

.mb-24 {
  height: 21px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #7c7c7c;
  line-height: 21px;
  padding: 10px 0;
}
</style>
