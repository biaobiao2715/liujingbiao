<template>
  <div class="goods-detail-container">
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
          <!-- 缩略图区域 -->
          <div class="thumbnails-wrapper">
            <button class="thumbnails-btn thumbnails-btn-left" @click="scrollThumbnails('left')">‹</button>
            <div class="thumbnails-container" ref="thumbnailsContainerRef">
              <div class="thumbnails" ref="thumbnailsRef">
                <el-image v-for="(img, index) in goods?.sysOssLists" :key="index" :src="img.url" fit="cover"
                  class="thumbnail" :class="{ active: baseInfo.currentImage === img.url }"
                  @click="baseInfo.currentImage = img.url" />
              </div>
            </div>
            <button class="thumbnails-btn thumbnails-btn-right" @click="scrollThumbnails('right')">›</button>
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
                <el-tag v-for="tag in goods?.goodssEnsureName" :key="tag" class="attribute-tag">
                  {{ tag }}
                </el-tag>
                <el-tag v-for="tag in goods?.goodsAbilityName" :key="tag" class="attribute-tag">
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
            <el-select 
              v-model="baseInfo.selectedAddress" 
              placeholder="请选择发货地址"
              class="address-select"
              @change="handleAddressChange"
            >
              <el-option
                v-for="(addr, index) in addressList"
                :key="index"
                :label="addr"
                :value="addr"
              />
            </el-select>
          </div>

          <!-- 规格选择 -->
          <div class="spec-section">
            <div class="spec-title">规格选择</div>
            <div class="spec-grid">
              <div v-for="spec in displayedSpecs" :key="spec.id"
                :class="{ 'spec-item': true, 'selected': baseInfo.currentSpec === spec.id }"
                @click="selectSpec(spec.id)">
                {{ spec.goodsSpecificationValue }}{{ spec.goodsSpecification }}
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

          <!-- 购买数量 -->
          <div class="quantity-section">
            <div class="quantity-title">购买数量</div>
            <el-input-number v-model="baseInfo.quantity" :min="1" @change="updateTotalPrice" />
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
          <GoodsItemComponent v-for="(item, index) in groupedRelatedGoods.flat()" :key="index" :goods="item"
            class="similar-goods-item" />
              </div>
      </div>

      <!-- 详情部分 -->
      <div class="detail-section">
        <div class="info-recommend-wrapper">
          <!-- 商品详情 -->
          <div class="product-info">
            <h2 class="section-title">商品详情</h2>
            <div class="info-images">
              <!-- 第一张大图 -->
              <div v-if="detailImages.length > 0" class="info-image-large"></div>

              <!-- 文本描述 -->
              <div class="info-text">{{ detailText }}</div>

              <!-- 图片行 -->
              <div class="info-image-rows-wrapper">
                <!-- 顶部行：两个大图并排 -->
                <div class="info-image-row info-image-row-top">
                  <div v-if="detailImages.length > 1" class="info-image-large"></div>
                  <div v-if="detailImages.length > 2" class="info-image-large"></div>
                </div>
                <!-- 底部行 -->
                <div class="info-image-row info-image-row-bottom">
                  <div class="info-image-bottom-left">
                    <div v-if="detailImages.length > 3" class="info-image-small"></div>
                  </div>
                  <div class="info-image-bottom-right">
                    <div v-if="detailImages.length > 4" class="info-image-small"></div>
                    <div v-if="detailImages.length > 5" class="info-image-small"></div>
                  </div>
                </div>
              </div>

              <!-- 底部大图 -->
              <div v-if="detailImages.length > 6" class="info-image-large-bottom"></div>

              <!-- 三张网格图 -->
              <div v-if="detailImages.length > 7" class="info-image-grid">
                <div v-for="(img, index) in detailImages.slice(7, 10)" :key="index" class="info-image-item"></div>
              </div>
            </div>
          </div>

          <!-- 热门推荐 -->
          <div class="hot-recommendations">
            <h2 class="section-title">热门推荐</h2>
            <div class="recommendation-list">
              <GoodsItemComponent v-for="(item, index) in hotGoods" :key="index" :goods="item" class="hot-goods-item" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 下单组件 -->
    <PlaceOrderComponent
      v-model="showOrder"
      :goods="goods"
      :selected-spec-id="baseInfo.currentSpec"
      :quantity="baseInfo.quantity"
      @submit="handleOrderSubmit"
    />
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

// 需要经过处理得到的数据
const baseInfo = reactive<{
  currentImage: string; // 当前展示的图片
  totalPrice: string; // 当前总价
  address: string; // 发货地址
  selectedAddress: string; // 选中的发货地址
  currentSpec: number | null; // 当前展示的规格
  quantity: number; // 购买数量,
}>({
  currentImage: '', // 当前展示的图片
  totalPrice: '', // 当前总价
  address: '', // 发货地址
  selectedAddress: '', // 选中的发货地址
  currentSpec: null, // 当前展示的规格
  quantity: 1 // 购买数量,
});

const groupedRelatedGoods = ref([]); // 同类商品

const hotGoods = ref([]); // 最热商品

const addressCollapse = ref(false); // 地址折叠状态

// 地址列表
const addressList = ref<string[]>([]);

// 规格显示控制
const showAllSpecs = ref(false);
const defaultDisplayCount = 6; // 默认显示6个规格（第一行4个，第二行2个）

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

// 处理地址选择
const handleAddressChange = (value: string) => {
  baseInfo.address = value;
};

// 缩略图滚动相关
const thumbnailsRef = ref<HTMLElement | null>(null);
const thumbnailsContainerRef = ref<HTMLElement | null>(null);
let thumbnailScrollPosition = 0;
const thumbnailScrollStep = 100; // 每次滚动的距离（像素）

// 缩略图滚动
const scrollThumbnails = (direction: 'left' | 'right') => {
  if (!thumbnailsRef.value || !thumbnailsContainerRef.value) return;

  const thumbnailWidth = 90 + 10; // 90px宽度 + 10px间距

  if (direction === 'left') {
    thumbnailScrollPosition = Math.max(0, thumbnailScrollPosition - thumbnailScrollStep);
  } else {
    const maxScroll = Math.max(0, thumbnailsRef.value.scrollWidth - thumbnailsContainerRef.value.offsetWidth);
    thumbnailScrollPosition = Math.min(maxScroll, thumbnailScrollPosition + thumbnailScrollStep);
  }

  if (thumbnailsRef.value) {
    thumbnailsRef.value.style.transform = `translateX(-${thumbnailScrollPosition}px)`;
  }
};

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

    // 打印商品规格信息
    console.log('=== 商品规格信息 ===');
    console.log('商品ID:', goods.value.id);
    console.log('商品名称:', goods.value.goodsName);
    console.log('规格列表:', goods.value.hnGoodsSpecificationDataList);
    if (goods.value.hnGoodsSpecificationDataList && goods.value.hnGoodsSpecificationDataList.length > 0) {
      goods.value.hnGoodsSpecificationDataList.forEach((spec, index) => {
        console.log(`规格 ${index + 1}:`, {
          id: spec.id,
          goodsSpecification: spec.goodsSpecification,
          goodsSpecificationValue: spec.goodsSpecificationValue,
          goodsPrice: spec.goodsPrice,
          fullSpec: `${spec.goodsSpecificationValue}${spec.goodsSpecification}`
        });
      });
    } else {
      console.log('没有规格数据');
    }
    console.log('==================');

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
        const defaultAddress = addressParts.join('');
        baseInfo.address = defaultAddress;
        baseInfo.selectedAddress = defaultAddress;
        
        // 初始化地址列表（可以后续从API获取多个地址）
        // 目前使用默认地址，如果有多个地址可以从API获取
        addressList.value = [defaultAddress];
        
        // 示例：如果有多个地址，可以这样添加
        // if (hnBaseEnterpriseInfo.otherAddresses) {
        //   addressList.value = [defaultAddress, ...hnBaseEnterpriseInfo.otherAddresses];
        // }
      }

      // 生成面包屑导航
      updateBreadcrumb();

      // 商品详情加载成功后，加载相关商品和热门商品
      await Promise.all([
        getRelatedGoods(),
        getHotGoods()
      ]);
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
  // 规格对应的价格（选择规格后，只显示当前规格的价格，不显示区间）
  const spec = goods.value.hnGoodsSpecificationDataList?.find((s) => s.id === baseInfo.currentSpec);
  if (spec) {
    const price = parseFloat(String(spec.goodsPrice || 0));
    // 只显示单价，不显示区间
    baseInfo.totalPrice = price.toFixed(2);
  }
};

// 处理订单提交
const handleOrderSubmit = (orderData: any) => {
  console.log('订单数据:', orderData);
  // TODO: 调用提交订单API
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
            color: #4CAF50;
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

    .main-image {
      width: 100%;
      height: 400px;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 15px;
      position: relative;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
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

      &.active {
        border-color: #4CAF50;
      }

      &:hover {
        border-color: #4CAF50;
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

      &.thumbnails-btn-left {
        left: 0;
        border-radius: 4px 0 0 4px;
      }

      &.thumbnails-btn-right {
        right: 0;
        border-radius: 0 4px 4px 0;
      }

      &:hover {
        background-color: rgba(0, 0, 0, 0.6);
      }

      &:active {
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
            color: #FFA113;
            font-size: 14px;
          }

          &.report-link {
            color: #EF4D0B;
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
        font-size: 28px;
        font-weight: bold;
        color: #e53935;
      }
    }

    .shipping-address {
      font-size: 14px;
      color: #333;
      display: flex;
      align-items: center;
      gap: 8px;

      .label {
        color: #333;
        flex-shrink: 0;
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
    }

    .spec-section {

      .spec-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
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
          border-color: #108C58;
        }

        &.selected {
          background: rgba(16, 140, 88, 0.1);
          border-radius: 0px;
          border: 2px solid #108C58;
          color: #108C58;
          font-weight: 500;

          .spec-check-icon {
            position: absolute;
            bottom: 2px;
            right: 2px;
            font-size: 14px;
            color: #108C58;
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
        color: #108C58;
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
      margin-bottom: 20px;

      .quantity-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
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
          border-color: #4CAF50;
          color: #4CAF50;
        }
      }

      .btn-favorite {
        background: rgba(16, 140, 88, 0.1);
        border: 1px solid #108C58;
        color: #108C58;

        &:hover {
          background: rgba(16, 140, 88, 0.15);
          border-color: #108C58;
        }
      }

      .btn-buy {
        background: #108C58;
        color: white;
        border: 1px solid #108C58;

        &:hover {
          background: #0e7a4a;
          border-color: #0e7a4a;
        }
      }
    }
  }

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

      .info-images {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .info-image-large {
        width: 100%;
        height: 300px;
        background-image: url('https://pic.rmb.bdstatic.com/bjh/events/f3437c51fa126e4cf7169180710117a46023.jpeg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 4px;
      }

      .info-image-large-bottom {
        width: 100%;
        height: 300px;
        background-image: url('https://pic.rmb.bdstatic.com/bjh/events/f3437c51fa126e4cf7169180710117a46023.jpeg');
        background-size: cover;
        background-position: center;
        background-repeat: no-repeat;
        border-radius: 4px;
      }

      .info-text {
        line-height: 1.8;
        color: #666;
        margin-bottom: 20px;
        font-size: 14px;
        background-color: #f0f0f0;
        padding: 10px;
        border-radius: 4px;
      }

      .info-image-rows-wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .info-image-row-top {
        display: flex;
        gap: 10px;

        .info-image-large {
          flex: 1;
          height: 200px;
        }
      }

      .info-image-row-bottom {
        display: flex;
        gap: 10px;
      }

      .info-image-bottom-left {
        flex: 1;

        .info-image-small {
          width: 100%;
          height: 250px;
          background-image: url('https://pic.rmb.bdstatic.com/bjh/events/f3437c51fa126e4cf7169180710117a46023.jpeg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 4px;
        }
      }

      .info-image-bottom-right {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;

        .info-image-small {
          width: 100%;
          height: 120px;
          background-image: url('https://pic.rmb.bdstatic.com/bjh/events/f3437c51fa126e4cf7169180710117a46023.jpeg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 4px;
        }
      }

      .info-image-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;

        .info-image-item {
          width: 100%;
          padding-bottom: 100%;
          position: relative;
          background-image: url('https://pic.rmb.bdstatic.com/bjh/events/f3437c51fa126e4cf7169180710117a46023.jpeg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          border-radius: 4px;
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
