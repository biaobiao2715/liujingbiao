<!--
  标题: activityManage.vue
  功能: 普法活动管理
  说明: 用于普法活动的管理，包括查询、添加、编辑、删除、取消活动等操作
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="activity-management">
    <div class="main-content-box">
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <el-form-item label="普法活动标题" prop="activityTitle">
          <el-input v-model="queryParams.activityTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <el-form-item label="所属状态" prop="activityStatus">
          <el-select v-model="queryParams.activityStatus" placeholder="请选择状态" filterable clearable>
            <el-option 
              v-for="item in legal_popularize_activity_status" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="所属类型" prop="activityType">
          <el-select v-model="queryParams.activityType" placeholder="请选择类型" filterable clearable>
            <el-option 
              v-for="item in legal_popularize_activity_type" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
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
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawActivity:add']" type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawActivity:remove']" type="danger" @click="handleDelete">删除</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <el-table-column label="普法活动开始时间" align="center" prop="startTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.startTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="普法活动结束时间" align="center" prop="endTime" min-width="180">
          <template #default="scope">
            <span>{{ scope.row.endTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="普法活动标题" align="center" prop="activityTitle" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <router-link :to="'/expertServicePlatform/legalServiceManage/activityDetail?id=' + scope.row.id + '&type=view'" class="link-type">
              <span>{{ scope.row.activityTitle }}</span>
            </router-link>
          </template>
        </el-table-column>
        
        <el-table-column label="普法活动地址" align="center" prop="activityAddress" :show-overflow-tooltip="true" min-width="250">
          <template #default="scope">
            <span>{{ scope.row.activityAddress }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="所属类型" align="center" prop="activityType" width="120">
          <template #default="scope">
            <dict-tag :options="legal_popularize_activity_type" :value="String(scope.row.activityType || '')" />
          </template>
        </el-table-column>
        
        <el-table-column label="联系人" align="center" prop="activityContact" width="100">
          <template #default="scope">
            <span>{{ scope.row.activityContact }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="联系方式" align="center" prop="activityContactPhone" width="120">
          <template #default="scope">
            <span>{{ scope.row.activityContactPhone }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="报名人数" align="center" prop="enrollCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.enrollCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="发布时间" align="center" prop="publishTime" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.publishTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" align="center" prop="activityStatus" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.activityStatus)">
              <dict-text :options="legal_popularize_activity_status" :value="scope.row.activityStatus" />
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center" width="280">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button 
                v-throttle 
                v-hasPermi="['skill:lawActivity:edit']" 
                type="primary" 
                size="small" 
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                v-throttle 
                v-hasPermi="['skill:lawActivity:query']" 
                type="info" 
                size="small" 
                @click="handleView(scope.row)"
              >
                查看
              </el-button>
              <el-button 
                v-if="String(scope.row.activityStatus) === '1' || Number(scope.row.activityStatus) === 1" 
                v-hasPermi="['skill:lawActivity:cancel']" 
                v-throttle 
                type="warning" 
                size="small" 
                @click="handleCancelActivity(scope.row)"
              >
                取消活动
              </el-button>
              <el-button 
                v-if="String(scope.row.activityStatus) === '99' || String(scope.row.activityStatus) === '3'" 
                v-throttle 
                v-hasPermi="['skill:lawActivity:remove']" 
                type="danger" 
                size="small" 
                @click="handleDeleteSingle(scope.row)"
              >
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex-center pagination">
        <Pagination 
          v-if="total > 0" 
          v-model:total="total"
          v-model:page="queryParams.pageNum" 
          v-model:limit="queryParams.pageSize" 
          @pagination="getList" 
        />
      </div>
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.type === 'view' ? '' : getDialogTitle()"
      :show-header="dialog.type !== 'view'"
      :class="{ 'no-header-border': dialog.type === 'view' }"
      width="80%"
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
  startTime: '',
  endTime: ''
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
      startTime: queryParams.value.startTime || undefined,
      endTime: queryParams.value.endTime || undefined
    };
    
    const response: any = await getActivityList(params);
    
    if (response.code === 200) {
      tableData.value = response.rows || [];
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

const handleSearch = () => {
  queryParams.value.startTime = dateRange.value[0];
  queryParams.value.endTime = dateRange.value[1];
  queryParams.value.pageNum = 1;
  getList();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleReset = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.value.activityTitle = '';
  queryParams.value.activityStatus = '';
  queryParams.value.activityType = '';
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
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
  
  const tip = `确定要删除选中的 ${ids.length} 个活动吗？删除后将无法恢复。`;
  
  try {
    await ElMessageBox.confirm(tip, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
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
    
    const { value: cancelReason } = await ElMessageBox.prompt(
      `请输入取消活动"${row.activityTitle}"的原因：`,
      '取消活动',
      {
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
      }
    );
    
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
    
    await ElMessageBox.confirm(
      `确定要删除活动"${row.activityTitle}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
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

.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
  
  .el-button {
    margin: 0;
    padding: 4px 8px;
    font-size: 12px;
    min-width: auto;
    flex-shrink: 0;
  }
}

:deep(.el-table__body-wrapper) {
  .operation-buttons {
    .el-button + .el-button {
      margin-left: 0;
    }
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
