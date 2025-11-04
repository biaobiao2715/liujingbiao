<!--
  标题: whitePaperManage.vue
  功能: 维权白皮书管理
  说明: 用于维权白皮书的管理，包括查询、添加、编辑、删除、启用停用、版本更新等操作
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="white-paper-management">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 搜索条件 -->
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <!-- 维权白皮书标题搜索框 -->
        <el-form-item label="维权白皮书标题" prop="paperTitle">
          <el-input v-model="queryParams.paperTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <!-- 所属状态下拉框 -->
        <el-form-item label="所属状态" prop="paperStatus">
          <el-select v-model="queryParams.paperStatus" placeholder="请选择" filterable clearable>
            <el-option 
              v-for="item in legal_popularize_status" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        
        <!-- 发布时间选择器 -->
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            range-separator=" - "
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
        </el-form-item>
        
        <!-- 查询和重置按钮 -->
        <el-form-item>
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:whitePaper:add']" type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:whitePaper:edit']" type="success" @click="handleEnable">启用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:whitePaper:edit']" type="warning" @click="handleDisable">停用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:whitePaper:remove']" type="danger" @click="handleDelete">删除</el-button>
        </el-col>
      </el-row>

      <!-- 表格展示 -->
      <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <!-- 创建时间 -->
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        
        <!-- 白皮书标题 -->
        <el-table-column label="白皮书标题" align="center" prop="paperTitle" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <router-link :to="'/expertServicePlatform/legalServiceManage/whitePaperDetail?id=' + scope.row.id + '&type=view'" class="link-type">
              <span>{{ scope.row.paperTitle }}</span>
            </router-link>
          </template>
        </el-table-column>
        
        <!-- 浏览量 -->
        <el-table-column label="浏览量" align="center" prop="viewCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.viewCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <!-- 下载量 -->
        <el-table-column label="下载量" align="center" prop="downloadCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.downloadCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column label="所属状态" align="center" prop="paperStatus" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.paperStatus)">
              {{ getStatusLabel(scope.row.paperStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 最新版本号 -->
        <el-table-column label="最新版本号" align="center" prop="currentVersion" width="120">
          <template #default="scope">
            <span>{{ scope.row.currentVersion }}</span>
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" align="center" width="320">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button 
                v-throttle 
                v-hasPermi="['skill:whitePaper:edit']" 
                type="primary" 
                size="small" 
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button 
                v-throttle 
                v-hasPermi="['skill:whitePaper:query']" 
                type="info" 
                size="small" 
                @click="handleView(scope.row)"
              >
                查看
              </el-button>
              <el-button 
                v-throttle 
                v-hasPermi="['skill:whitePaper:edit']" 
                type="warning" 
                size="small" 
                @click="handleUpdateVersion(scope.row)"
              >
                更新版本
              </el-button>
              <el-button 
                v-if="String(scope.row.paperStatus) === '1' || scope.row.paperStatus === '启用'" 
                v-throttle 
                v-hasPermi="['skill:whitePaper:edit']" 
                type="warning" 
                size="small" 
                @click="handleStatusChange(scope.row, '停用')"
              >
                停用
              </el-button>
              <el-button 
                v-if="String(scope.row.paperStatus) === '0' || scope.row.paperStatus === '停用' || scope.row.paperStatus === '禁用'" 
                v-throttle 
                v-hasPermi="['skill:whitePaper:edit']" 
                type="success" 
                size="small" 
                @click="handleStatusChange(scope.row, '启用')"
              >
                启用
              </el-button>
              <el-button 
                v-if="String(scope.row.paperStatus) === '0' || scope.row.paperStatus === '停用' || scope.row.paperStatus === '禁用'" 
                v-throttle 
                v-hasPermi="['skill:whitePaper:remove']" 
                type="danger" 
                size="small" 
                @click="handleDeleteSingle(scope.row)"
              >
                删除
              </el-button>
              <el-button 
                v-throttle 
                v-hasPermi="['skill:whitePaper:export']" 
                type="primary" 
                size="small" 
                @click="handleDownload(scope.row)"
              >
                下载
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

    <!-- 弹窗：新增/编辑/查看 -->
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
            :is="dialog.type === 'view' ? WhitePaperDetailDialog : WhitePaperEditDialog"
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

    <!-- 版本更新弹窗 -->
    <el-dialog
      v-model="versionDialog.visible"
      title="更新版本"
      width="500px"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <el-form ref="versionFormRef" :model="versionForm" :rules="versionRules" label-width="100px">
        <el-form-item label="当前版本">
          <el-input v-model="versionDialog.currentVersion" disabled />
        </el-form-item>
        <el-form-item label="新版本号" prop="version">
          <el-input v-model="versionForm.version" placeholder="请输入新版本号，如：1.0" clearable />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="versionDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="handleVersionUpdate" :loading="versionDialog.loading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  getWhitePaperList, 
  deleteWhitePaper, 
  enableWhitePaper,
  disableWhitePaper,
  editWhitePaper,
  getWhitePaperDetail,
  type WhitePaperListQuery 
} from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

// 弹窗组件异步加载
const WhitePaperEditDialog = defineAsyncComponent(() => import('./WhitePaperEditDialog.vue'));
const WhitePaperDetailDialog = defineAsyncComponent(() => import('./WhitePaperDetailDialog.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_status } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_status')
);

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  paperTitle: '', // 白皮书标题
  paperStatus: '' // 状态
});

// 表格数据
const tableData = ref([]);
// 总记录数
const total = ref(0);
// 加载状态
const loading = ref(false);
// 表单引用
const queryFormRef = ref();
// 日期范围
const dateRange = ref(['', '']);
// 是否显示搜索
const showSearch = ref(true);
// 选中的行ID数组
const selectedIds = ref([]);
// 选中的行数据数组
const selectedRows = ref([]);

// 弹窗控制
const dialog = ref({
  visible: false,
  type: '', // 'add' | 'edit' | 'view'
  id: null as string | number | null
});

// 版本更新弹窗控制
const versionDialog = ref({
  visible: false,
  currentVersion: '',
  rowId: null as string | number | null,
  rowData: null as any, // 保存当前行的完整数据
  loading: false
});

const versionFormRef = ref();
const versionForm = ref({
  version: ''
});

const versionRules = {
  version: [
    { required: true, message: '请输入新版本号', trigger: 'blur' },
    { pattern: /^\d+(\.\d+)?$/, message: '版本号格式不正确，只能输入数字，例如：1.0', trigger: 'blur' }
  ]
};

/** 获取状态标签类型 */
const getStatusType = (status: string | number) => {
  // 白皮书状态：0停用 1启用（根据API文档）
  const statusStr = String(status);
  if (statusStr === '1' || statusStr === '启用') {
    return 'success';
  } else if (statusStr === '0' || statusStr === '停用' || statusStr === '禁用') {
    return 'danger';
  }
  return 'info';
};

/** 获取状态标签文字 */
const getStatusLabel = (status: string | number) => {
  // 白皮书状态：0停用 1启用（根据API文档）
  const statusStr = String(status);
  if (statusStr === '1') {
    return '启用';
  } else if (statusStr === '0') {
    return '停用';
  }
  return status;
};

/** 获取维权白皮书列表 */
const getList = () => {
  loading.value = true;
  
  const [beginTime, endTime] = dateRange.value || [];
  
  const params: WhitePaperListQuery = {
    pageNum: queryParams.value.pageNum,
    pageSize: queryParams.value.pageSize,
    ...(queryParams.value.paperTitle ? { paperTitle: queryParams.value.paperTitle } : {}),
    ...(queryParams.value.paperStatus ? { paperStatus: queryParams.value.paperStatus } : {}),
    ...(beginTime && endTime ? { beginTime, endTime } : {})
  };
  
  getWhitePaperList(params).then((res: any) => {
    if (res && res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
      ElMessage.error(res?.msg || '获取数据失败');
    }
  }).catch(() => {
    ElMessage.error('获取维权白皮书列表失败，请稍后重试');
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
  dateRange.value = ['', ''];
  queryParams.value.paperTitle = '';
  queryParams.value.paperStatus = '';
  handleQuery();
};


// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

/** 弹窗标题 */
const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增维权白皮书',
    'edit': '编辑维权白皮书',
    'view': '查看维权白皮书'
  };
  return map[dialog.value.type] || '';
};

/** 打开弹窗 */
const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};

/** 新增按钮事件 */
const handleAdd = () => {
  openDialog('add');
};

/** 启用按钮事件 */
const handleEnable = async () => {
  const ids = selectedIds.value.slice();
  
  if (ids.length === 0) {
    ElMessage.warning('请先选择要启用的白皮书');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要启用选中的${ids.length}个白皮书吗？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    loading.value = true;
    
    // 调用启用API
    const response: any = await enableWhitePaper(ids);
    
    if (response && response.code === 200) {
      ElMessage.success(`成功启用${ids.length}个白皮书`);
      // 刷新并清空选择
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '启用失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('启用失败，请稍后重试');
    } else {
      ElMessage.info('已取消启用');
    }
  } finally {
    loading.value = false;
  }
};

/** 停用按钮事件 */
const handleDisable = async () => {
  const ids = selectedIds.value.slice();
  
  if (ids.length === 0) {
    ElMessage.warning('请先选择要停用的白皮书');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要停用选中的${ids.length}个白皮书吗？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    loading.value = true;
    
    // 调用停用API
    const response: any = await disableWhitePaper(ids);
    
    if (response && response.code === 200) {
      ElMessage.success(`成功停用${ids.length}个白皮书`);
      // 刷新并清空选择
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '停用失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('停用失败，请稍后重试');
    } else {
      ElMessage.info('已取消停用');
    }
  } finally {
    loading.value = false;
  }
};

/** 删除按钮事件 */
const handleDelete = async () => {
  const ids = selectedIds.value.slice();
  
  if (ids.length === 0) {
    ElMessage.warning('请先选择要删除的白皮书');
    return;
  }
  
  const tip = `确定要删除选中的 ${ids.length} 个白皮书吗？删除后将无法恢复。`;
  
  try {
    await ElMessageBox.confirm(tip, '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    loading.value = true;
    
    // 调用删除API - 响应拦截器已处理，response 直接是后端返回数据
    const response: any = await deleteWhitePaper(ids);
    
    if (response && response.code === 200) {
      ElMessage.success(`成功删除 ${ids.length} 个白皮书`);
      // 刷新并清空选择
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '删除失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败，请稍后重试');
    } else {
      ElMessage.info('删除操作已取消');
    }
  } finally {
    loading.value = false;
  }
};

/** 编辑按钮事件 */
const handleEdit = (row: any) => {
  openDialog('edit', row.id);
};

/** 查看按钮事件 */
const handleView = (row: any) => {
  openDialog('view', row.id);
};

/** 弹窗成功回调 */
const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

/** 更新版本事件 */
const handleUpdateVersion = (row: any) => {
  versionDialog.value.visible = true;
  versionDialog.value.currentVersion = row.currentVersion || 'V1.0';
  versionDialog.value.rowId = row.id;
  versionDialog.value.rowData = row; // 保存当前行的完整数据
  versionForm.value.version = '';
};

/** 确认更新版本 */
const handleVersionUpdate = async () => {
  if (!versionFormRef.value) return;
  
  try {
    await versionFormRef.value.validate();
    
    if (!versionDialog.value.rowId) {
      ElMessage.error('缺少白皮书ID');
      return;
    }
    
    versionDialog.value.loading = true;
    
    // 先获取白皮书详情，获取完整的参数
    const detailResponse: any = await getWhitePaperDetail(versionDialog.value.rowId);
    
    if (detailResponse && detailResponse.code === 200 && detailResponse.data) {
      const detailData = detailResponse.data;
      
      // 构建OSS附件列表
      const ossVoList = detailData.ossVoList && Array.isArray(detailData.ossVoList) 
        ? detailData.ossVoList.map((item: any) => ({
            ossId: item.ossId,
            fileName: item.fileName,
            originalName: item.originalName,
            fileSuffix: item.fileSuffix,
            url: item.url,
            version: item.version || versionForm.value.version // 使用新版本号
          }))
        : [];
      
      // 调用编辑接口，传递原有参数和新版本号
      const submitData: any = {
        params: {
          key: {
            id: versionDialog.value.rowId,
            paperTitle: detailData.paperTitle || '',
            remark: detailData.remark || '',
            currentVersion: versionForm.value.version // 新版本号
          }
        },
        ossVoList: ossVoList
      };
      
      const response: any = await editWhitePaper(submitData);
      
      if (response && response.code === 200) {
        ElMessage.success('版本更新成功');
        versionDialog.value.visible = false;
        getList();
      } else {
        ElMessage.error(response?.msg || '版本更新失败，请重试');
      }
    } else {
      ElMessage.error(detailResponse?.msg || '获取白皮书详情失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      // 处理特定的错误信息
      if (error?.response?.data?.msg) {
        ElMessage.error(error.response.data.msg);
      } else if (error?.msg) {
        ElMessage.error(error.msg);
      } else {
        ElMessage.error('版本更新失败，请稍后重试');
      }
    }
  } finally {
    versionDialog.value.loading = false;
  }
};

/** 状态变更事件 */
const handleStatusChange = async (row: any, status: string) => {
  try {
    await ElMessageBox.confirm(
      `确定要${status}白皮书"${row.paperTitle}"吗？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用对应的API
    const api = status === '启用' ? enableWhitePaper : disableWhitePaper;
    const response: any = await api([row.id]);
    
    if (response && response.code === 200) {
      ElMessage.success(`${status}成功`);
      await getList();
    } else {
      ElMessage.error(response?.msg || `${status}失败，请稍后重试`);
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(`${status}失败，请稍后重试`);
    } else {
      ElMessage.info('已取消操作');
    }
  }
};

/** 单个删除事件 */
const handleDeleteSingle = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除白皮书"${row.paperTitle}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
    
    // 调用删除API - 响应拦截器已处理，response 直接是后端返回数据
    const response: any = await deleteWhitePaper([row.id]);
    
    if (response && response.code === 200) {
      ElMessage.success('删除成功');
      // 重新加载列表
      await getList();
    } else {
      ElMessage.error(response?.msg || '删除白皮书失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除白皮书失败，请稍后重试');
    } else {
      ElMessage.info('已取消删除');
    }
  }
};

/** 下载事件 */
const handleDownload = (row: any) => {
  ElMessage.success(`开始下载白皮书"${row.paperTitle}"`);
  // 实际开发时这里应该调用下载API
};

// 页面加载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.white-paper-management {
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
  text-decoration: none;
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
  .white-paper-management {
    padding: 16px;
  }
  
  .main-content-box {
    padding: 16px;
  }
}

// 加载状态样式
.el-loading-mask {
  border-radius: 8px;
}

// 表格列宽优化
.el-table-column {
  .cell {
    padding: 8px 12px;
  }
}

// 操作按钮组样式
.operation-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
  white-space: nowrap;
  
  .el-button {
    margin: 0;
    padding: 4px 8px;
    font-size: 12px;
    min-width: auto;
    flex-shrink: 0;
  }
}

// 表格操作列样式
:deep(.el-table__body-wrapper) {
  .operation-buttons {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}
</style>
