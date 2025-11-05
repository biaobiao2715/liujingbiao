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
          <el-option label="未来12个月" value="12" />
          <el-option label="未来6个月" value="6" />
          <el-option label="未来3个月" value="3" />
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
        <h3 class="chart-title">小麦种子未来12月价格预测走势图</h3>
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
        />
      </div>

      <!-- 右侧：市场分析解读 -->
      <div class="analysis-section">
        <div class="analysis-card">
          <h4 class="analysis-title">市场分析解读:</h4>
          <div class="analysis-content">
            <p><strong>整体趋势:</strong> 未来12个月, 小麦种子价格预计趋于平稳</p>
            <p><strong>价格区间:</strong> 预测价格区间为62~82元</p>
            <p><strong>预测建议:</strong> 建议采购窗口为1月</p>
          </div>
        </div>
      </div>
    </div>

  
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue'
import RegionSelect from '@/components/RegionSelect/index.vue'
import PricePredictionChart from './PricePredictionChart.vue'

const queryFormRef = ref()

// 查询参数
const queryParams = reactive({
  origin: [] as string[],
  variety: [] as string[],
  timeRange: '12'
})

// 所有月份（1-12月）
const allMonths = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

// 过往月份价格数据（1-12月完整数据）
const pastPrices = [61, 64, 70, 67, 72, 80, 75, 70, 68, 63, 83, 78] // 过往价格
const pastPriceUpper = [66, 69, 75, 72, 77, 85, 80, 75, 73, 68, 88, 83] // 过往价格上限
const pastPriceLower = [56, 59, 65, 62, 67, 75, 70, 65, 63, 58, 78, 73] // 过往价格下限

// 预测月份价格数据（1-12月完整数据）
const predictedPrices = [60, 62, 65, 68, 70, 72, 75, 73, 70, 65, 78, 82] // 预测价格
const predictedPriceUpper = [65, 67, 70, 73, 75, 77, 80, 78, 75, 70, 83, 87] // 预测价格上限
const predictedPriceLower = [55, 57, 60, 63, 65, 67, 70, 68, 65, 60, 73, 77] // 预测价格下限

// 最高点和最低点数据
const pastHighest = { month: '11', price: 83 } // 过往最高点（绿色）
const pastLowest = { month: '1', price: 60 } // 过往最低点（红色）
const predictedHighest = { month: '12', price: 82 } // 预测最高点（紫色）
const predictedLowest = { month: '1', price: 60 } // 预测最低点（黄色）


// 品种分类变化处理
const handleCategoryChange = (value: string[]) => {
  queryParams.variety = value
  console.log('选择的品种分类:', value)
}

// 产地变化处理
const handleRegionChange = (value: any) => {
  if (value) {
    queryParams.origin = value.regionPath || []
  } else {
    queryParams.origin = []
  }
  console.log('选择的产地:', value)
}

// 查询
const handleQuery = () => {
  console.log('查询参数:', queryParams)
}

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.origin = []
  queryParams.variety = []
  queryParams.timeRange = '12'
}
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
