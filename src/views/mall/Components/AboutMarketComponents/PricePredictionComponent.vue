<!--
  标题: PricePredictionComponent
  功能: 价格预测与分析
  说明: 价格预测与分析 Tabs页面
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-12-13
-->
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
            <GoodsCategorySelect class="full-width-select" v-model="normalizedVariety" @categoryChange="handleCategoryChange" />
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
            <div class="content-item">1. <span>整体趋势:</span> {{ marketAnalysis.overallTrend || '暂无数据' }}</div>
            <div class="content-item">2. <span>价格区间:</span> {{ marketAnalysis.priceRange || '暂无数据' }}</div>
            <div class="content-item">3. <span>预测建议:</span> {{ marketAnalysis.suggestion || '暂无数据' }}</div>
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
import { ref, reactive, onMounted, computed, onErrorCaptured, nextTick, watch } from 'vue';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import PricePredictionChart from './PricePredictionChart.vue';
import { pricePredictionList, fileAnalysis } from '@/api/mall/marketComponent';
import historicalLineIcon from '@/assets/images/marketConditions/gw.png';
import historicalMaxIcon from '@/assets/images/marketConditions/gwMax.png';
import historicalMinIcon from '@/assets/images/marketConditions/gwMin.png';
import predictedLineIcon from '@/assets/images/marketConditions/yc.png';
import predictedMaxIcon from '@/assets/images/marketConditions/ycMax.png';
import predictedMinIcon from '@/assets/images/marketConditions/ycMin.png';

const queryFormRef = ref();
const loading = ref(false);

// 查询参数（产地/品种/时间范围）
const queryParams = reactive({
  origin: [] as string[],
  variety: [] as string[],
  timeRange: '12'
});

// 品种值，确保始终是数组
const normalizedVariety = computed({
  get: () => {
    return Array.isArray(queryParams.variety) ? queryParams.variety : [];
  },
  set: (val: any) => {
    queryParams.variety = Array.isArray(val) ? val : [];
  }
});

//  清空时报错
onErrorCaptured((err: any, instance, info) => {
  if (err && err.message && err.message.includes('length') && err.stack && err.stack.includes('GoodsCategorySelect')) {
    // 确保值被重置
    nextTick(() => {
      normalizedVariety.value = [];
    });
    return false; // 阻止错误继续传播
  }
  return true; // 其他错误正常传播
});

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
// 折线图显示用的月份与价格（历史/预测）
const historicalLineMonths = ref<string[]>([]);
const historicalLinePrices = ref<number[]>([]);
const predictedLineMonths = ref<string[]>([]);
const predictedLinePrices = ref<number[]>([]);
// 极值标记（最低/最高点）
const predictedLineMin = ref<{ month: string; price: number } | null>(null);
const predictedLineMax = ref<{ month: string; price: number } | null>(null);
const pastHighest = ref<{ month: string; price: number }>({ month: '', price: 0 });
const pastLowest = ref<{ month: string; price: number }>({ month: '', price: 0 });
const predictedHighest = ref<{ month: string; price: number }>({ month: '', price: 0 });
const predictedLowest = ref<{ month: string; price: number }>({ month: '', price: 0 });
// Y 轴范围配置
const chartYAxisMin = ref(0);
const chartYAxisMax = ref(5);
const chartYAxisInterval = ref(1);

//  将月份数据统一格式化为 "YYYY-MM"
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

/**
 * 将 Date 对象转换为 "YYYY-MM" 格式
 */
const formatMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * 从起始月份开始，生成指定数量的连续月份
 */
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

/**
 * 获取上一个月份
 */
const getPreviousMonth = (month: string) => {
  const normalized = normalizeMonthLabel(month);
  if (!normalized) return normalized;
  const [yearStr, monthStr] = normalized.split('-');
  const date = new Date(Number(yearStr) || 1970, (Number(monthStr) || 1) - 1, 1);
  date.setMonth(date.getMonth() - 1);
  return formatMonth(date);
};

/**
 * 将各种格式的价格值转换为数字，无效值返回 null
 */
const parsePriceValue = (val: any) => {
  if (val === undefined || val === null || val === '' || val === '-') return null;
  const num = Number(val);
  if (Number.isNaN(num)) return null;
  return num;
};

/**
 * 将 X 轴和 Y 轴数据映射到基础月份数组上，生成对应的价格序列
 */
const buildSeriesByXAxis = (baseMonths: string[], xAxis?: any[], yAxis?: any[]): (number | null)[] => {
  const map = new Map<string, number | null>();
  if (Array.isArray(xAxis) && Array.isArray(yAxis)) {
    xAxis.forEach((label: any, idx: number) => {
      map.set(normalizeMonthLabel(label), parsePriceValue(yAxis[idx]));
    });
  }
  return baseMonths.map((month) => map.get(month) ?? null);
};

/**
 * 如果系列为空则填充顺序值
 */
const fillSequentialIfEmpty = (series: (number | null)[], baseMonths: string[], values?: any[]) => {
  if (series.some((val) => val !== null) || !Array.isArray(values)) return series;
  return baseMonths.map((_, idx) => parsePriceValue(values[idx]));
};

/**
 * 从价格系列中找出最大值或最小值及其对应的月份
 */
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

/**
 * 将价格数字格式化为字符串，保留两位小数
 */
const formatPriceValue = (price?: number | null) => {
  if (price === undefined || price === null || Number.isNaN(price)) return '';
  const fixed = Number(price).toFixed(2);
  return fixed.endsWith('.00') ? fixed.slice(0, -3) : fixed;
};

/**
 * 将 "YYYY-MM" 格式转换为 "X月"
 */
const formatMonthDisplay = (month: string) => {
  const normalized = normalizeMonthLabel(month);
  if (!normalized) return '';
  const [, monthStr] = normalized.split('-');
  if (!monthStr) return '';
  return `${Number(monthStr)}月`;
};

// 市场分析数据（右侧卡片内容）
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
// 种子变量
const seedName = ref('小麦种子');
// 图表标题
const chartTitle = computed(() => {
  const timeRangeMap: Record<string, string> = {
    '1': '1个月',
    '3': '3个月',
    '6': '6个月',
    '12': '12个月'
  };
  return `${seedName.value}未来${timeRangeMap[queryParams.timeRange] || '12个月'}价格预测走势图`;
});

// 标记是否正在处理分类变化
const isHandlingCategoryChange = ref(false);

// 品种分类变化处理：同步品种、种子名并触发查询
const handleCategoryChange = (value: string[] | null | undefined, labels?: string[]) => {
  try {
    isHandlingCategoryChange.value = true;

    // 处理 undefined、null 或非数组的情况
    if (!value || !Array.isArray(value)) {
      normalizedVariety.value = [];
      seedName.value = '小麦种子'; // 重置为默认值
      fetchPricePrediction();
      return;
    }

    // 过滤掉空值、null、undefined
    const filteredValue = value.filter((item: any) => {
      if (item === null || item === undefined) {
        return false;
      }
      const str = String(item || '').trim();
      return str !== '' && str !== 'null' && str !== 'undefined';
    });

    normalizedVariety.value = filteredValue;

    // 更新种子名称
    if (labels && Array.isArray(labels) && labels.length > 0) {
      seedName.value = labels[labels.length - 1];
    } else if (filteredValue.length > 0) {
      seedName.value = seedName.value || '小麦种子';
    } else {
      seedName.value = '小麦种子';
    }

    fetchPricePrediction();
  } catch (error) {
    normalizedVariety.value = [];
    seedName.value = '小麦种子';
    fetchPricePrediction();
  } finally {
    nextTick(() => {
      isHandlingCategoryChange.value = false;
    });
  }
};

// 监听品种变化，确保清空时也调用接口
watch(
  () => normalizedVariety.value,
  (newVal, oldVal) => {
    // 如果正在处理分类变化事件，跳过（避免重复调用）
    if (isHandlingCategoryChange.value) {
      return;
    }

    // 如果品种被清空（从有值变为空数组），调用接口
    const wasEmpty = !oldVal || !Array.isArray(oldVal) || oldVal.length === 0;
    const isEmpty = !newVal || !Array.isArray(newVal) || newVal.length === 0;

    // 如果从有值变为空，或者从空变为空（确保初始化时也会调用）
    if (!wasEmpty && isEmpty) {
      seedName.value = '小麦种子';
      fetchPricePrediction();
    } else if (wasEmpty && isEmpty && oldVal !== newVal) {
      seedName.value = '小麦种子';
      fetchPricePrediction();
    }
  },
  { deep: true }
);

// 产地变化处理：更新区域编码并重新查询
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
  fetchPricePrediction();
};

/**
 * 当用户选择不同的时间范围时，重新获取价格预测数据
 */
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

    // 获取品种ID
    const varietyArray = normalizedVariety.value;
    const filteredVariety = varietyArray.filter((item: any) => {
      const str = String(item || '').trim();
      return str !== '' && str !== 'null' && str !== 'undefined';
    });
    const goodsCategoryId = filteredVariety.length > 0 ? filteredVariety[filteredVariety.length - 1] : '';

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

      // 组装动态提示词，基于当前品种与历史/预测数据
      const histMonths = (historicalLineMonths.value || []).filter((m) => !!m);
      const histPrices = (historicalLinePrices.value || []).map((val) => {
        const num = Number(val);
        return Number.isFinite(num) ? Number(num).toFixed(2) : null;
      });
      const histRange = histMonths.length ? `${histMonths[0]}至${histMonths[histMonths.length - 1]}` : '历史区间缺失';

      const predictedPairs = predictedLineMonths.value.map((m, idx) => [normalizeMonthLabel(m), predictedLinePrices.value[idx]] as [string, any]);
      const validPredPairs = predictedPairs.filter(
        ([month, price]) => !!month && price !== null && price !== undefined && !Number.isNaN(Number(price))
      );
      const predRange = validPredPairs.length ? `${validPredPairs[0][0]}至${validPredPairs[validPredPairs.length - 1][0]}` : '预测区间缺失';
      const predictedMap: Record<string, string> = {};
      validPredPairs.forEach(([month, price]) => {
        predictedMap[month] = Number(price).toFixed(2);
      });

      const seedText = seedName.value || '种子';
      const timeRangeToMonths: Record<string, number> = {
        '1': 1,
        '3': 3,
        '6': 6,
        '12': 12
      };
      const futureMonthsCount = timeRangeToMonths[queryParams.timeRange] || validPredPairs.length || predictedPairs.length || 12;
      const futureMonthsLabel = `${futureMonthsCount}个月`;
      const extractPrompt = `你是一名农业市场分析师，需要基于提供的${seedText}月度售价数据，进行市场趋势分析和解读。以下为历史数据和预测数据：\n  历史数据（${histRange}）：\n  时间序列：${JSON.stringify(histMonths)}\n  价格序列：${JSON.stringify(histPrices)}\n  预测数据（${predRange}）：\n  价格预测：${JSON.stringify(predictedMap)}\n\n  请基于以上数据，完成以下分析任务：\n  总结历史价格走势：分析历史数据的波动趋势，识别关键变化点（如峰值、谷值）、季节性模式或长期趋势。\n  解读预测数据：描述未来${futureMonthsLabel}的价格预测变化，指出预期的高点、低点及整体走势。\n  提供整体市场展望：结合历史趋势和预测数据，评估市场稳定性、风险或机遇，并给出对种子价格未来表现的见解。\n  输出格式：以连贯的文本段落输出市场分析,不超过50字。开头可参考示例（如\"整体趋势：未来${futureMonthsLabel}，${seedText}价格预计趋于平稳...\"），确保语言专业、清晰，并基于数据支持结论。`;

      // 调用文件分析接口
      let fileAnalysisInfo = '';
      const hasOrigin = !!regionCodes.regionCode;
      const hasVariety = !!goodsCategoryId;
      const hasTimeRange = !!queryParams.timeRange;
      if (hasOrigin && hasVariety && hasTimeRange) {
        fileAnalysisInfo = await fetchFileAnalysis(extractPrompt);
      }

      // 展示插件输出的整体趋势
      let pluginInfo =
        fileAnalysisInfo || data?.pluginOutput?.info || data?.responseData?.[2]?.pluginOutput?.info || data?.responseData?.[0]?.pluginOutput?.info;
      // 去掉返回文本中的“整体趋势：”前缀
      if (typeof pluginInfo === 'string') {
        pluginInfo = pluginInfo.replace(/^整体趋势[:：]\s*/i, '');
      }
      marketAnalysis.value.overallTrend = pluginInfo || '';

      const minPredictEntry = predictedLineMin.value;
      const maxPredictEntry = predictedLineMax.value;

      // 处理价格区间
      if (minPredictEntry && maxPredictEntry && minPredictEntry.price !== maxPredictEntry.price) {
        const minText = formatPriceValue(minPredictEntry.price);
        const maxText = formatPriceValue(maxPredictEntry.price);
        if (minText && maxText) {
          marketAnalysis.value.priceRange = `预测价格区间为 ${minText} ~ ${maxText} 元/kg`;
        } else {
          marketAnalysis.value.priceRange = '暂无数据';
        }
      } else if (data.priceRange) {
        marketAnalysis.value.priceRange = data.priceRange;
      } else {
        marketAnalysis.value.priceRange = '暂无数据';
      }

      // 处理预测建议
      const suggestionMonth = minPredictEntry?.month ? formatMonthDisplay(minPredictEntry.month) : '';
      if (suggestionMonth) {
        marketAnalysis.value.suggestion = `建议采购单窗口期为${suggestionMonth}`;
      } else if (data.suggestion || data.predictionSuggestion) {
        marketAnalysis.value.suggestion = data.suggestion || data.predictionSuggestion;
      } else {
        marketAnalysis.value.suggestion = '暂无数据';
      }

      // 如果没有整体趋势数据，重置为暂无数据
      if (!marketAnalysis.value.overallTrend) {
        marketAnalysis.value.overallTrend = '暂无数据';
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

// 重置图表数据与分析文案
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

/**
 * 更新图表 Y 轴范围
 */
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

// 文件分析接口调用状态
const isFileAnalysisLoading = ref(false);

// 调用文件分析接口，支持传入动态 prompt
const fetchFileAnalysis = async (extractPrompt: string) => {
  // 防止重复提交
  if (isFileAnalysisLoading.value) {
    return '';
  }

  isFileAnalysisLoading.value = true;
  try {
    // 调用 fileAnalysis 接口，使用动态 prompt
    const analysisParams = {
      variables: {
        extract_prompt: extractPrompt
      },
      appId: '693b8b96dd48d8d992960426',
      detail: false,
      stream: false
    };

    const res = await fileAnalysis(analysisParams);
    const pluginInfo =
      res?.data?.pluginOutput?.info || res?.data?.responseData?.[2]?.pluginOutput?.info || res?.data?.responseData?.[0]?.pluginOutput?.info;

    return pluginInfo || '';
  } catch (error: any) {
    if (error?.message && error.message.includes('数据正在处理')) {
      return '';
    }
    return '';
  } finally {
    setTimeout(() => {
      isFileAnalysisLoading.value = false;
    }, 1000);
  }
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
    margin-top: 15px;
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
        display: flex;
        flex-direction: column;
        max-height: 450px; // 固定高度，超出出现滚动条

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
          flex: 1;
          overflow-y: auto;
          padding-right: 4px;

          // 优化滚动条样式（可选）
          &::-webkit-scrollbar {
            width: 6px;
          }
          &::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
            border-radius: 3px;
          }

          .content-item {
            font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
            margin-bottom: 12px;
            font-size: 14px;
            color: #1d2129;
            font-weight: 400;
            line-height: 1.7;
            word-break: break-word;
            white-space: normal;

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
