<template>
  <div class="goods-detail-container">
    <div class="goods-detail" v-loading="loading" v-show="!showOrder">
      <div class="base-info flex gap-12">
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
          <div class="actions flex-center-between gap-12">
            <el-button @click="operateOrder(1)">加入比价</el-button>
            <el-button @click="operateOrder(2)">加入收藏</el-button>
            <el-button type="success" @click="operateOrder(3)">立即下单</el-button>
            <el-tooltip placement="top">
              <template #content>
                <div>联系电话：{{ goods?.hnBaseEnterpriseInfo?.phoneNumber }}</div>
              </template>
              <el-button type="primary" @click="operateOrder(4)">电话沟通</el-button>
            </el-tooltip>
            <el-button type="danger" @click="operateOrder(5)">我要举报</el-button>
          </div>
        </div>
      </div>

      <!-- 同类商品 -->
      <div class="mb-24 mt-24">
        <el-card :title="'同类商品推荐'">
          <el-carousel :interval="5000" arrow="always">
            <el-carousel-item v-for="(group, groupIndex) in groupedRelatedGoods" :key="groupIndex">
              <div class="flex">
                <GoodsItemComponent v-for="(item, itemIndex) in group" :key="itemIndex" :goods="item" :style="{ width: 'calc(20% - 12px)' }" />
              </div>
            </el-carousel-item>
          </el-carousel>
        </el-card>
      </div>

      <!-- 详情部分 -->
      <div class="editor-hot flex">
        <Editor v-model="goods.goodsDetail" :readOnly="true" />
        <div class="hot-goods">
          <GoodsItemComponent v-for="(item, index) in hotGoods" :key="index" :goods="item" :style="{ width: '200px' }" />
        </div>
      </div>
    </div>

    <!-- 下单组件 -->
    <PlaceOrderComponent ref="placeOrderRef" v-if="showOrder" />
  </div>
</template>

<script setup lang="ts">
import { addToFavorites } from '@/api/mall/index';
import { goodsList, goodsDetail } from '@/api/mall/goods/index';
import type { Goods } from '../mall';
import PlaceOrderComponent from './PlaceOrderComponent.vue';
import GoodsItemComponent from './GoodsItemComponent.vue';
import Editor from '@/components/Editor/index.vue';

const props = defineProps<{
  goodsId: number;
}>();

const goods = ref<Goods>({});

const loading = ref(true); // 加载状态

const placeOrderRef = ref();

const showOrder = ref(false);

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

const groupedRelatedGoods = ref([]); // 同类商品

const hotGoods = ref([]); // 最热商品

onMounted(async () => {
  await getGoodsDetail();
  await getRelatedGoods();
  await getHotGoods();
});

const getGoodsDetail = async () => {
  const res = await goodsDetail(props.goodsId);
  if (res.code === 200) {
    goods.value = res.data;

    // 处理商品详情数据
    baseInfo.currentImage = goods.value.sysOssLists[0].url; // 默认展示第一张图片

    baseInfo.totalPrice = getInitPrice(goods.value.hnGoodsSpecificationDataList); // 初始化获取价格区间

    const hnBaseEnterpriseInfo = goods.value.hnBaseEnterpriseInfo; // 企业信息
    // 发货地址
    baseInfo.address = hnBaseEnterpriseInfo.province + hnBaseEnterpriseInfo.city + hnBaseEnterpriseInfo.district + hnBaseEnterpriseInfo.signUpAddress;
  }
};

// 1 加入比价 2 加入收藏 3 立即下单 4 电话沟通 5 我要举报
const operateOrder = (type: number) => {
  switch (type) {
    case 1:
      console.log('加入比价');
      break;
    case 2:
      console.log(goods.value.hnGoodsSpecificationDataList, baseInfo.currentSpec);
      // 检查当前规格是否存在
      if (!baseInfo.currentSpec) {
        ElMessage.error('请选择商品规格');
        return;
      }
      addToFavorites({
        favoriteType: 1,
        favoriteGoogsBo: {
          googsId: props.goodsId, // 商品ID
          googsPrice: Number(goods.value.hnGoodsSpecificationDataList.filter((spec) => spec.id === baseInfo.currentSpec)[0].goodsPrice || 0), // 商品价格
          goodsSpecificationId: baseInfo.currentSpec // 规格
        }
      }).then((res) => {
        if (res.code === 200) {
          ElMessage.success('加入收藏成功');
        }
      });
      break;
    case 3:
      console.log('立即下单');
      break;
    case 4:
      console.log('电话沟通');
      break;
    case 5:
      console.log('我要举报');
      break;
    default:
      break;
  }
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

// 获取同类商品
const getRelatedGoods = async () => {
  const res = await goodsList({
    pageNum: 1,
    pageSize: 9999,
    id: goods.value.id,
    sortManner: '3', // 价格最低
    goodsCategoryId: goods.value.goodsCategoryId,
    provinceCode: goods.value.hnBaseEnterpriseInfo.provinceCode,
    cityCode: goods.value.hnBaseEnterpriseInfo.cityCode,
    districtCode: goods.value.hnBaseEnterpriseInfo.districtCode
  });
  if (res.code === 200) {
    groupedRelatedGoods.value = groupArray(res.rows);
    loading.value = false;
  }
};

// 获取最热商品
const getHotGoods = async () => {
  const res = await goodsList({
    pageNum: 1,
    pageSize: 5,
    sortManner: '0', // 销量最高
    goodsCategoryId: goods.value.goodsCategoryId,
    provinceCode: goods.value.hnBaseEnterpriseInfo.provinceCode,
    cityCode: goods.value.hnBaseEnterpriseInfo.cityCode,
    districtCode: goods.value.hnBaseEnterpriseInfo.districtCode
  });
  if (res.code === 200) {
    hotGoods.value = res.rows;
  }
};

// 分组数组，每组groupSize个
const groupArray = (array: any[], groupSize: number = 5) => {
  return array.reduce((result, item, index) => {
    const groupIndex = Math.floor(index / groupSize); // 计算当前对象属于第几组
    if (!result[groupIndex]) {
      result[groupIndex] = []; // 初始化组
    }
    result[groupIndex].push(item); // 将对象添加到对应组
    return result;
  }, []);
};

defineExpose({
  getGoodsDetail
});
</script>

<style scoped lang="scss">
.goods-detail {
  .goods-image {
    width: 400px;
  }

  .goods-info {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .actions {
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
