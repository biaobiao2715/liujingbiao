<template>
  <div class="essay-container">
    <el-card>
      <template #header>
        <div class="card-header">文章专栏</div>
      </template>

      <div class="essat-list" v-if="articleList?.length > 0">
        <div class="essay flex-center-between" v-for="(article, index) in articleList" :key="index" @click="handleDetail(article)">
          <div class="essay-left flex-center gap-12">
            <div class="title">{{ article.articleTitle }}</div>
            <el-tag type="primary">{{ getArticleType(article.articleType) }}</el-tag>
            <div class="time">{{ article.publishTime }}</div>
          </div>

          <div class="essay-right flex-center gap-12">
            <div class="views flex-center gap-2">
              <el-icon size="20"><View /></el-icon>
              <span>{{ article.viewCount }}</span>
            </div>
            <div class="collection flex-center gap-2">
              <el-icon size="20" v-if="!article.isFavorite"><Star /></el-icon>
              <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
              <span>{{ article.favoriteCount }}</span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else class="essat-list"></el-empty>
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
  .essay-left {
    .title {
      width: 120px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 18px;
      font-weight: bold;
    }
    .time {
      font-size: 14px;
      color: #999;
    }
  }
  .essay-content {
    margin-bottom: 8px;
  }
  .essay-right {
    font-size: 14px;
    color: #666;
  }
}
</style>
