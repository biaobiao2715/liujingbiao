<!--
  标题: CourseDetailComponent.vue
  功能: 课程详情组件
  说明: 显示课程的详细信息，包括课程名称、课程描述、课程图片、课程价格、课程时长、课程讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="metting-detail-container">
    <div class="title">{{ detail?.title }}</div>
    <!-- 课程描述 -->
    <div class="description flex-center gap-24 mt-24 mb-24">
      <!-- 头像 -->
      <img :src="detail?.avatar" width="40" />
      <div>{{ '发布人：  ' + detail?.publishUser }}</div>
      <div>{{ '发布时间：  ' + detail?.publishTime }}</div>
      <el-tag type="primary">{{ detail?.meetingType === '1' ? '技术知识' : '法务知识' }}</el-tag>
      <div class="status">
        会议状态：<el-tag>{{ getMeetingStatus(detail?.meetingStatus) }}</el-tag>
      </div>
      <div>报名人数：{{ detail?.enrollCount }}</div>
      <el-button v-if="detail?.meetingStatus === '1'" :type="detail?.enrollStatus === '1' ? 'info' : 'primary'" @click="handleApply">{{
        detail?.enrollStatus === '1' ? '取消报名' : '立即报名'
      }}</el-button>
    </div>

    <!-- 分割线 -->
    <el-divider></el-divider>
    <!-- 详细信息 -->
    <div class="detail">
      <div>会议主题：{{ detail?.meetingName }}</div>
      <div>会议联系人：{{ detail?.meetingContact }}</div>
      <div>会议类别：{{ detail?.meetingType === '1' ? '技术知识' : '法务知识' }}</div>
      <div>会议时间：{{ detail?.meetingStartTime + ' - ' + detail?.meetingEndTime }}</div>
      <div>会议地点：{{ detail?.meetingAddress }}</div>
      <div v-if="detail?.meetingStatus === '99'">取消原因：{{ detail?.cancelReason }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { meetingDetail, activityApply } from '@/api/mall/expert';

// 报名状态（0：未报名 1：已报名）

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const detail = ref();

onMounted(() => {
  getMeetingDetail();
});

const getMeetingDetail = async () => {
  // 根据传入的ID获取课程详情
  meetingDetail({ id: props.id, isView: true }).then((res) => {
    detail.value = res.data || {};
  });
};

// 会议状态 会议状态（0：草稿 1：待开始 2：进行中 3：已结束 99：已取消）
const getMeetingStatus = (status: string) => {
  switch (status) {
    case '0':
      return '草稿';
    case '1':
      return '待开始';
    case '2':
      return '进行中';
    case '3':
      return '已结束';
    case '99':
      return '已取消';
    default:
      return '未知状态';
  }
};

// 报名
const handleApply = async () => {
  ElMessageBox.confirm(`确认${detail.value.enrollStatus === '1' ? '取消报名' : '报名'}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await activityApply({
        id: props.id,
        categoryType: '1',
        activityType: '0',
        activityEnrollBo: { ...detail.value, enrollStatus: detail.value.enrollStatus === '1' ? '0' : '1' }
      });
      if (res.code === 200) {
        ElMessage.success(`${detail.value.enrollStatus === '21' ? '取消报名' : '报名'}成功`);
        getMeetingDetail();
      } else {
        ElMessage.error(res.msg || `${detail.value.enrollStatus === '1' ? '取消报名' : '报名'}失败`);
      }
    })
    .catch(() => {});
};
</script>

<style scoped lang="scss">
.metting-detail-container {
  padding: 12px;
  .title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .description {
    .collection {
      cursor: pointer;
    }
  }
  .detail {
    div {
      margin-top: 24px;
    }
  }
}
</style>
