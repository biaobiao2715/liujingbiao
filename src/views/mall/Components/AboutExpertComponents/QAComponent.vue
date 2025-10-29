<template>
  <!-- 专家问答 -->
  <div class="qa-container">
    <el-card>
      <template #header>
        <div class="qa-title">专家问答</div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(item, index) in qaList" :key="index" @click="handleClick(item)">
          <el-card class="qa-card">
            <div class="qa-question">
              <div class="qa-icon question-icon">问</div>
              <div class="qa-question-text">{{ item.question }}</div>
            </div>
            <div class="qa-answer">
              <div class="qa-icon answer-icon">答</div>
              <div class="qa-answer-text">{{ item.answer }}</div>
            </div>
            <div class="qa-info">
              全部{{ item.info }}条信息
              <span class="qa-update-time">更新于{{ item.updateTime }}</span>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElCard, ElRow, ElCol } from 'element-plus';

const emit = defineEmits(['detailChange']);

const qaList = ref([
  {
    question: '豆角，10月19日昨晚上用联苯虫螨腈杀...',
    answer: '建议：1.立即补喷20%联苯虫螨腈+5%...',
    info: 1,
    updateTime: '2025-10-21 17:00:30'
  },
  {
    question: '豆角，10月19日昨晚上用联苯虫螨腈杀...',
    answer: '建议：1.立即补喷20%联苯虫螨腈+5%...',
    info: 1,
    updateTime: '2025-10-21 17:00:30'
  },
  {
    question: '豆角，10月19日昨晚上用联苯虫螨腈杀...',
    answer: '建议：1.立即补喷20%联苯虫螨腈+5%...',
    info: 1,
    updateTime: '2025-10-21 17:00:30'
  }
]);

const handleClick = (item) => {
  emit('detailChange', { type: 'qaDetail', data: item });
};
</script>
<style scoped lang="scss">
.qa-container {
  margin: 24px 0;
}

.qa-title {
  font-size: 20px;
  font-weight: bold;
}

.qa-card {
  cursor: pointer;
}

.qa-question,
.qa-answer {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.qa-answer {
  margin: 12px 0;
}

.qa-icon {
  display: inline-block;
  width: 30px;
  height: 30px;
  text-align: center;
  line-height: 30px;
  margin-right: 10px;
  border-radius: 50%;
  color: #fff;
}

.question-icon {
  background-color: #4caf50;
}

.qa-answer-text,
.qa-question-text {
  // 超出一行显示省略号
  width: calc(100% - 40px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.answer-icon {
  background-color: #ff9800;
}

.qa-info {
  font-size: 14px;
  color: #666;
}

.qa-update-time {
  float: right;
  color: #999;
}
</style>
