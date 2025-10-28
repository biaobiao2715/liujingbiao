<!--
  标题: activityDetail.vue
  功能: 普法活动详情
  说明: 用于查看普法活动的详细信息
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="activity-detail">
    <!-- 活动详情卡片 -->
    <div class="activity-card">
      <!-- 卡片头部 -->
      <div class="card-header">
        <h1 class="activity-title">{{ activityDetail.title }}</h1>
        <el-button 
          type="text" 
          class="close-btn" 
          @click="goBack"
        >
          <el-icon><Close /></el-icon>
        </el-button>
      </div>

      <!-- 发布人信息 -->
      <div class="publisher-info">
        <div class="publisher-left">
          <div class="avatar-placeholder">头像</div>
          <div class="publisher-details">
            <div class="publisher-name">发布人:{{ activityDetail.publisher }}</div>
            <div class="publish-time">发布时间:{{ activityDetail.publishTime }}</div>
          </div>
        </div>
        <div class="activity-status">
          <div class="status-item">活动状态:{{ activityDetail.status }}</div>
          <div class="status-item">报名人数:{{ activityDetail.registrationCount || 0 }}人</div>
        </div>
      </div>

      <!-- 分割线 -->
      <el-divider />

      <!-- 活动详细信息 -->
      <div class="activity-details">
        <div class="detail-row">
          <span class="detail-label">活动主题:</span>
          <span class="detail-value">{{ activityDetail.activityType }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">活动简介:</span>
          <span class="detail-value">{{ activityDetail.description }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">活动联系人:</span>
          <span class="detail-value">{{ activityDetail.contactPerson }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">活动联系人电话:</span>
          <span class="detail-value">{{ activityDetail.contactInfo }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">活动时间:</span>
          <span class="detail-value">{{ activityDetail.startTime }} 至 {{ activityDetail.endTime }}</span>
        </div>
        
        <div class="detail-row">
          <span class="detail-label">活动地址:</span>
          <span class="detail-value">{{ activityDetail.address }}</span>
        </div>
        
        <div class="detail-row" v-if="activityDetail.cancelReason">
          <span class="detail-label">取消原因:</span>
          <span class="detail-value">{{ activityDetail.cancelReason }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useRouter, useRoute } from 'vue-router';
import { Close } from '@element-plus/icons-vue';

const router = useRouter();
const route = useRoute();

// 活动详情数据
const activityDetail = ref({
  id: 1,
  title: '2024年秋季普法',
  publisher: '张三',
  publishTime: '2019-03-15 10:29:30',
  status: '已开始',
  registrationCount: 200,
  activityType: '农业专家讲座',
  description: '武汉法务专家普法宣传关于政策解读',
  contactPerson: '李四',
  contactInfo: '13000000000',
  startTime: '2019-12-12 10:29:30',
  endTime: '2019-12-12 11:29:30',
  address: '湖北省武汉市汉南区农耕4楼102会议室',
  cancelReason: '因恶劣天气原因,暂取消这次活动'
});

/** 获取活动详情 */
const getActivityDetail = async () => {
  try {
    const activityId = route.query.id;
    console.log('获取活动详情，ID:', activityId);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 这里可以根据ID获取不同的数据
    // 目前使用模拟数据
  } catch (error) {
    ElMessage.error('获取活动详情失败，请稍后重试');
  }
};

/** 返回上一页 */
const goBack = () => {
  router.go(-1);
};

// 页面加载时获取详情数据
onMounted(() => {
  getActivityDetail();
});
</script>

<style scoped lang="scss">
.activity-detail {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

// 活动详情卡片
.activity-card {
  background-color: #fff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 800px;
  width: 100%;
}

// 卡片头部
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .activity-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: #303133;
    flex: 1;
  }
  
  .close-btn {
    padding: 8px;
    color: #909399;
    
    &:hover {
      color: #606266;
    }
  }
}

// 发布人信息
.publisher-info {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  
  .publisher-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .avatar-placeholder {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #f0f0f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      color: #909399;
      border: 1px solid #e4e7ed;
    }
    
    .publisher-details {
      .publisher-name {
        font-size: 14px;
        color: #606266;
        margin-bottom: 4px;
      }
      
      .publish-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
  
  .activity-status {
    text-align: right;
    
    .status-item {
      font-size: 14px;
      color: #606266;
      margin-bottom: 4px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

// 分割线
:deep(.el-divider) {
  margin: 20px 0;
  border-color: #e4e7ed;
}

// 活动详细信息
.activity-details {
  .detail-row {
    display: flex;
    margin-bottom: 12px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .detail-label {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
      min-width: 140px;
      margin-right: 8px;
    }
    
    .detail-value {
      font-size: 14px;
      color: #303133;
      flex: 1;
      word-break: break-all;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .activity-detail {
    padding: 16px;
  }
  
  .activity-card {
    padding: 16px;
  }
  
  .card-header {
    .activity-title {
      font-size: 20px;
    }
  }
  
  .publisher-info {
    flex-direction: column;
    gap: 16px;
    
    .publisher-left {
      width: 100%;
    }
    
    .activity-status {
      text-align: left;
      width: 100%;
    }
  }
  
  .activity-details {
    .detail-row {
      flex-direction: column;
      gap: 4px;
      
      .detail-label {
        min-width: auto;
        margin-right: 0;
      }
    }
  }
}

// 分割线样式优化
:deep(.el-divider--horizontal) {
  margin: 20px 0;
}

// 按钮样式优化
:deep(.el-button--text) {
  padding: 8px;
  
  &:hover {
    background-color: #f5f7fa;
  }
}
</style>
