<template>
  <div class="price-trend-component">
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="60" class="query-form">
      <el-form-item label="品种:" prop="variety">
        <GoodsCategorySelect
          v-model="queryParams.variety"
          @categoryChange="handleCategoryChange"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item label="产地:" prop="origin">
        <RegionSelect
          v-model="queryParams.origin"
          @regionChange="handleRegionChange"
          style="width: 250px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 时间范围选择 -->
    <div class="time-range-selector">
      <el-button
        :type="activeTimeRange === 7 ? 'primary' : 'default'"
        @click="changeTimeRange(7)"
      >
        近7天
      </el-button>
      <el-button
        :type="activeTimeRange === 30 ? 'primary' : 'default'"
        @click="changeTimeRange(30)"
      >
        近30天
      </el-button>
      <el-button
        :type="activeTimeRange === 60 ? 'primary' : 'default'"
        @click="changeTimeRange(60)"
      >
        近60天
      </el-button>
    </div>

    <!-- 主要内容区域 -->
    <div class="content-wrapper">
      <!-- 左侧：图表区域 -->
      <div class="chart-section">
        <PriceTrendChart
          :title="`过去${activeTimeRange}天小麦种子价格`"
          unit="单位: 元/斤"
          :dates="currentChartData.dates"
          :prices="currentChartData.prices"
          :y-axis-min="0"
          :y-axis-max="80"
          :y-axis-interval="15"
        />
      </div>

      <!-- 右侧：价格说明栏 -->
      <div class="summary-section">
        <!-- 当日价格卡片 -->
        <div class="price-card">
          <h4 class="card-title">当日价格</h4>
          <div class="card-content">
            <p>当日均价(元/斤): 60.05</p>
            <p class="price-change text-red">
              相较昨日价格: 2.03%
              <el-icon class="text-red"><i-ep-arrow-up /></el-icon>
            </p>
          </div>
        </div>

        <!-- 近7日价格卡片 -->
        <div class="price-card">
          <h4 class="card-title">近7日价格</h4>
          <div class="card-content">
            <p>近7日最高价(元/斤): 80</p>
            <p>近7日最低价(元/斤): 40</p>
            <p>近7日均价(元/斤): 60</p>
            <p>近7日价格走势: 趋于平稳</p>
          </div>
          <el-button type="primary" class="heatmap-button" @click="viewHeatmap">
            查看区域价格差异热力图
          </el-button>
        </div>
      </div>
    </div>


    <!-- 热门推荐表格 -->
    <div class="recommendations-section">
      <h3 class="section-title">热门推荐</h3>
      <el-table :data="recommendationTableData" border v-loading="loading" style="width: 100%">
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
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue'
import RegionSelect from '@/components/RegionSelect/index.vue'
import PriceTrendChart from './PriceTrendChart.vue'

const router = useRouter()
const loading = ref(false)
const queryFormRef = ref()
const activeTimeRange = ref(7)

// 查询参数
const queryParams = reactive({
  variety: [] as string[], // 三级分类数组
  origin: [] as string[] // 省市区数组
})

// 图表数据（写死，根据图片精确值）
const chartData7Days = {
  dates: ['10-23', '10-24', '10-25', '10-26', '10-27', '10-28', '10-29'],
  prices: [42, 30, 55, 65, 18, 27, 30] // 根据图片描述调整的精确值
}

const chartData30Days = {
  dates: Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 30 + i)
    return `${date.getMonth() + 1}-${date.getDate()}`
  }),
  prices: Array.from({ length: 30 }, () => Math.floor(Math.random() * 40) + 30)
}

const chartData60Days = {
  dates: Array.from({ length: 60 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - 60 + i)
    return `${date.getMonth() + 1}-${date.getDate()}`
  }),
  prices: Array.from({ length: 60 }, () => Math.floor(Math.random() * 40) + 30)
}


// 热门推荐表格数据（写死）
const recommendationTableData = ref([
  {
    id: 1,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  },
  {
    id: 2,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  },
  {
    id: 3,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  },
  {
    id: 4,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  },
  {
    id: 5,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: 20.21
  },
  {
    id: 6,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: -13.86
  },
  {
    id: 7,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  },
  {
    id: 8,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  },
  {
    id: 9,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  },
  {
    id: 10,
    time: '2025-11-04',
    variety: '小麦种子',
    origin: '湖北省武汉市汉南区',
    price: '50元/斤',
    change: '-'
  }
])

// 当前图表数据
const currentChartData = computed(() => {
  if (activeTimeRange.value === 7) {
    return chartData7Days
  } else if (activeTimeRange.value === 30) {
    return chartData30Days
  } else {
    return chartData60Days
  }
})

// 切换时间范围
const changeTimeRange = (days: number) => {
  activeTimeRange.value = days
}

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
  queryParams.variety = []
  queryParams.origin = []
  activeTimeRange.value = 7
}

// 查看热力图
const viewHeatmap = () => {
  // 跳转到热力图页面
  router.push('/mall/price-heatmap')
}

// 查看报告
const viewReport = () => {
  console.log('查看价格专项报告')
}
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

