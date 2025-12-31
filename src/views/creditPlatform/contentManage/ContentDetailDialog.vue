<!--
  标题: ContentDetailDialog.vue
  功能: 金融内容详情弹窗
  说明: 用于查看金融文章的详细信息
  当前版本: 1.0
  开发信息: Created by 门世超 2025-10-20, Refactored 2025-11-22
-->
<template>
  <div class="content-detail-dialog" v-loading="loading">
    <div class="detail-form">
      <div class="form-row">
        <div class="form-label">文章标题</div>
        <div class="form-value">{{ detailData.articleTitle || '--' }}</div>
      </div>

      <div class="form-row">
        <div class="form-label">文章来源</div>
        <div class="form-value">{{ detailData.articleSource || '--' }}</div>
      </div>

      <div class="form-row">
        <div class="form-label">文章类型</div>
        <div class="form-value">
          <dict-tag :options="art_article_type" :value="detailData.articleType" />
        </div>
      </div>

      <div class="form-row">
        <div class="form-label">创建时间</div>
        <div class="form-value">{{ parseTime(detailData.createTime) || '--' }}</div>
      </div>

      <div class="form-row">
        <div class="form-label">修改时间</div>
        <div class="form-value">{{ parseTime(detailData.updateTime, '{y}-{m}-{d} {h}:{i}:{s}') || '--' }}</div>
      </div>

      <div class="form-row">
        <div class="form-label">文章简介</div>
        <div class="form-value">{{ detailData.articleSummary || '--' }}</div>
      </div>

      <div class="form-row">
        <div class="form-label">文章内容</div>
        <div class="form-value" v-html="detailData.articleContent || '--'"></div>
      </div>
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

.detail-form {
  .form-row {
    display: flex;
    margin-bottom: 20px;
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }
  }

  .form-label {
    width: 120px;
    flex-shrink: 0;
    color: #909399;
    font-size: 14px;
    text-align: left;
    padding-right: 12px;
  }

  .form-value {
    flex: 1;
    color: #303133;
    font-size: 14px;
    word-break: break-word;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }
  }
}
</style>
