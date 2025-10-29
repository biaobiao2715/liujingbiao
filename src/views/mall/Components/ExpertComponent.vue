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
    </div>
    <!-- 问答详情 -->
    <QADetailComponent v-if="showArea === 'qaDetail'" />
    <!-- 文章详情 -->
    <EssayDetailComponent v-if="showArea === 'essayDetail'" />
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

type showAreaType = 'area' | 'qaDetail' | 'essayDetail';

const showArea = ref('area');

const showDetail = (incomeData: { type: showAreaType; data: any }) => {
  console.log(incomeData);
  showArea.value = incomeData.type;
};
</script>

<style scoped lang="scss">
.expert-container {
  padding: 12px;
}
</style>
