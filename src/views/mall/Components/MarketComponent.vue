<template>
  <div class="market-container">
    <!-- 面包屑导航 -->
    <!-- <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb-container">
      <el-breadcrumb-item>当前位置</el-breadcrumb-item>
      <el-breadcrumb-item>市场行情</el-breadcrumb-item>
      <el-breadcrumb-item class="active">{{ currentTabLabel }}</el-breadcrumb-item>
    </el-breadcrumb> -->

    <div class="market-tabs">
      <button class="tab-item" :class="{ active: activeName === 'first' }" @click="switchTab('first')">今日行情</button>
      <button class="tab-item" :class="{ active: activeName === 'second' }" @click="switchTab('second')">价格走势</button>
      <button class="tab-item" :class="{ active: activeName === 'third' }" @click="switchTab('third')">价格预测与分析</button>
    </div>

    <div class="tab-content">
      <TodayTrendComponent v-show="activeName === 'first'" ref="todayTrendRef" />
      <PriceTrendComponent v-show="activeName === 'second'" ref="priceTrendRef" />
      <PricePredictionComponent v-show="activeName === 'third'" ref="pricePredictionRef" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import TodayTrendComponent from './AboutMarketComponents/TodayTrendComponent.vue';
import PriceTrendComponent from './AboutMarketComponents/PiceTrendCompontent.vue';
import PricePredictionComponent from './AboutMarketComponents/PricePredictionComponent.vue';
import { eventBus } from '@/utils/eventBus';

const activeName = ref('first');
const todayTrendRef = ref<InstanceType<typeof TodayTrendComponent> | null>(null);
const priceTrendRef = ref<InstanceType<typeof PriceTrendComponent> | null>(null);
const pricePredictionRef = ref<InstanceType<typeof PricePredictionComponent> | null>(null);

const switchTab = (name: string) => {
  if (name === activeName.value) return;
  activeName.value = name;
  refreshCurrentTabData();
};

// 刷新当前标签页的数据
const refreshCurrentTabData = () => {
  // 使用 nextTick 确保组件已经渲染
  nextTick(() => {
    switch (activeName.value) {
      case 'first':
        // 今日行情
        if (todayTrendRef.value && typeof todayTrendRef.value.getList === 'function') {
          todayTrendRef.value.getList();
        }
        break;
      case 'second':
        // 价格走势
        if (priceTrendRef.value && typeof priceTrendRef.value.refreshData === 'function') {
          priceTrendRef.value.refreshData();
        }
        break;
      case 'third':
        // 价格预测与分析
        if (pricePredictionRef.value && typeof pricePredictionRef.value.fetchPricePrediction === 'function') {
          pricePredictionRef.value.fetchPricePrediction();
        }
        break;
    }
  });
};

// 监听标签页切换（只在真正切换时刷新，避免初始化时重复调用）
watch(activeName, (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    refreshCurrentTabData();
  }
});

const handleExternalSwitch = (tabName: string) => {
  if (!tabName) return;
  switchTab(tabName);
};

onMounted(() => {
  eventBus.on('market:switchTab', handleExternalSwitch);
});

onBeforeUnmount(() => {
  try {
    eventBus.off?.('market:switchTab', handleExternalSwitch);
  } catch (error) {
    // ignore
  }
});
</script>

<style scoped lang="scss">
.market-container {
  padding: 12px;
  background-color: #fff;
}

.breadcrumb-container {
  margin-bottom: 16px;
  padding: 8px 0;
  font-size: 14px;

  :deep(.el-breadcrumb__item) {
    .el-breadcrumb__inner {
      color: #606266;

      &.is-link {
        color: #606266;
        font-weight: normal;
      }
    }
  }
}

.market-tabs {
  width: 100%;

  background: #ffffff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 8px 8px;
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  margin-bottom: 16px;

  .tab-item {
    border: none;
    background: transparent;
    padding: 0 20px;
    height: 34px;
    line-height: 34px;
    border-radius: 999px;
    font-size: 14px;
    color: #606266;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .tab-item:hover {
    color: #108c58;
  }

  .tab-item.active {
    background: rgba(16, 140, 88, 0.1);
    color: #108c58;
    font-weight: 600;
    box-shadow: none;
  }
}

.tab-content {
  border-radius: 8px;
  background: #fff;
  box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.1);
  border-radius: 8px 8px 8px 8px;
}
</style>
