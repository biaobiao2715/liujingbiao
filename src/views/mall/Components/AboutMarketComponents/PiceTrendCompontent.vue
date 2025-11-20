<template>
  <div class="price-trend-component">
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="60" class="query-form">
      <el-form-item label="品种:" prop="variety">
        <GoodsCategorySelect v-model="queryParams.variety" @categoryChange="handleCategoryChange" style="width: 250px" />
      </el-form-item>
      <el-form-item label="产地:" prop="origin">
        <RegionSelect v-model="queryParams.origin" @regionChange="handleRegionChange" style="width: 250px" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 时间范围选择 -->
    <div class="time-range-selector">
      <el-button :type="activeTimeRange === 7 ? 'primary' : 'default'" @click="changeTimeRange(7)"> 近7天 </el-button>
      <el-button :type="activeTimeRange === 30 ? 'primary' : 'default'" @click="changeTimeRange(30)"> 近30天 </el-button>
      <el-button :type="activeTimeRange === 60 ? 'primary' : 'default'" @click="changeTimeRange(60)"> 近60天 </el-button>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧：图表区域 -->
      <div class="chart-section">
        <PriceTrendChart
          :title="`过去${activeTimeRange}天小麦种子价格`"
          unit="单位: 元/kg"
          :dates="currentChartData.dates"
          :prices="currentChartData.prices"
          :y-axis-min="0"
          :y-axis-max="80"
          :y-axis-interval="15"
          v-loading="loading"
        />
      </div>

      <!-- 右侧：价格说明栏 -->
      <div class="summary-section">
        <!-- 当日价格卡片 -->
        <div class="price-card">
          <h4 class="card-title">当日价格</h4>
          <div class="card-content">
            <p>当日均价(元/kg): {{ priceStats.todayPrice.toFixed(2) }}</p>
            <p class="price-change" :class="priceStats.priceChange >= 0 ? 'text-red' : 'text-green'">
              相较昨日价格: {{ priceStats.priceChange >= 0 ? '+' : '' }}{{ priceStats.priceChange.toFixed(2) }}%
              <el-icon v-if="priceStats.priceChange > 0" class="text-red"><i-ep-arrow-up /></el-icon>
              <el-icon v-else-if="priceStats.priceChange < 0" class="text-green"><i-ep-arrow-down /></el-icon>
            </p>
          </div>
        </div>

        <!-- 近N日价格卡片 -->
        <div class="price-card">
          <h4 class="card-title">近{{ activeTimeRange }}日价格</h4>
          <div class="card-content">
            <p>近{{ activeTimeRange }}日最高价(元/kg): {{ priceStats.maxPrice }}</p>
            <p>近{{ activeTimeRange }}日最低价(元/kg): {{ priceStats.minPrice }}</p>
            <p>近{{ activeTimeRange }}日均价(元/kg): {{ priceStats.avgPrice.toFixed(2) }}</p>
            <p>近{{ activeTimeRange }}日价格走势: {{ priceStats.trend }}</p>
          </div>
          <el-button type="primary" class="heatmap-button" @click="viewHeatmap"> 查看区域价格差异热力图 </el-button>
        </div>
      </div>
    </div>

    <!-- 热门推荐表格 -->
    <div class="recommendations-section">
      <h3 class="section-title">热门推荐</h3>
      <el-table :data="recommendationTableData" border v-loading="recommendationLoading" style="width: 100%">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="time" label="时间" align="center" width="120" />
        <el-table-column prop="variety" label="品种" align="center" width="120" />
        <el-table-column prop="origin" label="产地" align="center" min-width="180" :show-overflow-tooltip="true" />
        <el-table-column prop="price" label="价格" align="center" width="120" />
        <el-table-column label="升降" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.change === '-'" class="text-gray">{{ row.change }}</span>
            <span v-else-if="row.change > 0" class="text-red">{{ row.change }}%</span>
            <span v-else class="text-green">{{ Math.abs(row.change) }}%</span>
          </template>
        </el-table-column>
        <el-table-column label="走势图" align="center" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.change === '-'" class="trend-icon" style="color: #409eff">
              <i-ep-arrow-right />
            </el-icon>
            <el-icon v-else-if="row.change > 0" class="trend-icon text-red">
              <i-ep-arrow-up />
            </el-icon>
            <el-icon v-else class="trend-icon text-green">
              <i-ep-arrow-down />
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column label="专项报告" align="center">
          <template #default>
            <el-link type="primary" @click="viewReport">价格专项报告</el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import PriceTrendChart from './PriceTrendChart.vue';
import { priceActionList, hotRecommendationList } from '@/api/mall/marketComponent';

const router = useRouter();
const loading = ref(false);
const queryFormRef = ref();
const activeTimeRange = ref(7);

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

// 价格统计数据
const priceStats = computed(() => {
  const prices = currentChartData.value.prices;
  if (!prices || prices.length === 0) {
    return {
      todayPrice: 0,
      yesterdayPrice: 0,
      priceChange: 0,
      maxPrice: 0,
      minPrice: 0,
      avgPrice: 0,
      trend: '暂无数据'
    };
  }

  // 当日价格（最新一天）
  const todayPrice = prices[prices.length - 1] || 0;

  // 昨日价格
  const yesterdayPrice = prices.length > 1 ? prices[prices.length - 2] : todayPrice;

  // 价格变化百分比
  const priceChange = yesterdayPrice > 0 ? ((todayPrice - yesterdayPrice) / yesterdayPrice) * 100 : 0;

  // 最高价、最低价、均价
  const validPrices = prices.filter((p) => p > 0);
  const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 0;
  const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
  const avgPrice = validPrices.length > 0 ? validPrices.reduce((sum, p) => sum + p, 0) / validPrices.length : 0;

  // 判断价格走势
  let trend = '趋于平稳';
  if (validPrices.length >= 2) {
    const firstHalf = validPrices.slice(0, Math.floor(validPrices.length / 2));
    const secondHalf = validPrices.slice(Math.floor(validPrices.length / 2));
    const firstAvg = firstHalf.reduce((sum, p) => sum + p, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, p) => sum + p, 0) / secondHalf.length;
    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) {
      trend = '上涨';
    } else if (changePercent < -5) {
      trend = '下跌';
    } else {
      trend = '趋于平稳';
    }
  }

  return {
    todayPrice,
    yesterdayPrice,
    priceChange,
    maxPrice,
    minPrice,
    avgPrice,
    trend
  };
});

// 热门推荐表格数据
const recommendationTableData = ref<any[]>([]);
const recommendationLoading = ref(false);

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
    } else {
      ElMessage.error(response?.msg || '获取价格走势数据失败');
      currentChartData.value = { dates: [], prices: [] };
    }
  } catch (error) {
    console.error('获取价格走势数据失败:', error);
    ElMessage.error('获取价格走势数据失败，请稍后重试');
    currentChartData.value = { dates: [], prices: [] };
  } finally {
    loading.value = false;
  }
};

// 切换时间范围
const changeTimeRange = (days: number) => {
  activeTimeRange.value = days;
  fetchPriceData();
};

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

// 获取昨天的日期（YYYY-MM-DD格式）
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const year = yesterday.getFullYear();
  const month = String(yesterday.getMonth() + 1).padStart(2, '0');
  const day = String(yesterday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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
      // 映射接口返回的数据到表格需要的格式
      recommendationTableData.value = (Array.isArray(data) ? data : []).map((item: any) => {
        return {
          id: item.id,
          time: item.time || item.createTime || item.date || '--',
          variety: item.variety || item.categoryName || item.goodsCategoryName || '--',
          origin: item.origin || item.regionName || item.address || '--',
          price: item.price ? `${item.price}元/kg` : '--',
          change: item.change !== undefined && item.change !== null ? Number(item.change) : '-'
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
  fetchHotRecommendation();
};

// 查看热力图
const viewHeatmap = () => {
  // 跳转到热力图页面
  router.push('/mall/price-heatmap');
};

// 查看报告
const viewReport = () => {
  console.log('查看价格专项报告');
};

// 页面加载时获取数据
onMounted(() => {
  fetchPriceData();
  fetchHotRecommendation();
});
</script>

<style scoped lang="scss">
.price-trend-component {
  padding: 12px;
  background-color: #fff;

  .query-form {
    margin-bottom: 16px;

    .el-form-item {
      margin-bottom: 0;
    }

    :deep(.goods-category) {
      width: 250px;
    }
  }

  .time-range-selector {
    margin-bottom: 16px;

    .el-button {
      margin-right: 10px;
    }
  }

  .content-wrapper {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;

    .chart-section {
      flex: 2;
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
        background-color: #f5f7fa;
        border-radius: 4px;
        padding: 16px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

        .card-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #303133;
        }

        .card-content {
          p {
            margin-bottom: 8px;
            font-size: 14px;
            color: #606266;
            line-height: 1.8;

            &.price-change {
              display: flex;
              align-items: center;
              gap: 4px;

              .el-icon {
                font-size: 16px;
              }
            }
          }
        }

        .heatmap-button {
          margin-top: 12px;
          width: 100%;
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

    .section-title {
      font-size: 18px;
      font-weight: bold;
      text-align: center;
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
    cursor: pointer;
  }
}
</style>
