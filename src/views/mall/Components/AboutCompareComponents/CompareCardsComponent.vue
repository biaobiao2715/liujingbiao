<template>
  <div class="compare-cards-section">
    <div class="section-title">对比商品</div>
    <div class="compare-cards">
      <div
        v-for="(item, index) in goodsList"
        :key="item.id || index"
        class="compare-card"
      >
        <el-image
          :src="item.image || item.sysOssLists?.[0]?.url"
          fit="cover"
          class="card-image"
        />
        <div class="card-price">¥{{ item.price }}元/袋</div>
        <div class="card-sales">销量{{ formatSales(item.goodsSales) }}</div>
        <div class="card-name">{{ item.goodsName }}</div>
        <div class="card-location">{{ item.location || item.hnBaseEnterpriseInfo?.province }}</div>
        <el-button
          type="danger"
          size="small"
          class="remove-btn"
          @click="handleRemove(index)"
        >
          移除
        </el-button>
      </div>
      
      <!-- 空位占位 -->
      <div
        v-for="i in emptySlots"
        :key="`empty-${i}`"
        class="compare-card empty-card"
      >
        <div class="empty-placeholder">+</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Goods } from '../../mall';

interface CompareGoodsItem extends Partial<Goods> {
  image?: string;
  price?: string;
  location?: string;
}

const props = defineProps<{
  goodsList: CompareGoodsItem[];
}>();

const emit = defineEmits<{
  remove: [index: number];
}>();

// 格式化销量
const formatSales = (sales?: number) => {
  if (!sales) return '0';
  if (sales >= 1000) {
    return `${(sales / 1000).toFixed(1)}K+`;
  }
  return `${sales}+`;
};

// 空位数量
const emptySlots = computed(() => {
  const current = props.goodsList.length;
  const max = 5;
  return Math.max(0, max - current);
});

// 移除商品
const handleRemove = (index: number) => {
  emit('remove', index);
};
</script>

<style lang="scss" scoped>
.compare-cards-section {
  margin-bottom: 40px;

  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
  }

  .compare-cards {
    display: flex;
    gap: 16px;
    flex-wrap: wrap;

    .compare-card {
      width: 200px;
      background: #fff;
      border: 1px solid #ebeef5;
      border-radius: 4px;
      padding: 16px;
      position: relative;
      transition: all 0.3s;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      &.empty-card {
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px dashed #dcdfe6;
        background: #f5f7fa;

        .empty-placeholder {
          font-size: 48px;
          color: #c0c4cc;
        }
      }

      .card-image {
        width: 100%;
        height: 150px;
        margin-bottom: 12px;
        border-radius: 4px;
      }

      .card-price {
        font-size: 18px;
        font-weight: bold;
        color: #f56c6c;
        margin-bottom: 8px;
      }

      .card-sales {
        font-size: 12px;
        color: #909399;
        margin-bottom: 8px;
      }

      .card-name {
        font-size: 14px;
        color: #303133;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .card-location {
        font-size: 12px;
        color: #909399;
        margin-bottom: 12px;
      }

      .remove-btn {
        width: 100%;
      }
    }
  }
}
</style>

