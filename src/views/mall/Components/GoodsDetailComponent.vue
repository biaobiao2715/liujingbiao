<template>
  <div class="goods-detail-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/mall' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in breadcrumbItems" :key="index">
        {{ item }}
      </el-breadcrumb-item>
    </el-breadcrumb>

    <div class="goods-detail" v-loading="loading" v-show="!showOrder">
      <div class="base-info flex gap-20">
        <!-- 商品图片 -->
        <div class="goods-image">
          <!-- 轮播图主图 -->
          <el-carousel
            v-if="goods?.sysOssLists && goods.sysOssLists.length > 0"
            ref="carouselRef"
            height="400px"
            :initial-index="currentImageIndex"
            @change="handleCarouselChange"
            indicator-position="none"
            arrow="hover"
            :interval="3000"
            :autoplay="(goods?.sysOssLists?.length ?? 0) > 1"
            class="main-carousel"
          >
            <el-carousel-item v-for="(img, index) in goods?.sysOssLists" :key="index">
              <el-image :src="img.url" fit="contain" class="carousel-image" />
            </el-carousel-item>
          </el-carousel>

          <!-- 缩略图区域 -->
          <div class="thumbnails-wrapper">
            <button
              class="thumbnails-btn thumbnails-btn-left"
              @click="scrollThumbnails('left')"
              :disabled="!goods?.sysOssLists || goods.sysOssLists.length <= 1"
            >
              ‹
            </button>
            <div class="thumbnails-container">
              <div class="thumbnails">
                <div
                  v-for="(img, index) in goods?.sysOssLists"
                  :key="index"
                  class="thumbnail"
                  :class="{ active: currentImageIndex === index }"
                  @click="handleThumbnailClick(index)"
                >
                  <el-image :src="img.url" fit="cover" />
                </div>
              </div>
            </div>
            <button
              class="thumbnails-btn thumbnails-btn-right"
              @click="scrollThumbnails('right')"
              :disabled="!goods?.sysOssLists || goods.sysOssLists.length <= 1"
            >
              ›
            </button>
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
                <el-tag v-for="tag in goods?.goodssEnsureName" :key="tag" class="attribute-tag ensure-tag">
                  {{ tag }}
                </el-tag>
                <el-tag v-for="tag in goods?.goodsAbilityName" :key="tag" class="attribute-tag ability-tag">
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
            <span class="address-text">{{ enterpriseShippingAddress || '暂无发货地址' }}</span>
          </div>

          <!-- 规格选择 -->
          <div class="spec-section">
            <div class="spec-title">规格选择</div>
            <div class="spec-content">
              <div class="spec-grid">
                <div
                  v-for="spec in displayedSpecs"
                  :key="spec.id"
                  :class="{ 'spec-item': true, 'selected': baseInfo.currentSpec === spec.id }"
                  @click="selectSpec(spec.id)"
                >
                  {{ spec.goodsSpecificationValue }}{{ goods?.goodsSpecificationName || '' }}
                  <el-icon v-if="baseInfo.currentSpec === spec.id" class="spec-check-icon">
                    <Check />
                  </el-icon>
                </div>
              </div>
              <div v-if="hasMoreSpecs" class="view-more-specs">
                <a href="#" class="spec-link" @click.prevent="showAllSpecs = !showAllSpecs">
                  {{ showAllSpecs ? '收起规格' : `查看其他${remainingSpecsCount}个规格` }}
                </a>
              </div>
            </div>
          </div>

          <!-- 购买数量 -->
          <div class="quantity-section">
            <div class="quantity-title">购买数量</div>
            <div class="quantity-content">
              <el-input-number v-model="baseInfo.quantity" :min="1" @change="updateTotalPrice" />
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button class="btn btn-compare" @click="operateOrder(1)">加入比价</button>
            <button class="btn btn-favorite" @click="operateOrder(2)">加入收藏夹</button>
            <button class="btn btn-buy" @click="operateOrder(3)">立即下单</button>
          </div>
        </div>
      </div>

      <!-- 同类商品 -->
      <div class="similar-goods-section">
        <div class="section-title">同类商品</div>
        <div class="similar-goods-list">
          <GoodsItemComponent
            v-for="(item, index) in groupedRelatedGoods.flat()"
            :key="index"
            :goods="item"
            class="similar-goods-item"
            @clickGoods="handleSimilarGoodsClick(item.id)"
          />
        </div>
      </div>

      <!-- 详情部分 -->
      <div class="detail-section">
        <div class="info-recommend-wrapper">
          <!-- 商品详情 -->
          <div class="product-info">
            <h2 class="section-title">商品详情</h2>
            <div class="goods-detail-content" v-html="goods?.goodsDetail || ''"></div>
          </div>

          <!-- 热门推荐 -->
          <div class="hot-recommendations">
            <h2 class="section-title">热门推荐</h2>
            <div class="recommendation-list">
              <GoodsItemComponent
                v-for="(item, index) in hotGoods"
                :key="index"
                :goods="item"
                class="hot-goods-item"
                @clickGoods="handleSimilarGoodsClick(item.id)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 我要举报弹窗（封装组件） -->
    <ReportDialog
      v-model="showReportDialog"
      :default-target="goods?.hnBaseEnterpriseInfo?.companyName || ''"
      :default-goods-info="goods?.goodsName || ''"
      @submit="handleReportSubmitData"
    />
    <!-- 下单组件 -->
    <PlaceOrderComponent
      v-model="showOrder"
      :goods="goods"
      :selected-spec-id="baseInfo.currentSpec"
      :quantity="baseInfo.quantity"
      @submit="handleOrderSubmit"
    />

    <!-- 电话沟通弹窗（自定义，无组件，teleport 到 body 保证层级与可见性） -->

    <div v-if="showPhoneDialog" class="phone-dialog-overlay" @click.self="showPhoneDialog = false">
      <div class="phone-dialog">
        <div class="phone-dialog__header">
          <div class="phone-dialog__title">联系商家</div>
          <span class="phone-dialog__close" @click="showPhoneDialog = false">×</span>
        </div>
        <div class="phone-dialog__body">
          <div v-if="enterprisePhoneNumber" class="phone-dialog__number">{{ enterprisePhoneNumber }}</div>
          <div v-else class="phone-dialog__no-number">暂无商家电话</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { addToFavorites } from '@/api/mall/index';
import { goodsList, goodsDetail } from '@/api/mall/goods/index';
import type { Goods } from '../mall';
import PlaceOrderComponent from './AboutCompareComponents/PlaceOrderComponent.vue';
import GoodsItemComponent from './GoodsItemComponent.vue';
import { Check } from '@element-plus/icons-vue';
import ReportDialog from './AboutCompareComponents/ReportDialog.vue';

const props = defineProps<{
  id?: number;
}>();

const router = useRouter();
const route = useRoute();

// 从路由或props获取商品id
const goodsIdFromRoute = computed(() => {
  if (props.id) {
    return props.id;
  }
  return route.query.id ? String(route.query.id) : undefined;
});

const goods = ref<Goods>({});

const loading = ref(true); // 加载状态

// 富文本详情直接渲染，无需解析

const carouselRef = ref();

const showOrder = ref(false);

// 当前图片索引
const currentImageIndex = ref(0);

// 需要经过处理得到的数据
const baseInfo = reactive<{
  totalPrice: string;
  currentSpec: number | null;
  quantity: number;
}>({
  totalPrice: '',
  currentSpec: null,
  quantity: 1
});

const groupedRelatedGoods = ref([]); // 同类商品

const hotGoods = ref([]); // 最热商品

const enterpriseShippingAddress = computed(() => {
  const info = goods.value?.hnBaseEnterpriseInfo;
  if (!info) return '';
  return [info.province, info.city, info.district, info.signUpAddress]
    .map((part) => (typeof part === 'string' ? part.trim() : part))
    .filter((part) => part && String(part).toLowerCase() !== 'null' && String(part).toLowerCase() !== 'undefined')
    .join('');
});

// 发货地址直接根据企业信息拼接展示，无需用户地址下拉

// 商家电话
const enterprisePhoneNumber = computed(() => {
  return goods.value?.hnBaseEnterpriseInfo?.phoneNumber || '';
});
const showPhoneDialog = ref(false);

// 举报弹窗
const showReportDialog = ref(false);

onMounted(async () => {
  // 确保商品ID存在后再加载数据
  if (goodsIdFromRoute.value) {
    await getGoodsDetail();
  } else {
    ElMessage.error('缺少商品ID');
    loading.value = false;
  }
});

// 监听路由变化，当商品ID改变时重新加载详情
watch(
  () => goodsIdFromRoute.value,
  async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await getGoodsDetail();
    }
  }
);

const handleReportSubmitData = (_fd: FormData) => {
  // TODO: 接入实际举报接口
  ElMessage.success('已提交举报');
};

// 规格显示控制
const showAllSpecs = ref(false);
const defaultDisplayCount = 8; // 默认显示8个规格（第一行4个，第二行4个）

// 计算要显示的规格列表
const displayedSpecs = computed(() => {
  if (!goods.value?.hnGoodsSpecificationDataList) return [];
  if (showAllSpecs.value) {
    return goods.value.hnGoodsSpecificationDataList;
  }
  return goods.value.hnGoodsSpecificationDataList.slice(0, defaultDisplayCount);
});

// 判断是否有未展示的规格
const hasMoreSpecs = computed(() => {
  if (!goods.value?.hnGoodsSpecificationDataList) return false;
  return goods.value.hnGoodsSpecificationDataList.length > defaultDisplayCount;
});

// 计算未展示的规格数量
const remainingSpecsCount = computed(() => {
  if (!goods.value?.hnGoodsSpecificationDataList) return 0;
  return goods.value.hnGoodsSpecificationDataList.length - defaultDisplayCount;
});

// 轮播图切换事件
const handleCarouselChange = (index: number) => {
  currentImageIndex.value = index;
};

// 缩略图滚动并切换主图
const scrollThumbnails = (direction: 'left' | 'right') => {
  const images = goods.value?.sysOssLists;
  if (!images?.length) return;

  const newIndex =
    direction === 'left'
      ? currentImageIndex.value > 0
        ? currentImageIndex.value - 1
        : images.length - 1
      : currentImageIndex.value < images.length - 1
        ? currentImageIndex.value + 1
        : 0;

  carouselRef.value?.setActiveItem(newIndex);
};

// 处理缩略图点击，切换主图
const handleThumbnailClick = (index: number) => {
  if (goods.value?.sysOssLists?.[index]) {
    carouselRef.value?.setActiveItem(index);
  }
};

// 面包屑导航项
const breadcrumbItems = ref<string[]>([]);

// 直接展示富文本，无需解析函数

// 选择规格
const selectSpec = (specId: number) => {
  baseInfo.currentSpec = specId;
  updateTotalPrice();
};

const getGoodsDetail = async () => {
  const id = goodsIdFromRoute.value;
  baseInfo.currentSpec = null;
  baseInfo.totalPrice = '';
  baseInfo.quantity = 1;
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
      if (goods.value.sysOssLists?.length) {
        currentImageIndex.value = 0;
      }

      // 如果只有一个规格，默认选中
      if (goods.value.hnGoodsSpecificationDataList?.length === 1) {
        baseInfo.currentSpec = goods.value.hnGoodsSpecificationDataList[0]?.id;
      }

      baseInfo.totalPrice = getInitPrice(goods.value.hnGoodsSpecificationDataList); // 初始化获取价格区间

      // 生成面包屑导航
      updateBreadcrumb();

      // 商品详情加载成功后，加载相关商品和热门商品
      await Promise.all([getRelatedGoods(), getHotGoods()]);
    } else {
      ElMessage.error(res.msg || '获取商品详情失败');
    }
  } catch (error) {
    ElMessage.error('获取商品详情失败');
  } finally {
    loading.value = false;
  }
};

// 更新面包屑导航
const updateBreadcrumb = () => {
  breadcrumbItems.value = goods.value?.goodsName ? [goods.value.goodsName] : [];
};

// 1 加入比价 2 加入收藏 3 立即下单 4 电话沟通 5 我要举报
const operateOrder = (type: number) => {
  switch (type) {
    case 1:
      // 加入比价 - 跳转到比价选择页面
      if (!goods.value) {
        ElMessage.warning('商品信息加载中，请稍候');
        return;
      }
      // 跳转到比价页面，传递商品id
      router.push({
        path: '/mall/compare-goods',
        query: { id: goods.value.id }
      });
      break;
    case 2:
      if (!baseInfo.currentSpec) {
        ElMessage.error('请选择商品规格');
        return;
      }
      const spec = goods.value.hnGoodsSpecificationDataList?.find((s) => s.id === baseInfo.currentSpec);
      if (!spec) {
        ElMessage.error('规格信息不存在');
        return;
      }
      addToFavorites({
        favoriteType: 1,
        favoriteGoogsBo: {
          googsId: goodsIdFromRoute.value,
          googsPrice: Number(spec.goodsPrice || 0),
          goodsSpecificationId: baseInfo.currentSpec
        }
      }).then((res) => {
        if (res.code === 200) {
          ElMessage.success('加入收藏成功');
        }
      });
      break;
    case 3:
      // 立即下单 - 显示下单弹窗
      if (!goods.value) {
        ElMessage.warning('商品信息加载中，请稍候');
        return;
      }
      if (!baseInfo.currentSpec) {
        ElMessage.error('请选择商品规格');
        return;
      }
      showOrder.value = true;
      break;
    case 4:
      // 电话沟通
      showPhoneDialog.value = true;
      break;
    case 5:
      // 我要举报
      showReportDialog.value = true;
      break;
    default:
      break;
  }
};

// 获取商品价格区间，返回最低-最高价格
const getInitPrice = (specs: any[]) => {
  if (!specs?.length) return '0.00';
  const prices = specs.map((spec) => parseFloat(spec.goodsPrice || 0)).filter((p) => p > 0);
  if (!prices.length) return '0.00';
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  return minPrice === maxPrice ? minPrice.toFixed(2) : `${minPrice.toFixed(2)}~${maxPrice.toFixed(2)}`;
};

// 更新总价
const updateTotalPrice = () => {
  if (!baseInfo.currentSpec) {
    // 如果没有选择规格，显示价格区间
    baseInfo.totalPrice = getInitPrice(goods.value.hnGoodsSpecificationDataList || []);
    return;
  }
  // 规格对应的价格（选择规格后，只显示当前规格的价格，不显示区间）
  const spec = goods.value.hnGoodsSpecificationDataList?.find((s) => s.id === baseInfo.currentSpec);
  console.log(spec);

  if (spec) {
    const price = parseFloat(String(spec.goodsPrice || 0)) * baseInfo.quantity;
    // 总价
    baseInfo.totalPrice = price.toFixed(2);
  }
};

// 处理订单提交
const handleOrderSubmit = (orderData: any) => {
  // 调用提交订单API
};

// 处理同类商品点击
const handleSimilarGoodsClick = (goodsId: string | number) => {
  if (!goodsId) {
    ElMessage.warning('商品ID不存在');
    return;
  }
  // 跳转到商品详情页面
  router.push({
    path: '/mall/goods-detail',
    query: { id: String(goodsId) }
  });
};

// 获取商品列表（同类商品或热门商品）
const fetchGoodsList = async (params: { pageSize: number; sortManner: string; excludeId?: number }) => {
  if (!goods.value?.id) return null;

  const enterpriseInfo = goods.value.hnBaseEnterpriseInfo;
  const res = await goodsList({
    pageNum: 1,
    pageSize: params.pageSize,
    id: params.excludeId,
    sortManner: params.sortManner,
    goodsCategoryId: goods.value.goodsCategoryId,
    provinceCode: enterpriseInfo?.provinceCode,
    cityCode: enterpriseInfo?.cityCode,
    districtCode: enterpriseInfo?.districtCode
  });
  return res.code === 200 ? res.rows || [] : null;
};

// 获取同类商品
const getRelatedGoods = async () => {
  const rows = await fetchGoodsList({
    pageSize: 9999,
    sortManner: '3',
    excludeId: goods.value?.id
  });
  if (rows) {
    groupedRelatedGoods.value = groupArray(rows);
  }
};

// 获取最热商品
const getHotGoods = async () => {
  const rows = await fetchGoodsList({
    pageSize: 5,
    sortManner: '0',
    excludeId: goods.value?.id
  });
  if (rows) {
    hotGoods.value = rows;
  }
};

// 分组数组，每组groupSize个
const groupArray = (array: any[], groupSize: number = 5) => {
  return array.reduce((result, item, index) => {
    const groupIndex = Math.floor(index / groupSize);
    if (!result[groupIndex]) result[groupIndex] = [];
    result[groupIndex].push(item);
    return result;
  }, []);
};

defineExpose({
  getGoodsDetail
});
</script>

<style scoped lang="scss">
.goods-detail-container {
  background-color: #f5f5f5;
  min-height: 100vh;

  .breadcrumb {
    max-width: 1200px;
    margin: 0 auto;
    padding: 15px 20px;
    color: #999;
    font-size: 14px;
    background-color: #f5f5f5;

    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: #999;

        &.is-link {
          color: #999;
          text-decoration: none;

          &:hover {
            color: #4caf50;
          }
        }
      }
    }
  }
}

.goods-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  .base-info {
    background: white;
    padding: 20px;
    margin-bottom: 0;
    display: flex;
    gap: 30px;
  }

  .goods-image {
    width: 400px;
    flex-shrink: 0;

    .main-carousel {
      width: 100%;
      margin-bottom: 15px;
      border-radius: 8px;
      overflow: hidden;

      :deep(.el-carousel__container) {
        height: 400px;
      }

      :deep(.el-carousel__item) {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #fff;
      }

      .carousel-image {
        width: 100%;
        height: 100%;

        :deep(.el-image__inner) {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }
      }

      :deep(.el-carousel__arrow) {
        background-color: rgba(0, 0, 0, 0.4);
        border: none;
        color: #fff;
        width: 40px;
        height: 40px;
        border-radius: 50%;

        &:hover {
          background-color: rgba(0, 0, 0, 0.6);
        }
      }

      :deep(.el-carousel__arrow--left) {
        left: 10px;
      }

      :deep(.el-carousel__arrow--right) {
        right: 10px;
      }
    }

    .thumbnails-wrapper {
      position: relative;
    }

    .thumbnails-container {
      width: 100%;
      overflow: hidden;
    }

    .thumbnails {
      display: flex;
      gap: 10px;
      transition: transform 0.3s ease;
    }

    .thumbnail {
      width: 90px;
      height: 90px;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.3s;
      user-select: none;
      position: relative;
      pointer-events: auto;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
        cursor: pointer;
        pointer-events: auto;
      }

      :deep(.el-image__inner) {
        cursor: pointer;
        pointer-events: auto;
      }

      &.active {
        border-color: #108c58;
        border-width: 2px;
      }

      &:hover {
        border-color: #108c58;
      }
    }

    .thumbnails-btn {
      position: absolute;
      top: 0;
      width: 20px;
      height: 90px;
      background-color: rgba(0, 0, 0, 0.4);
      color: white;
      border: none;
      font-size: 24px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s ease;
      z-index: 10;

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      &.thumbnails-btn-left {
        left: 0;
        border-radius: 4px 0 0 4px;
      }

      &.thumbnails-btn-right {
        right: 0;
        border-radius: 0 4px 4px 0;
      }

      &:hover:not(:disabled) {
        background-color: rgba(0, 0, 0, 0.6);
      }

      &:active:not(:disabled) {
        background-color: rgba(0, 0, 0, 0.8);
      }
    }
  }

  .goods-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
    padding-bottom: 80px; // 为底部固定按钮留出空间

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      margin-bottom: 0;

      .title-left {
        flex: 1;

        .goods-title {
          font-size: 24px;
          font-weight: bold;
          color: #000;
          margin: 0 0 15px 0;
          line-height: 1.4;
        }

        .goods-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 0;

          .attribute-tag {
            padding: 4px 12px;
            background-color: #f5f5f5;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            font-size: 12px;
            color: #666;
            margin: 0;
          }

          .ensure-tag {
            font-size: 13px;
            color: #f23255;
            height: 21px;
            padding: 5px 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }

          .ability-tag {
            font-size: 13px;
            color: #ff7b00;
            height: 21px;
            padding: 0 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            box-sizing: border-box;
          }
        }
      }

      .title-actions {
        display: flex;
        gap: 16px;
        flex-shrink: 0;
        align-items: flex-start;
        padding-top: 0;

        .action-link {
          cursor: pointer;
          transition: color 0.3s;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          font-family: inherit;
          line-height: 1.5;

          &.phone-link {
            color: #ffa113;
            font-size: 14px;
          }

          &.report-link {
            color: #ef4d0b;
            font-size: 14px;
          }

          &:hover {
            opacity: 0.8;
          }
        }
      }
    }

    .price-section {
      .price {
        font-size: 30px;
        font-weight: bold;
        color: #ef4d0b;
      }
    }

    .shipping-address {
      font-size: 14px;
      color: #333;
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .label {
        color: #333;
        flex-shrink: 0;
        width: 80px;
      }

      .address-select {
        flex: 1;
        min-width: 200px;

        :deep(.el-input__wrapper) {
          box-shadow: none;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      }

      .address-text {
        flex: 1;
        min-width: 200px;
        color: #555;
      }
    }

    .spec-section {
      display: flex;
      align-items: flex-start;
      margin-bottom: 20px;

      .spec-title {
        font-size: 14px;
        color: #666;
        flex-shrink: 0;
        width: 80px;
        margin-bottom: 0;
        line-height: 40px;
      }

      .spec-content {
        flex: 1;
      }

      .spec-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        margin-bottom: 10px;
      }

      .spec-item {
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        text-align: center;
        background: white;
        cursor: pointer;
        font-size: 14px;
        position: relative;
        transition: all 0.3s;
        min-height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          border-color: #108c58;
        }

        &.selected {
          background: rgba(16, 140, 88, 0.1);
          border-radius: 0px;
          border: 2px solid #108c58;
          color: #108c58;
          font-weight: 500;

          .spec-check-icon {
            position: absolute;
            bottom: 2px;
            right: 2px;
            font-size: 14px;
            color: #108c58;
          }
        }
      }

      .view-more-specs {
        text-align: center;
        margin-top: 10px;
      }

      .spec-link {
        font-weight: 400;
        font-size: 15px;
        color: #108c58;
        line-height: 21px;
        text-align: left;
        font-style: normal;
        text-transform: none;
        text-decoration: none;
        display: inline-block;

        &:hover {
          opacity: 0.8;
        }
      }
    }

    .quantity-section {
      display: flex;
      align-items: center;
      margin-bottom: 20px;

      .quantity-title {
        font-size: 14px;
        color: #666;
        flex-shrink: 0;
        width: 80px;
        margin-bottom: 0;
      }

      .quantity-content {
        flex: 1;
      }

      :deep(.el-input-number) {
        width: 120px;
      }
    }

    .action-buttons {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      gap: 15px;
      padding-top: 15px;

      .btn {
        width: 160px;
        height: 50px;
        border-radius: 2px;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s;
        padding: 0;
      }

      .btn-compare {
        background: white;
        border: 1px solid #ddd;
        color: #666;

        &:hover {
          border-color: #4caf50;
          color: #4caf50;
        }
      }

      .btn-favorite {
        background: rgba(16, 140, 88, 0.1);
        border: 1px solid #108c58;
        color: #108c58;

        &:hover {
          background: rgba(16, 140, 88, 0.15);
          border-color: #108c58;
        }
      }

      .btn-buy {
        background: #108c58;
        color: white;
        border: 1px solid #108c58;

        &:hover {
          background: #0e7a4a;
          border-color: #0e7a4a;
        }
      }
    }
  }

  // 自定义电话弹窗样式（teleport 到 body，需要全局选择器）
  :global(.phone-dialog-overlay) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.45);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global(.phone-dialog) {
    width: 420px;
    background: #fff;
    border-radius: 6px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  :global(.phone-dialog__header) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 18px;
    border-bottom: 1px solid #ebeef5;
  }
  :global(.phone-dialog__title) {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
  :global(.phone-dialog__close) {
    font-size: 20px;
    color: #909399;
    cursor: pointer;
    line-height: 1;
    user-select: none;
    padding: 2px 6px;
    border-radius: 4px;
    transition:
      background 0.2s,
      color 0.2s;
  }
  :global(.phone-dialog__close:hover) {
    background: #f5f7fa;
    color: #606266;
  }
  :global(.phone-dialog__body) {
    padding: 18px;
  }
  :global(.phone-dialog__number) {
    text-align: center;
    font-size: 22px;
    color: #108c58;
    font-weight: 600;
    letter-spacing: 1px;
  }
  :global(.phone-dialog__no-number) {
    text-align: center;
    color: #909399;
    font-size: 14px;
  }

  // （举报弹窗样式改用 Element Plus，自定义样式移除）
  .similar-goods-section {
    background: white;
    padding: 20px;
    margin-bottom: 20px;

    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 20px;
      color: #000;
    }

    .similar-goods-list {
      display: flex;
      gap: 15px;
      overflow-x: auto;

      .similar-goods-item {
        flex-shrink: 0;
        width: 250px;

        :deep(.goods-image) {
          height: 200px;
          object-fit: cover;
        }

        :deep(.goods-item) {
          border: 2px solid transparent;
          transition:
            border-color 0.3s,
            box-shadow 0.3s;

          &:hover {
            border-color: #ffd700;
            box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
          }
        }
      }
    }
  }

  .detail-section {
    margin-top: 20px;

    .info-recommend-wrapper {
      background: white;
      padding: 20px;
      margin-bottom: 20px;
      display: flex;
      gap: 20px;
    }

    .product-info {
      flex: 0 0 70%;
      padding: 0;
      margin-bottom: 0;

      .section-title {
        font-size: 24px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }

      .goods-detail-content {
        line-height: 1.8;
        color: #333;
        font-size: 14px;
        word-wrap: break-word;
        overflow-wrap: break-word;

        .detail-text {
          margin: 10px 0;
          line-height: 1.8;

          :deep(p) {
            margin: 10px 0;
            line-height: 1.8;
          }

          :deep(em) {
            font-style: italic;
          }

          :deep(span) {
            display: inline;
          }

          :deep(div) {
            margin: 10px 0;
          }
        }

        .detail-image {
          width: 100%;
          max-width: 100%;
          margin: 15px 0;
          border-radius: 4px;
          cursor: pointer;

          :deep(.el-image__inner) {
            width: 100%;
            height: auto;
            object-fit: contain;
          }
        }

        // 第一张图片（大图）样式
        .detail-image-large {
          margin-bottom: 20px;
          margin-top: 0;
        }

        // 图片网格布局（用于展示剩余的小图）
        .detail-images-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
          margin-top: 20px;

          .detail-image {
            margin: 0;
          }
        }

        .empty-detail {
          color: #999;
          text-align: center;
          padding: 40px 0;
        }
      }
    }

    .hot-recommendations {
      flex: 0 0 30%;
      padding: 0;

      .section-title {
        font-size: 20px;
        font-weight: bold;
        color: #333;
        margin-bottom: 15px;
      }

      .recommendation-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .hot-goods-item {
        width: 100%;
        min-width: auto;
      }
    }
  }
}
</style>
