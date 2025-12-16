<!--
  标题: GoodsListComponent.vue
  功能: 商品列表组件
  说明: 商品列表组件，展示商品列表
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-12-09
-->
<template>
  <div class="goods-list-container">
    <!-- 查询组件 -->
    <SearchComponent @searchChange="getSearchInfo" />

    <div class="goods-list mt-24" v-loading="loading">
      <template v-if="!loading && goodsData.length > 0">
        <GoodsItemComponent
          v-for="item in goodsData"
          :key="item.id"
          :goods="item"
          :style="{ width: 'calc(20% - 16px)' }"
          @clickGoods="handleDetail(item.id)"
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
import { ref } from 'vue';
import { goodsList } from '@/api/mall/goods/index';
import SearchComponent from './SearchComponent.vue'; // 分类组件
import GoodsItemComponent from './GoodsItemComponent.vue';
import { eventBus } from '@/utils/eventBus';

const emit = defineEmits(['detailChange']);

const loading = ref(false); // 加载状态

const goodsData = ref([]); // 商品列表数据

const total = ref(0); // 总页数

const queryParams = reactive({
  goodsCategoryId: undefined, // 商品分类ID
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
  eventBus.on('searchGoodsList', (data: { categoryId?: string }) => {
    queryParams.goodsCategoryId = data?.categoryId;
    fetchGoodsList();
  });
});

// 处理搜索组件变化
const getSearchInfo = (searchInfo) => {
  // 商品名称
  queryParams[searchInfo.searchType] = searchInfo.searchContent || undefined;

  // 商品分类
  // queryParams.goodsCategoryId = searchInfo.category.length > 0 ? searchInfo.category[searchInfo.category.length - 1] : undefined;

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

const handleDetail = (id: string) => {
  emit('detailChange', { id, type: 'goodsDetail' });
};
</script>

<style scoped lang="scss">
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
