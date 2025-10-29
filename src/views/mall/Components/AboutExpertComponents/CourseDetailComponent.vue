<!--
  标题: CourseDetailComponent.vue
  功能: 课程详情组件
  说明: 显示课程的详细信息，包括课程名称、课程描述、课程图片、课程价格、课程时长、课程讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="course-detail-container">
    <div class="title">{{ detail.title }}</div>
    <!-- 课程描述 -->
    <div class="description flex-center gap-24 mt-24 mb-24">
      <!-- 头像 -->
      <img :src="detail.avatar" width="40" />
      <div>{{ '发布人：  ' + detail.name }}</div>
      <div>{{ '发布时间：  ' + detail.createTime }}</div>
      <el-tag type="primary">{{ detail.tyle }}</el-tag>
      <div class="flex-center gap-12">
        <div class="views flex-center gap-2">
          <el-icon size="20"><View /></el-icon>
          <span>{{ detail.views }}</span>
        </div>
        <div class="collection flex-center gap-2" @click="handleCollection">
          <el-icon size="20" v-if="!detail.isCollected"><Star /></el-icon>
          <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail.collection }}</span>
        </div>
      </div>
    </div>
    <!-- 编辑器内容 -->
    <div></div>
    <!-- 附件部分 -->
    <el-table :data="detail.attachments">
      <el-table-column prop="type" label="附件类型" width="180" />
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="size" label="文件大小" width="180" />
      <el-table-column prop="downloadUrl" label="下载链接" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const detail = ref({
  title: '黄芩的种植方法和时间',
  avatar: '/path/to/avatar.jpg',
  name: '李春雷',
  createTime: '2025-10-29 12:00:00',
  tyle: '农技',
  views: 1234,
  collection: 89,
  isCollected: false,
  date: '2019-11-02 12:23:00',
  attachments: [
    { type: 'pdf', name: '课程资料1.pdf', size: '2MB', downloadUrl: '/path/to/file1.pdf' },
    { type: 'docx', name: '课程资料2.docx', size: '1.5MB', downloadUrl: '/path/to/file2.docx' }
  ]
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
