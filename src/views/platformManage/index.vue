<!--
  标题: index.vue
  功能: 平台管理首页
  说明: 平台管理首页，展示平台管理相关的功能模块。
  当前版本: 2.0
  开发信息: Created by 门世超 2025-10-20, Refactored 2025-11-22
-->

<template>
  <div class="platform-home">
    <div class="title-card">
      <h2 class="page-title">农资/农具销售分析</h2>
    </div>
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
  padding-top: 0;
}

.title-card {
  background: #ffffff;
  padding: 16px 24px;
  margin-bottom: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #108C58;
  margin: 0;
  padding-left: 12px;
  position: relative;
  line-height: 1.4;
}

.page-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background-color: #108C58;
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
