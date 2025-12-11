<!--
  标题: LoanProductsComponent.vue
  功能: 信贷产品组件
  说明: 展示信贷产品列表
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-20
-->
<template>
  <div class="loan-products">
    <div class="section-title flex-center-between mb-12">
      <div>信贷产品</div>
      <div class="more" @click="handleMore">查看更多 >></div>
    </div>
    <el-row :gutter="20">
      <el-col :span="8" v-for="product in products" :key="product.id">
        <div class="item">
          <span class="tag" v-if="product.isTopThreeByViews">热门</span>

          <div class="header">
            <div class="flex-center favorite gap-8" @click="handleFavorite(product)">
              <span class="name">{{ product.productName }}</span>
              <el-icon size="20" color="#ccc" v-if="!product.isFavorite"><StarFilled /></el-icon>
              <el-icon size="20" color="#108c58" v-else> <StarFilled /></el-icon>
            </div>
          </div>
          <div class="content">
            <div class="limit">
              <div class="flex-center-center money-amount">
                <div>{{ product.maxLoanAmount }}</div>
                <div>万元</div>
              </div>
              <div class="max-label">最高额度</div>
            </div>
            <!-- 贷款利率和周期 -->
            <div class="flex-center-center mt-12 mb-12">
              <div class="rate">
                <div class="number" v-if="product.baseInterestRate !== product.floatInterestRate">
                  {{ product.baseInterestRate + '%' + ' ~ ' + product.floatInterestRate + '%' }}
                </div>
                <div class="number" v-else>
                  {{ product.baseInterestRate + '%' }}
                </div>
                <div class="label">贷款利率</div>
              </div>
              <div class="line"></div>
              <div class="term">
                <div class="number">最高{{ product.loanCycle.split(',').pop() }}期</div>
                <div class="label">可贷周期</div>
              </div>
            </div>
            <!-- 描述 -->
            <div class="description">
              <el-tooltip :content="product.productIntro" placement="top">
                {{ product.productIntro }}
              </el-tooltip>
            </div>
          </div>
          <div class="footer flex-center-center">
            <el-button type="primary" round @click="handleDetail(product)">查看详情 →</el-button>
          </div>
        </div>
      </el-col>
    </el-row>
    <el-empty v-if="products.length === 0" description="金融产品对接中"></el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getCreditProductsVersionNoTenantList } from '@/api/financeFront/LoanProducts/index';
import { addToFavorites } from '@/api/mall/index';
import { eventBus } from '@/utils/eventBus';

const products = ref([]);

const queryParams = ref({
  pageNum: 1,
  pageSize: 6,
  queryParam: '',
  productStatus: '2'
});

onMounted(() => {
  fetchProducts();
  eventBus.on('financeSearch', (data: any) => {
    if (data.category === 'loan') {
      queryParams.value.pageNum = 1;
      queryParams.value.queryParam = data.queryParam || '';
      fetchProducts();
    }
  });
});

// 获取列表数据
const fetchProducts = async () => {
  try {
    const res = await getCreditProductsVersionNoTenantList(queryParams.value);
    if (res.code === 200) {
      products.value = res.rows || [];
    }
  } catch (error) {
    console.error('获取信贷产品列表失败:', error);
  } finally {
  }
};
const handleDetail = (row: any) => {
  eventBus.emit('showComponentByCommand', { type: 'LoanProductsComponentDetails', id: row.id });
};

// 查看更多
const handleMore = () => {
  eventBus.emit('showComponentByCommand', { type: 'LoanProductsComponentList' });
};

// 收藏产品
const handleFavorite = async (item: any) => {
  const res = await addToFavorites({
    favoriteType: '6',
    creditProductFavoritesBo: {
      productId: item.productId,
      productVersion: item.productVersion
    }
  });
  if (res.code === 200) {
    item.isFavorite = !item.isFavorite;
    ElMessage.success(item.isFavorite ? '收藏成功' : '取消收藏成功');
  }
};
</script>

<style scoped lang="scss">
.loan-products {
  padding: 20px;

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
        /* 关键：在 flex 容器中允许子项收缩，避免被内容撑开 */
        min-width: 0;
      }
      .name {
        font-size: 16px;
        font-weight: bold;
        color: #333;
        /* 关键：在与图标并排的 flex 场景下需要可收缩宽度 */
        flex: 1;
        min-width: 0;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }

    .content {
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
      // 最多两行，单行时高度约20px，两行约40px
      .description {
        font-size: 14px;
        color: #676767;
        height: 42px;
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
}
.section-title {
  height: 20px;
  line-height: 20px;
  font-size: 20px;
  color: #000000;
  border-left: 3px solid #108c58;
  padding-left: 12px;
  .more {
    cursor: pointer;
    font-size: 14px;
    color: rgba(51, 51, 51, 0.5);
  }
}
</style>
