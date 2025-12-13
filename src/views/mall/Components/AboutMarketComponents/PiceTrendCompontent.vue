<!--
  标题: PiceTrendCompontent
  功能: 价格走势页面
  说明: 价格走势
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-12-13
-->
<template>
  <div class="price-trend-component">
    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧：图表区域 -->
      <div class="chart-section">
        <div class="filter-row">
          <el-form ref="queryFormRef" :model="queryParams" inline :label-width="60" class="query-form">
            <el-form-item label="品种:" prop="variety">
              <GoodsCategorySelect v-model="normalizedVariety" @categoryChange="handleCategoryChange" style="width: 250px" />
            </el-form-item>
            <el-form-item label="产地:" prop="origin">
              <RegionSelect v-model="queryParams.origin" @regionChange="handleRegionChange" style="width: 250px" />
            </el-form-item>
          </el-form>
          <!-- 时间范围选择 -->
          <div class="time-range-selector">
            <div class="range-pill" :class="{ active: activeTimeRange === 7 }" @click="changeTimeRange(7)">近7天</div>
            <div class="range-pill" :class="{ active: activeTimeRange === 30 }" @click="changeTimeRange(30)">近30天</div>
            <div class="range-pill" :class="{ active: activeTimeRange === 60 }" @click="changeTimeRange(60)">近60天</div>
          </div>
        </div>
        <!-- 查询表单 -->

        <PriceTrendChart
          :title="`${seedName}价格（近${activeTimeRange}日）`"
          unit="单位: 元/kg"
          :dates="currentChartData.dates"
          :prices="currentChartData.prices"
          :y-axis-min="yAxisMin"
          :y-axis-max="yAxisMax"
          :y-axis-interval="yAxisInterval"
          v-loading="loading"
        />
      </div>

      <!-- 右侧：价格说明栏 -->
      <div class="summary-section">
        <!-- 当日价格卡片 -->
        <div class="price-card today-card">
          <div class="card-header">
            <div class="title-marker"></div>
            <div class="card-title">当日价格</div>
          </div>
          <div class="today-body">
            <div class="card-info">
              <p class="card-metric">
                当日均价 (元/kg) ：<span>{{ priceStats.todayPrice.toFixed(2) }}</span>
              </p>
              <p class="price-change" :class="priceStats.priceChange >= 0 ? 'text-red' : 'text-green'">
                <span style="font-size: 12px; color: #7a7a7a; font-weight: 400"> 相较昨日价格：</span>
                <span>{{ priceStats.priceChange >= 0 ? '+' : '' }}{{ priceStats.priceChange.toFixed(2) }}%</span>

                <img class="trend-img" :src="getTrendIcon(priceStats.priceChange)" alt="走势图" />
              </p>
            </div>
            <div class="card-chart">
              <div ref="miniChartContainer" class="mini-chart-container"></div>
            </div>
          </div>
        </div>

        <!-- 近7日价格卡片 -->
        <div class="price-card seven-days-card">
          <div class="card-header">
            <div class="title-marker2"></div>
            <div class="card-title2">近7日价格</div>
          </div>
          <div class="card-content">
            <p class="card-metric">
              近7日最高价 (元/kg) : <span style="font-size: 18px">{{ priceStats.maxPrice.toFixed(2) }}</span>
            </p>
            <p class="card-metric">
              近7日最低价 (元/kg) : <span style="font-size: 18px">{{ priceStats.minPrice.toFixed(2) }}</span>
            </p>
            <p class="card-metric">
              近7日均价 (元/kg) : <span style="font-size: 18px"> {{ priceStats.avgPrice.toFixed(2) }}</span>
            </p>
            <p class="price-trend">
              近7日价格趋势 : <span class="trend-text">{{ priceStats.trend }}</span>
            </p>
          </div>
        </div>
        <el-button type="primary" class="heatmap-button" @click="viewHeatmap">查看区域价格差异热力图</el-button>
      </div>
    </div>

    <!-- 热门推荐表格 -->
    <div class="recommendations-section">
      <div class="recommendation-title">
        <span class="title-marker"></span>
        <h3 class="section-title">热门推荐</h3>
      </div>
      <el-table :data="recommendationTableData" border v-loading="recommendationLoading">
        <template #empty>
          <el-empty description="暂无数据" />
        </template>
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="time" label="销售日期" align="center" width="200" />
        <el-table-column prop="variety" label="品种" align="center" width="200" />
        <el-table-column prop="origin" label="所在产地" align="center" min-width="200" :show-overflow-tooltip="true" />
        <el-table-column prop="price" label="价格" align="center" width="200">
          <template #default="{ row }">
            <span class="price-text">{{ row.price }}</span>
          </template>
        </el-table-column>
        <el-table-column label="升降(%)" align="center" width="200">
          <template #default="{ row }">
            <span v-if="row.change === '-' || row.change === 0 || row.change === '0'" class="text-gray">-</span>
            <span v-else-if="row.change > 0" class="change-tag change-up">+{{ row.change }}%</span>
            <span v-else class="change-tag change-down">+{{ Math.abs(row.change) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="走势图" align="center" width="200">
          <template #default="{ row }">
            <img class="trend-img" :src="getTrendIcon(row.change)" alt="走势图" />
          </template>
        </el-table-column>
        <el-table-column label="专项报告" align="center">
          <template #default="{ row }">
            <el-link type="primary" class="report-link" @click="viewReport(row)">价格专项报告</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 价格专项报告弹窗 -->
    <PriceSpecialReportDialog
      v-model:visible="reportDialogVisible"
      :report-info="reportInfo"
      :goods-category-id="reportQueryParams.goodsCategoryId"
      :region-code="reportQueryParams.regionCode"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, getCurrentInstance, watch, nextTick, onErrorCaptured } from 'vue';
import { useRouter } from 'vue-router';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import PriceTrendChart from './PriceTrendChart.vue';
import PriceSpecialReportDialog from './PriceSpecialReportDialog.vue';
import { priceActionList, hotRecommendationList, priceExplanationList, heatmapList } from '@/api/mall/marketComponent';
import { eventBus } from '@/utils/eventBus';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import type { ComponentInternalInstance } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import trendDownIcon from '@/assets/images/marketConditions/down.png';
import trendUpIcon from '@/assets/images/marketConditions/up.png';
import trendFlatIcon from '@/assets/images/marketConditions/flat.png';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const activeTimeRange = ref(7);
const categoryList = ref<any[]>([]); // 分类列表数据

// 查询参数
const queryParams = reactive({
  variety: [] as string[], // 三级分类数组
  origin: [] as string[] // 区域选择路径数组
});

// 规范化品种值，确保始终是数组
const normalizedVariety = computed({
  get: () => {
    return Array.isArray(queryParams.variety) ? queryParams.variety : [];
  },
  set: (val: any) => {
    queryParams.variety = Array.isArray(val) ? val : [];
  }
});

// 捕获子组件错误
onErrorCaptured((err: any, instance, info) => {
  if (err && err.message && err.message.includes('length') && err.stack && err.stack.includes('GoodsCategorySelect')) {
    console.warn('品种选择器清空时的错误已捕获:', err.message);
    // 确保值被重置
    nextTick(() => {
      normalizedVariety.value = [];
    });
    return false; // 阻止错误继续传播
  }
  return true; // 其他错误正常传播
});

// 区域代码
const regionCodes = reactive({
  provinceCode: '',
  cityCode: '',
  regionCode: ''
});

// 图表数据
const currentChartData = ref({
  dates: [] as string[],
  prices: [] as number[]
});
const yAxisMin = ref<number | undefined>(undefined);
const yAxisMax = ref<number | undefined>(undefined);
const yAxisInterval = ref<number | undefined>(undefined);

// 价格统计数据
const priceStats = ref({
  todayPrice: 0,
  yesterdayPrice: 0,
  priceChange: 0,
  maxPrice: 0,
  minPrice: 0,
  avgPrice: 0,
  trend: '暂无数据'
});

// 热门推荐表格数据
const recommendationTableData = ref<any[]>([]);
const recommendationLoading = ref(false);

// 小折线图相关
const miniChartContainer = ref<HTMLElement | null>(null);
let miniChartInstance: ECharts | null = null;

// 价格专项报告弹窗相关
const reportDialogVisible = ref(false);
const reportInfo = ref({
  variety: '--',
  origin: '--'
});
const reportQueryParams = reactive({
  goodsCategoryId: '',
  regionCode: '',
  pageNum: 1,
  pageSize: 10
});

// 根据三级ID查找完整路径
const findCategoryPath = (categoryId: string, categories: any[]): string[] => {
  const findPath = (id: string, list: any[], path: string[] = []): string[] | null => {
    for (const item of list) {
      const currentPath = [...path, item.id];
      if (item.id === id) {
        return currentPath;
      }
      if (item.children && item.children.length > 0) {
        const result = findPath(id, item.children, currentPath);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };
  return findPath(categoryId, categories) || [categoryId];
};

const applyExternalFilters = async (payload: any) => {
  if (!payload) return;
  const goodsCategoryId = payload.goodsCategoryId || '';

  // 如果有分类ID，尝试查找完整路径
  if (goodsCategoryId && categoryList.value.length > 0) {
    const categoryPath = findCategoryPath(goodsCategoryId, categoryList.value);
    normalizedVariety.value = categoryPath;
  } else {
    // 如果没有分类列表数据，先设置为数组
    normalizedVariety.value = goodsCategoryId ? [goodsCategoryId] : [];
  }

  regionCodes.provinceCode = payload.provinceCode || '';
  regionCodes.cityCode = payload.cityCode || '';
  regionCodes.regionCode = payload.regionCode || '';

  // RegionSelect 需要代码数组
  const originPath: string[] = [];
  if (payload.provinceCode) originPath.push(payload.provinceCode);
  if (payload.cityCode) originPath.push(payload.cityCode);
  if (payload.regionCode) originPath.push(payload.regionCode);
  queryParams.origin = originPath;

  // 设置默认时间范围为7天，对应 priceActionDays = 1
  activeTimeRange.value = 7;

  refreshAllData();
};

// 获取价格走势数据
const fetchPriceData = async () => {
  loading.value = true;
  try {
    // 转换时间范围为接口参数
    let priceActionDays = 1;
    if (activeTimeRange.value === 7) {
      priceActionDays = 1;
    } else if (activeTimeRange.value === 30) {
      priceActionDays = 2;
    } else if (activeTimeRange.value === 60) {
      priceActionDays = 3;
    }

    // 获取品种ID
    const varietyArray = normalizedVariety.value;
    const filteredVariety = varietyArray.filter((item: any) => {
      const str = String(item || '').trim();
      return str !== '' && str !== 'null' && str !== 'undefined';
    });
    const goodsCategoryId = filteredVariety.length > 0 ? filteredVariety[filteredVariety.length - 1] : '';

    const params: any = {
      priceActionDays,
      regionCode: regionCodes.regionCode || '',
      goodsCategoryId
    };

    const response = await priceActionList(params);
    if (response && response.code === 200) {
      const data = response.data || {};
      // 处理返回数据
      const dates: string[] = [];
      const prices: number[] = [];

      //  xAxis 和 yAxis 数组
      if (data.xAxis && Array.isArray(data.xAxis)) {
        data.xAxis.forEach((dateStr: string) => {
          // 格式化日期为 MM-DD 格式
          const date = new Date(dateStr);
          dates.push(`${date.getMonth() + 1}-${date.getDate()}`);
        });
      }

      if (data.yAxis && Array.isArray(data.yAxis)) {
        data.yAxis.forEach((priceStr: string | number) => {
          prices.push(Number(priceStr || 0));
        });
      }

      currentChartData.value = {
        dates: dates.length > 0 ? dates : [],
        prices: prices.length > 0 ? prices : []
      };
      updateAxisRange(currentChartData.value.prices);
      // 更新小折线图
      nextTick(() => {
        updateMiniChart();
      });
    } else {
      currentChartData.value = { dates: [], prices: [] };
      updateAxisRange([]);
    }
  } catch (error) {
    currentChartData.value = { dates: [], prices: [] };
    updateAxisRange([]);
  } finally {
    loading.value = false;
  }
};

const updateAxisRange = (prices: number[]) => {
  const values = prices.filter((price) => typeof price === 'number' && !Number.isNaN(price));
  if (!values.length) {
    yAxisMin.value = undefined;
    yAxisMax.value = undefined;
    yAxisInterval.value = undefined;
    return;
  }

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const padding = Math.max(1, (maxVal - minVal) * 0.1);
  const rawMin = Math.max(0, minVal - padding);
  const rawMax = maxVal + padding;

  yAxisMin.value = Number(rawMin.toFixed(2));
  yAxisMax.value = Number(rawMax.toFixed(2));

  const range = yAxisMax.value - yAxisMin.value;
  yAxisInterval.value = Math.max(1, Math.ceil(range / 6));
};

const refreshAllData = () => {
  fetchPriceData();
  fetchPriceExplanation();
  fetchHotRecommendation();
};

// 初始化小折线图
const initMiniChart = () => {
  if (!miniChartContainer.value) return;

  miniChartInstance = echarts.init(miniChartContainer.value);

  // 监听容器大小变化
  if (miniChartContainer.value) {
    const resizeObserver = new ResizeObserver(() => {
      miniChartInstance?.resize();
    });
    resizeObserver.observe(miniChartContainer.value);
  }

  updateMiniChart();

  // 延迟调整
  setTimeout(() => {
    miniChartInstance?.resize();
    updateMiniChart();
  }, 100);
};

// 更新小折线图
const updateMiniChart = () => {
  if (!miniChartInstance || !currentChartData.value.prices.length) return;

  const prices = currentChartData.value.prices;
  const dates = currentChartData.value.dates;

  // 只显示最近的数据点
  const displayPrices = prices;
  const displayDates = dates.map((_, index) => index + 1); // 使用索引作为 x 轴

  // 过滤有效价格值
  const validPrices = displayPrices.filter((p) => p !== null && p !== undefined && !isNaN(p) && p >= 0);

  if (validPrices.length === 0) return;

  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);
  const priceRange = maxPrice - minPrice;

  // 如果价格范围很小，使用更大的 padding；如果范围很大，使用较小的 padding
  let padding: number;
  if (priceRange === 0) {
    padding = Math.max(1, maxPrice * 0.2);
  } else if (priceRange < 1) {
    padding = priceRange * 0.3;
  } else {
    padding = priceRange * 0.12;
  }

  const option = {
    grid: {
      left: 3,
      right: 3,
      top: 3,
      bottom: 3,
      containLabel: false
    },
    xAxis: {
      type: 'category',
      data: displayDates,
      show: false,
      boundaryGap: false
    },
    yAxis: {
      type: 'value',
      show: false,
      min: Math.max(0, minPrice - padding),
      max: maxPrice + padding,
      scale: false
    },
    series: [
      {
        type: 'line',
        data: displayPrices,
        smooth: 0.4,
        symbol: 'none',
        sampling: 'lttb',
        lineStyle: {
          width: 2.5,
          color: '#108C58'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(16,140,88,0.25)'
            },
            {
              offset: 1,
              color: 'rgba(16,140,88,0)'
            }
          ])
        },
        animation: false,
        emphasis: {
          disabled: true
        }
      }
    ]
  };

  miniChartInstance.setOption(option, true);

  // 确保图表正确渲染
  nextTick(() => {
    miniChartInstance?.resize();
  });
};

// 切换时间范围
const changeTimeRange = (days: number) => {
  activeTimeRange.value = days;
  fetchPriceData();
};
// 种子变量
const seedName = ref('小麦种子');

// 标记是否正在处理分类变化
const isHandlingCategoryChange = ref(false);

// 品种分类变化处理
const handleCategoryChange = (value: string[] | null | undefined, labels?: string[]) => {
  try {
    isHandlingCategoryChange.value = true;

    // 处理 undefined、null 或非数组的情况
    if (!value || !Array.isArray(value)) {
      normalizedVariety.value = [];
      seedName.value = '小麦种子'; // 重置为默认值
      refreshAllData();
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
      // 如果没有 labels，保持当前名称或使用默认值
      seedName.value = seedName.value || '小麦种子';
    } else {
      seedName.value = '小麦种子';
    }

    refreshAllData();
  } catch (error) {
    normalizedVariety.value = [];
    seedName.value = '小麦种子';
    refreshAllData();
  } finally {
    // 延迟重置标志
    nextTick(() => {
      isHandlingCategoryChange.value = false;
    });
  }
};

// 监听品种变化
watch(
  () => normalizedVariety.value,
  (newVal, oldVal) => {
    // 如果正在处理分类变化事件，跳过
    if (isHandlingCategoryChange.value) {
      return;
    }

    // 如果品种被清空，调用接口
    const wasEmpty = !oldVal || !Array.isArray(oldVal) || oldVal.length === 0;
    const isEmpty = !newVal || !Array.isArray(newVal) || newVal.length === 0;

    if (!wasEmpty && isEmpty) {
      seedName.value = '小麦种子';
      refreshAllData();
    } else if (wasEmpty && isEmpty && oldVal !== newVal) {
      seedName.value = '小麦种子';
      refreshAllData();
    }
  },
  { deep: true }
);

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
  refreshAllData();
};

// 获取昨天的日期（YYYY-MM-DD格式）
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取价格说明数据
const fetchPriceExplanation = async () => {
  try {
    // 获取品种ID
    const varietyArray = normalizedVariety.value;
    const filteredVariety = varietyArray.filter((item: any) => {
      const str = String(item || '').trim();
      return str !== '' && str !== 'null' && str !== 'undefined';
    });
    const goodsCategoryId = filteredVariety.length > 0 ? filteredVariety[filteredVariety.length - 1] : '';

    const params: any = {
      goodsCategoryId: goodsCategoryId || '',
      regionCode: regionCodes.regionCode || ''
    };

    const response = await priceExplanationList(params);
    if (response && response.code === 200) {
      const data = response.data || {};

      // 1:趋于平稳、2:略有上升、3:大幅上升、4:略有下降、5:大幅下降
      let trendText = '';
      if (data.sevenDaysPriceTrend !== undefined && data.sevenDaysPriceTrend !== null) {
        const trendValue = String(data.sevenDaysPriceTrend);
        switch (trendValue) {
          case '1':
            trendText = '趋于平稳';
            break;
          case '2':
            trendText = '略有上升';
            break;
          case '3':
            trendText = '大幅上升';
            break;
          case '4':
            trendText = '略有下降';
            break;
          case '5':
            trendText = '大幅下降';
            break;
          default:
            trendText = '趋于平稳';
        }
      }

      // 接口返回的数据到价格统计
      priceStats.value = {
        todayPrice: Number(data.yesterdayPrice || 0), // 当日均价
        yesterdayPrice: Number(data.dayBeforeYesterdayPrice || 0),
        priceChange: Number(data.dayToDayChangeRate || 0), // 相较昨日价格
        maxPrice: Number(data.sevenDaysHighPrice || 0), // 近7日最高价
        minPrice: Number(data.sevenDaysLowPrice || 0), // 近7日最低价
        avgPrice: Number(data.sevenDaysPriceAvg || 0), // 近7日均价
        trend: trendText // 近7日价格走势
      };
    } else {
      // 重置为默认值
      priceStats.value = {
        todayPrice: 0,
        yesterdayPrice: 0,
        priceChange: 0,
        maxPrice: 0,
        minPrice: 0,
        avgPrice: 0,
        trend: '暂无数据'
      };
    }
  } catch (error) {
    // 重置为默认值
    priceStats.value = {
      todayPrice: 0,
      yesterdayPrice: 0,
      priceChange: 0,
      maxPrice: 0,
      minPrice: 0,
      avgPrice: 0,
      trend: '暂无数据'
    };
  }
};

// 获取热门推荐数据
const fetchHotRecommendation = async () => {
  recommendationLoading.value = true;
  try {
    // 获取品种ID
    const varietyArray = normalizedVariety.value;
    const filteredVariety = varietyArray.filter((item: any) => {
      const str = String(item || '').trim();
      return str !== '' && str !== 'null' && str !== 'undefined';
    });
    const goodsCategoryId = filteredVariety.length > 0 ? filteredVariety[filteredVariety.length - 1] : '';

    const params: any = {
      goodsCategoryId: goodsCategoryId || '',
      regionCode: regionCodes.regionCode || '',
      analysisDate: getYesterdayDate()
    };

    const response = await hotRecommendationList(params);
    if (response && response.code === 200) {
      const data = response.data || response.rows || [];
      // 接口返回的数据到表格需要的格式
      recommendationTableData.value = (Array.isArray(data) ? data : []).map((item: any) => {
        // 格式化日期：从 "2025-11-15 00:00:00"
        let time = '--';
        if (item.analysisDate) {
          const dateStr = item.analysisDate;
          if (dateStr.includes(' ')) {
            time = dateStr.split(' ')[0]; // 取日期部分
          } else {
            time = dateStr;
          }
        }

        // 组合产地：省+市+区县
        let origin = '--';
        const parts: string[] = [];
        if (item.provinceName) parts.push(item.provinceName);
        if (item.cityName) parts.push(item.cityName);
        if (item.regionName) parts.push(item.regionName);
        if (parts.length > 0) {
          origin = parts.join('');
        }

        // 处理价格变化百分比
        let change: number | string = '-';
        if (item.priceUpDown !== undefined && item.priceUpDown !== null && item.priceUpDown !== '') {
          const changeValue = Number(item.priceUpDown);
          if (!isNaN(changeValue)) {
            change = changeValue;
          }
        }

        return {
          id: item.id,
          time,
          variety: item.goodsCategoryName || '--',
          origin,
          price: item.goodsPriceAvg ? `${item.goodsPriceAvg}元/kg` : '--',
          change,
          goodsCategoryId: item.goodsCategoryId || '',
          regionCode: item.regionCode || '',
          goodsCategoryName: item.goodsCategoryName || '--',
          regionName: origin // 使用组合后的产地名称
        };
      });
    } else {
      recommendationTableData.value = [];
    }
  } catch (error) {
    console.error('获取热门推荐数据失败:', error);
    recommendationTableData.value = [];
  } finally {
    recommendationLoading.value = false;
  }
};

// 查看热力图
const viewHeatmap = async () => {
  try {
    // 获取品种ID
    const varietyArray = normalizedVariety.value;
    const filteredVariety = varietyArray.filter((item: any) => {
      const str = String(item || '').trim();
      return str !== '' && str !== 'null' && str !== 'undefined';
    });
    const goodsCategoryId = filteredVariety.length > 0 ? filteredVariety[filteredVariety.length - 1] : '';

    if (!goodsCategoryId) {
      ElMessage.warning('请先选择品种');
      return;
    }

    const params: any = {
      goodsCategoryId: goodsCategoryId
    };

    // 调用热力图接口
    const response = await heatmapList(params);
    if (response && response.code === 200) {
      const data = response.data || [];
      // 将数据转换为热力图需要的格式
      const heatmapData = (Array.isArray(data) ? data : []).map((item: any) => {
        // 处理省份名称：去掉"省"、"市"、"自治区"等后缀
        let provinceName = item.provinceName || '';
        provinceName = provinceName.replace(/省$|市$|自治区$|特别行政区$/, '');

        return {
          name: provinceName,
          value: Number(item.goodsPriceAvg || 0),
          provinceCode: item.provinceCode || '',
          provinceName: item.provinceName || '',
          goodsPriceAvg: item.goodsPriceAvg || '0',
          yesterdaySales: item.yesterdaySales || 0,
          yesterdayTotalSales: item.yesterdayTotalSales || '0.00'
        };
      });

      // 将数据存储到 sessionStorage，供热力图页面使用
      sessionStorage.setItem('heatmapData', JSON.stringify(heatmapData));

      // 在新标签页中打开热力图页面，通过 query 参数传递 goodsCategoryId
      const routeData = router.resolve({
        path: '/mall/price-heatmap',
        query: {
          goodsCategoryId: goodsCategoryId
        }
      });
      window.open(routeData.href, '_blank');
    } else {
    }
  } catch (error) {}
};

// 查看报告
const viewReport = (row: any) => {
  if (!row) {
    ElMessage.warning('数据异常，无法查看报告');
    return;
  }

  // 设置报告信息
  reportInfo.value = {
    variety: row.goodsCategoryName || row.variety || '--',
    origin: row.regionName || row.origin || '--'
  };

  // 设置查询参数
  reportQueryParams.goodsCategoryId = row.goodsCategoryId || '';
  reportQueryParams.regionCode = row.regionCode || '';

  // 打开弹窗
  reportDialogVisible.value = true;
};

// 获取分类列表
const fetchCategoryList = async () => {
  try {
    const res = await getProductCategoryList();
    if (res.code === 200) {
      categoryList.value = proxy?.handleTree<any>(res.data, 'id') || [];
    }
  } catch (error) {
    console.error('获取商品分类数据失败:', error);
  }
};

// 刷新数据方法
const refreshData = () => {
  fetchPriceData();
  fetchPriceExplanation();
  fetchHotRecommendation();
};

const getTrendIcon = (change: number | string) => {
  if (change === '-' || change === null || change === undefined || change === '' || Number(change) === 0) {
    return trendFlatIcon;
  }
  const num = Number(change);
  if (!Number.isNaN(num)) {
    return num > 0 ? trendUpIcon : trendDownIcon;
  }
  return trendFlatIcon;
};

// 更新小折线图
watch(
  () => [currentChartData.value.dates, currentChartData.value.prices],
  () => {
    nextTick(() => {
      updateMiniChart();
    });
  },
  { deep: true }
);

// 页面加载时获取数据
onMounted(() => {
  fetchCategoryList();
  fetchPriceData();
  fetchPriceExplanation();
  fetchHotRecommendation();
  eventBus.on('priceTrend:applyFilters', applyExternalFilters);

  // 初始化小折线图
  nextTick(() => {
    initMiniChart();
  });
});

// 暴露方法供父组件调用
defineExpose({
  refreshData
});

onBeforeUnmount(() => {
  try {
    eventBus.off?.('priceTrend:applyFilters', applyExternalFilters);
  } catch (error) {
    // ignore
  }

  // 清理小折线图实例
  if (miniChartInstance) {
    miniChartInstance.dispose();
    miniChartInstance = null;
  }
});
</script>

<style scoped lang="scss">
.price-trend-component {
  background-color: #fff;

  .query-form {
    .el-form-item {
      margin-bottom: 0;
    }
  }

  .filter-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: flex-end;
    gap: 16px;
    margin-bottom: 12px;
  }

  .filter-row .query-form {
    flex: 1;
    display: flex;
    align-items: flex-end;
    gap: 16px;
    flex-wrap: nowrap;
  }

  .filter-row .time-range-selector {
    padding: 4px;
    background-color: #f5f5f5;
    margin-left: auto;
    display: inline-flex;
    gap: 10px;
    font-size: 14px;
  }

  .filter-row .time-range-selector .range-pill {
    border-radius: 4px;
    padding: 0 18px;
    height: 32px;
    line-height: 32px;
    background: transparent;
    color: #5c6773;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .filter-row .time-range-selector .range-pill.active {
    background: #ffffff;
    color: #108c58;
    font-weight: 600;
  }

  .content-wrapper {
    padding: 0 15px 15px;
    display: flex;
    gap: 20px;

    .chart-section {
      flex: 3;
      background-color: #fff;
      border-radius: 4px;
      padding: 16px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
      display: flex;
      flex-direction: column;
      min-height: 500px; // 确保有足够高度

      // 图表区域占满容器
      :deep(.price-trend-chart) {
        width: 100%;
        height: 100%;
        flex: 1;
        min-height: 0;
      }
    }

    .summary-section {
      flex: 1.2;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .price-card {
        border: 1px dashed rgba(91, 188, 255, 0.6);
        border-radius: 4px;
        padding: 16px;
        padding-right: 0;
        background: #fff;
        display: flex;
        flex-direction: column;

        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;

          .title-marker {
            width: 3px;
            height: 13px;
            background: #2e9be6;
            border-radius: 2px;
          }
          .title-marker2 {
            width: 3px;
            height: 13px;
            border-radius: 2px;
            background: #6767ff;
          }
          .card-title {
            font-size: 15px;
            font-weight: bold;
            color: #2e9be6;
          }
          .card-title2 {
            font-size: 15px;
            font-weight: bold;
            color: #6767ff;
          }
        }

        .today-body {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .card-info {
          flex: 1;
          min-width: 0;
          margin-left: 15px;
        }

        .card-metric {
          font-size: 14px;
          color: #1d2129;
          span {
            font-size: 18px;
            font-weight: 600;
            margin-left: 4px;
          }
        }

        .price-change {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #7a7a7a;
          margin: 0;
          span {
            font-weight: 600;
            color: #ef4d0b;
          }
          .el-icon {
            font-size: 16px;
          }
        }

        .card-chart {
          position: absolute;
          top: 4px;
          right: 12px;
          width: 140px;
          height: 70px;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          overflow: hidden;

          .mini-chart-container {
            width: 100%;
            height: 100%;
            min-width: 0;
            min-height: 0;
          }
        }

        // 当日价格卡片特定样式
        &.today-card {
          flex: 0 0 auto;
          min-height: auto;

          .today-body {
            margin-top: 8px;
          }
        }

        // 近7日价格卡片特定样式
        &.seven-days-card {
          flex: 1;
          border: 1px dashed rgba(133, 133, 255, 0.6);
          .card-content {
            margin-top: 12px;
            margin-left: 15px;

            .card-metric {
              margin-bottom: 12px;
              font-size: 14px;
              color: #1d2129;
              line-height: 1.6;

              &:last-of-type {
                margin-bottom: 12px;
              }

              span {
                font-size: 14px;
                font-weight: bold;
                color: #1d2129;
                margin-left: 4px;
              }
            }

            .price-trend {
              margin: 0;
              font-size: 14px;
              color: #1d2129;
              line-height: 1.6;

              .trend-text {
                font-weight: bold;
                color: #67c23a;
                margin-left: 4px;
                font-size: 18px;
              }
            }
          }
        }
      }

      .heatmap-button {
        width: 100%;
        margin-top: 0;
        background-color: #108c58;
        border-color: #108c58;

        &:hover {
          background-color: #0d7a4a;
          border-color: #0d7a4a;
        }
      }
    }
  }

  .recommendations-section {
    margin-top: 20px;
    background-color: #fff;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    .recommendation-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 20px;

      .title-marker {
        width: 3px;
        height: 16px;
        background: #108c58;
        border-radius: 2px;
      }

      .section-title {
        font-size: 16px;
        font-weight: 700;
        color: #333333;
        margin: 0;
      }
    }

    :deep(.el-table) {
      .el-table__header {
        th {
          background-color: #108c58 !important;
          color: #fff;
          font-weight: 600;
          border-color: #108c58 !important;
        }
      }

      .el-table__body {
        tr {
          &:hover {
            background-color: #f5f7fa;
          }
          td {
            border-color: #ffffff !important;
          }
        }
      }
    }

    .trend-icon {
      font-size: 18px;
      cursor: pointer;
    }

    .horizontal-line {
      display: inline-block;
      font-size: 20px;
      line-height: 1;
      font-weight: bold;
      cursor: pointer;
    }

    .price-text {
      color: #108c58;
      font-weight: 600;
    }

    :deep(.el-empty) {
      padding: 40px 0;
    }

    .trend-img {
      width: 18px;
      height: 18px;
    }

    .report-link {
      white-space: nowrap;
    }

    :deep(.change-tag) {
      display: inline-flex;
      width: 62px;
      height: 22px;
      align-items: center;
      justify-content: center;
      border-radius: 22px;
      font-weight: 600;
      font-size: 12px;
    }

    :deep(.change-up) {
      color: #ef4d0b;
      background: rgba(239, 77, 11, 0.1);
    }

    :deep(.change-down) {
      color: #009022;
      background: rgba(0, 144, 34, 0.1);
    }
  }

  .text-red {
    color: #f56c6c;
  }

  .text-green {
    color: #67c23a;
  }

  .text-gray {
    color: #909399;
  }

  .trend-icon {
    font-size: 18px;
  }
}
</style>
