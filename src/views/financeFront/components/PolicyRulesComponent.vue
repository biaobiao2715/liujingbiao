<!-- 政策法规组件 -->
<template>
  <div class="policy-rules">
    <div class="section-title flex-center-between mb-12">
      <div>政策法规</div>
      <div class="more" @click="handleMore">查看更多 >></div>
    </div>
    <div class="card-list" v-loading="loading">
      <el-row :gutter="20">
        <el-col :span="12" v-for="caseItem in cases" :key="caseItem.id">
          <div class="card-item">
            <div class="card-header flex-center">
              <div class="title" @click="handleDetail(caseItem)">
                {{ caseItem.articleTitle }}
              </div>
              <el-tag effect="plain" round :type="tagMap[caseItem.articleType]?.type">{{ tagMap[caseItem.articleType]?.label }}</el-tag>
            </div>
            <div class="card-summary">{{ caseItem.articleSummary }}</div>
          </div>
        </el-col>
      </el-row>
      <el-empty v-if="cases.length === 0" description="政策法规待发布"></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getCreditArticleList } from '@/api/financeFront/RiskCases/index';
import { ElMessage } from 'element-plus';
import { eventBus } from '@/utils/eventBus';
const emit = defineEmits(['detailChange']);

// 列表数据与加载状态
const cases = ref<any[]>([]);
const loading = ref(false);

// 基础查询参数（如需筛选可在此扩展）
const queryParams = ref({
  pageNum: 1,
  pageSize: 12,
  queryParam: '',
  articleStatus: 2,
  articleTypes: ['1', '2', '4', '99'] // 只获取政策法规和行业资讯和其他
});

onMounted(() => {
  fetchCases();
  eventBus.on('financeSearch', (data: any) => {
    if (data.category === 'policy') {
      queryParams.value.pageNum = 1;
      queryParams.value.queryParam = data.queryParam || '';
      fetchCases();
    }
  });
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
// 文章类型：1金融政策 2金融法规 3风险案例 4行业资讯 99其他
// 改成label和type的映射
const tagMap: Record<string, { label: string; type: any }> = {
  '1': { label: '金融政策', type: 'danger' },
  '2': { label: '金融法规', type: 'warning' },
  '3': { label: '风险案例', type: 'primary' },
  '4': { label: '行业资讯', type: 'success' },
  '99': { label: '其他', type: 'info' }
};

// 查看详情
const handleDetail = (row: any) => {
  eventBus.emit('showComponentByCommand', { type: 'PolicyRulesComponentDetails', id: row.id });
};

// 查看更多
const handleMore = () => {
  eventBus.emit('showComponentByCommand', { type: 'PolicyRulesComponentList' });
};
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
    justify-content: center;
    gap: 20px;
    background-color: #fff;
  }

  .card-item {
    padding: 12px;
    cursor: pointer;
    border-bottom: 1px dashed #d8d8d8;
    .card-header {
      margin-bottom: 10px;
      .title {
        width: calc(100% - 240px);
        font-weight: 500;
        font-size: 14px;
        color: #3d3d3d;
        line-height: 16px;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
      }
      .title:hover {
        color: #108c58;
      }
    }

    .card-summary {
      width: 100%;
      font-weight: 400;
      font-size: 14px;
      color: #767676;
      line-height: 16px;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
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
