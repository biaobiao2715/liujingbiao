<!--
  标题: index.vue
  功能: 金融首页
  说明: 展示金融相关的首页内容
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-13
-->
<template>
  <div class="finance-container">
    <HeaderComponent />
    <SearchComponent />
    <BannerComponent />
    <LoanProductsComponent />
    <RiskCasesComponent />
    <PolicyRulesComponent />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import HeaderComponent from './components/HeaderComponent.vue';
import SearchComponent from './components/SearchComponent.vue';
import BannerComponent from './components/BannerComponent.vue';
import LoanProductsComponent from './components/BannerComponent.vue';
import RiskCasesComponent from './components/RiskCasesComponent.vue';
import PolicyRulesComponent from './components/PolicyRulesComponent.vue';
</script>

<style scoped lang="scss">
.finance-container {
  // padding: 0 16%;
  min-width: 1400px;
}
</style>
