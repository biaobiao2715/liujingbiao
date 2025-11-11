<!--
  标题: ActivityDetailDialog.vue
  功能: 普法活动详情弹窗
  说明: 用于查看普法活动的详细信息（弹窗形式）
  当前版本: 1.0
-->
<template>
  <div class="activity-detail-dialog" v-loading="loading">
    <div class="header-section">
      <div class="header-top">
        <h2 class="main-title">{{ activityDetail.activityTitle || '活动标题' }}</h2>
      </div>
      
      <div class="header-bottom">
        <div class="publisher-info">
          <el-avatar :size="48" class="avatar">{{ (activityDetail.publisher || '发布人').slice(0, 1) }}</el-avatar>
          <span class="publisher-name">发布人: {{ activityDetail.publisher || '未知' }}</span>
          <span class="publish-time">发布时间: {{ formatPublishTime(activityDetail.publishTime) }}</span>
        </div>
        
        <div class="status-enroll-info">
          <div class="status-info">
            <span class="status-label">活动状态:</span>
            <el-tag :type="getStatusType(activityDetail.activityStatus)" class="status-tag">
              {{ getStatusLabel(activityDetail.activityStatus) }}
            </el-tag>
          </div>
          <div class="enroll-info">
            <span class="enroll-label">报名人数:</span>
            <span class="enroll-value">{{ activityDetail.enrollCount || 0 }}人</span>
          </div>
        </div>
      </div>
    </div>

    <div class="activity-details-box">
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
        <span class="detail-value">{{ formatTime(activityDetail.startTime) }} 至 {{ formatTime(activityDetail.endTime) }}</span>
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

    <div class="enroll-section">
      <h3 class="section-title">报名参加活动人员信息</h3>
      <el-table :data="enrollList" border class="enroll-table" empty-text="暂无数据">
        <el-table-column type="index" label="序号" width="80" align="center" />
        <el-table-column prop="name" label="报名人姓名" align="center" />
        <el-table-column prop="phone" label="报名人联系电话" align="center" />
      </el-table>
      <div class="pagination-wrapper" v-if="enrollPage.total > 0">
        <el-pagination
          :current-page="enrollPage.pageNum"
          :page-size="enrollPage.pageSize"
          :total="enrollPage.total"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, prev, pager, next, sizes, jumper"
          @current-change="handleEnrollPageChange"
          @size-change="handleEnrollSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, computed } from 'vue';
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

const { legal_popularize_activity_type: legal_popularize_activity_type_raw, legal_popularize_activity_status } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_activity_type', 'legal_popularize_activity_status')
);

const legal_popularize_activity_type = computed(() => {
  if (!legal_popularize_activity_type_raw.value || !Array.isArray(legal_popularize_activity_type_raw.value)) {
    return [];
  }
  return legal_popularize_activity_type_raw.value.map((item: any) => ({
    ...item,
    value: String(item.value)
  }));
});

const loading = ref(false);

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
  cancelReason: '',
  avatar: undefined as number | undefined
});

const enrollList = ref<Array<{
  name: string;
  phone: string;
}>>([]);

const enrollPage = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '1': 'primary',
    '2': 'success',
    '3': 'info',
    '4': 'warning'
  };
  return map[String(status)] || 'info';
};

const getStatusLabel = (status: string) => {
  const item = legal_popularize_activity_status?.value?.find((item: any) => 
    String(item.value) === String(status)
  );
  return item?.label || status || '-';
};

const getTypeLabel = (type: string) => {
  const typeStr = String(type);
  const item = legal_popularize_activity_type.value?.find((item: any) => String(item.value) === typeStr);
  return item?.label || typeStr || '-';
};

const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  if (timeStr.includes(' ') && timeStr.includes(':')) {
    return timeStr;
  }
  if (timeStr.includes('-')) {
    return timeStr;
  }
  return timeStr;
};

const formatPublishTime = (timeStr: string) => {
  if (!timeStr) return '-';
  const match = timeStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}年${match[2]}月${match[3]}日`;
  }
  return timeStr;
};

const fetchEnrollList = async () => {
  if (!props.id) return;
  
  try {
    const mockData = [
      { name: '张三', phone: '13000000000' },
      { name: '李四', phone: '13000000000' },
      { name: '李四', phone: '13000000000' },
      { name: '李四', phone: '13000000000' },
      { name: '李四', phone: '13000000000' }
    ];
    
    enrollList.value = mockData;
    enrollPage.value.total = mockData.length;
  } catch (error) {
  }
};

const handleEnrollPageChange = (page: number) => {
  enrollPage.value.pageNum = page;
  fetchEnrollList();
};

const handleEnrollSizeChange = (size: number) => {
  enrollPage.value.pageSize = size;
  enrollPage.value.pageNum = 1;
  fetchEnrollList();
};

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
      
      activityDetail.value = {
        id: data.id,
        activityTitle: data.activityTitle || '',
        publisher: data.publishUser || '未知',
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
        cancelReason: data.cancelReason || '',
        avatar: data.avatar
      };
      
      if (data.enrollList && Array.isArray(data.enrollList)) {
        enrollList.value = data.enrollList.map((item: any) => ({
          name: item.enrollUserName || item.userName || item.name || '未知',
          phone: item.enrollUserPhone || item.userPhone || item.phone || '-'
        }));
        enrollPage.value.total = enrollList.value.length;
      } else {
        await fetchEnrollList();
      }
    } else {
      ElMessage.error(response?.msg || '获取活动详情失败');
    }
  } catch (error) {
    ElMessage.error('获取活动详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchActivityDetail();
});
</script>

<style scoped lang="scss">
.activity-detail-dialog {
  padding: 20px;
}

.header-section {
  margin-bottom: 24px;
  
  .header-top {
    text-align: center;
    margin-bottom: 16px;
    
    .main-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
      margin: 0;
      line-height: 1.5;
    }
  }
  
  .header-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    .publisher-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
      
      .avatar {
        flex-shrink: 0;
      }
      
      .publisher-name {
        font-size: 14px;
        color: #303133;
        white-space: nowrap;
      }
      
      .publish-time {
        font-size: 14px;
        color: #909399;
        white-space: nowrap;
      }
    }
    
    .status-enroll-info {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 12px;
      flex-shrink: 0;
      
      .status-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .status-label {
          font-size: 14px;
          color: #606266;
        }
        
        .status-tag {
          margin: 0;
        }
      }
      
      .enroll-info {
        display: flex;
        align-items: center;
        gap: 8px;
        
        .enroll-label {
          font-size: 14px;
          color: #606266;
        }
        
        .enroll-value {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }
      }
    }
  }
}

.activity-details-box {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  margin-bottom: 24px;
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

.enroll-section {
  margin-top: 24px;
  
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 16px 0;
  }
  
  .enroll-table {
    margin-bottom: 16px;
    
    :deep(.el-table__empty-text) {
      color: #909399;
    }
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 16px;
  }
}

@media (max-width: 768px) {
  .activity-detail-dialog {
    padding: 16px;
  }
  
  .header-section {
    .header-bottom {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
      
      .publisher-info {
        width: 100%;
      }
      
      .status-enroll-info {
        align-items: flex-start;
        width: 100%;
      }
    }
  }
  
  .activity-details-box {
    .detail-row {
      flex-direction: column;
      
      .detail-label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>

