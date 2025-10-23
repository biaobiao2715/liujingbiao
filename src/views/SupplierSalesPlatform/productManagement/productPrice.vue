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
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="商品编码" prop="productCode">
        <el-input v-model="queryParams.productCode" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品品牌" prop="productBrand" label-width="140px">
        <el-select v-model="queryParams.productBrand" filterable clearable placeholder="请选择或搜索商品品牌"
          style="width: 240px">
          <el-option v-for="item in productBrandList" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格调整日期">
        <el-date-picker v-model="queryParams.priceAdjustTime" type="daterange" value-format="YYYY-MM-DD"
          range-separator=" - " start-placeholder="开始日期" end-placeholder="结束日期" />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleExport">导出</el-button>
        <el-button v-throttle type="primary" @click="onQuery">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>


    </el-form>


    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="商品编码" align="center" prop="productCode" width="210" style="color: #0000ff">
        <template #default="scope">
          <router-link :to="'/SupplierSalesPlatform/productManagement/productDetails/?id=' + scope.row.id + '&type=view'" class="link-type">
            <span>{{ scope.row.productCode }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="productName" :show-overflow-tooltip="true" />
      <el-table-column label="商品品牌" align="center" prop="productBrand" width="210"> </el-table-column>
      <el-table-column label="商品类目" align="center" prop="productCategory" width="210"> </el-table-column>
      <el-table-column label="调整前销售价格" align="center" prop="originalPrice" width="210"> </el-table-column>
      <el-table-column label="调整后销售价格" align="center" prop="adjustedPrice" width="210"> </el-table-column>
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


      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle v-if="isPendingReview(scope.row)" type="primary" @click="handleEdit(scope.row, 'audit')">审核</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'view')">查看</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'edit')">编辑</el-button>
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
import router from '@/router';
import { ref } from 'vue';
import { baseEnterpriseInfoList } from '@/api/platform/enterprise/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

// 这里使用plat_qualification_grade（平台资质等级）字典，因为它可能包含类似品牌分类的数据
const productBrandList = ref(plat_qualification_grade.value);

// 如果plat_qualification_grade为空，使用review_status作为备选
if (!productBrandList.value || productBrandList.value.length === 0) {
  productBrandList.value = review_status.value;
}

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  // status: '',
  priceAdjustTime: '', //价格调整日期
  // reviewStatus: '',
  productBrand: '', //商品品牌
  productName: '', //商品名称
  productCode: '', //商品编码
  // enterpriseType: '1'
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
const dateRange = ref(['', '']);

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  baseEnterpriseInfoList(queryParams.value).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

// 查询按钮事件
const onQuery = () => {
  console.log('查询表单数据:', queryParams.value);
  getList();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const handleReset = () => {
  // queryFormRef.value?.resetFields();
  // handleQuery();
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    priceAdjustTime: '', //价格调整日期
    productBrand: '', //商品品牌
    productName: '', //商品名称
    productCode: '' //商品编码
  };

};

// 编辑按钮事件
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  console.log('编辑:', row, type);
  // TODO: 跳转编辑页面或弹出编辑弹窗携带type参数
  router.push({
    path: '/platform/enterprise/editDetails',
    query: {
      id: row.id,
      type
    }
  });
};

const isPendingReview = (row) => {
  return row.reviewStatus == 0;
};

const isReviewProcessed = (row) => {
  return !(row.reviewStatus == 0);
};

onMounted(() => {
  getList();
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
