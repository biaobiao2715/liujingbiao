<!--
  标题: CourseDetailComponent.vue
  功能: 文章详情组件
  说明: 显示文章的详细信息，包括文章名称、文章描述、文章图片、文章价格、文章时长、文章讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="container-box">
    <div class="title-box">
      <div class="title">
        <div class="title-text">{{ detail?.articleTitle }}</div>
        <dict-tag :options="article_type" :value="detail?.contentType"></dict-tag>
      </div>
      <div class="user-detail">
        <img src="@/assets/images/tx.png" alt="" />
        <div class="user-detail-peo">{{ '发布人：  ' + detail?.authorName }}</div>
        <div class="">{{ '发布时间：  ' + detail?.publishTime }}</div>
      </div>
    </div>
    <div>
      <div>
        <div @click="handleCollection">
          <el-icon size="20"><View /></el-icon>
          <span>{{ detail?.viewCount }}</span>
          <el-icon size="20" v-if="!isCollected"><Star /></el-icon>
          <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail?.favoriteCount }}</span>
        </div>
      </div>
    </div>
    <!-- 编辑器内容 -->
    <ContentWithToc :content="detail?.articleContent" ref="contentWithTocRef" />
    <!-- 附件部分 -->
    <el-table :data="fileList" class="mt-24">
      <el-table-column prop="fileSuffix" label="附件类型" width="180" />
      <el-table-column prop="originalName" label="文件名" />
      <el-table-column prop="size" label="文件大小" width="180">
        <template #default="scope">
          {{ formatFileSize(scope.row.ext1?.fileSize || 0) }}
        </template>
      </el-table-column>
      <el-table-column prop="downloadUrl" label="操作">
        <template #default="scope">
          <el-button type="text" @click="addDownloadCount(scope.row)">下载</el-button>
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
import { formatFileSize } from '@/utils/fileUtils';
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

const fileList = ref([]);

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
    fileList.value =
      detail.value.commonRelevanceFilesVos.map((item) => {
        return {
          ...item.remoteOssVos[0],
          ext1: JSON.parse(item?.remoteOssVos[0]?.ext1 || '{}')
        };
      }) || [];
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
      articleCover: detail.value.articleCover,
      articleTitle: detail.value.articleTitle,
      articleAuthor: detail.value.authorName
    }
  });
  if (res.code === 200) {
    ElMessage.success(res.msg);
    // 刷新文章详情
    await getArticleDetail();
    // 刷新收藏状态
    await getIsCollect();
  }
};

// 增加下载量
const addDownloadCount = async (item: any) => {
  const response = await fetch(item.url);
  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = item.originalName || 'file.txt';
  a.click();
};
</script>

<style scoped lang="scss">
.container-box {
  .title-box {
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    padding: 26px 0 23px 20px;
    box-sizing: border-box;

    .title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 500;
      font-size: 28px;
      color: #3d3d3d;
      line-height: 21px;
      margin-bottom: 28px;
      .title-text {
        margin-right: 14px;
      }
    }
    .user-detail {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 500;
      font-size: 14px;
      color: #3d3d3d;
      line-height: 20px;
      img {
        width: 30px;
        height: 30px;
        margin-right: 14px;
      }
      .user-detail-peo{

      }
    }
  }
}
</style>
