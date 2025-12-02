<template>
  <div class="category-container">
    <div class="title mb-24">商品列表</div>
    <div class="weight-selection flex-center gap-24">
      <div class="category-selection">
        <GoodsCategorySelect v-model="filterState.category" @categoryChange="handleCategoryChange" />
      </div>
      <div class="local">
        <RegionSelect v-model="filterState.areaCodes" @regionChange="handleAreaChange" />
      </div>

      <!-- <el-segmented v-model="filterState.sortType" :options="sortList" /> -->
      <!-- 排序方式 -->
      <el-select v-model="filterState.sortType" placeholder="排序方式" style="width: 150px">
        <el-option v-for="item in sortList" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>

      <div class="price flex-center gap-8">
        <div class="price-label">价格</div>
        <el-input-number
          v-model="filterState.minPrice"
          placeholder="最低价"
          :precision="2"
          :controls="false"
          class="price-input"
          @change="handleMinPriceChange"
        />
        -
        <el-input-number
          v-model="filterState.maxPrice"
          placeholder="最高价"
          :precision="2"
          :controls="false"
          class="price-input"
          @change="handleMaxPriceChange"
        />
        <el-button
          v-if="filterState.minPrice !== undefined || filterState.maxPrice !== undefined"
          link
          type="primary"
          @click="clearPrice"
          class="clear-price-btn"
        >
          清空
        </el-button>
      </div>
      <div class="search-component flex">
        <div class="search-select">
          <el-input v-model="searchContent" placeholder="请输入要搜索的内容" style="width: 380px">
            <template #prepend>
              <el-select v-model="searchType" placeholder="商品名称" class="search-type">
                <el-option label="名称" value="goodsName"></el-option>
                <el-option label="品牌" value="goodsBrandName"></el-option>
                <el-option label="属性" value="goodsAbilityName"></el-option>
              </el-select>
            </template>
            <template #append>
              <el-button type="primary" @click="handleSearch"> 搜索 </el-button>
            </template>
          </el-input>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, toRaw } from 'vue';
import { ElMessage } from 'element-plus';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import RegionSelect from '@/components/RegionSelect/index.vue';

const emit = defineEmits(['searchChange']);

const searchType = ref('goodsName'); // 搜索类型

const searchContent = ref(''); // 搜索内容

const sortList = ref([
  {
    label: '综合排序',
    value: '-1'
  },
  {
    label: '按销量',
    value: '0'
  },
  {
    label: '按最新',
    value: '1'
  },
  {
    label: '按价格升序',
    value: '3'
  }
]);

// 合并状态到一个对象
const filterState = reactive({
  areaCodes: [], // 地址选择
  sortType: '-1', // 排序类型
  minPrice: undefined as number | undefined, // 最低价
  maxPrice: undefined as number | undefined, // 最高价
  category: [] // 商品分类选择
});

// 是否已初始化完成，用于避免初始化时触发搜索
const isInitialized = ref(false);

onMounted(() => {
  // 标记初始化完成
  isInitialized.value = true;
});

watch(
  () => filterState,
  () => {
    // 只有在初始化完成后才自动触发搜索
    if (isInitialized.value) {
      handleSearch();
    }
  },
  { deep: true }
);

// 搜索
const handleSearch = () => {
  // 验证价格输入：必须同时输入最低价和最高价，或者都不输入
  const hasMinPrice = filterState.minPrice !== undefined && filterState.minPrice !== null;
  const hasMaxPrice = filterState.maxPrice !== undefined && filterState.maxPrice !== null;

  // 如果只输入了最低价，提示需要输入最高价
  if (hasMinPrice && !hasMaxPrice) {
    ElMessage.error('请输入最高价');
    return;
  }

  // 如果只输入了最高价，提示需要输入最低价
  if (!hasMinPrice && hasMaxPrice) {
    ElMessage.error('请输入最低价');
    return;
  }

  // 如果两个价格都输入了，进行进一步验证
  if (hasMinPrice && hasMaxPrice) {
    // 验证价格不能为负数
    if (filterState.minPrice < 0) {
      ElMessage.error('价格不能为负数');
      return;
    }
    if (filterState.maxPrice < 0) {
      ElMessage.error('价格不能为负数');
      return;
    }
    // 验证最高价不能小于最低价
    if (filterState.minPrice > filterState.maxPrice) {
      ElMessage.error('最高价不能小于最低价');
      return;
    }
  }

  // 构建搜索参数，空值转换为 undefined，0 值保持为 0
  const searchParams = {
    ...filterState,
    minPrice: filterState.minPrice === undefined || filterState.minPrice === null ? undefined : filterState.minPrice,
    maxPrice: filterState.maxPrice === undefined || filterState.maxPrice === null ? undefined : filterState.maxPrice,
    searchType: searchType.value,
    searchContent: searchContent.value
  };

  emit('searchChange', searchParams);
};

// 监听排序类型变化，自动触发搜索
watch(
  () => filterState.sortType,
  () => {
    // 只有在初始化完成后才自动触发搜索
    if (isInitialized.value) {
      handleSearch();
    }
  }
);

// 处理地址选择变化
const handleAreaChange = (val: any) => {
  filterState.areaCodes = val ? toRaw(val.regionPath) : [];
};

// 处理分类变化
const handleCategoryChange = (value: string[]) => {
  filterState.category = value || [];
};

// 处理最低价变化，允许清空
const handleMinPriceChange = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    filterState.minPrice = undefined;
  } else if (value < 0) {
    // 如果输入负数，清空输入框
    filterState.minPrice = undefined;
  }
};

// 处理最高价变化，允许清空
const handleMaxPriceChange = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    filterState.maxPrice = undefined;
  } else if (value < 0) {
    // 如果输入负数，清空输入框
    filterState.maxPrice = undefined;
  }
};

// 清空价格
const clearPrice = () => {
  filterState.minPrice = undefined;
  filterState.maxPrice = undefined;
};
</script>

<style scoped lang="scss">
.category-container {
  margin-top: 32px;
  .title {
    font-size: 20px;
    font-weight: bold;
    border-left: 4px solid #108c58;
    padding-left: 6px;
    line-height: 18px;
  }
  .search-select {
    display: flex;
    align-items: center;
    margin: 0 auto;

    ::v-deep .el-input-group__prepend {
      background: transparent !important;
    }

    ::v-deep .el-input-group__append {
      background: #108c58 !important;
      color: #fff !important;
    }
  }

  .search-type {
    width: 90px;
  }
  .category-selection {
    width: 220px;
    ::v-deep .el-cascader {
      width: 100%;
    }
  }
  .weight-selection {
    flex-wrap: wrap;
    .local {
      width: 220px;
      ::v-deep .el-cascader {
        width: 100%;
      }
    }
    .price {
      .price-label {
        width: 42px;
      }
      .price-input {
        width: 120px;
      }
      .clear-price-btn {
        margin-left: 8px;
        padding: 0;
        font-size: 12px;
      }
    }
  }
}
</style>
