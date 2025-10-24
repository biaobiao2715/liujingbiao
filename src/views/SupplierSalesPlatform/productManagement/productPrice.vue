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
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="100">
      <el-form-item label="商品编码">
        <el-input v-model="queryParams.goodsCode" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品品牌">
        <el-select v-model="queryParams.goodsBrandName" filterable clearable placeholder="请选择或搜索商品品牌">
          <el-option v-for="item in productBrandList" :key="item.id" :label="item.attributeName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="商品规格">
        <el-select v-model="queryParams.goodsSpecificationId" filterable clearable placeholder="请选择或搜索商品规格">
          <el-option v-for="item in goods_specification" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <!-- 价格调整日期 -->
      <el-form-item label="价格调整日期">
        <el-date-picker
          v-model="queryParams.priceAdjustTime"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator=" - "
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleExport">导出</el-button>
        <el-button v-throttle type="primary" @click="onQuery">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="商品编码" align="center" prop="goodsCode" width="210" style="color: #0000ff">
        <template #default="scope">
          <router-link :to="'/SupplierSalesPlatform/productManagement/productDetails/?id=' + scope.row.goodsId + '&type=view'" class="link-type">
            <span>{{ scope.row.goodsCode }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="goodsName" :show-overflow-tooltip="true" />
      <el-table-column label="商品品牌" align="center" prop="goodsBrandName" width="210"> </el-table-column>
      <el-table-column label="商品类目" align="center" prop="goodsCategoryName" width="210"> </el-table-column>
      <el-table-column label="调整前销售价格" align="center" prop="goodsOldPrice" width="210"> </el-table-column>
      <el-table-column label="调整后销售价格" align="center" prop="goodsNewPrice" width="210"> </el-table-column>
      <el-table-column label="调整人" align="center" prop="adjustBy" width="210"> </el-table-column>
      <el-table-column label="价格调整日期" align="center" prop="adjustTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.adjustTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="审核时间" align="center" prop="reviewTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.reviewTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="reviewBy"> </el-table-column>

      <!-- <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle v-if="isPendingReview(scope.row)" type="primary" @click="handleEdit(scope.row, 'audit')">审核</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'view')">查看</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'edit')">编辑</el-button>
        </template>
      </el-table-column> -->
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
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { ref } from 'vue';
import {
  getGoodsPriceHistoryList,
  exportGoodsPriceHistory,
  getGoodsPriceHistoryDetail,
  addGoodsPriceHistory,
  updateGoodsPriceHistory,
  deleteGoodsPriceHistory
} from '@/api/Supplier/productManagement/productPrice';
import { getProductAttributesList } from '@/api/platform/mallConfiguration/productAttributeLabel';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { goods_specification } = toRefs<any>(proxy?.useDict('goods_specification'));
const productBrandList = ref([]);

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  priceAdjustTime: '', //价格调整日期
  goodsBrandName: '', //商品品牌
  goodsName: '', //商品名称
  goodsCode: '', //商品编码
  goodsSpecificationId: '' //商品规格ID
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
const dateRange = ref(['', '']);

// 选中的表格数据
const selectedRows = ref([]);

onMounted(() => {
  getTableData();
  getProductBrandList();
});

/** 查询企业列表 */
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
    loading.value = false;
  }
};

const getProductBrandList = async () => {
  loading.value = true;
  try {
    const res = await getProductAttributesList({
      attributeType: 0,
      pageNum: 1,
      pageSize: 9999
    });
    if (res.code === 200) {
      productBrandList.value = res.rows || [];
    }
  } finally {
    loading.value = false;
  }
};

// 查询按钮事件
const onQuery = () => {
  console.log('查询表单数据:', queryParams.value);
  getTableData();
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
    priceAdjustTime: '', //价格调整日期
    goodsBrandName: '', //商品品牌
    goodsName: '', //商品名称
    goodsCode: '', //商品编码
    goodsSpecificationId: '' //商品规格ID
  };
};

// 处理表格复选框选择事件
const handleSelectionChange = (rows) => {
  selectedRows.value = rows;
};

// 导出按钮操作
const handleExport = async () => {
  if (selectedRows.value.length === 0) {
    return alert('请先选择要导出的数据');
  }
  const ids = selectedRows.value.map((row) => row.id);
  try {
    const res = await exportGoodsPriceHistory({ ids: ids.join() });
    if (res.code === 200) {
      // 假设接口返回文件下载链接
      const link = document.createElement('a');
      link.href = res.data.url;
      link.download = '商品价格调整历史.xlsx';
      link.click();
      // 释放URL对象
      URL.revokeObjectURL(link.href);
      // 移除下载链接元素
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('导出失败:', error);
  }
};

onMounted(() => {
  getTableData();
});
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
