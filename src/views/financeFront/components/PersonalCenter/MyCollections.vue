<!--
  标题: MyCollections.vue
  功能: 个人中心-我的收藏
  说明: 信贷、保险
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-21
-->
<template>
  <div class="my-collections">
    <div class="title flex-center gap-12">
      <img src="../../../../assets/images/finance/collection-icon.png" width="24" />
      <div>我的收藏夹</div>
    </div>
    <div class="tab-list flex-center gap-12">
      <div :class="['item', { 'active': item.value === activeTab }]" v-for="item in tabList" :key="item.value" @click="handleTabClick(item.value)">
        {{ item.label }}
      </div>
    </div>
    <!-- 内容区域 -->
    <div class="content">
      <!-- 信贷 -->
      <el-row :gutter="20" v-show="activeTab === 'credit' && creditProducts.length > 0">
        <el-col :span="8" v-for="product in creditProducts" :key="product.productId">
          <div class="item">
            <span class="tag" v-if="product.creditProductsVersionVo.isTopThreeByViews">热门</span>
            <div class="header">
              <div class="flex-center favorite gap-8">
                <span class="name">{{ product.creditProductsVersionVo.productName }}</span>
                <el-icon size="20" color="#108c58" @click="handleFavorite(product, 'credit')"> <StarFilled /></el-icon>
              </div>
            </div>
            <div class="content-info">
              <div class="limit">
                <div class="flex-center-center money-amount">
                  <div>{{ product.creditProductsVersionVo.maxLoanAmount }}</div>
                  <div>万元</div>
                </div>
                <div class="max-label">最高额度</div>
              </div>
              <!-- 贷款利率和周期 -->
              <div class="flex-center-center mt-12 mb-12">
                <div class="rate">
                  <div class="number">
                    {{ product.creditProductsVersionVo.baseInterestRate + '%' + ' ~ ' + product.creditProductsVersionVo.floatInterestRate + '%' }}
                  </div>
                  <div class="label">贷款利率</div>
                </div>
                <div class="line"></div>
                <div class="term">
                  <div class="number">最高{{ product.creditProductsVersionVo.loanCycle.split(',').pop() }}期</div>
                  <div class="label">可贷周期</div>
                </div>
              </div>
              <!-- 描述 -->
              <el-tooltip :content="product.creditProductsVersionVo.productIntro" placement="top">
                <div class="description">
                  {{ product.creditProductsVersionVo.productIntro }}
                </div>
              </el-tooltip>
            </div>
            <div class="footer flex-center-center">
              <el-button type="primary" round @click="handleDetail(product, 'LoanProductsComponentDetails')">查看详情 →</el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty description="暂无收藏信贷产品" v-if="activeTab === 'credit' && creditProducts.length === 0" class="mt-24"> </el-empty>

      <!-- 保险 -->
      <el-row :gutter="20" v-show="activeTab === 'insurance' && insuranceProducts.length > 0">
        <el-col :span="8" v-for="item in insuranceProducts" :key="item.id">
          <div class="item">
            <div class="product-header flex-center-between">
              <div class="left-title flex-center gap-12">
                <img src="../../../../assets/images/finance/insurance-icon.png" width="22" />
                <div>保险产品</div>
              </div>
              <div class="flex-center gap-8 favorite" @click="handleFavorite(item, 'insurance')">
                <el-icon size="30" color="#108c58"> <StarFilled /></el-icon>
              </div>
            </div>
            <div class="product-info mt-12 mb-12">
              <div class="name">
                {{ item.remoteInsuranceProductsVersionVo.productName }}
              </div>
              <el-tag class="mt-12 mb-12" :type="productTypeMap[item.remoteInsuranceProductsVersionVo.productType]?.type">{{
                productTypeMap[item.remoteInsuranceProductsVersionVo.productType]?.label
              }}</el-tag>
              <el-tooltip :content="item.remoteInsuranceProductsVersionVo.productIntro" placement="top">
                <div class="introduction">
                  {{ item.remoteInsuranceProductsVersionVo.productIntro }}
                </div>
              </el-tooltip>
            </div>
            <div class="product-actions flex-center-center">
              <el-button type="primary" round @click="handleDetail(item, 'InsuranceproductComponentDetails')">查看详情 →</el-button>
            </div>
          </div>
        </el-col>
      </el-row>
      <el-empty description="暂无收藏保险产品" v-if="activeTab === 'insurance' && insuranceProducts.length === 0" class="mt-24"> </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { addToFavorites } from '@/api/mall/index';
import { unifiedFavoriteList } from '@/api/mall/personalCenter/favorite';
import { eventBus } from '@/utils/eventBus';
const activeTab = ref('credit');

const tabList = ref([
  {
    label: '信贷产品',
    value: 'credit'
  },
  {
    label: '保险产品',
    value: 'insurance'
  }
]);

const creditProducts = ref([]); // 信贷产品列表

const insuranceProducts = ref([]); // 保险产品列表

// 产品类型（0成本保险、1价格保险、2收入保险、3气象指数保险
const productTypeMap: Record<number, { label: string; type: any }> = {
  0: { label: '成本保险', type: 'warning' },
  1: { label: '价格保险', type: 'primary' },
  2: { label: '收入保险', type: 'success' },
  3: { label: '气象指数保险', type: 'danger' }
};

onMounted(async () => {
  await getCreditList();
  await getInsuranceList();
});

const handleTabClick = (tab: string) => {
  activeTab.value = tab;
};

// TODO 获取信贷产品列表
const getCreditList = async () => {
  const res = await unifiedFavoriteList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    favoriteType: '6'
  });
  creditProducts.value = res.rows || [];
};

// TODO 获取保险产品列表
const getInsuranceList = async () => {
  const res = await unifiedFavoriteList({
    pageQuery: {
      pageNum: 1,
      pageSize: 999
    },
    favoriteType: '7'
  });
  insuranceProducts.value = res.rows || [];
};

// 收藏产品
const handleFavorite = async (item: any, type: string) => {
  ElMessageBox.confirm('确定取消收藏该产品吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const data =
        type === 'credit'
          ? {
              favoriteType: '6',
              creditProductFavoritesBo: {
                productId: item.productId,
                productVersion: item.productVersion
              }
            }
          : {
              favoriteType: '7',
              insuranceProductFavoritesBo: {
                productId: item.productId,
                productVersion: item.productVersion
              }
            };
      const res = await addToFavorites(data);
      if (res.code === 200) {
        type === 'credit' ? await getCreditList() : await getInsuranceList();
        ElMessage.success(item.isFavorite ? '收藏成功' : '取消收藏成功');
      }
    })
    .catch(() => {
      // 取消操作
    });
};

// 查看详情
const handleDetail = (row: any, type: string) => {
  eventBus.emit('showComponentByCommand', {
    type,
    id: type == 'LoanProductsComponentDetails' ? row.creditProductsVersionVo.id : row.remoteInsuranceProductsVersionVo.id
  });
};
</script>

<style scoped lang="scss">
.my-collections {
  border-radius: 8px;
  background: #ffffff;
}

.title {
  padding: 16px;
  font-weight: 500;
  font-size: 20px;
  color: #333333;
  border-bottom: 1px solid #d8d8d8;
}

.tab-list {
  padding: 20px;
  .item {
    color: #108c58;
    cursor: pointer;
    padding: 6px 12px;
    border-radius: 4px;
    background: rgba(16, 140, 88, 0.1);
  }
  .active {
    background: #108c58;
    color: #ffffff;
  }
}
.content {
  padding: 20px;
  height: 720px;
  overflow: auto;
  .item {
    border: 1px solid #e4e4e4;
    border-radius: 8px;
    padding: 16px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 12px;
    transition:
      transform 0.2s,
      box-shadow 0.2s;
    position: relative;

    .tag {
      position: absolute;
      top: 12px;
      right: -25px; /* 控制横向位置，按需微调 */
      width: 110px; /* 控制梯形的“上底”长度 */
      height: 30px; /* 控制梯形的高度（厚度）*/
      transform: rotate(43deg);
      transform-origin: center;
      background: #e65c33;
      color: #fff;
      font-weight: 700;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      /* 关键：用 clip-path 画一个上下底不等且居中的梯形（对称） */
      clip-path: polygon(25% 0, 75% 0, 100% 100%, 0 100%);
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.08) inset;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      .favorite {
        cursor: pointer;
        min-width: 0;
        .name {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          flex: 1;
          min-width: 0;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }

    .content-info {
      margin-bottom: 12px;
      .limit {
        background: url('@/assets/images/finance/limit-bg.png') no-repeat center center;
        background-size: cover;
        font-size: 20px;
        font-weight: bold;
        color: #333;
        margin-bottom: 4px;
        text-align: center;
        padding: 16px 0;
        .money-amount {
          color: #ef4d0b;
          font-weight: 500;
          gap: 4px;
          div:first-child {
            font-size: 28px;
            line-height: 32px;
            margin-bottom: 12px;
          }
          div:last-child {
            font-size: 12px;
          }
          .max-label {
            font-size: 16px;
            color: #3d3d3d;
            line-height: 14px;
          }
        }
      }

      .rate,
      .term {
        text-align: center;
        margin: 0 16px;

        .number {
          font-size: 16px;
          color: #ef4d0b;
          margin-bottom: 4px;
        }

        .label {
          font-size: 14px;
          color: #3d3d3d;
        }
      }
      .line {
        width: 1px;
        height: 24px;
        background-color: #999;
      }
      // 最多两行 超出展示省略号
      .description {
        height: 48px;
        font-size: 14px;
        color: #676767;
        line-height: 24px;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }

    .footer {
      .el-button {
        font-size: 16px;
        color: #108c58;
        background: rgba(16, 140, 88, 0.1);
        border-radius: 193px 193px 193px 193px;
        border: 1px solid #108c58;
      }
    }
  }

  .product-card {
    padding: 16px;
    border-radius: 8px;
    background-color: #fff;
  }

  .product-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #d8d8d8;
    padding-bottom: 12px;
    .left-title {
      font-size: 18px;
      font-weight: 500;
      color: #3d3d3d;
    }
    .favorite {
      cursor: pointer;
    }
    .text-primary {
      font-size: 14px;
      color: #cbcbcb;
    }
    .isFavorite {
      color: #108c58;
    }
  }

  .product-info {
    .name {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .introduction {
      height: 48px;
      font-size: 14px;
      color: #757474;
      line-height: 24px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  .product-actions {
    .el-button {
      font-size: 16px;
      color: #108c58;
      background: rgba(16, 140, 88, 0.1);
      border-radius: 193px 193px 193px 193px;
      border: 1px solid #108c58;
    }
  }
}
</style>
