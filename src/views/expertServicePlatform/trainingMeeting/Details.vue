<!--
  标题: Details.vue
  功能: 专家培训会议详情页
  说明: 用于展示专家培训会议的详细信息
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="meeting-details">
    <!-- 标题与基本信息 -->
    <h2 class="meeting-title">{{ meetingData.meetingTitle }}</h2>
    <div class="flex-between">
      <div>
        <span>发布人：{{ meetingData.publisher }}</span>
        <span style="margin-left: 40px">发布时间：{{ meetingData.publishTime }}</span>
      </div>
      <div>
        <span style="float: right"
          >会议状态：<b>{{ getStatusLabel(meetingData.status) }}</b></span
        >
        <span style="float: right; margin-right: 40px"
          >报名人数：<b>{{ meetingData.signUpCount }}</b></span
        >
      </div>
    </div>

    <el-divider />

    <div class="meeting-info">
      <div>会议主题：{{ meetingData.meetingTitle }}</div>
      <div>会议联系人：{{ meetingData.recorder }}</div>
      <div>会议类别：{{ meetingData.categoryLabel }}</div>
      <div>
        <span>会议时间：{{ meetingData.startTime }} 至 {{ meetingData.endTime }}</span>
      </div>
      <div>
        <span>会议地址：{{ meetingData.meetingAddress }}</span>
      </div>
      <div>
        <span>取消原因：{{ meetingData.notice }}</span>
      </div>
    </div>

    <!-- 参会专家人员信息 -->
    <div class="table-section">
      <h3>参会专家人员信息</h3>
      <el-table :data="expertList" border>
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="expertCode" label="专家编码" align="center" />
        <el-table-column prop="expertType" label="专家类型" align="center" />
        <el-table-column prop="expertName" label="专家姓名" align="center" />
        <el-table-column prop="expertGender" label="专家性别" align="center" />
        <el-table-column prop="expertPhone" label="专家联系电话" align="center" />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="expertPage.pageNum"
          v-model:page-size="expertPage.pageSize"
          :total="expertPage.total"
          layout="prev, pager, next, jumper"
          @current-change="handleExpertPage"
        />
      </div>
    </div>

    <!-- 报名参加人员信息 -->
    <div class="table-section">
      <h3>报名参加人员信息</h3>
      <el-table :data="signUpList" border>
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="signUpName" label="报名人姓名" align="center" />
        <el-table-column prop="signUpPhone" label="报名人联系电话" align="center" />
      </el-table>
      <div class="pagination">
        <el-pagination
          v-model:current-page="signUpPage.pageNum"
          v-model:page-size="signUpPage.pageSize"
          :total="signUpPage.total"
          layout="prev, pager, next, jumper"
          @current-change="handleSignUpPage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getcultivateExpert } from '@/api/expertServicePlatform/trainingMeeting/index';

// 接收父组件传参
const props = defineProps<{ id: string | number; type: string }>();

const meetingData = ref({
  meetingTitle: '',
  publisher: '',
  publishTime: '',
  status: '',
  signUpCount: 0,
  categoryLabel: '',
  recorder: '',
  startTime: '',
  endTime: '',
  meetingAddress: '',
  notice: ''
});
const expertList = ref([]);
const expertPage = ref({ pageNum: 1, pageSize: 5, total: 0 });
const signUpList = ref([]);
const signUpPage = ref({ pageNum: 1, pageSize: 5, total: 0 });

const getStatusLabel = (status: string) => {
  if (status === '0') return '待开始';
  if (status === '1') return '已结束';
  if (status === '2') return '已开始';
  return '';
};

// 获取详情数据
const fetchDetail = async () => {
  const res = await getcultivateExpert(props.id);
  // 会议基础信息
  meetingData.value = {
    meetingTitle: res.data.meetingTitle,
    publisher: res.data.publisher,
    publishTime: res.data.publishTime,
    status: res.data.status,
    signUpCount: res.data.signUpCount,
    categoryLabel: res.data.categoryLabel,
    recorder: res.data.recorder,
    startTime: res.data.startTime,
    endTime: res.data.endTime,
    meetingAddress: res.data.meetingAddress,
    notice: res.data.notice
  };
  // 专家人员列表
  expertList.value = (res.data.expertList || []).map((item) => ({
    expertCode: item.expertCode,
    expertType: item.expertType === '0' ? '技术专家' : item.expertType === '1' ? '法务专家' : '',
    expertName: item.expertName,
    expertGender: item.expertSex === '0' ? '男' : item.expertSex === '1' ? '女' : '未知',
    expertPhone: item.contactPhone
  }));
  expertPage.value.total = expertList.value.length;
  // 报名人员列表
  signUpList.value = (res.data.signUpList || []).map((item) => ({
    signUpName: item.signUpName,
    signUpPhone: item.signUpPhone
  }));
  signUpPage.value.total = signUpList.value.length;
};

const handleExpertPage = (page: number) => {
  expertPage.value.pageNum = page;
  // 如需分页可在此处处理
};
const handleSignUpPage = (page: number) => {
  signUpPage.value.pageNum = page;
  // 如需分页可在此处处理
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.meeting-details {
  padding: 24px;
  background: #fff;
}
.meeting-title {
  text-align: center;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
  position: relative;
  h2 {
    margin-bottom: 8px;
  }
  span {
    font-size: 14px;
    margin-right: 16px;
  }
}
.meeting-info {
  margin-bottom: 24px;
  font-size: 15px;
  line-height: 2;
  span {
    margin-right: 32px;
  }
}
.table-section {
  margin-bottom: 32px;
  h3 {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 12px;
  }
}
.pagination {
  display: flex;
  margin: 12px 0 0 0;
  justify-content: end;
}
</style>
