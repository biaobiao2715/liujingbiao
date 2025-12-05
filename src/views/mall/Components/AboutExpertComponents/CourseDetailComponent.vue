<!--
  标题: CourseDetailComponent.vue
  功能: 课程详情组件
  说明: 显示课程的详细信息，包括课程名称、课程描述、课程图片、课程价格、课程时长、课程讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="course-detail-container">
    <div class="title">{{ detail?.cultivateName }}</div>
    <!-- 课程描述 -->
    <div class="description flex-center gap-24 mt-24 mb-24">
      <!-- 头像 -->
      <img :src="detail?.avatar" width="40" />
      <div>{{ '发布人：  ' + detail?.createBy }}</div>
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
    </div>
    <!-- 编辑器内容 -->
    <ContentWithToc :content="detail?.cultivateContent" ref="contentWithTocRef" />
    <!-- 附件部分 -->
    <el-table :data="detail?.ossVoList" class="mt-24">
      <el-table-column prop="type" label="附件类型" width="180">
        <template #default="scope">
          {{ scope.row.originalName.split('.')[1] }}
        </template>
      </el-table-column>
      <el-table-column prop="originalName" label="文件名" />
      <el-table-column prop="size" label="文件大小" width="180">
        <template #default="scope">
          {{ formatFileSize(JSON.parse(scope.row.ext1)?.fileSize || 0) }}
        </template>
      </el-table-column>
      <el-table-column prop="downloadUrl" label="下载">
        <template #default="scope">
          <el-button type="text" @click="addDownloadCount(scope.row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>
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
