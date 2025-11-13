<!--
  标题: ContentDetailDialog.vue
  功能: 金融内容详情弹窗
  说明: 用于查看金融文章的详细信息
  当前版本: 1.0
-->
<template>
  <div class="content-detail-dialog" v-loading="loading">
    <div class="article-header">
      <h2 class="article-title">{{ detailData.articleTitle || '--' }}</h2>
    </div>

    <el-divider />

    <div class="article-meta">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文章来源">
          {{ detailData.articleSource || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="文章类型">
          <dict-tag :options="art_article_type" :value="detailData.articleType" />
        </el-descriptions-item>
        <el-descriptions-item label="创建时间">
          {{ parseTime(detailData.createTime) || '--' }}
        </el-descriptions-item>
        <el-descriptions-item label="修改时间">
          {{ parseTime(detailData.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') || '--' }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="article-content">
      <div class="section-title">文章简介</div>
      <div class="intro-text">{{ detailData.articleSummary || '--' }}</div>

      <div class="section-title">文章内容</div>
      <div class="content-text" v-html="detailData.articleContent || '--'"></div>
    </div>

    <div class="footer-actions">
      <el-button @click="handleBack">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { getCreditArticleDetail } from '@/api/creditPlatform/contentManage';
import { parseTime } from '@/utils/ruoyi';

const props = defineProps<{
  id?: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { art_article_type } = toRefs<any>(proxy?.useDict('art_article_type'));

const loading = ref(false);
const detailData = ref<any>({});

const fetchDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少内容ID');
    return;
  }

  loading.value = true;
  try {
    const response: any = await getCreditArticleDetail(props.id as string);
    if (response && response.code === 200) {
      detailData.value = response.data || {};
    } else {
      ElMessage.error(response?.msg || '获取详情失败');
    }
  } catch (error) {
    ElMessage.error('获取详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  emit('cancel');
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.content-detail-dialog {
  padding: 20px;
}

.article-header {
  text-align: center;
  margin-bottom: 20px;

  .article-title {
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    margin: 0;
  }
}

.article-meta {
  margin-bottom: 24px;
}

.article-content {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 24px 0 12px;
    padding-left: 12px;
    border-left: 4px solid #409eff;
  }

  .intro-text {
    padding: 16px;
    background: #f5f7fa;
    border-radius: 4px;
    color: #606266;
    line-height: 1.8;
    margin-bottom: 20px;
  }

  .content-text {
    padding: 16px;
    line-height: 1.8;
    color: #303133;
    word-break: break-word;
    min-height: 200px;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}

.footer-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}
</style>
