<!--
  标题: enterprise/index.vue
  功能: 企业管理首页
  说明: 用于企业管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="入驻时间">
        <el-date-picker
          v-model="queryParams.reviewTime"
          value-format="YYYY-MM-DD"
          type="date"
          style="width: 100%"
          placeholder="请选择日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="企业名称">
        <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" />
      </el-form-item>
      <el-form-item label="统一社会信用代码">
        <el-input v-model="queryParams.licenseNumber" placeholder="请输入统一社会信用代码" />
      </el-form-item>

      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="companyName" />
      <el-table-column label="企业编码" align="center" prop="enterpriseNumber">
        <template #default="scope">
          <span @click="handleEdit(scope.row)" style="color: #0000ff">{{ scope.row.enterpriseNumber }}</span>
        </template>
      </el-table-column>
      <el-table-column label="统一社会信用代码" align="center" prop="licenseNumber"> </el-table-column>

      <el-table-column label="联系人" align="center" prop="loginUserName"> </el-table-column>
      <el-table-column label="联系电话" align="center" prop="phoneNumber"> </el-table-column>

      <el-table-column label="入驻时间" align="center" prop="reviewTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.reviewTime) }}</span>
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

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  licenseNumber: '',
  companyName: '',
  reviewTime: '',
  enterpriseType: '1' //企业类型
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
const handleSearch = () => {
  console.log('查询表单数据:', queryParams.value);
  // TODO: 调用接口获取数据
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

// 编辑按钮事件
const handleEdit = (row: any) => {
  router.push({
    path: '/platform/enterprise/editDetails',
    query: {
      id: row.id,
      type: 'view'
    }
  });
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
