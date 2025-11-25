<!--
  标题: CourseDetailComponent.vue
  功能: 普法内容详情组件
  说明: 显示普法内容的详细信息，包括普法内容名称、普法内容描述、普法内容图片、普法内容价格、普法内容时长、普法内容讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="law-content-detail-container">
    <div class="title">{{ detail?.contentTitle }}</div>
    <!-- 课程描述 -->
    <div class="description flex-center-between gap-24 mt-24 mb-24">
      <div class="content-title-box">{{ detail?.contentTitle }}</div>
      <div class="flex-center gap-24">
        <div>{{ '发布人：  ' + detail?.authorName }}</div>
        <div>{{ '发布时间：  ' + detail?.createTime }}</div>
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
    <div class="content-display" v-html="detail?.contentContent"></div>
    <!-- 附件部分 -->
    <el-table :data="detail?.sysOssLists" class="mt-24">
      <el-table-column prop="fileSuffix" label="附件类型" width="180" />
      <el-table-column prop="originalName" label="文件名" show-overflow-tooltip />
      <!-- 下载量 -->
      <!-- <el-table-column prop="downloadCount" label="下载量" width="180">
        <template #default="scope">
          {{ detail.downloadCount }}
        </template>
      </el-table-column> -->
      <el-table-column prop="size" label="文件大小" width="180">
        <template #default="scope">
          {{ formatFileSize(JSON.parse(scope.row.ext1).fileSize) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button type="text" @click="addDownloadCount(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getContentDetail } from '@/api/expertServicePlatform/legalServiceManage/contentManage';
import { addViewRecords, addDownloadRecords } from '@/api/mall/expert';
import { formatFileSize } from '@/utils/fileUtils';
import { addToFavorites, checkFavorite } from '@/api/mall/index';

const props = defineProps({
  id: {
    type: Number,
    required: true
  }
});

const detail = ref();

const isCollected = ref(false);

onMounted(async () => {
  await getLawContentDetail();
  await addViewCount();
  await getIsCollect();
});

// 获取普法内容详情
const getLawContentDetail = async () => {
  // 根据传入的ID获取课程详情
  getContentDetail(props.id).then((res) => {
    if (res.code === 200) {
      detail.value = res.data || {};
    }
  });
};
// 增加浏览量
const addViewCount = async () => {
  addViewRecords(props.id.toString()).then((res) => {
    console.log(res.data);
    detail.value.pageViews = res.data || 0;
  });
};

// 增加下载量
const addDownloadCount = async (item: any) => {
  // 利用a标签 下载文件到本地
  const a = document.createElement('a');
  a.href = item.url;
  a.target = '_blank';
  a.download = item.name || '';
  document.body.appendChild(a);
  a.click();
  // 移除a标签
  document.body.removeChild(a);

  addDownloadRecords({
    id: props.id,
    ossVoList: detail.value.sysOssLists || []
  }).then((res) => {
    console.log(res.data);
    detail.value.downloadCount++;
  });
};

// 判断是否收藏过
const getIsCollect = async () => {
  const res = await checkFavorite({
    favoriteType: '5',
    'hnLawFavoriteBo.id': props.id
  });
  if (res.code === 200) {
    isCollected.value = res.data;
  }
};

// 收藏课程
const handleCollection = async () => {
  const res = await addToFavorites({
    favoriteType: '5',
    hnLawFavoriteBo: {
      contentId: props.id,
      contentTitle: detail.value.contentTitle,
      contentAuthor: detail.value.authorName
    }
  });
  if (res.code === 200) {
    ElMessage.success(res.msg);
    // 刷新详情
    await getLawContentDetail();
    // 刷新收藏状态
    await getIsCollect();
  }
};
</script>

<style scoped lang="scss">
.law-content-detail-container {
  padding: 12px;
  .title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .description {
    .content-title-box {
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
    .collection {
      cursor: pointer;
    }
  }
  
  .content-display {
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    line-height: 1.8;
    min-height: 400px;
    
    :deep(img) {
      max-width: 100%;
      height: auto;
    }
    
    :deep(p) {
      margin-bottom: 1em;
    }
    
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      font-weight: 600;
    }
  }
}
</style>
