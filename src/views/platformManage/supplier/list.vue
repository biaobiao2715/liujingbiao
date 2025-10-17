<!--
  标题: supplier/index.vue
  功能: 供应商列表
  说明: 用于供应商审核管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form :model="searchForm" inline :label-width="130">
      <el-form-item label="入驻时间">
        <el-date-picker
          v-model="searchForm.registrationDate"
          type="daterange"
          value-format="yyyy-MM-dd"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item label="供应商名称">
        <el-input v-model="searchForm.supplierName" placeholder="请输入供应商名称" />
      </el-form-item>
      <el-form-item label="统一社会信用代码">
        <el-input v-model="searchForm.creditCode" placeholder="请输入统一社会信用代码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="index" label="序号" width="60"></el-table-column>
      <el-table-column prop="supplierName" label="供应商名称"></el-table-column>
      <el-table-column prop="supplierCode" label="供应商编号">
        <template #default="scope">
          <router-link :to="`/platform/supplier/audit/details?id=${scope.row.id}&type=view`" style="color: var(--el-color-primary)">{{
            scope.row.supplierCode
          }}</router-link>
        </template>
      </el-table-column>
      <el-table-column prop="creditCode" label="统一社会信用代码"></el-table-column>
      <el-table-column prop="contactName" label="联系人"></el-table-column>
      <el-table-column prop="contactPhone" label="联系电话"></el-table-column>
      <el-table-column prop="registrationDate" label="入驻时间"></el-table-column>
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
import { ref } from 'vue';

// 搜索表单数据
const searchForm = ref({
  supplierCode: '',
  supplierName: '',
  creditCode: '',
  registrationDate: [],
  auditStatus: ''
});

// 表格数据
const tableData = ref([
  // 示例数据
  {
    index: 1,
    supplierName: 'XXXX有限公司',
    supplierCode: 'GYS20250930001',
    creditCode: 'A13205830518507857',
    contactName: '张三',
    contactPhone: '13800138000',
    registrationDate: '2025-06-17'
  }
]);

// 分页数据
const queryParams = ref({
  total: 100,
  pageSize: 10,
  pageNum: 1
});

// 查询按钮事件
const handleSearch = () => {
  console.log('查询表单数据:', searchForm.value);
  // TODO: 调用接口获取数据
};

// 重置按钮事件
const handleReset = () => {
  searchForm.value = {
    supplierCode: '',
    supplierName: '',
    creditCode: '',
    auditStatus: ''
  };
};

// 分页切换事件
const handlePageChange = (page: number) => {
  queryParams.value.pageNum = page;
};

// 编辑按钮事件
const handleView = (row: any) => {
  router.push({
    path: '/platform/supplier/audit/details',
    query: {
      id: row.id,
      type: 'view'
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
