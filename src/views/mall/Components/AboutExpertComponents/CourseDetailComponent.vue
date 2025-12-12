<!--
  标题: CourseDetailComponent.vue
  功能: 课程详情组件
  说明: 显示课程的详细信息，包括课程名称、课程描述、课程图片、课程价格、课程时长、课程讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="container-box">
    <!-- <div class="title">{{ detail?.cultivateName }}</div>
    <div class="description flex-center gap-24 mt-24 mb-24">
      <img :src="detail?.avatar" width="40" />
      <div>{{ '发布人：  ' + detail?.createName }}</div>
      <div>{{ '发布时间：  ' + detail?.publishTime }}</div>
      <dict-tag :options="cultivate_type" :value="detail?.cultivateType" />
      <div class="flex-center gap-12">
        <div class="views flex-center gap-2">
          <el-icon size="20"><View /></el-icon>
          <span>{{ detail?.pageViews }}</span>
        </div>
        <div class="collection flex-center gap-2" @click="handleCollection">
          <el-icon size="20" v-if="!isCollected"><Star /></el-icon>
          <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail?.collectCount }}</span>
        </div>
      </div>
    </div> -->
    <div class="title-box">
      <div class="title">
        <div class="title-text">{{ detail?.cultivateName }}</div>
        <!-- <dict-tag :options="article_type" :value="detail?.contentType"></dict-tag> -->
      </div>
      <div class="user-detail">
        <img src="@/assets/images/tx.png" alt="" />
        <div class="user-detail-peo">
          {{ '发布人：  ' + detail?.createName }}
        </div>
        <div class="user-detail-time">
          {{ '发布时间：  ' + detail?.publishTime }}
        </div>
        <div class="detail-views">
          <el-icon size="20"><View /></el-icon>
          <span> {{ detail?.pageViews }}</span>
        </div>
        <!-- 收藏 -->
        <div class="detail-collection" @click="handleCollection">
          <el-icon size="20" v-if="!isCollected"><Star /></el-icon>
          <el-icon size="20" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail?.collectCount }}</span>
        </div>
      </div>
      <div class="wzzs-icon">
        <img src="@/assets/images/pxkt@2x.png" alt="" />
      </div>
    </div>
    <!-- 编辑器内容 -->
    <ContentWithToc :content="detail?.cultivateContent" ref="contentWithTocRef" />
    <!-- 附件部分 -->
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
import { courseDetail } from '@/api/mall/expert';
import { addToFavorites, checkFavorite } from '@/api/mall/index';
import ContentWithToc from '@/components/ContentWithToc/index.vue';
import { formatFileSize } from '@/utils/fileUtils';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { cultivate_type } = toRefs<any>(proxy?.useDict('cultivate_type'));

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});
const detail = ref();

const isCollected = ref(false);

onMounted(() => {
  getArticleDetail();
  getIsCollect();
});

// 详情
const getArticleDetail = async () => {
  const res = await courseDetail({ id: props.id });
  if (res.code === 200) {
    detail.value = res.data || {};
  }
};

// 判断是否收藏过
const getIsCollect = async () => {
  const res = await checkFavorite({
    favoriteType: '4',
    'hnCourseFavoriteBo.courseId': props.id
  });
  if (res.code === 200) {
    isCollected.value = res.data;
  }
};

// 收藏课程
const handleCollection = async () => {
  const res = await addToFavorites({
    favoriteType: '4',
    hnCourseFavoriteBo: {
      courseId: props.id,
      courseTitle: detail.value.cultivateName,
      courseAuthor: detail.value.createBy
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
      height: 100%;
      img {
        width: 139px;
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
