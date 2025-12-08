<template>
  <div class="essay-container">
    <div class="header flex-center-between">
      <div class="title">文章专栏</div>
      <div class="more flex-center gap-4" @click="handleMoreList()">
        <div>查看更多</div>
        <img src="@/assets/mall/more.png" width="18" />
      </div>
    </div>

    <div class="essat-list" v-if="articleList?.length > 0">
      <div class="essay flex-between" v-for="(article, index) in articleList" :key="index" @click="handleDetail(article)">
        <div class="essay-left flex-between gap-12">
          <div class="base-info flex-between">
            <div class="icon-name flex-center gap-8">
              <img src="@/assets/mall/essay-icon.png" width="20" />
              <div class="essay-title">{{ article.articleTitle }}</div>
            </div>
            <div class="collect-view flex-center gap-12">
              <div class="collection flex-center gap-2">
                <el-icon size="16" v-if="!article.isFavorite"><Star /></el-icon>
                <el-icon size="20" color="#ff9800" v-else> <StarFilled /></el-icon>
                <span>{{ article.favoriteCount }}</span>
              </div>
              <div class="views flex-center gap-2">
                <el-icon size="16"><View /></el-icon>
                <span>{{ article.viewCount }}</span>
              </div>
            </div>
          </div>

          <dict-tag :options="article_type" :value="article.articleType" />
          <div class="description">{{ article?.articleSummary }}</div>
          <div class="time">{{ article?.publishTime }}</div>
        </div>

        <div class="essay-right">
          <img :src="article.articleCover" width="280" height="160" />
        </div>
      </div>
    </div>
    <el-empty v-else class="essat-list"></el-empty>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { listArticles } from '@/api/expertServicePlatform/knowledgeBaseManage';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));

const emit = defineEmits(['detailChange']);

const articleList = ref();

onMounted(() => {
  getArticleList();
});

const getArticleList = async () => {
  const res = await listArticles({
    articleStatus: '2', // 已发布
    pageNum: 1,
    pageSize: 999
  });
  articleList.value = res.rows || [];
};

const handleDetail = (article: any) => {
  emit('detailChange', { type: 'essayDetail', id: article.id });
};

const handleMoreList = () => {
  emit('detailChange', { type: 'essayList' });
};
</script>

<style scoped lang="scss">
.essay-container {
  flex: 2;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  .header {
    padding: 20px;
    background: linear-gradient(to bottom, rgba(16, 140, 88, 0.1), #fff);
    .title {
      color: #3d3d3d;
      font-size: 20px;
      font-weight: bold;
      border-left: 4px solid #108c58;
      padding-left: 8px;
      line-height: 16px;
    }
    .more {
      cursor: pointer;
      color: rgba(51, 51, 51, 0.8);
      font-size: 14px;
      &:hover {
        color: var(--color-main);
      }
    }
  }
}

.card-header {
  font-size: 20px;
  font-weight: bold;
}

.essat-list {
  height: 640px;
  overflow: auto;
  padding: 0 20px;
}

.essay {
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  .essay-left {
    flex-direction: column;
    .essay-title {
      width: 340px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 16px;
      color: #333333;
      font-weight: bold;
    }
    .description {
      height: 60px;
      width: 420px;
      line-height: 20px;
      font-size: 14px;
      color: #3d3d3d;
      overflow: hidden;
      display: -webkit-box; /* 添加多行省略号支持 */
      -webkit-line-clamp: 3; /* 限制显示的行数 */
      -webkit-box-orient: vertical; /* 设置盒子方向为垂直 */
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
    img {
      border-radius: 8px;
    }
  }
}
</style>
