<template>
  <div class="banner">
    <el-carousel :interval="5000" height="200px">
      <el-carousel-item v-for="tab in tabs" :key="tab.name">
        <div class="banner-text">
          <h1>{{ tab.data?.productName || '' }}</h1>
          <p>{{ tab.data?.productRemark || '' }}</p>
          <el-button round type="success" @click="handleDetail(tab)">{{
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
  display: flex;
  flex-direction: column;
  padding: 20px;
  background-color: #e8f5e9;
}
.banner-text {
  text-align: left;
  margin-top: 20px;
}
</style>
