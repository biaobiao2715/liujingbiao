<template>
  <div class="category-container">
    <div class="search-component flex">
      <div class="search-select">
        <el-input v-model="searchContent" placeholder="请输入要搜索的内容" size="large" style="width: 520px">
          <template #prepend>
            <el-select v-model="searchType" placeholder="商品名称" class="search-type" size="large">
              <el-option label="名称" value="name"></el-option>
              <el-option label="品牌" value="brand"></el-option>
              <el-option label="属性" value="attribute"></el-option>
            </el-select>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch" size="large"> 搜索 </el-button>
          </template>
        </el-input>
      </div>
    </div>

    <div class="category-selection mb-12">
      <GoodsCategorySelect v-model="filterState.category" @categoryChange="handleCategoryChange" />
    </div>
    <div class="weight-selection flex gap-24">
      <div class="local">
        <RegionSelect v-model="filterState.areaCodes" @regionChange="handleAreaChange" />
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
import { eventBus } from '@/utils/eventBus';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';

const searchType = ref('name'); // 搜索类型

const searchContent = ref(''); // 搜索内容
// 合并状态到一个对象
const filterState = reactive({
  areaCodes: ['150000', '150400', '150403'], // 地址选择
  isLatest: false, // 是否最新
  isSales: false, // 是否销量
  priceMin: 0, // 最低价
  priceMax: 0, // 最高价
  category: ['1981256031894315009', '1981257238360694786', '1981257469684948993'] // 商品分类选择
});

onMounted(() => {});

// 深度监听 filterState 的变化
watch(
  () => filterState,
  (newVal) => {
    console.log('filterState 变化:', newVal);
    eventBus.emit('filterStateChange', newVal);
  },
  { deep: true }
);

// 搜索
const handleSearch = () => {
  eventBus.emit('filterStateChange', {
    ...filterState,
    searchType: searchType.value,
    searchContent: searchContent.value
  });
};

// 处理地址选择变化
const handleAreaChange = (val: string[]) => {
  console.log(val);
};

// 处理分类变化
const handleCategoryChange = (value: string[]) => {
  filterState.category = value;
  console.log('分类变化:', value);
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
