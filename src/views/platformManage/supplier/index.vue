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
        <el-input v-model="searchForm.supplierCode" placeholder="请输入供应商编号" />
      </el-form-item>
      <el-form-item label="供应商名称">
        <el-input v-model="searchForm.supplierName" placeholder="请输入供应商名称" />
      </el-form-item>
      <el-form-item label="统一社会信用代码">
        <el-input v-model="searchForm.creditCode" placeholder="请输入统一社会信用代码" />
      </el-form-item>
      <el-form-item label="审核状态">
        <el-select v-model="searchForm.auditStatus" placeholder="请选择">
          <el-option label="待审核" value="待审核" />
          <el-option label="审核通过" value="审核通过" />
          <el-option label="审核退回" value="审核退回" />
        </el-select>
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
      <el-table-column prop="supplierCode" label="供应商编号"></el-table-column>
      <el-table-column prop="creditCode" label="统一社会信用代码"></el-table-column>
      <el-table-column prop="resourceLevel" label="资质等级"></el-table-column>
      <el-table-column prop="creditLevel" label="信用等级"></el-table-column>
      <el-table-column prop="auditStatus" label="审核状态"></el-table-column>
      <el-table-column prop="applyTime" label="申请时间"></el-table-column>
      <el-table-column prop="auditor" label="审核人"></el-table-column>
      <el-table-column label="操作" width="260">
        <template #default="scope">
          <div class="flex-center-center operation-btns">
            <el-button type="primary" @click="handleEdit(scope.row, 'view')">查看</el-button>
            <el-button type="primary" @click="handleEdit(scope.row, 'edit')">编辑</el-button>
            <el-button type="primary" @click="handleEdit(scope.row, 'audit')">审核</el-button>
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
import { ref } from 'vue';

// 搜索表单数据
const searchForm = ref({
  supplierCode: '',
  supplierName: '',
  creditCode: '',
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
    resourceLevel: '一级认证',
    creditLevel: '极佳',
    auditStatus: '待审核',
    applyTime: '2025-06-17 16:10:56',
    auditor: '张三'
  }
  // ...更多数据...
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
  // TODO: 调用接口获取数据
};

// 编辑按钮事件
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  console.log('编辑:', row, type);
  // TODO: 跳转编辑页面或弹出编辑弹窗携带type参数
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
