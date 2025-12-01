<!--
  标题: whitePaperManage.vue
  功能: 维权白皮书管理
  说明: 用于维权白皮书的管理，包括查询、添加、编辑、删除、启用禁用、版本更新等操作
  当前版本: 1.0
-->
<template>
  <div class="white-paper-management">
    <!-- 搜索条件 -->
    <el-form
      v-show="showSearch"
      ref="queryFormRef"
      :model="queryParams"
      inline
      label-position="left"
    >
      <el-form-item label="维权白皮书标题" prop="paperTitle" label-width="auto">
        <el-input v-model="queryParams.paperTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      
      <el-form-item label="所属状态" prop="paperStatus" label-width="auto">
        <el-select v-model="queryParams.paperStatus" placeholder="请选择" filterable clearable>
          <el-option 
            v-for="item in whitepaper_status" 
            :key="item.value" 
            :label="item.label" 
            :value="item.value" 
          />
        </el-select>
      </el-form-item>
      
      <el-form-item label="发布时间" label-width="auto">
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
          v-hasPermi="['skill:whitePaper:add']"
          type="primary"
          icon="Plus"
          @click="handleAdd"
        >
          新增
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          v-hasPermi="['skill:whitePaper:edit']"
          :class="[
            'white-paper-btn',
            { 'is-active': selectedRows.length > 0 }
          ]"
          :disabled="selectedRows.length === 0"
          @click="handleEnable"
        >
          启用
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          v-hasPermi="['skill:whitePaper:edit']"
          :class="[
            'white-paper-btn',
            { 'is-active': selectedRows.length > 0 }
          ]"
          :disabled="selectedRows.length === 0"
          @click="handleDisable"
        >
          禁用
        </el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          v-hasPermi="['skill:whitePaper:remove']"
          :class="[
            'white-paper-btn',
            'white-paper-btn--danger',
            { 'is-active': selectedRows.length > 0 }
          ]"
          :disabled="selectedRows.length === 0"
          @click="handleDelete"
        >
          删除
        </el-button>
      </el-col>
    </el-row>

    <el-table
      :data="tableData"
      v-loading="loading"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      
      <el-table-column label="发布时间" align="center" prop="updateTime" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.updateTime || scope.row.createTime }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="白皮书标题" align="center" prop="paperTitle" :show-overflow-tooltip="true" min-width="200">
        <template #default="scope">
          <span>{{ scope.row.paperTitle }}</span>
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
          <div class="status-with-dot">
            <span 
              class="status-dot" 
              :class="`status-dot-${getStatusType(scope.row.paperStatus)}`"
            ></span>
            <span 
              class="status-text"
              :class="`status-text-${getStatusType(scope.row.paperStatus)}`"
            >
              {{ getStatusLabel(scope.row.paperStatus) }}
            </span>
          </div>
        </template>
      </el-table-column>
      
      <el-table-column label="最新版本号" align="center" prop="currentVersion" width="120">
        <template #default="scope">
          <span>{{ scope.row.currentVersion }}</span>
        </template>
      </el-table-column>
      
      <el-table-column label="操作" align="left" width="450" class-name="small-padding fixed-width">
        <template #default="scope">
          <div style="display: flex; justify-content: flex-start; align-items: center">
            <el-button 
              v-throttle 
              v-hasPermi="['skill:whitePaper:edit']" 
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleEdit(scope.row)"
            >
              编辑
            </el-button>
            <el-button 
              v-throttle 
              v-hasPermi="['skill:whitePaper:query']" 
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleView(scope.row)"
            >
              查看
            </el-button>
            <el-button 
              v-throttle 
              v-hasPermi="['skill:whitePaper:edit']" 
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleUpdateVersion(scope.row)"
            >
              更新版本
            </el-button>
            <el-button 
              v-if="isEnabled(scope.row.paperStatus)" 
              v-throttle 
              v-hasPermi="['skill:whitePaper:edit']" 
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleStatusChange(scope.row, '禁用')"
            >
              禁用
            </el-button>
            <el-button 
              v-if="isDisabled(scope.row.paperStatus)" 
              v-throttle 
              v-hasPermi="['skill:whitePaper:edit']" 
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleStatusChange(scope.row, '启用')"
            >
              启用
            </el-button>
            <el-button 
              v-if="isDisabled(scope.row.paperStatus)" 
              v-throttle 
              v-hasPermi="['skill:whitePaper:remove']" 
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleDeleteSingle(scope.row)"
            >
              删除
            </el-button>
            <el-button 
              v-throttle 
              v-hasPermi="['system:oss:download']" 
              type="text"
              style="font-size: 14px; color: #108c58"
              @click="handleDownload(scope.row)"
            >
              下载
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
      :title="getDialogTitle()"
      width="50%"
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
      width="50%"
      destroy-on-close
      :close-on-click-modal="false"
      @close="handleVersionDialogClose"
    >
      <el-form
        ref="versionFormRef"
        :model="versionFormData"
        :rules="versionFormRules"
        label-width="140px"
        class="version-form"
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
import { uploadByChunks } from '@/utils/chunkUpload0';
import { 
  getWhitePaperList, 
  deleteWhitePaper, 
  enableWhitePaper,
  disableWhitePaper,
  editWhitePaper,
  getWhitePaperDetail,
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
const selectedRows = ref<any[]>([]);

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

const MB = 1024 * 1024;
// 降低阈值，避免普通上传接口的超时问题（默认5秒超时），1MB 以上的文件都使用分片上传
const LARGE_FILE_CHUNK_THRESHOLD = 1 * MB;

const uploadRef = ref();
const versionFormRef = ref();

const versionFormData = ref({
  file: null as any,
  remark: ''
});

const versionFormRules = {
  file: [
    { required: true, message: '请上传文件', trigger: 'change' }
  ]
};

const getStatusType = (status: string | number) => {
  const statusStr = String(status);
  if (statusStr === '1' || statusStr === '启用') {
    return 'success';
  } else if (statusStr === '0' || statusStr === '禁用' || statusStr === '禁用') {
    return 'danger';
  }
  return 'info';
};

const normalizeStatus = (status: string | number | null | undefined) => {
  const s = String(status ?? '').trim();
  if (s === '1' || s === '启用' || s.toLowerCase() === 'enable' || s.toLowerCase() === 'enabled') return '1';
  if (s === '0' || s === '禁用' || s === '禁用' || s.toLowerCase() === 'disable' || s.toLowerCase() === 'disabled') return '0';
  return '';
};

const getStatusLabel = (status: string | number) => {
  const statusStr = normalizeStatus(status);
  if (statusStr === '1') {
    return '启用';
  } else if (statusStr === '0') {
    return '禁用';
  }
  return status;
};

const isEnabled = (status: string | number) => {
  return normalizeStatus(status) === '1';
};

const isDisabled = (status: string | number) => {
  return normalizeStatus(status) === '0';
};

const parseVersionNumber = (version: string | number | null | undefined) => {
  const str = String(version ?? '').trim();
  if (!str) return 0;
  const parts = str.split('.');
  const major = Number(parts[0]) || 0;
  const minor = Number(parts[1]) || 0;
  return major * 1000 + minor;
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
      const rows = Array.isArray(res.rows) ? res.rows.slice() : [];

      // 按最新发布时间进行排列（updateTime > publishTime > createTime），最新的在前
      rows.sort((a: any, b: any) => {
        const timeB = new Date(b?.updateTime || b?.publishTime || b?.createTime || 0).getTime();
        const timeA = new Date(a?.updateTime || a?.publishTime || a?.createTime || 0).getTime();
        const timeDiff = timeB - timeA;
        if (timeDiff !== 0) {
          return timeDiff;
        }
        // 如果发布时间相同，再按版本号倒序排列
        return parseVersionNumber(b?.currentVersion) - parseVersionNumber(a?.currentVersion);
      });

      tableData.value = rows.map((item: any) => ({
        ...item,
        updateTime: item.updateTime || item.publishTime || item.createTime || ''
      }));
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
  queryParams.value.paperTitle = '';
  queryParams.value.paperStatus = '';
  handleQuery();
};

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
  selectedIds.value = selection.map((item) => item.id);
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

  // 只能启用当前为禁用状态的白皮书
  const invalidRows = selectedRows.value.filter((row: any) => isEnabled(row.paperStatus));
  if (invalidRows.length > 0) {
    ElMessage.warning('所选白皮书中包含已启用的白皮书，无法重复启用');
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
    ElMessage.warning('请先选择要禁用的白皮书');
    return;
  }

  // 只能禁用当前为启用状态的白皮书
  const invalidRows = selectedRows.value.filter((row: any) => isDisabled(row.paperStatus));
  if (invalidRows.length > 0) {
    ElMessage.warning('所选白皮书中包含已禁用的白皮书，无法重复禁用');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要禁用选中的${ids.length}个白皮书吗？`,
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
      ElMessage.success(`成功禁用${ids.length}个白皮书`);
      await getList();
      selectedIds.value = [];
      selectedRows.value = [];
    } else {
      ElMessage.error(response?.msg || '禁用失败，请重试');
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('禁用失败，请稍后重试');
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

  // 只能删除已禁用的白皮书
  const hasEnabledItems = selectedRows.value.some((row: any) => isEnabled(row.paperStatus));
  if (hasEnabledItems) {
    ElMessage.warning('只能删除已禁用的白皮书，请先禁用后再删除');
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

const getNextVersion = (currentVersion?: string | null): string => {
  if (!currentVersion || !currentVersion.trim()) {
    return '1.0';
  }
  
  const versionStr = currentVersion.trim();
  const versionPattern = /^(\d+)\.(\d+)$/;
  const match = versionStr.match(versionPattern);
  
  if (!match) {
    return '1.0';
  }
  
  let left = parseInt(match[1], 10);
  let right = parseInt(match[2], 10);
  
  right += 1;
  
  if (right > 9) {
    left += 1;
    right = 0;
  }
  
  return `${left}.${right}`;
};

const handleUpdateVersion = (row: any) => {
  versionDialog.value.visible = true;
  const currentVersion = row.currentVersion || '1.0';
  versionDialog.value.currentVersion = currentVersion;
  versionDialog.value.paperTitle = row.paperTitle || '';
  versionDialog.value.rowId = row.id;
  versionDialog.value.uploading = false;
  
  versionFormData.value = {
    file: null,
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

const uploadWhitePaperVersionFile = async (file: File) => {
  const modal = (proxy as any)?.$modal;
  const useChunkUpload = file.size > LARGE_FILE_CHUNK_THRESHOLD;

  modal?.loading?.(useChunkUpload ? '正在分片上传，请稍候...' : '正在上传文件，请稍候...');

  try {
    if (useChunkUpload) {
      let chunkRes = await uploadByChunks(file, (percent) => {
        modal?.setLoadingText?.(`正在分片上传...${percent}%`);
      });
      // 分片上传返回的数据结构可能是 { url, fileName, ossid } 或 { data: { url, fileName, ossId } }
      // 统一处理，兼容不同的返回格式
      if (chunkRes && !chunkRes.ossId && !chunkRes.ossid && chunkRes.data) {
        chunkRes = chunkRes.data;
      }
      // 兼容 ossId 和 ossid 两种字段名
      const ossId = chunkRes?.ossId || chunkRes?.ossid || chunkRes?.data?.ossId || chunkRes?.data?.ossid;
      return {
        ossId: ossId,
        fileName: chunkRes?.fileName || chunkRes?.data?.fileName || file.name,
        url: chunkRes?.url || chunkRes?.data?.url,
        originalName: file.name
      };
    }

    const response = await ossUploadImage({ file });
    const data = response?.data || {};
    return {
      ossId: data.ossId,
      fileName: data.fileName || data.originalName || file.name,
      url: data.url,
      originalName: file.name
    };
  } finally {
    modal?.closeLoading?.();
  }
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
    
    try {
      const uploadResult = await uploadWhitePaperVersionFile(rawFile);
      
      if (uploadResult?.ossId) {
        const ossData = uploadResult;
        const fileSuffix = (rawFile.name.split('.').pop() || '').toLowerCase();
        
        const currentVersion = versionDialog.value.currentVersion || '1.0';
        const newVersion = getNextVersion(currentVersion);
        
        const ossVoList = [{
          ossId: ossData.ossId || 0,
          // 优先使用 originalName（用户上传时的原始文件名），而不是后端返回的 fileName（可能包含路径）
          fileName: ossData.originalName || rawFile.name,
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
        const errorMsg = '上传失败，请重试';
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
      row.paperStatus = status === '启用' ? '1' : '0';
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

const getPaperPrimaryId = (row: any): number | string | null => {
  if (!row) return null;
  const cand = row.id ?? row.paperId ?? row.paperNo ?? null;
  if (cand === null || cand === undefined) return null;
  const n = Number(cand);
  return Number.isFinite(n) && String(n) === String(cand) ? n : cand;
};

const handleDownload = async (row: any) => {
  try {
    const paperId = getPaperPrimaryId(row);
    if (paperId === null) {
      ElMessage.error('缺少白皮书ID');
      return;
    }
    const res: any = await getWhitePaperDetail(paperId);
    const data = res?.data || {};
    const attachments = Array.isArray(data.latestFiles) && data.latestFiles.length
      ? data.latestFiles
      : (Array.isArray(data.ossVoList) ? data.ossVoList : []);

    const latest = Array.isArray(data.latestFiles) && data.latestFiles.length ? data.latestFiles[0] : null;
    if (latest) {
      const preferredOssId = latest.ossId || (latest.sysOssLists && latest.sysOssLists[0] && latest.sysOssLists[0].ossId);
      const preferredUrl = latest.url || (latest.sysOssLists && latest.sysOssLists[0] && latest.sysOssLists[0].url);

      if (preferredOssId) {
        (proxy as any)?.$download?.oss(String(preferredOssId));
        return;
      }
      if (preferredUrl) {
        window.open(preferredUrl, '_blank');
        return;
      }
    } else {
      const first = attachments && attachments[0];
      const nestedUrl = first?.sysOssLists && first.sysOssLists[0] && first.sysOssLists[0].url;
      if (first) {
        if (first.ossId) {
          (proxy as any)?.$download?.oss(String(first.ossId));
          return;
        }
        if (first.url || nestedUrl) {
          const url = first.url || nestedUrl;
          window.open(url, '_blank');
          return;
        }
      }
    }

    ElMessage.error('未找到可下载的文件');
  } catch (e) {
    ElMessage.error('下载失败，请稍后重试');
  }
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.white-paper-management {
  padding: 24px;
  height: calc(100vh - 120px);
  box-sizing: border-box;
}

.operation-bar {
  margin-bottom: 16px;

  .el-col {
    display: flex;
    justify-content: flex-start;
  }
}

.white-paper-btn {
  width: auto;
  min-width: 96px;
  height: 36px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: #f2f3f5;
  border-color: #f2f3f5;
  color: #666666;
  transition: all 0.2s ease;

  &:disabled {
    background-color: #f4f5f5;
    border-color: #e6e8eb;
    color: #c0c4cc;
    cursor: not-allowed;
  }

  &:not(:disabled) {
    &:hover {
      background-color: #e6e8eb;
      border-color: #e6e8eb;
    }
  }

  &.is-active:not(:disabled):not(.white-paper-btn--danger) {
    background-color: #108c58;
    border-color: #108c58;
    color: #ffffff;

    &:hover {
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
}

.operation-bar {
  margin-bottom: 16px;

  .el-col {
    display: flex;
    justify-content: flex-start;
  }

  .el-button {
    width: auto;
    min-width: 80px;
  }
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
    font-size: 14px;
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

.version-form {
  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}

:deep(.el-dialog__footer) {
  .el-button {
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
  background-color: #67c23a;
}

.status-dot-warning {
  background-color: #e6a23c;
}

.status-dot-danger {
  background-color: #f56c6c;
}

.status-dot-info {
  background-color: #909399;
}

.status-text {
  font-size: 14px;
}

.status-text-success {
  color: #67c23a;
}

.status-text-warning {
  color: #e6a23c;
}

.status-text-danger {
  color: #f56c6c;
}

.status-text-info {
  color: #909399;
}
</style>
