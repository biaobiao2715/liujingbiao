<!--
  标题: CourseDetailComponent.vue
  功能: 普法内容详情组件
  说明: 显示普法内容的详细信息，包括普法内容名称、普法内容描述、普法内容图片、普法内容价格、普法内容时长、普法内容讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="container-box">
    <div class="title-box">
      <div class="title">
        <div class="title-text">{{ detail?.contentTitle }}</div>
        <!-- <dict-tag :options="article_type" :value="detail?.contentType"></dict-tag> -->
      </div>
      <div class="user-detail">
        <img src="@/assets/images/tx.png" alt="" />
        <div class="user-detail-peo">
          {{ '发布人：  ' + detail?.authorName }}
        </div>
        <div class="user-detail-time">
          {{ '发布时间：  ' + detail?.createTime }}
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
      <div v-html="detail?.contentContent"></div>
    </div>
    <div class="attachment">
      <div class="attachment-title">附件</div>
      <el-table :data="detail?.sysOssLists">
        <el-table-column prop="fileSuffix" label="附件类型" />
        <el-table-column prop="originalName" label="附件名称" />
        <el-table-column prop="size" label="附件大小">
          <template #default="scope">
            {{ formatFileSize(JSON.parse(scope.row.ext1)?.fileSize || 0) }}
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

const getContentType = (type: string) => {
  switch (type) {
    case '1':
      return '法律法规';
    case '2':
      return '政策解读';
    case '3':
      return '案例分析';
    case '4':
      return '司法判决';
    default:
      return '未知类型';
  }
};
// 增加浏览量
const addViewCount = async () => {
  addViewRecords(props.id.toString()).then((res) => {
    console.log(res.data);
  });
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

  addDownloadRecords({
    id: props.id,
    ossVoList: detail.value.sysOssLists || []
  }).then((res) => {
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
