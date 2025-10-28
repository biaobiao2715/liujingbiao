<!--
  标题: GoodsItemComponent.vue
  功能: 每个商品的展示组件
  说明: 接收商品信息并展示，点击商品触发方法
  当前版本: 1.1
  开发信息: Created by 李春雷 2025-10-28
-->

<template>
  <div class="goods-item" @click="handleClick">
    <img :src="goods.image" alt="商品图片" class="goods-image" />
    <div class="goods-info">
      <p class="goods-price">{{ goods.price }}元/袋</p>
      <p class="goods-title">{{ goods.title }}</p>
      <div class="goods-tags">
        <span v-for="tag in goods.tags" :key="tag" class="goods-tag">{{ tag }}</span>
      </div>
      <p class="goods-location">{{ goods.location }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
const emit = defineEmits(['clickGoods']);
// 接收外部传入的商品信息
defineProps({
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

// 点击商品时触发方法
const handleClick = (item) => {
  emit('clickGoods', item);
};
</script>

<style scoped lang="scss">
.goods-item {
  width: calc(20% - 8px);
  display: flex;
  flex-direction: column;
  border: 1px solid #ddd;
  padding: 10px;
  cursor: pointer;
  transition: box-shadow 0.3s;
}

.goods-item:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.goods-image {
  width: 100%;
  height: auto;
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
  display: flex;
  gap: 5px;
  margin: 5px 0;
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
}
</style>
