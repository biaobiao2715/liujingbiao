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
        <div class="flex-center gap-24">
          <div class="card-header">专家课程</div>
          <el-segmented v-model="activeTab" :options="tabsList" :disabled="loading" />
        </div>
      </template>

      <div v-loading="loading">
        <!-- 课程 -->
        <el-row :gutter="12" v-if="activeTab === 'course'">
          <el-col :span="6" v-for="(course, index) in courseList" :key="index">
            <el-card shadow="hover">
              <div class="course-item" @click="handleDetail('courseDetail', course.id)">
                <img :src="course.imageFile.url" class="course-image" width="100" />
                <div class="hot flex-center gap-12">
                  <div class="views flex-center gap-2">
                    <el-icon size="20"><View /></el-icon>
                    <span>{{ course.pageViews }}</span>
                  </div>
                  <div class="collection flex-center gap-2">
                    <el-icon size="20" v-if="!course.isFavorite"><Star /></el-icon>
                    <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
                    <span>{{ course.collectCount }}</span>
                  </div>
                </div>
                <div class="course-info">
                  <div class="course-title">{{ course.cultivateName }}</div>
                  <div class="course-type">{{ '课程类型: ' + (course.cultivateType === '0' ? '农业知识' : '法律知识') }}</div>
                  <div class="course-time">{{ '发布时间: ' + course.publishTime }}</div>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-empty description="暂无培训课程信息" v-if="courseList.length === 0" class="margin-center" />
        </el-row>
        <!-- 会议 -->
        <div class="meeting-list" v-else>
          <div class="meeting-item" v-for="(meeting, index) in meetingList" :key="index" @click="handleDetail('meetingDetail', meeting.id)">
            <div class="meeting-title">{{ getMeetingDescription(meeting) }}</div>
          </div>
          <el-empty description="暂无培训会议信息" v-if="meetingList.length === 0" class="margin-center" />
        </div>
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

const loading = ref(false);
const activeTab = ref('course');
const courseList = ref([]);
const meetingList = ref([]);
const pageNum = ref(1);

// 页面加载时调用接口
onMounted(() => {
  fetchCourseList();
  fetchMeetingList();
});

// 获取培训课程列表
const fetchCourseList = async () => {
  const response = await courseCultivateList({ pageNum: pageNum.value, pageSize: 10 });
  courseList.value = response.rows || [];
};

// 获取培训会议列表
const fetchMeetingList = async () => {
  const response = await meetingCultivateList({
    pageNum: pageNum.value,
    pageSize: 10,
    meetingStatus: '1'
  });

  meetingList.value = response.rows || [];
  console.log(meetingList.value);
};

// 拼接成类似于：2025年12月30日将会在中山XXXX，举行农户XXX会议 然后返回
const getMeetingDescription = (meeting: any) => {
  return `${meeting.meetingStartTime}将会在${meeting.meetingAddress}，举行${meeting.meetingName}会议`;
};

// 点击课程或会议时触发方法，传递课程或会议数据
const handleDetail = (type: string, id: string) => {
  console.log(id);
  emit('detailChange', { type, id });
};
</script>

<style scoped lang="scss">
.course-meeting-container {
  margin-bottom: 24px;
}

.meeting-list {
  .meeting-item {
    .meeting-title {
      padding: 12px;
      cursor: pointer;
    }
    .meeting-title:hover {
      color: var(--el-color-primary);
    }
  }
}
.card-header {
  font-size: 20px;
  font-weight: bold;
}
.course-item {
  height: 220px;
  cursor: pointer;
}
.el-col {
  margin-bottom: 16px;
}
</style>
