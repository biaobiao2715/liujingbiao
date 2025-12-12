<!--
  标题: CourseMeetingComponent.vue
  功能: 课程、会议
  说明: 
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="course-meeting-container">
    <div class="header flex-center mb-12">
      <div class="flex-center-center gap-24 btns">
        <el-button :type="activeTab === 'course' ? 'primary' : 'info'" round @click="fetchData('course')">培训课程</el-button>
        <el-button :type="activeTab === 'meeting' ? 'primary' : 'info'" round @click="fetchData('meeting')">培训会议</el-button>
      </div>

      <el-tabs v-model="queryParams.orderByColumn" class="demo-tabs" @tab-change="fetchCourseList" v-if="activeTab === 'course'">
        <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.value" />
      </el-tabs>
    </div>

    <div v-loading="loading">
      <!-- 课程 -->
      <!-- <el-scrollbar height="600px" @end-reached="loadMore" v-loading="loading"> -->
      <el-row :gutter="12" v-if="activeTab === 'course'">
        <el-col :span="6" v-for="(course, index) in courseList" :key="index">
          <div class="course-item" @click="handleDetail('courseDetail', course.id)">
            <div class="course-image" :style="{ backgroundImage: 'url(' + course.imageFile.url + ')' }">
              <div class="hot-info flex-center-between">
                <div class="views flex-center gap-4">
                  <el-icon size="15"><View /></el-icon>
                  <span>{{ course.pageViews }}</span>
                </div>
                <div class="collection flex-center gap-4">
                  <el-icon size="16" v-if="!course.isFavorite"><Star /></el-icon>
                  <el-icon size="20" color="#ff9800" v-else> <StarFilled /></el-icon>
                  <span>{{ course.collectCount }}</span>
                </div>
              </div>
            </div>

            <div class="course-info">
              <div class="course-title">{{ course.cultivateName }}</div>
              <div class="course-type flex-center gap-8">
                <div>课程类型:</div>
                <dict-tag :options="cultivate_type" :value="course.cultivateType" />
              </div>
              <div class="course-time">{{ '发布时间:  ' + course.publishTime }}</div>
            </div>
          </div>
        </el-col>
        <el-empty description="暂无培训课程信息" v-if="courseList.length === 0" class="margin-center" />
      </el-row>
      <!-- </el-scrollbar> -->
      <!-- 会议 -->
      <div class="meeting-list" v-else>
        <el-row :gutter="48">
          <el-col :span="12" v-for="meeting in meetingList" :key="meeting.id">
            <div class="meeting-item flex-center" @click="handleDetail('meetingDetail', meeting.id)">
              <div class="point"></div>
              <div class="meeting-title">{{ getMeetingDescription(meeting) }}</div>
            </div>
          </el-col>
        </el-row>
        <el-empty description="暂无培训会议信息" v-if="meetingList.length === 0" class="margin-center" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { courseCultivateList, meetingCultivateList } from '@/api/mall/expert';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { cultivate_type } = toRefs<any>(proxy?.useDict('cultivate_type', 'video_status'));

const emit = defineEmits(['detailChange']);

const loading = ref(false);
const activeTab = ref('course');
const courseList = ref([]);
const meetingList = ref([]);
const queryParams = ref({ pageNum: 1, pageSize: 999, orderBy: 'desc', orderByColumn: 'default' });

const tabs = ref([
  {
    label: '默认排序',
    value: 'default'
  },
  {
    label: '最新发布时间',
    value: 'publishTime'
  },
  {
    label: '最多浏览量',
    value: 'replyCount'
  }
]);

// 页面加载时调用接口
onMounted(() => {
  fetchCourseList();
  fetchMeetingList();
});

// 根据tab切换调用不同接口
const fetchData = (type: string) => {
  queryParams.value.pageNum = 1;
  activeTab.value = type;
  type === 'course' ? fetchCourseList() : fetchMeetingList();
};

// const loadMore = () => {
//   queryParams.value.pageNum += 1;
//   activeTab.value === 'course' ? fetchCourseList() : fetchMeetingList();
// };

// 获取培训课程列表
const fetchCourseList = async () => {
  const response = await courseCultivateList({ pageNum: queryParams.value.pageNum, pageSize: 10, cultivateStatus: '1' });
  courseList.value = response.rows || [];
};

// 获取培训会议列表
const fetchMeetingList = async () => {
  const response = await meetingCultivateList({
    pageNum: queryParams.value.pageNum,
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
  console.log(type,id);
  emit('detailChange', { type, id });
};
</script>

<style scoped lang="scss">
.course-meeting-container {
  margin-bottom: 24px;
  .header {
    justify-content: flex-end;
    .btns {
      width: calc(100% - 80px);
      margin: 0 auto;
      padding-left: 82px;
    }
    .more {
      cursor: pointer;
      margin-left: auto;
      color: rgba(51, 51, 51, 0.8);
      font-size: 14px;
      &:hover {
        color: var(--color-main);
      }
    }
  }
}

.meeting-list {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  .meeting-item {
    gap: 6px;
    border-bottom: 1px dashed #ccc;
    .point {
      width: 8px;
      height: 8px;
      background-color: var(--color-main);
      border-radius: 50%;
      display: inline-block;
    }
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
  // height: 220px;
  cursor: pointer;
  background-color: #fff;
  border-radius: 8px;
  .course-image {
    width: 100%;
    height: 265px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: center;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: end;
    .hot-info {
      background: rgba(0, 0, 0, 0.4);
      padding: 4px 20px;
      font-size: 14px;
      color: #fff;
    }
  }
  .course-info {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 18px;

    .course-title {
      font-size: 16px;
      color: #333;
      font-weight: bold;
    }
    .course-type {
      font-size: 14px;
      color: #333;
    }
    .course-time {
      font-size: 14px;
      color: #a5a5a5;
    }
  }
}
.el-col {
  margin-bottom: 16px;
}
</style>
