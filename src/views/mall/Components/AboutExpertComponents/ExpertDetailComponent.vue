<!--
  标题: ExpertDetailComponent.vue
  功能: 专家详情组件
  说明: 专家详情组件，包含专家的详情信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <el-dialog v-model="dialogVisible" width="60%" title="专家详情" class="expert-detail-card">
    <!-- 专家信息 -->
    <div class="expert-info">
      <div class="flex gap-12">
        <el-avatar :src="getAvatarUrl(expertDetail.hnBaseRegisterFolderVoList)" />
        <div>
          <div>{{ expertDetail.expertName }} - {{ expertDetail.technicalQualification }}</div>
          <div class="flex gap-24 mt-12">
            <el-statistic title="咨询量" :value="expertDetail.questionCount" />
            <el-statistic title="回复量" :value="expertDetail.answerCount" />
          </div>
        </div>
      </div>

      <div class="mt-12">
        <span>专家简介：</span>
        <span>{{ expertDetail.expertInfo }}</span>
      </div>
    </div>

    <!-- 专家问答 -->
    <div class="expert-qa">
      <h4>专家问答</h4>
      <el-collapse>
        <el-collapse-item v-for="(qa, index) in qaList" :key="index" :title="qa.questionContent">
          <div v-for="value in qa.hnAnswerVoList" :key="value.answerId">{{ value.answerContent }}</div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { technologyExpertDetail, legalExpertDetail, questionList } from '@/api/mall/expert';

const dialogVisible = ref(false);

const expertId = ref<string | null>(null);

const expertDetail = ref();
const qaList = ref([]);

// 打开专家详情弹窗
const openDialog = async (id: string, type: string) => {
  expertId.value = id;
  type === 'technology' ? await getTechnologyExpertDetail() : await getLegalExpertDetail();
  await getQuestionList();
  dialogVisible.value = true;
};

// 获取技术专家详情
const getTechnologyExpertDetail = async () => {
  const res = await technologyExpertDetail(expertId.value);
  if (res.code === 200) {
    expertDetail.value = res.data;
  }
};

// 获取法务专家详情
const getLegalExpertDetail = async () => {
  const res = await legalExpertDetail(expertId.value);
  if (res.code === 200) {
    expertDetail.value = res.data;
  }
};

// 获取问答列表
const getQuestionList = async () => {
  const res = await questionList({
    expertId: expertId.value,
    isAsc: 'desc',
    orderByColumn: 'latestAnswerTime'
  });
  if (res.code === 200) {
    qaList.value = res.rows || [];
  }
};

// 获取头像url
const getAvatarUrl = (imgList) => {
  console.log(imgList);

  return imgList.filter((img) => img.fileType === '0')[0]?.ossInfo.url;
};

defineExpose({
  openDialog
});
</script>

<style scoped lang="scss">
.expert-detail-card {
  padding: 20px;
}

.expert-info {
  margin-bottom: 20px;
}

.expert-qa {
  margin-top: 20px;
}
</style>
