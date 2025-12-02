<!--
  标题: CompareGoodsPage.vue
  功能: 对比商品页面
  说明:        
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-29
-->
<template>
  <div class="compare-container">
    <!-- 搜索条件 -->
    <div class="search-conditions flex-center gap-12">
      <!-- @regionChange="handleAreaChange" -->
      <RegionSelect v-model="regionValue" @regionChange="handleAreaChange" placeholder="全国" class="region-select" clearable />

      <div class="filter-checkbox" :class="{ 'is-checked': queryParams.sortManner === '1' }" @click="handleSortTypeChange">
        <span>最新</span>
      </div>

      <div class="price-filter-group flex-center gap-4">
        <span class="price-label">价格</span>
        <div class="price-input-group">
          <el-input-number
            v-model="queryParams.minPrice"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="最低价格"
            class="price-input"
            @keyup.enter="handleSearch"
            @change="handleMinPriceChange"
          />
          <span class="price-separator"> - </span>
          <el-input-number
            v-model="queryParams.maxPrice"
            :min="0"
            :precision="2"
            :controls="false"
            placeholder="最高价格"
            class="price-input"
            @keyup.enter="handleSearch"
            @change="handleMaxPriceChange"
          />
        </div>
        <el-button type="primary" class="search-btn" :icon="Search" @click="handleSearch">搜索</el-button>
      </div>
    </div>

    <!-- 商品和对比框 -->
    <div class="content">
      <!-- 商品列表 -->
      <div class="goods-list">
        <el-row :gutter="16">
          <el-col :span="6" v-for="item in goodsData" :key="item.id" class="each-goods-container">
            <div class="add-btn flex-center-center gap-4" @click="addOrRemoveCompareGoods(item)">
              <img src="@/assets/mall/add-compare-icon.png" width="24" />
              <div :class="{ 'is-checked': isInCompareList(item.id) }">
                {{ isInCompareList(item.id) ? '移除对比' : '加入对比' }}
              </div>
            </div>
            <GoodsItemComponent :goods="item" />
          </el-col>
        </el-row>
      </div>
      <!-- 对比框 -->
      <div class="compare-box">
        <div class="box-header">
          <span class="box-title">对比框【{{ compareGoodsList.length }}/5】</span>
        </div>
        <div class="box-content">
          <div v-for="(item, index) in compareGoodsList" :key="item.id" class="compare-item">
            <el-icon @click="removeCompareGoods(item.id)" class="close-icon" v-if="index !== 0"><CircleCloseFilled /></el-icon>
            <GoodsItemComponent :goods="item" />
          </div>
        </div>
        <div class="box-actions">
          <el-button type="success" class="start-compare-btn" :disabled="compareGoodsList.length < 2" @click="startCompare"> 开始对比 </el-button>
          <el-button type="primary" link class="clear-link" :disabled="compareGoodsList.length === 0" @click="clearCompare"> 清空对比栏 </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { goodsCompareList, goodsDetail, comparePrices } from '@/api/mall/goods/index';

import { Search, CircleCloseFilled } from '@element-plus/icons-vue';

import GoodsItemComponent from '../GoodsItemComponent.vue';
import { eventBus } from '@/utils/eventBus';

const props = defineProps<{
  goods: any;
}>();

const regionValue = ref<string[]>([]);

const loading = ref<boolean>(false);

const total = ref<number>(0);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  sortManner: '0', // 默认传0（对比列表）
  provinceCode: undefined as string | undefined,
  cityCode: undefined as string | undefined,
  districtCode: undefined as string | undefined,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined
});

const goodsData = ref([]); // 商品列表

const compareGoodsList = ref([]); // 对比商品列表

onMounted(() => {
  fetchGoodsList();
  compareGoodsList.value.push(props.goods); // 主要商品
});

// 处理区域选择变化
const handleAreaChange = (val) => {
  if (val && val.regionPath) {
    queryParams.provinceCode = val.provinceCode;
    queryParams.cityCode = val.cityCode;
    queryParams.districtCode = val.regionCode;
  }
};

// 处理排序方式变化
const handleSortTypeChange = () => {
  queryParams.sortManner = queryParams.sortManner === '0' ? '1' : '0';
};

// 处理最低价变化，允许清空
const handleMinPriceChange = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    queryParams.minPrice = undefined;
  } else if (value < 0) {
    // 如果输入负数，清空输入框
    queryParams.minPrice = undefined;
  }
};

// 处理最高价变化，允许清空
const handleMaxPriceChange = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    queryParams.maxPrice = undefined;
  } else if (value < 0) {
    // 如果输入负数，清空输入框
    queryParams.maxPrice = undefined;
  }
};

// 点击搜索或回车提交价格筛选
const handleSearch = () => {
  // 验证价格不能为负数（只有当值不为空时才验证）
  if (queryParams.minPrice !== undefined && queryParams.minPrice !== null && queryParams.minPrice < 0) {
    ElMessage.error('价格不能为负数');
    return;
  }
  if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== null && queryParams.maxPrice < 0) {
    ElMessage.error('价格不能为负数');
    return;
  }
  // 验证最高价不能小于最低价（只有当两个值都不为空时才验证）
  if (
    queryParams.minPrice !== undefined &&
    queryParams.minPrice !== null &&
    queryParams.maxPrice !== undefined &&
    queryParams.maxPrice !== null &&
    queryParams.minPrice > queryParams.maxPrice
  ) {
    ElMessage.error('最高价不能小于最低价');
    return;
  }
  queryParams.pageNum = 1;
  fetchGoodsList();
};

// 获取商品列表
const fetchGoodsList = async () => {
  loading.value = true;
  try {
    // const params: any = {
    //   pageNum: queryParams.pageNum,
    //   pageSize: queryParams.pageSize
    // };

    // if (goodsIdFromRoute.value) {
    //   params.id = goodsIdFromRoute.value;
    // }

    // if (filterState.region === '选择地区' && queryParams.provinceCode) {
    //   params.provinceCode = queryParams.provinceCode;
    //   if (queryParams.cityCode) {
    //     params.cityCode = queryParams.cityCode;
    //   }
    //   if (queryParams.districtCode) {
    //     params.districtCode = queryParams.districtCode;
    //   }
    // }

    // params.sortManner = queryParams.sortManner || '0';

    // // 价格区间：undefined/null 不传递，0 值保持为 0
    // if (queryParams.minPrice !== undefined && queryParams.minPrice !== null) {
    //   params.minPrice = queryParams.minPrice;
    // }
    // if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== null) {
    //   params.maxPrice = queryParams.maxPrice;
    // }

    const response = await goodsCompareList({ ...queryParams, goodsCategoryId: props.goods.goodsCategoryId });
    if (response.code === 200) {
      const records = response.rows || [];
      goodsData.value = records;
      total.value = response.total || 0;
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 判断是否在对比商品列表中
const isInCompareList = (id: number | string) => {
  return compareGoodsList.value.some((item) => item.id === id);
};

// 添加对比商品
const addOrRemoveCompareGoods = (goods) => {
  // 检查对比商品是否超过最大数量（5个）
  if (compareGoodsList.value.length >= 5) {
    ElMessage.warning('最多只能对比5个商品');
    return;
  }

  // 检查对比商品是否已存在
  const exists = compareGoodsList.value.some((item) => item.id === goods.id);
  if (exists) {
    // 如果存在，移除对比商品
    removeCompareGoods(goods.id);
    return;
  } else {
    // 如果不存在，添加对比商品
    compareGoodsList.value.push(goods);
  }
};

// 移除对比商品
const removeCompareGoods = (id: number | string) => {
  compareGoodsList.value = compareGoodsList.value.filter((item) => item.id !== id);
};

// 开始对比
const startCompare = async () => {
  if (compareGoodsList.value.length < 2) {
    ElMessage.warning('至少需要选择2个商品进行对比');
    return;
  }

  eventBus.emit('activeTabChange', {
    command: 'compareDetail',
    compareGoodsList: compareGoodsList.value
  });
};

// 清空对比商品
const clearCompare = () => {
  //  移除第一个之外的对比商品
  compareGoodsList.value = compareGoodsList.value.slice(0, 1);
};
</script>

<style scoped lang="scss">
.compare-container {
  width: 1500px;
  margin: 0 auto;
}

.search-conditions {
  padding: 12px 0;
}

.filter-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 36px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #ebebeb;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;

  &.is-checked {
    border: 1px solid #108c58;
  }

  &:hover {
    opacity: 0.8;
  }
}

.content {
  padding: 12px 0;
  .goods-list {
    .each-goods-container {
      margin-bottom: 24px;
      position: relative;
      .add-btn {
        width: 363px;
        height: 50px;
        display: none;
        position: absolute;
        z-index: 2000;
        color: #fff;
        cursor: pointer;
        background: rgba(0, 0, 0, 0.4);
        border-radius: 8px 8px 0px 0px;
      }
      &:hover {
        .add-btn {
          display: flex;
        }
      }
      ::v-deep .goods-item {
        width: 100%;
        img {
          width: 100% !important;
        }
      }
    }
  }
}

// 右侧对比框
.compare-box {
  position: absolute;
  right: 0;
  top: 158px;
  width: 300px;
  background: #fff;
  border-radius: 4px;
  height: fit-content;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;

  .box-header {
    background: rgba(16, 140, 88, 0.1);
    text-align: center;
    padding: 12px 0;
    .box-title {
      font-size: 16px;
      font-weight: bold;
      color: #303133;
    }
  }
  .box-content {
    overflow: auto;
    max-height: 860px;
    padding: 18px 20px 20px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    .compare-item {
      border-radius: 8px;
      position: relative;
      background: #ffffff;
      box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
      .close-icon {
        position: absolute;
        display: none;
        cursor: pointer;
        color: #fff;
        font-size: 24px;
        right: 10px;
        top: 10px;
      }
      &:hover {
        .close-icon {
          display: block;
        }
      }
      ::v-deep .goods-image {
        width: auto;
        height: auto;
      }
    }
  }
  .box-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding-bottom: 16px;

    .start-compare-btn {
      width: 50%;
      height: 40px;
      margin: 0 auto;
      background: #108c58;
      font-size: 20px;
      color: #fff;
    }

    .clear-link {
      text-align: center;
      display: block;
      font-size: 13px;
    }
  }
}
</style>
