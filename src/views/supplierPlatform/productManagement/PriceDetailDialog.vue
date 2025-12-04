<!--
  标题: PriceDetailDialog.vue
  功能: 价格调整明细弹窗
  说明: 显示商品价格调整的详细信息
  当前版本: 1.0
-->
<template>
  <el-dialog v-model="dialogVisible" title="价格调整明细" width="800px">
    <el-table :data="props.data || []" v-loading="props.loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="80" :index="getIndex" />
      <el-table-column label="商品规格">
        <template #default="scope">
          {{ formatSpecification(scope.row) }}
        </template>
      </el-table-column>
      <el-table-column label="调整前销售价格">
        <template #default="scope">
          {{ formatPrice(scope.row.goodsOldPrice, scope.row.goodsSpecificationName) }}
        </template>
      </el-table-column>
      <el-table-column label="调整后销售价格">
        <template #default="scope">
          {{ formatPrice(scope.row.goodsNewPrice, scope.row.goodsSpecificationName) }}
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination
        v-show="(props.total || 0) > 0"
        :page="props.queryParams?.pageNum || 1"
        :limit="props.queryParams?.pageSize || 10"
        :total="props.total || 0"
        @pagination="(pagination) => emit('pagination', pagination)"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Pagination from '@/components/Pagination/index.vue';

const props = defineProps<{
  modelValue: boolean;
  data?: any[];
  total?: number;
  loading?: boolean;
  queryParams?: {
    pageNum: number;
    pageSize: number;
  };
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'pagination': [pagination: { page: number; limit: number }];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

// 计算序号
const getIndex = (index: number) => {
  if (!props.queryParams) return index + 1;
  return (props.queryParams.pageNum - 1) * props.queryParams.pageSize + index + 1;
};

// 格式化商品规格
const formatSpecification = (row: any) => {
  if (row.goodsSpecificationValue && row.goodsSpecificationName) {
    return `${row.goodsSpecificationValue}${row.goodsSpecificationName}`;
  }
  if (row.goodsSpecificationName) {
    return row.goodsSpecificationName;
  }
  return '-';
};

// 格式化价格
const formatPrice = (price: any, specificationName?: string) => {
  if (price === null || price === undefined || price === '') {
    return '-';
  }
  const priceNum = Number(price);
  if (isNaN(priceNum)) {
    return '-';
  }
  const formattedPrice = priceNum.toFixed(2);
  // 如果有规格单位，拼接单位（如"元/件"、"元/斤"）
  if (specificationName) {
    // 去掉括号及其内容，提取单位（如"件(计数)" -> "件"）
    const unit = specificationName.replace(/\([^)]*\)/g, '').trim();
    if (unit) {
      return `${formattedPrice}元/${unit}`;
    }
    return `${formattedPrice}元`;
  }
  return `${formattedPrice}元`;
};
</script>

<style scoped lang="scss">
:deep(.el-dialog__body) {
  padding: 20px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
