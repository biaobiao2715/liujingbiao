<template>
  <div class="essay-container">
    <el-card>
      <template #header>
        <div class="card-header">文章专栏</div>
      </template>

      <div class="essat-list">
        <div class="essay" v-for="(article, index) in articleList" :key="index" @click="handleDetail(article)">
          <div class="essay-title">
            {{ article.articleTitle }}
            <el-tag type="primary">{{ getArticleType(article.articleType) }}</el-tag>
          </div>
          <!-- articleCover 封面url -->
          <div class="essay-content">
            <p>{{ article.articleContent }}</p>
            <div class="essay-footer flex-center gap-12">
              <div class="views flex-center gap-2">
                <el-icon size="20"><View /></el-icon>
                <span>{{ article.viewCount }}</span>
              </div>
              <div class="collection flex-center gap-2">
                <el-icon size="20" v-if="!article.isCollected"><Star /></el-icon>
                <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
                <span>{{ article.favoriteCount }}</span>
              </div>
              <div>{{ article.publishTime }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { listArticles } from '@/api/expertServicePlatform/knowledgeBaseManage';

const emit = defineEmits(['detailChange']);

const articleList = ref();

onMounted(() => {
  getArticleList();
});

const getArticleList = async () => {
  const res = await listArticles({
    pageNum: 1,
    pageSize: 999
  });
  articleList.value = res.rows || [];
};

// 获取文章类型

// 文章类型：1种子技术类 2农资农具技术类 99其他

const getArticleType = (type: string) => {
  switch (type) {
    case '1':
      return '种子技术类';
    case '2':
      return '农资农具技术类';
    case '99':
      return '其他';
    default:
      return '未知';
  }
};

const handleDetail = (article: any) => {
  emit('detailChange', { type: 'essayDetail', id: article.id });
};
</script>

<style scoped lang="scss">
.essay-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 2;
}
.card-header {
  font-size: 20px;
  font-weight: bold;
}

.essat-list {
  height: 600px;
  overflow: auto;
}

.essay {
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  .essay-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  .essay-content {
    margin-bottom: 8px;
  }
  .essay-footer {
    font-size: 14px;
    color: #666;
  }
}
</style>
