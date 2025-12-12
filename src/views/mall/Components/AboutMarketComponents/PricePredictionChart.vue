<!-- 价格预测与分析图表 -->

<template>
  <div class="price-prediction-chart">
    <div ref="chartContainer" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import historicalMinIcon from '@/assets/images/marketConditions/gwMin.png';
import historicalMaxIcon from '@/assets/images/marketConditions/gwMax.png';
import predictedMinIcon from '@/assets/images/marketConditions/ycMin.png';
import predictedMaxIcon from '@/assets/images/marketConditions/ycMax.png';

interface Props {
  historicalMonths: string[];
  historicalPrices: number[];
  predictedMonths: string[];
  predictedPrices: number[];
  yAxisMin?: number;
  yAxisMax?: number;
  yAxisInterval?: number;
}

const props = withDefaults(defineProps<Props>(), {
  yAxisMin: 55,
  yAxisMax: 85,
  yAxisInterval: 5
});

const chartContainer = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;

const normalizeMonthLabel = (value: any) => {
  if (value === undefined || value === null) return '';
  const str = String(value).trim();
  if (!str) return '';
  if (str.includes('-')) {
    const [year, month] = str.split('-');
    const safeMonth = (month || '').padStart(2, '0');
    return `${year}-${safeMonth}`;
  }
  if (str.includes('/')) {
    const [year, month] = str.split('/');
    const safeMonth = (month || '').padStart(2, '0');
    return `${year}-${safeMonth}`;
  }
  return str;
};

const normalizeMonths = (months?: string[]) => (months || []).map((m) => normalizeMonthLabel(m)).filter((label) => !!label);

const buildAxis = (history: string[], predicted: string[]) => {
  const uniqueHistory = history || [];
  const uniquePredicted = predicted || [];
  return [...uniqueHistory, ...uniquePredicted.filter((m) => !uniqueHistory.includes(m))];
};

const buildSeriesData = (axis: string[], months: string[], values: number[]) => {
  const map = new Map<string, number>();
  months.forEach((m, idx) => {
    if (values[idx] !== undefined && values[idx] !== null) {
      const val = Number(values[idx]);
      if (!Number.isNaN(val)) {
        map.set(m, val);
      }
    }
  });
  return axis.map((m) => {
    const val = map.get(m);
    return val !== undefined ? val : null;
  });
};

const buildScatterData = (axis: string[], months: string[], values: number[], type: 'max' | 'min') => {
  if (!months?.length || !values?.length) return axis.map(() => null);

  const map = new Map<string, number>();
  months.forEach((m, idx) => {
    const val = Number(values[idx]);
    if (!Number.isNaN(val)) map.set(m, val);
  });

  if (!map.size) return axis.map(() => null);

  const comparator = type === 'max' ? Math.max : Math.min;
  const extreme = comparator(...Array.from(map.values()));

  // - 最低点：如果有多个，取最前面一个
  // - 最高点：如果有多个，取最后面一个
  let targetIndex = -1;
  if (type === 'min') {
    for (let i = 0; i < axis.length; i++) {
      const label = axis[i];
      const val = map.get(label);
      if (val === undefined) continue;
      if (val === extreme) {
        targetIndex = i;
        break;
      }
    }
  } else {
    for (let i = axis.length - 1; i >= 0; i--) {
      const label = axis[i];
      const val = map.get(label);
      if (val === undefined) continue;
      if (val === extreme) {
        targetIndex = i;
        break;
      }
    }
  }

  if (targetIndex === -1) return axis.map(() => null);

  return axis.map((label, idx) => {
    if (idx !== targetIndex) return null;
    const val = map.get(label);
    return val !== undefined ? val : null;
  });
};

const initChart = () => {
  if (!chartContainer.value) return;
  chartInstance = echarts.init(chartContainer.value);
  updateChart();
  nextTick(() => chartInstance?.resize());
};

// 检查数据是否有效（非全0且有实际数据）
const hasValidData = (values: number[]) => {
  if (!values?.length) return false;
  return values.some((v) => typeof v === 'number' && v > 0);
};

const updateChart = () => {
  if (!chartInstance) return;
  const historicalMonths = normalizeMonths(props.historicalMonths);
  const predictedMonths = normalizeMonths(props.predictedMonths);

  const allAxis = buildAxis(historicalMonths, predictedMonths);
  if (!allAxis.length) return;

  const historicalData = buildSeriesData(allAxis, historicalMonths, props.historicalPrices);
  const predictedData = buildSeriesData(allAxis, predictedMonths, props.predictedPrices);

  // 检查是否有有效数据 - 检查构建后的数据中是否有非null值
  const hasValidHistorical = hasValidData(props.historicalPrices) && historicalData.some((v) => v !== null && v !== undefined);
  // 预测数据：只要数组存在且有长度，且构建后的数据中有非null值就显示
  const hasValidPredicted =
    props.predictedPrices?.length > 0 &&
    predictedMonths.length > 0 &&
    predictedData.some((v) => v !== null && v !== undefined && typeof v === 'number' && !Number.isNaN(v));

  // 只有在有有效数据时才显示最高最低点
  const historicalMaxData = hasValidHistorical ? buildScatterData(allAxis, historicalMonths, props.historicalPrices, 'max') : allAxis.map(() => null);
  const historicalMinData = hasValidHistorical ? buildScatterData(allAxis, historicalMonths, props.historicalPrices, 'min') : allAxis.map(() => null);
  const predictedMaxData = hasValidPredicted ? buildScatterData(allAxis, predictedMonths, props.predictedPrices, 'max') : allAxis.map(() => null);
  const predictedMinData = hasValidPredicted ? buildScatterData(allAxis, predictedMonths, props.predictedPrices, 'min') : allAxis.map(() => null);

  const valueList = [...historicalData, ...predictedData].filter((v) => typeof v === 'number' && v > 0) as number[];
  const rawMax = valueList.length ? Math.max(...valueList) : 0;
  const axisMin = 0;
  const axisMaxBase = Math.max(50, Math.ceil(rawMax / 50) * 50);
  const axisMax = axisMaxBase === 0 ? 50 : axisMaxBase;

  // 是否有任何有效数据
  const hasAnyValidData = hasValidHistorical || hasValidPredicted;

  // 找到历史数据和预测数据的分界点索引
  const lastHistoricalMonth = props.historicalMonths?.[props.historicalMonths.length - 1];
  const splitIndex = lastHistoricalMonth ? allAxis.indexOf(lastHistoricalMonth) : -1;

  // 构建预测区域高亮的 markArea 数据
  const markAreaData: any[] = [];
  if (splitIndex >= 0 && splitIndex < allAxis.length - 1) {
    markAreaData.push([
      {
        xAxis: allAxis[splitIndex],
        itemStyle: {
          color: 'rgba(16, 140, 88, 0.08)'
        }
      },
      {
        xAxis: allAxis[allAxis.length - 1]
      }
    ]);
  }

  const option = {
    backgroundColor: '#fff',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e4e7ed',
      borderWidth: 1,
      textStyle: {
        color: '#303133'
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: allAxis,
      axisLine: {
        lineStyle: {
          color: '#e4e7ed'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 12,
        color: '#86909c'
      }
    },
    yAxis: {
      type: 'value',
      name: '元/kg',
      nameTextStyle: {
        color: '#86909c',
        fontSize: 12,
        padding: [0, 40, 0, 0]
      },
      min: axisMin,
      max: axisMax,
      interval: (axisMax - axisMin) / 5 || 10,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#f0f0f0',
          type: 'dashed'
        }
      },
      axisLabel: {
        fontSize: 12,
        color: '#86909c'
      }
    },
    series: [
      // 历史价格线（青绿色）+ 渐变填充 - 只有有效数据时才显示
      ...(hasValidHistorical
        ? [
            {
              name: '过往月份价格',
              type: 'line',
              data: historicalData,
              smooth: 0.4,
              symbol: (value: any, params: any) => {
                // 只在有数据的位置显示数据点
                return value !== null && value !== undefined ? 'circle' : 'none';
              },
              symbolSize: (value: any) => {
                // 只在有数据的位置显示数据点
                return value !== null && value !== undefined ? 6 : 0;
              },
              itemStyle: {
                color: '#f5a623',
                borderWidth: 2,
                borderColor: '#fff'
              },
              lineStyle: {
                width: 3,
                color: '#f5a623'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(245, 166, 35, 0.25)' },
                  { offset: 1, color: 'rgba(245, 166, 35, 0.02)' }
                ])
              },
              markArea: {
                silent: true,
                data: markAreaData
              },
              z: 2
            },
            // 历史最高点（使用图片标记）
            {
              name: '过往最高点',
              type: 'scatter',
              data: historicalMaxData,
              symbol: `image://${historicalMaxIcon}`,
              symbolSize: 20,
              label: {
                show: false
              },
              z: 10
            },
            // 历史最低点（使用图片标记）
            {
              name: '过往最低点',
              type: 'scatter',
              data: historicalMinData,
              symbol: `image://${historicalMinIcon}`,
              symbolSize: 20,
              label: {
                show: false
              },
              z: 10
            }
          ]
        : []),
      // 预测价格线（橙色）- 只有有效数据时才显示
      ...(hasValidPredicted
        ? [
            {
              name: '预测月份价格',
              type: 'line',
              data: predictedData,
              smooth: 0.4,
              symbol: (value: any, params: any) => {
                // 只在有数据的位置显示数据点
                return value !== null && value !== undefined ? 'circle' : 'none';
              },
              symbolSize: (value: any) => {
                // 只在有数据的位置显示数据点
                return value !== null && value !== undefined ? 6 : 0;
              },
              itemStyle: {
                color: '#1abc9c',
                borderWidth: 2,
                borderColor: '#fff'
              },
              lineStyle: {
                width: 3,
                color: '#1abc9c'
              },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(26, 188, 156, 0.35)' },
                  { offset: 1, color: 'rgba(26, 188, 156, 0.02)' }
                ])
              },
              z: 2
            },
            // 预测最高点（使用图片标记）
            {
              name: '预测最高点',
              type: 'scatter',
              data: predictedMaxData,
              symbol: `image://${predictedMaxIcon}`,
              symbolSize: 20,
              label: {
                show: false
              },
              z: 10
            },
            // 预测最低点（使用图片标记）
            {
              name: '预测最低点',
              type: 'scatter',
              data: predictedMinData,
              symbol: `image://${predictedMinIcon}`,
              symbolSize: 20,
              label: {
                show: false
              },
              z: 10
            }
          ]
        : []),
      // 分隔虚线（当前月份）- 只有有任何有效数据时才显示
      ...(splitIndex >= 0 && hasAnyValidData
        ? [
            {
              name: '分隔线',
              type: 'line',
              markLine: {
                silent: true,
                symbol: 'none',
                lineStyle: {
                  color: '#1abc9c',
                  type: 'dashed',
                  width: 1
                },
                label: {
                  show: false
                },
                data: [{ xAxis: allAxis[splitIndex] }]
              }
            }
          ]
        : [])
    ]
  };

  chartInstance.setOption(option, true);
};

const resizeChart = () => {
  chartInstance?.resize();
};

watch(
  () => [props.historicalMonths, props.historicalPrices, props.predictedMonths, props.predictedPrices],
  () => {
    nextTick(() => {
      updateChart();
      chartInstance?.resize();
    });
  },
  { deep: true }
);

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  // 使用双重 nextTick 和 requestAnimationFrame 确保容器有正确的尺寸
  nextTick(() => {
    requestAnimationFrame(() => {
      initChart();

      // 使用 ResizeObserver 监听容器大小变化
      if (chartContainer.value) {
        resizeObserver = new ResizeObserver(() => {
          chartInstance?.resize();
        });
        resizeObserver.observe(chartContainer.value);
      }

      // 再次延迟调整，确保图表正确渲染
      setTimeout(() => {
        chartInstance?.resize();
      }, 100);
    });
  });
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
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
