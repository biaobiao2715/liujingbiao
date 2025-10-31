<template>
  <div class="goods-detail flex gap-24" v-loading="loading">
    <!-- 商品图片 -->
    <div class="goods-image">
      <!-- 当前展示的图片 -->
      <el-image :src="baseInfo.currentImage" fit="contain" />
      <!-- 所有图片 -->
      <div class="img-list flex-center gap-12">
        <el-image
          v-for="(img, index) in goods?.sysOssLists"
          :key="index"
          :src="img.url"
          fit="contain"
          style="width: 60px; cursor: pointer"
          @click="baseInfo.currentImage = img.url"
        />
      </div>
    </div>

    <!-- 商品信息 -->
    <div class="goods-info">
      <hdiv>{{ goods?.goodsName }}</hdiv>
      <div>价格：{{ baseInfo.totalPrice + ' 元' }}</div>
      <div>发货地址：{{ baseInfo.address }}</div>

      <!-- 规格选择 -->
      <el-form>
        <el-form-item label="规格选择">
          <el-select v-model="baseInfo.currentSpec" placeholder="请选择规格" @change="updateTotalPrice">
            <el-option
              v-for="spec in goods?.hnGoodsSpecificationDataList"
              :key="spec.id"
              :label="spec.goodsSpecificationValue + ' ' + spec.goodsSpecification"
              :value="spec.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <!-- 购买数量 -->
      <el-input-number v-model="baseInfo.quantity" :min="1" label="购买数量" @change="updateTotalPrice" />

      <!-- 操作按钮 -->
      <div class="actions">
        <el-button type="primary" @click="addToCart">加入收藏夹</el-button>
        <el-button type="success" @click="placeOrder">立即下单</el-button>
      </div>
    </div>
  </div>

  <!-- 同类商品 -->
  <div class="related-goods">
    <h3>同类商品</h3>
    <el-carousel :interval="5000" arrow="always">
      <el-carousel-item v-for="(group, groupIndex) in groupedRelatedGoods" :key="groupIndex">
        <div class="goods-group">
          <div v-for="(item, itemIndex) in group" :key="itemIndex" class="goods-item">
            <el-image :src="item.image" fit="contain" />
            <p>{{ item.name }}</p>
            <p>价格：{{ item.price }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { goodsList, goodsDetail } from '@/api/mall/goods/index';
import type { Goods } from '../mall';

const goods = ref<Goods>();

const loading = ref(true); // 加载状态

// 需要经过处理得到的数据
const baseInfo = reactive<{
  currentImage: string; // 当前展示的图片
  totalPrice: string; // 当前总价
  address: string; // 发货地址
  currentSpec: number | null; // 当前展示的规格
  quantity: number; // 购买数量,
}>({
  currentImage: '', // 当前展示的图片
  totalPrice: '', // 当前总价
  address: '', // 发货地址
  currentSpec: null, // 当前展示的规格
  quantity: 1 // 购买数量,
});

const relatedGoods = ref([
  { image: 'path/to/image1.jpg', name: '商品1', price: '20.00元' },
  { image: 'path/to/image2.jpg', name: '商品2', price: '20.00元' },
  { image: 'path/to/image3.jpg', name: '商品3', price: '20.00元' },
  { image: 'path/to/image4.jpg', name: '商品4', price: '20.00元' },
  { image: 'path/to/image5.jpg', name: '商品5', price: '20.00元' },
  { image: 'path/to/image6.jpg', name: '商品6', price: '20.00元' }
]);

const groupedRelatedGoods = ref([]);

const getGoodsDetail = async (goodsId: number) => {
  loading.value = true;
  const res = await goodsDetail(goodsId);
  if (res.code === 200) {
    goods.value = res.data;

    // 处理商品详情数据
    baseInfo.currentImage = goods.value.sysOssLists[0].url; // 默认展示第一张图片

    baseInfo.totalPrice = getInitPrice(goods.value.hnGoodsSpecificationDataList); // 初始化获取价格区间

    const hnBaseEnterpriseInfo = goods.value.hnBaseEnterpriseInfo; // 企业信息
    // 发货地址
    baseInfo.address = hnBaseEnterpriseInfo.province + hnBaseEnterpriseInfo.city + hnBaseEnterpriseInfo.district + hnBaseEnterpriseInfo.signUpAddress;
    loading.value = false;
  }
};

const addToCart = () => {
  //   console.log('加入收藏夹', selectedSpec.value, quantity.value);
};

const placeOrder = () => {
  //   console.log('立即下单', selectedSpec.value, quantity.value);
};

// 获取商品价格区间，返回最低-最高价格
const getInitPrice = (specs) => {
  if (specs && specs.length > 0) {
    const prices = specs.map((spec) => spec.goodsPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    return `${minPrice}-${maxPrice}`;
  }
  return '';
};

// 更新总价
const updateTotalPrice = () => {
  // 规格对应的价格X数量
  const spec = goods.value.hnGoodsSpecificationDataList.find((s) => s.id === baseInfo.currentSpec);
  baseInfo.totalPrice = (parseFloat(spec.goodsSpecificationValue) * baseInfo.quantity).toFixed(2);
};

// 分组同类商品，每组5个
groupedRelatedGoods.value = relatedGoods.value.reduce((result, item, index) => {
  const groupIndex = Math.floor(index / 5);
  if (!result[groupIndex]) {
    result[groupIndex] = [];
  }
  result[groupIndex].push(item);
  return result;
}, []);

defineExpose({
  getGoodsDetail
});
</script>

<style scoped lang="scss">
// filepath: /Users/lichunlei/Desktop/公司项目/grain_sales_web/src/views/mall/Components/GoodsDetailComponent.vue
.goods-detail {
  .goods-image {
    width: 400px;
    max-height: 300px;
  }

  .goods-info {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .actions {
      display: flex;
      gap: 10px;
    }
  }

  .related-goods {
    .goods-group {
      display: flex;
      justify-content: space-between;

      .goods-item {
        width: 18%;
        text-align: center;
      }
    }
  }
}
</style>
