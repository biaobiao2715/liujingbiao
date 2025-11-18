<!--
  标题: index.vue
  功能: 金融首页
  说明: 展示金融相关的首页内容
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-13
-->
<template>
  <div>
    <!-- 导航栏 -->
    <HeaderComponent />
    <!-- 搜索组件 -->
    <SearchComponent />

    <div v-show="showArea === 'area'">
      <!-- banner -->
      <BannerComponent />
      <!-- 贷款产品 -->
      <LoanProductsComponent @detailChange="showDetail" />
      <!-- 保险产品 -->
      <InsuranceproductComponent @detailChange="showDetail" />
      <!-- 风险案例 -->
      <RiskCasesComponent @detailChange="showDetail" />
      <!-- 政策法规 -->
      <PolicyRulesComponent @detailChange="showDetail" />
    </div>

    <div v-if="showArea !== 'area'" class="detail-container">
      <div class="detail-content">
        <!-- 面包屑导航 -->
        <el-breadcrumb :separator-icon="ArrowRight" class="mb-24">
          <el-breadcrumb-item @click="showArea = 'area'" style="cursor: pointer">首页</el-breadcrumb-item>
          <el-breadcrumb-item>{{ secondTitle }}</el-breadcrumb-item>
        </el-breadcrumb>
        <!-- 贷款产品详情 -->
        <AboutLoanProductsComponentDetails v-if="showArea === 'LoanProductsComponentDetails'" :id="id" />
        <!-- 风险案例详情 -->
        <AboutRiskCasesComponentDetails v-if="showArea === 'RiskCasesComponentDetails'" :id="id" />
        <!-- 政策法规详情 -->
        <AboutPolicyRulesComponentDetails v-if="showArea === 'PolicyRulesComponentDetails'" :id="id" />
        <!-- 保险产品详情 -->
        <AboutInsuranceproductComponentDetails v-if="showArea === 'InsuranceproductComponentDetails'" :id="id" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';

import HeaderComponent from './components/HeaderComponent.vue';
import SearchComponent from './components/SearchComponent.vue';
import BannerComponent from './components/BannerComponent.vue';
import LoanProductsComponent from './components/LoanProductsComponent.vue';
import RiskCasesComponent from './components/RiskCasesComponent.vue';
import PolicyRulesComponent from './components/PolicyRulesComponent.vue';
import InsuranceproductComponent from './components/InsuranceproductComponent.vue';

import AboutLoanProductsComponentDetails from './components/AboutLoanProductsComponents/Details.vue'; // 贷款产品详情组件
import AboutPolicyRulesComponentDetails from './components/AboutPolicyRulesComponents/Details.vue'; // 政策法规详情组件
import AboutRiskCasesComponentDetails from './components/AboutRiskCasesComponents/Details.vue'; // 风险案例详情组件
import AboutInsuranceproductComponentDetails from './components/AboutInsuranceproductComponents/Details.vue'; // 保险产品详情组件

const id = ref(null); // 详情ID

const showArea = ref('area');

const secondTitle = computed(() => {
  switch (showArea.value) {
    case 'PolicyRulesComponentDetails':
      return '政策法规详情';
    case 'RiskCasesComponentDetails':
      return '风险案例详情';
    case 'LoanProductsComponentDetails':
      return '贷款产品详情';
    case 'InsuranceproductComponentDetails':
      return '保险产品详情';
    default:
      return '';
  }
});

// 显示详情
const showDetail = (detail) => {
  id.value = detail.id;
  showArea.value = detail.type;
};
</script>

<style scoped lang="scss">
.finance-container {
  // padding: 0 16%;
  min-width: 1400px;
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
