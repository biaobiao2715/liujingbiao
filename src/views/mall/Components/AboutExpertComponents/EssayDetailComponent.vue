<!--
  标题: CourseDetailComponent.vue
  功能: 文章详情组件
  说明: 显示文章的详细信息，包括文章名称、文章描述、文章图片、文章价格、文章时长、文章讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="course-detail-container">
    <div class="title">{{ detail?.articleTitle }}</div>
    <!-- 课程描述 -->
    <div class="description flex-center-between gap-24 mt-24 mb-24">
      <div class="flex-center gap-24">
        <div>{{ '发布人：  ' + detail?.authorName }}</div>
        <div>{{ '发布时间：  ' + detail?.publishTime }}</div>
        <dict-tag :options="article_type" :value="detail?.contentType"></dict-tag>
      </div>
      <div class="flex-center gap-12">
        <div class="views flex-center gap-2">
          <el-icon size="20"><View /></el-icon>
          <span>{{ detail?.viewCount }}</span>
        </div>
        <div class="collection flex-center gap-2" @click="handleCollection">
          <el-icon size="20" v-if="!isCollected"><Star /></el-icon>
          <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail?.favoriteCount }}</span>
        </div>
      </div>
    </div>
    <!-- 编辑器内容 -->
    <ContentWithToc :content="detail?.cultivateContent" ref="contentWithTocRef" />
    <!-- 附件部分 -->
    <el-table :data="detail?.commonRelevanceFilesVos" class="mt-24">
      <el-table-column prop="type" label="附件类型" width="180" />
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="size" label="文件大小" width="180" />
      <el-table-column prop="downloadUrl" label="下载">
        <template #default="scope">
          <el-button type="primary" size="small" :href="scope.row.remoteOssVos" download> 下载 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContentWithToc from '@/components/ContentWithToc/index.vue';
import { getArticle, addViewRecords } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { addToFavorites, checkFavorite } from '@/api/mall/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});
const detail = ref();

const isCollected = ref(false);

onMounted(async () => {
  // 根据传入的ID获取课程详情
  await getArticleDetail();
  // 新增文章浏览量
  addViewRecords(props.id);
  // 判断是否收藏过
  getIsCollect();
});

// 获取文章详情
const getArticleDetail = async () => {
  const res = await getArticle(props.id);
  if (res.code === 200) {
    detail.value = res.data || {};
  }
};

// 判断是否收藏过
const getIsCollect = async () => {
  const res = await checkFavorite({
    favoriteType: '3',
    'favoriteArticleBo.articleId': props.id
  });
  if (res.code === 200) {
    isCollected.value = res.data;
  }
};

// 收藏文章
const handleCollection = async () => {
  const res = await addToFavorites({
    favoriteType: '3',
    favoriteArticleBo: {
      articleId: props.id,
      articleTitle: detail.value.articleTitle,
      articleAuthor: detail.value.authorName
    }
  });
  if (res.code === 200) {
    ElMessage.success(isCollected.value ? '取消收藏' : '收藏成功');
    // 刷新文章详情
    getArticleDetail();
    // 刷新收藏状态
    getIsCollect();
  }
};
</script>

<style scoped lang="scss">
.course-detail-container {
  padding: 12px;
  .title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .description {
    .collection {
      cursor: pointer;
    }
  }
}
</style>
