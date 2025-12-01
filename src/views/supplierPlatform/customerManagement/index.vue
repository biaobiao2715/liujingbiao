<!--
  标题: customerManagement/index.vue
  功能: 客户管理首页
  说明: 用于客户管理，包括查询、展示等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="customer-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="客户编码" prop="customerNo" label-width="auto">
        <el-input v-model="queryParams.customerNo" placeholder="请输入客户编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户名称" prop="customerName" label-width="auto">
        <el-input v-model="queryParams.customerName" placeholder="请输入客户名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="客户类型" prop="customerType" label-width="auto">
        <el-select v-model="queryParams.customerType" placeholder="全部" clearable>
          <el-option v-for="dict in purchaser_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column label="客户名称" prop="customerName" min-width="100" :show-overflow-tooltip="true" />
      <el-table-column label="客户编码" prop="customerNo" :show-overflow-tooltip="true" />
      <el-table-column label="客户类型" prop="customerType">
        <template v-slot="scope">
          <dict-tag :options="purchaser_type" :value="scope.row.customerType" />
        </template>
      </el-table-column>
      <el-table-column label="购买类型" prop="purchaseType" :show-overflow-tooltip="true" />
      <el-table-column label="联系方式" prop="mobile" :show-overflow-tooltip="true" />
      <el-table-column label="录入时间" prop="updateTime" min-width="160" :show-overflow-tooltip="true">
        <template #default="scope">
          {{ proxy.parseTime(scope.row.updateTime) }}
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
import { ref, onMounted, onActivated } from 'vue';
import { customerList } from '@/api/supplier/customerManagement/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { purchaser_type } = toRefs<any>(proxy?.useDict('purchaser_type'));
// 搜索表单数据
const queryParams = ref({
  customerNo: undefined,
  customerName: undefined,
  customerType: undefined,
  pageNum: 1,
  pageSize: 10
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const queryFormRef = ref();

/** 查询客户列表 */
const getList = () => {
  loading.value = true;
  customerList(queryParams.value).then((res) => {
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

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.customer-management {
  height: calc(100vh - 120px);
  padding: 24px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
