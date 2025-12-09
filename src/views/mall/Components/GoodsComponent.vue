<template>
  <div class="goods-container">
    <div class="show-area" v-if="showArea === 'goods'">
      <!-- 商品banner和分类组件 -->
      <BannerAndCategory />
      <!-- 热门分类组件 -->
      <HotCategory />
      <!-- 商品组件 -->
      <GoodsListComponent @detailChange="showDetail" />
    </div>

    <div v-else>
      <!-- 商品详情 -->
      <GoodsDetailComponent v-if="showArea === 'goodsDetail'" :id="id" @detailChange="showDetail" />
      <!-- 商品比价 -->
      <CompareGoodsComponent :goods="goods" v-else-if="showArea === 'compareGoods'" @detailChange="showDetail" />
      <!-- 商品比价详情 -->
      <CompareDetailComponent :compareGoodsList="compareGoodsList" v-else-if="showArea === 'compareDetail'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { eventBus } from '@/utils/eventBus';
import BannerAndCategory from './AboutGoodsComponents/BannerAndCategory.vue'; // 商品banner和分类组件
import HotCategory from './AboutGoodsComponents/HotCategory.vue'; // 热门分类组件
import GoodsListComponent from './GoodsListComponent.vue'; // 商品列表组件
import GoodsDetailComponent from './GoodsDetailComponent.vue'; // 商品详情组件
import CompareGoodsComponent from './AboutCompareComponents/CompareGoodsComponent.vue'; // 商品比价组件
import CompareDetailComponent from './AboutCompareComponents/CompareDetailComponent.vue'; // 商品比价详情组件

type showAreaType = 'goods' | 'goodsDetail' | 'compareGoods' | 'compareDetail';

const showArea = ref('goods');

const id = ref();

const goods = ref();

const compareGoodsList = ref([]);

onMounted(() => {
  // 监听导航变化事件
  eventBus.on('navigateToEach', (incomeData: { command: showAreaType }) => {
    showDetail({ type: incomeData.command });
  });
});

// 中转站：展示对应的详情组件
const showDetail = (incomeData: { type: showAreaType; id?: string; goods?: any; compareGoodsList?: any[] }) => {
  id.value = incomeData.id || id.value;
  goods.value = incomeData.goods || goods.value;
  compareGoodsList.value = incomeData.compareGoodsList || compareGoodsList.value;
  showArea.value = incomeData.type;
  // 通知导航组件更新导航状态
  eventBus.emit('navigationChange', incomeData.type);
};
</script>

<style scoped lang="scss">
.goods-container {
  width: 1500px;
  margin: 0 auto;
}
</style>
