<template>
  <!-- 专家问答 -->
  <div class="qa-container">
    <div class="flex-center-between">
      <div class="qa-title">专家问答</div>
      <div class="more flex-center gap-4" @click="handleMoreList()">
        <div>查看更多</div>
        <img src="@/assets/mall/more.png" width="18" />
      </div>
    </div>
    <el-row :gutter="20">
      <el-col :span="8" class="mb-12" v-for="(item, index) in qaList" :key="index" v-show="isExpanded || index < 6">
        <div class="qa-card">
          <div class="qa-question gap-8">
            <img src="@/assets/mall/question-icon.png" width="28" height="28" />
            <div class="qa-question-text">
              {{ item.questionContent }}
            </div>
          </div>
          <div class="qa-answer gap-8">
            <img src="@/assets/mall/answer-icon.png" width="28" height="28" />
            <div class="qa-answer-text">
              {{ item.hnAnswerVoList[0]?.answerContent }}
            </div>
          </div>
          <div class="qa-info flex-center-between">
            <div class="flex-center gap-4 message-link">
              <div @click="handleDetail(item.id)">查看全部{{ item.hnAnswerVoList?.length }}条信息</div>
              <img src="@/assets/mall/message-arrow-icon.png" width="12" height="12" />
            </div>
            <span class="qa-update-time">更新于{{ item.latestAnswerTime }}</span>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { ElCard, ElRow, ElCol } from 'element-plus';
import { questionList } from '@/api/mall/expert';

const emit = defineEmits(['detailChange']);

const qaList = ref();

const isExpanded = ref(false);

onMounted(() => {
  getQuestionList();
});

const handleDetail = (id: string) => {
  emit('detailChange', { type: 'qaDetail', id });
};

const handleMoreList = () => {
  emit('detailChange', { type: 'qaMoreList' });
};

// 获取问答列表
const getQuestionList = async () => {
  try {
    const res = await questionList({
      orderBy: 'desc',
      orderByColumn: 'latestAnswerTime'
    });
    qaList.value = res.rows || [];
  } catch (error) {
    console.error('获取问答列表失败:', error);
  }
};
</script>
<style scoped lang="scss">
.qa-container {
  margin: 24px 0;
}

.qa-title {
  color: #3d3d3d;
  font-size: 20px;
  font-weight: bold;
  border-left: 4px solid #108c58;
  padding-left: 8px;
  line-height: 16px;
  margin-bottom: 16px;
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

.qa-card {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.qa-question,
.qa-answer {
  display: flex;
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
  // 超出2行显示省略号
  height: 46px;
  font-size: 14px;
  color: #333333;
  font-weight: bold;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.qa-answer-text {
  font-weight: 400;
}

.answer-icon {
  background-color: #ff9800;
}

.qa-info {
  font-size: 12px;
  color: var(--color-main);
  .message-link {
    cursor: pointer;
  }
}

.qa-update-time {
  float: right;
  font-size: 12px;
  color: #909090;
}
</style>
