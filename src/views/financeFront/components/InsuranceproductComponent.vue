<template>
  <div class="risk-cases">
    <h2>保险产品</h2>
    <el-table :data="cases" style="width: 100%" v-loading="loading" @row-click="handleClick">
      <el-table-column prop="productName" label="保险产品名称" />
      <el-table-column prop="productType" label="保险产品类型" />
      <el-table-column prop="productIntro" label="保险产品介绍"> </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getInsuranceProductsVersionList } from '@/api/financeFront/Insuranceproduct/index';
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
const handleClick = (row: any) => {
  emit('detailChange', { type: 'InsuranceproductComponentDetails', id: row.id });
};

onMounted(() => {
  fetchCases();
});
</script>

<style scoped lang="scss">
.risk-cases {
  padding: 20px;
}
</style>
