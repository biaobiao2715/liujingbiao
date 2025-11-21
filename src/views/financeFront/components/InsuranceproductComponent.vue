<!--
  标题: InsuranceproductComponent.vue
  功能: 保险产品组件
  说明: 展示保险产品列表，包括收藏功能
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-20
-->
<template>
  <div class="risk-cases">
    <div class="section-title flex-center-between mb-12">
      <div>保险产品</div>
      <div class="more" @click="handleMore">查看更多 >></div>
    </div>
    <div class="product-list">
      <div v-for="item in cases" :key="item.id" class="product-card mb-12">
        <div class="product-header">
          <div class="title">{{ item.productName }}</div>
          <div class="flex-center gap-8 favorite" @click="toggleFavorite(item)">
            <div :class="[{ 'isFavorite': item.isFavorite }, 'text-primary']">
              {{ item.isFavorite ? '已收藏' : '收藏' }}
            </div>
            <el-icon size="20" color="#ccc" v-if="!item.isFavorite"><StarFilled /></el-icon>
            <el-icon size="20" color="#108c58" v-else> <StarFilled /></el-icon>
          </div>
        </div>
        <div class="flex-center-between">
          <div class="product-info">
            <el-tag class="mt-12 mb-12" :type="productTypeMap[item.productType].type">{{ productTypeMap[item.productType].label }}</el-tag>
            <div class="introduction">{{ item.productIntro }}</div>
          </div>
          <div class="product-actions">
            <el-button type="primary" round @click="handleDetail(item)">查看详情 →</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getInsuranceProductsVersionList } from '@/api/financeFront/Insuranceproduct/index';
import { addToFavorites } from '@/api/mall/index';
import { eventBus } from '@/utils/eventBus';
import { ElMessage } from 'element-plus';
const emit = defineEmits(['detailChange']);

// 列表数据与加载状态
const cases = ref<any[]>([]);
const loading = ref(false);

// 基础查询参数（如需筛选可在此扩展）
const queryParams = ref({
  pageNum: 1,
  pageSize: 10
});

// 产品类型（0成本保险、1价格保险、2收入保险、3气象指数保险
const productTypeMap: Record<number, { label: string; type: any }> = {
  0: { label: '成本保险', type: 'warning' },
  1: { label: '价格保险', type: 'primary' },
  2: { label: '收入保险', type: 'success' },
  3: { label: '气象指数保险', type: 'danger' }
};

onMounted(() => {
  fetchCases();
});

// 获取列表数据
const fetchCases = async () => {
  loading.value = true;
  try {
    const res: any = await getInsuranceProductsVersionList(queryParams.value);
    if (res && res.code === 200) {
      cases.value = res.rows || res.data || [];
    } else {
      ElMessage.error(res?.msg || '获取保险产品列表失败');
    }
  } catch (e) {
    ElMessage.error('获取保险产品列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const toggleFavorite = async (item: any) => {
  const res = await addToFavorites({
    favoriteType: '7',
    insuranceProductFavoritesBo: {
      productId: item.productId,
      productVersion: item.productVersion
    }
  });
  if (res.code === 200) {
    item.isFavorite = !item.isFavorite;
    ElMessage.success(item.isFavorite ? '收藏成功' : '取消收藏成功');
  }
};

const handleDetail = (item: any) => {
  eventBus.emit('showComponentByCommand', { type: 'InsuranceproductComponentDetails', id: item.id });
};

// 查看更多
const handleMore = () => {
  eventBus.emit('showComponentByCommand', { type: 'InsuranceproductComponentList' });
};
</script>

<style scoped lang="scss">
.risk-cases {
  padding: 20px;
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

.product-list {
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
  .title {
    font-size: 18px;
    color: #333;
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
  width: calc(100% - 120px);
  .introduction {
    font-size: 14px;
    color: #757474;
  }
}

.product-actions {
  display: flex;
  justify-content: space-between;
  .el-button {
    font-size: 16px;
    color: #108c58;
    background: rgba(16, 140, 88, 0.1);
    border-radius: 193px 193px 193px 193px;
    border: 1px solid #108c58;
  }
}
</style>
