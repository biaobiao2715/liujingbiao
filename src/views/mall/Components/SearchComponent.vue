<template>
  <div class="category-container">
    <div class="search-component flex">
      <div class="search-select">
        <el-input v-model="searchContent" placeholder="请输入要搜索的内容" size="large" style="width: 520px">
          <template #prepend>
            <el-select v-model="searchType" placeholder="商品名称" class="search-type" size="large">
              <el-option label="名称" value="goodsName"></el-option>
              <el-option label="品牌" value="goodsBrandName"></el-option>
              <el-option label="属性" value="goodsAbilityName"></el-option>
            </el-select>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch" size="large"> 搜索 </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="weight-selection flex gap-24">
      <div class="category-selection mb-12">
        <GoodsCategorySelect v-model="filterState.category" @categoryChange="handleCategoryChange" />
      </div>
      <div class="local">
        <RegionSelect v-model="filterState.areaCodes" @regionChange="handleAreaChange" />
      </div>

      <el-segmented v-model="filterState.sortType" :options="sortList" />

      <div class="price flex-center gap-8">
        <div class="price-label">价格</div>
        <el-input v-model="filterState.minPrice" type="number" placeholder="最低价" />
        -
        <el-input v-model="filterState.maxPrice" type="number" placeholder="最高价" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, toRaw } from 'vue';
import { eventBus } from '@/utils/eventBus';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';

const emit = defineEmits(['searchChange']);

const searchType = ref('goodsName'); // 搜索类型

const searchContent = ref(''); // 搜索内容

const sortList = ref([
  {
    label: '综合',
    value: ''
  },
  {
    label: '按销量',
    value: '0'
  },
  {
    label: '按最新',
    value: '1'
  }
]);

// 合并状态到一个对象
const filterState = reactive({
  areaCodes: [], // 地址选择
  sortType: '', // 排序类型
  minPrice: 0, // 最低价
  maxPrice: 0, // 最高价
  category: [] // 商品分类选择
});

onMounted(() => {});

// 搜索
const handleSearch = () => {
  if (filterState.minPrice > filterState.maxPrice) {
    ElMessage.error('最高价不能小于最低价');
    return;
  }
  emit('searchChange', {
    ...filterState,
    searchType: searchType.value,
    searchContent: searchContent.value
  });
};

// 处理地址选择变化
const handleAreaChange = (val: any) => {
  filterState.areaCodes = val ? toRaw(val.regionPath) : [];
};

// 处理分类变化
const handleCategoryChange = (value: string[]) => {
  filterState.category = value || [];
};
</script>

<style scoped lang="scss">
.category-container {
  padding: 12px;
  border: 1px solid #e4e7ed;
  .search-component {
    padding: 12px;
  }
  .search-select {
    display: flex;
    align-items: center;
    margin: 0 auto;
  }

  .search-type {
    width: 120px;
  }
  .category-selection {
    width: 220px;
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
