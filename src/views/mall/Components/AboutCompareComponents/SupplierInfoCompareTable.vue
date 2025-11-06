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
          <div class="normal-cell">
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

// 供应商信息对比表格数据
const tableData = ref<any[]>([]);

// 格式化资质等级
const formatCredentialLevel = (level?: string) => {
  if (!level) return '-';
  const levelMap: Record<string, string> = {
    '0': '一级资质',
    '1': '二级资质',
    '2': '三级资质'
  };
  return levelMap[level] || '-';
};

// 格式化信用等级
const formatCreditLevel = (level?: string) => {
  if (!level) return '-';
  const levelMap: Record<string, string> = {
    '0': '优秀',
    '1': '良好',
    '2': '一般',
    '3': '一般以下',
    '99': '较差'
  };
  return levelMap[level] || '-';
};

// 更新表格数据
const updateTable = () => {
  if (props.goodsList.length === 0) {
    tableData.value = [];
    return;
  }

  // 供应商信息表格
  tableData.value = [
    {
      label: '供应商名称',
      type: 'normal',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = goods.hnBaseEnterpriseInfo?.companyName || '-';
        return acc;
      }, {} as any)
    },
    {
      label: '资质等级',
      type: 'normal',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = formatCredentialLevel(goods.hnBaseEnterpriseInfo?.credentialLevel);
        return acc;
      }, {} as any)
    },
    {
      label: '信用等级',
      type: 'normal',
      ...props.goodsList.reduce((acc, goods, index) => {
        acc[`goods${index}`] = formatCreditLevel(goods.hnBaseEnterpriseInfo?.creditLevel);
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

