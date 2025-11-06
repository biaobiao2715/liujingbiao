<template>
  <el-card class="qa-detail-card">
    <!-- 问题部分 -->
    <div class="qa-question">
      <div class="question-title">豆角，10月19日昨晚用联苯虫螨腈杀虫剂喷药...</div>
      <div class="question-images">
        <div class="image-item" v-for="image in questionImages" :key="image">
          <img :src="image" alt="问题图片" />
        </div>
      </div>
      <div class="question-info">
        <span>广西采购商</span>
        <span>提问于2025-10-20 10:00:30</span>
      </div>
    </div>

    <!-- 回答部分 -->
    <div class="qa-answer">
      <el-scrollbar class="answer-scroll">
        <div class="answer-item" v-for="(answer, index) in answers" :key="index">
          <div class="expert-info">
            <img class="expert-avatar" :src="answer.avatar" alt="专家头像" />
            <div class="expert-details">
              <span>{{ answer.name }}</span>
              <span>{{ answer.time }}</span>
            </div>
          </div>
          <div class="answer-content">
            <div v-for="(suggestion, idx) in answer.suggestions" :key="idx">
              {{ suggestion }}
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getQuestionDetail } from '@/api/mall/expert';

const questionImages = ['/path/to/image1.jpg', '/path/to/image2.jpg', '/path/to/image3.jpg', '/path/to/image4.jpg'];

const answers = ref([]);
</script>

<style scoped lang="scss">
.qa-detail-card {
  padding: 20px;
  border: 1px solid #ebeef5;
}

.qa-question {
  margin-bottom: 20px;
}

.question-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 10px;
}

.question-images {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.image-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border: 1px solid #ebeef5;
}

.question-info {
  font-size: 14px;
  color: #666;
  display: flex;
  justify-content: space-between;
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

.answer-content div {
  margin-bottom: 5px;
  font-size: 14px;
  color: #666;
}
</style>
