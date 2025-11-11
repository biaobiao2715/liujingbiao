<!--
  标题: contentManage.vue
  功能: 普法内容管理
  说明: 用于普法内容的管理，包括查询、添加、编辑、删除、启用停用等操作
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="content-management">
    <div class="main-content-box">
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <el-form-item label="普法类型" prop="contentType">
          <el-select v-model="queryParams.contentType" placeholder="请选择" filterable clearable>
            <el-option label="请选择" value="" />
            <el-option 
              v-for="item in legal_popularize_type" 
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
        
        <el-form-item label="所属状态" prop="contentStatus">
          <el-select v-model="queryParams.contentStatus" placeholder="请选择" filterable clearable>
            <el-option 
              v-for="item in legal_popularize_status" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        
        <el-form-item label="普法内容标题" prop="title">
          <el-input v-model="queryParams.title" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <el-form-item>
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:add']" type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:edit']" type="success" @click="handleEnable">启用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:edit']" type="warning" @click="handleDisable">停用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:lawContent:remove']" type="danger" @click="handleDelete">删除</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <el-table-column label="内容编号" align="center" prop="contentNo" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.contentNo }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="内容标题" align="center" prop="contentTitle" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <span>{{ scope.row.contentTitle }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="普法类型" align="center" prop="contentType" width="120">
          <template #default="scope">
            <dict-tag :options="legal_popularize_type" :value="scope.row.contentType" />
          </template>
        </el-table-column>
        
        <el-table-column label="发布时间" align="center" prop="publishTime" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.publishTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="浏览量" align="center" prop="viewCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.viewCount != null ? scope.row.viewCount : 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="下载量" align="center" prop="downloadCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.downloadCount != null ? scope.row.downloadCount : 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="状态" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center" width="280" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button 
                v-throttle 
                v-hasPermi="['skill:lawContent:edit']" 
                type="primary" 
                size="small" 
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                v-throttle 
                v-hasPermi="['skill:lawContent:query']" 
                type="info" 
                size="small" 
                @click="handleView(scope.row)"
              >
                查看
              </el-button>
              <el-button 
                v-if="scope.row.status === '启用'" 
                v-throttle 
                v-hasPermi="['skill:lawContent:edit']" 
                type="warning" 
                size="small" 
                @click="handleStatusChange(scope.row, '3')"
              >
                禁用
              </el-button>
              <el-button 
                v-if="scope.row.status === '禁用'" 
                v-throttle 
                v-hasPermi="['skill:lawContent:edit']" 
                type="success" 
                size="small" 
                @click="handleStatusChange(scope.row, '2')"
              >
                启用
              </el-button>
              <el-button 
                v-if="scope.row.status === '禁用'" 
                v-throttle 
                v-hasPermi="['skill:lawContent:remove']" 
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
      :title="getDialogTitle()"
      width="80%"
      destroy-on-close
      :close-on-click-modal="false"
      @close="dialog.type = ''"
    >
      <Suspense>
        <template #default>
          <component
            :is="dialog.type === 'view' ? ContentDetailDialog : ContentEditDialog"
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
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getContentList, 
  editContent,
  deleteContent
} from '@/api/expertServicePlatform/legalServiceManage/contentManage';

const ContentEditDialog = defineAsyncComponent(() => import('./ContentEditDialog.vue'));
const ContentDetailDialog = defineAsyncComponent(() => import('./ContentDetailDialog.vue'));

const { proxy } = getCurrentInstance() as any;
const { legal_popularize_type, legal_popularize_status } = toRefs<any>(
  proxy?.useDict('legal_popularize_type', 'legal_popularize_status')
);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  contentType: '',
  contentSummary: '',
  contentStatus: '',
  startTime: '',
  endTime: '',
  orderByColumn: '',
  isAsc: '',
  title: ''
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

const getList = () => {
  loading.value = true;
  
  const { title, dateRange: _, ...rest } = queryParams.value as any;
  const [startTime, endTime] = dateRange.value || [];
  
  const params: any = {
    ...rest,
    ...(title ? { contentTitle: title } : {}),
    ...(startTime && endTime ? { startTime, endTime } : {})
  };
  
  Object.keys(params).forEach(key => {
    if (params[key] === '') {
      delete params[key];
    }
  });
  
  getContentList(params).then((res: any) => {
    if (res && res.code === 200) {
      const processedData = (res.rows || []).map((item: any) => {
        let statusText = '未知';
        if (item.contentStatus === '2' || item.contentStatus === 2) {
          statusText = '启用';
        } else if (item.contentStatus === '3' || item.contentStatus === 3) {
          statusText = '禁用';
        }
        
        const viewCount = item.viewCount ?? item.view_count ?? 0;
        const downloadCount = item.downloadCount ?? item.download_count ?? 0;
        
        return {
          ...item,
          status: statusText,
          publishTime: item.publishTime || item.createTime || '-',
          viewCount: viewCount != null && viewCount !== '' ? Number(viewCount) : 0,
          downloadCount: downloadCount != null && downloadCount !== '' ? Number(downloadCount) : 0
        };
      });
      
      tableData.value = processedData;
      total.value = res.total || 0;
    } else {
      ElMessage.error(res?.msg || '获取普法内容列表失败');
    }
    loading.value = false;
  }).catch(() => {
    ElMessage.error('获取普法内容列表失败，请稍后重试');
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
  dateRange.value = ['', ''];
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  queryParams.value.contentType = '';
  queryParams.value.contentStatus = '';
  queryParams.value.contentSummary = '';
  queryParams.value.title = '';
  queryParams.value.orderByColumn = '';
  queryParams.value.isAsc = '';
  handleQuery();
};

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => Number(item.id));
  selectedRows.value = selection;
};

const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增普法内容',
    'edit': '编辑普法内容',
    'view': '查看普法内容'
  };
  return map[dialog.value.type] || '';
};

const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};

const handleAdd = () => {
  openDialog('add');
};

const handleEnable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要启用的内容');
    return;
  }

  const invalidRows = selectedRows.value.filter((row: any) => {
    const status = row.contentStatus || row.status;
    return status === '2' || status === '启用' || status === 2;
  });
  
  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已启用的内容，无法重复启用');
    return;
  }

  ElMessageBox.confirm(
    '是否确认启用？', 
    '操作确认', 
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }
  )
    .then(() => {
      const idsToEnable = selectedIds.value.map(id => Number(id));
      const enableData = {
        contentTitle: 'batch_enable',
        contentType: 'batch',
        contentSummary: 'batch_operation',
        ids: idsToEnable,
        contentStatus: '2'
      };

      editContent(enableData)
        .then((response: any) => {
          if (response.code === 200) {
            ElMessage.success(`成功启用 ${selectedIds.value.length} 条内容`);
            getList();
            selectedIds.value = [];
            selectedRows.value = [];
          } else {
            ElMessage.error(response.msg || '启用操作失败');
          }
        })
        .catch(() => {
          ElMessage.error('启用操作失败，请稍后重试');
        });
    })
    .catch(() => {});
};

const handleDisable = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要停用的内容');
    return;
  }

  const invalidRows = selectedRows.value.filter((row: any) => {
    const status = row.contentStatus || row.status;
    return status === '3' || status === '禁用' || status === 3;
  });
  
  if (invalidRows.length > 0) {
    ElMessage.warning('所选内容中包含已停用的内容，无法重复停用');
    return;
  }

  ElMessageBox.confirm(
    '是否确认禁用？', 
    '操作确认', 
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
      center: true
    }
  )
    .then(() => {
      const idsToDisable = selectedIds.value.map(id => Number(id));
      const disableData = {
        contentTitle: 'batch_disable',
        contentType: 'batch',
        contentSummary: 'batch_operation',
        ids: idsToDisable,
        contentStatus: '3'
      };

      editContent(disableData)
        .then((response: any) => {
          if (response.code === 200) {
            ElMessage.success(`成功停用 ${selectedIds.value.length} 条内容`);
            getList();
            selectedIds.value = [];
            selectedRows.value = [];
          } else {
            ElMessage.error(response.msg || '停用操作失败');
          }
        })
        .catch(() => {
          ElMessage.error('停用操作失败，请稍后重试');
        });
    })
    .catch(() => {});
};

const handleDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的内容');
    return;
  }
  
  const hasEnabledItems = selectedRows.value.some(row => row.status === '启用');
  if (hasEnabledItems) {
    ElMessage.warning('只能删除已停用的内容，请先停用后再删除');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      '是否确认删除？删除后将无法恢复！',
      '操作确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );
    
    const idsToDelete = selectedIds.value.map(id => Number(id));
    await deleteContent(idsToDelete);
    
    ElMessage.success(`成功删除 ${selectedIds.value.length} 条内容`);
    getList();
    selectedIds.value = [];
    selectedRows.value = [];
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

const handleEdit = (row: any) => {
  if (!row.id) {
    ElMessage.warning('数据ID缺失，无法编辑');
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

const handleStatusChange = async (row: any, newStatus: string) => {
  const statusText = newStatus === '2' ? '启用' : '禁用';
  
  try {
    await ElMessageBox.confirm(
      `是否确认${statusText}？`,
      '操作确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );
    
    await editContent({ 
      contentTitle: 'single_operation',
      contentType: 'single',
      contentSummary: 'single_operation',
      ids: [Number(row.id)],
      contentStatus: newStatus 
    });
    
    ElMessage.success(`${statusText}成功`);
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(`${statusText}失败，请稍后重试`);
    }
  }
};

const handleDeleteSingle = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      '是否确认删除？删除后将无法恢复！',
      '操作确认',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }
    );
    
    await deleteContent([Number(row.id)]);
    
    ElMessage.success('删除成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
    }
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.content-management {
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
  .content-management {
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
</style>
