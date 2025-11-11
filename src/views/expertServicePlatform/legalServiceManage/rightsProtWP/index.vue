<!--
  标题: whitePaperManage.vue
  功能: 维权白皮书管理
  说明: 用于维权白皮书的管理，包括查询、添加、编辑、删除、启用停用、版本更新等操作
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="white-paper-management">
    <div class="main-content-box">
      <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
        <el-form-item label="维权白皮书标题" prop="paperTitle">
          <el-input v-model="queryParams.paperTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        
        <el-form-item label="所属状态" prop="paperStatus">
          <el-select v-model="queryParams.paperStatus" placeholder="请选择" filterable clearable>
            <el-option 
              v-for="item in whitepaper_status" 
              :key="item.value" 
              :label="item.label" 
              :value="item.value" 
            />
          </el-select>
        </el-form-item>
        
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
        
        <el-form-item>
          <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

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

      <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        
        <el-table-column label="创建时间" align="center" prop="createTime" min-width="160">
          <template #default="scope">
            <span>{{ scope.row.createTime }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="白皮书标题" align="center" prop="paperTitle" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            <router-link :to="'/expertServicePlatform/legalServiceManage/whitePaperDetail?id=' + scope.row.id + '&type=view'" class="link-type">
              <span>{{ scope.row.paperTitle }}</span>
            </router-link>
          </template>
        </el-table-column>
        
        <el-table-column label="浏览量" align="center" prop="viewCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.viewCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="下载量" align="center" prop="downloadCount" width="100">
          <template #default="scope">
            <span>{{ scope.row.downloadCount || 0 }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="所属状态" align="center" prop="paperStatus" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.paperStatus)">
              {{ getStatusLabel(scope.row.paperStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="最新版本号" align="center" prop="currentVersion" width="120">
          <template #default="scope">
            <span>{{ scope.row.currentVersion }}</span>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" align="center" min-width="450">
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

    <el-dialog
      v-model="versionDialog.visible"
      title="更新白皮书版本"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
      @close="handleVersionDialogClose"
    >
      <el-form
        ref="versionFormRef"
        :model="versionFormData"
        :rules="versionFormRules"
        label-width="140px"
      >
        <el-form-item label="白皮书标题:">
          <span>{{ versionDialog.paperTitle || '--' }}</span>
        </el-form-item>
        
        <el-form-item label="最近上传文件版本号:">
          <span>{{ versionDialog.currentVersion || '--' }}</span>
        </el-form-item>
        
        <el-form-item label="上传文件:" prop="file" required>
          <el-upload
            ref="uploadRef"
            action="#"
            :auto-upload="false"
            accept=".pdf,.doc,.docx"
            :show-file-list="true"
            :on-change="handleVersionFileSelect"
            :on-remove="handleVersionFileRemove"
            :limit="1"
          >
            <el-button v-throttle v-hasPermi="['system:oss:upload']" type="primary">
              <el-icon class="el-icon--left"><Upload /></el-icon>
              上传文件
            </el-button>
            <template #tip>
              <div class="upload-tip-text">请上传pdf、word文件,大小在100M以内</div>
            </template>
          </el-upload>
        </el-form-item>
        
        <el-form-item label="请输入版本号:" prop="version" required>
          <el-input
            v-model="versionFormData.version"
            placeholder="请输入版本号"
            clearable
            maxlength="20"
          />
        </el-form-item>
        
        <el-form-item label="备注:">
          <el-input
            v-model="versionFormData.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注内容,最多输入200个汉字"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="handleVersionDialogClose">取消</el-button>
        <el-button type="primary" @click="handleVersionConfirm" :loading="versionDialog.uploading">
          确认
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense, nextTick } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { 
  getWhitePaperList, 
  deleteWhitePaper, 
  enableWhitePaper,
  disableWhitePaper,
  editWhitePaper,
  type WhitePaperListQuery 
} from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const WhitePaperEditDialog = defineAsyncComponent(() => import('./WhitePaperEditDialog.vue'));
const WhitePaperDetailDialog = defineAsyncComponent(() => import('./WhitePaperDetailDialog.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { whitepaper_status } = toRefs<any>(
  (proxy as any)?.useDict('whitepaper_status')
);

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  paperTitle: '',
  paperStatus: ''
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

const versionDialog = ref({
  visible: false,
  currentVersion: '',
  paperTitle: '',
  rowId: null as string | number | null,
  uploading: false
});

const uploadRef = ref();
const versionFormRef = ref();

const versionFormData = ref({
  file: null as any,
  version: '',
  remark: ''
});

const versionFormRules = {
  file: [
    { required: true, message: '请上传文件', trigger: 'change' }
  ],
  version: [
    { required: true, message: '请输入版本号', trigger: 'blur' },
    { pattern: /^[\d.]+$/, message: '版本号格式不正确，只能包含数字和点', trigger: 'blur' }
  ]
};

const getStatusType = (status: string | number) => {
  const statusStr = String(status);
  if (statusStr === '1' || statusStr === '启用') {
    return 'success';
  } else if (statusStr === '0' || statusStr === '停用' || statusStr === '禁用') {
    return 'danger';
  }
  return 'info';
};

const getStatusLabel = (status: string | number) => {
  const statusStr = String(status);
  if (statusStr === '1') {
    return '启用';
  } else if (statusStr === '0') {
    return '停用';
  }
  return status;
};

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
  queryParams.value.paperTitle = '';
  queryParams.value.paperStatus = '';
  handleQuery();
};

const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

const getDialogTitle = () => {
  const map: Record<string, string> = {
    'add': '新增维权白皮书',
    'edit': '编辑维权白皮书',
    'view': '查看维权白皮书'
  };
  return map[dialog.value.type] || '';
};

const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};

const handleAdd = () => {
  openDialog('add');
};

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
    
    const response: any = await enableWhitePaper(ids);
    
    if (response && response.code === 200) {
      ElMessage.success(`成功启用${ids.length}个白皮书`);
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '启用失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('启用失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

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
    
    const response: any = await disableWhitePaper(ids);
    
    if (response && response.code === 200) {
      ElMessage.success(`成功停用${ids.length}个白皮书`);
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '停用失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('停用失败，请稍后重试');
    }
  } finally {
    loading.value = false;
  }
};

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
    
    const response: any = await deleteWhitePaper(ids);
    
    if (response && response.code === 200) {
      ElMessage.success(`成功删除 ${ids.length} 个白皮书`);
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
  openDialog('edit', row.id);
};

const handleView = (row: any) => {
  openDialog('view', row.id);
};

const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

const handleUpdateVersion = (row: any) => {
  versionDialog.value.visible = true;
  versionDialog.value.currentVersion = row.currentVersion || '1.0';
  versionDialog.value.paperTitle = row.paperTitle || '';
  versionDialog.value.rowId = row.id;
  versionDialog.value.uploading = false;
  
  versionFormData.value = {
    file: null,
    version: '',
    remark: ''
  };
  
  nextTick(() => {
    if (versionFormRef.value) {
      versionFormRef.value.clearValidate();
    }
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
  });
};

const handleVersionDialogClose = () => {
  versionDialog.value.visible = false;
  versionFormData.value = {
    file: null,
    version: '',
    remark: ''
  };
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
  if (versionFormRef.value) {
    versionFormRef.value.clearValidate();
  }
};

const handleVersionFileSelect = (file: any) => {
  const rawFile = file.raw || file;
  if (!rawFile) {
    return;
  }
  
  if (!validateVersionFile(rawFile)) {
    if (uploadRef.value) {
      uploadRef.value.clearFiles();
    }
    versionFormData.value.file = null;
    return;
  }
  
  versionFormData.value.file = file;
  if (versionFormRef.value) {
    versionFormRef.value.validateField('file');
  }
};

const handleVersionFileRemove = () => {
  versionFormData.value.file = null;
  if (versionFormRef.value) {
    versionFormRef.value.validateField('file');
  }
};

const validateVersionFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const docExt = ['pdf', 'doc', 'docx'];

  if (!docExt.includes(ext)) {
    ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
    return false;
  }

  const MB = 1024 * 1024;
  const limit = 100 * MB;
  if (file.size > limit) {
    ElMessage.error('文档文件最大100MB');
    return false;
  }
  
  return true;
};

const handleVersionConfirm = async () => {
  if (!versionFormRef.value) {
    return;
  }
  
  await versionFormRef.value.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    
    if (!versionFormData.value.file) {
      ElMessage.error('请上传文件');
      return;
    }
    
    if (!versionFormData.value.version || !versionFormData.value.version.trim()) {
      ElMessage.error('请输入版本号');
      return;
    }
    
    if (!versionDialog.value.rowId) {
      ElMessage.error('缺少白皮书ID');
      return;
    }
    
    const rawFile = versionFormData.value.file.raw || versionFormData.value.file;
    if (!rawFile) {
      ElMessage.error('文件对象不存在');
      return;
    }
    
    versionDialog.value.uploading = true;
    
    if ((proxy as any)?.$modal) {
      (proxy as any).$modal.loading('正在上传文件，请稍候...');
    }
    
    try {
      const uploadResponse = await ossUploadImage({ file: rawFile });
      
      if (uploadResponse && uploadResponse.code === 200 && uploadResponse.data?.ossId) {
        const ossData = uploadResponse.data;
        const fileSuffix = (rawFile.name.split('.').pop() || '').toLowerCase();
        
        const newVersion = versionFormData.value.version.trim();
        
        const ossVoList = [{
          ossId: ossData.ossId || 0,
          fileName: ossData.fileName || ossData.originalName || rawFile.name,
          originalName: rawFile.name,
          fileSuffix: fileSuffix.startsWith('.') ? fileSuffix : `.${fileSuffix}`,
          url: ossData.url || '',
          version: newVersion,
          ext1: '',
          createTime: '',
          createBy: 0,
          service: ''
        }];
        
        const submitData: any = {
          id: versionDialog.value.rowId,
          currentVersion: newVersion,
          ossVoList: ossVoList,
          isUpdate: true,
          remark: versionFormData.value.remark || ''
        };
        
        const response: any = await editWhitePaper(submitData);
        
        if (response && response.code === 200) {
          ElMessage.success('版本更新成功');
          versionDialog.value.visible = false;
          await getList();
        } else {
          const errorMsg = response?.msg || response?.message || '版本更新失败，请重试';
          ElMessage.error(errorMsg);
        }
      } else {
        const errorMsg = (uploadResponse as any)?.msg || (uploadResponse as any)?.data?.msg || '上传失败，请重试';
        ElMessage.error(errorMsg);
      }
    } catch (error: any) {
      const errorMsg = error?.message 
        || error?.msg 
        || error?.response?.data?.msg 
        || error?.response?.data?.message
        || '上传失败，请重试';
      ElMessage.error(errorMsg);
    } finally {
      versionDialog.value.uploading = false;
      if ((proxy as any)?.$modal) {
        (proxy as any).$modal.closeLoading();
      }
    }
  });
};

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
    }
  }
};

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
    
    const response: any = await deleteWhitePaper([row.id]);
    
    if (response && response.code === 200) {
      ElMessage.success('删除成功');
      await getList();
    } else {
      ElMessage.error(response?.msg || '删除白皮书失败，请稍后重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除白皮书失败，请稍后重试');
    }
  }
};

const handleDownload = (row: any) => {
  ElMessage.success(`开始下载白皮书"${row.paperTitle}"`);
};

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
  .white-paper-management {
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
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;
  
  .el-button {
    margin: 0;
    padding: 5px 10px;
    font-size: 12px;
    min-width: auto;
    flex-shrink: 1;
    white-space: nowrap;
  }
}

:deep(.el-table__body-wrapper) {
  .operation-buttons {
    .el-button + .el-button {
      margin-left: 0;
    }
  }
}

.upload-tip-text {
  margin-top: 8px;
  color: #909399;
  font-size: 12px;
}
</style>
