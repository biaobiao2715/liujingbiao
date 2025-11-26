<!--
  标题: whitePaperManage.vue
  功能: 维权白皮书管理
  说明: 用于维权白皮书的管理，包括查询、添加、编辑、删除、启用禁用、版本更新等操作
  当前版本: 1.0
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
          <el-button v-throttle v-hasPermi="['skill:whitePaper:add']" type="primary" @click="handleAdd">新增</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:whitePaper:edit']" type="success" @click="handleEnable">启用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:whitePaper:edit']" type="warning" @click="handleDisable">禁用</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle v-hasPermi="['skill:whitePaper:remove']" type="danger" @click="handleDelete">删除</el-button>
        </el-col>
      </el-row>

      <el-table :data="tableData" border v-loading="loading" :style="{width: '100%'}" @selection-change="handleSelectionChange">
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
                v-if="isEnabled(scope.row.paperStatus)" 
                v-throttle 
                v-hasPermi="['skill:whitePaper:edit']" 
                type="warning" 
                size="small" 
                @click="handleStatusChange(scope.row, '禁用')"
              >
                禁用
              </el-button>
              <el-button 
                v-if="isDisabled(scope.row.paperStatus)" 
                v-throttle 
                v-hasPermi="['skill:whitePaper:edit']" 
                type="success" 
                size="small" 
                @click="handleStatusChange(scope.row, '启用')"
              >
                启用
              </el-button>
              <el-button 
                v-if="isDisabled(scope.row.paperStatus)" 
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
                v-hasPermi="['system:oss:download']" 
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
import { uploadByChunks } from '@/utils/chunkUpload';
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

const handleReset = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = ['', ''];
  queryParams.value.paperTitle = '';
  queryParams.value.paperStatus = '';
  handleQuery();
};

const handleSelectionChange = (selection: any[]) => {
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
