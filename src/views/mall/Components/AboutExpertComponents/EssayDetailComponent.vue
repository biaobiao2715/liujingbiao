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
        <div class="user-detail-peo">
          {{ '发布人：  ' + detail?.authorName }}
        </div>
        <div class="user-detail-time">
          {{ '发布时间：  ' + detail?.publishTime }}
        </div>
        <div class="detail-views">
          <el-icon size="20"><View /></el-icon>
          <span> {{ detail?.viewCount }}</span>
        </div>
        <!-- 收藏 -->
        <div class="detail-collection" @click="handleCollection">
          <el-icon size="20" v-if="!isCollected"><Star /></el-icon>
          <el-icon size="20" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail?.favoriteCount }}</span>
        </div>
      </div>
      <div class="wzzs-icon">
        <img src="@/assets/images/wzzsicon@2x.png" alt="" />
      </div>
    </div>
    <!-- 文章内容部分 -->
    <div class="article-content">
      <div v-html="detail?.articleContent"></div>
    </div>
    <div class="attachment">
      <div class="attachment-title">附件</div>
      <el-table :data="fileList">
        <el-table-column prop="fileSuffix" label="附件类型" />
        <el-table-column prop="originalName" label="附件名称" />
        <el-table-column prop="size" label="附件大小">
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ContentWithToc from '@/components/ContentWithToc/index.vue';
import { getArticle, addViewRecords } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { addToFavorites, checkFavorite } from '@/api/mall/index';
import { formatFileSize } from '@/utils/fileUtils';
// 引入防抖
import { debounce } from 'lodash-es';
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
      detail.value.commonRelevanceFilesVos?.map((item) => {
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
const collectProgress = ref(false);
// 收藏文章 添加防抖
const handleCollection = debounce(async () => {
  if (collectProgress.value) return;
  collectProgress.value = true;
  const res = await addToFavorites({
    favoriteType: '3',
    favoriteArticleBo: {
      articleId: props.id,
      articleCover: detail.value.articleCover,
      articleTitle: detail.value.articleTitle,
      articleAuthor: detail.value.authorName
    }
  });
  collectProgress.value = false;
  if (res.code === 200) {
    ElMessage.success(res.msg);
    // 刷新文章详情
    await getArticleDetail();
    // 刷新收藏状态
    await getIsCollect();
  }
}, 500);

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
    position: relative;
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
      .user-detail-peo {
        margin-right: 40px;
      }
      .user-detail-time {
        margin-right: 39px;
      }
      .detail-views,
      .detail-collection {
        display: flex;
        align-items: center;
        span {
          margin-left: 8px;
        }
      }
      .detail-views {
        margin-right: 44px;
      }
      .detail-collection {
        cursor: pointer;
      }
    }
    .wzzs-icon {
      position: absolute;
      top: 0;
      right: 40px;
      img {
        width: 180px;
        height: 100%;
      }
    }
  }
  .article-content {
    padding: 30px 20px;
    box-sizing: border-box;
    background-color: #ffffff;
    margin-top: 16px;
  }
  .attachment {
    padding: 20px;
    box-sizing: border-box;
    background-color: #ffffff;
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 500;
    margin-top: 16px;
    .attachment-title {
      font-size: 20px;
      padding-left: 9px;
      box-sizing: border-box;
      position: relative;
      &::after {
        content: '';
        display: inline-block;
        width: 3px;
        height: 14px;
        background-color: #108c58;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
      }
    }
  }
}
</style>
