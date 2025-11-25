<!--
  标题: enterprise/index.vue
  功能: 保险产品列表组件
  说明: 用于展示保险产品列表，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->
<template>
  <div class="supplier-management">
    <div class="menu-title">保险产品列表</div>
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入企业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="产品类型" prop="productType">
        <el-select v-model="queryParams.productType" placeholder="产品类型" filterable clearable>
          <el-option v-for="dict in product_insurance_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column label="产品名称" align="center" prop="productName" min-width="100" :show-overflow-tooltip="true" />
      <el-table-column label="适用对象" align="center" prop="applicableObject" width="210" style="color: #0000ff">
        <template #default="scope">
          <dict-text :options="applicable_object" :value="scope.row.applicableObject" />
        </template>
      </el-table-column>
      <el-table-column label="产品类型" align="center" prop="productType">
        <template v-slot="scope">
          <dict-tag :options="product_insurance_type" :value="scope.row.productType" />
        </template>
      </el-table-column>
      <el-table-column label="产品简介" align="center" prop="productIntro" width="210" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle type="primary" @click="handleEdit(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <el-dialog
      class="dialog-preview"
      :title="dlgTitle"
      v-model="dlgPreviewVisible"
      :before-close="cancelDlg"
      :destroy-on-close="true"
      append-to-body
      width="80%"
    >
      <Details :id="selectID" @cancel="cancelDlg" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { getInsuranceProductsVersionListInfo } from '@/api/financeFront/Insuranceproduct/index';
import Details from './Details.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { applicable_object, product_insurance_type } = toRefs<any>(proxy?.useDict('applicable_object', 'product_insurance_type'));
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  productType: '',
  isNoTenant: true,
  productName: ''
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
// 对话框相关状态
const dlgPreviewVisible = ref(false);
const dlgTitle = ref('');
const selectID = ref<string | number>('');

/** 查询保险产品列表 */
const getList = () => {
  loading.value = true;
  const params = { ...queryParams.value };

  getInsuranceProductsVersionListInfo(params).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

// 查询按钮事件
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const handleReset = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// 打开对话框：审核/查看/编辑
const handleEdit = (row: any) => {
  selectID.value = row.id;
  dlgTitle.value = '保险产品详情';
  dlgPreviewVisible.value = true;
};

// 关闭对话框
const cancelDlg = () => {
  dlgPreviewVisible.value = false;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.supplier-management {
  width: 100%;
  height: 100%;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;

  padding: 20px;
  margin-bottom: 90px;
}
/* 页面布局样式 */
.menu-title {
  display: flex;
  align-items: center;
  height: 40px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  border-bottom: 1px solid #d8d8d8;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  padding-bottom: 15px;
  margin-bottom: 20px;
}
.menu-title::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 4px 4px 4px 4px;
  margin-right: 8px;
}
.menu-title::before {
  background-image: url('@/assets/images/finance/insurance-header-icon.png');
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
