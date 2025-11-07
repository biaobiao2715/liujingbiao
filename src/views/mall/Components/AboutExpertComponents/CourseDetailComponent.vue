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
      <el-tag type="primary">{{ detail?.cultivateType === '0' ? '农业知识' : '法律知识' }}</el-tag>
      <div class="flex-center gap-12">
        <div class="views flex-center gap-2">
          <el-icon size="20"><View /></el-icon>
          <span>{{ detail?.pageViews }}</span>
        </div>
        <div class="collection flex-center gap-2" @click="handleCollection">
          <el-icon size="20" v-if="!detail?.isCollected"><Star /></el-icon>
          <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail?.collectCount }}</span>
        </div>
      </div>
    </div>
    <!-- 编辑器内容 -->
    <ContentWithToc :content="detail?.cultivateContent" ref="contentWithTocRef" />
    <!-- 附件部分 -->
    <el-table :data="detail?.attachments">
      <el-table-column prop="type" label="附件类型" width="180" />
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="size" label="文件大小" width="180" />
      <el-table-column prop="downloadUrl" label="下载链接" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { courseDetail } from '@/api/mall/expert';
import ContentWithToc from '@/components/ContentWithToc/index.vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});
const detail = ref();

onMounted(() => {
  // 根据传入的ID获取课程详情
  courseDetail({ id: props.id }).then((res) => {
    detail.value = res.data || {};
  });
});

// 收藏课程
const handleCollection = () => {};
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
