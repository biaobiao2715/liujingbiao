<!--
  标题: brandManagement.vue
  功能: 产品保障
  说明: 该页面用于管理品牌，包括搜索、新增、编辑、删除品牌等操作。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-21
-->
<template>
  <div class="brand-management">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" :label-width="80" inline>
      <el-form-item label="产品功能">
        <el-input v-model="queryParams.brandName" placeholder="请输入产品功能" clearable />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="getListData">搜索</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
        <el-button v-throttle @click="openAddDialog">新建产品保障</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="brandList" border style="width: 100%">
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="brandName" label="产品保障" />
      <el-table-column prop="sort" label="排序" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button v-throttle type="text" @click="editBrand(scope.row)">编辑</el-button>
          <el-button v-throttle type="text" @click="deleteBrand(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="queryParams.total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="queryParams.total"
      @pagination="handlePageChange"
    />

    <!-- 新增/编辑弹窗 -->
    <el-dialog v-model="dialogVisible" title="新增品牌">
      <el-form :model="formData" ref="formRef" label-width="80px">
        <el-form-item label="产品保障" required>
          <el-input v-model="formData.brandName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input v-model="formData.sort" type="number" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex-center-between">
        <el-button v-throttle @click="dialogVisible = false">取消</el-button>
        <el-button v-throttle type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const brandList = ref([]);
const dialogVisible = ref(false);

const queryParams = ref({
  brandName: '',
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const formData = ref({
  brandName: '',
  sort: ''
});

// 重置按钮事件
const handleReset = () => {
  queryParams.value.brandName = '';
  getListData();
};

const getListData = () => {
  // 模拟接口调用
  queryParams.value.total = 100; // 假设总条数
  brandList.value = Array.from({ length: queryParams.value.pageSize }, (_, i) => ({
    id: i + 1 + (queryParams.value.pageNum - 1) * queryParams.value.pageSize,
    brandName: `品牌${i + 1}`,
    sort: i + 1,
    createTime: new Date().toISOString()
  }));
};

// 分页切换事件
const handlePageChange = async (pageInfo: { page: number; limit: number }) => {
  queryParams.value.pageNum = pageInfo.page;
  queryParams.value.pageSize = pageInfo.limit;
  getListData();
};

const openAddDialog = () => {
  formData.value = { brandName: '', sort: '' };
  dialogVisible.value = true;
};

const handleSave = () => {
  dialogVisible.value = false;
  getListData();
};

const editBrand = (row: any) => {
  formData.value = { ...row };
  dialogVisible.value = true;
};

const deleteBrand = (id: number) => {
  console.log('删除品牌', id);
  getListData();
};

// 初始化数据
getListData();
</script>

<style scoped lang="scss">
.brand-management {
  padding: 24px;

  .search-bar {
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
  }
}
</style>
