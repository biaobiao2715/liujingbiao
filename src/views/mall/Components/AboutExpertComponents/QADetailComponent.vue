<template>
  <div class="qa-detail-card">
    <div class="question-info">
      <div style="display: flex; align-items: center; justify-content: flex-start">
        <div style="width: 50px; height: 50px; border-radius: 50%; background-color: #00a1d6; margin-right: 20px">
          <!-- 头像 -->
        </div>
        <span
          style="
            font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
            font-weight: 500;
            font-size: 14px;
            color: #3d3d3d;
            line-height: 20px;
            text-align: left;
            font-style: normal;
          "
        >
          {{ answers?.questionUser ? answers?.questionUser : '' }}
        </span>
      </div>
      <span
        style="
          font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
          font-weight: 400;
          font-size: 14px;
          color: #909090;
          line-height: 20px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        "
        >{{ answers?.publishTime ? '提问于 ' + answers?.publishTime : '' }}</span
      >
    </div>
    <!-- 问题部分 -->
    <div class="qa-question">
      <div class="question-title">
        <img src="@/assets/images/wt@2x.png" alt="" />
        <span
          style="
            font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
            font-weight: 500;
            font-size: 14px;
            color: #333333;
            line-height: 20px;
            text-align: left;
            font-style: normal;
            text-transform: none;
            margin-left: 10px;
          "
        >
          {{ answers?.questionContent || '' }}
        </span>
      </div>
      <div class="question-images">
        <div class="image-item" v-for="image in answers?.hnCommonRelevanceFilesVos" :key="image">
          <div v-for="item in image.remoteOssVos" :key="item">
            <img :src="item.url" width="120" />
          </div>
        </div>
      </div>
    </div>
    <!-- ----------- 专家答复 ----------- -->
    <!-- 分割线 -->
    <div style="width: 100%">
      <el-divider border-style="dashed">
        <span class="border-dashed-style" style="">专家答复</span>
      </el-divider>
    </div>
    <!-- 回答部分 -->
    <div class="reply-box">
      <template v-for="(answer, index) in answers?.hnAnswerVoList" :key="index">
        <div class="reply-item">
          <div class="reply-item-avator">
            <!-- 头像 -->
            <img src="" alt="" />
            <div class="reply-item-title">
              <div class="reply-item-name">
                {{ '肖新明·技术员' }}
              </div>
              <div class="reply-item-time">
                {{ answer.replyTime }}
              </div>
            </div>
          </div>
          <div class="reply-item-content">
            {{ answer.answerContent }}
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getQuestionDetail } from '@/api/mall/expert';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const answers = ref();

onMounted(() => {
  fetchQuestionDetail();
});

// 获取问答详情
const fetchQuestionDetail = async () => {
  const response = await getQuestionDetail(props.id);
  if (response.code === 200) {
    answers.value = response.data;
  }
  console.log(answers.value);
};
</script>

<style scoped lang="scss">
.qa-detail-card {
  width: 100%;
  height: auto;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  padding: 20px;
  box-sizing: border-box;
  .question-info {
    font-size: 14px;
    color: #666;
    display: flex;
    justify-content: space-between;
    margin-bottom: 25px;
  }
}

.qa-question {
  margin-bottom: 20px;
  .question-title {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    img {
      width: 28px;
      height: 28px;
    }
  }

  .question-images {
    display: flex;
    align-items: center;
    padding-left: 39px;
    box-sizing: border-box;
    flex-wrap: wrap;
    margin-bottom: 10px;
    .image-item {
      margin-right: 22px;
      font-size: 0;
      overflow: hidden;
      img {
        width: 150px;
        height: 150px;
        object-fit: cover;
        border: 1px solid #ebeef5;
        border-radius: 4px 4px 4px 4px;
      }
    }
  }
}

.qa-answer {
  max-height: 300px; /* 限制回答部分的高度 */
  overflow: hidden;
}

.answer-scroll {
  max-height: 100%;
  overflow-y: auto; /* 滚动展示 */
}

.answer-item {
  margin-bottom: 15px;
  padding: 10px;
  border-bottom: 1px solid #ebeef5;
}

.expert-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.expert-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.expert-details span {
  display: block;
  font-size: 14px;
  color: #333;
}

.answer-content {
  width: calc(100% - 130px);
  font-size: 14px;
  color: #666;
}

.reply-time {
  font-size: 13px;
  color: #909399;
}
.border-dashed-style {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #a3a3a3;
  line-height: 16px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}
.reply-box {
  width: 100%;
  height: auto;
  .reply-item {
    width: 100%;
    height: auto;
    background: #f6f7fb;
    border-radius: 8px 8px 8px 8px;
    padding: 20px;
    box-sizing: border-box;
    margin-bottom: 16px;
    .reply-item-avator {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      img {
        width: 50px;
        height: 50px;
        background-color: #00a1d6;
        border-radius: 50%;
        margin-right: 20px;
      }
      .reply-item-title {
        .reply-item-name {
          font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
          font-weight: 500;
          font-size: 14px;
          color: #3d3d3d;
          line-height: 20px;
          text-align: left;
          font-style: normal;
          text-transform: none;
          margin-bottom: 10px;
        }
        .reply-item-time {
          font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
          font-weight: 400;
          font-size: 14px;
          color: #909090;
          line-height: 20px;
          text-align: left;
          font-style: normal;
          text-transform: none;
        }
      }
    }
    .reply-item-content {
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      line-height: 20px;
      text-align: left;
      font-style: normal;
      text-transform: none;
      margin-top: 20px;
    }
  }
}
</style>
