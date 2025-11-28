<!--
  标题: enterprise/index.vue
  功能: 商品价格调整历史
  说明: 用于商品价格调整日志
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="商品编码" label-width="auto">
        <el-input v-model="queryParams.goodsCode" placeholder="请输入商品编码" clearable />
      </el-form-item>
      <el-form-item label="商品名称" label-width="auto">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable />
      </el-form-item>
      <el-form-item label="商品品牌" label-width="auto">
        <el-input v-model="queryParams.goodsBrandName" placeholder="请输入商品品牌" clearable />
      </el-form-item>
      <!-- 价格调整日期 -->
      <el-form-item label="价格调整日期" label-width="auto">
        <el-date-picker v-model="selectedDate" type="date" value-format="YYYY-MM-DD" placeholder="选择日期" @change="handleSelectDate" />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleQuery">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <div class="mb-12">
      <el-button v-throttle type="primary" @click="handleExport" :disabled="selectedRows.length === 0">导出</el-button>
    </div>
    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="商品编码" align="center" prop="goodsCode" width="220"> </el-table-column>
      <el-table-column label="商品名称" align="center" prop="goodsName" :show-overflow-tooltip="true" />
      <el-table-column label="商品品牌" align="center" prop="goodsBrandName"> </el-table-column>
      <el-table-column label="商品类目" align="center" prop="goodsCategoryName" :show-overflow-tooltip="true"> </el-table-column>
      <!-- <el-table-column label="调整前销售价格" align="center" prop="goodsOldPrice"> </el-table-column> -->
      <!-- <el-table-column label="调整后销售价格" align="center" prop="goodsNewPrice"> </el-table-column> -->
      <el-table-column label="调整人" align="center" prop="createBy" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column label="价格调整日期" align="center" prop="changeTime" width="160">
        <template #default="scope">
          {{ formatDate(scope.row.changeTime) }}
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" align="center">
        <template #default="scope">
          <el-button link type="primary" @click="handleView(scope.row)">查看</el-button>
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
        @pagination="getTableData"
      />
    </div>

    <!-- 价格调整明细弹窗 -->
    <PriceDetailDialog
      v-model="detailDialogVisible"
      :data="detailData"
      :total="detailTotal"
      :loading="detailLoading"
      :query-params="detailQueryParams"
      @pagination="
        (pagination) => {
          detailQueryParams.pageNum = pagination.page;
          detailQueryParams.pageSize = pagination.limit;
          fetchDetailData();
        }
      "
    />
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { getGoodsPriceHistoryList, getGoodsPriceHistoryDetail } from '@/api/supplier/productManagement/productPrice';
import PriceDetailDialog from './PriceDetailDialog.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const tableData = ref([]); // 表格数据

const total = ref(0); // 总条数

const loading = ref(false); // 加载中

const selectedDate = ref<string>(''); // 价格调整日期

const selectedRows = ref([]); // 选中的表格数据

const detailDialogVisible = ref(false); // 价格调整明细弹窗显示状态
const selectedDetailId = ref<number | string | null>(null); // 选中的详情ID
const detailData = ref<any[]>([]); // 价格调整明细数据
const detailTotal = ref(0); // 价格调整明细总数
const detailLoading = ref(false); // 价格调整明细加载状态
const detailQueryParams = ref({
  pageNum: 1,
  pageSize: 10
}); // 价格调整明细分页参数

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  goodsBrandName: '', //商品品牌
  goodsName: '', //商品名称
  goodsCode: '', //商品编码
  changeTime: '' // 价格调整日期
});

onMounted(() => {
  getTableData();
});

// 处理日期选择事件
const handleSelectDate = (val: string) => {
  queryParams.value.changeTime = val || '';
};

// 格式化日期，只显示年月日
const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  // 如果包含时间，只取日期部分
  return dateStr.split(' ')[0];
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getTableData();
};

/** 重置按钮操作 */
const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    goodsBrandName: '', //商品品牌
    goodsName: '', //商品名称
    goodsCode: '', //商品编码
    changeTime: '' // 价格调整日期
  };
  selectedDate.value = '';
  getTableData();
};

// 导出按钮操作
const handleExport = () => {
  if (selectedRows.value.length === 0) {
    ElMessage.error('请先选择要导出的数据');
    return;
  }
  const goodsIds = selectedRows.value.map((row) => row.goodsId);
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const fileName = `商品价格调整历史_${year}-${month}-${day}.xlsx`;
  const params = { ids: goodsIds.join(',') };
  proxy.download('/grain-sales/goodsPriceHistory/export', params, fileName);
};

// 获取商品价格历史列表
const getTableData = () => {
  loading.value = true;
  try {
    getGoodsPriceHistoryList(queryParams.value).then((res) => {
      if (res.code === 200) {
        tableData.value = res.rows;
        total.value = res.total;
      }
    });
  } catch (error) {
    console.error('查询商品价格历史列表失败:', error);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
};

// 处理表格复选框选择事件
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 查看操作
const handleView = async (row: any) => {
  selectedDetailId.value = row.goodsId;
  detailQueryParams.value = {
    pageNum: 1,
    pageSize: 10
  };
  await fetchDetailData();
  detailDialogVisible.value = true;
};

// 获取价格调整明细数据
const fetchDetailData = async () => {
  if (!selectedDetailId.value) {
    return;
  }

  detailLoading.value = true;
  try {
    const params = {
      id: selectedDetailId.value,
      pageNum: detailQueryParams.value.pageNum,
      pageSize: detailQueryParams.value.pageSize
    };
    const res = await getGoodsPriceHistoryDetail(params);
    if (res.code === 200) {
      detailData.value = res.rows || [];
      detailTotal.value = res.total || 0;
    } else {
      ElMessage.error(res.msg || '获取价格调整明细失败');
      detailData.value = [];
      detailTotal.value = 0;
    }
  } catch (error) {
    console.error('获取价格调整明细失败:', error);
    ElMessage.error('获取价格调整明细失败');
    detailData.value = [];
    detailTotal.value = 0;
  } finally {
    detailLoading.value = false;
  }
};
</script>

<style scoped lang="scss">
.supplier-management {
  padding: 24px;
}

.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
