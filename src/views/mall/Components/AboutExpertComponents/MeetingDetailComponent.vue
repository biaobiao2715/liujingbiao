<!--
  标题: CourseDetailComponent.vue
  功能: 课程详情组件
  说明: 显示课程的详细信息，包括课程名称、课程描述、课程图片、课程价格、课程时长、课程讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="metting-detail-container">
    <div class="title">{{ detail.title }}</div>
    <!-- 课程描述 -->
    <div class="description flex-center gap-24 mt-24 mb-24">
      <!-- 头像 -->
      <img :src="detail.avatar" width="40" />
      <div>{{ '发布人：  ' + detail.name }}</div>
      <div>{{ '发布时间：  ' + detail.createTime }}</div>
      <el-tag type="primary">{{ detail.tyle }}</el-tag>
      <div class="status">
        会议状态：<el-tag>{{ detail.status }}</el-tag>
      </div>
      <div>报名人数：{{ detail.participantCount }}</div>
      <el-button type="primary" @click="handleApply">立即报名</el-button>
    </div>

    <!-- 分割线 -->
    <el-divider></el-divider>
    <!-- 详细信息 -->
    <div class="detail">
      <div>会议主题：{{ detail.title }}</div>
      <div>会议联系人：{{ detail.contact }}</div>
      <div>会议类别：{{ detail.type }}</div>
      <div>会议时间：{{ detail.date }}</div>
      <div>会议地点：{{ detail.location }}</div>
      <div v-if="detail.status === 'canceled'">取消原因：{{ detail.cancelReason }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const detail = ref({
  title: '技术培训会议',
  avatar: '/path/to/avatar.jpg',
  name: '李春雷',
  createTime: '2025-10-29 12:00:00',
  tyle: '技术知识',
  status: 'upcoming', // upcoming, ongoing, completed, canceled
  participantCount: 45,
  contact: '李四',
  type: '技术知识',
  date: '2019-12-12 10:29:00 至 2019-12-12 11:29:00',
  location: '湖北省武汉市汉南区农耕4楼102会议室',
  cancelReason: '因恶劣天气原因，暂取消这次活动'
});

// 报名
const handleApply = () => {};
</script>

<style scoped lang="scss">
.metting-detail-container {
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
