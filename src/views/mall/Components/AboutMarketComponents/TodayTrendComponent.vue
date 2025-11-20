<template>
  <div class="today-trend-component">
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="60" class="query-form">
      <el-form-item label="品种:" prop="variety">
        <GoodsCategorySelect v-model="queryParams.variety" @categoryChange="handleCategoryChange" style="width: 200px" />
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
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import { todayTrendList } from '@/api/mall/marketComponent';

const loading = ref(false);
const queryFormRef = ref();

const getYesterdayDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 查询参数
const queryParams = reactive({
  variety: [] as string[], // 三级分类数组，格式: [一级ID, 二级ID, 三级ID]
  pageNum: 1,
  pageSize: 10,
  analysisDate: getYesterdayDate()
});

// 表格数据
const tableData = ref<any[]>([]);
const total = ref(0);

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 品种分类变化处理
const handleCategoryChange = (value: string[]) => {
  queryParams.variety = value;
  console.log('选择的品种分类:', value);
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.variety = [];
  queryParams.pageNum = 1;
  queryParams.analysisDate = getYesterdayDate();
  getList();
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    // 获取品种ID（取数组最后一个元素）
    const goodsCategoryId = queryParams.variety && queryParams.variety.length > 0 ? queryParams.variety[queryParams.variety.length - 1] : '';

    const params: any = {
      goodsCategoryId: goodsCategoryId || '',
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      analysisDate: queryParams.analysisDate
    };

    const response = await todayTrendList(params);
    if (response && response.code === 200) {
      const data = response.rows || response.data || [];
      // 映射接口返回的数据到表格需要的格式
      tableData.value = (Array.isArray(data) ? data : []).map((item: any) => {
        // 格式化日期：从 "2025-11-13 00:00:00" 提取日期部分
        let salesDate = '--';
        if (item.analysisDate) {
          const dateStr = item.analysisDate;
          if (dateStr.includes(' ')) {
            salesDate = dateStr.split(' ')[0]; // 取日期部分
          } else {
            salesDate = dateStr;
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
        let changePercent: number | string = '-';
        if (item.priceUpDown !== undefined && item.priceUpDown !== null && item.priceUpDown !== '') {
          const changeValue = Number(item.priceUpDown);
          if (!isNaN(changeValue)) {
            changePercent = changeValue;
          }
        }

        return {
          id: item.id,
          salesDate,
          variety: item.goodsCategoryName || '--',
          origin,
          price: item.goodsPriceAvg ? `${item.goodsPriceAvg}元/kg` : '--',
          changePercent
        };
      });
      total.value = response.total || 0;
    } else {
      ElMessage.error(response?.msg || '获取今日行情数据失败');
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取今日行情数据失败:', error);
    ElMessage.error('获取今日行情数据失败，请稍后重试');
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 页面加载时获取数据
onMounted(() => {
  getList();
});
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
