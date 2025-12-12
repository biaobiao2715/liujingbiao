<template>
  <div class="banner">
    <el-carousel :interval="5000" height="600px">
      <el-carousel-item v-for="tab in tabs" :key="tab.name">
        <div class="banner-text flex gap-12">
          <div class="product-name">{{ tab.data?.productName || '' }}</div>
          <div class="product-remark">{{ tab.data?.productRemark || '' }}</div>
          <el-button round type="primary" size="large" @click="handleDetail(tab)">{{
            '查看' + (tab?.type === 'insurance' ? '保险产品' : '信贷产品')
          }}</el-button>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getCreditProductCarousel } from '@/api/mall';
import { eventBus } from '@/utils/eventBus';

const tabs = ref([]);

// 获取信贷，保险产品轮播图
onMounted(() => {
  getCreditProductCarousel({ sort: '3' }).then((res) => {
    if (res.code === 200) {
      tabs.value = res.data.productList || [];
    }
  });
});

// 查看详情
const handleDetail = (item) => {
  console.log(item);
  eventBus.emit('showComponentByCommand', {
    type: item.type === 'insurance' ? 'InsuranceproductComponentDetails' : 'LoanProductsComponentDetails',
    id: item.id
  });
};
</script>

<style scoped lang="scss">
.banner {
  background-color: #e8f5e9;
}
.banner-text {
  height: 100%;
  flex-direction: column;
  justify-content: center;
  padding-left: 100px;

  .product-name {
    font-size: 48px;
    font-weight: bold;
  }
  .product-remark {
    font-size: 32px;
    // margin-top: 20px;
    margin-bottom: 48px;
  }
  .el-button {
    width: 120px;
  }
}
</style>
