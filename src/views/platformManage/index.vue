<!--
  标题: index.vue
  功能: 平台管理首页
  说明: 平台管理首页，展示平台管理相关的功能模块。
  当前版本: 2.0
  开发信息: Created by 李春雷 2025-10-20, Refactored 2025-11-22
-->

<template>
  <div class="platform-home">
    <h2 class="page-title">农资/农具销售分析</h2>
    <div class="chart-grid">
      <QuantityChart />
      <AmountChart />
    </div>
    <div class="fulfillment-wrapper">
      <FulfillmentChart />
    </div>
  </div>
</template>

<script setup lang="ts">
import QuantityChart from '@/views/platformManage/components/QuantityChart.vue';
import AmountChart from '@/views/platformManage/components/AmountChart.vue';
import FulfillmentChart from '@/views/platformManage/components/FulfillmentChart.vue';
</script>

<style scoped>
.platform-home {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100%;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.fulfillment-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
}

.fulfillment-wrapper :deep(.chart-card) {
  width: 70%;
  min-width: 600px;
  max-width: 1200px;
}
</style>