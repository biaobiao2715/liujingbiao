<template>
  <div class="compare-table-section">
    <div class="section-title">|商品信息</div>
    <el-table :data="tableData" border class="compare-table">
      <el-table-column prop="label" label="对比项" width="120" fixed="left" />
      <el-table-column
        v-for="(goods, index) in goodsList"
        :key="goods.id || index"
        :label="`商品${index + 1}`"
        :prop="`goods${index}`"
        min-width="180"
      >
        <template #default="{ row }">
          <div v-if="row.type === 'tags'" class="tags-cell">
            <el-tag
              v-for="(tag, tagIndex) in row[`goods${index}`]"
              :key="tagIndex"
              type="danger"
              size="small"
              class="tag-item"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div v-else-if="row.type === 'price-history'" class="price-history-cell">
            <span v-if="row[`goods${index}`]">{{ row[`goods${index}`] }}</span>
            <span v-else class="no-data">-</span>
          </div>
          <div v-else class="normal-cell">
            <span v-if="row[`goods${index}`]">{{ row[`goods${index}`] }}</span>
            <span v-else class="no-data">-</span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { Goods } from '../../mall';

interface CompareGoodsItem extends Partial<Goods> {
  image?: string;
  price?: string;
  location?: string;
}

const props = defineProps<{
  goodsList: CompareGoodsItem[];
}>();

// 商品信息对比表格数据
const tableData = ref<any[]>([]);

// 格式化价格信息
const formatPriceInfo = (goods: CompareGoodsItem) => {
  if (!goods.hnGoodsSpecificationDataList || goods.hnGoodsSpecificationDataList.length === 0) {
    return '-';
  }
  
  const prices = goods.hnGoodsSpecificationDataList
    .map(spec => {
      const price = parseFloat(String(spec.goodsPrice || 0));
      const quantity = spec.goodsSpecificationValue || '1';
      return `${price.toFixed(0)}元/${quantity}${spec.goodsSpecification || '袋'}`;
    })
    .join(' ');
  
  return prices;
};

// 格式化历史价格
const formatPriceHistory = (goods: CompareGoodsItem) => {
  if (!goods.priceHistories || goods.priceHistories.length === 0) {
    return '-';
  }
  
  const history = goods.priceHistories[0];
  const oldPrice = parseFloat(String(history.goodsOldPrice || 0));
  const newPrice = parseFloat(String(history.goodsNewPrice || 0));
  
  if (oldPrice === 0 && newPrice === 0) {
    return '-';
  }
  
  return `${oldPrice.toFixed(0)}元1/袋---调整至---${newPrice.toFixed(0)}元1/袋`;
};

// 更新表格数据
const updateTable = () => {
  if (props.goodsList.length === 0) {
    tableData.value = [];
    return;
  }

  // 商品信息表格
  tableData.value = [
    {
      label: '品种',
      type: 'normal',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = goods.goodsName || '-';
        return acc;
      }, {} as any)
    },
    {
      label: '区域',
      type: 'normal',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = goods.location || goods.hnBaseEnterpriseInfo?.province || '-';
        return acc;
      }, {} as any)
    },
    {
      label: '商品价格',
      type: 'normal',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = formatPriceInfo(goods);
        return acc;
      }, {} as any)
    },
    {
      label: '历史价格',
      type: 'price-history',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = formatPriceHistory(goods);
        return acc;
      }, {} as any)
    },
    {
      label: '产品保障',
      type: 'tags',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = goods.goodssEnsureName || [];
        return acc;
      }, {} as any)
    },
    {
      label: '产品功能',
      type: 'normal',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = (goods.goodsAbilityName || []).join('/') || '-';
        return acc;
      }, {} as any)
    }
  ];
};

watch(
  () => props.goodsList,
  () => {
    updateTable();
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss" scoped>
.compare-table-section {
  margin-bottom: 40px;

  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #409eff;
  }

  .compare-table {
    width: 100%;

    .tags-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag-item {
        margin: 0;
      }
    }

    .price-history-cell,
    .normal-cell {
      padding: 4px 0;
      line-height: 1.5;

      .no-data {
        color: #c0c4cc;
      }
    }
  }
}
</style>

