<!--
  标题: brandManagement.vue
  功能: 品牌管理
  说明: 该页面用于管理品牌，包括搜索、新增、编辑、删除品牌等操作。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-21
-->
<template>
  <div class="brand-management">
    <!-- 搜索栏 -->
    <el-form :model="queryParams" :label-width="120" inline>
      <el-form-item label="品牌名称">
        <el-input v-model="queryParams.attributeName" placeholder="请输入品牌名称" clearable />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="getTableData" v-hasPermi="['grain:goodsAttributes:brandList']">搜索</el-button>
        <el-button v-throttle @click="handleReset" v-hasPermi="['grain:goodsAttributes:brandList']">重置</el-button>
        <el-button type="primary" v-throttle @click="handleAdd" v-hasPermi="['grain:goodsAttributes:brandAdd']">新建品牌名称</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="tableData" border style="width: 100%" v-loading="loading">
      <el-table-column type="index" label="序号" width="80" />
      <el-table-column prop="attributeName" label="品牌名称" />
      <el-table-column prop="orderNum" label="排序" />
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button v-throttle type="text" @click="handleEdit(scope.row)" v-hasPermi="['grain:goodsAttributes:brandEdit']">编辑</el-button>
          <el-button v-throttle type="text" @click="handleDelete(scope.row.id)" v-hasPermi="['grain:goodsAttributes:brandRemove']">删除</el-button>
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
    <el-dialog v-model="dialogVisible" width="500px" :title="formData.id ? '编辑品牌名称' : '新增品牌名称'">
      <el-form :model="formData" :rules="formRules" ref="formRef" label-width="80px">
        <el-form-item label="品牌名称" prop="attributeName" required>
          <el-input v-model="formData.attributeName" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="排序" prop="orderNum" required>
          <el-input v-model="formData.orderNum" type="number" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="flex-center-end">
        <el-button v-throttle @click="dialogVisible = false">取消</el-button>
        <el-button v-throttle type="primary" @click="handleSave">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getProductAttributesList,
  deleteProductAttribute,
  createProductAttribute,
  updateProductAttribute
} from '@/api/platform/mallConfiguration/productAttributeLabel';

const tableData = ref([]);
const dialogVisible = ref(false);
const loading = ref(false);
const formRef = ref();

const queryParams = ref({
  attributeName: '',
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const formData = ref({
  id: '',
  attributeName: '',
  orderNum: ''
});

const formRules = {
  attributeName: [{ required: true, message: '请输入品牌名称', trigger: 'blur' }],
  orderNum: [{ required: true, message: '请输入排序', trigger: 'blur' }]
};

onMounted(() => {
  getTableData();
});

const getTableData = async () => {
  loading.value = true;
  try {
    const res = await getProductAttributesList({
      attributeType: 0,
      attributeName: queryParams.value.attributeName,
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize
    });
    if (res.code === 200) {
      tableData.value = res.rows || [];
      queryParams.value.total = res.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

// 重置按钮事件
const handleReset = () => {
  queryParams.value.attributeName = '';
  getTableData();
};

// 分页切换事件
const handlePageChange = async (pageInfo: { page: number; limit: number }) => {
  queryParams.value.pageNum = pageInfo.page;
  queryParams.value.pageSize = pageInfo.limit;
  getTableData();
};

const handleAdd = () => {
  formData.value = { id: '', orderNum: '', attributeName: '' };
  dialogVisible.value = true;
};

const handleSave = async () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      const api = formData.value.id ? updateProductAttribute : createProductAttribute;
      try {
        const res = await api({
          id: formData.value.id,
          attributeType: 0,
          attributeName: formData.value.attributeName,
          orderNum: formData.value.orderNum
        });
        if (res.code === 200) {
          ElMessage.success(`${formData.value.id ? '修改' : '新增'}成功`);
          dialogVisible.value = false;
          getTableData();
        }
      } catch {}
    }
  });
};

// 修改
const handleEdit = (row: any) => {
  formData.value = {
    id: row.id,
    attributeName: row.attributeName,
    orderNum: row.orderNum
  };
  dialogVisible.value = true;
};

// 删除
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('确定要删除该品牌吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteProductAttribute([id]);
      ElMessage.success('删除成功');
      getTableData();
    } catch {
      ElMessage.error('删除失败');
    }
  });
};
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
