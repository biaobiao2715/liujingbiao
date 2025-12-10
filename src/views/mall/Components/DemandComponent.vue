<template>
  <div class="demand-component">
    <div class="demand-content" v-if="showArea === 'demand'">
      <TopBanner />
      <DemandTable :id="id" :type="type" />
      <MiddleBanners />
      <HotRecommendations @detailChange="showDetail" />
      <GoodRecommendations @detailChange="showDetail" />
    </div>

    <!-- 商品详情 -->
    <GoodsDetailComponent :id="id" v-else-if="showArea === 'goodsDetail'" @detailChange="showDetail" />
    <!-- 商品比价 -->
    <CompareGoodsComponent :goods="goods" v-else-if="showArea === 'compareGoods'" @detailChange="showDetail" />
    <!-- 商品比价详情 -->
    <CompareDetailComponent :compareGoodsList="compareGoodsList" v-else-if="showArea === 'compareDetail'" />
  </div>
</template>

<script setup lang="ts">
import TopBanner from './AboutDemandComponent/TopBanner.vue';
import DemandTable from './AboutDemandComponent/DemandTable.vue';
import MiddleBanners from './AboutDemandComponent/MiddleBanners.vue';
import HotRecommendations from './AboutDemandComponent/HotRecommendations.vue';
import GoodRecommendations from './AboutDemandComponent/GoodRecommendations.vue';
import GoodsDetailComponent from './GoodsDetailComponent.vue';
import CompareGoodsComponent from './AboutCompareComponents/CompareGoodsComponent.vue';
import CompareDetailComponent from './AboutCompareComponents/CompareDetailComponent.vue';
import { eventBus } from '@/utils/eventBus';
const props = withDefaults(
  defineProps<{
    id?: string | number;
    type?: string;
  }>(),
  {
    id: 0,
    type: ''
  }
);

type showAreaType = 'demand' | 'goodsDetail' | 'compareGoods' | 'compareDetail';

const id = ref();

const showArea = ref('demand');

const goods = ref<any>({});

const compareGoodsList = ref<any[]>([]);

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
  eventBus.emit('navigationChange', incomeData.type);
};
</script>
