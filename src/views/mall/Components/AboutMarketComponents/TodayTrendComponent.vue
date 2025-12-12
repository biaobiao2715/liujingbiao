<!-- 今日行情 -->

<template>
  <div class="today-trend-component">
    <!-- 查询表单 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="60" class="query-form">
      <el-form-item label="品种:" prop="variety">
        <GoodsCategorySelect 
          v-model="normalizedVariety"
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
    <el-table :data="tableData" border v-loading="loading">
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
      <el-table-column type="index" label="序号" width="80" align="center" />
      <el-table-column prop="salesDate" label="销售日期" align="center" width="180" />
      <el-table-column prop="variety" label="品种" align="center" width="180" />
      <el-table-column prop="origin" label="所在产地" align="center" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="price" label="价格" align="center" width="180">
        <template #default="{ row }">
          <span class="price-text">{{ row.price }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="changePercent" label="升降(%)" align="center" width="180">
        <template #default="{ row }">
          <span v-if="row.changePercent === '-' || row.changePercent === 0 || row.changePercent === '0'" class="text-gray">-</span>
          <span v-else-if="row.changePercent > 0" class="change-tag change-up">+{{ row.changePercent }}%</span>
          <span v-else class="change-tag change-down">{{ Math.abs(row.changePercent) }}%</span>
        </template>
      </el-table-column>
      <el-table-column label="走势图" align="center" width="180">
        <template #default="{ row }">
          <img class="trend-img" :src="getTrendIcon(row.changePercent)" alt="走势图" @click="handleTrendClick(row)" />
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
import { ref, reactive, onMounted, watch, nextTick, computed, onErrorCaptured } from 'vue';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import { todayTrendList } from '@/api/mall/marketComponent';
import { eventBus } from '@/utils/eventBus';
import trendDownIcon from '@/assets/images/marketConditions/down.png';
import trendUpIcon from '@/assets/images/marketConditions/up.png';
import trendFlatIcon from '@/assets/images/marketConditions/flat.png';

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
  // 如果是 GoodsCategorySelect 组件相关的 length 错误，静默处理
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

// 表格数据
const tableData = ref<any[]>([]);
const total = ref(0);

// 查询
const handleQuery = () => {
  // 规范化品种参数：确保是数组，并过滤掉空值
  const varietyArray = normalizedVariety.value;
  normalizedVariety.value = varietyArray.filter((item: any) => {
    const str = String(item || '').trim();
    return str !== '' && str !== 'null' && str !== 'undefined';
  });
  // 强制重置页码
  queryParams.pageNum = 1;
  getList();
};

// 品种分类变化处理
const handleCategoryChange = (value: string[] | null | undefined, labels?: string[]) => {
  try {
    // 处理 undefined、null 或非数组的情况
    if (!value || !Array.isArray(value)) {
      normalizedVariety.value = [];
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
    console.log('选择的品种分类:', filteredValue);
  } catch (error) {
    // 捕获可能的错误，确保不会影响其他功能
    console.error('处理品种分类变化时出错:', error);
    normalizedVariety.value = [];
  }
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  // 强制清空品种参数
  normalizedVariety.value = [];
  queryParams.pageNum = 1;
  queryParams.analysisDate = getYesterdayDate();
  getList();
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    // 使用 normalizedVariety 确保值始终是数组
    const varietyArray = normalizedVariety.value;
    
    // 过滤掉空值、null、undefined
    const filteredVariety = varietyArray.filter((item: any) => {
      const str = String(item || '').trim();
      return str !== '' && str !== 'null' && str !== 'undefined';
    });
    
    // 获取品种ID（取数组最后一个有效元素）
    let goodsCategoryId = '';
    if (filteredVariety.length > 0) {
      const lastItem = String(filteredVariety[filteredVariety.length - 1]).trim();
      // 再次验证，确保不是空字符串
      if (lastItem && lastItem !== '' && lastItem !== 'null' && lastItem !== 'undefined') {
        goodsCategoryId = lastItem;
      }
    }

    const params: any = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize,
      analysisDate: queryParams.analysisDate
    };
    
    // 只有当 goodsCategoryId 有有效值时才添加到参数中
    if (goodsCategoryId) {
      params.goodsCategoryId = goodsCategoryId;
    }

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
          changePercent,
          // 保留原始字段用于切换到价格走势
          goodsCategoryId: item.goodsCategoryId || '',
          provinceCode: item.provinceCode || '',
          cityCode: item.cityCode || '',
          regionCode: item.regionCode || '',
          provinceName: item.provinceName || '',
          cityName: item.cityName || '',
          regionName: item.regionName || ''
        };
      });
      total.value = response.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取今日行情数据失败:', error);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
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

// 点击走势图图标，切换到价格走势页面
const handleTrendClick = (row: any) => {
  if (!row || !row.goodsCategoryId) {
    return;
  }

  // 切换到价格走势标签页
  eventBus.emit('market:switchTab', 'second');

  // 传递筛选条件给价格走势组件
  const filterPayload = {
    goodsCategoryId: row.goodsCategoryId,
    provinceCode: row.provinceCode || '',
    cityCode: row.cityCode || '',
    regionCode: row.regionCode || '',
    provinceName: row.provinceName || '',
    cityName: row.cityName || '',
    regionName: row.regionName || ''
  };

  // 延迟一下确保组件已切换完成
  setTimeout(() => {
    eventBus.emit('priceTrend:applyFilters', filterPayload);
  }, 100);
};

// 监听品种参数变化，确保清空时正确同步
watch(
  () => queryParams.variety,
  (newVal) => {
    // 如果值不是数组，强制设为空数组
    if (!Array.isArray(newVal)) {
      queryParams.variety = [];
    }
  },
  { deep: true }
);

// 页面加载时获取数据
onMounted(() => {
  getList();
});

// 暴露方法供父组件调用
defineExpose({
  getList
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

.price-text {
  color: #108c58;
  font-weight: 600;
}

.trend-img {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.change-tag {
  display: inline-flex;
  width: 62px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  font-weight: 600;
  font-size: 12px;
}

.change-up {
  color: #ef4d0b;
  background: rgba(239, 77, 11, 0.1);
}

.change-down {
  color: #009022;
  background: rgba(0, 144, 34, 0.1);
}

.pagination {
  margin-top: 24px;
  justify-content: end;
}

:deep(.el-empty) {
  padding: 40px 0;
}
::v-deep .el-form-item--default .el-form-item__content {
  margin-right: 30px;
}
</style>
