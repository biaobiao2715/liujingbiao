<!--
  标题: CourseDetailComponent.vue
  功能: 课程详情组件
  说明: 显示课程的详细信息，包括课程名称、课程描述、课程图片、课程价格、课程时长、课程讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="meeting-detail-container" v-loading="loading">
    <div class="meeting-detail">
      <div class="meeting-header">
        <div class="meeting-title">{{ detail?.meetingName }}</div>
        <!--  会议状态（0：草稿 1：待开始 2：进行中 3：已结束 99：已取消）-->
        <div>
          <el-tag type="danger" v-if="detail?.meetingStatus == 0">
            {{ getMeetingStatus(detail?.meetingStatus) }}
          </el-tag>
          <el-tag type="primary" v-if="detail?.meetingStatus == 1">
            {{ getMeetingStatus(detail?.meetingStatus) }}
          </el-tag>
          <el-tag type="success" v-if="detail?.meetingStatus == 2">
            {{ getMeetingStatus(detail?.meetingStatus) }}
          </el-tag>
          <el-tag type="warning" v-if="detail?.meetingStatus == 3">
            {{ getMeetingStatus(detail?.meetingStatus) }}
          </el-tag>
          <el-tag type="info" v-if="detail?.meetingStatus == 99">
            {{ getMeetingStatus(detail?.meetingStatus) }}
          </el-tag>
        </div>
      </div>
      <div class="meeting-user">
        <img v-if="detail?.avatar" :src="detail?.avatar" />
        <el-avatar v-else :size="30" class="mr-[10px]" style="background-color: aquamarine" />
        <div class="meeting-user-name">
          {{ '发布人：  ' + detail?.publishUser }}
        </div>
        <div class="meeting-user-time">
          {{ '发布时间：  ' + detail?.publishTime }}
        </div>
        <div class="meeting-user-num">报名人数：{{ detail?.enrollCount }}</div>
      </div>
      <!-- 报名按钮 -->
      <div class="registration-btn-box">
        <div class="registration-btn" @click="handleApply" v-if="detail?.meetingStatus === '1'">
          <img src="@/assets/images/bmtx.png" />
          <span>{{ detail?.enrollStatus === '0' ? '取消报名' : '我要报名' }} </span>
        </div>
      </div>
    </div>
    <!-- 会议内容 -->
    <div class="meeting-content-box">
      <div class="content-title">会议内容</div>
      <div class="meeting-content">
        <!-- 会议主题 -->
        <div class="meeting-item">
          <div class="m-title">会议主题</div>
          <div class="m-content">{{ detail?.meetingName }}</div>
        </div>
        <!-- 会议联系人 -->
        <div class="meeting-item">
          <div class="m-title">会议联系人</div>
          <div class="m-content">{{ detail?.meetingContact }}</div>
        </div>
        <!-- 会议类别 -->
        <div class="meeting-item">
          <div class="m-title">会议类别</div>
          <div class="m-content">
            <dict-tag :options="meeting_type" :value="detail?.meetingType"></dict-tag>
          </div>
        </div>
        <!-- 联系人电话 -->
        <div class="meeting-item">
          <div class="m-title">联系人电话</div>
          <div class="m-content">
            {{ detail?.meetingPhone }}
          </div>
        </div>
        <!-- 会议时间 -->
        <div class="meeting-item">
          <div class="m-title">会议时间</div>
          <div class="m-content">{{ detail?.meetingStartTime + ' - ' + detail?.meetingEndTime }}</div>
        </div>
        <!-- 会议地址 -->
        <div class="meeting-item">
          <div class="m-title">会议地址</div>
          <div class="m-content">{{ detail?.meetingAddress }}</div>
        </div>
        <!-- 取消原因 -->
        <div class="meeting-item" v-if="detail?.meetingStatus === '99'">
          <div class="m-title">取消原因</div>
          <div class="m-content">{{ detail?.cancelReason }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { meetingDetail, activityApply } from '@/api/mall/expert';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { meeting_type } = toRefs<any>(proxy?.useDict('meeting_type'));

// 报名状态（0：未报名 1：已报名）

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const detail = ref();

const loading = ref(false);

onMounted(() => {
  getMeetingDetail();
});

const getMeetingDetail = async () => {
  // 根据传入的ID获取课程详情
  loading.value = true;
  meetingDetail({ id: props.id, isView: true }).then((res) => {
    detail.value = res.data || {};
    loading.value = false;
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
  ElMessageBox.confirm(`确认${detail.value.enrollStatus === '0' ? '取消报名' : '报名'}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      loading.value = true;
      const res = await activityApply({
        id: props.id,
        categoryType: '1',
        activityType: '0',
        activityEnrollBo: { ...detail.value, enrollStatus: detail.value.enrollStatus === '0' ? '2' : '0' }
      });
      if (res.code === 200) {
        ElMessage.success(`${detail.value.enrollStatus === '0' ? '取消报名' : '报名'}成功`);
        getMeetingDetail();
      } else {
        ElMessage.error(res.msg || `${detail.value.enrollStatus === '0' ? '取消报名' : '报名'}失败`);
      }
      loading.value = false;
    })
    .catch(() => {});
};
</script>

<style scoped lang="scss">
.meeting-detail {
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  padding: 20px 40px 20px 20px;
  box-sizing: border-box;
  position: relative;
  margin-bottom: 16px;
  .meeting-header {
    margin-bottom: 31px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    .meeting-title {
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 500;
      font-size: 28px;
      color: #3d3d3d;
      line-height: 21px;
      margin-right: 34px;
    }
  }
  .meeting-user {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-size: 14px;
    color: #3d3d3d;
    font-weight: 500;
    img {
      width: 30px;
      height: 30px;
      background-color: aquamarine;
      margin-right: 10px;
      border-radius: 50%;
    }
    .meeting-user-name {
      margin-right: 40px;
      line-height: 20px;
    }
    .meeting-user-time {
      margin-right: 40px;
      line-height: 20px;
    }
    .meeting-user-num {
      line-height: 20px;
    }
  }
  .registration-btn-box {
    position: absolute;
    top: 0;
    right: 40px;
    background-image: url('@/assets/images/wybm.png');
    background-position: center center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    width: 139px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .registration-btn {
      width: 134px;
      height: 40px;
      background: rgba(16, 140, 88, 0.1);
      border-radius: 179px 179px 179px 179px;
      border: 1px solid #108c58;
      display: flex;
      align-items: center;
      justify-content: center;
      img {
        width: 14px;
        height: 14px;
        margin-right: 2px;
      }
      span {
        font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
        font-weight: 500;
        font-size: 14px;
        color: #108c58;
        line-height: 16px;
        text-align: left;
        font-style: normal;
        text-transform: none;
      }
    }
  }
}
.meeting-content-box {
  width: 100%;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  padding: 20px 20px 1px 20px;
  box-sizing: border-box;
  .content-title {
    width: 100%;
    height: auto;
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 500;
    font-size: 20px;
    color: #000000;
    line-height: 14px;
    padding-left: 9px;
    box-sizing: border-box;
    position: relative;
    margin-bottom: 20px;
    &::after {
      position: absolute;
      content: '';
      display: block;
      width: 3px;
      height: 20px;
      background: #108c58;
      border-radius: 4px 4px 4px 4px;
      top: -2px;
      left: 0;
    }
  }
  .meeting-content {
    .meeting-item {
      margin-bottom: 30px;
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 400;
      font-size: 14px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      .m-title {
        color: rgba(61, 61, 61, 0.5);
        line-height: 21px;
        min-width: 84px;
        text-align: right;
        margin-right: 20px;
      }
      .m-content {
        color: #3d3d3d;
        line-height: 21px;
      }
    }
  }
}
</style>
