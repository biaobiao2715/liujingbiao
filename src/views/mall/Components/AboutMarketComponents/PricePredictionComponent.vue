<template>
  <div class="price-prediction-component">
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="110" class="query-form">
      <el-form-item label="产地:" prop="origin">
        <RegionSelect v-model="queryParams.origin" @regionChange="handleRegionChange" style="width: 200px" />
      </el-form-item>
      <el-form-item label="品种:" prop="variety">
        <GoodsCategorySelect v-model="queryParams.variety" @categoryChange="handleCategoryChange" style="width: 200px" />
      </el-form-item>
      <el-form-item label="时间范围:" prop="timeRange">
        <el-select v-model="queryParams.timeRange" placeholder="请选择时间范围" style="width: 200px">
          <el-option label="未来1个月" value="1" />
          <el-option label="未来3个月" value="3" />
          <el-option label="未来6个月" value="6" />
          <el-option label="未来12个月" value="12" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery" style="margin-right: 12px">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 图表和分析区域 -->
    <div class="chart-analysis-wrapper">
      <!-- 左侧：图表 -->
      <div class="chart-section">
        <h3 class="chart-title">{{ chartTitle }}</h3>
        <PricePredictionChart
          :historical-months="historicalLineMonths"
          :historical-prices="historicalLinePrices"
          :predicted-months="predictedLineMonths"
          :predicted-prices="predictedLinePrices"
          :y-axis-min="chartYAxisMin"
          :y-axis-max="chartYAxisMax"
          :y-axis-interval="chartYAxisInterval"
          v-loading="loading"
        />
      </div>

      <!-- 右侧：市场分析解读 + 图例 -->
      <div class="analysis-section">
        <div class="analysis-card">
          <h4 class="analysis-title">市场分析解读</h4>
          <div class="analysis-content">
            <p>1.<strong>整体趋势:</strong> {{ marketAnalysis.overallTrend }}</p>
            <p>2.<strong>价格区间:</strong> {{ marketAnalysis.priceRange }}</p>
            <p>3.<strong>预测建议:</strong> {{ marketAnalysis.suggestion }}</p>
          </div>
        </div>

        <!-- 图例卡片 -->
        <div class="legend-card">
          <h4 class="legend-title"><span class="title-marker"></span>图例</h4>
          <div class="legend-list">
            <div class="legend-item">
              <span class="legend-line historical-line"></span>
              <span class="legend-text">过往月份价格</span>
            </div>
            <div class="legend-item">
              <span class="legend-line predicted-line"></span>
              <span class="legend-text">预测月份价格</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon historical-low"></span>
              <span class="legend-text">过往月份价格最低点</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon historical-high"></span>
              <span class="legend-text">过往月份价格最高点</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon predicted-low"></span>
              <span class="legend-text">预测月份价格最低点</span>
            </div>
            <div class="legend-item">
              <span class="legend-icon predicted-high"></span>
              <span class="legend-text">预测月份价格最高点</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import PricePredictionChart from './PricePredictionChart.vue';
import { pricePredictionList } from '@/api/mall/marketComponent';

const queryFormRef = ref();
const loading = ref(false);

// 查询参数
const queryParams = reactive({
  origin: [] as string[],
  variety: [] as string[],
  timeRange: '12'
});

// 区域代码
const regionCodes = reactive({
  provinceCode: '',
  cityCode: '',
  regionCode: ''
});

// 图表数据
const allMonths = ref<string[]>([]);
const pastPrices = ref<(number | null)[]>([]);
const pastPriceUpper = ref<(number | null)[]>([]);
const pastPriceLower = ref<(number | null)[]>([]);
const predictedPrices = ref<(number | null)[]>([]);
const predictedPriceUpper = ref<(number | null)[]>([]);
const predictedPriceLower = ref<(number | null)[]>([]);
const historicalLineMonths = ref<string[]>([]);
const historicalLinePrices = ref<number[]>([]);
const predictedLineMonths = ref<string[]>([]);
const predictedLinePrices = ref<number[]>([]);
const pastHighest = ref<{ month: string; price: number }>({ month: '', price: 0 });
const pastLowest = ref<{ month: string; price: number }>({ month: '', price: 0 });
const predictedHighest = ref<{ month: string; price: number }>({ month: '', price: 0 });
const predictedLowest = ref<{ month: string; price: number }>({ month: '', price: 0 });
const chartYAxisMin = ref(0);
const chartYAxisMax = ref(5);
const chartYAxisInterval = ref(1);

const normalizeMonthLabel = (value: any) => {
  if (value === undefined || value === null) return '';
  const str = String(value).trim();
  if (!str) return '';
  if (str.includes('-')) {
    const [year, month] = str.split('-');
    const safeMonth = (month || '').padStart(2, '0');
    return `${year}-${safeMonth}`;
  }
  return str;
};

const parsePriceValue = (val: any) => {
  if (val === undefined || val === null || val === '' || val === '-') return null;
  const num = Number(val);
  if (Number.isNaN(num)) return null;
  return num;
};

const buildSeriesByXAxis = (
  baseMonths: string[],
  xAxis?: any[],
  yAxis?: any[]
): (number | null)[] => {
  const map = new Map<string, number | null>();
  if (Array.isArray(xAxis) && Array.isArray(yAxis)) {
    xAxis.forEach((label: any, idx: number) => {
      map.set(normalizeMonthLabel(label), parsePriceValue(yAxis[idx]));
    });
  }
  return baseMonths.map((month) => map.get(month) ?? null);
};

const fillSequentialIfEmpty = (
  series: (number | null)[],
  baseMonths: string[],
  values?: any[]
) => {
  if (series.some((val) => val !== null) || !Array.isArray(values)) return series;
  return baseMonths.map((_, idx) => parsePriceValue(values[idx]));
};

const deriveExtreme = (
  series: (number | null)[],
  months: string[],
  type: 'max' | 'min'
): { month: string; price: number } => {
  const entries = series
    .map((price, idx) => ({ price, month: months[idx] }))
    .filter((item) => item.price !== null && item.month) as { price: number; month: string }[];
  if (!entries.length) return { month: '', price: 0 };
  const comparator =
    type === 'max'
      ? (prev: any, curr: any) => (curr.price > prev.price ? curr : prev)
      : (prev: any, curr: any) => (curr.price < prev.price ? curr : prev);
  const result = entries.reduce(comparator);
  return { month: result.month, price: Number(result.price.toFixed(2)) };
};

// 市场分析数据
const marketAnalysis = ref({
  overallTrend: '暂无数据',
  priceRange: '暂无数据',
  suggestion: '暂无数据'
});

// 图表标题
const chartTitle = computed(() => {
  const timeRangeMap: Record<string, string> = {
    '1': '1个月',
    '3': '3个月',
    '6': '6个月',
    '12': '12个月'
  };
  return `小麦种子未来${timeRangeMap[queryParams.timeRange] || '12个月'}价格预测走势图`;
});

// 品种分类变化处理
const handleCategoryChange = (value: string[]) => {
  queryParams.variety = value;
  console.log('选择的品种分类:', value);
};

// 产地变化处理
const handleRegionChange = (value: any) => {
  if (value && value.regionPath) {
    queryParams.origin = value.regionPath;
    regionCodes.provinceCode = value.provinceCode || '';
    regionCodes.cityCode = value.cityCode || '';
    regionCodes.regionCode = value.regionCode || '';
  } else {
    queryParams.origin = [];
    regionCodes.provinceCode = '';
    regionCodes.cityCode = '';
    regionCodes.regionCode = '';
  }
  console.log('选择的产地:', value);
};

// 获取价格预测数据
const fetchPricePrediction = async () => {
  loading.value = true;
  try {
    // 转换时间范围为接口参数
    const timeRangeMap: Record<string, number> = {
      '1': 1, // 一个月
      '3': 2, // 三个月
      '6': 3, // 六个月
      '12': 4 // 十二个月
    };
    const pricePredictionTimeframe = timeRangeMap[queryParams.timeRange] || 4;

    // 获取品种ID（取数组最后一个元素）
    const goodsCategoryId = queryParams.variety && queryParams.variety.length > 0 ? queryParams.variety[queryParams.variety.length - 1] : '';

    const params: any = {
      pricePredictionTimeframe,
      regionCode: regionCodes.regionCode || '',
      goodsCategoryId: goodsCategoryId || ''
    };

    const response = await pricePredictionList(params);
    if (response && response.code === 200) {
      const data = response.data || {};
      const historicalData = data.historicalData || {};
      const predictedData = data.predictedData || {};

      // 处理历史数据（historicalData）
      if (historicalData.xAxis && Array.isArray(historicalData.xAxis)) {
        allMonths.value = historicalData.xAxis.map((dateStr: string) => normalizeMonthLabel(dateStr));
      } else if (data.months && Array.isArray(data.months)) {
        allMonths.value = data.months.map((m: any) => normalizeMonthLabel(m));
      }

      historicalLineMonths.value = (historicalData.xAxis && Array.isArray(historicalData.xAxis))
        ? historicalData.xAxis.map((dateStr: string) => normalizeMonthLabel(dateStr))
        : [];
      historicalLinePrices.value = (historicalData.yAxis && Array.isArray(historicalData.yAxis))
        ? historicalData.yAxis.map((val: any) => Number(val ?? 0))
        : [];

      let predictionEntries: Array<[string, any]> = [];
      if (predictedData && Array.isArray(predictedData.xAxis) && Array.isArray(predictedData.yAxis)) {
        predictionEntries = predictedData.xAxis.map((label: string, idx: number) => [label, predictedData.yAxis[idx]]);
      } else if (predictedData && typeof predictedData === 'object') {
        predictionEntries = Object.entries(predictedData);
      }
      predictedLineMonths.value = predictionEntries.map(([key]) => normalizeMonthLabel(key));
      predictedLinePrices.value = predictionEntries.map(([, value]) => Number(value ?? 0));

      if (predictedData.xAxis && Array.isArray(predictedData.xAxis)) {
        const predictedMonths = predictedData.xAxis.map((dateStr: string) => normalizeMonthLabel(dateStr));
        allMonths.value = [...new Set([...allMonths.value, ...predictedMonths])];
      }

      if (!allMonths.value.length && Array.isArray(data.months)) {
        allMonths.value = data.months.map((m: any) => normalizeMonthLabel(m));
      }
      if (!allMonths.value.length) {
        allMonths.value = Array.from({ length: 12 }, (_, idx) => `${idx + 1}`);
      }

      pastPrices.value = buildSeriesByXAxis(allMonths.value, historicalData.xAxis, historicalData.yAxis);
      predictedPrices.value = buildSeriesByXAxis(allMonths.value, predictedData.xAxis, predictedData.yAxis);

      pastPriceUpper.value = buildSeriesByXAxis(allMonths.value, allMonths.value, data.pastPriceUpper);
      pastPriceLower.value = buildSeriesByXAxis(allMonths.value, allMonths.value, data.pastPriceLower);
      predictedPriceUpper.value = buildSeriesByXAxis(allMonths.value, allMonths.value, data.predictedPriceUpper);
      predictedPriceLower.value = buildSeriesByXAxis(allMonths.value, allMonths.value, data.predictedPriceLower);

      pastPrices.value = fillSequentialIfEmpty(pastPrices.value, allMonths.value, data.pastPrices);
      predictedPrices.value = fillSequentialIfEmpty(predictedPrices.value, allMonths.value, data.predictedPrices);

      // 最高点和最低点
      const resolveMonthFromIndex = (index: any) => {
        if (index === undefined || index === null) return '';
        const num = Number(index);
        if (!Number.isNaN(num)) {
          const valueByIndex = allMonths.value[num];
          if (valueByIndex) return valueByIndex;
        }
        return normalizeMonthLabel(index);
      };

      if (data.pastHighest && data.pastHighest.price !== undefined) {
        pastHighest.value = {
          month: normalizeMonthLabel(data.pastHighest.month) || resolveMonthFromIndex(data.pastHighest.monthIndex),
          price: Number(data.pastHighest.price || 0)
        };
      } else {
        pastHighest.value = deriveExtreme(pastPrices.value, allMonths.value, 'max');
      }

      if (data.pastLowest && data.pastLowest.price !== undefined) {
        pastLowest.value = {
          month: normalizeMonthLabel(data.pastLowest.month) || resolveMonthFromIndex(data.pastLowest.monthIndex),
          price: Number(data.pastLowest.price || 0)
        };
      } else {
        pastLowest.value = deriveExtreme(pastPrices.value, allMonths.value, 'min');
      }

      if (data.predictedHighest && data.predictedHighest.price !== undefined) {
        predictedHighest.value = {
          month: normalizeMonthLabel(data.predictedHighest.month) || resolveMonthFromIndex(data.predictedHighest.monthIndex),
          price: Number(data.predictedHighest.price || 0)
        };
      } else {
        predictedHighest.value = deriveExtreme(predictedPrices.value, allMonths.value, 'max');
      }

      if (data.predictedLowest && data.predictedLowest.price !== undefined) {
        predictedLowest.value = {
          month: normalizeMonthLabel(data.predictedLowest.month) || resolveMonthFromIndex(data.predictedLowest.monthIndex),
          price: Number(data.predictedLowest.price || 0)
        };
      } else {
        predictedLowest.value = deriveExtreme(predictedPrices.value, allMonths.value, 'min');
      }

      updateYAxisRange();

      // 市场分析数据
      if (data.overallTrend) {
        marketAnalysis.value.overallTrend = data.overallTrend;
      }
      if (data.priceRange) {
        marketAnalysis.value.priceRange = data.priceRange;
      }
      if (data.suggestion || data.predictionSuggestion) {
        marketAnalysis.value.suggestion = data.suggestion || data.predictionSuggestion;
      }
    } else {
      ElMessage.error(response?.msg || '获取价格预测数据失败');
      // 重置数据
      resetChartData();
    }
  } catch (error) {
    console.error('获取价格预测数据失败:', error);
    ElMessage.error('获取价格预测数据失败，请稍后重试');
    resetChartData();
  } finally {
    loading.value = false;
  }
};

// 重置图表数据
const resetChartData = () => {
  allMonths.value = [];
  pastPrices.value = [];
  pastPriceUpper.value = [];
  pastPriceLower.value = [];
  predictedPrices.value = [];
  predictedPriceUpper.value = [];
  predictedPriceLower.value = [];
  pastHighest.value = { month: '', price: 0 };
  pastLowest.value = { month: '', price: 0 };
  predictedHighest.value = { month: '', price: 0 };
  predictedLowest.value = { month: '', price: 0 };
  chartYAxisMin.value = 0;
  chartYAxisMax.value = 5;
  chartYAxisInterval.value = 1;
  marketAnalysis.value = {
    overallTrend: '暂无数据',
    priceRange: '暂无数据',
    suggestion: '暂无数据'
  };
};

const updateYAxisRange = () => {
  const values = [
    ...pastPrices.value,
    ...predictedPrices.value,
    ...pastPriceUpper.value,
    ...pastPriceLower.value,
    ...predictedPriceUpper.value,
    ...predictedPriceLower.value
  ].filter((val) => typeof val === 'number' && val !== null && !Number.isNaN(val)) as number[];

  if (!values.length) {
    chartYAxisMin.value = 0;
    chartYAxisMax.value = 5;
    chartYAxisInterval.value = 1;
    return;
  }

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max(1, (maxVal - minVal) * 0.1);
  const rawMin = minVal - padding;
  const rawMax = maxVal + padding;

  chartYAxisMin.value = Math.max(0, Math.floor(rawMin / 5) * 5);
  chartYAxisMax.value = Math.ceil(rawMax / 5) * 5;

  if (chartYAxisMax.value <= chartYAxisMin.value) {
    chartYAxisMax.value = chartYAxisMin.value + 5;
  }

  const range = chartYAxisMax.value - chartYAxisMin.value;
  chartYAxisInterval.value = Math.max(1, Math.ceil(range / 6));
};

// 查询
const handleQuery = () => {
  console.log('查询参数:', queryParams);
  fetchPricePrediction();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.origin = [];
  queryParams.variety = [];
  queryParams.timeRange = '12';
  regionCodes.provinceCode = '';
  regionCodes.cityCode = '';
  regionCodes.regionCode = '';
  fetchPricePrediction();
};

// 页面加载时获取数据
onMounted(() => {
  fetchPricePrediction();
});

// 暴露方法供父组件调用
defineExpose({
  fetchPricePrediction
});
</script>

<style scoped lang="scss">
.price-prediction-component {
  padding: 24px;
  background-color: #fff;

  .query-form {
    margin-bottom: 32px;
    position: relative;
    z-index: 10;

    :deep(.el-form-item) {
      margin-right: 24px !important;
      margin-bottom: 0 !important;
    }

    // 最后一个表单项不需要右边距
    :deep(.el-form-item:last-child) {
      margin-right: 0 !important;
    }

    :deep(.el-form-item__label) {
      padding-right: 8px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }

    :deep(.goods-category) {
      width: 200px;
    }

    // 确保下拉菜单不被遮挡
    :deep(.el-select-dropdown),
    :deep(.el-popper) {
      z-index: 3000 !important;
    }
  }

  .chart-analysis-wrapper {
    display: flex;
    gap: 24px;
    margin-bottom: 30px;
    position: relative;
    z-index: 1;

    .chart-section {
      flex: 2;
      background-color: #fff;
      border-radius: 4px;
      padding: 24px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      min-height: 500px;

      .chart-title {
        font-size: 16px;
        font-weight: bold;
        text-align: center;
        margin-bottom: 24px;
        color: #303133;
        flex-shrink: 0;
      }

      // 图表区域占满容器
      :deep(.price-prediction-chart) {
        width: 100%;
        height: 100%;
        flex: 1;
        min-height: 0;
      }
    }

    .analysis-section {
      flex: 0 0 280px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      min-width: 240px;

      .analysis-card {
        background-color: #f6ffed;
        border-radius: 4px;
        padding: 20px;
        border: 1px solid #b7eb8f;

        .analysis-title {
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #108c58;
          display: flex;
          align-items: center;
          gap: 6px;

          &::before {
            content: '';
            display: inline-block;
            width: 3px;
            height: 16px;
            background: #108c58;
            border-radius: 2px;
          }
        }

        .analysis-content {
          p {
            margin-bottom: 12px;
            font-size: 13px;
            color: #4a4a4a;
            line-height: 1.7;

            &:last-child {
              margin-bottom: 0;
            }

            strong {
              color: #303133;
            }
          }
        }
      }

      .legend-card {
        background-color: #fff;
        border-radius: 4px;
        padding: 20px;
        border: 1px solid #e4e7ed;

        .legend-title {
          font-size: 15px;
          font-weight: bold;
          margin-bottom: 16px;
          color: #303133;
          display: flex;
          align-items: center;
          gap: 8px;

          .title-marker {
            display: inline-block;
            width: 3px;
            height: 16px;
            background: #108c58;
            border-radius: 2px;
          }
        }

        .legend-list {
          display: flex;
          flex-direction: column;
          gap: 12px;

          .legend-item {
            display: flex;
            align-items: center;
            gap: 10px;

            .legend-line {
              width: 24px;
              height: 3px;
              border-radius: 2px;

              &.historical-line {
                background: #f5a623;
              }

              &.predicted-line {
                background: #1abc9c;
              }
            }

            .legend-icon {
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;

              // 过往最低点 - 青绿色向下三角
              &.historical-low {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 12px solid #1abc9c;
              }

              // 过往最高点 - 青绿色向上三角
              &.historical-high {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 12px solid #1abc9c;
              }

              // 预测最低点 - 橙色向下三角
              &.predicted-low {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 12px solid #f5a623;
              }

              // 预测最高点 - 橙色向上三角
              &.predicted-high {
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-bottom: 12px solid #f5a623;
              }
            }

            .legend-text {
              font-size: 13px;
              color: #606266;
            }
          }
        }
      }
    }
  }

  .procurement-window-section {
    margin-top: 20px;
    background-color: #fff;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .section-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #303133;
    }

    :deep(.el-table) {
      .el-table__header {
        th {
          background-color: #fafafa;
          color: #606266;
          font-weight: 600;
        }
      }

      .el-table__body {
        tr {
          &:hover {
            background-color: #f5f7fa;
          }
        }
      }
    }
  }
}
</style>
