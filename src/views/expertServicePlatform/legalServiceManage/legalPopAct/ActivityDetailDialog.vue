<!--
  标题: ActivityDetailDialog.vue
  功能: 普法活动详情弹窗
  说明: 用于查看普法活动的详细信息（弹窗形式）
  当前版本: 1.0
-->
<template>
  <div class="activity-detail-dialog" v-loading="loading">
    <div class="dialog-title">
      <span>普法活动详情</span>
    </div>
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
            <span class="status-pill" :class="getStatusClass(activityDetail.activityStatus)">
              {{ getStatusLabel(activityDetail.activityStatus) }}
            </span>
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
      <el-table :data="paginatedEnrollList" border class="enroll-table" empty-text="暂无数据" v-loading="enrollLoading">
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
import dayjs from 'dayjs';
import { getActivityDetail } from '@/api/expertServicePlatform/legalServiceManage/activityManage';
import { activityEnrollList } from '@/api/expertServicePlatform/trainingMeeting';

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

const enrollList = ref<
  Array<{
    name: string;
    phone: string;
  }>
>([]);

const enrollPage = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
});
const enrollLoading = ref(false);

const paginatedEnrollList = computed(() => {
  const start = (enrollPage.value.pageNum - 1) * enrollPage.value.pageSize;
  const end = start + enrollPage.value.pageSize;
  return enrollList.value.slice(start, end);
});

const getStatusType = (status: string) => {
  const map: Record<string, any> = {
    '1': 'primary',
    '2': 'success',
    '3': 'danger',
    '4': 'warning',
    '99': 'danger'
  };
  return map[String(status)] || 'info';
};

const getStatusLabel = (status: string) => {
  const item = legal_popularize_activity_status?.value?.find((item: any) => String(item.value) === String(status));
  return item?.label || status || '-';
};

const getStatusClass = (status: string) => {
  const map: Record<string, string> = {
    '1': 'status-pending',
    '2': 'status-started',
    '3': 'status-finished',
    '4': 'status-canceled',
    '99': 'status-finished'
  };
  return map[String(status)] || 'status-default';
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
  const parsed = dayjs(timeStr);
  if (parsed.isValid()) {
    return parsed.format('YYYY年MM月DD日 HH:mm:ss');
  }
  return timeStr;
};

const fetchEnrollList = async () => {
  if (!props.id) return;

  enrollLoading.value = true;
  try {
    const response: any = await activityEnrollList({
      foreignId: props.id,
      pageNum: enrollPage.value.pageNum,
      pageSize: enrollPage.value.pageSize
    });

    if (response && response.code === 200) {
      const rows = Array.isArray(response.rows)
        ? response.rows
        : Array.isArray(response.data?.rows)
          ? response.data.rows
          : Array.isArray(response.data)
            ? response.data
            : [];

      enrollList.value = rows.map((item: any) => ({
        name: item.enrollUserNickName || item.enrollUserName || item.userName || item.name || '未知',
        phone: item.enrollUserPhone || item.userPhone || item.phone || '-'
      }));
      enrollPage.value.total = Number(response.total ?? rows.length ?? 0);
    } else {
      enrollList.value = [];
      enrollPage.value.total = 0;
    }
  } catch (error) {
    console.error('获取报名人员失败', error);
    enrollList.value = [];
    enrollPage.value.total = 0;
  } finally {
    enrollLoading.value = false;
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
      await fetchEnrollList();
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

.dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e4e7ed;
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
        .status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          height: 28px;
          border-radius: 4px;
          font-size: 14px;
          border: 1px solid transparent;
          box-sizing: border-box;
        }
        .status-default {
          color: #606266;
          border-color: #dcdfe6;
          background-color: #f5f7fa;
        }
        .status-started {
          color: #409eff;
          border-color: rgba(64, 158, 255, 0.4);
          background-color: rgba(64, 158, 255, 0.08);
        }
        .status-canceled {
          color: #c0c4cc;
          border-color: rgba(192, 196, 204, 0.6);
          background-color: rgba(192, 196, 204, 0.12);
        }
        .status-finished {
          color: #f56c6c;
          border-color: rgba(245, 108, 108, 0.4);
          background-color: rgba(245, 108, 108, 0.08);
        }
        .status-pending {
          color: #f08a24;
          border-color: rgba(240, 138, 36, 0.4);
          background-color: rgba(240, 138, 36, 0.08);
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
