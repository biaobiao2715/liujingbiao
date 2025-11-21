<template>
  <div class="market-container">
    <!-- 面包屑导航 -->
    <!-- <el-breadcrumb :separator-icon="ArrowRight" class="breadcrumb-container">
      <el-breadcrumb-item>当前位置</el-breadcrumb-item>
      <el-breadcrumb-item>市场行情</el-breadcrumb-item>
      <el-breadcrumb-item class="active">{{ currentTabLabel }}</el-breadcrumb-item>
    </el-breadcrumb> -->

    <el-tabs v-model="activeName" type="card" class="market-tabs" @tab-click="handleClick">
      <el-tab-pane label="今日行情" name="first">
        <TodayTrendComponent ref="todayTrendRef" />
      </el-tab-pane>
      <el-tab-pane label="价格走势" name="second">
        <PriceTrendComponent ref="priceTrendRef" />
      </el-tab-pane>
      <el-tab-pane label="价格预测与分析" name="third">
        <PricePredictionComponent ref="pricePredictionRef" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import { ArrowRight } from '@element-plus/icons-vue'
import TodayTrendComponent from './AboutMarketComponents/TodayTrendComponent.vue'
import PriceTrendComponent from './AboutMarketComponents/PiceTrendCompontent.vue'
import PricePredictionComponent from './AboutMarketComponents/PricePredictionComponent.vue'
import { eventBus } from '@/utils/eventBus'

const activeName = ref('first')
const todayTrendRef = ref<InstanceType<typeof TodayTrendComponent> | null>(null)
const priceTrendRef = ref<InstanceType<typeof PriceTrendComponent> | null>(null)
const pricePredictionRef = ref<InstanceType<typeof PricePredictionComponent> | null>(null)

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
  // 切换标签页时刷新对应组件的数据
  refreshCurrentTabData()
}

// 刷新当前标签页的数据
const refreshCurrentTabData = () => {
  // 使用 nextTick 确保组件已经渲染
  nextTick(() => {
    switch (activeName.value) {
      case 'first':
        // 今日行情
        if (todayTrendRef.value && typeof todayTrendRef.value.getList === 'function') {
          todayTrendRef.value.getList()
        }
        break
      case 'second':
        // 价格走势
        if (priceTrendRef.value && typeof priceTrendRef.value.refreshData === 'function') {
          priceTrendRef.value.refreshData()
        }
        break
      case 'third':
        // 价格预测与分析
        if (pricePredictionRef.value && typeof pricePredictionRef.value.fetchPricePrediction === 'function') {
          pricePredictionRef.value.fetchPricePrediction()
        }
        break
    }
  })
}

// 监听标签页切换（只在真正切换时刷新，避免初始化时重复调用）
watch(activeName, (newVal, oldVal) => {
  if (oldVal && newVal !== oldVal) {
    refreshCurrentTabData()
  }
})

const handleExternalSwitch = (tabName: string) => {
  if (!tabName) return
  activeName.value = tabName
  // 外部切换标签页时也会触发 watch，所以这里不需要再次刷新
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
