<!--
  标题: productCategory.vue
  功能: 商品类目管理
  说明: 该页面用于管理商品类目，包括新增、编辑、删除类目等操作。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-21
-->
<template>
  <div class="product-category">
    <!-- 新建按钮 -->
    <div class="mb-4">
      <el-button type="primary" @click="handleCreateCategory()" v-hasPermi="['grain:goodsCategory:add']"> 新增类目 </el-button>
    </div>

    <!-- 树形表格 -->
    <el-table
      :data="tableData"
      row-key="id"
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
      style="width: 100%"
      v-loading="loading"
    >
      <el-table-column prop="categoryName" label="商品类目" show-overflow-tooltip />
      <el-table-column prop="orderNum" label="排序" width="120"/>
      <el-table-column prop="createTime" label="创建时间" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <!-- 操作按钮 -->
          <div class="flex-center-end">
            <el-button
              type="text"
              @click="handleCreateCategory(row)"
              v-if="row.ancestors && row.ancestors?.split(',').length < 3"
              v-hasPermi="['grain:goodsCategory:add']"
            >
              新增子类目
            </el-button>
            <el-button type="text" @click="editCategory(row)" v-hasPermi="['grain:goodsCategory:edit']"> 编辑 </el-button>
            <el-button type="text" @click="deleteCategory(row)" v-hasPermi="['grain:goodsCategory:remove']"> 删除 </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 弹窗表单 -->
    <el-dialog v-model="dialogVisible" width="500px" :title="form.id ? '编辑类目' : '新增类目'">
      <el-form :model="form" :label-width="80" ref="formRef" :rules="rules">
        <!-- 上级类目 -->
        <el-form-item label="上级类目" prop="parentId" required v-if="form.parentId && form.parentId !== '0'">
          <el-input v-model="form.parentName" :disabled="true" />
        </el-form-item>
        <!-- 类目名称 -->
        <el-form-item label="类目名称" prop="categoryName" required>
          <el-input v-model="form.categoryName" placeholder="请输入类目名称" maxlength="20" />
        </el-form-item>
        <!-- 排序 -->
        <el-form-item label="排序" prop="orderNum" required>
          <el-input v-model="form.orderNum" type="number" placeholder="请输入排序" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">确认</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import {
  getProductCategoryList,
  createProductCategory,
  updateProductCategory,
  deleteProductCategory
} from '@/api/platform/mallConfiguration/productCategory';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 定义类目的接口
interface Category {
  id: string; // 类目ID
  categoryName: string; // 类目名称
  parentId: string | null; // 上级类目ID，null表示一级类目
  parentName?: string; // 上级类目名称
  orderNum: number | null; // 排序
  createTime: string; // 创建时间
  children?: Category[]; // 子类目
}

const loading = ref(false);

const formRef = ref<ElFormInstance>();

// 类目数据（树形结构）
const tableData = ref<Category[]>([]);

const originalData = ref<Category[]>([]);

// 弹窗显示状态
const dialogVisible = ref(false);

// 表单数据
const form = ref<Category>({
  id: null,
  categoryName: '',
  parentId: null,
  parentName: '', // 新增字段：上级类目名称
  orderNum: null,
  createTime: ''
});

const rules = {
  categoryName: [
    { required: true, message: '请输入类目名称', trigger: 'blur' },
    { min: 1, max: 50, message: '类目名称长度在1到50个字符之间', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { pattern: /^[0-9]+$/, message: '排序必须为数字', trigger: 'blur' }
  ]
};

// 新建类目
const handleCreateCategory = (parent?: Category) => {
  dialogVisible.value = true;
  form.value = { id: null, categoryName: '', parentId: parent?.id || '0', parentName: parent?.categoryName || '', orderNum: null, createTime: '' };
  clearValidate();
};

// 编辑类目
const editCategory = (category: Category) => {
  dialogVisible.value = true;
  form.value = { ...category, parentName: findParentName(category.parentId) };
  clearValidate();
};

// 根据 parentId 查找上级类目名称
const findParentName = (parentId: string): string => {
  const parent = originalData.value.find((item) => item.id === parentId);
  return parent ? parent.categoryName : '';
};

// 清除表单验证
const clearValidate = () => {
  formRef.value?.clearValidate();
};

// 获取类目列表
const fetchCategories = async () => {
  loading.value = true;
  try {
    const response = await getProductCategoryList();
    if (response.code === 200) {
      originalData.value = response.data;
      tableData.value = proxy?.handleTree<Category>(response.data, 'id');
      console.log(tableData.value);
    }
  } catch (error) {
    ElMessage.error('获取类目列表失败');
  } finally {
    loading.value = false;
  }
};

// 保存类目
const saveCategory = async () => {
  try {
    formRef.value.validate(async (valid: boolean) => {
      if (valid) {
        const res = form.value.id ? await updateProductCategory(form.value) : await createProductCategory(form.value);
        if (res.code === 200) {
          ElMessage.success(form.value.id ? '类目更新成功' : '类目创建成功');
          dialogVisible.value = false;
          fetchCategories();
        }
      }
    });
  } catch (error) {
    ElMessage.error('保存类目失败');
  }
};

// 删除类目
const deleteCategory = async (category: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除类目 "${category.categoryName}" 吗？此操作将永久删除该类目${category.children.length > 0 ? '及其子类目' : ''}。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const res = await deleteProductCategory(category.id);
    if (res.code === 200) {
      ElMessage.success('类目删除成功');
      fetchCategories();
    }
  } catch (error) {}
};

// 页面加载时获取类目数据
onMounted(() => {
  fetchCategories();
});
</script>

<style scoped lang="scss">
.product-category {
  padding: 24px;
}
/* 弹窗样式 */
.el-dialog {
  width: 400px;
}
</style>
