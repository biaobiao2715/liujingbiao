<template>
  <div class="goods-detail-container">
    <!-- 比价选择页面 -->
    <CompareGoodsPage v-if="showComparePage" :goodsId="goodsIdFromRoute as number | string" @startCompare="handleStartCompare" />

    <!-- 比价详情组件 -->
    <CompareGoodsComponent v-else-if="showCompare" ref="compareGoodsRef" />

    <!-- 商品详情 -->
    <template v-else>
      <!-- 面包屑导航 -->
      <el-breadcrumb separator=">" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
          <span v-if="index === breadcrumbItems.length - 1">{{ item }}</span>
          <span v-else>{{ item }}</span>
        </el-breadcrumb-item>
      </el-breadcrumb>

    <div class="goods-detail" v-loading="loading" v-show="!showOrder">
      <div class="base-info flex gap-20">
        <!-- 商品图片 -->
        <div class="goods-image">
          <!-- 当前展示的图片 -->
          <div class="main-image">
          <el-image :src="baseInfo.currentImage" fit="contain" />
          </div>
          <!-- 所有图片 -->
          <div class="img-list flex gap-12">
            <el-image v-for="(img, index) in goods?.sysOssLists" :key="index" :src="img.url" fit="cover"
              class="thumbnail" :class="{ active: baseInfo.currentImage === img.url }"
              @click="baseInfo.currentImage = img.url" />
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="goods-info">
          <!-- 标题和操作按钮 -->
          <div class="title-row">
            <div class="title-left">
              <h1 class="goods-title">{{ goods?.goodsName }}</h1>
              <!-- 商品属性标签 -->
              <div class="goods-tags">
                <el-tag
                  v-for="tag in goods?.goodssEnsureName"
                  :key="tag"
                  class="attribute-tag"
                >
                  {{ tag }}
                </el-tag>
                <el-tag
                  v-for="tag in goods?.goodsAbilityName"
                  :key="tag"
                  class="attribute-tag"
                >
                  {{ tag }}
                </el-tag>
              </div>
            </div>
            <div class="title-actions">
              <span class="action-link phone-link" @click="operateOrder(4)">电话沟通</span>
              <span class="action-link report-link" @click="operateOrder(5)">我要举报</span>
            </div>
          </div>

          <!-- 价格 -->
          <div class="price-section">
            <div class="price">¥{{ baseInfo.totalPrice }}元</div>
          </div>

          <!-- 发货地址 -->
          <div class="shipping-address">
            <span class="label">发货地址</span>
            <span class="address-text">{{ baseInfo.address }}</span>
            <el-icon class="address-icon" @click="addressCollapse = !addressCollapse">
              <ArrowDown />
            </el-icon>
          </div>

          <!-- 规格选择 -->
          <div class="spec-section">
            <div class="spec-label">规格选择</div>
            <div class="spec-buttons">
              <el-button
                  v-for="spec in goods?.hnGoodsSpecificationDataList"
                  :key="spec.id"
                :class="{ 'spec-active': baseInfo.currentSpec === spec.id }"
                class="spec-button"
                @click="selectSpec(spec.id)"
              >
                {{ spec.goodsSpecificationValue }} {{ spec.goodsSpecification }}
                <el-icon v-if="baseInfo.currentSpec === spec.id" class="spec-check-icon">
                  <Check />
                </el-icon>
              </el-button>
            </div>
            <div v-if="goods?.hnGoodsSpecificationDataList && goods.hnGoodsSpecificationDataList.length > 4" class="view-more-specs">
              <el-link type="success" :underline="false">
                查看其他{{ goods.hnGoodsSpecificationDataList.length - 4 }}个规格
                <el-icon><ArrowDown /></el-icon>
              </el-link>
            </div>
          </div>

          <!-- 购买数量 -->
          <div class="quantity-section">
            <span class="quantity-label">购买数量</span>
            <el-input-number v-model="baseInfo.quantity" :min="1" @change="updateTotalPrice" />
          </div>

          <!-- 操作按钮 -->
          <div class="actions">
            <div class="compare-link" @click="operateOrder(1)">
              <div class="vs-icon">VS</div>
              <span class="compare-text">加入比价</span>
            </div>
            <el-button class="favorite-btn" @click="operateOrder(2)">
              <el-icon>
                <ShoppingCart />
              </el-icon>
              加入收藏夹
            </el-button>
            <el-button class="buy-btn" @click="operateOrder(3)">立即下单</el-button>
          </div>
        </div>
      </div>

      <!-- 同类商品 -->
      <div class="similar-goods-section">
        <div class="section-title">同类商品</div>
        <div class="similar-goods-list">
          <GoodsItemComponent v-for="(item, index) in groupedRelatedGoods.flat()" :key="index" :goods="item"
            class="similar-goods-item" />
              </div>
      </div>

      <!-- 详情部分 -->
      <div class="detail-section">
      <div class="editor-hot flex">
          <div class="detail-content-wrapper">
            <div class="section-title">商品详情</div>
            <div class="detail-content">
              <!-- 顶部大图 -->
              <div v-if="detailImages.length > 0" class="detail-hero-image">
                <el-image :src="detailImages[0]" fit="cover" />
              </div>

              <!-- 文本描述 -->
              <div class="detail-text">{{ detailText }}</div>

              <!-- 图片网格 -->
              <div v-if="detailImages.length > 1" class="detail-image-gallery">
                <div class="gallery-left">
                  <el-image v-if="detailImages[1]" :src="detailImages[1]" fit="cover" />
                </div>
                <div class="gallery-right">
                  <el-image v-if="detailImages[2]" :src="detailImages[2]" fit="cover" />
                  <el-image v-if="detailImages[3]" :src="detailImages[3]" fit="cover" />
                </div>
              </div>

              <!-- 底部大图 -->
              <div v-if="detailImages.length > 4" class="detail-bottom-image">
                <el-image :src="detailImages[4]" fit="cover" />
              </div>

              <!-- 底部三张小图 -->
              <div v-if="detailImages.length > 5" class="detail-bottom-grid">
                <el-image v-for="(img, index) in detailImages.slice(5, 8)" :key="index" :src="img" fit="cover"
                  class="grid-item" />
              </div>
            </div>
          </div>
        <div class="hot-goods">
            <div class="hot-title">热门推荐</div>
            <GoodsItemComponent v-for="(item, index) in hotGoods" :key="index" :goods="item" class="hot-goods-item" />
          </div>
        </div>
      </div>
    </div>

    <!-- 下单组件 -->
    <PlaceOrderComponent ref="placeOrderRef" v-if="showOrder" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { addToFavorites } from '@/api/mall/index';
import { goodsList, goodsDetail } from '@/api/mall/goods/index';
import type { Goods } from '../mall';
import PlaceOrderComponent from './PlaceOrderComponent.vue';
import GoodsItemComponent from './GoodsItemComponent.vue';
import CompareGoodsPage from './AboutCompareComponents/CompareGoodsPage.vue';
import CompareGoodsComponent from './AboutCompareComponents/CompareGoodsComponent.vue';
import { Star, ArrowDown, Check, ShoppingCart } from '@element-plus/icons-vue';

const props = defineProps<{
  goodsId?: number;
}>();

const router = useRouter();
const route = useRoute();

// 从路由或props获取商品id
const goodsIdFromRoute = computed(() => {
  if (props.goodsId) {
    return props.goodsId;
  }
  return route.query.id ? String(route.query.id) : undefined;
});

const goods = ref<Goods>({});

const loading = ref(true); // 加载状态

const placeOrderRef = ref();

const showOrder = ref(false);
const showComparePage = ref(false);
const showCompare = ref(false);
const compareGoodsRef = ref();
const allCompareGoodsList = ref<any[]>([]);

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

const addressCollapse = ref(false); // 地址折叠状态

// 面包屑导航项
const breadcrumbItems = ref<string[]>([]);

// 商品详情固定图片（写死）
const detailImages = ref<string[]>([
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',
  'https://pic.nximg.cn/file/20231226/12398452_082624808109_2.jpg',

]);

// 商品详情固定文本（写死）
const detailText = ref(`该品种品质优、糯性好，甜度高，大福，商品性好，果福筒形，她行整齐，无师尖，籽粒纯白。在同一里输上同时具有權粒75%和甜25%的解食专用玉米品种，一般穗长22厘米，株型紧决，株高中饪，卷种核高160厘米，直种株高180厘米，在我国长江流域可做多季報地。`);

// 选择规格
const selectSpec = (specId: number) => {
  baseInfo.currentSpec = specId;
  updateTotalPrice();
};

onMounted(async () => {
  // 确保商品ID存在后再加载数据
  if (goodsIdFromRoute.value) {
  await getGoodsDetail();
  } else {
    ElMessage.error('缺少商品ID');
    loading.value = false;
  }
});

const getGoodsDetail = async () => {
  const id = goodsIdFromRoute.value;
  if (!id) {
    ElMessage.error('缺少商品ID');
    loading.value = false;
    return;
  }
  loading.value = true;
  try {
    const res = await goodsDetail(id);
  if (res.code === 200) {
      if (!res.data) {
        ElMessage.error('商品不存在');
        loading.value = false;
        return;
      }
      
    goods.value = res.data;

    // 处理商品详情数据
      if (goods.value.sysOssLists && goods.value.sysOssLists.length > 0) {
        baseInfo.currentImage = goods.value.sysOssLists[0]?.url || ''; // 默认展示第一张图片
      }

    baseInfo.totalPrice = getInitPrice(goods.value.hnGoodsSpecificationDataList); // 初始化获取价格区间

    const hnBaseEnterpriseInfo = goods.value.hnBaseEnterpriseInfo; // 企业信息
    // 发货地址
      if (hnBaseEnterpriseInfo) {
        const addressParts = [];
        if (hnBaseEnterpriseInfo.province) addressParts.push(hnBaseEnterpriseInfo.province);
        if (hnBaseEnterpriseInfo.city) addressParts.push(hnBaseEnterpriseInfo.city);
        if (hnBaseEnterpriseInfo.district) addressParts.push(hnBaseEnterpriseInfo.district);
        if (hnBaseEnterpriseInfo.signUpAddress) addressParts.push(hnBaseEnterpriseInfo.signUpAddress);
        baseInfo.address = addressParts.join('');
      }

      // 生成面包屑导航
      updateBreadcrumb();

      // 商品详情加载成功后，加载相关商品和热门商品
      await getRelatedGoods();
      await getHotGoods();
    } else {
      ElMessage.error(res.msg || '获取商品详情失败');
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败');
  } finally {
    loading.value = false;
  }
};

// 更新面包屑导航
const updateBreadcrumb = () => {
  const items: string[] = [];
  
  // 如果有商品分类名称，添加到面包屑
  if (goods.value?.goodsCategoryName) {
    items.push(goods.value.goodsCategoryName);
  }
  
  // 商品名称作为最后一项
  if (goods.value?.goodsName) {
    items.push(goods.value.goodsName);
  }
  
  breadcrumbItems.value = items;
};

// 1 加入比价 2 加入收藏 3 立即下单 4 电话沟通 5 我要举报
const operateOrder = (type: number) => {
  switch (type) {
    case 1:
        // 加入比价 - 显示比价选择页面
        if (!goods.value) {
          ElMessage.warning('商品信息加载中，请稍候');
          return;
        }
        showComparePage.value = true;
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
          googsId: goodsIdFromRoute.value, // 商品ID
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
    const prices = specs.map((spec) => parseFloat(spec.goodsPrice || 0)).filter(p => p > 0);
    if (prices.length > 0) {
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
      return minPrice === maxPrice ? `${minPrice.toFixed(2)}` : `${minPrice.toFixed(2)}~${maxPrice.toFixed(2)}`;
    }
  }
  return '0.00';
};

// 更新总价
const updateTotalPrice = () => {
  if (!baseInfo.currentSpec) {
    // 如果没有选择规格，显示价格区间
    baseInfo.totalPrice = getInitPrice(goods.value.hnGoodsSpecificationDataList || []);
    return;
  }
  // 规格对应的价格X数量
  const spec = goods.value.hnGoodsSpecificationDataList?.find((s) => s.id === baseInfo.currentSpec);
  if (spec) {
    const price = parseFloat(String(spec.goodsPrice || 0));
    baseInfo.totalPrice = `${price.toFixed(2)}~${(price * baseInfo.quantity).toFixed(2)}`;
  }
};

// 获取同类商品
const getRelatedGoods = async () => {
  if (!goods.value || !goods.value.id) {
    return;
  }
  try {
  const res = await goodsList({
    pageNum: 1,
    pageSize: 9999,
    id: goods.value.id,
    sortManner: '3', // 价格最低
    goodsCategoryId: goods.value.goodsCategoryId,
      provinceCode: goods.value.hnBaseEnterpriseInfo?.provinceCode,
      cityCode: goods.value.hnBaseEnterpriseInfo?.cityCode,
      districtCode: goods.value.hnBaseEnterpriseInfo?.districtCode
  });
  if (res.code === 200) {
      groupedRelatedGoods.value = groupArray(res.rows || []);
    }
  } catch (error) {
    console.error('获取同类商品失败:', error);
  }
};

// 获取最热商品
const getHotGoods = async () => {
  if (!goods.value || !goods.value.id) {
    return;
  }
  try {
  const res = await goodsList({
    pageNum: 1,
    pageSize: 5,
    sortManner: '0', // 销量最高
    goodsCategoryId: goods.value.goodsCategoryId,
      provinceCode: goods.value.hnBaseEnterpriseInfo?.provinceCode,
      cityCode: goods.value.hnBaseEnterpriseInfo?.cityCode,
      districtCode: goods.value.hnBaseEnterpriseInfo?.districtCode
  });
  if (res.code === 200) {
      hotGoods.value = res.rows || [];
    }
  } catch (error) {
    console.error('获取热门商品失败:', error);
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

// 处理开始对比事件
const handleStartCompare = (compareList: any[]) => {
  allCompareGoodsList.value = compareList;
  showComparePage.value = false;
  showCompare.value = true;
};

defineExpose({
  getGoodsDetail
});
</script>

<style scoped lang="scss">
.goods-detail-container {
  padding: 20px 210px;
  background-color: #F6F7FB ;

  .breadcrumb {
    margin-bottom: 20px;
    font-size: 14px;
    color: #606266;
    max-width: 1600px;
    margin-left: auto;
    margin-right: auto;
  }
}

.goods-detail {
  padding: 20px;
  max-width: 1494px;
  margin: 0 auto;
  background-color: #fff;

  .base-info {
    margin-bottom: 40px;
  }

  .goods-image {
    width: 540px;
    flex-shrink: 0;

    .main-image {
      width: 100%;
      height: 540px;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 12px;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }
    }

    .img-list {
      display: flex;
      gap: 8px;

      .thumbnail {
        width: 124px;
        height: 124px;
        border: 2px solid #ebeef5;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s;

        &.active {
          border-color: #67c23a;
        }

        &:hover {
          border-color: #67c23a;
        }
      }
    }
  }

  .goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;

      .title-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
        margin-bottom: 16px;

        .title-left {
          flex: 1;

          .goods-title {
            font-size: 24px;
            font-weight: bold;
            color: #303133;
            margin: 0 0 12px 0;
            line-height: 1.4;
          }

          .goods-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;

            .attribute-tag {
              border: 1px solid #a8d8a8;
              background-color: transparent;
              color: #909399;
              font-size: 12px;
              padding: 2px 8px;
              border-radius: 2px;
              margin: 0;
            }
          }
        }

      .title-actions {
        display: flex;
        gap: 16px;
        flex-shrink: 0;

        .action-link {
          cursor: pointer;
          transition: color 0.3s;

          &.phone-link {
            color: #FFA113;
            font-size: 16px;
          }

          &.report-link {
            color: #EF4D0B;
            font-size: 16px;
          }

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    .price-section {
      background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%);
      background-image: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255, 255, 255, 0.1) 10px,
        rgba(255, 255, 255, 0.1) 20px
      );
      padding: 16px 20px;
      border-radius: 4px;
      margin-bottom: 20px;

      .price {
        font-size: 32px;
        font-weight: bold;
        color: #ff6b00;
      }
    }

    .shipping-address {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      font-size: 14px;
      color: #303133;

      .label {
        color: #606266;
        flex-shrink: 0;
      }

      .address-text {
        flex-shrink: 0;
        max-width: 100%;
      }

      .address-icon {
        cursor: pointer;
        color: #909399;
        transition: transform 0.3s;
        flex-shrink: 0;
        margin-left: 4px;

        &:hover {
          color: #67c23a;
        }
      }
    }

    .spec-section {
      .spec-label {
        font-size: 14px;
        color: #606266;
        margin-bottom: 12px;
      }

      .spec-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;

        .spec-button {
          border: 1px solid #dcdfe6;
          background-color: #fff;
          color: #606266;
          padding: 8px 16px;
          border-radius: 4px;
          transition: all 0.3s;
          position: relative;

          &:hover {
            border-color: #67c23a;
            color: #67c23a;
          }

          &.spec-active {
            border-color: #67c23a;
            border-width: 2px;
            color: #67c23a;
            background-color: #f0f9ff;

            .spec-check-icon {
              position: absolute;
              bottom: 2px;
              right: 2px;
              font-size: 14px;
              color: #67c23a;
            }
          }
        }
      }

      .view-more-specs {
        margin-top: 12px;
        font-size: 13px;

        :deep(.el-link) {
          color: #67c23a;

          .el-icon {
            margin-left: 4px;
            font-size: 12px;
          }
        }
      }
    }

    .quantity-section {
      display: flex;
      align-items: center;
      gap: 12px;

      .quantity-label {
        font-size: 14px;
        color: #606266;
      }
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 20px;

      .compare-link {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 8px 16px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        background-color: #fff;
        cursor: pointer;
        transition: all 0.3s;

        .vs-icon {
          width: 28px;
          height: 28px;
          border: 1px solid #dcdfe6;
          border-radius: 2px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          color: #909399;
        }

        .compare-text {
          color: #909399;
          font-size: 14px;
        }

        &:hover {
          border-color: #67c23a;

          .vs-icon {
            border-color: #67c23a;
            color: #67c23a;
          }

          .compare-text {
            color: #67c23a;
          }
        }
      }

      .favorite-btn {
        width: 160px;
        height: 50px;
        background: rgba(16, 140, 88, 0.1);
        border-radius: 2px;
        border: 1px solid #108C58;
        color: #108C58;
        font-size: 20px;
        padding: 0;

        &:hover {
          background: rgba(16, 140, 88, 0.15);
          border-color: #108C58;
        }

        .el-icon {
          margin-right: 4px;
        }
      }

      .buy-btn {
        width: 160px;
        height: 50px;
        background: #108C58;
        border-radius: 2px;
        border: 1px solid #108C58;
        color: #FFFFFF;
        font-size: 20px;
        padding: 0;

        &:hover {
          background: #0e7a4a;
          border-color: #0e7a4a;
        }
      }
    }
  }

  .similar-goods-section {
    margin: 40px 0;

    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #303133;
      padding: 12px 0;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 20px;
    }

    .similar-goods-list {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding-bottom: 10px;

      .similar-goods-item {
        flex-shrink: 0;
        width: 250px;

        :deep(.goods-image) {
          height: 200px;
          object-fit: cover;
        }

        :deep(.goods-item) {
          border: 2px solid transparent;
          transition: border-color 0.3s, box-shadow 0.3s;

          &:hover {
            border-color: #ffd700;
            box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
          }
        }
      }
    }
  }

  .detail-section {
    margin-top: 40px;

    .editor-hot {
      gap: 20px;

      .detail-content-wrapper {
        flex: 1;
        min-width: 0;

        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #303133;
          padding: 12px 0;
          border-bottom: 1px solid #ebeef5;
          margin-bottom: 20px;
        }

        .detail-content {
          .detail-hero-image {
            width: 100%;
            margin-bottom: 24px;
            border-radius: 4px;
            overflow: hidden;

            :deep(.el-image) {
              width: 100%;
              height: auto;
              max-height: 600px;
            }
          }

          .detail-text {
            font-size: 14px;
            line-height: 1.8;
            color: #606266;
            margin-bottom: 24px;
            white-space: pre-wrap;
            word-break: break-word;
          }

          .detail-image-gallery {
            display: flex;
            gap: 12px;
            margin-bottom: 24px;

            .gallery-left {
              flex: 2;
              border-radius: 4px;
              overflow: hidden;

              :deep(.el-image) {
                width: 100%;
                height: 100%;
                min-height: 300px;
              }
            }

            .gallery-right {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 12px;

              :deep(.el-image) {
                width: 100%;
                flex: 1;
                min-height: 140px;
                border-radius: 4px;
                overflow: hidden;
              }
            }
          }

          .detail-bottom-image {
            width: 100%;
            margin-top: 24px;
            margin-bottom: 24px;
            border-radius: 4px;
            overflow: hidden;

            :deep(.el-image) {
              width: 100%;
              height: auto;
              max-height: 500px;
            }
          }

          .detail-bottom-grid {
      display: flex;
            gap: 12px;
            margin-top: 24px;

            .grid-item {
              flex: 1;
              border-radius: 4px;
              overflow: hidden;
              min-height: 200px;

              :deep(.el-image) {
                width: 100%;
                height: 100%;
              }
            }
          }
        }
      }

      .hot-goods {
        width: 240px;
        flex-shrink: 0;

        .hot-title {
          font-size: 16px;
          font-weight: bold;
          color: #303133;
          padding: 12px 0;
          border-bottom: 1px solid #ebeef5;
          margin-bottom: 16px;
        }

        .hot-goods-item {
          margin-bottom: 16px;
        }
      }
    }
  }
}
</style>
