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
    <div v-show="showArea === 'area'">
      <!-- 搜索组件 -->
      <SearchComponent />
      <!-- banner -->
      <BannerComponent />
      <!-- 贷款产品 -->
      <LoanProductsComponent />
      <!-- 风险案例 -->
      <RiskCasesComponent />
      <!-- 政策法规 -->
      <PolicyRulesComponent />
    </div>

    <div v-if="showArea !== 'area'">
      <!-- 面包屑导航 -->
      <el-breadcrumb :separator-icon="ArrowRight" class="mb-24">
        <el-breadcrumb-item @click="showArea = 'area'" style="cursor: pointer">首页</el-breadcrumb-item>
        <el-breadcrumb-item>{{ secondTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 问答详情 -->
      <QADetailComponent v-if="showArea === 'qaDetail'" :id="id" />
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

const id = ref(null); // 详情ID

const showArea = ref('area');

const secondTitle = computed(() => {
  switch (showArea.value) {
    case 'qaDetail':
      return '问答详情';
    case 'essayDetail':
      return '文章详情';
    case 'courseDetail':
      return '课程详情';
    case 'meetingDetail':
      return '会议详情';
    case 'livingDetail':
      return '直播详情';
    case 'lawContentDetail':
      return '普法内容详情';
    case 'lawActivityDetail':
      return '普法活动详情';
    case 'whitepaperDetail':
      return '普法白皮书详情';
    default:
      return '';
  }
});
</script>

<style scoped lang="scss">
.finance-container {
  // padding: 0 16%;
  min-width: 1400px;
}
</style>
