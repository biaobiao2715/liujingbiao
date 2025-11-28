<!--
    标题: index.vue
    功能: 法律文书管理
    说明: 法律文书模版管理列表页
    当前版本: 1.0
    开发信息: Created by 邓和杰 2025-11-20
-->
<template>
  <div class="legal-document-container">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="100">
      <!-- 法律文书模版 -->
      <el-form-item label="法律文书模版" prop="legalDocumentName">
        <el-select v-model="queryParams.legalDocumentName" placeholder="请选择" filterable clearable>
          <el-option v-for="item in legalDocumentNameOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 模版编号 -->
      <el-form-item label="模版编号" prop="legalDocumentCode">
        <el-input v-model="queryParams.legalDocumentCode" placeholder="请输入模版编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 创建时间 -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" type="datetime" placeholder="选择创建时间" value-format="YYYY-MM-DD HH:mm:ss" clearable />
      </el-form-item>

      <!-- 创建人 -->
      <el-form-item label="创建人" prop="createByName">
        <el-input v-model="queryParams.createByName" placeholder="请输入创建人姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 查询和重置按钮 -->
      <el-form-item class="search-actions">
        <el-button class="search-btn" v-throttle type="primary" :icon="Search" @click="handleQuery">查询</el-button>
        <el-button class="reset-btn" v-throttle plain :icon="RefreshLeft" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleDeleteBatch">删除</el-button>
      </el-col>
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
      <el-table-column type="index" width="80" label="序号" align="center" :show-overflow-tooltip="true" />

      <!-- 模版名称 -->
      <el-table-column label="模版名称" align="center" prop="legalDocumentName" min-width="150" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.legalDocumentName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 模版编号 -->
      <el-table-column label="模版编号" align="center" prop="legalDocumentCode" min-width="150" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.legalDocumentCode || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 创建人 -->
      <el-table-column label="创建人" align="center" prop="createByName" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.createByName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.createTime || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 更新时间 -->
      <el-table-column label="更新时间" align="center" prop="updateTime" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.updateTime || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 最新版本号 -->
      <el-table-column label="最新版本号" align="center" prop="currentVersion" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.currentVersion || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" align="center" fixed="right" width="310">
        <template #default="scope">
          <div class="operation-buttons">
            <!-- 前3个操作按钮 -->
            <el-button v-throttle link class="operation-link-button" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-throttle link class="operation-link-button" @click="handleView(scope.row)">查看</el-button>
            <el-button v-throttle link class="operation-link-button" @click="handleUpdateVersion(scope.row)">更新版本</el-button>
            <!-- 更多操作下拉菜单 -->
            <el-dropdown trigger="click" @command="(command) => handleMoreCommand(command, scope.row)">
              <el-button v-throttle link class="operation-link-button">
                更多
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="delete">删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <Pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        v-model:total="total"
        @pagination="getList"
      />
    </div>

    <!-- 更新版本弹窗 -->
    <el-dialog
      v-model="updateDialogVisible"
      title="更新法律文书模版"
      width="520px"
      align-center
      :close-on-click-modal="false"
      :show-close="true"
      class="legal-update-dialog"
      @close="resetUpdateDialog"
    >
      <div class="update-info">
        <div class="info-row">
          <span class="label">法律文书模版名称：</span>
          <span class="value">{{ currentTemplate?.legalDocumentName || '--' }}</span>
        </div>
        <div class="info-row">
          <span class="label">最近上传文件版本号：</span>
          <span class="value">{{ currentTemplate?.currentVersion || '--' }}</span>
        </div>
      </div>

      <el-form ref="updateFormRef" :model="updateForm" :rules="updateRules" label-width="80" class="update-form">
        <el-form-item label="上传文件" prop="file">
          <el-upload
            ref="uploadRef"
            class="upload-button"
            :file-list="updateForm.fileList"
            :auto-upload="false"
            :limit="1"
            :show-file-list="false"
            :on-remove="handleUpdateFileRemove"
            :on-change="handleUpdateFileChange"
            :on-exceed="handleUploadExceed"
            :before-upload="beforeUpdateFileUpload"
            accept=".pdf,.doc,.docx"
          >
            <el-button class="upload-trigger" type="primary" :loading="uploadLoading">
              <el-icon class="el-icon--left"><UploadFilled /></el-icon>
              上传文件
            </el-button>
            <span v-if="updateForm.fileList.length" class="selected-file">{{ updateForm.fileList[0].name }}</span>
            <template #tip>
              <div class="upload-tip">请上传 pdf、word 文件，大小在 100MB 以内</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="updateForm.remark"
            type="textarea"
            placeholder="请输入备注内容，最多输入200个字"
            maxlength="200"
            show-word-limit
            :rows="4"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button class="legal-btn-cancel" @click="updateDialogVisible = false">取消</el-button>
          <el-button class="legal-btn-primary" type="primary" @click="handleConfirmUpdate">确认</el-button>
        </div>
      </template>
    </el-dialog>

    <LegalDocumentAdd
      v-model="addDialogVisible"
      :data="addDialogData"
      :title="addDialogTitle"
      :loading="addDialogLoading"
      @submit="handleAddSubmit"
    />
    <LegalDocumentEdit v-model="editDialogVisible" :data="editDialogData" :loading="editDialogLoading" mode="edit" @submit="handleEditSubmit" />
    <LegalDocumentEdit v-model="viewDialogVisible" :data="viewDialogData" :loading="viewDialogLoading" mode="view" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Pagination from '@/components/Pagination/index.vue';
import { UploadFilled, Search, RefreshLeft, ArrowDown } from '@element-plus/icons-vue';
import {
  fetchLegalDocumentList,
  fetchCreateLegalDocumentList,
  deleteLegalDocument,
  updateLegalDocument,
  createLegalDocument,
  getLegalDocumentDetail
} from '@/api/safeguard/legalDocument';
import { ossUploadImage } from '@/api/supplier/productManagement/product';
import LegalDocumentAdd from './commponents/legalDocumentAdd.vue';
import LegalDocumentEdit from './commponents/legalDocumentEdit.vue';

// 搜索表单引用
const queryFormRef = ref();

// 是否显示搜索
const showSearch = ref(true);

// 加载状态
const loading = ref(false);

// 表格数据
const tableData = ref<any[]>([]);

// 总条数
const total = ref(0);

// 选中的行ID数组
const selectedIds = ref<(string | number)[]>([]);

// 选中的行数据数组
const selectedRows = ref<any[]>([]);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  legalDocumentName: '', // 法律文书模版类型
  legalDocumentCode: '', // 模版编号
  createTime: '', // 创建时间
  createByName: '' // 创建人
});

// 法律文书模版类型选项
const legalDocumentNameOptions = ref<{ value: string | number; label: string }[]>([]);
const addDialogVisible = ref(false);
const addDialogTitle = ref('新增法律文书模版');
const addDialogData = ref({
  legalDocumentName: '',
  status: '',
  attachments: [] as any[]
});
const addDialogLoading = ref(false);

const editDialogVisible = ref(false);
const editDialogLoading = ref(false);
const editDialogData = ref({
  legalDocumentName: '',
  legalDocumentCode: '',
  status: '',
  remark: '',
  legalFiles: [] as any[],
  historyList: [] as any[]
});
const currentEditId = ref<string | number | null>(null);

// 查看弹窗
const viewDialogVisible = ref(false);
const viewDialogLoading = ref(false);
const viewDialogData = ref({
  legalDocumentName: '',
  legalDocumentCode: '',
  status: '',
  legalFiles: [] as any[],
  historyList: [] as any[],
  currentVersion: ''
});
const currentViewId = ref<string | number | null>(null);

const loadTemplateOptions = async () => {
  try {
    const res = await fetchCreateLegalDocumentList();
    const list: any[] = res || [];
    legalDocumentNameOptions.value = (Array.isArray(list) ? list : []).map((item: any) => ({
      value: item.legalDocumentName ?? '',
      label: item.legalDocumentName ?? ''
    }));
  } catch (error) {
    console.error('获取法律文书模版列表失败:', error);
    legalDocumentNameOptions.value = [];
  }
};

// 更新版本弹窗
const updateDialogVisible = ref(false);
const currentTemplate = ref<any>(null);
const updateFormRef = ref();
const uploadRef = ref();
const updateForm = reactive({
  file: null as any,
  fileList: [] as any[],
  remark: ''
});
const uploadLoading = ref(false);
const updateRules = {
  file: [{ required: true, message: '请上传文件', trigger: 'change' }]
};

/** 获取列表数据 */
const buildQueryParams = () => ({
  pageNum: queryParams.pageNum,
  pageSize: queryParams.pageSize,
  legalDocumentName: queryParams.legalDocumentName,
  legalDocumentCode: queryParams.legalDocumentCode,
  createTime: queryParams.createTime,
  createByName: queryParams.createByName
});

const getList = async (customParams?: Record<string, any>) => {
  console.log('customParams', customParams);
  loading.value = true;
  try {
    const params = customParams || buildQueryParams();
    const res = await fetchLegalDocumentList(params);
    tableData.value = res?.rows || res?.data?.rows || res?.data || [];
    total.value = res?.total || res?.data?.total || 0;
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 查询按钮事件 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList(buildQueryParams());
};

/** 重置按钮操作 */
const handleReset = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.legalDocumentName = '';
  queryParams.legalDocumentCode = '';
  queryParams.createTime = '';
  queryParams.createByName = '';
  handleQuery();
};

// 表格选择变化事件
const handleSelectionChange = (selection: any[]) => {
  selectedIds.value = selection.map((item) => item.id);
  selectedRows.value = selection;
};

/** 新增 */
const handleAdd = () => {
  addDialogTitle.value = '新增法律文书模版';
  addDialogData.value = {
    legalDocumentName: '',
    status: '',
    attachments: []
  };
  addDialogVisible.value = true;
};

const showDeleteConfirm = (message: string) => {
  return ElMessageBox.confirm(message, '操作确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'legal-confirm-dialog',
    confirmButtonClass: 'legal-confirm-primary',
    cancelButtonClass: 'legal-confirm-cancel',
    center: true
  });
};

/** 批量删除 */
const handleDeleteBatch = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的数据');
    return;
  }
  try {
    await showDeleteConfirm('是否确认删除选中的数据？');
    await deleteLegalDocument(selectedIds.value.join(','));
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    // 用户取消删除
  }
};

/** 编辑 */
const mapLatestFile = (file: any, defaultVersion?: string) => {
  const oss = file?.ossInfo || {};
  return {
    fileType: file?.fileType || 'document',
    fileTypeText: '文档',
    originalName: file?.originalName || oss.originalName || '',
    fileSize: Number(file?.fileSize || oss.fileSize || 0),
    version: file?.versionNo || defaultVersion || '1.0',
    uploadTime: file?.updateTime || file?.createTime || '',
    remark: file?.remark || '',
    ossId: file?.ossId || oss.ossId,
    url: oss.url || ''
  };
};

const mapHistoryFile = (file: any) => {
  const oss = file?.ossInfo || {};
  return {
    fileName: file?.originalName || oss.originalName || '',
    updateTime: file?.updateTime || file?.createTime || '',
    fileSize: Number(file?.fileSize || oss.fileSize || 0),
    version: file?.versionNo || '1.0',
    remark: file?.remark || '',
    url: oss.url || ''
  };
};

const handleEdit = async (row: any) => {
  currentEditId.value = row.id;
  editDialogData.value = {
    legalDocumentName: '',
    legalDocumentCode: '',
    status: '',
    remark: '',
    legalFiles: [],
    historyList: []
  };
  editDialogVisible.value = true;
  editDialogLoading.value = true;
  try {
    const res = await getLegalDocumentDetail(row.id);
    console.log('res.data', res.data);
    const data = res.data;
    const latestFile = data.newFile;

    editDialogData.value = {
      legalDocumentName: data.legalDocumentName || '',
      legalDocumentCode: data.legalDocumentCode || '',
      status: data.status || '0',
      remark: data.remark || '',
      legalFiles: latestFile ? [mapLatestFile(latestFile, data.currentVersion)] : [],
      historyList: (data.legalFiles || []).map(mapHistoryFile)
    };
  } catch (error) {
    console.error('获取法律文书详情失败:', error);
    ElMessage.error('获取详情失败');
  } finally {
    editDialogLoading.value = false;
  }
};

/** 查看 */
const handleView = async (row: any) => {
  currentViewId.value = row.id;
  viewDialogData.value = {
    legalDocumentName: '',
    legalDocumentCode: '',
    status: '',
    legalFiles: [],
    historyList: [],
    currentVersion: ''
  };
  viewDialogVisible.value = true;
  viewDialogLoading.value = true;
  try {
    const res = await getLegalDocumentDetail(row.id);
    const data = res.data;
    const latestFile = data.newFile;

    viewDialogData.value = {
      legalDocumentName: data.legalDocumentName || '',
      legalDocumentCode: data.legalDocumentCode || '',
      status: data.status || '0',
      legalFiles: latestFile ? [mapLatestFile(latestFile, data.currentVersion)] : [],
      historyList: (data.legalFiles || []).map(mapHistoryFile),
      currentVersion: data.currentVersion || '1.0'
    };
  } catch (error) {
    console.error('获取法律文书详情失败:', error);
    ElMessage.error('获取详情失败');
  } finally {
    viewDialogLoading.value = false;
  }
};

/** 更新版本 */
const handleUpdateVersion = (row: any) => {
  currentTemplate.value = row;
  resetUpdateDialog(false);
  updateDialogVisible.value = true;
};

/** 单个删除 */
const handleDeleteSingle = async (row: any) => {
  try {
    await showDeleteConfirm('是否确认删除？');
    await deleteLegalDocument(row.id);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    // 用户取消删除
  }
};

/** 处理更多菜单命令 */
const handleMoreCommand = (command: string, row: any) => {
  if (command === 'delete') {
    handleDeleteSingle(row);
  }
};

const checkSelectable = (row: any) => {
  return !row.isUsing;
};

const resetUpdateDialog = (needClose = true) => {
  if (needClose) {
    updateDialogVisible.value = false;
  }
  updateForm.file = null;
  updateForm.fileList = [];
  updateForm.remark = '';
  updateFormRef.value?.clearValidate?.();
};

const validateUploadFile = (file: File) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const ext = file.name?.split('.').pop()?.toLowerCase();
  const allowedExt = ['pdf', 'doc', 'docx'];
  const isAllowed = allowedTypes.includes(file.type) || (ext ? allowedExt.includes(ext) : false);
  const isLt100M = file.size / 1024 / 1024 < 100;
  if (!isAllowed) {
    ElMessage.error('仅支持上传 pdf、word 文件');
    return false;
  }
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过100MB');
    return false;
  }
  return true;
};

const beforeUpdateFileUpload = (file: File) => validateUploadFile(file);

const handleUpdateFileChange = async (file: any) => {
  const rawFile = file?.raw;
  if (!rawFile) return;
  if (!validateUploadFile(rawFile)) {
    handleUpdateFileRemove();
    return;
  }
  uploadLoading.value = true;
  try {
    const response = await ossUploadImage({ file: rawFile });
    const data = response?.data || {};
    const fileName = data.originalName || data.fileName || rawFile.name;
    updateForm.file = {
      ossId: data.ossId,
      url: data.url,
      fileName,
      fileSize: data.fileSize || rawFile.size
    };
    updateForm.fileList = [
      {
        name: fileName,
        status: 'success',
        url: data.url,
        ossId: data.ossId
      }
    ];
    ElMessage.success('文件上传成功');
    updateFormRef.value?.validateField?.('file');
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败，请稍后重试');
    handleUpdateFileRemove();
  } finally {
    uploadLoading.value = false;
  }
};

const handleUpdateFileRemove = () => {
  updateForm.file = null;
  updateForm.fileList = [];
};

const handleUploadExceed = (files: File[]) => {
  if (!files || files.length === 0) return;
  uploadRef.value?.clearFiles?.();
  handleUpdateFileRemove();
  handleUpdateFileChange({ raw: files[0] });
};

const getNextVersion = (version?: string) => {
  const [majorStr = '0', minorStr = '0'] = (version || '0.0').split('.');
  let major = Number(majorStr) || 0;
  let minor = Number(minorStr) || 0;
  if (minor >= 9) {
    major += 1;
    minor = 0;
  } else {
    minor += 1;
  }
  return `${major}.${minor}`;
};

const handleConfirmUpdate = () => {
  if (!currentTemplate.value) {
    ElMessage.error('未找到需要更新的法律文书');
    return;
  }
  updateFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    if (!updateForm.file?.ossId) {
      ElMessage.error('请先上传文件');
      return;
    }
    const payload = {
      id: currentTemplate.value.id,
      currentVersion: getNextVersion(currentTemplate.value.currentVersion),
      legalDocumentName: currentTemplate.value.legalDocumentName,
      status: currentTemplate.value.status,
      legalFiles: [
        {
          remark: updateForm.remark,
          ossId: updateForm.file.ossId,
          originalName: updateForm.file.fileName,
          fileSize: updateForm.file.fileSize || 0
        }
      ]
    };
    try {
      await updateLegalDocument(payload);
      ElMessage.success('更新版本成功');
      resetUpdateDialog();
      getList();
    } catch (error) {
      console.error('更新版本失败:', error);
      ElMessage.error('更新版本失败，请稍后重试');
    }
  });
};

const handleAddSubmit = async (data: any) => {
  const payload = {
    currentVersion: data.currentVersion || '1.0',
    legalDocumentName: data.legalDocumentName,
    status: data.status,
    legalFiles: data.attachments.map((item: any) => ({
      ossId: item.ossId,
      originalName: item.originalName,
      fileSize: item.fileSize || 0
    }))
  };
  try {
    await createLegalDocument(payload);
    ElMessage.success('新增成功');
    addDialogVisible.value = false;
    getList();
  } catch (error) {
    console.error('保存法律文书失败:', error);
    ElMessage.error('保存失败，请稍后重试');
  }
};

const handleEditSubmit = async (data: any) => {
  if (!currentEditId.value) {
    ElMessage.error('未找到要编辑的数据');
    return;
  }
  const hasNewUpload = Array.isArray(data.legalFiles) && data.legalFiles.length > 0;
  const payload = {
    id: currentEditId.value,
    legalDocumentName: data.legalDocumentName,
    legalDocumentCode: data.legalDocumentCode,
    status: data.status,
    remark: data.remark || '',
    legalFiles: hasNewUpload
      ? data.legalFiles.map((item: any) => ({
          ossId: item.ossId,
          originalName: item.originalName,
          fileSize: item.fileSize || 0
        }))
      : [],
    historyList: data.historyList || [],
    currentVersion: data.currentVersion
  };
  try {
    await updateLegalDocument(payload);
    ElMessage.success('编辑成功');
    editDialogVisible.value = false;
    getList();
  } catch (error) {
    console.error('编辑法律文书失败:', error);
    ElMessage.error('编辑失败，请稍后重试');
  }
};

// 初始化
onMounted(() => {
  getList();
  loadTemplateOptions();
});
</script>

<style scoped lang="scss">
:deep(.legal-confirm-dialog) {
  .el-message-box__header {
    padding-bottom: 0;
  }

  .el-message-box__title {
    font-size: 18px;
    font-weight: 600;
  }

  .el-message-box__content {
    padding-top: 8px;
    color: #333;
    font-size: 15px;
  }
}

:deep(.legal-confirm-primary) {
  background-color: #0d5dff !important;
  border-color: #0d5dff !important;
  color: #fff !important;
}

:deep(.legal-confirm-cancel) {
  border-color: #d9d9d9 !important;
  color: #333 !important;
}

:deep(.legal-update-dialog) {
  .el-dialog__body {
    padding: 12px 32px 0 32px;
  }

  .el-dialog__header {
    padding: 16px 32px 10px;
    .el-dialog__title {
      font-size: 18px;
      // font-weight: 600;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.legal-btn-cancel {
  border-color: #d9d9d9;
  color: #333;
}

.legal-btn-primary {
  background-color: #0d5dff;
  border-color: #0d5dff;
  color: #fff;
}

.legal-document-container {
  padding: 20px;

  .mb8 {
    margin-bottom: 8px;
  }

  .search-actions {
    margin-left: auto;
    float: right;

    .search-btn,
    .reset-btn {
      width: 88px;
      border-radius: 0;
    }

    .reset-btn {
      background-color: #fafafa;
      border-color: #d9d9d9;
      color: #595959;

      &:hover {
        background-color: #f0f0f0;
        border-color: #d9d9d9;
        color: #595959;
      }
    }
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .operation-link-button {
    color: #108c58 !important;
    background-color: transparent !important;
    border: none !important;
    padding: 0 8px !important;

    &:hover,
    &:focus {
      color: #108c58 !important;
      background-color: transparent !important;
    }

    &.is-disabled {
      color: #a0c896 !important;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
}

.update-info {
  margin-bottom: 16px;
  font-size: 14px;
  color: #333;

  .info-row {
    display: flex;
    margin-bottom: 8px;

    .label {
      width: 160px;
      text-align: right;
      margin-right: 8px;
      font-weight: 500;
    }
  }
}

.upload-block {
  width: 100%;
  .el-upload {
    width: 100%;
  }
}

.upload-button {
  // display: flex;
  align-items: center;
  gap: 16px;

  .upload-trigger {
    background-color: #f5f5f5;
    border-color: #d9d9d9;
    color: #000;

    &:hover {
      border-color: #0d5dff;
      color: #0d5dff;
      background-color: #fff;
    }
  }
}

.selected-file {
  font-size: 14px;
  color: #333;
}

.upload-tip {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
}

.danger-text-button {
  color: #f23255 !important;
  background-color: transparent !important;
  border: none !important;
  padding: 0 8px !important;

  &:hover,
  &:focus {
    color: #f23255 !important;
    background-color: transparent !important;
  }

  &.is-disabled {
    color: #f6b7c0 !important;
  }
}
</style>
