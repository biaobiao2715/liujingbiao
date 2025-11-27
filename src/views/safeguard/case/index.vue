<!--
    标题: index.vue
    功能: 案件类型管理
    说明: 案件类型管理列表页
    当前版本: 1.0
    开发信息: Created by 邓和杰 2025-11-21
-->
<template>
  <div class="case-type-container">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline>
      <!-- 案件类型 -->
      <el-form-item label="案件类型" prop="caseTypeId">
        <el-select v-model="queryParams.caseTypeId" placeholder="请选择" filterable clearable>
          <el-option v-for="dict in case_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>

      <!-- 案件类型编号 -->
      <el-form-item label="案件类型编号" prop="caseTypeCode" :label-width="100">
        <el-input v-model="queryParams.caseTypeCode" placeholder="请输入案件类型编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 创建时间 -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" type="datetime" placeholder="选择创建时间" value-format="YYYY-MM-DD HH:mm:ss" clearable />
      </el-form-item>

      <!-- 创建人 -->
      <el-form-item label="创建人" prop="createByName">
        <el-input v-model="queryParams.createByName" placeholder="请输入创建人姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 所属状态 -->
      <el-form-item label="所属状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 查询和重置按钮 -->
      <el-form-item class="search-actions">
        <el-button class="search-btn" v-throttle type="primary" @click="handleQuery">查询</el-button>
        <el-button class="reset-btn" v-throttle type="primary" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleAdd">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="success" @click="handleEnableBatch">启用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="warning" @click="handleDisableBatch">禁用</el-button>
      </el-col>
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" width="80" label="序号" align="center" />

      <!-- 案件类型编号 -->
      <el-table-column label="案件类型编号" align="center" prop="caseTypeCode" min-width="200">
        <template #default="scope">
          <span>{{ scope.row.caseTypeCode || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 案件类型名称 -->
      <el-table-column label="案件类型名称" align="center" prop="caseTypeId" min-width="150">
        <template #default="scope">
          <dict-text :options="case_type" :value="scope.row.caseTypeId || ''" />
        </template>
      </el-table-column>

      <!-- 执法依据 -->
      <el-table-column label="执法依据" align="center" prop="basisName" min-width="150">
        <template #default="scope">
          <span>{{ scope.row.basisName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 文书模版 -->
      <el-table-column label="文书模版" align="center" prop="documentName" min-width="150">
        <template #default="scope">
          <span>{{ scope.row.documentName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 案件类型扣分 -->
      <el-table-column label="案件类型扣分" align="center" prop="caseScore" width="120">
        <template #default="scope">
          <span>{{ scope.row.caseScore !== undefined && scope.row.caseScore !== null ? scope.row.caseScore : '-' }}</span>
        </template>
      </el-table-column>

      <!-- 创建人 -->
      <el-table-column label="创建人" align="center" prop="createByName" width="120">
        <template #default="scope">
          <span>{{ scope.row.createByName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ scope.row.createTime || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 所属状态 -->
      <el-table-column label="所属状态" align="center" prop="status" width="100">
        <template #default="scope">
          <el-tag :type="scope.row.status === '0' ? 'success' : 'danger'">
            {{ scope.row.status === '0' ? '启用' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" align="center" fixed="right" width="280">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button v-throttle type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button v-throttle type="info" size="small" @click="handleView(scope.row)">查看</el-button>
            <el-button v-throttle :type="scope.row.status === '0' ? 'warning' : 'success'" size="small" @click="handleToggleStatus(scope.row)">
              {{ scope.row.status === '0' ? '禁用' : '启用' }}
            </el-button>
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

    <!-- 新增/编辑/查看弹窗 -->
    <CaseTypeEdit v-model="editDialogVisible" :data="editDialogData" :loading="editDialogLoading" :mode="dialogMode" @submit="handleEditSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import Pagination from '@/components/Pagination/index.vue';
import {
  fetchCaseTypeList,
  fetchCaseTypeOptions,
  updateCaseType,
  createCaseType,
  getCaseTypeDetail,
  enableAndDisabledCaseType
} from '@/api/safeguard/case';
import CaseTypeEdit from './commponents/caseTypeEdit.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { case_type } = toRefs<any>(proxy?.useDict('case_type'));

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
  caseTypeId: '', // 案件类型
  caseTypeCode: '', // 案件类型编号
  createTime: '', // 创建时间
  createByName: '', // 创建人
  status: '' // 所属状态
});

// 案件类型选项
const caseTypeOptions = ref<{ value: string | number; label: string }[]>([]);

// 状态选项
const statusOptions = [
  { value: '0', label: '启用' },
  { value: '1', label: '禁用' }
];

// 获取案件类型名称
const getCaseTypeName = (caseTypeId: string | number | undefined | null) => {
  if (caseTypeId === undefined || caseTypeId === null || caseTypeId === '') return '-';
  const option = caseTypeOptions.value.find((item) => item.value === String(caseTypeId));
  return option?.label || '-';
};

// 加载案件类型选项（如果需要从接口获取，可以在这里调用）
const loadCaseTypeOptions = async () => {
  // 案件类型选项已硬编码，如果需要从接口获取，可以在这里调用
  try {
    const res = await fetchCaseTypeOptions();
    const list: any[] = res?.data || res || [];
    caseTypeOptions.value = (Array.isArray(list) ? list : []).map((item: any) => ({
      value: item.caseTypeId ?? item.value ?? '',
      label: item.caseTypeName ?? item.label ?? ''
    }));
  } catch (error) {
    console.error('获取案件类型列表失败:', error);
  }
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    const res = await fetchCaseTypeList(queryParams);
    if (res && res.code === 200) {
      tableData.value = res.rows || res.data || [];
      total.value = res.total || 0;
    } else {
      ElMessage.error(res?.msg || '获取列表失败');
      tableData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error('获取案件类型列表失败:', error);
    ElMessage.error(error?.msg || error?.message || '获取列表失败');
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置
const handleReset = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  handleQuery();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
  selectedIds.value = selection.map((item) => item.id);
};

// 弹窗相关
const editDialogVisible = ref(false);
const editDialogLoading = ref(false);
const editDialogData = ref({
  caseTypeId: '',
  caseTypeCode: '',
  keyAttributes: [] as any[],
  legalBasisFiles: [] as any[],
  legalBasisHistoryList: [] as any[],
  legalDocumentTemplate: '',
  legalDocumentFiles: [] as any[],
  legalDocumentHistoryList: [] as any[],
  status: '',
  caseScore: ''
});
const currentEditId = ref<string | number | null>(null);
const dialogMode = ref<'add' | 'edit' | 'view'>('add');

// 新增
const handleAdd = () => {
  dialogMode.value = 'add';
  editDialogData.value = {
    caseTypeId: '',
    caseTypeCode: '',
    keyAttributes: [],
    legalBasisFiles: [],
    legalBasisHistoryList: [],
    legalDocumentTemplate: '',
    legalDocumentFiles: [],
    legalDocumentHistoryList: [],
    status: '',
    caseScore: ''
  };
  editDialogVisible.value = true;
};

// 编辑
const mapPropertyList = (list: any[]) => {
  if (!Array.isArray(list)) return [];
  return list.map((item) => ({
    ...item,
    name: item.propertyName || item.name || ''
  }));
};

const mapBasisFile = (file: any) => {
  if (!file) return [];
  const oss = file?.ossInfo || {};
  return [
    {
      fileType: file?.fileType || 'document',
      fileTypeText: '文件',
      originalName: file?.originalName || oss.originalName || '',
      fileSize: Number(file?.fileSize || oss.fileSize || 0),
      version: file?.versionNo || '1.0',
      ossId: file?.ossId || oss.ossId,
      url: oss.url || ''
    }
  ];
};

const mapCaseDetail = (data: any) => {
  const propertyList = data?.propertyList || data?.propertyLis || [];
  const legalBasisFile = data?.newBasisFile;
  return {
    caseTypeId: data?.caseTypeId || '',
    caseTypeCode: data?.caseTypeCode || '',
    keyAttributes: mapPropertyList(propertyList),
    legalBasisFiles: mapBasisFile(legalBasisFile),
    legalBasisHistoryList: data?.legalBasisList || [],
    legalDocumentTemplate: data?.legalDocumentId || data?.legalDocumentTemplate || '',
    legalDocumentFiles: data?.legalDocumentFiles || [],
    legalDocumentHistoryList: data?.legalDocumentHistoryList || data?.legalDocumentList || [],
    status: data?.status || '',
    caseScore: data?.caseScore || '',
    currentVersion: data?.currentVersion || '1.0'
  };
};

const handleEdit = async (row: any) => {
  dialogMode.value = 'edit';
  currentEditId.value = row.id;
  editDialogData.value = {
    caseTypeId: '',
    caseTypeCode: '',
    keyAttributes: [],
    legalBasisFiles: [],
    legalBasisHistoryList: [],
    legalDocumentTemplate: '',
    legalDocumentFiles: [],
    legalDocumentHistoryList: [],
    status: '',
    caseScore: ''
  };
  editDialogVisible.value = true;
  editDialogLoading.value = true;
  try {
    const res = await getCaseTypeDetail(row.id);
    const data = res.data || {};
    editDialogData.value = mapCaseDetail(data);
  } catch (error) {
    console.error('获取案件类型详情失败:', error);
    ElMessage.error('获取详情失败');
  } finally {
    editDialogLoading.value = false;
  }
};

// 查看
const handleView = async (row: any) => {
  dialogMode.value = 'view';
  currentEditId.value = row.id;
  editDialogData.value = {
    caseTypeId: '',
    caseTypeCode: '',
    keyAttributes: [],
    legalBasisFiles: [],
    legalBasisHistoryList: [],
    legalDocumentTemplate: '',
    legalDocumentFiles: [],
    legalDocumentHistoryList: [],
    status: '',
    caseScore: ''
  };
  editDialogVisible.value = true;
  editDialogLoading.value = true;
  try {
    const res = await getCaseTypeDetail(row.id);
    const data = res.data || {};
    editDialogData.value = mapCaseDetail(data);
  } catch (error) {
    console.error('获取案件类型详情失败:', error);
    ElMessage.error('获取详情失败');
  } finally {
    editDialogLoading.value = false;
  }
};

// 显示确认弹窗
const showConfirmDialog = (message: string) => {
  return ElMessageBox.confirm(message, '操作确认', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'case-confirm-dialog',
    confirmButtonClass: 'case-confirm-primary',
    cancelButtonClass: 'case-confirm-cancel',
    center: true
  });
};

// 切换状态
const handleToggleStatus = async (row: any) => {
  const action = row.status === '0' ? '禁用' : '启用';
  const message = row.status === '0' ? '是否确认禁用?' : '是否确认启用?';
  const newStatus = row.status === '0' ? '1' : '0';
  try {
    await showConfirmDialog(message);
    await enableAndDisabledCaseType(row.id.toString(), newStatus);
    ElMessage.success(`${action}成功`);
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error(`${action}失败:`, error);
      ElMessage.error(error?.msg || error?.message || `${action}失败`);
    }
  }
};

// 批量启用
const handleEnableBatch = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要启用的数据');
    return;
  }
  try {
    await showConfirmDialog('是否确认启用?');
    await enableAndDisabledCaseType(selectedIds.value.join(','), '0');
    ElMessage.success('启用成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('启用失败:', error);
      ElMessage.error(error?.msg || error?.message || '启用失败');
    }
  }
};

// 批量禁用
const handleDisableBatch = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要禁用的数据');
    return;
  }
  try {
    await showConfirmDialog('是否确认禁用?');
    await enableAndDisabledCaseType(selectedIds.value.join(','), '1');
    ElMessage.success('禁用成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('禁用失败:', error);
      ElMessage.error(error?.msg || error?.message || '禁用失败');
    }
  }
};

// 提交处理
const buildCasePayload = (data: any) => {
  return {
    caseTypeId: data.caseTypeId,
    propertyList: (data.keyAttributes || []).map((item: any) => ({
      propertyName: item.propertyName || item.name || ''
    })),
    legalBasisList: (data.legalBasisFiles || []).map((item: any) => ({
      ossId: item.ossId,
      originalName: item.originalName,
      fileSize: item.fileSize,
      url: item.url,
      version: item.version
    })),
    legalDocumentId: data.legalDocumentTemplate,
    status: data.status,
    caseScore: Number(data.caseScore ?? 0),
    currentVersion: data.currentVersion || '1.0'
  };
};

const handleEditSubmit = async (data: any) => {
  try {
    const payload = buildCasePayload(data);
    if (dialogMode.value === 'add') {
      const addPayload = {
        ...payload
      };
      await createCaseType(addPayload);
      ElMessage.success('新增成功');
    } else if (dialogMode.value === 'edit') {
      if (!currentEditId.value) {
        ElMessage.error('未找到要编辑的数据');
        return;
      }
      await updateCaseType({
        id: currentEditId.value,
        ...payload
      });
      ElMessage.success('编辑成功');
    }
    editDialogVisible.value = false;
    getList();
  } catch (error: any) {
    console.error('保存案件类型失败:', error);
    ElMessage.error(error?.msg || error?.message || '保存失败，请稍后重试');
  }
};

// 初始化
onMounted(() => {
  getList();
  loadCaseTypeOptions();
});
</script>

<style scoped lang="scss">
.case-type-container {
  padding: 20px;

  .search-actions {
    margin-left: auto;
  }

  .search-btn,
  .reset-btn {
    margin-left: 10px;
  }

  .mb8 {
    margin: 0 0 8px -4px !important;
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>

<style lang="scss">
.case-confirm-dialog {
  .el-message-box__header {
    padding-bottom: 0;
  }

  .el-message-box__title {
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .el-message-box__content {
    padding-top: 8px;
    color: #333;
    font-size: 15px;
  }
}

.case-confirm-primary {
  background-color: #0d5dff !important;
  border-color: #0d5dff !important;
  color: #fff !important;
}

.case-confirm-cancel {
  border-color: #d9d9d9 !important;
  color: #333 !important;
  background-color: #fff !important;
}
</style>
