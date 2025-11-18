<template>
  <div class="price-trend-chart">
    <div class="chart-header" v-if="showHeader">
      <h3 class="chart-title">{{ title }}</h3>
      <span class="chart-unit">{{ unit }}</span>
    </div>
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface Props {
  title?: string
  unit?: string
  showHeader?: boolean
  dates: string[]
  prices: number[]
  yAxisMin?: number
  yAxisMax?: number
  yAxisInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  title: '价格走势图',
  unit: '单位: 元/kg',
  showHeader: true,
  yAxisMin: 0,
  yAxisMax: 80,
  yAxisInterval: 15
})

const chartContainer = ref<HTMLElement | null>(null)
let chartInstance: ECharts | null = null

// 初始化图表
const initChart = () => {
  if (!chartContainer.value) return

  chartInstance = echarts.init(chartContainer.value)
  updateChart()
  // 初始化后立即调整大小，确保图表正确显示
  nextTick(() => {
    chartInstance?.resize()
  })
}

// 计算需要显示标签的索引（最多7个）
const MAX_VISIBLE_X_LABELS = 7
const getLabelIndices = (total: number, maxVisible: number) => {
  if (total <= maxVisible) {
    return new Set(Array.from({ length: total }, (_, i) => i))
  }
  const result = new Set<number>()
  const step = (total - 1) / (maxVisible - 1)
  for (let i = 0; i < maxVisible; i++) {
    const index = Math.min(total - 1, Math.floor(i * step))
    result.add(index)
  }
  result.add(total - 1)
  return result
}

// 更新图表
const updateChart = () => {
  if (!chartInstance || !props.dates.length || !props.prices.length) return

  const total = props.dates.length
  const labelIndices = getLabelIndices(total, MAX_VISIBLE_X_LABELS)

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const unit = props.unit.replace('单位: ', '') // 从单位中提取单位文本
        return `${params[0].axisValue}<br/>价格: ${params[0].value} ${unit}`
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#6a7985'
        }
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: props.showHeader ? '10%' : '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.dates,
      axisLabel: {
        fontSize: 12,
        color: '#606266',
        interval: (index: number) => labelIndices.has(index)
      },
      axisTick: {
        alignWithLabel: true,
        interval: (index: number) => labelIndices.has(index)
      },
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: props.unit,
      nameLocation: 'end',
      nameTextStyle: {
        color: '#909399',
        fontSize: 12,
        padding: [0, 0, 0, 10]
      },
      min: props.yAxisMin,
      max: props.yAxisMax,
      interval: props.yAxisInterval,
      axisLabel: {
        fontSize: 12,
        color: '#606266'
      },
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        name: '价格',
        type: 'line',
        smooth: true,
        symbol: (_value: any, params: any) => (labelIndices.has(params.dataIndex) ? 'circle' : 'none'),
        symbolSize: 6,
        lineStyle: {
          width: 2,
          color: '#409eff'
        },
        itemStyle: {
          color: '#409eff',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)'
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0)'
            }
          ])
        },
        data: props.prices
      }
    ]
  }

  chartInstance.setOption(option, true)
}

// 窗口大小变化时调整图表
const resizeChart = () => {
  chartInstance?.resize()
}

// 监听数据变化
watch(
  () => [props.dates, props.prices],
  () => {
    nextTick(() => {
      updateChart()
      // 数据更新后调整大小
      chartInstance?.resize()
    })
  },
  { deep: true }
)

// 使用 ResizeObserver 监听容器大小变化
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  // 使用双重 nextTick 和 requestAnimationFrame 确保容器有正确的尺寸
  nextTick(() => {
    requestAnimationFrame(() => {
      initChart()
      
      // 使用 ResizeObserver 监听容器大小变化
      if (chartContainer.value) {
        resizeObserver = new ResizeObserver(() => {
          chartInstance?.resize()
        })
        resizeObserver.observe(chartContainer.value)
      }
      
      // 再次延迟调整，确保图表正确渲染
      setTimeout(() => {
        chartInstance?.resize()
      }, 100)
    })
  })
  window.addEventListener('resize', resizeChart)
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart)
  if (resizeObserver) {
    resizeObserver.disconnect()
    resizeObserver = null
  }
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped lang="scss">
.price-trend-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    flex-shrink: 0;

    .chart-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
      margin: 0;
    }

    .chart-unit {
      font-size: 12px;
      color: #909399;
    }
  }

  .chart-container {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0; // 确保 flex 子元素可以缩小
  }
}
</style>

