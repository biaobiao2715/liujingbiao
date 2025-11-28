<template>
  <div class="goods-container">
    <!-- 商品banner和分类组件 -->
    <BannerAndCategory />
    <!-- 热门分类组件 -->
    <HotCategory />
    <!-- 查询组件 -->
    <SearchComponent @searchChange="getSearchInfo" />
    <!-- 商品组件 -->
    <div class="goods-list mt-24" v-loading="loading">
      <template v-if="!loading && goodsData.length > 0">
        <GoodsItemComponent
          v-for="item in goodsData"
          :key="item.id"
          :goods="item"
          :style="{ width: 'calc(20% - 16px)' }"
          @clickGoods="handleClick(item.id)"
        />
      </template>
      <el-empty v-else-if="!loading && goodsData.length === 0" description="暂无商品数据" />
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
import BannerAndCategory from './AboutGoodsComponents/BannerAndCategory.vue'; // 商品banner和分类组件
import HotCategory from './AboutGoodsComponents/HotCategory.vue'; // 热门分类组件
import { goodsList } from '@/api/mall/goods/index';
import { useRouter } from 'vue-router';

const router = useRouter();
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
  queryParams.provinceCode = searchInfo.areaCodes[0] || undefined;
  queryParams.cityCode = searchInfo.areaCodes[1] || undefined;
  queryParams.districtCode = searchInfo.areaCodes[2] || undefined;

  // 最新/销量排序
  queryParams.sortManner = searchInfo.sortType === '-1' ? undefined : searchInfo.sortType;
  // 价格区间：undefined/null 保持为 undefined，0 值保持为 0
  queryParams.minPrice = searchInfo.minPrice === undefined || searchInfo.minPrice === null ? undefined : searchInfo.minPrice;
  queryParams.maxPrice = searchInfo.maxPrice === undefined || searchInfo.maxPrice === null ? undefined : searchInfo.maxPrice;

  console.log(queryParams);

  fetchGoodsList();
};

// 获取商品列表数据
const fetchGoodsList = async () => {
  loading.value = true;
  try {
    const response = await goodsList(queryParams);
    if (response.code === 200) {
      goodsData.value = response.rows;
      total.value = response.total;
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

// 点击商品时触发方法
const handleClick = (id: string) => {
  // 跳转到商品详情页面
  router.push({
    path: '/mall/goods-detail',
    query: { id: id }
  });
};
</script>

<style scoped lang="scss">
.goods-container {
  width: 1500px;
  margin: 0 auto;
}
.goods-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  min-height: 300px;

  ::v-deep .el-empty {
    width: 100%;
    padding: 60px 0;
  }
}
</style>
