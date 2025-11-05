<template>
  <div class="expert-container">
    <div class="show-area" v-if="showArea === 'area'">
      <!-- 专家咨询 -->
      <ConsultationComponent @detailChange="showDetail" />
      <!-- 专家问答 -->
      <QAComponent @detailChange="showDetail" />
      <!-- 培训课程会议 -->
      <CourseMeetingComponent @detailChange="showDetail" />
      <div class="flex gap-24">
        <!-- 文章专栏 -->
        <EssayComponent @detailChange="showDetail" />
        <!-- 普法专栏 -->
        <PopularizLawComponent @detailChange="showDetail" />
      </div>
      <!-- 直播 -->
      <LivingComponent @detailChange="showDetail" />
    </div>
    <!-- 问答详情 -->
    <QADetailComponent v-if="showArea === 'qaDetail'" />
    <!-- 文章详情 -->
    <EssayDetailComponent v-if="showArea === 'essayDetail'" />
    <!-- 课程详情 -->
    <CourseDetailComponent v-if="showArea === 'courseDetail'" :id="id" />
    <!-- 会议详情 -->
    <MeetingDetailComponent v-if="showArea === 'meetingDetail'" :id="id" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ConsultationComponent from './AboutExpertComponents/ConsultationComponent.vue'; // 咨询组件
import QAComponent from './AboutExpertComponents/QAComponent.vue'; // 问答组件
import EssayComponent from './AboutExpertComponents/EssayComponent.vue'; // 文章组件
import PopularizLawComponent from './AboutExpertComponents/PopularizLawComponent.vue'; // 普法组件
import QADetailComponent from './AboutExpertComponents/QADetailComponent.vue'; // 问答详情组件
import EssayDetailComponent from './AboutExpertComponents/EssayDetailComponent.vue'; // 文章详情组件
import CourseMeetingComponent from './AboutExpertComponents/CourseMeetingComponent.vue'; // 课程会议组件
import CourseDetailComponent from './AboutExpertComponents/CourseDetailComponent.vue'; // 课程详情组件
import MeetingDetailComponent from './AboutExpertComponents/MeetingDetailComponent.vue'; // 会议详情组件
import LivingComponent from './AboutExpertComponents/LivingComponent.vue'; // 直播组件

type showAreaType = 'area' | 'qaDetail' | 'essayDetail' | 'courseDetail' | 'meetingDetail' | 'livingDetail';

const showArea = ref('area');

const id = ref(null);

// 展示对应的详情组件
const showDetail = (incomeData: { type: showAreaType; id: string }) => {
  console.log(incomeData);
  id.value = incomeData.id;
  showArea.value = incomeData.type;
};
</script>

<style scoped lang="scss">
.expert-container {
  padding: 12px;
}
</style>
