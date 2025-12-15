<template>
  <div class="banner">
    <el-carousel :interval="5000" :autoplay="false" height="500px">
      <el-carousel-item v-for="(tab, index) in tabs" :key="tab.name">
        <div class="banner-item" :class="`banner-bg-${index + 1}`">
          <div class="banner-text flex gap-12">
            <div class="product-name">{{ tab.data?.productName || '' }}</div>

            <div class="product-remark">{{ tab.data?.productRemark || '' }}</div>
            <el-button round type="primary" size="large" @click="handleDetail(tab)">{{
              '查看' + (tab?.type === 'insurance' ? '保险产品' : '信贷产品')
            }}</el-button>
          </div>
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
  eventBus.emit('showComponentByCommand', {
    type: item.type === 'insurance' ? 'InsuranceproductComponentDetails' : 'LoanProductsComponentDetails',
    id: item.id
  });
};
</script>

<style scoped lang="scss">
.banner {
}
.banner-item {
  height: 100%;
}
.banner-text {
  width: 1500px;
  height: 100%;
  margin: 0 auto;
  flex-direction: column;
  justify-content: center;

  .product-name {
    width: 600px;
    font-weight: 700;
    font-size: 60px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .product-remark {
    width: 650px;
    height: 110px;
    font-weight: 500;
    font-size: 40px;
    line-height: 55px;
    margin-bottom: 48px;
    // 最多两行显示
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .el-button {
    width: 179px;
    height: 46px;
    border-radius: 23px;
    font-weight: 500;
    font-size: 22px;
    color: #ffffff;
    border: none;
  }
}

.banner-bg-1 {
  background: url('@/assets/images/finance/financial-banner-1.png') no-repeat center;
  background-size: 100% 100%;
  .product-name {
    color: #414141;
  }
  .product-remark {
    color: #6c6c6c;
  }
  .el-button {
    background: linear-gradient(180deg, #00e49e 0%, #00c79e 100%);
  }
}

.banner-bg-2 {
  background: url('@/assets/images/finance/financial-banner-2.png') no-repeat center;
  background-size: 100% 100%;
  .product-name {
    color: #254b38;
  }
  .product-remark {
    color: #668374;
  }

  .el-button {
    background: linear-gradient(180deg, #64ac89 0%, #3d8060 100%);
  }
}

.banner-bg-3 {
  background: url('@/assets/images/finance/financial-banner-3.png') no-repeat center;
  background-size: 100% 100%;
  .product-name {
    color: #2c72cd;
  }
  .product-remark {
    color: #699bdb;
  }
  .el-button {
    background: linear-gradient(180deg, #5ea3fd 0%, #2c72cd 100%);
  }
}

::v-deep .is-active {
  .el-carousel__button {
    background-color: #108c58 !important;
  }
}

::v-deep .el-carousel__button {
  height: 6px !important;
}
</style>
