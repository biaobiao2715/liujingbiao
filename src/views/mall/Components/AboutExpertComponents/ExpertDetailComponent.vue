<!--
  标题: ExpertDetailComponent.vue
  功能: 专家详情组件
  说明: 专家详情组件，包含专家的详情信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <el-dialog v-model="dialogVisible" class="expert-detail-card">
    <!-- 专家信息 -->
    <div class="expert-info">
      <el-row>
        <el-col :span="6">
          <el-avatar shape="square" size="large" :src="expert.avatar"></el-avatar>
        </el-col>
        <el-col :span="18">
          <div>{{ expert.name }} - {{ expert.specialty }}</div>
          <div>{{ expert.introduction }}</div>
          <el-row>
            <el-col :span="12">
              <el-statistic title="咨询量" :value="expert.consultationCount" />
            </el-col>
            <el-col :span="12">
              <el-statistic title="回复量" :value="expert.replyCount" />
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </div>

    <!-- 专家问答 -->
    <div class="expert-qa">
      <h4>专家问答</h4>
      <el-collapse>
        <el-collapse-item v-for="(qa, index) in expert.qaList" :key="index" :title="qa.question">
          <p>{{ qa.answer }}</p>
        </el-collapse-item>
      </el-collapse>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dialogVisible = ref(false);

const expertId = ref<string | null>(null);

const expert = ref({
  name: '张三',
  specialty: 'XXX专业',
  introduction: '湖北省高级农艺师，主要从事全县农技推广工作。',
  consultationCount: 1000,
  replyCount: 2000,
  avatar: '/path/to/expert-avatar.jpg',
  qaList: [
    {
      question: '种植玉米需要预防的病虫害有哪些？',
      answer: '玉米常发病虫害有炭疽病、叶枯病、疫病等。'
    },
    {
      question: '如何提高玉米产量？',
      answer: '合理施肥、科学灌溉、病虫害防治是关键。'
    }
  ]
});

// 打开专家详情弹窗
const openDialog = (id: string) => {
  dialogVisible.value = true;
  expertId.value = id;
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
