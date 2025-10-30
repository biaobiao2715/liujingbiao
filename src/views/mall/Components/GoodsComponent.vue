<template>
  <div>
    <!-- 查询组件 -->
    <SearchComponent @searchChange="getSearchInfo" />
    <!-- 商品组件 -->
    <div class="goods-list">
      <GoodsItemComponent v-for="item in goodsData" :key="item.id" :goods="item" @clickGoods="handleClick" />
    </div>

    <!-- 分页组件 -->
    <pagination
      v-show="total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="fetchGoodsList"
    />
  </div>
</template>

<script setup lang="ts">
import SearchComponent from './SearchComponent.vue'; // 分类组件
import GoodsItemComponent from './GoodsItemComponent.vue';
import { goodsList } from '@/api/mall/goods/index';

const loading = ref(false); // 加载状态

const goodsData = ref([]); // 商品列表数据

const total = ref(0); // 总页数

const queryParams = reactive({
  goodsCategoryId: [] as string[], // 商品分类ID
  goodsName: undefined, // 商品名称
  goodsBrandName: undefined, // 商品品牌名称
  goodsAbilityName: undefined, // 商品能力名称
  sortManner: undefined, // 最新/销量排序
  provinceCode: undefined, // 省份编码
  cityCode: undefined, // 城市编码
  districtCode: undefined, // 区县编码
  minPrice: undefined, // 最低价
  maxPrice: undefined, // 最高价
  pageNum: 1, // 页码
  pageSize: 10 // 每页数量
});

// 初始化获取商品列表数据
onMounted(() => {
  fetchGoodsList();
});

// 处理搜索组件变化
const getSearchInfo = (searchInfo) => {
  console.log(searchInfo);

  // 商品名称
  queryParams[searchInfo.searchType] = searchInfo.searchContent || undefined;

  // 商品分类
  queryParams.goodsCategoryId = searchInfo.category.length > 0 ? searchInfo.category[searchInfo.category.length - 1] : undefined;

  // 省市区
  if (searchInfo.areaCodes.length > 0) {
    queryParams.provinceCode = searchInfo.areaCodes[0];
    queryParams.cityCode = searchInfo.areaCodes[1];
    queryParams.districtCode = searchInfo.areaCodes[2];
  }

  // 最新/销量排序
  queryParams.sortManner = searchInfo.isLatest ? '1' : searchInfo.isSales ? '0' : undefined;
  // 价格区间
  if (searchInfo.minPrice === 0 && searchInfo.maxPrice === 0) {
    queryParams.minPrice = undefined;
    queryParams.maxPrice = undefined;
  } else {
    queryParams.minPrice = searchInfo.minPrice;
    queryParams.maxPrice = searchInfo.maxPrice;
  }

  console.log(queryParams);

  // fetchGoodsList(searchInfo);
};

// 获取商品列表数据
const fetchGoodsList = async () => {
  loading.value = true;
  try {
    const response = await goodsList({
      // goodsCategoryId: searchInfo.value.goodsCategoryId,
      // region: searchInfo.value.region,
      pageNum: 1,
      pageSize: 10
    });
    if (response.code === 200) {
      goodsData.value = response.rows;
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 点击商品时触发方法
const handleClick = (item) => {
  // emit('onClick', item);
};
</script>

<style scoped lang="scss">
.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}
</style>
