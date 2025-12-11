<!--
  标题: GoodsItemComponent.vue
  功能: 每个商品的展示组件
  说明: 接收商品信息并展示，点击商品触发方法
  当前版本: 1.1
  开发信息: Created by 李春雷 2025-10-28
-->

<template>
  <div class="goods-item" :style="style" @click="handleClick">
    <img :src="goods?.sysOssLists?.[0]?.url" class="goods-image" />
    <div class="goods-info">
      <div class="flex-center-between mt-12">
        <div class="goods-price flex-center">
          <div class="unit">¥</div>
          <div>{{ +goods?.hnGoodsSpecificationDataList?.[0]?.goodsPrice }}元起</div>
        </div>
        <div class="goods-volume">{{ goods?.goodsSales }}件已售</div>
      </div>
      <div class="goods-title" v-if="!isCompare">{{ goods?.goodsName }}</div>
      <div class="flex-between mt-12" v-if="!isCompare">
        <div class="goods-tags">
          <!-- 最多三个标签 -->
          <el-tag v-for="tag in goods?.goodssEnsureName?.slice(0, 3)" :key="tag" type="primary" class="goods-tag">{{ tag }}</el-tag>
        </div>
        <div class="goods-location">{{ goods?.hnBaseEnterpriseInfo?.province }}</div>
      </div>

      <div class="flex-between mt-12" v-if="isCompare">
        <div class="goods-name">{{ goods?.goodsName }}</div>
        <div class="goods-location">{{ goods?.hnBaseEnterpriseInfo?.province }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  },
  isCompare: {
    type: Boolean,
    default: false
  },
  style: {
    type: Object,
    default: () => ({})
  }
});

// 点击商品时触发方法
const handleClick = () => {
  // eventBus.emit('navigationChange', 'goodsDetail'); // 通知导航组件
  // eventBus.emit('activeTabChange', { command: 'goodsDetail', goods: props.goods });
  emit('clickGoods', props.goods);
};
</script>

<style scoped lang="scss">
.goods-item {
  display: flex;
  flex-direction: column;
  // padding: 10px;
  cursor: pointer;
}

.goods-image {
  // width: 284px;
  // height: 284px;
  width: auto;
  height: auto;
  margin-bottom: 10px;
}

.goods-info {
  padding: 0 12px;
  display: flex;
  flex-direction: column;
}

.goods-price {
  color: #ef4d0b;
  gap: 2px;
  .unit {
    margin-top: 4px;
    font-size: 12px;
  }
  div:last-child {
    font-size: 18px;
    font-weight: bold;
  }
}
.goods-volume {
  font-size: 18px;
  color: #7a7a7a;
}
.goods-title {
  font-size: 18px;
  margin-top: 12px;
  color: #333;
  // 超出部分显示省略号
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  color: #7a7a7a;
  font-size: 18px;
}
.goods-name {
  width: calc(100% - 55px);
  font-weight: 400;
  font-size: 14px;
  color: #333333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
