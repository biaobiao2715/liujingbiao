<!--
  标题: activityManage.vue
  功能: 普法活动管理
  说明: 用于普法活动的管理，包括查询、添加、编辑、删除、取消活动等操作
  当前版本: 1.0
  负责人： 门世超
  开发信息: Created by AI Assistant
-->
<template>
  <div class="activity-management">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="90" label-position="left">
      <el-form-item label="普法活动标题" prop="activityTitle">
        <el-input v-model="queryParams.activityTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <el-form-item label="所属状态" prop="activityStatus">
        <el-select v-model="queryParams.activityStatus" placeholder="请选择" filterable clearable>
          <el-option v-for="item in legal_popularize_activity_status" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="所属类型" prop="activityType">
        <el-select v-model="queryParams.activityType" placeholder="请选择" filterable clearable>
          <el-option v-for="item in legal_popularize_activity_type" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="发布时间">
        <el-date-picker
          v-model="dateRange"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>

      <el-form-item>
        <el-button v-throttle type="primary" icon="Search" @click="handleSearch">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="12" class="operation-bar">
      <el-col :span="1.5">
        <el-button
          v-throttle
          v-hasPermi="['skill:lawActivity:add']"
          class="operation-btn operation-btn--primary add-btn"
          icon="Plus"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          v-hasPermi="['skill:lawActivity:remove']"
          class="operation-btn operation-btn--danger"
          :class="{ 'is-active': selectedRows.length > 0 }"
          :disabled="selectedRows.length === 0"
          @click="handleDelete"
        >
          删除
        </el-button>
      </el-col>
    </el-row>

    <el-table :data="tableData" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />

      <el-table-column label="普法活动开始时间" prop="startTime" min-width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.startTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="普法活动结束时间" prop="endTime" min-width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.endTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="普法活动标题" prop="activityTitle" :show-overflow-tooltip="true" min-width="200">
        <template #default="scope">
          <span
            class="link-type"
            style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: inline-block; max-width: 100%"
            @click="handleView(scope.row)"
            >{{ scope.row.activityTitle }}</span
          >
        </template>
      </el-table-column>

      <el-table-column label="普法活动地址" prop="activityAddress" :show-overflow-tooltip="true" min-width="250">
        <template #default="scope">
          <span>{{ scope.row.activityAddress }}</span>
        </template>
      </el-table-column>

      <el-table-column label="所属类型" prop="activityType" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-tag :options="legal_popularize_activity_type" :value="String(scope.row.activityType || '')" />
        </template>
      </el-table-column>

      <el-table-column label="联系人" prop="activityContact" width="100" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.activityContact }}</span>
        </template>
      </el-table-column>

      <el-table-column label="联系方式" prop="activityContactPhone" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.activityContactPhone }}</span>
        </template>
      </el-table-column>

      <el-table-column label="报名人数" prop="enrollCount" width="100" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.enrollCount || 0 }}</span>
        </template>
      </el-table-column>

      <el-table-column label="发布时间" prop="publishTime" min-width="160" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.publishTime }}</span>
        </template>
      </el-table-column>

      <el-table-column label="状态" prop="activityStatus" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <div class="status-with-dot">
            <span class="status-dot" :class="`status-dot-${getStatusType(scope.row.activityStatus)}`"></span>
            <span class="status-text" :class="`status-text-${getStatusType(scope.row.activityStatus)}`">
              <dict-text :options="legal_popularize_activity_status" :value="scope.row.activityStatus" />
            </span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" fixed="right" align="left" width="280">
        <template #default="scope">
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <el-button
              v-if="canEditActivity(scope.row)"
              v-throttle
              v-hasPermi="['skill:lawActivity:edit']"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button
              v-throttle
              v-hasPermi="['skill:lawActivity:query']"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button
              v-if="canCancelActivity(scope.row)"
              v-hasPermi="['skill:lawActivity:cancel']"
              v-throttle
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleCancelActivity(scope.row)"
            >
              取消活动
            </el-button>
            <el-button
              v-if="canDeleteActivity(scope.row)"
              v-throttle
              v-hasPermi="['skill:lawActivity:remove']"
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleDeleteSingle(scope.row)"
            >
              删除
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

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.type === 'view' ? '' : getDialogTitle()"
      :show-header="dialog.type !== 'view'"
      :class="{ 'no-header-border': dialog.type === 'view' }"
      width="50%"
      destroy-on-close
      :close-on-click-modal="false"
      @close="dialog.type = ''"
    >
      <Suspense>
        <template #default>
          <component
            :is="dialog.type === 'view' ? ActivityDetailDialog : ActivityEditDialog"
            :id="dialog.id"
            :type="dialog.type"
            @success="onDialogSuccess"
            @cancel="dialog.visible = false"
          />
        </template>
        <template #fallback>
          <el-skeleton :rows="6" animated />
        </template>
      </Suspense>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  getActivityList,
  deleteActivity,
  cancelActivity,
  type ActivityListQuery
} from '@/api/expertServicePlatform/legalServiceManage/activityManage';

const ActivityEditDialog = defineAsyncComponent(() => import('./ActivityEditDialog.vue'));
const ActivityDetailDialog = defineAsyncComponent(() => import('./ActivityDetailDialog.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { legal_popularize_activity_type, legal_popularize_activity_status } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_activity_type', 'legal_popularize_activity_status')
);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  activityTitle: '',
  activityStatus: '',
  activityType: '',
  publishTimeStart: '',
  publishTimeEnd: ''
});

const tableData = ref([]);
const total = ref(0);
const loading = ref(false);
const queryFormRef = ref();
const dateRange = ref(['', '']);
const showSearch = ref(true);
const selectedIds = ref([]);
const selectedRows = ref([]);

const dialog = ref({
  visible: false,
  type: '',
  id: null as string | number | null
});

const getList = async () => {
  loading.value = true;
  try {
    const params: ActivityListQuery = {
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize,
      activityTitle: queryParams.value.activityTitle || undefined,
      activityStatus: queryParams.value.activityStatus || undefined,
      activityType: queryParams.value.activityType || undefined,
      publishTimeStart: queryParams.value.publishTimeStart || undefined,
      publishTimeEnd: queryParams.value.publishTimeEnd || undefined
    };

    const response: any = await getActivityList(params);

    if (response.code === 200) {
      const list = Array.isArray(response.rows) ? response.rows.slice() : [];

      // 按发布时间倒序展示（最新发布时间在最前）
      list.sort((a: any, b: any) => {
        const aTime = a?.publishTime ? new Date(a.publishTime).getTime() : 0;
        const bTime = b?.publishTime ? new Date(b.publishTime).getTime() : 0;
        return bTime - aTime;
      });

      tableData.value = list;
      total.value = response.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
      ElMessage.error(response.msg || '获取数据失败');
    }
  } catch (error) {
    ElMessage.error('获取普法活动列表失败，请稍后重试');
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

const getStatusType = (status: string | number) => {
  const statusStr = String(status);
  switch (statusStr) {
    case '1':
      return 'primary';
    case '2':
      return 'success';
    case '3':
      return 'danger';
    case '99':
      return 'warning';
    default:
      return 'info';
  }
};

/**
 * 判断活动是否为待开始状态
 * @param row 活动数据
 * @returns 是否为待开始状态（状态为1）
 */
const isPendingStatus = (row: any): boolean => {
  const status = String(row.activityStatus || '');
  return status === '1';
};

/**
 * 判断活动是否可以取消
 * 规则：只有待开始状态（状态为1）且自然时间早于普法活动开始时间的活动才能取消
 * @param row 活动数据
 * @returns 是否可以取消
 */
const canCancelActivity = (row: any): boolean => {
  // 检查状态是否为待开始（1）
  if (!isPendingStatus(row)) {
    return false;
  }

  // 检查活动开始时间是否存在
  if (!row.startTime) {
    return false;
  }

  // 检查当前时间是否早于活动开始时间
  const now = new Date();
  const startTime = new Date(row.startTime);

  // 如果当前时间已经大于等于开始时间，则不能取消
  return now < startTime;
};

/**
 * 判断活动是否可以编辑
 * 规则：已取消（状态为99）和已结束（状态为3）的活动不能编辑
 * @param row 活动数据
 * @returns 是否可以编辑
 */
const canEditActivity = (row: any): boolean => {
  const status = String(row.activityStatus || '');
  // 已取消（99）和已结束（3）状态的活动不能编辑
  return status !== '3' && status !== '99';
};

/**
 * 判断活动是否可以删除
 * 规则：只能删除已结束（状态为3）和已取消（状态为99）的活动
 * @param row 活动数据
 * @returns 是否可以删除
 */
const canDeleteActivity = (row: any): boolean => {
  const status = String(row.activityStatus || '');
  // 只有已结束（3）和已取消（99）状态的活动才能删除
  return status === '3' || status === '99';
};

const handleSearch = () => {
  queryParams.value.publishTimeStart = dateRange.value[0];
  queryParams.value.publishTimeEnd = dateRange.value[1];
  queryParams.value.pageNum = 1;
  getList();
};

const handleQuery = () => {
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

const handleReset = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.value.activityTitle = '';
  queryParams.value.activityStatus = '';
  queryParams.value.activityType = '';
  queryParams.value.publishTimeStart = '';
  queryParams.value.publishTimeEnd = '';
  queryParams.value.pageNum = 1;
  handleQuery();
};

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增普法活动',
    'edit': '编辑普法活动',
    'view': '查看普法活动'
  };
  return map[dialog.value.type] || '';
};

const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};

const handleAdd = () => {
  openDialog('add');
};

const handleDelete = async () => {
  const ids = selectedIds.value.slice();

  if (ids.length === 0) {
    ElMessage.warning('请先选择要删除的活动');
    return;
  }

  // 验证：只能删除已结束和已取消的活动
  const invalidRows = selectedRows.value.filter((row: any) => !canDeleteActivity(row));
  if (invalidRows.length > 0) {
    ElMessage.warning('只能删除已结束和已取消的活动');
    return;
  }

  const tip = `确定要删除选中的 ${ids.length} 个活动吗？删除后将无法恢复。`;

  try {
    await ElMessageBox.confirm(tip, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    loading.value = true;

    const response: any = await deleteActivity(ids);

    if (response && response.code === 200) {
      ElMessage.success(response.msg || `成功删除 ${ids.length} 个活动`);
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '删除失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

const handleEdit = (row: any) => {
  if (!row.id) {
    ElMessage.error('活动ID不存在，无法编辑');
    return;
  }
  openDialog('edit', row.id);
};

const handleView = (row: any) => {
  openDialog('view', row.id);
};

const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

const handleCancelActivity = async (row: any) => {
  try {
    if (!row.id) {
      ElMessage.error('活动ID不存在，无法取消');
      return;
    }

    // 验证：只有待开始状态且自然时间早于普法活动开始时间的活动才能取消
    if (!canCancelActivity(row)) {
      const status = String(row.activityStatus || '');
      if (status !== '1') {
        ElMessage.warning('只有待开始状态下的普法活动才可取消');
      } else if (!row.startTime) {
        ElMessage.warning('活动开始时间不存在，无法取消');
      } else {
        const now = new Date();
        const startTime = new Date(row.startTime);
        if (now >= startTime) {
          ElMessage.warning('活动已开始，无法取消');
        }
      }
      return;
    }

    const { value: cancelReason } = await ElMessageBox.prompt(`请输入取消活动"${row.activityTitle}"的原因：`, '取消活动', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPlaceholder: '请输入取消原因',
      inputType: 'textarea',
      inputValidator: (value) => {
        if (!value || value.trim() === '') {
          return '请输入取消原因';
        }
        if (value.length < 5) {
          return '取消原因至少5个字符';
        }
        if (value.length > 200) {
          return '取消原因不能超过200个字符';
        }
        return true;
      },
      inputErrorMessage: '请输入有效的取消原因'
    });

    if (!cancelReason || cancelReason.trim() === '') {
      ElMessage.warning('请输入取消原因');
      return;
    }

    loading.value = true;

    const response: any = await cancelActivity(row.id, cancelReason.trim());

    if (response && response.code === 200) {
      ElMessage.success('活动取消成功');
      await getList();
    } else {
      ElMessage.error(response?.msg || '取消活动失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消活动失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

const handleDeleteSingle = async (row: any) => {
  try {
    if (!row.id) {
      ElMessage.error('活动ID不存在，无法删除');
      return;
    }

    // 验证：只能删除已结束和已取消的活动
    if (!canDeleteActivity(row)) {
      ElMessage.warning('只能删除已结束和已取消的活动');
      return;
    }

    await ElMessageBox.confirm(`确定要删除活动"${row.activityTitle}"吗？删除后将无法恢复。`, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    const ids = [row.id];
    const response: any = await deleteActivity(ids);

    if (response && response.code === 200) {
      ElMessage.success(response.msg || '删除成功');
      await getList();
    } else {
      ElMessage.error(response?.msg || '删除活动失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除活动失败，请稍后重试');
    }
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.activity-management {
  padding: 24px;
  min-height: calc(100vh - 120px);
  box-sizing: border-box;
}

:deep(.el-form) {
  .el-form-item {
    white-space: nowrap;

    .el-form-item__label {
      white-space: nowrap;
    }
  }
}

.operation-bar {
  margin-bottom: 16px;

  .el-col {
    display: flex;
    justify-content: flex-start;
  }
}

.operation-btn {
  width: auto;
  min-width: 100px;
  height: 36px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f2f3f5;
  border-color: #f2f3f5;
  color: #666666;
  transition: all 0.2s ease;

  &--primary {
    padding: 0 24px;
    background-color: #108c58;
    border-color: #108c58;
    color: #ffffff;

    &:not(:disabled):hover {
      background-color: #0d7347;
      border-color: #0d7347;
    }
  }

  &--danger {
    color: #909399;

    &.is-active:not(:disabled) {
      background-color: #f23255;
      border-color: #f23255;
      color: #ffffff;

      &:hover {
        background-color: #d42040;
        border-color: #d42040;
      }
    }
  }

  &:disabled {
    background-color: #f4f5f5;
    border-color: #e6e8eb;
    color: #c0c4cc;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    background-color: #e6e8eb;
    border-color: #e6e8eb;
  }
}

.add-btn {
  width: 80px !important;
  min-width: 80px !important;
  max-width: 80px !important;
  height: 32px !important;
  line-height: 32px;
  padding: 0 !important;
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

    td {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .el-table__cell {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .el-table__column--selection {
    .el-checkbox__inner {
      width: 18px;
      height: 18px;
      border-radius: 4px;
      border: 1px solid #c0c4cc;
      background-color: #ffffff;
      transition: all 0.2s ease;

      &::after {
        left: 5px;
        top: 1px;
        width: 4px;
        height: 9px;
        border: 2px solid #ffffff;
        border-left: 0;
        border-top: 0;
      }
    }

    .el-checkbox__input.is-checked,
    .el-checkbox__input.is-indeterminate {
      .el-checkbox__inner {
        background-color: #108c58;
        border-color: #108c58;
      }
    }
  }
}

.status-with-dot {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot-primary {
  background-color: #108c58;
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

.status-text-primary {
  color: #108c58;
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

.pagination {
  margin-top: 24px;
  justify-content: end;
}

.link-type {
  color: #409eff;
  text-decoration: none;
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

  &.el-tag--primary {
    background-color: #ecf5ff;
    border-color: #409eff;
    color: #409eff;
  }

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

  &.el-tag--warning {
    background-color: #fdf6ec;
    border-color: #e6a23c;
    color: #e6a23c;
  }
}

@media (max-width: 768px) {
  .activity-management {
    padding: 16px;
  }

  .main-content-box {
    padding: 16px;
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

:deep(.el-dialog.no-header-border) {
  .el-dialog__header {
    border-bottom: none !important;
    padding-bottom: 0 !important;
  }

  .el-dialog__body {
    padding-top: 20px !important;
  }
}
</style>
