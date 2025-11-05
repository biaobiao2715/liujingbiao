<template>
  <div class="goods-category">
    <el-cascader
      v-model="selectedCategory"
      :options="categorieList"
      :disabled="props.disabled"
      clearable
      :props="propsCascader"
      :show-all-levels="props.showAllLevels"
      :placeholder="props.placeholder"
      @change="handleCategoryChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

interface Category {
  id: string;
  categoryName: string;
  parentId: string | null;
  orderNum: number | null;
  createTime: string;
  children?: Category[];
}

const emit = defineEmits(['categoryChange']);

const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    default: () => []
  },
  //是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  //是否多选
  multiple: {
    type: Boolean,
    default: false
  },
  //是否选择任意一级选项
  checkStrictly: {
    type: Boolean,
    default: false
  },
  // 是否仅显示最后一级
  showAllLevels: {
    type: Boolean,
    default: true
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请选择区域'
  },
  // 是否只返回最后一级分类id
  emitPath: {
    type: Boolean,
    default: true
  }
});

const propsCascader = {
  multiple: props.multiple,
  checkStrictly: props.checkStrictly,
  emitPath: props.emitPath,
  value: 'id',
  label: 'categoryName',
  children: 'children'
};

const categorieList = ref<Category[]>([]); // 商品分类列表

const selectedCategory = ref<string[]>([]); // 当前选择的分类

watch(
  () => props.modelValue,
  (newValue) => {
    console.log('props.modelValue:', newValue);
    selectedCategory.value = newValue;
  },
  { immediate: true } // 初始化时立即同步
);

// 分类数据
const fetchCategories = async () => {
  try {
    const res = await getProductCategoryList();
    if (res.code === 200) {
      categorieList.value = proxy?.handleTree<Category>(res.data, 'id'); // 假设接口返回的已是树形结构
    }
  } catch (error) {
    console.error('获取商品分类数据失败:', error);
  }
};

// 通知父组件分类变化
const handleCategoryChange = (value: string[]) => {
  // console.log('选择的分类:', value);
  // 触发自定义事件通知父组件
  emit('categoryChange', value);
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped lang="scss">
.goods-category {
  width: 100%;
  ::v-deep .el-cascader {
    width: 100%;
  }
}
</style>
