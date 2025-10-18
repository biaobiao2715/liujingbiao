<!--
  标题: supplier/index.vue
  功能: 供应商管理首页
  说明: 用于供应商管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form :model="searchForm" inline :label-width="130">
      <el-form-item label="供应商编号">
        <el-input v-model="searchForm.enterpriseNumber" placeholder="请输入供应商编号" clearable />
      </el-form-item>
      <el-form-item label="供应商名称">
        <el-input v-model="searchForm.companyName" placeholder="请输入供应商名称" clearable />
      </el-form-item>
      <el-form-item label="统一社会信用代码">
        <el-input v-model="searchForm.licenseNumber" placeholder="请输入统一社会信用代码" clearable />
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="searchForm.reviewStatus" placeholder="请选择" clearable>
          <el-option label="待审核" value="0" />
          <el-option label="审核通过" value="1" />
          <el-option label="审核退回" value="99" />
        </el-select>
      </el-form-item>
      <!-- 审核通过时间 -->
      <el-form-item label="审核时间">
        <el-date-picker
          v-model="searchForm.reviewTime"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="computedTableData" border style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="companyName" label="供应商名称"></el-table-column>
      <el-table-column prop="enterpriseNumber" label="供应商编号">
        <template #default="scope">
          <router-link :to="`/platform/supplier/details?id=${scope.row.id}&type=view`" style="color: var(--el-color-primary)">{{
            scope.row.enterpriseNumber
          }}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="licenseNumber" label="统一社会信用代码"></el-table-column>
      <el-table-column prop="credentialLevel" label="资质等级">
        <template #default="scope">
          {{ scope.row.credentialLevelText }}
        </template>
      </el-table-column>
      <el-table-column prop="creditLevel" label="信用等级">
        <template #default="scope">
          {{ scope.row.creditLevelText }}
        </template>
      </el-table-column>
      <el-table-column prop="reviewStatus" label="审核状态">
        <template #default="scope">
          {{ scope.row.reviewStatusText }}
        </template>
      </el-table-column>
      <el-table-column prop="signUpTime" label="申请时间" width="120">
        <template #default="scope">
          {{ scope.row.formattedSignUpTime }}
        </template>
      </el-table-column>
      <el-table-column prop="reviewTime" label="审核时间" width="120"> </el-table-column>
      <el-table-column prop="reviewBy" label="审核人"></el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <div class="flex-center-center operation-btns">
            <el-button type="primary" @click="handleEdit(scope.row, 'view')">查看</el-button>
            <el-button type="primary" @click="handleEdit(scope.row, 'edit')">编辑</el-button>
            <el-button type="primary" @click="handleEdit(scope.row, 'audit')" v-if="scope.row.reviewStatus === '0'">审核</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination
        v-show="queryParams.total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="queryParams.total"
        @pagination="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { ref, computed } from 'vue';
import { baseEnterpriseInfoList } from '@/api/platform/enterprise';

// 搜索表单数据
const searchForm = ref({
  enterpriseNumber: '',
  companyName: '',
  licenseNumber: '',
  reviewStatus: '',
  reviewTime: []
});

// 表格数据
const tableData = ref([]);

// 分页数据
const queryParams = ref({
  total: 0,
  pageSize: 10,
  pageNum: 1
});

// 表格加载状态
const loading = ref(false);

onMounted(() => {
  getListData();
});

// 计算属性，用于处理表格中复杂的显示逻辑
const computedTableData = computed(() =>
  tableData.value.map((row) => ({
    ...row,
    credentialLevelText: row.credentialLevel === '0' ? '一级认证' : row.credentialLevel === '1' ? '二级认证' : '三级认证',
    creditLevelText:
      row.creditLevel === '0'
        ? '优秀'
        : row.creditLevel === '1'
          ? '良好'
          : row.creditLevel === '2'
            ? '一般'
            : row.creditLevel === '3'
              ? '一般以下'
              : '较差',
    reviewStatusText: row.reviewStatus === '0' ? '待审核' : row.reviewStatus === '1' ? '审核通过' : '审核退回',
    formattedSignUpTime: row.signUpTime ? row.signUpTime.substring(0, 10) : ''
  }))
);

// 查询按钮事件
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getListData();
};

// 重置按钮事件
const handleReset = () => {
  searchForm.value = {
    enterpriseNumber: '',
    companyName: '',
    licenseNumber: '',
    reviewStatus: '',
    reviewTime: []
  };
  getListData();
};

// 分页切换事件
const handlePageChange = async (pageInfo: { page: number; limit: number }) => {
  queryParams.value.pageNum = pageInfo.page;
  queryParams.value.pageSize = pageInfo.limit;
  getListData();
};

// 获取列表数据
const getListData = async () => {
  loading.value = true; // 开始加载
  try {
    const res = await baseEnterpriseInfoList({
      ...searchForm.value,
      enterpriseType: 1,
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize,
      reviewTime: undefined,
      reviewStartTime: searchForm.value.reviewTime?.[0],
      reviewEndTime: searchForm.value.reviewTime?.[1]
    });
    tableData.value = res.rows || [];
    queryParams.value.total = res.total || 0;
  } catch (error) {
    console.error('获取列表数据失败:', error);
  } finally {
    loading.value = false; // 加载结束
  }
};

// 编辑按钮事件
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  router.push({
    path: '/platform/supplier/details',
    query: {
      id: row.id,
      type
    }
  });
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
