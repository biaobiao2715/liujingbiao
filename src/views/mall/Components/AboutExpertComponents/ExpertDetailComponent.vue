<!--
  标题: ExpertDetailComponent.vue
  功能: 专家详情组件
  说明: 专家详情组件，包含专家的详情信息
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->
<template>
  <!-- 专家信息 -->
  <div class="expert-info">
    <!-- 专家卡片介绍 -->
    <div class="expert-card">
      <div class="expert-card-avatar">
        <!-- 头像 -->
        <el-avatar shape="square" style="width: 160px; height: 160px" :src="getAvatarUrl(expertDetail?.hnBaseRegisterFolderVoList)" />
      </div>
      <div class="expert-card-detail">
        <div class="expert-card-name">
          <span>{{ expertDetail?.expertName || '' }}</span>
          <span> {{ expertDetail?.technicalQualification || '' }}</span>
        </div>
        <!-- 专家简介 -->
        <div class="expert-card-info">专家简介：{{ expertDetail?.expertInfo || expertDetail?.professionalSummary || '暂无简介' }}</div>
        <div class="expert-card-number">
          <div class="card-number">
            <div class="card-number-title">{{ expertDetail?.questionCount || 0 }}</div>
            <div class="card-number-text">咨询量</div>
          </div>
          <div class="dividing-line"></div>
          <div class="card-number">
            <div class="card-number-title">{{ expertDetail?.answerCount || 0 }}</div>
            <div class="card-number-text">回复量</div>
          </div>
        </div>
      </div>
      <!-- 我要提问 -->
      <div class="question-box">
        <div class="question-title" @click="handleConsultation()">
          <img src="@/assets/images/twtb@2x.png" />
          <div class="question-title-text">我要提问</div>
        </div>
      </div>
    </div>
    <!-- 专家问答 -->
    <div class="expert-QA-box">
      <div class="QA-box-header">
        <div class="QA-title">专家问答</div>
        <!-- 查看更多 -->
        <div class="QA-more" @click="handleQAList()">
          <span>查看更多 >></span>
        </div>
      </div>
      <div class="QA-list-box">
        <template v-for="item in qaList" :key="item.id">
          <div class="QA-list-item">
            <div class="QA-list-item-title">
              <div class="QA-list-item-title-text">
                <img src="@/assets/images/wt@2x.png" style="width: 28px; height: 28px" />
                <div class="wd-text">{{ item.questionContent }}</div>
              </div>
              <div class="QA-list-item-title-text">
                <img src="@/assets/images/hdicon@2x.png" style="width: 28px; height: 28px" />
                <div class="other-style">
                  {{ item.hnAnswerVoList[0]?.answerContent }}
                </div>
              </div>
              <div class="QA-total" @click="handleDetail(item.id)">全部{{ item.hnAnswerVoList?.length || 0 }}条信息</div>
            </div>
            <div class="QA-image">
              <img src="@/assets/images/login-bg.png" />
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- 咨询专家弹窗 -->
    <AskExpertComponent ref="askExpertRef" @submitSuccess="handleChange"></AskExpertComponent>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { technologyExpertDetail, legalExpertDetail, questionList } from '@/api/mall/expert';
import AskExpertComponent from './AskExpertComponent.vue';

const emit = defineEmits(['detailChange']);

const props = defineProps<{
  id: string;
  type: string;
}>();

const expertId = ref<string | null>(null);

const expertDetail = ref();

const qaList = ref([]);

const askExpertRef = ref(null);

onMounted(async () => {
  console.log(props);

  expertId.value = props.id;
  props.type === 'technology' ? await getTechnologyExpertDetail() : await getLegalExpertDetail();
  await getQuestionList();
});

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
    qaList.value.forEach((item) => {
      item.isExpanded = false;
    });
  }
};

// 获取头像url
const getAvatarUrl = (imgList) => {
  return imgList?.filter((img) => img.fileType === '0')[0]?.ossInfo?.url || '';
};

// 处理立即咨询按钮点击
const handleConsultation = () => {
  // 处理咨询逻辑，例如跳转到咨询页面并传递专家信息
  askExpertRef.value?.openDialog(expertDetail.value?.id, props.type === 'technology' ? '1' : '2');
};

const handleChange = async (tab) => {
  await getQuestionList();
};

const handleDetail = (id: string) => {
  emit('detailChange', { type: 'qaDetail', id });
};

// 处理查看更多问答按钮点击
const handleQAList = () => {
  emit('detailChange', { type: 'qaMoreList' });
};
</script>

<style scoped lang="scss">
.expert-card {
  display: flex;
  background: #108c58;
  padding: 20px 17px 20px 20px;
  box-sizing: border-box;
  border-radius: 8px 8px 8px 8px;
  color: #ffffff;
  position: relative;
  .expert-card-avatar {
    width: 160px;
    height: 160px;
    border-radius: 8px 8px 8px 8px;
    margin-right: 20px;
  }
  .expert-card-detail {
    position: relative;
    z-index: 2;
    .expert-card-name {
      margin-bottom: 20px;
      span {
        font-weight: 500;
        font-size: 20px;
        color: #ffffff;
        line-height: 27px;
        margin-right: 20px;
      }
    }
    .expert-card-info {
      font-weight: 500;
      font-size: 14px;
      color: rgba(#ffffff, 0.8);
      line-height: 20px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      // 自动换行
      white-space: normal;
      margin-bottom: 20px;
    }
    .expert-card-number {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .dividing-line {
        width: 1px;
        height: 21px;
        background: #ffffff;
        margin: 0 50px;
      }
      .card-number {
        .card-number-title {
          font-weight: 400;
          font-size: 24px;
          color: #ffffff;
          line-height: 16px;
          font-style: normal;
          margin-bottom: 11px;
          text-align: center;
        }
        .card-number-text {
          font-weight: 500;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.6);
          line-height: 16px;
          font-style: normal;
          text-align: center;
        }
      }
    }
  }
  .question-box {
    position: absolute;
    right: 0;
    top: 0;
    width: 242px;
    height: 100%;
    background-image: url('@/assets/images/bjzs@2x.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center center;
    user-select: none;
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 20px;
    box-sizing: border-box;
    .question-title {
      z-index: 200;
      width: 163px;
      height: 40px;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 179px 179px 179px 179px;
      border: 1px solid #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;

      img {
        width: 14px;
        height: 14px;
      }
      .question-title-text {
        font-weight: 500;
        font-size: 14px;
        color: #ffffff;
        line-height: 16px;
        font-style: normal;
        margin-left: 6px;
      }
    }
  }
}
.expert-QA-box {
  width: 100%;
  height: auto;
  margin-top: 30px;
  .QA-box-header {
    width: 100%;
    height: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .QA-title {
      font-weight: 500;
      font-size: 20px;
      color: #000000;
      height: 20px;
      line-height: 19px;
      border-left: #108c58 4px solid;
      padding-left: 6px;
      box-sizing: border-box;
    }
    .QA-more {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      cursor: pointer;
      span {
        font-weight: 400;
        font-size: 14px;
        color: rgba(51, 51, 51, 0.8);
        line-height: 21px;
      }
    }
  }
  .QA-list-box {
    margin-top: 16px;
    .QA-list-item {
      width: 100%;
      // min-height: 150px;
      background: #ffffff;
      border-radius: 8px 8px 8px 8px;
      padding: 20px 20px;
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 16px;
      .QA-list-item-title {
        width: calc(100% - 130px);
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: space-between;
        margin-right: 20px;
        .QA-list-item-title-text {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          margin-bottom: 18px;
          img {
            margin-right: 10px;
          }
          .wd-text {
            width: calc(100% - 38px);
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-weight: 500;
            font-size: 14px;
            color: #333333;
            line-height: 20px;
            text-align: left;
          }
        }
        .answer-container {
          width: 100%;
        }
        .other-style {
          width: calc(100% - 38px);
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          font-weight: 400;
          font-size: 14px;
          color: #333333;
          line-height: 20px;
        }
        .show-all {
          // 展示全部 不换行
          overflow-wrap: break-word;
          white-space: normal !important;
        }
        .QA-total {
          font-weight: 400;
          font-size: 12px;
          color: #108c58;
          line-height: 14px;
          text-align: left;
          cursor: pointer;
        }
      }
      .QA-image {
        width: 110px;
        height: 110px;
        border-radius: 8px 8px 8px 8px;
        background-color: aquamarine;
        overflow: hidden;
        img {
          width: 110px;
          height: 110px;
        }
      }
    }
  }
}
</style>
