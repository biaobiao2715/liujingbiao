<!-- 政策法规组件 -->
<template>
  <div class="policy-rules">
    <div class="section-title flex-center-between mb-12">
      <div>政策法规</div>
      <div class="more">查看更多 >></div>
    </div>
    <div class="card-list" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="12" v-for="caseItem in cases" :key="caseItem.id">
          <div class="card-item" @click="handleClick(caseItem)">
            <div class="card-title">{{ caseItem.articleTitle }}</div>
            <div class="card-summary">{{ caseItem.articleSummary }}</div>
            <div class="card-tag">{{ getTag(caseItem.articleType) }}</div>
          </div>
        </el-col>
      </el-row>
    </div>
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
  articleTypes: ['1', '2']
});

// 获取列表数据
const fetchCases = async () => {
  loading.value = true;
  try {
    const res: any = await getCreditArticleList(queryParams.value);
    if (res && res.code === 200) {
      cases.value = res.rows || res.data || [];
    } else {
      ElMessage.error(res?.msg || '获取政策法规列表失败');
    }
  } catch (e) {
    ElMessage.error('获取政策法规列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

// 获取标签文本
const getTag = (type: string) => {
  const tagMap: Record<string, string> = {
    '1': '金融政策',
    '2': '金融法规',
    '3': '行业资讯',
    '4': '其他'
  };
  return tagMap[type] || '未知';
};

const handleClick = (row: any) => {
  emit('detailChange', { type: 'PolicyRulesComponentDetails', id: row.id });
};

onMounted(() => {
  fetchCases();
});
</script>

<style scoped lang="scss">
.policy-rules {
  margin: 24px;
  padding: 18px 12px 12px 12px;
  background: rgba(16, 140, 88, 0.6);
  border-radius: 8px;
  .header {
    font-size: 20px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
  }

  .card-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    background-color: #fff;
  }

  .card-item {
    background-color: #fff;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 15px;
    width: calc(33.333% - 20px);
    cursor: pointer;
    transition: box-shadow 0.3s;

    &:hover {
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .card-title {
      font-size: 16px;
      font-weight: bold;
      color: #333;
      margin-bottom: 10px;
    }

    .card-summary {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .card-tag {
      display: inline-block;
      padding: 5px 10px;
      font-size: 12px;
      color: #fff;
      border-radius: 4px;
      background-color: #409eff;
    }
  }
}
.section-title {
  height: 20px;
  line-height: 20px;
  font-size: 20px;
  color: #fff;
  border-left: 3px solid #fff;
  padding-left: 12px;
  .more {
    cursor: pointer;
    font-size: 14px;
    color: #fff;
  }
}
</style>
