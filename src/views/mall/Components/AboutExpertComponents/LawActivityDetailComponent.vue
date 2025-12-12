<!--
  标题: CourseDetailComponent.vue
  功能: 法律活动详情组件
  说明: 显示法律活动的详细信息，包括法律活动名称、法律活动描述、法律活动图片、法律活动价格、法律活动时长、法律活动讲师等。
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-10-29
-->

<template>
  <div class="metting-detail-container">
    <div class="title-box">
      <div class="title">
        <div class="title-text">{{ detail?.activityTitle }}</div>
      </div>
      <div class="user-detail">
        <img :src="avatarSrc" alt="" />
        <div class="user-detail-peo">
          {{ '发布人：  ' + detail?.publishUser }}
        </div>
        <div class="user-detail-time">
          {{ '发布时间：  ' + detail?.publishTime }}
        </div>
        <el-tag type="primary" class="activity-type-tag">{{ detail?.activityType === '1' ? '专家讲座' : '普法培训' }}</el-tag>
        <div class="status">
          会议状态：<el-tag>{{ getActivityStatus(detail?.activityStatus) }}</el-tag>
        </div>
        <div class="enroll-count">报名人数：{{ detail?.enrollCount }}</div>
        <el-button 
          :type="detail?.isEnrolled === '1' ? 'info' : 'primary'" 
          @click="handleApply" 
          v-if="detail?.activityStatus === '1'"
          class="enroll-button"
        >
          {{ detail?.isEnrolled === '1' ? '取消报名' : '立即报名' }}
        </el-button>
      </div>
      <div class="wzzs-icon">
        <img src="@/assets/images/wzzsicon@2x.png" alt="" />
      </div>
    </div>

    <!-- 详细信息 -->
    <div class="activity-details-box">
      <div class="detail-row">
        <span class="detail-label">活动主题:</span>
        <span class="detail-value">{{ detail?.activityType === '1' ? '专家讲座' : '普法培训' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动简介:</span>
        <span class="detail-value">{{ detail?.activitySummary || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动联系人:</span>
        <span class="detail-value">{{ detail?.activityContact || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动联系人电话:</span>
        <span class="detail-value">{{ detail?.activityContactPhone || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动时间:</span>
        <span class="detail-value">{{ detail?.startTime || '-' }} 至 {{ detail?.endTime || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动地址:</span>
        <span class="detail-value">{{ detail?.activityAddress || '-' }}</span>
      </div>
      
      <div class="detail-row" v-if="detail?.activityStatus === '99'">
        <span class="detail-label">取消原因:</span>
        <span class="detail-value cancel-reason">{{ detail?.cancelReason }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getActivityDetail } from '@/api/expertServicePlatform/legalServiceManage/activityManage';
import { activityApply } from '@/api/mall/expert';
import defaultAvatar from '@/assets/images/tx.png';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const detail = ref();
const avatarSrc = computed(() => detail.value?.avatar || defaultAvatar);

onMounted(() => {
  // 根据传入的ID获取课程详情
  fetchActivityDetail();
});
// 获取活动详情
const fetchActivityDetail = async () => {
  const res = await getActivityDetail(props.id);
  if (res.code === 200) {
    detail.value = res.data || {};
  }
};

// 会议状态 会议状态（0：草稿 1：待开始 2：进行中 3：已结束 99：已取消）
const getActivityStatus = (status: string) => {
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
  ElMessageBox.confirm(`确认${detail.value.isEnrolled === '1' ? '取消报名' : '报名'}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      const res = await activityApply({ id: props.id, categoryType: '2', activityType: '1', activityEnrollBo: { ...detail.value } });
      if (res.code === 200) {
        ElMessage.success(`${detail.value.isEnrolled === '1' ? '取消报名' : '报名'}成功`);
        fetchActivityDetail();
      } else {
        ElMessage.error(res.msg || `${detail.value.isEnrolled === '1' ? '取消报名' : '报名'}失败`);
      }
    })
    .catch(() => {});
};
</script>

<style scoped lang="scss">
.metting-detail-container {
  padding: 12px;
  
  .title-box {
    background: #ffffff;
    border-radius: 8px 8px 8px 8px;
    padding: 26px 0 23px 20px;
    box-sizing: border-box;
    position: relative;
    
    .title {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 500;
      font-size: 28px;
      color: #3d3d3d;
      line-height: 21px;
      margin-bottom: 28px;
      
      .title-text {
        margin-right: 14px;
      }
    }
    
    .user-detail {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
      font-weight: 500;
      font-size: 14px;
      color: #3d3d3d;
      line-height: 20px;
      flex-wrap: wrap;
      gap: 0;
      
      img {
        width: 30px;
        height: 30px;
        margin-right: 14px;
      }
      
      .user-detail-peo {
        margin-right: 40px;
      }
      
      .user-detail-time {
        margin-right: 39px;
      }
      
      .activity-type-tag {
        margin-right: 16px;
      }
      
      .status {
        margin-right: 16px;
      }
      
      .enroll-count {
        margin-right: 16px;
      }
      
      
    }
    
    .wzzs-icon {
      position: absolute;
      top: 0;
      right: 40px;
      
      img {
        width: 180px;
        height: 100%;
      }
    }
  }

  .activity-details-box {
    border-radius: 4px;
    padding: 16px;
    margin-top: 16px;
    background-color: #fff;
    
    .detail-row {
      display: flex;
      margin-bottom: 16px;
      line-height: 1.8;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        min-width: 140px;
        font-weight: 500;
        color: #606266;
        flex-shrink: 0;
      }
      
      .detail-value {
        flex: 1;
        color: #303133;
        word-break: break-all;
        
        &.cancel-reason {
          color: #f56c6c;
          font-weight: 500;
        }
      }
    }
  }
}
</style>
