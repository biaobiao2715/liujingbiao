<template>
  <div class="price-prediction-component">
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="80" class="query-form">
      <el-form-item label="产地:" prop="origin">
        <RegionSelect
          v-model="queryParams.origin"
          @regionChange="handleRegionChange"
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item label="品种:" prop="variety">
        <GoodsCategorySelect
          v-model="queryParams.variety"
          @categoryChange="handleCategoryChange"
          style="width: 200px"
        />
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
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 图表和分析区域 -->
    <div class="chart-analysis-wrapper">
      <!-- 左侧：图表 -->
      <div class="chart-section">
        <h3 class="chart-title">{{ chartTitle }}</h3>
        <PricePredictionChart
          :months="allMonths"
          :past-prices="pastPrices"
          :past-price-upper="pastPriceUpper"
          :past-price-lower="pastPriceLower"
          :predicted-prices="predictedPrices"
          :predicted-price-upper="predictedPriceUpper"
          :predicted-price-lower="predictedPriceLower"
          :past-highest="pastHighest"
          :past-lowest="pastLowest"
          :predicted-highest="predictedHighest"
          :predicted-lowest="predictedLowest"
          :y-axis-min="55"
          :y-axis-max="85"
          :y-axis-interval="5"
          v-loading="loading"
        />
      </div>

      <!-- 右侧：市场分析解读 -->
      <div class="analysis-section">
        <div class="analysis-card">
          <h4 class="analysis-title">市场分析解读:</h4>
          <div class="analysis-content">
            <p><strong>整体趋势:</strong> {{ marketAnalysis.overallTrend }}</p>
            <p><strong>价格区间:</strong> {{ marketAnalysis.priceRange }}</p>
            <p><strong>预测建议:</strong> {{ marketAnalysis.suggestion }}</p>
          </div>
        </div>
      </div>
    </div>

  
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue'
import RegionSelect from '@/components/RegionSelect/index.vue'
import PricePredictionChart from './PricePredictionChart.vue'
import { pricePredictionList } from '@/api/mall/marketComponent'

const queryFormRef = ref()
const loading = ref(false)

// 查询参数
const queryParams = reactive({
  origin: [] as string[],
  variety: [] as string[],
  timeRange: '12'
})

// 区域代码
const regionCodes = reactive({
  provinceCode: '',
  cityCode: '',
  regionCode: ''
})

// 图表数据
const allMonths = ref<string[]>([])
const pastPrices = ref<number[]>([])
const pastPriceUpper = ref<number[]>([])
const pastPriceLower = ref<number[]>([])
const predictedPrices = ref<number[]>([])
const predictedPriceUpper = ref<number[]>([])
const predictedPriceLower = ref<number[]>([])
const pastHighest = ref<{ month: string; price: number }>({ month: '', price: 0 })
const pastLowest = ref<{ month: string; price: number }>({ month: '', price: 0 })
const predictedHighest = ref<{ month: string; price: number }>({ month: '', price: 0 })
const predictedLowest = ref<{ month: string; price: number }>({ month: '', price: 0 })

// 市场分析数据
const marketAnalysis = ref({
  overallTrend: '暂无数据',
  priceRange: '暂无数据',
  suggestion: '暂无数据'
})

// 图表标题
const chartTitle = computed(() => {
  const timeRangeMap: Record<string, string> = {
    '1': '1个月',
    '3': '3个月',
    '6': '6个月',
    '12': '12个月'
  }
  return `小麦种子未来${timeRangeMap[queryParams.timeRange] || '12个月'}价格预测走势图`
})


// 品种分类变化处理
const handleCategoryChange = (value: string[]) => {
  queryParams.variety = value
  console.log('选择的品种分类:', value)
}

// 产地变化处理
const handleRegionChange = (value: any) => {
  if (value && value.regionPath) {
    queryParams.origin = value.regionPath
    regionCodes.provinceCode = value.provinceCode || ''
    regionCodes.cityCode = value.cityCode || ''
    regionCodes.regionCode = value.regionCode || ''
  } else {
    queryParams.origin = []
    regionCodes.provinceCode = ''
    regionCodes.cityCode = ''
    regionCodes.regionCode = ''
  }
  console.log('选择的产地:', value)
}

// 获取价格预测数据
const fetchPricePrediction = async () => {
  loading.value = true
  try {
    // 转换时间范围为接口参数
    const timeRangeMap: Record<string, number> = {
      '1': 1,  // 一个月
      '3': 2,  // 三个月
      '6': 3,  // 六个月
      '12': 4  // 十二个月
    }
    const pricePredictionTimeframe = timeRangeMap[queryParams.timeRange] || 4

    // 获取品种ID（取数组最后一个元素）
    const goodsCategoryId = queryParams.variety && queryParams.variety.length > 0 
      ? queryParams.variety[queryParams.variety.length - 1] 
      : ''

    const params: any = {
      pricePredictionTimeframe,
      regionCode: regionCodes.regionCode || '',
      goodsCategoryId: goodsCategoryId || ''
    }

    const response = await pricePredictionList(params)
    if (response && response.code === 200) {
      const data = response.data || {}
      const historicalData = data.historicalData || {}
      const predictedData = data.predictedData || {}
      
      // 处理历史数据（historicalData）
      if (historicalData.xAxis && Array.isArray(historicalData.xAxis)) {
        // xAxis 是日期数组，需要转换为月份索引
        allMonths.value = historicalData.xAxis.map((dateStr: string) => {
          // 如果格式是 "2024-11"，提取月份部分
          if (dateStr.includes('-')) {
            const month = dateStr.split('-')[1]
            return String(parseInt(month))
          }
          return String(dateStr)
        })
      } else if (data.months && Array.isArray(data.months)) {
        allMonths.value = data.months.map((m: any) => String(m))
      }
      
      if (historicalData.yAxis && Array.isArray(historicalData.yAxis)) {
        pastPrices.value = historicalData.yAxis.map((p: string | number) => Number(p || 0))
      } else if (data.pastPrices && Array.isArray(data.pastPrices)) {
        pastPrices.value = data.pastPrices.map((p: any) => Number(p || 0))
      }
      
      // 处理预测数据（predictedData）
      if (predictedData.xAxis && Array.isArray(predictedData.xAxis)) {
        // 如果预测数据也有 xAxis，可以合并到 allMonths
        const predictedMonths = predictedData.xAxis.map((dateStr: string) => {
          if (dateStr.includes('-')) {
            const month = dateStr.split('-')[1]
            return String(parseInt(month))
          }
          return String(dateStr)
        })
        // 合并历史月份和预测月份，去重
        allMonths.value = [...new Set([...allMonths.value, ...predictedMonths])]
      }
      
      if (predictedData.yAxis && Array.isArray(predictedData.yAxis)) {
        predictedPrices.value = predictedData.yAxis.map((p: string | number) => Number(p || 0))
      } else if (data.predictedPrices && Array.isArray(data.predictedPrices)) {
        predictedPrices.value = data.predictedPrices.map((p: any) => Number(p || 0))
      }
      
      // 处理价格上下限（如果接口返回）
      if (data.pastPriceUpper && Array.isArray(data.pastPriceUpper)) {
        pastPriceUpper.value = data.pastPriceUpper.map((p: any) => Number(p || 0))
      }
      
      if (data.pastPriceLower && Array.isArray(data.pastPriceLower)) {
        pastPriceLower.value = data.pastPriceLower.map((p: any) => Number(p || 0))
      }
      
      if (data.predictedPriceUpper && Array.isArray(data.predictedPriceUpper)) {
        predictedPriceUpper.value = data.predictedPriceUpper.map((p: any) => Number(p || 0))
      }
      
      if (data.predictedPriceLower && Array.isArray(data.predictedPriceLower)) {
        predictedPriceLower.value = data.predictedPriceLower.map((p: any) => Number(p || 0))
      }
      
      // 最高点和最低点
      if (data.pastHighest) {
        pastHighest.value = {
          month: String(data.pastHighest.month || data.pastHighest.monthIndex || ''),
          price: Number(data.pastHighest.price || 0)
        }
      }
      
      if (data.pastLowest) {
        pastLowest.value = {
          month: String(data.pastLowest.month || data.pastLowest.monthIndex || ''),
          price: Number(data.pastLowest.price || 0)
        }
      }
      
      if (data.predictedHighest) {
        predictedHighest.value = {
          month: String(data.predictedHighest.month || data.predictedHighest.monthIndex || ''),
          price: Number(data.predictedHighest.price || 0)
        }
      }
      
      if (data.predictedLowest) {
        predictedLowest.value = {
          month: String(data.predictedLowest.month || data.predictedLowest.monthIndex || ''),
          price: Number(data.predictedLowest.price || 0)
        }
      }
      
      // 市场分析数据
      if (data.overallTrend) {
        marketAnalysis.value.overallTrend = data.overallTrend
      }
      if (data.priceRange) {
        marketAnalysis.value.priceRange = data.priceRange
      }
      if (data.suggestion || data.predictionSuggestion) {
        marketAnalysis.value.suggestion = data.suggestion || data.predictionSuggestion
      }
    } else {
      ElMessage.error(response?.msg || '获取价格预测数据失败')
      // 重置数据
      resetChartData()
    }
  } catch (error) {
    console.error('获取价格预测数据失败:', error)
    ElMessage.error('获取价格预测数据失败，请稍后重试')
    resetChartData()
  } finally {
    loading.value = false
  }
}

// 重置图表数据
const resetChartData = () => {
  allMonths.value = []
  pastPrices.value = []
  pastPriceUpper.value = []
  pastPriceLower.value = []
  predictedPrices.value = []
  predictedPriceUpper.value = []
  predictedPriceLower.value = []
  pastHighest.value = { month: '', price: 0 }
  pastLowest.value = { month: '', price: 0 }
  predictedHighest.value = { month: '', price: 0 }
  predictedLowest.value = { month: '', price: 0 }
  marketAnalysis.value = {
    overallTrend: '暂无数据',
    priceRange: '暂无数据',
    suggestion: '暂无数据'
  }
}

// 查询
const handleQuery = () => {
  console.log('查询参数:', queryParams)
  fetchPricePrediction()
}

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.origin = []
  queryParams.variety = []
  queryParams.timeRange = '12'
  regionCodes.provinceCode = ''
  regionCodes.cityCode = ''
  regionCodes.regionCode = ''
  fetchPricePrediction()
}

// 页面加载时获取数据
onMounted(() => {
  fetchPricePrediction()
})
</script>

<style scoped lang="scss">
.price-prediction-component {
  padding: 12px;
  background-color: #fff;

  .query-form {
    margin-bottom: 16px;

    .el-form-item {
      margin-bottom: 0;
    }

    :deep(.goods-category) {
      width: 200px;
    }
  }

  .chart-analysis-wrapper {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;

      .chart-section {
        flex: 2;
        background-color: #fff;
        border-radius: 4px;
        padding: 16px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        min-height: 500px;

        .chart-title {
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 16px;
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
      flex: 1;
      display: flex;
      flex-direction: column;

      .analysis-card {
        background-color: #fffbe6; // 浅黄色背景
        border-radius: 4px;
        padding: 16px;
        box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
        border: 1px solid #ffe58f;

        .analysis-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 12px;
          color: #303133;
        }

        .analysis-content {
          p {
            margin-bottom: 12px;
            font-size: 14px;
            color: #606266;
            line-height: 1.8;

            strong {
              color: #303133;
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
