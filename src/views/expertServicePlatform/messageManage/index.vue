<!--
  标题: messageManage.vue
  功能: 留言管理
  说明: 用于专家咨询服务平台的留言管理，包括查询、查看、回复、删除等操作
  当前版本: 1.0
-->
<template>
  <div class="message-management">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 搜索条件 -->
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="100">
        <!-- 留言时间选择器 -->
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
        
        <!-- 留言内容搜索框 -->
        <el-form-item label="留言内容" prop="messageContent">
          <el-input v-model="queryParams.messageContent" placeholder="请输入内容" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <!-- 回复时间选择器 -->
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
        
        <!-- 回复状态下拉框 -->
        <el-form-item label="回复状态" prop="replyStatus">
          <el-select v-model="queryParams.replyStatus" placeholder="请选择" filterable clearable>
            <el-option label="已回复" value="1" />
            <el-option label="未回复" value="0" />
          </el-select>
        </el-form-item>
        
        <!-- 查询和重置按钮 -->
        <el-form-item>
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <RightToolbar :show-search="showSearch" @query-table="getList"></RightToolbar>
      </el-row>

      <!-- 表格展示 -->
      <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <!-- 留言时间 -->
        <el-table-column label="留言时间" align="center" prop="messageTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.messageTime }}</span>
          </template>
        </el-table-column>
        
        <!-- 留言内容 -->
        <el-table-column label="留言内容" align="center" prop="messageContent" :show-overflow-tooltip="true" min-width="300">
          <template #default="scope">
            <span class="link-type" @click="handleView(scope.row)">{{ scope.row.messageContent }}</span>
          </template>
        </el-table-column>
        
        <!-- 回复时间 -->
        <el-table-column label="回复时间" align="center" prop="replyTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.replyTime || '----' }}</span>
          </template>
        </el-table-column>
        
        <!-- 回复状态 -->
        <el-table-column label="回复状态" align="center" prop="replyStatus" width="120">
          <template #default="scope">
            <el-tag :type="scope.row.replyStatus === '1' ? 'success' : 'danger'">
              {{ scope.row.replyStatus === '1' ? '已回复' : '未回复' }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" align="center" width="180">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button 
                v-throttle 
                v-hasPermi="['expert:message:query']" 
                type="primary" 
                size="small" 
                @click="handleView(scope.row)"
              >
                查看
              </el-button>
              <el-button 
                v-throttle 
                v-hasPermi="['expert:message:reply']" 
                type="success" 
                size="small" 
                @click="handleReply(scope.row)"
              >
                回复
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
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

    <!-- 弹窗：查看详情 -->
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

    <!-- 弹窗：回复留言 -->
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
import { ref, onMounted, defineAsyncComponent, Suspense } from 'vue';
import { ElMessage } from 'element-plus';
import { 
  getMessageList,
  type MessageListQuery 
} from '@/api/expertServicePlatform/messageManage/index';

// 弹窗组件异步加载
const MessageDetailDialog = defineAsyncComponent(() => import('./MessageDetailDialog.vue'));
const MessageReplyDialog = defineAsyncComponent(() => import('./MessageReplyDialog.vue'));

// 搜索表单数据
const queryParams = ref<MessageListQuery>({
  pageNum: 1,
  pageSize: 10,
  messageContent: '',
  replyStatus: ''
});

// 表格数据
const tableData = ref([]);
// 总记录数
const total = ref(0);
// 加载状态
const loading = ref(false);
// 表单引用
const queryFormRef = ref();
// 留言日期范围
const messageDateRange = ref<[string, string]>(['', '']);
// 回复日期范围
const replyDateRange = ref<[string, string]>(['', '']);
// 是否显示搜索
const showSearch = ref(true);
// 选中的行ID数组
const selectedIds = ref([]);
// 选中的行数据数组
const selectedRows = ref([]);

// 详情弹窗控制
const detailDialog = ref({
  visible: false,
  id: null as string | number | null
});

// 回复弹窗控制
const replyDialog = ref({
  visible: false,
  id: null as string | number | null,
  messageContent: ''
});

/** 获取留言列表 */
const getList = () => {
  loading.value = true;
  
  const [messageStartTime, messageEndTime] = messageDateRange.value || [];
  const [replyStartTime, replyEndTime] = replyDateRange.value || [];
  
  const params: MessageListQuery = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    ...(queryParams.value.messageContent ? { messageContent: queryParams.value.messageContent } : {}),
    ...(queryParams.value.replyStatus !== '' ? { replyStatus: queryParams.value.replyStatus } : {}),
    ...(messageStartTime && messageEndTime ? { messageStartTime, messageEndTime } : {}),
    ...(replyStartTime && replyEndTime ? { replyStartTime: replyStartTime, replyEndTime: replyEndTime } : {})
  };
  
  getMessageList(params).then((res: any) => {
    if (res && res.code === 200) {
      // 映射API返回的字段到页面显示的字段
      const rows = (res.rows || []).map((item: any) => ({
        ...item,
        // 兼容字段映射：API返回字段 -> 页面显示字段
        messageContent: item.questionContent || item.messageContent || '', // 问题内容 -> 留言内容
        messageTime: item.publishTime || item.messageTime || '', // 发布时间 -> 留言时间
        replyTime: item.latestAnswerTime || item.replyTime || '', // 最新回答时间 -> 回复时间
        // 根据问题状态判断回复状态：1已回答 表示已回复，0待回答或99已关闭表示未回复
        replyStatus: item.questionStatus === '1' ? '1' : (item.replyStatus || '0') // 问题状态 -> 回复状态
      }));
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

/** 查询按钮事件 */
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const handleReset = () => {
  queryFormRef.value?.resetFields();
  messageDateRange.value = ['', ''];
  replyDateRange.value = ['', ''];
  queryParams.value.messageContent = '';
  queryParams.value.replyStatus = '';
  handleQuery();
};

// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

/** 查看按钮事件 */
const handleView = (row: any) => {
  detailDialog.value = {
    visible: true,
    id: row.id
  };
};

/** 回复按钮事件 */
const handleReply = (row: any) => {
  replyDialog.value = {
    visible: true,
    id: row.id,
    messageContent: row.messageContent
  };
};

/** 回复成功回调 */
const onReplySuccess = () => {
  replyDialog.value.visible = false;
  getList();
};

// 页面加载时获取列表数据
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

// 主要内容区域 - 大盒子
.main-content-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  
  // 搜索表单样式
  .el-form {
    margin-bottom: 20px;
    
    .el-form-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  // 操作按钮区域样式
  .mb8 {
    margin-bottom: 16px;
  }
  
  // 表格样式
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
  
  // 分页样式
  .pagination {
    margin-top: 20px;
    justify-content: end;
  }
}

// 链接样式
.link-type {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
    color: #66b1ff;
  }
}

// 按钮样式优化
.el-button {
  border-radius: 4px;
  font-weight: 500;
  
  &.el-button--small {
    padding: 5px 12px;
    font-size: 12px;
  }
}

// 标签样式
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

// 响应式设计
@media (max-width: 768px) {
  .message-management {
    padding: 16px;
  }
  
  .main-content-box {
    padding: 16px;
  }
}

// 操作按钮组样式
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

