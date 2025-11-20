<template>
  <div class="price-prediction-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'

interface Props {
  months: string[]
  pastPrices: number[]
  pastPriceUpper: number[]
  pastPriceLower: number[]
  predictedPrices: number[]
  predictedPriceUpper: number[]
  predictedPriceLower: number[]
  pastHighest: { month: string; price: number }
  pastLowest: { month: string; price: number }
  predictedHighest: { month: string; price: number }
  predictedLowest: { month: string; price: number }
  yAxisMin?: number
  yAxisMax?: number
  yAxisInterval?: number
}

const props = withDefaults(defineProps<Props>(), {
  yAxisMin: 55,
  yAxisMax: 85,
  yAxisInterval: 5
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

// 更新图表
const updateChart = () => {
  if (!chartInstance || !props.months.length) return

  // 构建最高点和最低点数据
  const pastHighestData = props.months.map((m) => (m === props.pastHighest.month ? props.pastHighest.price : null))
  const pastLowestData = props.months.map((m) => (m === props.pastLowest.month ? props.pastLowest.price : null))
  const predictedHighestData = props.months.map((m) =>
    m === props.predictedHighest.month ? props.predictedHighest.price : null
  )
  const predictedLowestData = props.months.map((m) =>
    m === props.predictedLowest.month ? props.predictedLowest.price : null
  )

  const markerLabel = {
    show: true,
    position: 'top',
    fontSize: 12,
    color: '#303133',
    backgroundColor: '#fff',
    borderColor: '#dcdfe6',
    borderWidth: 1,
    borderRadius: 4,
    padding: [2, 6],
    formatter: (params: any) => {
      if (params.value === null || params.value === undefined || params.value === '') return ''
      return Number(params.value).toFixed(2)
    }
  }

  const option = {
    backgroundColor: '#fff', // 图表背景颜色为白色
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: [
        '过往月份价格',
        '过往月份价格区域',
        '预测月份价格',
        '预测月份价格区域',
        '过往月份价格最低点',
        '过往月份价格最高点',
        '预测月份价格最低点',
        '预测月份价格最高点'
      ],
      top: 10,
      textStyle: {
        fontSize: 12
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: props.months,
      name: '时间 (月份)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        fontSize: 12,
        color: '#606266'
      },
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      }
    },
    yAxis: {
      type: 'value',
      name: '价格 (元/斤)',
      nameLocation: 'end',
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
      // 过往月份价格线（蓝色）
      {
        name: '过往月份价格',
        type: 'line',
        data: props.pastPrices,
        lineStyle: {
          width: 2,
          color: '#409eff' // 蓝色
        },
        symbol: 'none',
        smooth: true,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(64, 158, 255, 0.3)' // 浅蓝色渐变起始
            },
            {
              offset: 1,
              color: 'rgba(64, 158, 255, 0)' // 透明渐变结束
            }
          ])
        }
      },
      // 过往月份价格区域（上限）
      {
        name: '过往月份价格区域',
        type: 'line',
        data: props.pastPriceUpper,
        lineStyle: {
          opacity: 0
        },
        stack: 'past',
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.2)' // 浅蓝色区域
        },
        symbol: 'none'
      },
      // 过往月份价格区域（下限）
      {
        name: '过往月份价格区域',
        type: 'line',
        data: props.pastPriceLower,
        lineStyle: {
          opacity: 0
        },
        stack: 'past',
        areaStyle: {
          color: 'rgba(64, 158, 255, 0.2)'
        },
        symbol: 'none'
      },
      // 预测月份价格线（橙色）
      {
        name: '预测月份价格',
        type: 'line',
        data: props.predictedPrices,
        lineStyle: {
          width: 2,
          color: '#FF8C00' // 橙色
        },
        symbol: 'none',
        smooth: true,
        areaStyle: {
          opacity: 0.3,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(255, 140, 0, 0.3)' // 橙色渐变起始
            },
            {
              offset: 1,
              color: 'rgba(255, 140, 0, 0)' // 透明渐变结束
            }
          ])
        }
      },
      // 预测月份价格区域（上限）
      {
        name: '预测月份价格区域',
        type: 'line',
        data: props.predictedPriceUpper,
        lineStyle: {
          opacity: 0
        },
        stack: 'predicted',
        areaStyle: {
          color: 'rgba(255, 140, 0, 0.2)' // 橙色区域
        },
        symbol: 'none'
      },
      // 预测月份价格区域（下限）
      {
        name: '预测月份价格区域',
        type: 'line',
        data: props.predictedPriceLower,
        lineStyle: {
          opacity: 0
        },
        stack: 'predicted',
        areaStyle: {
          color: 'rgba(255, 140, 0, 0.2)'
        },
        symbol: 'none'
      },
      // 过往月份价格最低点（红色）
      {
        name: '过往月份价格最低点',
        type: 'scatter',
        data: pastLowestData,
        symbol: 'circle',
        symbolSize: 14,
        itemStyle: {
          color: '#FF0000',
          borderColor: '#fff',
          borderWidth: 2
        },
        label: markerLabel,
        z: 10 // 确保在最上层
      },
      // 过往月份价格最高点（绿色）
      {
        name: '过往月份价格最高点',
        type: 'scatter',
        data: pastHighestData,
        symbol: 'circle',
        symbolSize: 18,
        itemStyle: {
          color: '#00BB00',
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(0, 187, 0, 0.35)'
        },
        label: markerLabel,
        z: 20
      },
      // 预测月份价格最低点（黄色）
      {
        name: '预测月份价格最低点',
        type: 'scatter',
        data: predictedLowestData,
        symbol: 'circle',
        symbolSize: 14,
        itemStyle: {
          color: '#FFD700',
          borderColor: '#fff',
          borderWidth: 2
        },
        label: markerLabel,
        z: 10
      },
      // 预测月份价格最高点（紫色）
      {
        name: '预测月份价格最高点',
        type: 'scatter',
        data: predictedHighestData,
        symbol: 'circle',
        symbolSize: 18,
        itemStyle: {
          color: '#800080',
          borderColor: '#fff',
          borderWidth: 3,
          shadowBlur: 10,
          shadowColor: 'rgba(128, 0, 128, 0.35)'
        },
        label: markerLabel,
        z: 20
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
  () => [
    props.months,
    props.pastPrices,
    props.predictedPrices,
    props.pastHighest,
    props.pastLowest,
    props.predictedHighest,
    props.predictedLowest
  ],
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
.price-prediction-chart {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chart-container {
    width: 100%;
    height: 100%;
    flex: 1;
    min-height: 0; // 确保 flex 子元素可以缩小
  }
}
</style>

