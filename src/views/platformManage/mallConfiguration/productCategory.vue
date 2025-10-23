<!--
  标题: productCategory.vue
  功能: 商品分类管理
  说明: 该页面用于管理商品分类，包括新增、编辑、删除分类等操作。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-21
-->
<template>
  <div class="product-category">
    <!-- 新建按钮 -->
    <div class="mb-4">
      <el-button type="primary" @click="handleCreateCategory">新增分类</el-button>
    </div>

    <!-- 弹窗表单 -->
    <el-dialog v-model="dialogVisible" width="500px" :title="form.id ? '编辑分类' : '新增分类'">
      <el-form :model="form">
        <!-- 上级分类选择 -->
        <el-form-item label="上级分类">
          <el-select v-model="form.parentId" filterable placeholder="请选择">
            <el-option v-for="item in flatCategories" :key="item.id" :label="item.name" :value="item.id" />
          </el-select>
        </el-form-item>
        <!-- 分类名称输入 -->
        <el-form-item label="分类名称">
          <el-input v-model="form.name" placeholder="请输入" />
        </el-form-item>
      </el-form>
      <template v-slot:footer>
        <div class="dialog-footer flex-center-between">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 树形表格 -->
    <el-table :data="categories" row-key="id" :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" style="width: 100%">
      <el-table-column prop="name" label="商品分类" />
      <el-table-column prop="order" label="排序" />
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <!-- 操作按钮 -->
          <div class="flex-center-end">
            <el-button type="text" @click="handleCreateSubCategory(row)" v-if="row.children">新增子分类</el-button>
            <el-button type="text" @click="editCategory(row)">编辑</el-button>
            <el-button type="text" @click="deleteCategory(row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElMessageBox } from 'element-plus';

// 定义分类的接口
interface Category {
  id: number; // 分类ID
  name: string; // 分类名称
  parentId: number | null; // 上级分类ID，null表示一级分类
  order: number; // 排序
  createdAt: string; // 创建时间
  children?: Category[]; // 子分类
}

// 分类数据（树形结构）
const categories = ref<Category[]>([
  // 示例数据
  {
    id: 1,
    name: '种子',
    parentId: null,
    order: 0,
    createdAt: '2025-09-19 9:39:39',
    children: [
      {
        id: 3,
        name: '粮食类种子',
        parentId: 1,
        order: 0,
        createdAt: '2025-09-19 9:39:39',
        children: [{ id: 4, name: '玉米种子', parentId: 3, order: 0, createdAt: '2025-09-19 9:39:39' }]
      }
    ]
  },
  {
    id: 2,
    name: '植物类种子',
    parentId: 1,
    order: 1,
    createdAt: '2025-09-19 9:39:39',
    children: [{ id: 5, name: '蔬菜类种子', parentId: 2, order: 0, createdAt: '2025-09-19 9:39:39' }]
  }
]);

// 扁平化分类数据，用于上级分类选择
const flatCategories = ref<Category[]>([]);

// 弹窗显示状态
const dialogVisible = ref(false);

// 表单数据
const form = ref<Category>({ id: 0, name: '', parentId: null, order: 0, createdAt: '' });

// 新建一级分类
const handleCreateCategory = () => {
  form.value = { id: 0, name: '', parentId: null, order: 0, createdAt: '' };
  dialogVisible.value = true;
};

// 新建子分类
const handleCreateSubCategory = (parent: Category) => {
  form.value = { id: 0, name: '', parentId: parent.id, order: 0, createdAt: '' };
  dialogVisible.value = true;
};

// 保存分类
const saveCategory = () => {
  const newCategory = { ...form.value, id: Date.now(), createdAt: new Date().toISOString() };
  if (newCategory.parentId) {
    // 添加到父分类的子分类中
    const parent = categories.value.find((cat) => cat.id === newCategory.parentId);
    if (parent) {
      parent.children = parent.children || [];
      parent.children.push(newCategory);
    }
  } else {
    // 添加为一级分类
    categories.value.push(newCategory);
  }
  dialogVisible.value = false;
};

// 编辑分类
const editCategory = (category: Category) => {
  form.value = { ...category };
  dialogVisible.value = true;
};

// 删除分类
const deleteCategory = (category: Category) => {
  ElMessageBox.confirm(`确定要删除分类 "${category.name}" 吗？此操作将永久删除该分类及其子分类。`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const deleteRecursive = (list: Category[], id: number) => {
        const index = list.findIndex((item) => item.id === id);
        if (index !== -1) {
          list.splice(index, 1);
        } else {
          list.forEach((item) => {
            if (item.children) deleteRecursive(item.children, id);
          });
        }
      };
      deleteRecursive(categories.value, category.id);
    })
    .catch(() => {
      // 用户取消删除操作
    });
};

// 初始化扁平化分类数据
flatCategories.value = categories.value.reduce((acc, cur) => {
  const flatten = (cat: Category) => {
    acc.push(cat);
    if (cat.children) cat.children.forEach(flatten);
  };
  flatten(cur);
  return acc;
}, []);
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
