<template>
  <div class="demand-component">
    <div class="demand-content" v-if="showArea === 'demand'">
      <TopBanner />
      <DemandTable :id="id" :type="type" />
      <MiddleBanners />
      <HotRecommendations @detailChange="showDetail" />
      <GoodRecommendations @detailChange="showDetail" />
    </div>

    <GoodsDetailComponent :id="id" v-else />
  </div>
</template>

<script setup lang="ts">
import TopBanner from './AboutDemandComponent/TopBanner.vue';
import DemandTable from './AboutDemandComponent/DemandTable.vue';
import MiddleBanners from './AboutDemandComponent/MiddleBanners.vue';
import HotRecommendations from './AboutDemandComponent/HotRecommendations.vue';
import GoodRecommendations from './AboutDemandComponent/GoodRecommendations.vue';
import GoodsDetailComponent from './GoodsDetailComponent.vue';
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

type showAreaType = 'demand' | 'goodsDetail';

const id = ref();

const showArea = ref('demand');

onMounted(() => {
  // 监听导航变化事件
  eventBus.on('navigateToEach', (incomeData: { command: showAreaType }) => {
    showDetail({ type: incomeData.command });
  });
});

// 中转站：展示对应的详情组件
const showDetail = (incomeData: { type: showAreaType; id?: string }) => {
  id.value = incomeData.id || id.value;
  showArea.value = incomeData.type;
  eventBus.emit('navigationChange', incomeData.type);
};
</script>
