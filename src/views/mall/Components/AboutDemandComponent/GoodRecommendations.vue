<template>
  <div class="good-goods-wrapper">
    <div class="title mt-24">好物推荐</div>

    <el-carousel height="400" autoplay v-if="goodRecommendations.length > 0" :indicator-position="'none'">
      <el-carousel-item v-for="(group, index) in groupArray(goodRecommendations, 5)" :key="index">
        <div class="recommendation-grid flex gap-12">
          <GoodsItemComponent v-for="item in group" :key="item.id" :goods="item" @clickGoods="handleDetail(item.id)" />
        </div>
      </el-carousel-item>
    </el-carousel>

    <el-empty v-else></el-empty>
  </div>
</template>

<script setup lang="ts">
import GoodsItemComponent from '../GoodsItemComponent.vue';
import { greatGoodsRecommendList } from '@/api/mall/demand';

const emit = defineEmits(['detailChange']);

const goodRecommendations = ref([]);

onMounted(async () => {
  await getGoodGoodsList();
});

// 获取好物推荐
const getGoodGoodsList = async () => {
  const res = await greatGoodsRecommendList({
    pageNum: 1,
    pageSize: 9999
  });

  if (res.code === 200) {
    goodRecommendations.value = res.rows.map((e) => ({
      id: e.id,
      goodsName: e.goodsName,
      hnGoodsSpecificationDataList: [{ goodsPrice: e.goodsPrice }],
      hnBaseEnterpriseInfo: { province: e.enterpriseProvince },
      sysOssLists: [{ url: e.url }],
      goodsSales: e.goodsSales || 0,
      goodssEnsureName: e.goodsAttributes?.split(',') || []
    }));
  }
};

// 分组（每5个一组）
const groupArray = (array: any[], groupSize: number = 5) => {
  return array.reduce((result, item, index) => {
    const groupIndex = Math.floor(index / groupSize);
    if (!result[groupIndex]) result[groupIndex] = [];
    result[groupIndex].push(item);
    return result;
  }, []);
};

// 点击好物推荐
const handleDetail = (id: string | number) => {
  emit('detailChange', { id, type: 'goodsDetail' });
};
</script>

<style scoped lang="scss">
.good-goods-wrapper {
  margin-top: 24px;

  .title {
    color: #3d3d3d;
    font-size: 20px;
    font-weight: bold;
    border-left: 2px solid #108c58;
    padding-left: 8px;
    line-height: 16px;
    margin-bottom: 24px;
  }

  .recommendation-grid {
    .goods-item {
      width: calc((100% - 20px * 4) / 5);
      padding: 12px;
      border-radius: 8px;
      background-color: #fff;
      ::v-deep img {
        border-radius: 8px;
      }
    }
  }

  ::v-deep .el-carousel__container {
    height: 400px !important;
  }
}
</style>
