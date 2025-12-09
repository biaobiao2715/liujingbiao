<!-- 价格预测与分析 -->

<template>
  <div class="price-prediction-component">
    <!-- 图表和分析区域 -->
    <div class="chart-analysis-wrapper">
      <!-- 左侧：图表 -->
      <div class="chart-section">
        <!-- 查询表单 -->
        <el-form ref="queryFormRef" :model="queryParams" class="query-form">
          <el-form-item label="产地:" prop="origin">
            <RegionSelect class="full-width-select" v-model="queryParams.origin" @regionChange="handleRegionChange" />
          </el-form-item>
          <el-form-item label="品种:" prop="variety">
            <GoodsCategorySelect class="full-width-select" v-model="queryParams.variety" @categoryChange="handleCategoryChange" />
          </el-form-item>
          <el-form-item label="时间范围:" prop="timeRange">
            <el-select class="full-width-select" v-model="queryParams.timeRange" placeholder="请选择时间范围" @change="handleTimeRangeChange">
              <el-option label="未来1个月" value="1" />
              <el-option label="未来3个月" value="3" />
              <el-option label="未来6个月" value="6" />
              <el-option label="未来12个月" value="12" />
            </el-select>
          </el-form-item>
        </el-form>

        <div class="chart-title">
          <span class="title-marker"></span>
          <h3>{{ chartTitle }}</h3>
        </div>
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
          <div class="analysis-title">市场分析解读</div>
          <div class="analysis-content">
            <p>1.<strong>整体趋势:</strong> {{ marketAnalysis.overallTrend }}</p>
            <p>2.<strong>价格区间:</strong> {{ marketAnalysis.priceRange }}</p>
            <p>3.<strong>预测建议:</strong> {{ marketAnalysis.suggestion }}</p>
          </div>
        </div>

        <!-- 图例卡片 -->
        <div class="legend-card">
          <div class="legend-title"><span class="title-marker"></span>图例</div>
          <div class="legend-list">
            <div class="legend-item">
              <img class="legend-icon-img" :src="legendIcons.historicalLine" alt="过往月份价格" />
              <span class="legend-text">过往月份价格</span>
            </div>
            <div class="legend-item">
              <img class="legend-icon-img" :src="legendIcons.predictedLine" alt="预测月份价格" />
              <span class="legend-text">预测月份价格</span>
            </div>
            <div class="legend-item">
              <img class="legend-icon-img" :src="legendIcons.historicalMin" alt="过往月份价格最低点" />
              <span class="legend-text">过往月份价格最低点</span>
            </div>
            <div class="legend-item">
              <img class="legend-icon-img" :src="legendIcons.historicalMax" alt="过往月份价格最高点" />
              <span class="legend-text">过往月份价格最高点</span>
            </div>
            <div class="legend-item">
              <img class="legend-icon-img" :src="legendIcons.predictedMin" alt="预测月份价格最低点" />
              <span class="legend-text">预测月份价格最低点</span>
            </div>
            <div class="legend-item">
              <img class="legend-icon-img" :src="legendIcons.predictedMax" alt="预测月份价格最高点" />
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
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import PricePredictionChart from './PricePredictionChart.vue';
import { pricePredictionList } from '@/api/mall/marketComponent';
import historicalLineIcon from '@/assets/images/marketConditions/gw.png';
import historicalMaxIcon from '@/assets/images/marketConditions/gwMax.png';
import historicalMinIcon from '@/assets/images/marketConditions/gwMin.png';
import predictedLineIcon from '@/assets/images/marketConditions/yc.png';
import predictedMaxIcon from '@/assets/images/marketConditions/ycMax.png';
import predictedMinIcon from '@/assets/images/marketConditions/ycMin.png';

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
const predictedLineMin = ref<{ month: string; price: number } | null>(null);
const predictedLineMax = ref<{ month: string; price: number } | null>(null);
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

const formatMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const generateSequentialMonths = (startMonth: string, count: number) => {
  const normalized = normalizeMonthLabel(startMonth);
  let baseDate: Date;
  if (normalized) {
    const [yearStr, monthStr] = normalized.split('-');
    const year = Number(yearStr) || new Date().getFullYear();
    const month = (Number(monthStr) || 1) - 1;
    baseDate = new Date(year, month, 1);
  } else {
    baseDate = new Date();
    baseDate.setDate(1);
  }

  const months: string[] = [];
  for (let i = 1; i <= count; i++) {
    const date = new Date(baseDate);
    date.setMonth(baseDate.getMonth() + i);
    months.push(formatMonth(date));
  }
  return months;
};

const getPreviousMonth = (month: string) => {
  const normalized = normalizeMonthLabel(month);
  if (!normalized) return normalized;
  const [yearStr, monthStr] = normalized.split('-');
  const date = new Date(Number(yearStr) || 1970, (Number(monthStr) || 1) - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return formatMonth(date);
};

const parsePriceValue = (val: any) => {
  if (val === undefined || val === null || val === '' || val === '-') return null;
  const num = Number(val);
  if (Number.isNaN(num)) return null;
  return num;
};

const buildSeriesByXAxis = (baseMonths: string[], xAxis?: any[], yAxis?: any[]): (number | null)[] => {
  const map = new Map<string, number | null>();
  if (Array.isArray(xAxis) && Array.isArray(yAxis)) {
    xAxis.forEach((label: any, idx: number) => {
      map.set(normalizeMonthLabel(label), parsePriceValue(yAxis[idx]));
    });
  }
  return baseMonths.map((month) => map.get(month) ?? null);
};

const fillSequentialIfEmpty = (series: (number | null)[], baseMonths: string[], values?: any[]) => {
  if (series.some((val) => val !== null) || !Array.isArray(values)) return series;
  return baseMonths.map((_, idx) => parsePriceValue(values[idx]));
};

const deriveExtreme = (series: (number | null)[], months: string[], type: 'max' | 'min'): { month: string; price: number } => {
  const entries = series.map((price, idx) => ({ price, month: months[idx] })).filter((item) => item.price !== null && item.month) as {
    price: number;
    month: string;
  }[];
  if (!entries.length) return { month: '', price: 0 };
  const comparator =
    type === 'max'
      ? (prev: any, curr: any) => (curr.price > prev.price ? curr : prev)
      : (prev: any, curr: any) => (curr.price < prev.price ? curr : prev);
  const result = entries.reduce(comparator);
  return { month: result.month, price: Number(result.price.toFixed(2)) };
};

const formatPriceValue = (price?: number | null) => {
  if (price === undefined || price === null || Number.isNaN(price)) return '';
  const fixed = Number(price).toFixed(2);
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed;
};

const formatMonthDisplay = (month: string) => {
  const normalized = normalizeMonthLabel(month);
  if (!normalized) return '';
  const [, monthStr] = normalized.split('-');
  if (!monthStr) return '';
  return `${Number(monthStr)}月`;
};

// 市场分析数据
const marketAnalysis = ref({
  overallTrend: '暂无数据',
  priceRange: '暂无数据',
  suggestion: '暂无数据'
});

const legendIcons = {
  historicalLine: historicalLineIcon,
  predictedLine: predictedLineIcon,
  historicalMin: historicalMinIcon,
  historicalMax: historicalMaxIcon,
  predictedMin: predictedMinIcon,
  predictedMax: predictedMaxIcon
};

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
  fetchPricePrediction();
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
  fetchPricePrediction();
};

const handleTimeRangeChange = () => {
  fetchPricePrediction();
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
      const predictedData = data.predictedData || data.predictionData || {};

      // 处理历史数据（historicalData）
      if (historicalData.xAxis && Array.isArray(historicalData.xAxis)) {
        allMonths.value = historicalData.xAxis.map((dateStr: string) => normalizeMonthLabel(dateStr));
      } else if (data.months && Array.isArray(data.months)) {
        allMonths.value = data.months.map((m: any) => normalizeMonthLabel(m));
      }

      historicalLineMonths.value =
        historicalData.xAxis && Array.isArray(historicalData.xAxis)
          ? historicalData.xAxis.map((dateStr: string) => normalizeMonthLabel(dateStr))
          : [];
      historicalLinePrices.value =
        historicalData.yAxis && Array.isArray(historicalData.yAxis) ? historicalData.yAxis.map((val: any) => Number(val ?? 0)) : [];

      let predictionEntries: Array<[string, any]> = [];
      if (predictedData && Array.isArray(predictedData.xAxis) && Array.isArray(predictedData.yAxis)) {
        predictionEntries = predictedData.xAxis.map((label: string, idx: number) => [label, predictedData.yAxis[idx]]);
      } else if (predictedData && typeof predictedData === 'object' && !Array.isArray(predictedData)) {
        predictionEntries = Object.entries(predictedData).filter(([, value]) => parsePriceValue(value) !== null);
      }
      const predictedValues = predictionEntries.map(([, value]) => {
        const numValue = parsePriceValue(value);
        return numValue !== null ? numValue : 0;
      });

      let baseMonth =
        historicalLineMonths.value[historicalLineMonths.value.length - 1] ||
        (historicalData.xAxis && historicalData.xAxis.length ? normalizeMonthLabel(historicalData.xAxis[historicalData.xAxis.length - 1]) : '');

      if (!baseMonth && predictionEntries.length) {
        const firstPredMonth = normalizeMonthLabel(predictionEntries[0][0]);
        baseMonth = getPreviousMonth(firstPredMonth) || firstPredMonth;
      }

      // 预测数据与历史数据共用同一个 X 轴（历史月份）
      const historicalCount = historicalLineMonths.value.length;
      predictedLineMonths.value = historicalLineMonths.value.slice();
      if (historicalCount > 0) {
        const trimmedValues = predictedValues.slice(0, historicalCount);
        if (trimmedValues.length < historicalCount) {
          predictedLinePrices.value = [...trimmedValues, ...Array(historicalCount - trimmedValues.length).fill(null)];
        } else {
          predictedLinePrices.value = trimmedValues;
        }
      } else {
        predictedLineMonths.value = generateSequentialMonths(baseMonth, predictedValues.length);
        predictedLinePrices.value = predictedValues;
      }

      // 将预测数据的月份添加到 allMonths 中
      if (predictedLineMonths.value.length > 0) {
        allMonths.value = [...new Set([...allMonths.value, ...predictedLineMonths.value])];
      }

      const filteredPredictedLine = predictedLineMonths.value
        .map((month, idx) => ({
          month,
          price: predictedLinePrices.value[idx]
        }))
        .filter((item) => typeof item.price === 'number' && item.price !== null && !Number.isNaN(item.price)) as {
        month: string;
        price: number;
      }[];

      if (filteredPredictedLine.length) {
        predictedLineMin.value = filteredPredictedLine.reduce((prev, curr) => (curr.price < prev.price ? curr : prev));
        predictedLineMax.value = filteredPredictedLine.reduce((prev, curr) => (curr.price > prev.price ? curr : prev));
      } else {
        predictedLineMin.value = null;
        predictedLineMax.value = null;
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

      const minPredictEntry = predictedLineMin.value;
      const maxPredictEntry = predictedLineMax.value;

      if (minPredictEntry && maxPredictEntry && minPredictEntry.price !== maxPredictEntry.price) {
        const minText = formatPriceValue(minPredictEntry.price);
        const maxText = formatPriceValue(maxPredictEntry.price);
        if (minText && maxText) {
          marketAnalysis.value.priceRange = `预测价格区间为${minText}~${maxText}元/kg`;
        }
      } else if (data.priceRange) {
        marketAnalysis.value.priceRange = data.priceRange;
      }

      const suggestionMonth = minPredictEntry?.month ? formatMonthDisplay(minPredictEntry.month) : '';
      if (suggestionMonth) {
        marketAnalysis.value.suggestion = `建议采购窗口为${suggestionMonth}`;
      } else if (data.suggestion || data.predictionSuggestion) {
        marketAnalysis.value.suggestion = data.suggestion || data.predictionSuggestion;
      }
    } else {
      // 重置数据
      resetChartData();
    }
  } catch (error) {
    console.error('获取价格预测数据失败:', error);
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

const handleQuery = () => {
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
  background-color: #fff;

  .query-form {
    width: 100%;
    margin-bottom: 20px;
    position: relative;
    z-index: 10;
    display: grid;
    grid-template-columns: repeat(3, minmax(280px, 1fr));
    gap: 12px 40px;

    :deep(.el-form-item) {
      margin: 0 !important;
      width: 100%;
    }

    :deep(.el-form-item__label) {
      padding-right: 8px;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
      width: 100%;
    }

    // 让下拉框等控件撑满
    :deep(.full-width-select),
    :deep(.el-select),
    :deep(.el-input),
    :deep(.region-select) {
      width: 100%;
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
    position: relative;
    padding: 15px 15px 0px 15px;
    z-index: 1;

    .chart-section {
      flex: 2;
      background-color: #fff;
      border-radius: 4px;
      padding: 0 24px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      min-height: 500px;

      .chart-title {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 24px;
        color: #303133;
        flex-shrink: 0;

        .title-marker {
          width: 3px;
          height: 14px;
          background: #000000;
          border-radius: 2px;
        }

        h3 {
          font-size: 16px;
          font-weight: bold;
          margin: 0;
        }
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
        background-image: url('@/assets/images/marketConditions/scbg.png');
        background-repeat: no-repeat;
        background-size: 100% 100%; // 背景图大小与容器一致
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
        background: #f6f7fb;
        padding: 20px;
        border-radius: 4px 4px 4px 4px;
        border: 1px solid rgba(226, 226, 226, 0.6);

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

            .legend-text {
              font-size: 13px;
              color: #606266;
            }
          }
        }
      }
    }
  }

  .legend-icon-img {
    width: 24px;
    height: 24px;
    object-fit: contain;
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
