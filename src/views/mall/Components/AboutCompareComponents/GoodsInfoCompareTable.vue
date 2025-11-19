<template>
  <div class="compare-table-section">
    <div class="section-title">
      <span class="title-bar"></span>商品信息
    </div>
    <el-table :data="tableData" border class="compare-table">
      <el-table-column prop="label" label="对比项" width="120" fixed="left" />
      <el-table-column
        v-for="(goods, index) in goodsList"
        :key="goods.id || index"
        :label="goods.goodsName"
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
            <div v-if="row[`goods${index}`] && row[`goods${index}`] !== '-'">
              <div v-html="row[`goods${index}`].display"></div>
              <div v-if="row[`goods${index}`].hasMore" class="toggle-more" @click="togglePriceHistory(index, row[`goods${index}`].key)">
                <span>{{ row[`goods${index}`].expanded ? '收起' : '展开更多' }}</span>
              </div>
            </div>
            <span v-else class="no-data">-</span>
          </div>
          <div v-else-if="row.type === 'price'" class="price-cell">
            <template v-if="row[`goods${index}`] && row[`goods${index}`] !== '-'">
              <template v-if="Array.isArray(row[`goods${index}`])">
                <span
                  v-for="(priceText, pIdx) in row[`goods${index}`]"
                  :key="pIdx"
                  class="price-box"
                >
                  {{ priceText }}
                </span>
              </template>
              <span v-else class="price-box">{{ row[`goods${index}`] }}</span>
            </template>
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
  location?: string;
}

const props = defineProps<{
  goodsList: CompareGoodsItem[];
}>();

// 商品信息对比表格数据
const tableData = ref<any[]>([]);

// 历史价格展开状态管理
const priceHistoryExpanded = ref<Record<string, boolean>>({});

// 格式化价格信息（商品价格列，支持多规格展示，每个价格一个盒子）
const formatPriceInfo = (goods: CompareGoodsItem) => {
  const specs = goods.hnGoodsSpecificationDataList || [];
  if (!Array.isArray(specs) || specs.length === 0) return '-';

  const specificationName = goods.goodsSpecificationName || '';
  const parts = specs
    .map((s: any) => {
      const price = parseFloat(String(s.goodsPrice || 0));
      if (!price) return null;
      const specificationValue = s.goodsSpecificationValue ?? '';
      const specDisplay = [specificationValue, specificationName].filter(Boolean).join('/');
      return `${price.toFixed(2)}元${specDisplay ? ' ' + specDisplay : ''}`;
    })
    .filter(Boolean);

  return parts.length > 0 ? parts : '-';
};

// 格式化历史价格（展示：价格元 规格值/单位）
const formatPriceHistory = (goods: CompareGoodsItem, goodsIndex: number) => {
  if (!goods.priceHistories || goods.priceHistories.length === 0) {
    return '-';
  }
  
  const historyItems = goods.priceHistories
    .map((history) => {
      const oldPriceStr = String(history.goodsOldPrice || '0');
      const newPriceStr = String(history.goodsNewPrice || '0');
      const oldPrice = parseFloat(oldPriceStr);
      const newPrice = parseFloat(newPriceStr);
      // 历史记录里的规格：goodsSpecificationValue + '/' + goodsSpecification(单位文本)
      const specValue = (history as any).goodsSpecificationValue ?? '';
      const specUnit = (history as any).goodsSpecification ?? (goods as any).goodsSpecificationName ?? '';
      const specDisplay = [specValue, specUnit].filter(Boolean).join('/');
      
      if (isNaN(oldPrice) || isNaN(newPrice) || (oldPrice === 0 && newPrice === 0)) {
        return null;
      }
      
      return `<span style="color: #EF4D0B; font-size: 14px;">${oldPriceStr}元${specDisplay ? ' ' + specDisplay : ''}</span>---调整至---<span style="color: #108C58; font-size: 14px;">${newPriceStr}元${specDisplay ? ' ' + specDisplay : ''}</span>`;
    })
    .filter(Boolean);
  
  if (historyItems.length === 0) {
    return '-';
  }
  
  const key = `goods${goodsIndex}_${goods.id || ''}`;
  const isExpanded = priceHistoryExpanded.value[key] || false;
  const maxDisplay = 4;
  const hasMore = historyItems.length > maxDisplay;
  const displayItems = isExpanded ? historyItems : historyItems.slice(0, maxDisplay);
  const displayHtml = displayItems.join('<br/>');
  
  return {
    display: displayHtml,
    hasMore,
    expanded: isExpanded,
    key
  };
};

// 切换历史价格展开/收起
const togglePriceHistory = (goodsIndex: number, key: string) => {
  priceHistoryExpanded.value[key] = !priceHistoryExpanded.value[key];
  updateTable();
};

// 获取商品类目的最后一个部分
const getLastCategoryName = (categoryName?: string) => {
  if (!categoryName) return '-';
  // 处理多种分隔符：/ 或 \ 或 |
  const parts = categoryName.split(/[/\\|]/).filter(Boolean);
  if (parts.length > 0) {
    return parts[parts.length - 1].trim();
  }
  return categoryName.trim() || '-';
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
        acc[`goods${index}`] = getLastCategoryName(goods.goodsCategoryName);
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
      type: 'price',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = formatPriceInfo(goods);
        return acc;
      }, {} as any)
    },
    {
      label: '历史价格',
      type: 'price-history',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = formatPriceHistory(goods, index);
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
  display: flex;
  flex-direction: column;
  align-items: center;

  .section-title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
    margin-bottom: 16px;
    padding-bottom: 8px;
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;

    .title-bar {
      width: 2px;
      height: 14px;
      background: #108C58;
      border-radius: 4px 4px 4px 4px;
      flex-shrink: 0;
    }
  }

  .compare-table {
    width: 100%;
    margin: 0 auto;

    :deep(.el-table__body-wrapper) {
      .el-table__body {
        tr {
          // 只给第一列添加背景色
          td:first-child {
            background-color: rgba(16, 140, 88, 0.1) !important;
          }
          
          // 所有单元格内容居中
          td {
            text-align: center;
          }
        }
      }
    }
    
    :deep(.el-table__header-wrapper) {
      .el-table__header {
        tr {
          // 表头第一列也添加背景色
          th:first-child {
            background-color: rgba(16, 140, 88, 0.1) !important;
          }
          
          // 表头内容居中
          th {
            text-align: center;
          }
        }
      }
    }
    
    // 固定列的表头也需要设置
    :deep(.el-table__fixed-header-wrapper) {
      .el-table__header {
        tr {
          th:first-child {
            background-color: rgba(16, 140, 88, 0.1) !important;
          }
          
          th {
            text-align: center;
          }
        }
      }
    }
    
    // 固定列的内容也需要居中
    :deep(.el-table__fixed-body-wrapper) {
      .el-table__body {
        tr {
          td {
            text-align: center;
          }
        }
      }
    }

    .tags-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;

      .tag-item {
        margin: 0;
      }
    }

    .price-history-cell,
    .normal-cell {
      padding: 4px 0;
      line-height: 1.8;
      text-align: center;

      .no-data {
        color: #c0c4cc;
      }
    }

    .price-cell {
      text-align: center;

      .price-box {
        display: inline-block;
        min-width: 70px;
        height: 36px;
        background: rgba(16, 140, 88, 0.1);
        border-radius: 2px;
        border: 1px solid #108C58;
        font-size: 12px;
        color: #108C58;
        line-height: 36px;
        text-align: center;
        padding: 0 8px;
        box-sizing: border-box;
        margin: 4px 6px 0 0;
      }
    }

    .price-history-cell {
      :deep(span) {
        display: inline-block;
        margin: 0 2px;
      }

      .toggle-more {
        margin-top: 8px;
        text-align: center;
        cursor: pointer;
        color: #108C58;
        font-size: 14px;
        user-select: none;

        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}
</style>

