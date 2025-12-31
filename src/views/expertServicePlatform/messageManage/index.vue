<!--
  标题: 专家咨询服务平台 - 留言管理
  功能: 用于专家咨询服务平台的留言管理，包括查询、查看、回复、删除等操作
  说明: 该页面提供留言的搜索、分页展示功能，并支持查看留言详情和回复留言的弹窗操作。
  负责人： 门世超
  当前版本: 1.0
-->
<template>
  <div class="message-management">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="留言时间" label-width="auto">
        <el-date-picker
          v-model="messageDateRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>

      <el-form-item label="留言内容" prop="messageContent" label-width="auto">
        <el-input
          v-model="queryParams.messageContent"
          :placeholder="queryParams.messageContent ? '' : '请输入内容'"
          clearable
          @keyup.enter="handleSearch"
        />
      </el-form-item>

      <el-form-item label="回复时间" label-width="auto">
        <el-date-picker
          v-model="replyDateRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>

      <el-form-item label="回复状态" prop="questionStatus" label-width="auto">
        <el-select v-model="queryParams.questionStatus" :placeholder="queryParams.questionStatus ? '' : '请选择'" filterable clearable>
          <el-option v-for="item in reply_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button v-throttle type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="tableData" v-loading="loading">
      <el-table-column type="index" label="序号" width="55" align="center" />

      <el-table-column label="留言时间" align="center" prop="messageTime" min-width="180">
        <template #default="scope">
          <span>{{ scope.row.messageTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="留言内容" align="center" prop="messageContent" :show-overflow-tooltip="true" min-width="300">
        <template #default="scope">
          <span
            :class="isQuestionClosed(scope.row) ? '' : 'link-type'"
            :style="isQuestionClosed(scope.row) ? 'cursor: default;' : ''"
            @click="!isQuestionClosed(scope.row) && handleReply(scope.row)"
          >
            {{ scope.row.messageContent }}
          </span>
        </template>
      </el-table-column>

      <el-table-column label="回复时间" align="center" prop="replyTime" min-width="180">
        <template #default="scope">
          <span>{{ scope.row.replyTime || '----' }}</span>
        </template>
      </el-table-column>

      <el-table-column label="回复状态" align="center" prop="questionStatus" width="120">
        <template #default="scope">
          <div class="status-with-dot">
            <span class="status-dot" :class="`status-dot-${getReplyStatusType(scope.row.questionStatus)}`"></span>
            <span class="status-text" :class="`status-text-${getReplyStatusType(scope.row.questionStatus)}`">
              {{ getReplyStatusLabel(scope.row.questionStatus) }}
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="left" fixed="right" width="180">
        <template #default="scope">
          <div class="flex-center operation-btns">
            <el-button
              v-if="!isQuestionClosed(scope.row)"
              v-throttle
              v-hasPermi="['system:answer:add']"
              type="primary"
              link
              @click="handleReply(scope.row)"
            >
              回复
            </el-button>
            <el-button
              v-if="hasReplied(scope.row)"
              v-throttle
              v-hasPermi="['system:question:query']"
              type="primary"
              link
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <pagination
        v-show="total > 0"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:page="handlePageChange"
        @update:limit="handlePageSizeChange"
        @pagination="getList"
      />
    </div>

    <el-dialog v-model="detailDialog.visible" title="留言详情" width="50%" destroy-on-close :close-on-click-modal="false">
      <Suspense>
        <template #default>
          <MessageDetailDialog :id="detailDialog.id" @close="detailDialog.visible = false" />
        </template>
        <template #fallback>
          <el-skeleton :rows="6" animated />
        </template>
      </Suspense>
    </el-dialog>

    <el-dialog v-model="replyDialog.visible" title="回复" width="50%" destroy-on-close :close-on-click-modal="false">
      <Suspense>
        <template #default>
          <MessageReplyDialog
            :id="replyDialog.id"
            :message-content="replyDialog.messageContent"
            :row-data="replyDialog.rowData"
            :batch-ids="replyDialog.batchIds"
            :batch-index="replyDialog.batchIndex"
            :is-pinned="isPinned(replyDialog.id)"
            @success="onReplySuccess"
            @batch-next="onReplyBatchNext"
            @pin="onPin"
            @unpin="onUnpin"
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
import { ref, onMounted, defineAsyncComponent, Suspense, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { getMessageList, type MessageListQuery } from '@/api/expertServicePlatform/messageManage/index';

const MessageDetailDialog = defineAsyncComponent(() => import('./MessageDetailDialog.vue')); // 留言详情弹窗组件
const MessageReplyDialog = defineAsyncComponent(() => import('./MessageReplyDialog.vue')); // 留言回复弹窗组件

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { reply_status } = toRefs<any>((proxy as any)?.useDict('reply_status'));

const queryParams = ref<MessageListQuery>({
  pageNum: 1,
  pageSize: 10,
  messageContent: '',
  questionStatus: ''
});

const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const queryFormRef = ref();
const messageDateRange = ref<string[] | null>(null);
const replyDateRange = ref<string[] | null>(null);
const showSearch = ref(true);
// 置顶的留言ID集合（按置顶顺序存放）
const pinnedIds = ref<Array<string | number>>([]);

const detailDialog = ref({
  visible: false,
  id: null as string | number | null
});

// 回复留言弹窗数据
const replyDialog = ref({
  visible: false,
  id: null as string | number | null,
  messageContent: '',
  rowData: null as any,
  batchIds: [] as Array<string | number>,
  batchIndex: 0
});

// 获取留言列表
const getList = () => {
  loading.value = true;

  const messageDate = messageDateRange.value; // 留言时间范围
  const replyDate = replyDateRange.value; // 回复时间范围
  const messageStartTime = messageDate && Array.isArray(messageDate) && messageDate.length >= 2 ? messageDate[0] : null; // 留言开始时间
  const messageEndTime = messageDate && Array.isArray(messageDate) && messageDate.length >= 2 ? messageDate[1] : null;  // 留言结束时间
  const replyStartTime = replyDate && Array.isArray(replyDate) && replyDate.length >= 2 ? replyDate[0] : null; // 回复开始时间
  const replyEndTime = replyDate && Array.isArray(replyDate) && replyDate.length >= 2 ? replyDate[1] : null; // 回复结束时间

  // 构建查询参数
  const params: MessageListQuery = {
    pageNum: queryParams.value.pageNum, 
    pageSize: queryParams.value.pageSize,
    ...(queryParams.value.messageContent ? { questionContent: queryParams.value.messageContent } : {}),
    ...(queryParams.value.questionStatus ? { questionStatus: queryParams.value.questionStatus } : {}),
    ...(messageStartTime && messageEndTime ? { messageStartTime, messageEndTime } : {}),
    ...(replyStartTime && replyEndTime ? { replyStartTime, replyEndTime } : {})
  };

  getMessageList(params)
    .then((res: any) => {
      if (res && res.code === 200) {
        const rows = (res.rows || []).map((item: any) => ({
          ...item,
          messageContent: item.questionContent || item.messageContent || '',
          messageTime: item.publishTime || item.messageTime || '',
          replyTime: item.latestAnswerTime || item.replyTime || ''
        }));
        tableData.value = applyPinSort(rows);
        total.value = res.total || 0;
      } else {
        tableData.value = [];
        total.value = 0;
        ElMessage.error(res?.msg || '获取数据失败');
      }
    })
    .catch(() => {
      ElMessage.error('获取留言列表失败，请稍后重试');
      tableData.value = [];
      total.value = 0;
    })
    .finally(() => {
      loading.value = false;
    });
};

// 置顶排序
const applyPinSort = (rows: any[]) => {
  if (!pinnedIds.value.length) return rows;
  const indexMap = new Map<string, number>();
  pinnedIds.value.forEach((id, idx) => indexMap.set(String(id), idx));
  return [...rows].sort((a: any, b: any) => {
    const ai = indexMap.has(String(a.id)) ? (indexMap.get(String(a.id)) as number) : Number.POSITIVE_INFINITY;
    const bi = indexMap.has(String(b.id)) ? (indexMap.get(String(b.id)) as number) : Number.POSITIVE_INFINITY;
    if (ai === bi) return 0;
    return ai - bi;
  });
};

// 置顶留言
const pinMessage = (id?: string | number | null) => {
  if (id === undefined || id === null || id === '') return;
  const sid = String(id);
  if (!pinnedIds.value.map(String).includes(sid)) {
    pinnedIds.value.push(id);
  }
  tableData.value = applyPinSort(tableData.value as any[]);
  ElMessage.success('已置顶该条留言');
};

// 取消置顶留言
const onPin = () => {
  pinMessage(replyDialog.value.id);
};

// 取消置顶留言
const onUnpin = () => {
  const id = replyDialog.value.id;
  if (id === undefined || id === null || id === '') return;
  const sid = String(id);
  pinnedIds.value = pinnedIds.value.filter((x) => String(x) !== sid);
  tableData.value = applyPinSort(tableData.value as any[]);
  ElMessage.success('已取消置顶');
};

// 判断留言是否已置顶
const isPinned = (id?: string | number | null) => {
  if (id === undefined || id === null || id === '') return false;
  return pinnedIds.value.map(String).includes(String(id));
};

const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleReset = () => {
  queryFormRef.value?.resetFields();
  messageDateRange.value = null;
  replyDateRange.value = null;
  queryParams.value.messageContent = '';
  queryParams.value.questionStatus = '';
  queryParams.value.pageNum = 1;
  getList();
};

const handlePageChange = (page: number) => {
  queryParams.value.pageNum = page;
  getList();
};

const handlePageSizeChange = (size: number) => {
  queryParams.value.pageSize = size;
  queryParams.value.pageNum = 1;
  getList();
};

const handleView = (row: any) => {
  detailDialog.value = {
    visible: true,
    id: row.id
  };
};

// 判断问题是否已关闭
// 问题状态：0待回答 1已回答 99已关闭
const isQuestionClosed = (row: any): boolean => {
  if (!row || row.questionStatus === undefined || row.questionStatus === null) return false;
  const status = String(row.questionStatus);
  // 99 表示已关闭
  return status === '99';
};

// 判断是否已回复
// 问题状态：0待回答 1已回答 99已关闭
const hasReplied = (row: any): boolean => {
  if (!row || row.questionStatus === undefined || row.questionStatus === null) return false;
  const status = String(row.questionStatus);
  // 1 或 99 表示已回复
  return status === '1' || status === '99';
};

const getReplyStatusLabel = (status: any) => {
  const value = String(status ?? '');
  const list = reply_status.value || [];
  const target = list.find((item: any) => String(item.value) === value);
  return target?.label || '--';
};

const getReplyStatusType = (status: any) => {
  const value = String(status ?? '');
  if (value === '99') return 'danger'; // 已关闭
  if (value === '1') return 'success'; // 已回复
  if (value === '0') return 'warning'; // 未回复
  return 'info';
};

const getUnrepliedSequence = () => {
  return (tableData.value || [])
    .filter((r: any) => String(r.questionStatus) === '0' && !isQuestionClosed(r))
    .map((r: any) => r.id)
    .filter((id: any) => id !== undefined && id !== null && id !== '');
};

const handleReply = (row: any) => {
  // 关闭后无法跳转到回复页面
  if (isQuestionClosed(row)) {
    ElMessage.warning('该留言已关闭，无法回复');
    return;
  }

  const batchIds = getUnrepliedSequence();
  const index = batchIds.findIndex((id: any) => String(id) === String(row.id));
  replyDialog.value.visible = true;
  replyDialog.value.id = row.id;
  replyDialog.value.messageContent = row.messageContent;
  replyDialog.value.rowData = row;
  replyDialog.value.batchIds = batchIds;
  replyDialog.value.batchIndex = index >= 0 ? index : 0;
};

const onReplySuccess = () => {
  // 保持弹窗打开，刷新列表以同步最新状态与时间
  getList();
};

const onReplyBatchNext = () => {
  const ids = replyDialog.value.batchIds || [];
  let idx = replyDialog.value.batchIndex || 0;
  idx += 1;
  if (idx >= ids.length) {
    replyDialog.value.visible = false;
    getList();
    return;
  }
  const nextId = ids[idx];
  const nextRow = (tableData.value || []).find((r: any) => String(r.id) === String(nextId));
  replyDialog.value.batchIndex = idx;
  replyDialog.value.id = nextId;
  replyDialog.value.messageContent = nextRow?.messageContent || '';
  replyDialog.value.rowData = nextRow || { id: nextId, messageContent: '' };
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.message-management {
  padding: 24px;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;
}

:deep(.el-table) {
  .el-table__header {
    background-color: #fafafa;

    th {
      background-color: #fafafa !important;
      color: #606266;
      font-weight: 600;
    }
  }

  .el-table__body {
    tr {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

.pagination {
  margin-top: 24px;
  justify-content: end;
}

.link-type {
  color: #108C58;
  cursor: pointer;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
    color: #0D7347;
  }
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.operation-btns {
  gap: 8px;

  :deep(.el-button) {
    font-size: 14px;
  }
}

.status-with-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-success {
  background-color: #108c58;
}

.status-dot-warning {
  background-color: #ff7b00;
}

.status-dot-danger {
  background-color: #f23255;
}

.status-dot-info {
  background-color: #909399;
}

.status-text {
  font-size: 14px;
}

.status-text-success {
  color: #108c58;
}

.status-text-warning {
  color: #ff7b00;
}

.status-text-danger {
  color: #f23255;
}

.status-text-info {
  color: #909399;
}
</style>
