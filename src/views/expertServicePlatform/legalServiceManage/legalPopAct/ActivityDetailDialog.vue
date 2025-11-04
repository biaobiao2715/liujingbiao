<!--
  标题: ActivityDetailDialog.vue
  功能: 普法活动详情弹窗
  说明: 用于查看普法活动的详细信息（弹窗形式）
  当前版本: 1.0
-->
<template>
  <div class="activity-detail-dialog" v-loading="loading">
    <!-- 头部区域 -->
    <div class="header-section">
      <!-- 顶部：标题居中 -->
      <div class="header-top">
        <h2 class="main-title">{{ activityDetail.activityTitle || '活动标题' }}</h2>
      </div>
      
      <!-- 下方：发布人信息和状态信息 -->
      <div class="header-bottom">
        <!-- 左侧：发布人信息和发布时间 -->
        <div class="publisher-info">
          <el-avatar :size="48" class="avatar">{{ (activityDetail.publisher || '发布人').slice(0, 1) }}</el-avatar>
          <span class="publisher-name">发布人: {{ activityDetail.publisher || '未知' }}</span>
          <span class="publish-time">发布时间: {{ formatPublishTime(activityDetail.publishTime) }}</span>
        </div>
        
        <!-- 右侧：活动状态、报名人数 -->
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

    <!-- 活动详细信息（带边框框） -->
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

    <!-- 报名参加活动人员信息 -->
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
  cancelReason: '',
  avatar: undefined as number | undefined // 发布人头像ID
});

// 报名人员列表
const enrollList = ref<Array<{
  name: string;
  phone: string;
}>>([]);

// 报名人员分页
const enrollPage = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0
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

/** 格式化时间 */
const formatTime = (timeStr: string) => {
  if (!timeStr) return '-';
  // 如果是完整的日期时间格式，直接返回
  if (timeStr.includes(' ') && timeStr.includes(':')) {
    return timeStr;
  }
  // 如果是日期格式，添加默认时间
  if (timeStr.includes('-')) {
    return timeStr;
  }
  return timeStr;
};

/** 格式化发布时间 */
const formatPublishTime = (timeStr: string) => {
  if (!timeStr) return '-';
  // 将 "2019-03-15" 格式转换为 "2019年03月15日"
  const match = timeStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return `${match[1]}年${match[2]}月${match[3]}日`;
  }
  return timeStr;
};

/** 获取报名人员列表 */
const fetchEnrollList = async () => {
  if (!props.id) return;
  
  try {
    // TODO: 这里需要对接实际的报名人员列表API
    // 暂时使用模拟数据
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
    // 静默处理错误
  }
};

/** 报名人员分页变化 */
const handleEnrollPageChange = (page: number) => {
  enrollPage.value.pageNum = page;
  fetchEnrollList();
};

/** 报名人员每页条数变化 */
const handleEnrollSizeChange = (size: number) => {
  enrollPage.value.pageSize = size;
  enrollPage.value.pageNum = 1;
  fetchEnrollList();
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
      
      // 将接口返回的数据赋值给详情（根据API文档 HnLawActivityVo）
      activityDetail.value = {
        id: data.id,
        activityTitle: data.activityTitle || '',
        publisher: data.publishUser || '未知', // 发布人字段
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
        avatar: data.avatar // 发布人头像ID
      };
      
      // 加载报名人员列表（enrollList 在响应数据的 data 中）
      if (data.enrollList && Array.isArray(data.enrollList)) {
        // 根据API文档，enrollList 是 HnActivityEnroll 数组
        // 需要从每个 enroll 对象中提取报名人信息
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

// 头部区域
.header-section {
  margin-bottom: 24px;
  
  // 顶部：标题居中
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
  
  // 下方：发布人信息和状态信息
  .header-bottom {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    
    // 左侧：发布人信息和发布时间
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
    
    // 右侧：活动状态、报名人数
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

// 活动详细信息（带边框框）
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

// 报名参加活动人员信息区域
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

// 响应式设计
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

