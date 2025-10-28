<template>
  <div>
    <!-- 查询组件 -->
    <SearchComponent />
    <!-- 商品组件 -->
    <div class="goods-list">
      <GoodsItemComponent v-for="item in goodsList" :key="item.id" :goods="item" @clickGoods="handleClick" />
    </div>
  </div>
</template>

<script setup lang="ts">
import SearchComponent from './SearchComponent.vue'; // 分类组件
import GoodsItemComponent from './GoodsItemComponent.vue';
const goodsList = ref([]);
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
