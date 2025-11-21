<!--
  标题: index.vue
  功能: 平台管理首页
  说明: 平台管理首页，展示平台管理相关的功能模块。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-20
-->

<template>
  <div class="platform-home">
    <div class="page-title">农资/农具销售分析</div>
    <div class="chart-grid">
      <el-card class="chart-card" shadow="hover" v-loading="quantityLoading">
        <div class="card-header">
          <div class="axis-wrapper">
            <div class="axis-title">销售量（单）</div>
            <div class="category-switch">
              <div
                v-for="item in categoryOptions"
                :key="item.value"
                class="category-item"
                :class="{ active: currentCategory === item.value }"
                @click="changeCategory(item.value)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
          <el-button type="primary" plain size="small" @click="handleExport('quantity')">导出</el-button>
        </div>
        <div class="chart-body">
          <div ref="quantityChartRef" class="chart-container"></div>
        </div>
        <div class="time-tabs">
          <div
            v-for="item in timeRanges"
            :key="item.value"
            class="time-tab"
            :class="{ active: quantityTimeRange === item.value }"
            @click="changeRange('quantity', item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </el-card>

      <el-card class="chart-card" shadow="hover" v-loading="amountLoading">
        <div class="card-header">
          <div class="axis-wrapper">
            <div class="axis-title">销售额（万元）</div>
            <div class="category-switch">
              <div
                v-for="item in categoryOptions"
                :key="item.value"
                class="category-item"
                :class="{ active: currentCategory === item.value }"
                @click="changeCategory(item.value)"
              >
                {{ item.label }}
              </div>
            </div>
          </div>
          <el-button type="primary" plain size="small" @click="handleExport('amount')">导出</el-button>
        </div>
        <div class="chart-body">
          <div ref="amountChartRef" class="chart-container"></div>
        </div>
        <div class="time-tabs">
          <div
            v-for="item in timeRanges"
            :key="item.value"
            class="time-tab"
            :class="{ active: amountTimeRange === item.value }"
            @click="changeRange('amount', item.value)"
          >
            {{ item.label }}
          </div>
        </div>
      </el-card>
    </div>

    <el-card class="chart-card bottom-card" shadow="hover">
      <div class="card-header">
        <div class="axis-wrapper">
          <div class="axis-title">履约率（%）</div>
          <div class="category-switch">
            <div
              v-for="item in categoryOptions"
              :key="item.value"
              class="category-item"
              :class="{ active: currentCategory === item.value }"
              @click="changeCategory(item.value)"
            >
              {{ item.label }}
            </div>
          </div>
        </div>
        <el-button type="primary" plain size="small" disabled>导出</el-button>
      </div>
      <div class="chart-body">
        <el-empty description="等待接口联调" />
      </div>
      <div class="time-tabs">
        <div
          v-for="item in timeRanges"
          :key="item.value"
          class="time-tab"
          :class="{ active: fulfillmentTimeRange === item.value }"
          @click="changeRange('fulfillment', item.value)"
        >
          {{ item.label }}
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { getFirstLevelCategorySales, getFirstLevelCategorySalesAmountTotal } from '../../api/platformManage/home';

type TimeRange = '1' | '2' | '3' | '4';
type ExportType = 'quantity' | 'amount';

const categoryOptions = [
  { label: '农资', value: 'agricultural', goodsCategoryId: 1 },
  { label: '农具', value: 'tools', goodsCategoryId: 2 }
];

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '日', value: '1' },
  { label: '周', value: '2' },
  { label: '月', value: '3' },
  { label: '年', value: '4' }
];

const currentCategory = ref('agricultural');
const quantityTimeRange = ref<TimeRange>('1');
const amountTimeRange = ref<TimeRange>('1');
const fulfillmentTimeRange = ref<TimeRange>('1');

const quantityChartRef = ref<HTMLDivElement | null>(null);
const amountChartRef = ref<HTMLDivElement | null>(null);
let quantityChart: echarts.ECharts | null = null;
let amountChart: echarts.ECharts | null = null;

const quantityLoading = ref(false);
const amountLoading = ref(false);
const isMounted = ref(false);

const { proxy } = getCurrentInstance() as any;

const currentCategoryOption = computed(() => categoryOptions.find((item) => item.value === currentCategory.value) ?? categoryOptions[0]);

const initCharts = () => {
  if (quantityChartRef.value && !quantityChart) {
    quantityChart = echarts.init(quantityChartRef.value);
  }
  if (amountChartRef.value && !amountChart) {
    amountChart = echarts.init(amountChartRef.value);
  }
};

const handleResize = () => {
  quantityChart?.resize();
  amountChart?.resize();
};

const unwrapList = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
};

const buildTimeLabel = (item: any) => {
  if (item.analysisDate) return item.analysisDate;
  if (item.analysisYear && item.analysisMonth && item.analysisDay) {
    return `${item.analysisYear}/${item.analysisMonth}/${item.analysisDay}`;
  }
  if (item.analysisYear && item.analysisMonth) {
    return `${item.analysisYear}/${item.analysisMonth}`;
  }
  return item.analysisDay || item.analysisMonth || item.analysisYear || '';
};

const pickNumber = (item: any, keys: string[]) => {
  for (const key of keys) {
    if (item[key] !== undefined && item[key] !== null) {
      const value = Number(item[key]);
      return Number.isNaN(value) ? 0 : value;
    }
  }
  return 0;
};

const updateQuantityChart = (data: { label: string; value: number }[]) => {
  if (!quantityChart) return;
  quantityChart.setOption(
    {
      grid: { top: 40, left: 40, right: 20, bottom: 40 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.map((item) => item.label),
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLabel: { color: '#666' }
      },
      series: [
        {
          name: '订单量',
          type: 'line',
          smooth: true,
          symbolSize: 6,
          lineStyle: { color: '#f7b733', width: 3 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(247, 183, 51, 0.6)' },
              { offset: 1, color: 'rgba(247, 183, 51, 0.05)' }
            ])
          },
          data: data.map((item) => item.value)
        }
      ]
    },
    true
  );
};

const updateAmountChart = (data: { label: string; value: number }[]) => {
  if (!amountChart) return;
  amountChart.setOption(
    {
      grid: { top: 40, left: 40, right: 20, bottom: 40 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.label),
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLabel: { color: '#666' }
      },
      color: ['#4a90e2'],
      series: [
        {
          name: '销售额（万元）',
          type: 'bar',
          barWidth: 24,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: data.map((item) => item.value)
        }
      ]
    },
    true
  );
};

const buildCommonParams = (range: TimeRange) => ({
  goodsCategoryId: currentCategoryOption.value.goodsCategoryId,
  goodsCategoryName: currentCategoryOption.value.label,
  homeDaysType: range
});

const fetchQuantityData = async () => {
  if (!quantityChart) return;
  quantityLoading.value = true;
  try {
    const { data } = await getFirstLevelCategorySales(buildCommonParams(quantityTimeRange.value));
    const list = unwrapList(data);
    const result = list.map((item: any) => ({
      label: buildTimeLabel(item),
      value: pickNumber(item, ['yesterdaySales', 'salesQuantity', 'value', 'count'])
    }));
    updateQuantityChart(result);
  } catch (error) {
    console.error('获取销量统计图失败', error);
    ElMessage.error('获取销量统计图失败，请稍后重试');
  } finally {
    quantityLoading.value = false;
  }
};

const fetchAmountData = async () => {
  if (!amountChart) return;
  amountLoading.value = true;
  try {
    const { data } = await getFirstLevelCategorySalesAmountTotal(buildCommonParams(amountTimeRange.value));
    const list = unwrapList(data);
    const result = list.map((item: any) => ({
      label: buildTimeLabel(item),
      value: pickNumber(item, ['yesterdayTotalSales', 'salesAmount', 'totalSales', 'value'])
    }));
    updateAmountChart(result);
  } catch (error) {
    console.error('获取销售额统计图失败', error);
    ElMessage.error('获取销售额统计图失败，请稍后重试');
  } finally {
    amountLoading.value = false;
  }
};

const changeCategory = (value: string) => {
  if (currentCategory.value === value) return;
  currentCategory.value = value;
};

const changeRange = (type: 'quantity' | 'amount' | 'fulfillment', value: TimeRange) => {
  if (type === 'quantity') quantityTimeRange.value = value;
  if (type === 'amount') amountTimeRange.value = value;
  if (type === 'fulfillment') fulfillmentTimeRange.value = value;
};

const handleExport = (type: ExportType) => {
  if (!proxy) return;
  const params = buildCommonParams(type === 'quantity' ? quantityTimeRange.value : amountTimeRange.value);
  const fileName = type === 'quantity' ? '一级类目销量统计.xlsx' : '一级类目销售额统计.xlsx';
  const url =
    type === 'quantity' ? '/marketAnalysisDaily/firstLevelCategorySalesExport' : '/marketAnalysisDaily/salesAmountTotalExport';
  proxy.download(url, params, fileName);
};

onMounted(async () => {
  await nextTick();
  initCharts();
  window.addEventListener('resize', handleResize);
  isMounted.value = true;
  fetchQuantityData();
  fetchAmountData();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  quantityChart?.dispose();
  amountChart?.dispose();
});

watch([currentCategory, quantityTimeRange], () => {
  if (!isMounted.value) return;
  fetchQuantityData();
});

watch([currentCategory, amountTimeRange], () => {
  if (!isMounted.value) return;
  fetchAmountData();
});
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
}

.chart-card {
  border-radius: 12px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.axis-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.axis-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-switch {
  display: inline-flex;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  overflow: hidden;
}

.category-item {
  padding: 4px 16px;
  font-size: 14px;
  color: #666;
  background: #f7f7f7;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item.active {
  background: #ffe451;
  color: #333;
  font-weight: 600;
}

.chart-body {
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.time-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
}

.time-tab {
  min-width: 48px;
  text-align: center;
  padding: 4px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  background: #fff;
  transition: all 0.2s;
}

.time-tab.active {
  background: #ffe451;
  border-color: #ffe451;
  color: #333;
  font-weight: 600;
}

.bottom-card {
  margin-top: 16px;
}
</style>
