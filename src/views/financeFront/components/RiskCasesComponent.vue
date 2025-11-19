<template>
  <div class="risk-cases">
    <h2>风险案例</h2>
    <el-table :data="cases" style="width: 100%" v-loading="loading" @row-click="handleClick">
      <el-table-column prop="articleTitle" label="案例标题" />
      <el-table-column prop="articleSummary" label="案例简介" />
      <el-table-column prop="publishTime" label="发布时间" width="180">
        <template #default="scope">
          <span>{{ scope.row.publishTime || '--' }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCreditArticleList } from '@/api/financeFront/RiskCases/index';
import { ElMessage } from 'element-plus';
const emit = defineEmits(['detailChange']);

// 列表数据与加载状态
const cases = ref<any[]>([]);
const loading = ref(false);

// 基础查询参数（如需筛选可在此扩展）
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  articleStatus: 2,
  articleType: 3
});

// 获取列表数据
const fetchCases = async () => {
  loading.value = true;
  try {
    const res: any = await getCreditArticleList(queryParams.value);
    if (res && res.code === 200) {
      cases.value = res.rows || res.data || [];
    } else {
      ElMessage.error(res?.msg || '获取风险案例列表失败');
    }
  } catch (e) {
    ElMessage.error('获取风险案例列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleClick = (row: any) => {
  emit('detailChange', { type: 'RiskCasesComponentDetails', id: row.id });
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
