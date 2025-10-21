<template>
  <div class="brand-management">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" :label-width="80" inline>
      <el-form-item label="产品保障">
        <el-input v-model="queryParams.productGuarantee" placeholder="请输入产品保障" clearable />
      </el-form-item>
      <el-form-item label="产品功能">
        <el-input v-model="queryParams.productFunction" placeholder="请输入产品功能" clearable />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle  type="primary" @click="getListData">搜索</el-button>
        <el-button v-throttle  @click="handleReset">重置</el-button>
        <el-button v-throttle  @click="openAddDialog">新建标签</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="labelList" border style="width: 100%">
      <el-table-column prop="id" label="序号" width="80" />
      <el-table-column prop="productGuarantee" label="产品保障" />
      <el-table-column prop="productFunction" label="产品功能" />
      <el-table-column prop="sort" label="排序" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button v-throttle  type="text" @click="editLabel(scope.row)">编辑</el-button>
          <el-button v-throttle  type="text" @click="deleteLabel(scope.row.id)">删除</el-button>
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
    <el-dialog v-model="dialogVisible" title="新增标签">
      <el-form :model="formData" ref="formRef" label-width="80px">
        <el-form-item label="产品保障">
          <el-input v-model="formData.productGuarantee" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="产品功能" required>
          <el-input v-model="formData.productFunction" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="排序" required>
          <el-input v-model="formData.sort" type="number" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer flex-center-between">
        <el-button v-throttle  @click="dialogVisible = false">取消</el-button>
        <el-button v-throttle  type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const labelList = ref([]);
const dialogVisible = ref(false);

const queryParams = ref({
  productGuarantee: '',
  productFunction: '',
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const formData = ref({
  productGuarantee: '',
  productFunction: '',
  sort: ''
});

// 重置按钮事件
const handleReset = () => {
  queryParams.value.productGuarantee = '';
  queryParams.value.productFunction = '';
  getListData();
};

const getListData = () => {
  // 模拟接口调用
  queryParams.value.total = 100; // 假设总条数
  labelList.value = Array.from({ length: queryParams.value.pageSize }, (_, i) => ({
    id: i + 1 + (queryParams.value.pageNum - 1) * queryParams.value.pageSize,
    productGuarantee: `保障${i + 1}`,
    productFunction: `功能${i + 1}`,
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
  formData.value = { productGuarantee: '', productFunction: '', sort: '' };
  dialogVisible.value = true;
};

const handleSave = () => {
  dialogVisible.value = false;
  getListData();
};

const editLabel = (row: any) => {
  formData.value = { ...row };
  dialogVisible.value = true;
};

const deleteLabel = (id: number) => {
  console.log('删除标签', id);
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
