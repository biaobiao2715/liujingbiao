<!--
  标题: GoodsItemComponent.vue
  功能: 每个商品的展示组件
  说明: 接收商品信息并展示，点击商品触发方法
  当前版本: 1.1
  开发信息: Created by 李春雷 2025-10-28
-->

<template>
  <div class="goods-item" @click="handleClick">
    <img :src="goods.sysOssLists[0]?.url" width="100" class="goods-image" />
    <div class="goods-info">
      <div class="flex-center-between mt-12">
        <div class="goods-price">{{ goods.hnGoodsSpecificationDataList[0].goodsPrice }}元起</div>
        <div class="goods-volume">{{ goods.goodsSales }}件已售</div>
      </div>
      <div class="goods-title">{{ goods.goodsName }}</div>
      <div class="flex-between mt-12">
        <div class="goods-tags">
          <el-tag v-for="tag in goods.goodssEnsureName" :key="tag" type="primary" class="goods-tag">{{ tag }}</el-tag>
        </div>
        <div class="goods-location">{{ goods.hnBaseEnterpriseInfo.province }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const emit = defineEmits(['clickGoods']);
// 接收外部传入的商品信息
const props = defineProps({
  goods: {
    type: Object,
    required: true,
    default: () => ({
      image: '',
      price: '',
      title: '',
      tags: [],
      location: ''
    })
  }
});

onMounted(() => {
  console.log('商品信息:', props.goods);
});

// 点击商品时触发方法
const handleClick = (item) => {
  emit('clickGoods', item);
};
</script>

<style scoped lang="scss">
.goods-item {
  width: calc(20% - 16px);
  display: flex;
  flex-direction: column;
  padding: 10px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.goods-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.goods-image {
  width: 100%;
  height: 120px;
  margin-bottom: 10px;
}

.goods-info {
  display: flex;
  flex-direction: column;
}

.goods-price {
  color: red;
  font-weight: bold;
}

.goods-title {
  font-size: 16px;
  margin: 5px 0;
}

.goods-tags {
  width: calc(100% - 55px);
  display: flex;
  gap: 5px;
  margin: 5px 0;
  flex-wrap: wrap;
}

.goods-tag {
  background-color: #f0f0f0;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 12px;
}

.goods-location {
  color: #888;
  font-size: 14px;
  width: 50px;
}
</style>
