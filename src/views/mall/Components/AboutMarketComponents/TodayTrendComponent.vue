<template>
  <div class="today-trend-component">
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="60" class="query-form">
      <el-form-item label="品种:" prop="variety">
        <GoodsCategorySelect
          v-model="queryParams.variety"
          @categoryChange="handleCategoryChange"
          style="width: 200px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 数据表格 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="salesDate" label="销售日期" align="center" width="120" />
      <el-table-column prop="variety" label="品种" align="center" width="120" />
      <el-table-column prop="origin" label="所在产地" align="center" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="price" label="价格" align="center" width="120" />
      <el-table-column prop="changePercent" label="升降(%)" align="center" width="120">
        <template #default="{ row }">
          <span v-if="row.changePercent === '-'" class="text-gray">{{ row.changePercent }}</span>
          <span v-else-if="row.changePercent > 0" class="text-red">{{ row.changePercent }}%</span>
          <span v-else class="text-green">{{ Math.abs(row.changePercent) }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="走势图" align="center" width="100">
        <template #default="{ row }">
          <el-icon v-if="row.changePercent === '-'" class="trend-icon" style="color: #409eff">
            <i-ep-arrow-right />
          </el-icon>
          <el-icon v-else-if="row.changePercent > 0" class="trend-icon text-red">
            <i-ep-arrow-up />
          </el-icon>
          <el-icon v-else class="trend-icon text-green">
            <i-ep-arrow-down />
          </el-icon>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue'

const loading = ref(false)
const queryFormRef = ref()

// 查询参数
const queryParams = reactive({
  variety: [] as string[], // 三级分类数组，格式: [一级ID, 二级ID, 三级ID]
  pageNum: 1,
  pageSize: 20
})

// 表格数据（写死）
const tableData = ref([
  {
    id: 1,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: '湖北省武汉市汉南区',
    price: '10元/kg',
    changePercent: '-'
  },
  {
    id: 2,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: '湖北省武汉市江夏区',
    price: '10元/kg',
    changePercent: '-'
  },
  {
    id: 3,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: '陕西省汉中市强县',
    price: '10元/kg',
    changePercent: '-'
  },
  {
    id: 4,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: 'XX省XX市XX县',
    price: '10元/kg',
    changePercent: '-'
  },
  {
    id: 5,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: 'XX省XX市XX县',
    price: '10元/kg',
    changePercent: 20.21
  },
  {
    id: 6,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: 'XX省XX市XX县',
    price: '10元/kg',
    changePercent: -13.86
  },
  {
    id: 7,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: 'XX省XX市XX县',
    price: '10元/kg',
    changePercent: '-'
  },
  {
    id: 8,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: 'XX省XX市XX县',
    price: '10元/kg',
    changePercent: '-'
  },
  {
    id: 9,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: 'XX省XX市XX县',
    price: '10元/kg',
    changePercent: '-'
  },
  {
    id: 10,
    salesDate: '2025-10-29',
    variety: '春菜种子',
    origin: 'XX省XX市XX县',
    price: '10元/kg',
    changePercent: '-'
  }
])

const total = ref(922)

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1
  getList()
}

// 品种分类变化处理
const handleCategoryChange = (value: string[]) => {
  queryParams.variety = value
  console.log('选择的品种分类:', value)
}

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.variety = []
  queryParams.pageNum = 1
  getList()
}

// 获取列表数据
const getList = () => {
  // 数据已写死，这里可以添加筛选逻辑
  console.log('查询参数:', queryParams)
}
</script>

<style scoped lang="scss">
.query-form {
  margin-bottom: 16px;

  .el-form-item {
    margin-bottom: 0;
  }

  :deep(.goods-category) {
    width: 200px;
  }
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

.trend-icon {
  font-size: 18px;
  cursor: pointer;
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

.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>

