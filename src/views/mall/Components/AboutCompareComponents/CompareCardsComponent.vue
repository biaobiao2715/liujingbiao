<template>
  <div class="compare-cards-section">
    <div class="section-header">
      <div class="section-title-vertical">对比商品</div>
      <div class="compare-cards-wrapper">
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
            <div class="card-price-row">
              <div class="card-price">
                ¥{{ item.price }}元/<span class="price-unit">袋</span>
              </div>
              <div class="card-sales">销量{{ formatSales(item.goodsSales) }}</div>
            </div>
            <div class="card-name-row">
              <div class="card-name">{{ item.goodsName }}</div>
              <div class="card-location">{{ item.location || item.hnBaseEnterpriseInfo?.province }}</div>
            </div>
          </div>
        </div>
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

// 移除商品
const handleRemove = (index: number) => {
  emit('remove', index);
};
</script>

<style lang="scss" scoped>
.compare-cards-section {
  margin-bottom: 40px;
  background: #f5f5f5;

  .section-header {
    display: flex;
    align-items: stretch;
    gap: 0;
    height: 379px;
  }

  .section-title-vertical {
    width: 120px;
    height: 379px;
    margin-right: 10px;
    background: rgba(16, 140, 88, 0.1);
    color: #108C58;
    padding: 20px 8px;
    font-size: 16px;
    font-weight: 500;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .compare-cards-wrapper {
    flex: 1;
    padding: 0  0px  20px 0px;
    background: #F6F7FB;
    height: 379px;
    display: flex;
    align-items: stretch;
    box-sizing: border-box;
    overflow: hidden;
  }

  .compare-cards {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 20px;
    width: 100%;
    height: 100%;
    align-items: stretch;
    box-sizing: border-box;

      .compare-card {
      width: 100%;
      height: 100%;
      max-height: 100%;
      flex-shrink: 0;
      background: #fff;
      border-radius: 4px;
      position: relative;
      transition: all 0.3s;
      box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
      overflow: hidden;

      &:hover {
        box-shadow: 0px 4px 8px 0px rgba(0, 0, 0, 0.25);
        transform: translateY(-2px);
      }

      .card-image {
        width: 100%;
        height: 80%;
        min-height: 0;
        margin-bottom: 12px;
        border-radius: 4px;
        overflow: hidden;
        flex-shrink: 0;
        object-fit: cover;
      }

      .card-price-row {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin-bottom: 8px;
        gap: 8px;
        flex-shrink: 0;
        padding: 0 12px;
      }

      .card-price {
        font-size: 20px;
        font-weight: bold;
        color: #EF4D0B;
        flex: 1;
        line-height: 1.2;

        .price-unit {
          font-size: 14px;
        }
      }

      .card-sales {
        font-size: 12px;
        color: #909399;
        white-space: nowrap;
      }

      .card-name-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 0 12px;
        margin-bottom: 0;
        flex-shrink: 0;
      }

      .card-name {
        font-size: 14px;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex: 1;
        min-width: 0;
      }

      .card-location {
        font-size: 12px;
        color: #909399;
        white-space: nowrap;
        flex-shrink: 0;
      }
    }
  }
}
</style>

