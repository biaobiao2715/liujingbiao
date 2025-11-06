<template>
  <div class="compare-goods-page">
    <!-- 对比商品选择页 -->
    <div class="page-content">
      <!-- 左侧：商品列表 -->
      <div class="goods-list-section">
        <!-- 筛选/排序区域 -->
        <div class="filter-section">
          <div class="region-filter-wrapper">
            <RegionSelect 
              v-model="regionValue"
              @regionChange="handleAreaChange"
              placeholder="全国"
              class="region-select"
              :show-all-levels="false"
              clearable
            />
          </div>
          <div 
            class="filter-checkbox" 
            :class="{ 'is-checked': filterState.sortType === '最新' }"
            @click="toggleSortType"
          >
            <span>最新</span>
          </div>
          <div class="price-filter-group">
            <span class="price-label">价格</span>
            <div class="price-input-group">
              <el-input
                v-model="queryParams.minPrice"
                placeholder="最低价格"
                class="price-input"
                @blur="handleFilterChange"
              />
              <span class="price-separator">-</span>
              <el-input
                v-model="queryParams.maxPrice"
                placeholder="最高价格"
                class="price-input"
                @blur="handleFilterChange"
              />
            </div>
          </div>
        </div>

        <div v-loading="loading" class="goods-content-wrapper">
          <div v-if="goodsData.length > 0" class="goods-grid">
            <div v-for="item in goodsData" :key="item.id" class="goods-card"
              :class="{ 'in-compare': isInCompare(item.id) }"
              @click="toggleCompare(item)">

              <!-- 鼠标悬停遮罩层 -->
              <div class="hover-overlay">
                <el-checkbox 
                  :model-value="isInCompare(item.id)"
                  @change="() => toggleCompare(item)"
                  @click.stop
                >
                </el-checkbox>
                <span class="overlay-text">加入对比</span>
              </div>

              <el-image :src="item.sysOssLists?.[0]?.url" fit="cover" class="goods-image" />
              <div class="goods-info">
                <div class="price-row">
                  <span class="price">¥{{ getPrice(item) }}元/袋</span>
                  <span class="sales">销量{{ formatSales(item.goodsSales) }}</span>
                </div>
                <div class="goods-name">{{ item.goodsName }}</div>
                <div class="tags-row">
                  <el-tag v-for="tag in item.goodssEnsureName" :key="tag" size="small" class="tag-item">
                    {{ tag }}
                  </el-tag>
                  <span class="location">{{ item.hnBaseEnterpriseInfo?.province }}</span>
                </div>
              </div>

            </div>
          </div>
          <div v-else class="empty-state-wrapper">
            <el-empty description="暂无商品数据" :image-size="120" />
          </div>
        </div>

        <!-- 分页 -->
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
          :total="total" @pagination="fetchGoodsList" />
      </div>

      <!-- 右侧：对比框 -->
      <div class="compare-box">
        <div class="box-header">
          <span class="box-title">对比框【{{ compareGoodsList.length }}/5】</span>
        </div>

        <div class="compare-list">
          <div v-for="(item, index) in compareGoodsList" :key="item.id || index" class="compare-item">
            <el-icon class="close-btn" @click="removeGoods(index)">
              <Close />
            </el-icon>
            <el-image :src="item.image || item.sysOssLists?.[0]?.url" fit="cover" class="item-image" />
            <div class="item-info">
              <div class="item-price">¥{{ item.price || getPrice(item) }}元/袋</div>
              <div class="item-sales">销量{{ formatSales(item.goodsSales) }}</div>
              <div class="item-name">{{ item.goodsName }}</div>
              <div class="item-location">{{ item.location || item.hnBaseEnterpriseInfo?.province }}</div>
            </div>
          </div>

          <el-empty v-if="compareGoodsList.length === 0" description="暂无对比商品" :image-size="80" />
        </div>

        <div class="box-actions">
          <el-button type="success" class="start-compare-btn" :disabled="compareGoodsList.length < 1"
            @click="startCompare">
            开始对比
          </el-button>
          <el-link type="primary" class="clear-link" :disabled="compareGoodsList.length === 0" @click="clearCompare">
            清空对比栏
          </el-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Close } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';
import { goodsCompareList, goodsDetail, comparePrices } from '@/api/mall/goods/index';
import RegionSelect from '@/components/RegionSelect/index.vue';
import type { Goods } from '../../mall';

const route = useRoute();
const router = useRouter();

const props = defineProps<{
  goodsId?: number | string;
}>();

// 从路由或props获取商品id
const goodsIdFromRoute = computed(() => {
  if (props.goodsId) {
    return String(props.goodsId);
  }
  // 保持 id 为字符串类型，因为后端返回的是字符串
  return route.query.id ? String(route.query.id) : undefined;
});

// 当前商品（基准商品，不显示在对比框中）
const currentGoods = ref<Goods | null>(null);

interface CompareGoodsItem extends Partial<Goods> {
  image?: string;
  price?: string;
  location?: string;
}

const loading = ref(false);
const goodsData = ref<Goods[]>([]);
const compareGoodsList = ref<CompareGoodsItem[]>([]);
const total = ref(0);

// 筛选状态
const filterState = reactive({
  region: '全国',
  sortType: '' // 空字符串表示未选中，"最新"表示选中
});

// 地区选择
const regionValue = ref<string[]>([]);

const queryParams = reactive({
  id: undefined as number | undefined,
  goodsCategoryId: [] as string[],
  goodsName: undefined,
  goodsBrandName: undefined,
  goodsAbilityName: undefined,
  sortManner: undefined,
  provinceCode: undefined as string | undefined,
  cityCode: undefined as string | undefined,
  districtCode: undefined as string | undefined,
  minPrice: undefined as string | undefined,
  maxPrice: undefined as string | undefined,
  pageNum: 1,
  pageSize: 12
});

// 处理地址选择变化
const handleAreaChange = (val: any) => {
  if (val && val.regionPath) {
    const path = Array.isArray(val.regionPath[0]) ? val.regionPath[0] : val.regionPath;
    regionValue.value = path;
    queryParams.provinceCode = val.provinceCode || undefined;
    queryParams.cityCode = val.cityCode || undefined;
    queryParams.districtCode = val.regionCode || undefined;
    // 更新状态为选择地区
    if (path && path.length > 0) {
      filterState.region = '选择地区';
    } else {
      filterState.region = '全国';
    }
    queryParams.pageNum = 1;
    fetchGoodsList();
  } else {
    // 清空时重置为全国
    regionValue.value = [];
    queryParams.provinceCode = undefined;
    queryParams.cityCode = undefined;
    queryParams.districtCode = undefined;
    filterState.region = '全国';
    queryParams.pageNum = 1;
    fetchGoodsList();
  }
};

// 切换排序类型
const toggleSortType = () => {
  if (filterState.sortType === '最新') {
    filterState.sortType = '';
    queryParams.sortManner = undefined;
  } else {
    filterState.sortType = '最新';
    queryParams.sortManner = '1';
  }
  queryParams.pageNum = 1;
  fetchGoodsList();
};


// 处理筛选变化（价格输入）
const handleFilterChange = () => {
  queryParams.pageNum = 1;
  fetchGoodsList();
};

// 格式化销量
const formatSales = (sales?: number) => {
  if (!sales) return '0';
  if (sales >= 1000) {
    return `${(sales / 1000).toFixed(1)}K+`;
  }
  return `${sales}+`;
};

// 获取价格
const getPrice = (goods: Goods) => {
  if (goods.hnGoodsSpecificationDataList && goods.hnGoodsSpecificationDataList.length > 0) {
    return goods.hnGoodsSpecificationDataList[0].goodsPrice || '0';
  }
  return '0';
};

// 检查商品是否在对比列表中（排除当前商品）
const isInCompare = (goodsId?: number) => {
  if (!goodsId) return false;
  // 如果是当前商品，不显示为已选中
  if (currentGoods.value && currentGoods.value.id === goodsId) {
    return false;
  }
  return compareGoodsList.value.some(item => item.id === goodsId);
};

// 切换对比状态
const toggleCompare = (goods: Goods) => {
  // 如果是当前商品，不允许添加到对比列表
  if (currentGoods.value && currentGoods.value.id === goods.id) {
    ElMessage.info('当前商品已作为基准商品，无需添加到对比列表');
    return;
  }

  const index = compareGoodsList.value.findIndex(item => item.id === goods.id);

  if (index > -1) {
    // 已存在，移除
    compareGoodsList.value.splice(index, 1);
  } else {
    // 不存在，添加
    if (compareGoodsList.value.length >= 5) {
      ElMessage.warning('最多只能对比5个商品');
      return;
    }

    const price = getPrice(goods);
    compareGoodsList.value.push({
      ...goods,
      price: price.toString(),
      location: goods.hnBaseEnterpriseInfo?.province
    });
  }

  saveToLocalStorage();
};

// 移除商品
const removeGoods = (index: number) => {
  compareGoodsList.value.splice(index, 1);
  saveToLocalStorage();
};

// 清空对比
const clearCompare = () => {
  compareGoodsList.value = [];
  saveToLocalStorage();
};

// 开始对比
const startCompare = async () => {
  // 需要至少1个对比商品（当前商品 + 至少1个对比商品）
  if (compareGoodsList.value.length < 1) {
    ElMessage.warning('至少需要选择1个商品进行对比');
    return;
  }

  try {
    // 构建请求参数
    const params: any = {};
    
    // 如果有当前商品，传递主商品id（必须传递，后端需要根据id获取商品信息）
    if (currentGoods.value && currentGoods.value.id) {
      params.id = String(currentGoods.value.id);
    } else if (goodsIdFromRoute.value) {
      // 如果没有currentGoods但有路由中的id，也传递
      params.id = String(goodsIdFromRoute.value);
    } else {
      ElMessage.warning('缺少主商品信息，无法进行对比');
      return;
    }
    
    // 传递比价商品id集合（对比商品的id，字符串数组）
    const compareIds = compareGoodsList.value
      .map(item => item.id)
      .filter((id) => id !== undefined && id !== null)
      .map(id => String(id));
    
    console.log('comparePricesGoodsIds 数组:', compareIds);
    console.log('comparePricesGoodsIds 数组长度:', compareIds.length);
    console.log('comparePricesGoodsIds 数组类型:', typeof compareIds, Array.isArray(compareIds));
    
    if (compareIds.length === 0) {
      ElMessage.warning('请至少选择一个商品进行对比');
      return;
    }
    
    params.comparePricesGoodsIds = compareIds;
    
    // 调用比价API
    console.log('比价请求参数:', params);
    console.log('params.comparePricesGoodsIds:', params.comparePricesGoodsIds);
    const res = await comparePrices(params);
    console.log('比价响应结果:', res);
    
    if (res && res.code === 200) {
      // 保存并跳转到对比详情页
      saveToLocalStorage();
      // 跳转到对比详情页，传递商品列表数据
      router.push({
        path: '/mall/compare-detail',
        query: {
          id: params.id,
          compareIds: compareIds.join(',')
        }
      });
    } else {
      ElMessage.error(res?.msg || '获取比价数据失败');
    }
  } catch (error) {
    console.error('获取比价数据失败:', error);
    ElMessage.error('获取比价数据失败');
  }
};

// 保存到本地存储
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('compareGoodsList', JSON.stringify(compareGoodsList.value));
  } catch (error) {
    console.error('保存比价商品列表失败:', error);
  }
};

// 从本地存储加载
const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('compareGoodsList');
    if (saved) {
      compareGoodsList.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载比价商品列表失败:', error);
  }
};

// 获取当前商品详情
const fetchCurrentGoods = async () => {
  if (!goodsIdFromRoute.value) return;
  
  try {
    console.log('获取当前商品详情，id:', goodsIdFromRoute.value);
    const res = await goodsDetail(goodsIdFromRoute.value);
    console.log('当前商品详情响应:', res);
    if (res && res.code === 200 && res.data) {
      currentGoods.value = res.data;
      console.log('当前商品详情设置成功:', currentGoods.value);
    } else {
      console.error('获取当前商品详情失败，响应:', res);
    }
  } catch (error) {
    console.error('获取当前商品详情失败:', error);
  }
};

// 获取商品列表
const fetchGoodsList = async () => {
  loading.value = true;
  try {
    // 构建请求参数，只传递有值的参数
    const params: any = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    };

    // 如果有商品id，传递id（用于筛选同类商品，但不包含当前商品本身）
    if (goodsIdFromRoute.value) {
      params.id = goodsIdFromRoute.value;
    }

    // 如果有地区选择，传递地区编码
    if (filterState.region === '选择地区' && queryParams.provinceCode) {
      params.provinceCode = queryParams.provinceCode;
      if (queryParams.cityCode) {
        params.cityCode = queryParams.cityCode;
      }
      if (queryParams.districtCode) {
        params.districtCode = queryParams.districtCode;
      }
    }

    // 传递排序方式
    if (queryParams.sortManner) {
      params.sortManner = queryParams.sortManner;
    }

    // 传递价格范围
    if (queryParams.minPrice) {
      params.minPrice = queryParams.minPrice;
    }
    if (queryParams.maxPrice) {
      params.maxPrice = queryParams.maxPrice;
    }

    const response = await goodsCompareList(params);
    if (response.code === 200) {
      let records = response.rows || [];
      
      // 如果有当前商品，从列表中排除当前商品
      if (currentGoods.value && currentGoods.value.id) {
        records = records.filter(item => item.id !== currentGoods.value!.id);
      }
      
      goodsData.value = records;
      total.value = response.total || 0;
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};


onMounted(() => {
  // 清空本地存储的对比列表，确保每次进入都是空列表
  compareGoodsList.value = [];
  saveToLocalStorage();
  
  // 如果有商品id，获取当前商品详情（仅用于作为基准商品，不添加到对比列表）
  if (goodsIdFromRoute.value) {
    fetchCurrentGoods();
  }
  fetchGoodsList();
});
</script>

<style lang="scss" scoped>
.compare-goods-page {
  padding: 20px;
  background: #f5f7fa;
  position: relative;

  .page-content {
    max-width: 1400px;
    position: relative;
    margin: 0 auto;
  }

  // 左侧商品列表
    .goods-list-section {
      margin-right: 320px;
      display: flex;
      flex-direction: column;
      min-height: calc(100vh - 100px);

    .filter-section {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f8f8f8;
      border-radius: 4px;
      flex-wrap: wrap;

      .region-filter-wrapper {
        .region-select {
          width: 200px;
          
          :deep(.el-input__wrapper) {
            background: #FFFFFF;
            border-radius: 8px;
            border: 1px solid #EBEBEB;
            box-shadow: none;
            height: 36px;
            padding: 0 12px;
            
            &:hover {
              border-color: #108C58;
            }
            
            &.is-focus {
              border-color: #108C58;
            }
          }
          
          :deep(.el-input__inner) {
            font-size: 14px;
            color: #303133;
          }
        }
      }

      .filter-checkbox {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 62px;
        height: 36px;
        background: #FFFFFF;
        border-radius: 8px;
        border: 1px solid #EBEBEB;
        font-size: 14px;
        color: #303133;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;

        &.is-checked {
          border: 1px solid #108C58;
        }

        &:hover {
          opacity: 0.8;
        }
      }

      .price-filter-group {
        display: flex;
        align-items: center;
        gap: 8px;

        .price-label {
          font-size: 14px;
          color: #303133;
          white-space: nowrap;
        }

        .price-input-group {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fff;
        border-radius: 4px;
        padding: 8px 12px;
        border: 1px solid #e0e0e0;
        min-width: 280px;

        .price-input {
          flex: 1;
          min-width: 0;

          :deep(.el-input__wrapper) {
            box-shadow: none;
            border: none;
            padding: 0;
            background: transparent;
          }

          :deep(.el-input__inner) {
            &::placeholder {
              color: #c0c4cc;
            }
          }
        }

          .price-separator {
            color: #909399;
            font-size: 14px;
            flex-shrink: 0;
          }
        }
      }
    }

      .goods-content-wrapper {
        flex: 1;
        background: #fff;
        border-radius: 4px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        min-height: 400px;
      }

      .empty-state-wrapper {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
      }

      .goods-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        margin-bottom: 20px;

      .goods-card {
        position: relative;
        background: #fff;
        border-radius: 4px;
        padding: 0;
        transition: all 0.3s;
        border: 1px solid #ebeef5;
        overflow: hidden;
        cursor: pointer;
        box-sizing: border-box;

        &:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

          &:not(.in-compare) .hover-overlay {
            opacity: 1;
          }
        }

        .hover-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 50px;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          z-index: 20;
          opacity: 0;
          transition: opacity 0.3s;

          :deep(.el-checkbox) {
            margin: 0;
            pointer-events: auto;

            .el-checkbox__label {
              color: #fff;
              font-size: 14px;
            }

            .el-checkbox__input {
              .el-checkbox__inner {
                width: 18px;
                height: 18px;
                background: #108C58;
                border-radius: 4px;
                border: 4px solid #108C58;
                border-color: #108C58;
                position: relative;
                display: none;

                &::after {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  width: 4px;
                  height: 7px;
                  border: 2px solid #fff;
                  border-top: 0;
                  border-left: 0;
                  transform-origin: center;
                  transform: translate(-50%, -50%) rotate(45deg) translate(1px, -1px);
                  box-sizing: content-box;
                }
              }

              &.is-checked .el-checkbox__inner {
                background-color: #108C58;
                border: none;
                display: block;

                &::after {
                  display: block;
                }
              }
            }
          }

          .overlay-text {
            color: #fff;
            font-size: 14px;
          }
        }

        &.in-compare {
          border: 1px solid transparent;

          .compare-badge {
            display: flex;
          }

          .hover-overlay {
            opacity: 1 !important;
          }
        }

        .compare-badge {
          display: none;
          position: absolute;
          top: 0;
          left: 0;
          background: #67c23a;
          color: #fff;
          padding: 6px 12px;
          font-size: 13px;
          z-index: 10;
          align-items: center;
          gap: 4px;
          border-radius: 0 0 8px 0;
          font-weight: 500;

          .check-icon {
            font-weight: bold;
            font-size: 14px;
            margin-right: 2px;
          }
        }

        .goods-image {
          width: 100%;
          height: 200px;
          margin-bottom: 0;

          :deep(img) {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }

        .goods-info {
          padding: 12px;

          .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .price {
              font-size: 16px;
              font-weight: bold;
              color: #f56c6c;
            }

            .sales {
              font-size: 12px;
              color: #909399;
            }
          }

          .goods-name {
            font-size: 14px;
            color: #303133;
            margin-bottom: 10px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            line-height: 1.4;
          }

          .tags-row {
            display: flex;
            align-items: center;
            gap: 6px;
            flex-wrap: wrap;
            margin-bottom: 12px;

            .tag-item {
              margin: 0;
              font-size: 11px;
              padding: 2px 6px;
              border-radius: 2px;
            }

            .location {
              font-size: 12px;
              color: #909399;
              margin-left: auto;
            }
          }
        }

        .add-compare-btn {
          width: calc(100% - 24px);
          margin: 0 12px 12px;
          border-radius: 4px;

          &:not(.is-disabled) {
            background-color: #409eff;
            border-color: #409eff;
          }
        }
      }
    }
  }


  // 右侧对比框
  .compare-box {
    position: absolute;
    right: 0;
    top: 0;
    width: 300px;
    background: #fff;
    border-radius: 4px;
    padding: 16px;
    height: fit-content;
    max-height: calc(100vh - 40px);
    display: flex;
    flex-direction: column;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    z-index: 10;

    .box-header {
      padding-bottom: 12px;
      border-bottom: 1px solid #ebeef5;
      margin-bottom: 12px;

      .box-title {
        font-size: 16px;
        font-weight: bold;
        color: #303133;
      }
    }

    .compare-list {
      flex: 1;
      overflow-y: auto;
      margin-bottom: 16px;
      min-height: 200px;

      .compare-item {
        position: relative;
        padding: 12px;
        border: 1px solid #ebeef5;
        border-radius: 4px;
        margin-bottom: 12px;
        display: flex;
        gap: 12px;
        background: #fafafa;

        .close-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
          color: #909399;
          font-size: 18px;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s;

          &:hover {
            color: #f56c6c;
            background: #fee;
          }
        }

        .item-image {
          width: 90px;
          height: 90px;
          border-radius: 4px;
          flex-shrink: 0;
          object-fit: cover;
        }

        .item-info {
          flex: 1;
          min-width: 0;

          .item-price {
            font-size: 16px;
            font-weight: bold;
            color: #f56c6c;
            margin-bottom: 4px;
          }

          .item-sales {
            font-size: 12px;
            color: #909399;
            margin-bottom: 6px;
          }

          .item-name {
            font-size: 13px;
            color: #303133;
            margin-bottom: 4px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            line-height: 1.4;
          }

          .item-location {
            font-size: 12px;
            color: #909399;
            margin-top: 4px;
          }
        }
      }
    }

    .box-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 16px;
      border-top: 1px solid #ebeef5;

      .start-compare-btn {
        width: 100%;
        height: 40px;
        font-size: 15px;
      }

      .clear-link {
        text-align: center;
        display: block;
        font-size: 13px;
      }
    }
  }
}
</style>
