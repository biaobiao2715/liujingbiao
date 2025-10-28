<template>
  <div class="category-container">
    <div class="category-selection mb-12">
      <el-cascader v-model="filterState.category" :options="categorieList" :props="props" @change="handleChange" />
    </div>
    <div class="weight-selection flex gap-24">
      <div class="local">
        <el-cascader
          v-model="filterState.areaCodes"
          filterable
          :options="optionsAddres"
          :props="{
            value: 'value',
            label: 'label',
            children: 'children'
          }"
          placeholder="请选择"
          @change="handleAreaChange"
        ></el-cascader>
      </div>
      <el-button :type="filterState.isLatest ? 'primary' : 'default'" @click="filterState.isLatest = !filterState.isLatest">最新</el-button>
      <el-button :type="filterState.isSales ? 'primary' : 'default'" @click="filterState.isSales = !filterState.isSales">销量</el-button>
      <div class="price flex-center gap-8">
        <div class="price-label">价格</div>
        <el-input v-model="filterState.priceMin" placeholder="最低价" />
        -
        <el-input v-model="filterState.priceMax" placeholder="最高价" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue';
import areaData from 'china-area-data'; //注册地址数据
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import { eventBus } from '@/utils/eventBus';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 定义类目的接口
interface Category {
  id: string; // 类目ID
  categoryName: string; // 类目名称
  parentId: string | null; // 上级类目ID，null表示一级类目
  orderNum: number | null; // 排序
  createTime: string; // 创建时间
  children?: Category[]; // 子类目
}

const categorieList = ref([]); // 商品分类列表

// 合并状态到一个对象
const filterState = reactive({
  areaCodes: [], // 地址选择
  isLatest: false, // 是否最新
  isSales: false, // 是否销量
  priceMin: 0, // 最低价
  priceMax: 0, // 最高价
  category: [] // 商品分类选择
});

const props = {
  value: 'id',
  label: 'categoryName',
  children: 'children'
};

onMounted(() => {
  fetchCategories();
});

// 深度监听 filterState 的变化
watch(
  () => filterState,
  (newVal) => {
    console.log('filterState 变化:', newVal);

    eventBus.emit('filterStateChange', newVal);
  },
  { deep: true }
);

// 地址选择数据
const optionsAddres = computed(() => {
  const formatData = (parentCode) => {
    const children = areaData[parentCode];
    if (!children) return undefined;

    return Object.keys(children).map((code) => ({
      value: code,
      label: children[code],
      children: formatData(code)
    }));
  };
  return formatData('86') || [];
});

// 处理地址选择变化
const handleAreaChange = (val: string[]) => {
  console.log(val);
};

// 获取商品分类数据
const fetchCategories = async () => {
  try {
    const res = await getProductCategoryList();
    if (res.code === 200) {
      categorieList.value = proxy?.handleTree<Category>(res.data, 'id');
    }
  } catch (error) {
    console.error('获取商品分类数据失败:', error);
  }
};

const handleChange = (value) => {
  console.log(value);
};
</script>

<style scoped lang="scss">
.category-container {
  padding: 12px;
  border: 1px solid #e4e7ed;
  .category-selection {
    width: 360px;
    ::v-deep .el-cascader {
      width: 100%;
    }
  }
  .weight-selection {
    .local {
      width: 360px;
      ::v-deep .el-cascader {
        width: 100%;
      }
    }
    .price {
      .price-label {
      }
      .el-input {
        width: 80px;
      }
    }
  }
}
</style>
