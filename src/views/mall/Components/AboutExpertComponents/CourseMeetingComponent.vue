<!--
  标题: CourseMeetingComponent.vue
  功能: 课程、会议
  说明: 
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="course-meeting-container">
    <el-card>
      <template #header>
        <el-segmented v-model="activeTab" :options="tabsList" />
      </template>

      <!-- 课程 -->
      <el-row :gutter="12" v-if="activeTab === 'course'">
        <el-col :span="6" v-for="(course, index) in courseList" :key="index">
          <el-card shadow="hover">
            <div class="course-item" @click="handleClick('courseDetail', course)">
              <img :src="course.image" class="course-image" />
              <div class="hot flex-center">
                <div class="views flex-center gap-2">
                  <el-icon size="20"><View /></el-icon>
                  <span>{{ course.views }}</span>
                </div>
                <div class="collection flex-center gap-2">
                  <el-icon size="20" v-if="!course.isCollected"><Star /></el-icon>
                  <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
                  <span>{{ course.collection }}</span>
                </div>
              </div>
              <div class="course-info">
                <div class="course-title">{{ course.title }}</div>
                <div class="course-type">{{ course.type }}</div>
                <div class="course-time">{{ '发布时间 ' + course.time }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-empty description="暂无培训课程信息" v-if="courseList.length === 0" />
      </el-row>
      <!-- 会议 -->
      <div class="meeting-list" v-else>
        <div class="meeting-item" v-for="(meeting, index) in meetingList" :key="index" @click="handleClick('meetingDetail', meeting)">
          <div class="meeting-title">{{ meeting.title }}</div>
        </div>
        <el-empty description="暂无培训会议信息" v-if="meetingList.length === 0" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
const emit = defineEmits(['detailChange']);
const tabsList = [
  { label: '培训课程', value: 'course' },
  { label: '培训会议', value: 'meeting' }
];
const activeTab = ref('course');
const courseList = ref([
  {
    image: 'https://img2.baidu.com/it/u=3422222822,2922422222&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375',
    title: '黄芩的种植方法和时间',
    type: '技术课程',
    views: 1234,
    collection: 89,
    isCollected: false,
    time: '2019-11-02 12:23:00'
  },
  {
    image: 'https://img2.baidu.com/it/u=3422222822,2922422222&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375',
    title: '黄芩的种植方法和时间',
    type: '技术课程',
    views: 1234,
    collection: 24,
    isCollected: true,
    time: '2019-11-02 12:23:00'
  },
  {
    image: 'https://img2.baidu.com/it/u=3422222822,2922422222&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375',
    title: '黄芩的种植方法和时间',
    type: '技术课程',
    views: 1234,
    collection: 24,
    isCollected: true,
    time: '2019-11-02 12:23:00'
  },
  {
    image: 'https://img2.baidu.com/it/u=3422222822,2922422222&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375',
    title: '黄芩的种植方法和时间',
    type: '技术课程',
    views: 1234,
    collection: 24,
    isCollected: true,
    time: '2019-11-02 12:23:00'
  },
  {
    image: 'https://img2.baidu.com/it/u=3422222822,2922422222&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=375',
    title: '黄芩的种植方法和时间',
    type: '技术课程',
    views: 1234,
    collection: 24,
    isCollected: true,
    time: '2019-11-02 12:23:00'
  }
]);
const meetingList = ref([
  {
    id: 1,
    title: '2015年将在北京市海淀区组织一次培训会议',
    date: '2025-10-30',
    location: '北京市海淀区'
  },
  {
    id: 2,
    title: '2025年将在上海市浦东新区组织一次培训会议',
    date: '2025-11-15',
    location: '上海市浦东新区'
  }
]);

// 点击课程或会议时触发方法，传递课程或会议数据
const handleClick = (type: string, course: any) => {
  emit('detailChange', { type, data: course });
};
</script>

<style scoped lang="scss">
.course-meeting-container {
  margin-bottom: 24px;
}
.course-item {
  height: 220px;
  cursor: pointer;
}
.el-col {
  margin-bottom: 16px;
}
</style>
