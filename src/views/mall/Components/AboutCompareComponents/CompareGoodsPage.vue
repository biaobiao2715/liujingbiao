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
          <div class="filter-checkbox" :class="{ 'is-checked': filterState.sortType === '最新' }" @click="toggleSortType">
            <span>最新</span>
          </div>
          <div class="price-filter-group">
            <span class="price-label">价格</span>
            <div class="price-input-group">
              <el-input-number
                v-model="queryParams.minPrice"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="最低价格"
                class="price-input"
                @keyup.enter="handleSearch"
                @change="handleMinPriceChange"
              />
              <span class="price-separator">-</span>
              <el-input-number
                v-model="queryParams.maxPrice"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="最高价格"
                class="price-input"
                @keyup.enter="handleSearch"
                @change="handleMaxPriceChange"
              />
            </div>
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
        </div>

        <div v-loading="loading" class="goods-content-wrapper">
          <div v-if="goodsData.length > 0" class="goods-grid">
            <div
              v-for="item in goodsData"
              :key="item.id"
              class="goods-card"
              :class="{ 'in-compare': isInCompare(item.id) }"
              @click="toggleCompare(item)"
            >
              <!-- 鼠标悬停遮罩层 -->
              <div class="hover-overlay">
                <el-checkbox :model-value="isInCompare(item.id)" @change="() => toggleCompare(item)" @click.stop> </el-checkbox>
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
        <pagination
          v-show="total > 0"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="fetchGoodsList"
        />
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
          <el-button type="success" class="start-compare-btn" :disabled="compareGoodsList.length < 2" @click="startCompare"> 开始对比 </el-button>
          <el-link type="primary" class="clear-link" :disabled="compareGoodsList.length === 0" @click="clearCompare"> 清空对比栏 </el-link>
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

const goodsIdFromRoute = computed(() => {
  if (props.goodsId) {
    return String(props.goodsId);
  }
  return route.query.id ? String(route.query.id) : undefined;
});

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

const filterState = reactive({
  region: '全国',
  sortType: ''
});

const regionValue = ref<string[]>([]);

const queryParams = reactive({
  sortManner: '0', // 默认传0（对比列表）
  provinceCode: undefined as string | undefined,
  cityCode: undefined as string | undefined,
  districtCode: undefined as string | undefined,
  minPrice: undefined as number | undefined,
  maxPrice: undefined as number | undefined,
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
    filterState.region = path && path.length > 0 ? '选择地区' : '全国';
    queryParams.pageNum = 1;
    fetchGoodsList();
  } else {
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
    queryParams.sortManner = '0';
  } else {
    filterState.sortType = '最新';
    queryParams.sortManner = '1';
  }
  queryParams.pageNum = 1;
  fetchGoodsList();
};

// 处理最低价变化，允许清空
const handleMinPriceChange = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    queryParams.minPrice = undefined;
  } else if (value < 0) {
    // 如果输入负数，清空输入框
    queryParams.minPrice = undefined;
  }
};

// 处理最高价变化，允许清空
const handleMaxPriceChange = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    queryParams.maxPrice = undefined;
  } else if (value < 0) {
    // 如果输入负数，清空输入框
    queryParams.maxPrice = undefined;
  }
};

// 点击搜索或回车提交价格筛选
const handleSearch = () => {
  // 验证价格不能为负数（只有当值不为空时才验证）
  if (queryParams.minPrice !== undefined && queryParams.minPrice !== null && queryParams.minPrice < 0) {
    ElMessage.error('价格不能为负数');
    return;
  }
  if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== null && queryParams.maxPrice < 0) {
    ElMessage.error('价格不能为负数');
    return;
  }
  // 验证最高价不能小于最低价（只有当两个值都不为空时才验证）
  if (
    queryParams.minPrice !== undefined &&
    queryParams.minPrice !== null &&
    queryParams.maxPrice !== undefined &&
    queryParams.maxPrice !== null &&
    queryParams.minPrice > queryParams.maxPrice
  ) {
    ElMessage.error('最高价不能小于最低价');
    return;
  }
  queryParams.pageNum = 1;
  fetchGoodsList();
};

const formatSales = (sales?: number) => {
  if (!sales) return '0';
  if (sales >= 1000) {
    return `${(sales / 1000).toFixed(1)}K+`;
  }
  return `${sales}+`;
};

const getPrice = (goods: Goods) => {
  if (goods.hnGoodsSpecificationDataList && goods.hnGoodsSpecificationDataList.length > 0) {
    return goods.hnGoodsSpecificationDataList[0].goodsPrice || '0';
  }
  return '0';
};

const isInCompare = (goodsId?: number) => {
  if (!goodsId) return false;
  return compareGoodsList.value.some((item) => item.id === goodsId);
};

const toggleCompare = (goods: Goods) => {
  const index = compareGoodsList.value.findIndex((item) => item.id === goods.id);

  if (index > -1) {
    // 如果是对比框中的唯一商品，不允许移除
    if (compareGoodsList.value.length === 1) {
      ElMessage.warning('至少需要保留1个商品在对比框中');
      return;
    }
    compareGoodsList.value.splice(index, 1);
  } else {
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

const removeGoods = (index: number) => {
  if (compareGoodsList.value.length === 1) {
    ElMessage.warning('至少需要保留1个商品在对比框中');
    return;
  }
  compareGoodsList.value.splice(index, 1);
  saveToLocalStorage();
};

const clearCompare = () => {
  // 如果是从商品详情页跳转过来的，保留当前商品
  if (currentGoods.value && currentGoods.value.id) {
    const price = getPrice(currentGoods.value);
    compareGoodsList.value = [
      {
        ...currentGoods.value,
        price: price.toString(),
        location: currentGoods.value.hnBaseEnterpriseInfo?.province
      }
    ];
  } else {
    compareGoodsList.value = [];
  }
  saveToLocalStorage();
};

// 开始对比
const startCompare = async () => {
  if (compareGoodsList.value.length < 2) {
    ElMessage.warning('至少需要选择2个商品进行对比');
    return;
  }

  try {
    const params: any = {};

    // 使用对比框中的第一个商品作为主商品
    const mainGoods = compareGoodsList.value[0];
    if (mainGoods && mainGoods.id) {
      params.id = String(mainGoods.id);
    } else {
      ElMessage.warning('缺少主商品信息，无法进行对比');
      return;
    }

    // 其他商品作为对比商品（排除第一个）
    const compareIds = compareGoodsList.value
      .slice(1) // 跳过第一个商品（主商品）
      .map((item) => item.id)
      .filter((id) => id !== undefined && id !== null)
      .map((id) => String(id));

    if (compareIds.length === 0) {
      ElMessage.warning('请至少选择2个商品进行对比');
      return;
    }

    params.comparePricesGoodsIds = compareIds;

    const res = await comparePrices(params);

    if (res && res.code === 200) {
      saveToLocalStorage();
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
    ElMessage.error('获取比价数据失败');
  }
};

// 保存到本地存储
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('compareGoodsList', JSON.stringify(compareGoodsList.value));
  } catch (error) {
    // 忽略存储错误
  }
};

// 获取当前商品详情
const fetchCurrentGoods = async () => {
  if (!goodsIdFromRoute.value) return;

  try {
    const res = await goodsDetail(goodsIdFromRoute.value);
    if (res && res.code === 200 && res.data) {
      currentGoods.value = res.data;

      // 自动将当前商品添加到对比框（如果还没有添加）
      const exists = compareGoodsList.value.some((item) => item.id === res.data.id);
      if (!exists) {
        const price = getPrice(res.data);
        compareGoodsList.value.unshift({
          ...res.data,
          price: price.toString(),
          location: res.data.hnBaseEnterpriseInfo?.province
        });
        saveToLocalStorage();
      }
    }
  } catch (error) {
    // 忽略错误
  }
};

// 获取商品列表
const fetchGoodsList = async () => {
  loading.value = true;
  try {
    const params: any = {
      pageNum: queryParams.pageNum,
      pageSize: queryParams.pageSize
    };

    if (goodsIdFromRoute.value) {
      params.id = goodsIdFromRoute.value;
    }

    if (filterState.region === '选择地区' && queryParams.provinceCode) {
      params.provinceCode = queryParams.provinceCode;
      if (queryParams.cityCode) {
        params.cityCode = queryParams.cityCode;
      }
      if (queryParams.districtCode) {
        params.districtCode = queryParams.districtCode;
      }
    }

    params.sortManner = queryParams.sortManner || '0';

    // 价格区间：undefined/null 不传递，0 值保持为 0
    if (queryParams.minPrice !== undefined && queryParams.minPrice !== null) {
      params.minPrice = queryParams.minPrice;
    }
    if (queryParams.maxPrice !== undefined && queryParams.maxPrice !== null) {
      params.maxPrice = queryParams.maxPrice;
    }

    const response = await goodsCompareList(params);
    if (response.code === 200) {
      const records = response.rows || [];
      goodsData.value = records;
      total.value = response.total || 0;
    }
  } catch (error) {
    ElMessage.error('获取商品列表失败');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // 如果从商品详情页跳转过来，先清空对比框，然后加载当前商品（会自动添加）
  // 如果不是从商品详情页跳转，尝试从本地存储恢复
  if (goodsIdFromRoute.value) {
    compareGoodsList.value = [];
    saveToLocalStorage();
    await fetchCurrentGoods();
  } else {
    // 尝试从本地存储恢复对比列表
    try {
      const stored = localStorage.getItem('compareGoodsList');
      if (stored) {
        compareGoodsList.value = JSON.parse(stored);
      }
    } catch (error) {
      // 忽略解析错误
    }
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
      padding: 16px 0;
      background: #f8f8f8;
      border-radius: 4px;
      flex-wrap: wrap;

      .region-filter-wrapper {
        .region-select {
          width: 200px;

          :deep(.el-input__wrapper) {
            background: #ffffff;
            border-radius: 8px;
            border: 1px solid #ebebeb;
            box-shadow: none;
            height: 36px;
            padding: 0 12px;

            &:hover {
              border-color: #108c58;
            }

            &.is-focus {
              border-color: #108c58;
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
        background: #ffffff;
        border-radius: 8px;
        border: 1px solid #ebebeb;
        font-size: 14px;
        color: #303133;
        cursor: pointer;
        transition: all 0.3s;
        user-select: none;

        &.is-checked {
          border: 1px solid #108c58;
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
          padding: 0px 12px;
          border: 1px solid #e0e0e0;
          min-width: 280px;

          .price-input {
            flex: 1;
            min-width: 0;
            width: 100%;

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

            :deep(.el-input-number) {
              width: 100%;
            }
          }

          .price-separator {
            color: #909399;
            font-size: 14px;
            flex-shrink: 0;
          }
        }

        .search-btn {
          height: 32px;
          padding: 0 16px;
          margin-left: 8px;
          background: #108c58;
          color: #fff;
          border: 1px solid #108c58;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            background: #0e7a4a;
            border-color: #0e7a4a;
          }

          &:active {
            transform: translateY(1px);
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
                background: #108c58;
                border-radius: 4px;
                border: 4px solid #108c58;
                border-color: #108c58;
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
                background-color: #108c58;
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

          .hover-overlay {
            opacity: 1 !important;
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
      }
    }
  }

  // 右侧对比框
  .compare-box {
    position: absolute;
    right: 0;
    top: 68px;
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
