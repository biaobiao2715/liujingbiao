<!--
  标题: enterprise/index.vue
  功能: 信贷产品列表组件
  说明: 用于展示信贷产品列表，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->
<template>
  <div>
    <div class="supplier-management">
      <div class="menu-title">信贷产品列表</div>
      <!-- 搜索条件 -->
      <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
        <el-form-item label="产品名称" prop="productName" label-width="auto">
          <el-input v-model="queryParams.productName" placeholder="请输入企业编码" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="产品类型" prop="productType" label-width="auto">
          <el-select v-model="queryParams.productType" placeholder="产品类型" filterable clearable>
            <el-option v-for="dict in prod_credit_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="贷款周期" prop="loanCycle" label-width="auto">
          <el-select v-model="queryParams.loanCycle" placeholder="贷款周期" multiple filterable clearable>
            <el-option v-for="dict in loan_cycle" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button v-throttle icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 表格展示 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column label="产品名称" align="center" prop="productName" min-width="100" :show-overflow-tooltip="true" />
        <el-table-column label="适用对象" align="center" prop="applicableObject" :show-overflow-tooltip="true">
          <template v-slot="scope">
            <dict-tag :options="plat_credit_rating" :value="scope.row.applicableObject" />
          </template>
        </el-table-column>
        <el-table-column label="产品类型" align="center" prop="productType">
          <template v-slot="scope">
            <dict-tag :options="prod_credit_type" :value="scope.row.productType" />
          </template>
        </el-table-column>
        <el-table-column label="额度（万元）" align="center" prop="maxLoanAmount"></el-table-column>

        <el-table-column label="周期(月)" align="center" prop="loanCycle" :show-overflow-tooltip="true">
          <template v-slot="scope">
            <dict-tag :options="loan_cycle" :value="scope.row.loanCycle" />
          </template>
        </el-table-column>
        <el-table-column label="产品简介" align="center" prop="productIntro" min-width="160" :show-overflow-tooltip="true"></el-table-column>
        <el-table-column label="操作" fixed="right" align="center" width="160" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button v-throttle type="primary" link @click="handleEdit(scope.row, 'view')">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex-center pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>
    </div>

    <div style="height: 91px"></div>
    <el-dialog
      class="dialog-preview"
      :title="dlgTitle"
      v-model="dlgPreviewVisible"
      :before-close="cancelDlg"
      :close-on-click-modal="isReadonly"
      :destroy-on-close="true"
      append-to-body
      width="80%"
    >
      <editDetails :id="selectID" @refresh="refreshData" @cancel="cancelDlg" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { getCreditProductsVersionNoTenantListInfo } from '@/api/financeFront/LoanProducts/index';
import editDetails from './Details.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_credit_type, plat_credit_rating, loan_cycle } = toRefs<any>(proxy?.useDict('prod_credit_type', 'plat_credit_rating', 'loan_cycle'));
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,

  productName: '',
  productType: '',
  isNoTenant: true,
  productStatus: '2',
  // 多选的贷款周期，提交时转换为逗号分隔字符串
  loanCycle: [] as string[]
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
// 对话框相关状态
const dlgPreviewVisible = ref(false);
const dlgTitle = ref('');
const isReadonly = ref(false);
const selectID = ref<string | number>('');
const selectType = ref<'view' | 'edit' | 'audit'>('view');

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  const params: any = { ...queryParams.value };
  // 多选数组转换为后端需要的逗号分隔字符串
  if (Array.isArray(params.loanCycle)) {
    params.loanCycle = params.loanCycle.length ? params.loanCycle.join(',') : '';
  }

  getCreditProductsVersionNoTenantListInfo(params).then((res) => {
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
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  selectID.value = row.id;
  selectType.value = type;
  isReadonly.value = type === 'view';
  dlgTitle.value = type === 'audit' ? '企业审核' : type === 'edit' ? '企业编辑' : '企业详情';
  dlgPreviewVisible.value = true;
};

// 关闭对话框
const cancelDlg = () => {
  dlgPreviewVisible.value = false;
};

// 子组件刷新回调
const refreshData = () => {
  dlgPreviewVisible.value = false;
  getList();
};

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});

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
  margin-right: 8px;
  background-image: url('@/assets/images/finance/loan-header-icon.png');
}

.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
