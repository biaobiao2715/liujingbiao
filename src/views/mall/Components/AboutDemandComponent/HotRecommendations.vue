<template>
  <div class="hot-recommendation">
    <div class="title">热销推荐</div>
    <!-- 种子 -->
    <div class="content flex mb-12" v-if="seedHotRecommendations.length > 0">
      <div class="bg-img">
        <div>种子系列 ></div>
        <div>热卖品种 产地货源</div>
      </div>
      <el-row :gutter="16" style="width: calc(100% - 376px)">
        <el-col :span="8" v-for="item in seedHotRecommendations" :key="item.id" class="mb-12">
          <GoodsItemComponent :goods="item" @clickGoods="handleDetail(item.id)" />
        </el-col>
      </el-row>
    </div>
    <!-- 农资农具 -->
    <div class="content flex" v-if="agriculturalToolsHotRecommendations.length > 0">
      <div class="bg-img2">
        <div>农资农具系列 ></div>
        <div>种类多样 质量把控</div>
      </div>
      <el-row :gutter="16" style="width: calc(100% - 376px)">
        <el-col :span="8" v-for="item in agriculturalToolsHotRecommendations" :key="item.id" class="mb-12">
          <GoodsItemComponent :goods="item" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import GoodsItemComponent from '../GoodsItemComponent.vue';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import { supplyHallList, hotRecommendationList, greatGoodsRecommendList, querySupplyInfoById } from '@/api/mall/demand';

const emit = defineEmits(['detailChange']);

const productCategory = ref([]);

const hotRecommendations = ref([]);
const seedHotRecommendations = ref([]);
const agriculturalToolsHotRecommendations = ref([]);

onMounted(async () => {
  await fetchProductCategoryList();
  await getHotGoodsList();
});

// 获取商品分类列表
const fetchProductCategoryList = async () => {
  const res = await getProductCategoryList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    productCategory.value = res.data || [];
  }
};

// 热销推荐
const getHotGoodsList = async () => {
  const res = await hotRecommendationList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    hotRecommendations.value = res.rows;
    classifyCategories();
    // hotRecommendations.value = res.rows.map((e) => {
    //   return {
    //     hnGoodsSpecificationDataList: [{ goodsPrice: e.minGoodsPrice }],
    //     hnBaseEnterpriseInfo: { province: e.province },
    //     sysOssLists: [{ url: e.ossUrls }],
    //     goodsSales: e.goodsSales || 0,
    //     goodssEnsureName: e.goodsEnsureNames?.split(',') || []
    //   };
    // });
  }
};

//  把种子和农资农具进行分类
const classifyCategories = () => {
  hotRecommendations.value.forEach((e) => {
    if (getRootCategoryName(e.goodsCategoryId) === '种子') {
      seedHotRecommendations.value.push({
        id: e.id,
        goodsName: e.goodsName,
        hnGoodsSpecificationDataList: [{ goodsPrice: e.minGoodsPrice }],
        hnBaseEnterpriseInfo: { province: e.province },
        sysOssLists: [{ url: e.ossUrls }],
        goodsSales: e.goodsSales || 0,
        goodssEnsureName: e.goodsEnsureNames?.split(',') || []
      });
    } else if (getRootCategoryName(e.goodsCategoryId) === '农资农具') {
      agriculturalToolsHotRecommendations.value.push({
        id: e.id,
        goodsName: e.goodsName,
        hnGoodsSpecificationDataList: [{ goodsPrice: e.minGoodsPrice }],
        hnBaseEnterpriseInfo: { province: e.province },
        sysOssLists: [{ url: e.ossUrls }],
        goodsSales: e.goodsSales || 0,
        goodssEnsureName: e.goodsEnsureNames?.split(',') || []
      });
    }
  });
};

const getRootCategoryName = (id, list = productCategory.value) => {
  // 1. 先找到当前节点
  const current = list.find((item) => item.id === id);

  if (!current) return null;

  // 2. 解析 ancestors（例如 "0,1988088350648373249,1988088401340731394"）
  const ancestorIds = current.ancestors.split(',').filter((v) => v !== '0');
  // 如果没有父级（本身就是 root）
  if (ancestorIds.length === 0) return current.categoryName;

  // 3. 一级分类是 ancestors 里面的第一个非0节点
  const rootId = ancestorIds[0];

  // 4. 找到这个一级分类
  const rootNode = list.find((item) => item.id === rootId);

  return rootNode ? rootNode.categoryName : null;
};

const handleDetail = (id: string) => {
  emit('detailChange', { id, type: 'goodsDetail' });
};
</script>

<style scoped lang="scss">
.hot-recommendation {
  .title {
    color: #3d3d3d;
    font-size: 20px;
    font-weight: bold;
    border-left: 2px solid #108c58;
    padding-left: 8px;
    line-height: 16px;
    margin-bottom: 24px;
  }

  .content {
    gap: 16px;
    .goods-item {
      border-radius: 8px;
      background-color: #fff;
      border: 1px solid #bfbfbf;
      ::v-deep img {
        height: 324px !important;
        border-radius: 8px 8px 0 0;
      }
      ::v-deep .goods-info {
        padding-bottom: 6px;
      }
    }

    .bg-img,
    .bg-img2 {
      width: 360px;
      height: 936px;
      padding: 80px 40px;
      background: url('@/assets/mall/demand-bg-3.png') no-repeat center center;
      background-size: 100% 100%;
      div:first-child {
        font-size: 30px;
        color: #fff;
      }
      div:last-child {
        margin-top: 24px;
        font-size: 24px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    .bg-img2 {
      background: url('@/assets/mall/demand-bg-4.png') no-repeat center center;
      background-size: 100% 100%;
    }
  }
}
</style>
