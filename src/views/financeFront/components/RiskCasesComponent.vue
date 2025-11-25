<!--
  标题: RiskCasesComponent.vue
  功能: 风险案例组件
  说明: 展示风险案例列表，用户可以点击查看详情
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-21
-->
<template>
  <div class="risk-cases">
    <div class="section-title flex-center-between mb-12">
      <div>风险案例</div>
      <div class="more" @click="handleMore">查看更多 >></div>
    </div>
    <!-- 列表 -->
    <div class="risk-list">
      <div class="item" v-for="item in cases" :key="item.id" @click="handleDetail(item)">
        <div class="article-title mb-12" @click="handleDetail(item)">{{ item.articleTitle }}</div>
        <div class="article-summary">{{ item.articleSummary }}</div>
      </div>
      <el-empty v-if="cases.length === 0" description="暂无风险案例"></el-empty>
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
  pageSize: 10,
  articleStatus: 2,
  articleType: 3
});

onMounted(() => {
  fetchCases();
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

// 查看详情
const handleDetail = (row: any) => {
  eventBus.emit('showComponentByCommand', { type: 'RiskCasesComponentDetails', id: row.id });
};

// 查看更多
const handleMore = () => {
  eventBus.emit('showComponentByCommand', { type: 'RiskCasesComponentList' });
};
</script>

<style scoped lang="scss">
.risk-cases {
  padding: 20px;
  .section-title {
    height: 20px;
    line-height: 20px;
    font-size: 20px;
    color: #000000;
    border-left: 3px solid #108c58;
    padding-left: 12px;
    .more {
      cursor: pointer;
      font-size: 14px;
      color: rgba(51, 51, 51, 0.5);
    }
  }
  .risk-list {
    background-color: #fff;
    border-radius: 8px;
    padding: 12px;
    .item {
      cursor: pointer;
      background: #f6f7fb;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      .article-title {
        font-weight: 500;
        font-size: 16px;
        color: #3d3d3d;
      }
      .article-summary {
        font-weight: 400;
        font-size: 14px;
        color: #767676;
      }
    }
  }
}
</style>
