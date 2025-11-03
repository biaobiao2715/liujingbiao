<!--
  标题: ActivityDetailDialog.vue
  功能: 普法活动详情弹窗
  说明: 用于查看普法活动的详细信息（弹窗形式）
  当前版本: 1.0
-->
<template>
  <div class="activity-detail-dialog" v-loading="loading">
    <!-- 发布人信息 -->
    <div class="publisher-info">
      <div class="publisher-left">
        <el-avatar :size="48">{{ (activityDetail.publisher || '发布人').slice(0, 1) }}</el-avatar>
        <div class="publisher-details">
          <div class="publisher-name">发布人: {{ activityDetail.publisher || '未知' }}</div>
          <div class="publish-time">发布时间: {{ activityDetail.publishTime || '-' }}</div>
        </div>
      </div>
      <div class="activity-status">
        <el-tag :type="getStatusType(activityDetail.activityStatus)">
          {{ getStatusLabel(activityDetail.activityStatus) }}
        </el-tag>
        <div class="enroll-count">报名人数: {{ activityDetail.enrollCount || 0 }}人</div>
      </div>
    </div>

    <!-- 分割线 -->
    <el-divider />

    <!-- 活动详细信息 -->
    <div class="activity-details">
      <div class="detail-row">
        <span class="detail-label">活动主题:</span>
        <span class="detail-value">{{ getTypeLabel(activityDetail.activityType) }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动简介:</span>
        <span class="detail-value">{{ activityDetail.activitySummary || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动联系人:</span>
        <span class="detail-value">{{ activityDetail.activityContact || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动联系人电话:</span>
        <span class="detail-value">{{ activityDetail.activityContactPhone || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动时间:</span>
        <span class="detail-value">{{ activityDetail.startTime || '-' }} 至 {{ activityDetail.endTime || '-' }}</span>
      </div>
      
      <div class="detail-row">
        <span class="detail-label">活动地址:</span>
        <span class="detail-value">{{ activityDetail.activityAddress || '-' }}</span>
      </div>
      
      <div class="detail-row" v-if="activityDetail.cancelReason">
        <span class="detail-label">取消原因:</span>
        <span class="detail-value cancel-reason">{{ activityDetail.cancelReason }}</span>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button @click="emitCancel">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { getActivityDetail } from '@/api/expertServicePlatform/legalServiceManage/activityManage';

const props = defineProps<{
  id?: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_activity_type, legal_popularize_activity_status } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_activity_type', 'legal_popularize_activity_status')
);

// 加载状态
const loading = ref(false);

// 活动详情数据
const activityDetail = ref({
  id: undefined as string | undefined,
  activityTitle: '',
  publisher: '',
  publishTime: '',
  activityStatus: '',
  enrollCount: 0,
  activityType: '',
  activitySummary: '',
  activityContact: '',
  activityContactPhone: '',
  startTime: '',
  endTime: '',
  activityAddress: '',
  cancelReason: ''
});

/** 获取状态标签类型 */
const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '1': 'primary',    // 待开始
    '2': 'success',    // 进行中
    '3': 'info',       // 已结束
    '4': 'warning'     // 已取消
  };
  return map[String(status)] || 'info';
};

/** 获取状态文本 */
const getStatusLabel = (status: string) => {
  const item = legal_popularize_activity_status?.value?.find((item: any) => 
    String(item.value) === String(status)
  );
  return item?.label || status || '-';
};

/** 获取类型文本 */
const getTypeLabel = (type: string) => {
  const item = legal_popularize_activity_type?.value?.find((item: any) => item.value === type);
  return item?.label || type || '-';
};

/** 获取活动详情 */
const fetchActivityDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少活动ID');
    return;
  }
  
  loading.value = true;
  try {
    const response: any = await getActivityDetail(props.id);
    
    if (response && response.code === 200) {
      const data = response.data;
      
      if (!data) {
        ElMessage.error('获取活动详情失败：数据为空');
        return;
      }
      
      // 将接口返回的数据赋值给详情
      activityDetail.value = {
        id: data.id,
        activityTitle: data.activityTitle || '',
        publisher: data.organizerName || data.authorName || data.publishUser || '未知',
        publishTime: data.publishTime || '',
        activityStatus: data.activityStatus || '',
        enrollCount: data.enrollCount || 0,
        activityType: data.activityType || '',
        activitySummary: data.activitySummary || '',
        activityContact: data.activityContact || '',
        activityContactPhone: data.activityContactPhone || '',
        startTime: data.startTime || '',
        endTime: data.endTime || '',
        activityAddress: data.activityAddress || '',
        cancelReason: data.cancelReason || ''
      };
    } else {
      ElMessage.error(response?.msg || '获取活动详情失败');
    }
  } catch (error) {
    console.error('获取活动详情失败:', error);
    ElMessage.error('获取活动详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 关闭弹窗 */
const emitCancel = () => {
  emit('cancel');
};

// 页面加载时获取详情数据
onMounted(() => {
  fetchActivityDetail();
});
</script>

<style scoped lang="scss">
.activity-detail-dialog {
  padding: 20px;
}

// 发布人信息区域
.publisher-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .publisher-left {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .publisher-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      .publisher-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
      
      .publish-time {
        font-size: 14px;
        color: #909399;
      }
    }
  }
  
  .activity-status {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    
    .enroll-count {
      font-size: 14px;
      color: #606266;
      font-weight: 500;
    }
  }
}

// 活动详细信息
.activity-details {
  .detail-row {
    display: flex;
    margin-bottom: 20px;
    line-height: 1.8;
    
    .detail-label {
      min-width: 140px;
      font-weight: 600;
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

// 底部按钮
.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  
  .el-button {
    min-width: 100px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .publisher-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    
    .activity-status {
      align-items: flex-start;
    }
  }
  
  .activity-details {
    .detail-row {
      flex-direction: column;
      
      .detail-label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>

