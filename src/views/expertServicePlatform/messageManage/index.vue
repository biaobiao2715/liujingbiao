<!--
  标题: messageManage.vue
  功能: 留言管理
  说明: 用于专家咨询服务平台的留言管理，包括查询、查看、回复、删除等操作
  当前版本: 1.0
-->
<template>
  <div class="message-management">
    <div class="main-content-box">
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="100">
        <el-form-item label="留言时间">
          <el-date-picker
            v-model="messageDateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            range-separator=" - "
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        
        <el-form-item label="留言内容" prop="messageContent">
          <el-input v-model="queryParams.messageContent" placeholder="请输入内容" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <el-form-item label="回复时间">
          <el-date-picker
            v-model="replyDateRange"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            range-separator=" - "
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        
        <el-form-item label="回复状态" prop="replyStatus">
          <el-select v-model="queryParams.replyStatus" placeholder="请选择状态" filterable clearable>
            <el-option 
              v-for="item in replyStatusOptions" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar>
      </el-row>

      <el-table :data="tableData" border v-loading="loading" style="width: 100%">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <el-table-column label="留言时间" align="center" prop="messageTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.messageTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="留言内容" align="center" prop="messageContent" :show-overflow-tooltip="true" min-width="300">
          <template #default="scope">
            <span class="link-type" @click="handleView(scope.row)">{{ scope.row.messageContent }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="回复时间" align="center" prop="replyTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.replyTime || '----' }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="回复状态" align="center" prop="replyStatus" width="120">
          <template #default="scope">
            <dict-tag :options="replyStatusOptions" :value="scope.row.replyStatus" />
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center" width="180">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button 
                v-if="String(scope.row.replyStatus) === '0'"
                v-throttle 
                v-hasPermi="['system:answer:add']" 
                type="success" 
                size="small" 
                @click="handleReply(scope.row)"
              >
                回复
              </el-button>
              <el-button 
                v-else
                v-throttle 
                v-hasPermi="['system:question:query']" 
                type="primary" 
                size="small" 
                @click="handleView(scope.row)"
              >
                查看
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex-center pagination">
        <Pagination 
          v-show="total > 0" 
          :page="queryParams.pageNum" 
          :limit="queryParams.pageSize" 
          :total="total" 
          @pagination="getList" 
        />
      </div>
    </div>

    <el-dialog
      v-model="detailDialog.visible"
      title="留言详情"
      width="60%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <Suspense>
        <template #default>
          <MessageDetailDialog
            :id="detailDialog.id"
            @close="detailDialog.visible = false"
          />
        </template>
        <template #fallback>
          <el-skeleton :rows="6" animated />
        </template>
      </Suspense>
    </el-dialog>

    <el-dialog
      v-model="replyDialog.visible"
      title="回复留言"
      width="50%"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <Suspense>
        <template #default>
          <MessageReplyDialog
            :id="replyDialog.id"
            :message-content="replyDialog.messageContent"
            :row-data="replyDialog.rowData"
            @success="onReplySuccess"
            @cancel="replyDialog.visible = false"
          />
        </template>
        <template #fallback>
          <el-skeleton :rows="4" animated />
        </template>
      </Suspense>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, defineAsyncComponent, Suspense, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  getMessageList,
  type MessageListQuery 
} from '@/api/expertServicePlatform/messageManage/index';

const MessageDetailDialog = defineAsyncComponent(() => import('./MessageDetailDialog.vue'));
const MessageReplyDialog = defineAsyncComponent(() => import('./MessageReplyDialog.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { msg_status } = toRefs<any>(
  (proxy as any)?.useDict('msg_status')
);

const replyStatusOptions = computed(() => {
  if (msg_status.value && Array.isArray(msg_status.value) && msg_status.value.length > 0) {
    return msg_status.value;
  }
  return [
    { label: '未回复', value: '0' },
    { label: '已回复', value: '1' }
  ];
});

const queryParams = ref<MessageListQuery>({
  pageNum: 1,
  pageSize: 10,
  messageContent: '',
  replyStatus: ''
});

const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const queryFormRef = ref();
const messageDateRange = ref<string[] | null>(null);
const replyDateRange = ref<string[] | null>(null);
const showSearch = ref(true);

const detailDialog = ref({
  visible: false,
  id: null as string | number | null
});

const replyDialog = ref({
  visible: false,
  id: null as string | number | null,
  messageContent: '',
  rowData: null as any
});

const getList = () => {
  loading.value = true;
  
  const messageDate = messageDateRange.value;
  const replyDate = replyDateRange.value;
  const messageStartTime = messageDate && Array.isArray(messageDate) && messageDate.length >= 2 ? messageDate[0] : null;
  const messageEndTime = messageDate && Array.isArray(messageDate) && messageDate.length >= 2 ? messageDate[1] : null;
  const replyStartTime = replyDate && Array.isArray(replyDate) && replyDate.length >= 2 ? replyDate[0] : null;
  const replyEndTime = replyDate && Array.isArray(replyDate) && replyDate.length >= 2 ? replyDate[1] : null;
  
  let questionStatusParam: string | undefined;
  if (queryParams.value.replyStatus !== '' && queryParams.value.replyStatus !== null) {
    questionStatusParam = queryParams.value.replyStatus;
  }
  
  const params: MessageListQuery = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    ...(queryParams.value.messageContent ? { messageContent: queryParams.value.messageContent } : {}),
    ...(questionStatusParam ? { questionStatus: questionStatusParam } : {}),
    ...(messageStartTime && messageEndTime ? { messageStartTime, messageEndTime } : {}),
    ...(replyStartTime && replyEndTime ? { replyStartTime, replyEndTime } : {})
  };
  
  getMessageList(params).then((res: any) => {
    if (res && res.code === 200) {
      const rows = (res.rows || []).map((item: any) => {
        let replyStatus = '0';
        const questionStatus = String(item.questionStatus || '');
        const hasAnswerTime = item.latestAnswerTime && 
          typeof item.latestAnswerTime === 'string' && 
          item.latestAnswerTime.trim() !== '';
        const hasAnswerList = item.hnAnswerVoList && 
          Array.isArray(item.hnAnswerVoList) && 
          item.hnAnswerVoList.length > 0;
        
        if (questionStatus === '1' || hasAnswerTime || hasAnswerList) {
          replyStatus = '1';
        }
        
        return {
          ...item,
          messageContent: item.questionContent || item.messageContent || '',
          messageTime: item.publishTime || item.messageTime || '',
          replyTime: item.latestAnswerTime || item.replyTime || '',
          replyStatus: replyStatus
        };
      });
      tableData.value = rows;
      total.value = res.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
      ElMessage.error(res?.msg || '获取数据失败');
    }
  }).catch(() => {
    ElMessage.error('获取留言列表失败，请稍后重试');
    tableData.value = [];
    total.value = 0;
  }).finally(() => {
    loading.value = false;
  });
};

const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleReset = () => {
  queryFormRef.value?.resetFields();
  messageDateRange.value = null;
  replyDateRange.value = null;
  queryParams.value.messageContent = '';
  queryParams.value.replyStatus = '';
  queryParams.value.pageNum = 1;
  handleQuery();
};

const handleView = (row: any) => {
  detailDialog.value = {
    visible: true,
    id: row.id
  };
};

const handleReply = (row: any) => {
  replyDialog.value = {
    visible: true,
    id: row.id,
    messageContent: row.messageContent,
    rowData: row
  };
};

const onReplySuccess = () => {
  replyDialog.value.visible = false;
  getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.message-management {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.main-content-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  
  .el-form {
    margin-bottom: 20px;
    
    .el-form-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  .mb8 {
    margin-bottom: 16px;
  }
  
  .el-table {
    margin-bottom: 20px;
    
    :deep(.el-table__header) {
      background-color: #fafafa;
      
      th {
        background-color: #fafafa !important;
        color: #606266;
        font-weight: 600;
      }
    }
    
    :deep(.el-table__body) {
      tr {
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
  
  .pagination {
    margin-top: 20px;
    justify-content: end;
  }
}

.link-type {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
    color: #66b1ff;
  }
}

.el-button {
  border-radius: 4px;
  font-weight: 500;
  
  &.el-button--small {
    padding: 5px 12px;
    font-size: 12px;
  }
}

.el-tag {
  border-radius: 4px;
  font-weight: 500;
  
  &.el-tag--success {
    background-color: #f0f9ff;
    border-color: #67c23a;
    color: #67c23a;
  }
  
  &.el-tag--danger {
    background-color: #fef0f0;
    border-color: #f56c6c;
    color: #f56c6c;
  }
}

@media (max-width: 768px) {
  .message-management {
    padding: 16px;
  }
  
  .main-content-box {
    padding: 16px;
  }
}

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
  
  .el-button {
    margin: 0;
    padding: 4px 8px;
    font-size: 12px;
    min-width: auto;
    flex-shrink: 0;
  }
}
</style>
