<template>
  <div>
    <!-- 查询组件 -->
    <SearchComponent @searchChange="getSearchInfo" />
    <!-- 商品组件 -->
    <div class="goods-list">
      <GoodsItemComponent v-for="item in goodsData" :key="item.id" :goods="item" @clickGoods="handleClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchComponent from './SearchComponent.vue'; // 分类组件
import GoodsItemComponent from './GoodsItemComponent.vue';
import { goodsList } from '@/api/supplier/productManagement/product';

const loading = ref(false); // 加载状态

const goodsData = ref([]); // 商品列表数据

const searchInfo = ref({
  goodsCategoryId: [] as string[],
  region: [] as string[]
});

onMounted(() => {
  fetchGoodsList();
});

const getSearchInfo = (searchInfo) => {
  console.log(searchInfo);

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
