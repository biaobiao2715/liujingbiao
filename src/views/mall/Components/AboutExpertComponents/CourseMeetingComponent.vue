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
              <img :src="course.cultivateCoverId" class="course-image" />
              <div class="hot flex-center">
                <div class="views flex-center gap-2">
                  <el-icon size="20"><View /></el-icon>
                  <span>{{ course.pageViews }}</span>
                </div>
                <div class="collection flex-center gap-2">
                  <el-icon size="20" v-if="!course.isCollected"><Star /></el-icon>
                  <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
                  <span>{{ course.collectCount }}</span>
                </div>
              </div>
              <div class="course-info">
                <div class="course-title">{{ course.cultivateName }}</div>
                <div class="course-type">{{ course.cultivateType === '0' ? '农业知识' : '法律知识' }}</div>
                <div class="course-time">{{ '发布时间 ' + course.publishTime }}</div>
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
import { ref, onMounted } from 'vue';
import { courseCultivateList, meetingCultivateList } from '@/api/mall/expert';

const emit = defineEmits(['detailChange']);
const tabsList = [
  { label: '培训课程', value: 'course' },
  { label: '培训会议', value: 'meeting' }
];

const activeTab = ref('course');
const courseList = ref([]);
const meetingList = ref([]);

// 页面加载时调用接口
onMounted(() => {
  fetchCourseList();
  fetchMeetingList();
});

// 获取培训课程列表
const fetchCourseList = async () => {
  const response = await courseCultivateList({});
  courseList.value = response.rows || [];
};

// 获取培训会议列表
const fetchMeetingList = async () => {
  const response = await meetingCultivateList({});

  meetingList.value = response.rows || [];
  console.log(meetingList.value);
};

// 点击课程或会议时触发方法，传递课程或会议数据
const handleClick = (type: string, course: any) => {
  // emit('detailChange', { type, data: course });
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
