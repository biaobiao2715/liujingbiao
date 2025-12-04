<template>
  <div class="price-trend-component">
    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧：图表区域 -->
      <div class="chart-section">
        <div class="filter-row">
          <el-form ref="queryFormRef" :model="queryParams" inline :label-width="60" class="query-form">
            <el-form-item label="品种:" prop="variety">
              <GoodsCategorySelect v-model="queryParams.variety" @categoryChange="handleCategoryChange" style="width: 250px" />
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
          :title="`小麦种子价格（近${activeTimeRange}日）`"
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
                <span style="font-size: 14px; color: #7a7a7a; font-weight: 400"> 相较昨日价格：</span>
                <span>{{ priceStats.priceChange >= 0 ? '+' : '' }}{{ priceStats.priceChange.toFixed(2) }}%</span>
                <el-icon v-if="priceStats.priceChange > 0" class="text-red"><i-ep-arrow-up /></el-icon>
                <el-icon v-else-if="priceStats.priceChange < 0" class="text-green"><i-ep-arrow-down /></el-icon>
              </p>
            </div>
            <div class="card-chart">
              <img :src="todayTrendLineIcon" alt="当日趋势" />
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
            <span v-else class="change-tag change-down">{{ Math.abs(row.change) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="走势图" align="center" width="200">
          <template #default="{ row }">
            <img class="trend-img" :src="getTrendIcon(row.change)" alt="走势图"  />
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, getCurrentInstance } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import PriceTrendChart from './PriceTrendChart.vue';
import PriceSpecialReportDialog from './PriceSpecialReportDialog.vue';
import { priceActionList, hotRecommendationList, priceExplanationList, heatmapList } from '@/api/mall/marketComponent';
import Pagination from '@/components/Pagination/index.vue';
import { eventBus } from '@/utils/eventBus';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import type { ComponentInternalInstance } from 'vue';
import trendDownIcon from '@/assets/images/marketConditions/down.png';
import trendUpIcon from '@/assets/images/marketConditions/up.png';
import trendFlatIcon from '@/assets/images/marketConditions/flat.png';
import todayLineUpIcon from '@/assets/images/todayPriceLine.png';
import todayLineDownIcon from '@/assets/images/marketConditions/linedown.png';
import todayLineFlatIcon from '@/assets/images/marketConditions/lineP.png';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const queryFormRef = ref();
const activeTimeRange = ref(7);
const categoryList = ref<any[]>([]); // 分类列表数据

// 查询参数
const queryParams = reactive({
  variety: [] as string[], // 三级分类数组
  origin: [] as string[] // 区域选择路径数组
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
    queryParams.variety = categoryPath;
  } else {
    // 如果没有分类列表数据，先设置为数组，组件可能会自动处理
    queryParams.variety = goodsCategoryId ? [goodsCategoryId] : [];
  }

  regionCodes.provinceCode = payload.provinceCode || '';
  regionCodes.cityCode = payload.cityCode || '';
  regionCodes.regionCode = payload.regionCode || '';

  // RegionSelect 需要代码数组 [provinceCode, cityCode, regionCode]
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

    // 获取品种ID（取数组最后一个元素）
    const goodsCategoryId = queryParams.variety && queryParams.variety.length > 0 ? queryParams.variety[queryParams.variety.length - 1] : '';

    const params: any = {
      priceActionDays,
      regionCode: regionCodes.regionCode || '',
      goodsCategoryId
    };

    const response = await priceActionList(params);
    if (response && response.code === 200) {
      const data = response.data || {};
      // 处理返回数据，转换为图表需要的格式
      const dates: string[] = [];
      const prices: number[] = [];

      // 后端返回 xAxis 和 yAxis 数组
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
    } else {
      ElMessage.error(response?.msg || '获取价格走势数据失败');
      currentChartData.value = { dates: [], prices: [] };
      updateAxisRange([]);
    }
  } catch (error) {
    console.error('获取价格走势数据失败:', error);
    ElMessage.error('获取价格走势数据失败，请稍后重试');
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

// 当日趋势小图标：根据近7日趋势文字显示不同曲线
const todayTrendLineIcon = computed(() => {
  const trend = priceStats.value.trend || '';
  if (trend.includes('上升')) {
    // 略有上升 / 大幅上升
    return todayLineUpIcon;
  }
  if (trend.includes('下降')) {
    // 略有下降 / 大幅下降
    return todayLineDownIcon;
  }
  // 趋于平稳 或 其它情况
  return todayLineFlatIcon;
});

// 切换时间范围
const changeTimeRange = (days: number) => {
  activeTimeRange.value = days;
  fetchPriceData();
};

// 品种分类变化处理
const handleCategoryChange = (value: string[]) => {
  queryParams.variety = value;
  console.log('选择的品种分类:', value);
  refreshAllData();
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
    // 获取品种ID（取数组最后一个元素）
    const goodsCategoryId = queryParams.variety && queryParams.variety.length > 0 ? queryParams.variety[queryParams.variety.length - 1] : '';

    const params: any = {
      goodsCategoryId: goodsCategoryId || '',
      regionCode: regionCodes.regionCode || ''
    };

    const response = await priceExplanationList(params);
    if (response && response.code === 200) {
      const data = response.data || {};

      // 处理价格走势：将数字转换为文字描述
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

      // 映射接口返回的数据到价格统计
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
      ElMessage.error(response?.msg || '获取价格说明数据失败');
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
    console.error('获取价格说明数据失败:', error);
    ElMessage.error('获取价格说明数据失败，请稍后重试');
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
    // 获取品种ID（取数组最后一个元素）
    const goodsCategoryId = queryParams.variety && queryParams.variety.length > 0 ? queryParams.variety[queryParams.variety.length - 1] : '';

    const params: any = {
      goodsCategoryId: goodsCategoryId || '',
      regionCode: regionCodes.regionCode || '',
      analysisDate: getYesterdayDate()
    };

    const response = await hotRecommendationList(params);
    if (response && response.code === 200) {
      const data = response.data || response.rows || [];
      // 映射接口返回的数据到表格需要的格式，保留原始字段用于弹窗
      recommendationTableData.value = (Array.isArray(data) ? data : []).map((item: any) => {
        // 格式化日期：从 "2025-11-15 00:00:00" 提取日期部分
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
          // 保留原始字段用于弹窗
          goodsCategoryId: item.goodsCategoryId || '',
          regionCode: item.regionCode || '',
          goodsCategoryName: item.goodsCategoryName || '--',
          regionName: origin // 使用组合后的产地名称
        };
      });
    } else {
      ElMessage.error(response?.msg || '获取热门推荐数据失败');
      recommendationTableData.value = [];
    }
  } catch (error) {
    console.error('获取热门推荐数据失败:', error);
    ElMessage.error('获取热门推荐数据失败，请稍后重试');
    recommendationTableData.value = [];
  } finally {
    recommendationLoading.value = false;
  }
};

// 查询
const handleQuery = () => {
  console.log('查询参数:', queryParams);
  fetchPriceData();
  fetchPriceExplanation();
  fetchHotRecommendation();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.variety = [];
  queryParams.origin = [];
  regionCodes.provinceCode = '';
  regionCodes.cityCode = '';
  regionCodes.regionCode = '';
  activeTimeRange.value = 7;
  fetchPriceData();
  fetchPriceExplanation();
  fetchHotRecommendation();
};

// 查看热力图
const viewHeatmap = async () => {
  try {
    // 获取品种ID（取数组最后一个元素）
    const goodsCategoryId = queryParams.variety && queryParams.variety.length > 0 ? queryParams.variety[queryParams.variety.length - 1] : '';

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
      ElMessage.error(response?.msg || '获取热力图数据失败');
    }
  } catch (error) {
    console.error('获取热力图数据失败:', error);
    ElMessage.error('获取热力图数据失败，请稍后重试');
  }
};

// 点击走势图图标，切换到价格走势页面
// const handleTrendClick = (row: any) => {
//   if (!row || !row.goodsCategoryId) {
//     ElMessage.warning('数据异常，无法查看价格走势');
//     return;
//   }

//   // 切换到价格走势标签页
//   eventBus.emit('market:switchTab', 'second');

//   // 传递筛选条件给价格走势组件
//   const filterPayload = {
//     goodsCategoryId: row.goodsCategoryId,
//     provinceCode: row.provinceCode || '',
//     cityCode: row.cityCode || '',
//     regionCode: row.regionCode || '',
//     provinceName: row.provinceName || '',
//     cityName: row.cityName || '',
//     regionName: row.regionName || ''
//   };

//   // 延迟一下确保组件已切换完成
//   setTimeout(() => {
//     eventBus.emit('priceTrend:applyFilters', filterPayload);
//   }, 100);
// };

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

// 刷新数据方法（供父组件调用）
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

// 页面加载时获取数据
onMounted(() => {
  fetchCategoryList();
  fetchPriceData();
  fetchPriceExplanation();
  fetchHotRecommendation();
  eventBus.on('priceTrend:applyFilters', applyExternalFilters);
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
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .price-card {
        border: 1px dashed rgba(91, 188, 255, 0.6);
        border-radius: 4px;
        padding: 16px;
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
          top: 14px;
          right: 8px;
          width: 120px;
          height: 64px;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          img {
            width: 100%;
            object-fit: contain;
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
