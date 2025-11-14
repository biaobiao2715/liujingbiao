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
    <h2 class="meeting-title">{{ meetingData.meetingName }}</h2>
    <div class="flex-between">
      <div>
        <span>发布人：{{ meetingData.meetingContact }}</span>
        <span style="margin-left: 40px">发布时间：{{ meetingData.publishTime }}</span>
      </div>
      <div style="display: flex">
        <div style="display: flex; margin-right: 40px">
          <div>会议状态：</div>
          <dict-text :options="meeting_status" :value="meetingData.meetingStatus ?? ''" />
        </div>

        <div>报名人数：{{ meetingData.enrollCount }}人</div>
      </div>
    </div>

    <el-divider />

    <div class="meeting-info">
      <div>会议主题：{{ meetingData.meetingName }}</div>
      <div>会议联系人：{{ meetingData.meetingContact }}</div>
      <div style="display: flex">会议类别： <dict-text :options="meeting_type" :value="meetingData.meetingType ?? ''" /></div>
      <div>会议时间：{{ meetingData.meetingStartTime }} 至 {{ meetingData.meetingEndTime }}</div>
      <div>会议地址：{{ meetingData.meetingAddress }}</div>
      <div v-if="meetingData.cancelReason">取消原因：{{ meetingData.cancelReason }}</div>
    </div>

    <!-- 参会专家人员信息 -->
    <div class="table-section">
      <h3>参会专家人员信息</h3>
      <el-table :data="expertList" border>
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="expertCode" label="专家编码" align="center" />
        <el-table-column prop="expertType" label="专家类型" align="center" />
        <el-table-column prop="expertName" label="专家姓名" align="center" />
        <el-table-column prop="expertSex" label="专家性别" align="center">
          <template #default="scope">
            <dict-tag :options="sys_user_sex" :value="scope.row.expertSex" />
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="专家联系电话" align="center" />
      </el-table>
      <div class="pagination">
        <pagination
          v-show="expertPage.total > 0"
          v-model:page="expertPage.pageNum"
          v-model:limit="expertPage.pageSize"
          :total="expertPage.total"
          @pagination="getexpertList"
        />
      </div>
    </div>

    <!-- 报名参加人员信息 -->
    <div class="table-section">
      <h3>报名参加人员信息</h3>
      <el-table :data="signUpList" border>
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="enrollUserNickName" label="报名人姓名" align="center" />
        <el-table-column prop="enrollUserPhone" label="报名人联系电话" align="center" />
      </el-table>
      <div class="pagination">
        <pagination
          v-show="signUpPage.total > 0"
          v-model:page="signUpPage.pageNum"
          v-model:limit="signUpPage.pageSize"
          :total="signUpPage.total"
          @pagination="getsignUpList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getcultivateExpert, activityEnrollList, cultivateExpertList } from '@/api/expertServicePlatform/trainingMeeting/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { meeting_status, meeting_type, sys_user_sex } = toRefs<any>(proxy?.useDict('meeting_status', 'meeting_type', 'sys_user_sex'));

// 接收父组件传参
const props = defineProps<{ id: string | number; type: string }>();

const meetingData = ref({
  meetingCode: '',
  meetingName: '',
  meetingType: '',
  meetingAddress: '',
  meetingStartTime: '',
  meetingEndTime: '',
  meetingContact: '',
  meetingPhone: '',
  meetingContent: '',
  meetingStatus: '',
  publishTime: '',
  cancelReason: '',
  enrollCount: 0,
  experts: []
});
const expertList = ref([]);
const expertPage = ref({ pageNum: 1, pageSize: 5, total: 0 });
const signUpList = ref([]);
const signUpPage = ref({ pageNum: 1, pageSize: 5, total: 0 });

// 专家人员列表
const getexpertList = () => {
  cultivateExpertList({ foreignId: props.id }).then((res: any) => {
    expertList.value = res.rows;
    expertPage.value.total = res.total;
  });
};
// 报名人员列表
const getsignUpList = () => {
  activityEnrollList({ foreignId: props.id }).then((res: any) => {
    signUpList.value = res.rows;
    signUpPage.value.total = res.total;
  });
};

onMounted(async () => {
  const res = await getcultivateExpert({ id: props.id, isView: true });
  // 会议基础信息
  meetingData.value = res.data;

  getexpertList();
  getsignUpList();
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
