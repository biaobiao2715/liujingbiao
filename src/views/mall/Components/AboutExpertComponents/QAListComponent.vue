<!--
  标题: QAListComponent.vue
  功能: 专家问答列表组件
  说明: 专家问答列表组件，展示专家的问答列表
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-12-08
-->
<template>
  <div class="qa-list-container">
    <div class="flex-center-between">
      <div class="qa-title">专家问答</div>
      <el-tabs v-model="queryParams.orderByColumn" class="demo-tabs" @tab-change="getQuestionList()">
        <el-tab-pane v-for="tab in tabs" :label="tab.label" :name="tab.value" />
      </el-tabs>
    </div>
    <el-row :gutter="20">
      <el-col :span="8" class="mb-12" v-for="(item, index) in qaList" :key="index">
        <div class="qa-card">
          <div class="qa-question gap-8 flex-center-centersflex-center-center">
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

    <pagination
      v-if="total > 0"
      v-model:total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :pageSizes="[15, 30, 50]"
      @pagination="getQuestionList"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { questionList } from '@/api/mall/expert';

const emit = defineEmits(['detailChange']);

const total = ref(0);

const queryParams = ref({ pageNum: 1, pageSize: 15, orderBy: 'desc', orderByColumn: 'default' });

const qaList = ref([]);

const tabs = ref([
  {
    label: '默认排序',
    value: 'default'
  },
  {
    label: '最多回复量',
    value: 'replyCount'
  },
  {
    label: '最新发布时间',
    value: 'publishTime'
  },
  {
    label: '最新回答时间',
    value: 'latestAnswerTime'
  }
]);

onMounted(() => {
  getQuestionList();
});

// 获取问答列表
const getQuestionList = async () => {
  try {
    const res = await questionList(queryParams.value);
    qaList.value = res.rows || [];
    total.value = res.total || 0;
  } catch (error) {
    console.error('获取问答列表失败:', error);
  }
};

const handleDetail = (id: string) => {
  console.log(id);
  emit('detailChange', { type: 'qaDetail', id });
};
</script>

<style scoped lang="scss">
.qa-list-container {
  padding: 20px;
  background-color: #fff;
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

.qa-card {
  background: #f6f7fb;
  border-radius: 8px;
  padding: 20px;
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

::v-deep .el-tabs__nav-wrap:after {
  display: none !important;
}
</style>
