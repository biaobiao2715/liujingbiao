<template>
  <div class="market-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb-container">
      <el-breadcrumb-item>当前位置</el-breadcrumb-item>
      <el-breadcrumb-item>市场行情</el-breadcrumb-item>
      <el-breadcrumb-item class="active">{{ currentTabLabel }}</el-breadcrumb-item>
    </el-breadcrumb>

    <el-tabs v-model="activeName" type="card" class="market-tabs" @tab-click="handleClick">
      <el-tab-pane label="今日行情" name="first">
        <TodayTrendComponent />
      </el-tab-pane>
      <el-tab-pane label="价格走势" name="second">
        <PriceTrendComponent />
      </el-tab-pane>
      <el-tab-pane label="价格预测与分析" name="third">
        <PricePredictionComponent />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import TodayTrendComponent from './AboutMarketComponents/TodayTrendComponent.vue'
import PriceTrendComponent from './AboutMarketComponents/PiceTrendCompontent.vue'
import PricePredictionComponent from './AboutMarketComponents/PricePredictionComponent.vue'
import { eventBus } from '@/utils/eventBus'

const activeName = ref('first')

// 标签页名称映射
const tabLabelMap = {
  first: '今日行情',
  second: '价格走势',
  third: '价格预测与分析'
}

// 当前标签页名称（用于面包屑）
const currentTabLabel = computed(() => {
  return tabLabelMap[activeName.value as keyof typeof tabLabelMap] || '今日行情'
})

// 标签页切换
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}

const handleExternalSwitch = (tabName: string) => {
  if (!tabName) return
  activeName.value = tabName
}

onMounted(() => {
  eventBus.on('market:switchTab', handleExternalSwitch)
})

onBeforeUnmount(() => {
  try {
    eventBus.off?.('market:switchTab', handleExternalSwitch)
  } catch (error) {
    // ignore
  }
})
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
  :deep(.el-tabs__header) {
    margin-bottom: 16px;
  }

  :deep(.el-tabs__item) {
    padding: 0 20px;
    height: 40px;
    line-height: 40px;
  }
}

</style>
