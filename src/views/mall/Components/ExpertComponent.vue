<template>
  <div class="expert-container">
    <div class="show-area" v-if="showArea === 'area'">
      <!-- 轮播图组件 -->
      <BannerComponent />
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
    <div v-if="showArea !== 'area'">
      <!-- 面包屑导航 -->
      <el-breadcrumb :separator-icon="ArrowRight" class="mb-24">
        <el-breadcrumb-item @click="showArea = 'area'" style="cursor: pointer">专家专区</el-breadcrumb-item>
        <el-breadcrumb-item>{{ secondTitle }}</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 专家详情 -->
      <ExpertDetailComponent v-if="showArea === 'expertDetail'" :id="id" :type="expertType" />
      <!-- 问答列表 -->
      <QAListComponent v-if="showArea === 'qaMoreList'"  @detailChange="showDetail"/>
      <!-- 问答详情 -->
      <QADetailComponent v-if="showArea === 'qaDetail'" :id="id" />
      <!-- 文章专栏列表 -->
      <EssayListComponent v-if="showArea === 'essayList'" />
      <!-- 文章详情 -->
      <EssayDetailComponent v-if="showArea === 'essayDetail'" :id="id" />
      <!-- 培训课程+会议的列表 -->
      <CouMetListComponent v-if="showArea === 'couMetList'" />
      <!-- 课程详情 -->
      <CourseDetailComponent v-if="showArea === 'courseDetail'" :id="id" />
      <!-- 会议详情 -->
      <MeetingDetailComponent v-if="showArea === 'meetingDetail'" :id="id" />
      <!-- 普法专栏列表 -->
      <LawListComponent v-if="showArea === 'lawList'" />
      <!-- 普法内容详情 -->
      <LawContentDetailComponent v-if="showArea === 'lawContentDetail'" :id="id" />
      <!-- 普法活动详情 -->
      <LawActivityDetailComponent v-if="showArea === 'lawActivityDetail'" :id="id" />
      <!-- 普法白皮书 -->
      <LawWhiteDetailComponent v-if="showArea === 'whitepaperDetail'" :id="id" />
      <!-- 直播列表 -->
      <LivingListComponent v-if="showArea === 'livingList'" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';

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
import LawContentDetailComponent from './AboutExpertComponents/LawContentDetailComponent.vue'; // 普法内容详情组件
import LawActivityDetailComponent from './AboutExpertComponents/LawActivityDetailComponent.vue'; // 普法活动详情组件
import LawWhiteDetailComponent from './AboutExpertComponents/LawWhiteDetailComponent.vue'; // 普法白皮书组件
import BannerComponent from './AboutExpertComponents/BannerComponent.vue'; // 轮播图组件
import ExpertDetailComponent from './AboutExpertComponents/ExpertDetailComponent.vue'; // 专家详情组件
import QAListComponent from './AboutExpertComponents/QAListComponent.vue'; // 问答列表组件
import CouMetListComponent from './AboutExpertComponents/CouMetListComponent.vue'; // 培训课程+会议的列表组件
import EssayListComponent from './AboutExpertComponents/EssayListComponent.vue'; // 文章专栏列表组件
import LawListComponent from './AboutExpertComponents/LawListComponent.vue'; // 普法专栏列表组件
import LivingListComponent from './AboutExpertComponents/LivingListComponent.vue'; // 直播列表组件
type showAreaType =
  | 'area'
  | 'expertDetail'
  | 'qaMoreList'
  | 'qaDetail'
  | 'essayList'
  | 'essayDetail'
  | 'couMetList'
  | 'courseDetail'
  | 'meetingDetail'
  | 'livingDetail'
  | 'lawList'
  | 'lawContentDetail'
  | 'lawActivityDetail'
  | 'whitepaperDetail'
  | 'livingList';

const id = ref(null); // 详情ID

const showArea = ref('area');

const expertType = ref(''); // 专家类型

const secondTitle = computed(() => {
  switch (showArea.value) {
    case 'expertDetail':
      return '专家详情';
    case 'qaMoreList':
      return '问答列表';
    case 'qaDetail':
      return '问答详情';
    case 'essayList':
      return '文章专栏';
    case 'essayDetail':
      return '文章详情';
    case 'couMetList':
      return '培训课堂';
    case 'courseDetail':
      return '课程详情';
    case 'meetingDetail':
      return '会议详情';
    case 'livingDetail':
      return '直播详情';
    case 'lawList':
      return '普法专栏';
    case 'lawContentDetail':
      return '普法内容详情';
    case 'lawActivityDetail':
      return '普法活动详情';
    case 'whitepaperDetail':
      return '普法白皮书详情';
    case 'livingList':
      return '直播列表';
    default:
      return '';
  }
});

// 展示对应的详情组件
const showDetail = (incomeData: { type: showAreaType; id: string; expertType?: string }) => {
  console.log(incomeData, '-=-=-=-=-=-=-=');
  id.value = incomeData.id;
  expertType.value = incomeData.expertType || '';
  showArea.value = incomeData.type;
};
</script>

<style scoped lang="scss">
.expert-container {
  padding: 12px;
}
</style>
