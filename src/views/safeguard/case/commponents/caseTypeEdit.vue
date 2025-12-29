<!--
    标题: caseTypeEdit.vue
    功能: 新增/编辑/查看案件类型
    说明: 案件类型管理弹窗
    当前版本: 1.0
    开发信息: Created by 邓和杰 2025-11-21
-->
<template>
  <el-dialog
    :model-value="visible"
    width="50%"
    :title="isViewMode ? '查看案件类型' : isAddMode ? '新增案件类型' : '编辑案件类型'"
    align-center
    :close-on-click-modal="false"
    :show-close="true"
    @close="handleClose"
    class="case-type-edit-dialog"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="170px"
      :class="['case-type-edit-form', { 'is-view-mode': isViewMode }]"
      v-loading="loading"
      element-loading-text="加载中..."
    >
      <!-- 1. 案件类型 -->
      <el-form-item prop="caseTypeId" class="case-type-first-item">
        <template #label>
          <span>案件类型</span>
        </template>
        <el-select v-if="!isViewMode" v-model="formData.caseTypeId" placeholder="请选择">
          <el-option v-for="dict in case_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
        <span v-else>{{ getCaseTypeLabel(formData.caseTypeId) }}</span>
      </el-form-item>

      <!-- 2. 案件编号 -->
      <el-form-item v-if="!isAddMode" class="case-type-first-item">
        <template #label>
          <span>案件编号</span>
        </template>
        <el-input v-model="formData.caseTypeCode" disabled />
      </el-form-item>

      <!-- 3. 关键属性 -->
      <el-form-item prop="keyAttributes" class="case-type-first-item">
        <template #label>
          <span>关键属性</span>
        </template>
        <div class="key-attributes-section">
          <el-button v-if="!isViewMode" type="primary" @click="handleAddKeyAttribute">添加</el-button>
        </div>
      </el-form-item>
      <el-table :data="formData.keyAttributes" border class="key-attributes-table" size="small">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="关键属性名称" min-width="200">
          <template #default="{ row, $index }">
            <el-input
              v-if="!isViewMode"
              v-model="row.name"
              placeholder="请输入关键属性名称"
              maxlength="30"
              show-word-limit
              @blur="validateKeyAttributeName($index)"
            />
            <span v-else>{{ row.name || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" v-if="!isViewMode" width="100" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" @click="handleRemoveKeyAttribute($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 4. 法律依据文件 -->
      <el-form-item prop="legalBasisFiles" class="case-type-first-item">
        <template #label>
          <span>法律依据文件</span>
        </template>
        <div class="legal-basis-section">
          <el-upload
            v-if="!isViewMode"
            ref="legalBasisUploadRef"
            class="upload-wrapper"
            :file-list="[]"
            action="#"
            :http-request="handleLegalBasisUpload"
            :before-upload="handleLegalBasisBeforeUpload"
            :on-exceed="handleLegalBasisExceed"
            :show-file-list="false"
            accept=".pdf,.doc,.docx,.xls,.xlsx"
            :limit="1"
            :disabled="loading"
          >
            <el-button type="primary" :loading="legalBasisUploadLoading">
              <el-icon class="el-icon--left"><UploadFilled /></el-icon>
              上传文件
            </el-button>
            <!-- <span v-if="formData.legalBasisFiles.length === 0" class="upload-placeholder">请上传文件</span> -->
          </el-upload>
        </div>
      </el-form-item>
      <el-table :data="formData.legalBasisFiles" border class="file-table fileTable" size="small">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileTypeText" label="附件类型" width="120" align="center" />
        <el-table-column prop="originalName" label="附件名称" min-width="200" />
        <el-table-column prop="fileSize" label="附件大小" width="120" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column label="版本号" width="120" align="center">
          <template #default>{{ currentVersion }}</template>
        </el-table-column>
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row, $index }">
            <el-button v-if="isViewMode" link type="primary" @click="handleDownloadLegalBasisFile(row)">下载</el-button>
            <el-button v-else link type="danger" @click="handleRemoveLegalBasisFile($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 5. 法律依据历史版本 -->
      <div class="history-section" v-if="!isAddMode">
        <div class="history-header">
          <el-icon><Document /></el-icon>
          <span>法律依据历史版本</span>
        </div>
        <el-table :data="pagedLegalBasisHistoryList" border size="small">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="updateTime" label="修改时间" width="180" align="center" />
          <el-table-column prop="originalName" label="附件名称" min-width="200" />
          <el-table-column prop="fileSize" label="附件大小" width="120" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="versionNo" label="历史版本" width="120" align="center" />
          <el-table-column prop="remark" label="备注" min-width="180" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDownloadLegalBasisHistory(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="history-pagination" v-if="legalBasisHistoryList.length">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="legalBasisHistoryPagination.pageSize"
            :current-page="legalBasisHistoryPagination.page"
            :total="legalBasisHistoryList.length"
            @current-change="handleLegalBasisHistoryPageChange"
            @size-change="handleLegalBasisHistorySizeChange"
          />
        </div>
      </div>

      <!-- 6. 法律文书模版 -->
      <el-form-item prop="legalDocumentTemplate" class="case-type-first-item">
        <template #label>
          <span>法律文书模版</span>
        </template>
        <div class="legal-document-section">
          <el-select v-if="!isViewMode" v-model="formData.legalDocumentTemplate" placeholder="请选择" filterable>
            <el-option v-for="item in legalDocumentTemplateOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
          <span v-else>{{ getLegalDocumentTemplateName(formData.legalDocumentTemplate) }}</span>
        </div>
      </el-form-item>
      <el-table :data="formData.legalDocumentFiles" border class="file-table" size="small" style="margin-top: 20px">
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="fileTypeText" label="附件类型" width="120" align="center" />
        <el-table-column prop="originalName" label="附件名称" min-width="200" />
        <el-table-column prop="fileSize" label="附件大小" width="120" align="center">
          <template #default="{ row }">
            {{ formatFileSize(row.fileSize) }}
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本号" width="120" align="center" />
        <el-table-column label="操作" width="100" align="center">
          <template #default="{ row, $index }">
            <el-button v-if="isViewMode || isAddMode" link type="primary" @click="handleDownloadLegalDocumentFile(row)">下载</el-button>
            <el-button v-else link type="danger" @click="handleRemoveLegalDocumentFile($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 7. 法律文书模版历史版本 -->
      <div class="history-section">
        <div class="history-header">
          <el-icon><Document /></el-icon>
          <span>法律文书模版历史版本</span>
        </div>
        <el-table :data="pagedLegalDocumentHistoryList" border size="small">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="updateTime" label="修改时间" width="180" align="center" />
          <el-table-column prop="fileName" label="附件名称" min-width="200" />
          <el-table-column prop="fileSize" label="附件大小" width="120" align="center">
            <template #default="{ row }">
              {{ formatFileSize(row.fileSize) }}
            </template>
          </el-table-column>
          <el-table-column prop="version" label="历史版本" width="120" align="center" />
          <el-table-column prop="remark" label="备注" min-width="180" />
          <el-table-column label="操作" width="100" align="center">
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDownloadLegalDocumentHistory(row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="history-pagination" v-if="legalDocumentHistoryList.length">
          <el-pagination
            background
            layout="total, sizes, prev, pager, next"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="legalDocumentHistoryPagination.pageSize"
            :current-page="legalDocumentHistoryPagination.page"
            :total="legalDocumentHistoryList.length"
            @current-change="handleLegalDocumentHistoryPageChange"
            @size-change="handleLegalDocumentHistorySizeChange"
          />
        </div>
      </div>

      <!-- 8. 所属状态 -->
      <el-form-item prop="status" class="case-type-first-item">
        <template #label>
          <span>所属状态</span>
        </template>
        <el-select v-if="!isViewMode" v-model="formData.status" placeholder="请选择">
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
        <span v-else>{{ statusText }}</span>
      </el-form-item>

      <!-- 9. 设置案件扣分标准 -->
      <el-form-item prop="caseScore" class="case-type-first-item">
        <template #label>
          <span>设置案件扣分值</span>
        </template>
        <el-input
          v-if="!isViewMode"
          v-model="formData.caseScore"
          placeholder="请输入扣分值"
          type="number"
          :min="0"
          :max="100"
          @input="handleCaseScoreInput"
        />
        <span v-else>{{ formData.caseScore }}</span>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button v-if="!isViewMode" type="primary" :loading="loading" @click="handleSubmit">提交</el-button>
        <el-button :disabled="loading" @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Document } from '@element-plus/icons-vue';
import { uploadByChunks } from '@/utils/chunkUpload';
import { fetchCreateLegalDocumentList, getLegalDocumentDetail } from '@/api/safeguard/legalDocument';
import { getCaseTypeDetail } from '@/api/safeguard/case';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { case_type } = toRefs<any>(proxy?.useDict('case_type'));

interface KeyAttribute {
  name: string;
}

interface LegalFile {
  fileType?: string;
  fileTypeText?: string;
  originalName: string;
  fileSize: number;
  version?: string;
  uploadTime?: string;
  remark?: string;
  ossId?: string;
  url?: string;
}

interface HistoryFile {
  ossInfo: any;
  fileName: string;
  updateTime: string;
  fileSize: number;
  version: string;
  remark?: string;
  url?: string;
  ossId?: string;
}

const props = defineProps<{
  modelValue: boolean;
  data?: {
    caseTypeId?: string;
    caseTypeCode?: string;
    keyAttributes?: KeyAttribute[];
    legalBasisFiles?: LegalFile[];
    legalBasisHistoryList?: HistoryFile[];
    legalDocumentTemplate?: string;
    legalDocumentFiles?: LegalFile[];
    legalDocumentHistoryList?: HistoryFile[];
    status?: string;
    caseScore?: number;
  };
  loading?: boolean;
  mode?: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'submit', data: any): void;
}>();

const formRef = ref();
const legalBasisUploadRef = ref();
const legalBasisUploadLoading = ref(false);
const currentVersion = ref('1.0');
const isUpload = ref(false);

const formData = reactive({
  caseTypeId: '',
  caseTypeCode: '',
  keyAttributes: [] as KeyAttribute[],
  legalBasisFiles: [] as LegalFile[],
  legalDocumentTemplate: '',
  legalDocumentFiles: [] as LegalFile[],
  status: '',
  caseScore: 0,
  currentVersion: ''
});

const legalBasisHistoryList = ref<HistoryFile[]>([]);
const legalBasisHistoryPagination = reactive({
  page: 1,
  pageSize: 10
});

const legalDocumentHistoryList = ref<HistoryFile[]>([]);
const legalDocumentHistoryPagination = reactive({
  page: 1,
  pageSize: 10
});

const visible = computed(() => props.modelValue);
const loading = computed(() => props.loading || false);
const isViewMode = computed(() => props.mode === 'view');
const isAddMode = computed(() => props.mode === 'add');

const caseTypeOptions = [
  { value: '1', label: '商品侵权' },
  { value: '2', label: '无证经营' },
  { value: '3', label: '商品太便宜' },
  { value: '4', label: '商品太贵' },
  { value: '5', label: '没有商品' },
  { value: '6', label: '物流太慢' },
  { value: '7', label: '物流太快' },
  { value: '8', label: '商品质量太好' },
  { value: '9', label: '商品质量不好' },
  { value: '10', label: '其他' }
];

const statusOptions = [
  { value: '0', label: '启用' },
  { value: '1', label: '禁用' }
];

const legalDocumentTemplateOptions = ref<{ value: string; label: string }[]>([]);

const pagedLegalBasisHistoryList = computed(() => {
  const start = (legalBasisHistoryPagination.page - 1) * legalBasisHistoryPagination.pageSize;
  return legalBasisHistoryList.value.slice(start, start + legalBasisHistoryPagination.pageSize);
});

const pagedLegalDocumentHistoryList = computed(() => {
  const start = (legalDocumentHistoryPagination.page - 1) * legalDocumentHistoryPagination.pageSize;
  return legalDocumentHistoryList.value.slice(start, start + legalDocumentHistoryPagination.pageSize);
});

const statusText = computed(() => {
  const option = statusOptions.find((item) => item.value === formData.status);
  return option?.label || '--';
});

const hasEmptyKeyAttribute = computed(() => {
  return formData.keyAttributes.length > 0 && formData.keyAttributes.some((item) => !item.name || item.name.trim() === '');
});

const formRules = {
  caseTypeId: [{ required: true, message: '请选择案件类型', trigger: 'change' }],
  keyAttributes: [
    {
      required: true,
      validator: (rule: any, value: any, callback: any) => {
        if (!value || value.length === 0) {
          callback(new Error('请至少添加一个关键属性'));
        } else {
          const hasEmpty = value.some((item: KeyAttribute) => !item.name || item.name.trim() === '');
          if (hasEmpty) {
            callback(new Error('请填写所有关键属性名称'));
          } else {
            callback();
          }
        }
      },
      trigger: 'change'
    }
  ],
  legalBasisFiles: [{ required: true, message: '请上传法律依据文件', trigger: 'change' }],
  legalDocumentTemplate: [{ required: true, message: '请选择法律文书模版', trigger: 'change' }],
  status: [{ required: true, message: '请选择所属状态', trigger: 'change' }],
  caseScore: [
    { required: true, message: '请输入扣分值', trigger: 'blur' },
    {
      validator: (rule: any, value: any, callback: any) => {
        if (value === '' || value === null || value === undefined) {
          callback(new Error('请输入扣分值'));
          return;
        }
        const num = Number(value);
        if (!Number.isInteger(num)) {
          callback(new Error('扣分值必须为整数'));
          return;
        }
        if (num < 0) {
          callback(new Error('扣分值不能为负数'));
          return;
        }
        if (num > 100) {
          callback(new Error('扣分值不能超过100'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ]
};

// 加载法律文书模版选项
const loadLegalDocumentTemplateOptions = async () => {
  try {
    const res = await fetchCreateLegalDocumentList();
    const list: any[] = res?.data || res || [];
    legalDocumentTemplateOptions.value = (Array.isArray(list) ? list : []).map((item: any) => ({
      value: item.id || item.legalDocumentCode || '',
      label: item.legalDocumentName || ''
    }));
  } catch (error) {
    console.error('获取法律文书模版列表失败:', error);
    legalDocumentTemplateOptions.value = [];
  }
};

const getCaseTypeLabel = (value: string | number) => {
  const dict = case_type.value?.find((item: any) => item.value === value);
  return dict?.label || value || '--';
};

const getLegalDocumentTemplateName = (id: string) => {
  const option = legalDocumentTemplateOptions.value.find((item) => item.value === id);
  return option?.label || id || '--';
};

const formatFileSize = (size: number) => {
  if (size === undefined || size === null) return '--';
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(2)}KB`;
  return `${(kb / 1024).toFixed(2)}MB`;
};

const padZero = (num: number) => num.toString().padStart(2, '0');

const formatDateTime = (value?: string | number | Date) => {
  if (value === undefined || value === null || value === '') return '--';
  let date: Date;
  if (value instanceof Date) {
    date = value;
  } else if (typeof value === 'number') {
    date = new Date(value);
  } else if (/^\d+$/.test(value)) {
    const numeric = Number(value);
    date = new Date(value.length === 10 ? numeric * 1000 : numeric);
  } else {
    date = new Date(value.replace(/-/g, '/'));
  }
  if (Number.isNaN(date.getTime())) {
    return '--';
  }
  return `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(
    date.getHours()
  )}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
};

const getNextVersion = (version?: string) => {
  const [majorStr = '1', minorStr = '0'] = (version || '1.0').split('.');
  let major = Number(majorStr);
  let minor = Number(minorStr);
  if (Number.isNaN(major)) major = 1;
  if (Number.isNaN(minor)) minor = 0;
  minor = Math.max(0, Math.floor(minor));
  // 版本号变化规则：1.0->1.1, 1.8->1.9, 1.9->2.0
  if (minor >= 9) {
    major += 1;
    minor = 0;
  } else {
    minor += 1;
  }
  return `${major}.${minor}`;
};

const handleLegalBasisBeforeUpload = (file: File) => {
  // 检查是否正在上传
  if (legalBasisUploadLoading.value) {
    ElMessage.warning('文件上传中，请勿重复上传');
    return false;
  }
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const ext = file.name.split('.').pop()?.toLowerCase();
  const extAllowed = ['pdf', 'doc', 'docx', 'xls', 'xlsx'].includes(ext || '');
  const sizeLimit = file.size / 1024 / 1024 < 100;
  if (!allowed.includes(file.type) && !extAllowed) {
    ElMessage.error('仅支持上传 pdf、word、excel 文件');
    return false;
  }
  if (!sizeLimit) {
    ElMessage.error('文件大小不能超过100MB');
    return false;
  }
  return true;
};

const handleLegalBasisExceed = () => ElMessage.error('只能上传一个文件');

// 关键属性相关
const handleAddKeyAttribute = () => {
  formData.keyAttributes.push({ name: '' });
  formRef.value?.validateField?.('keyAttributes');
};

const handleRemoveKeyAttribute = (index: number) => {
  formData.keyAttributes.splice(index, 1);
  formRef.value?.validateField?.('keyAttributes');
};

const validateKeyAttributeName = (index: number) => {
  if (formData.keyAttributes[index].name && formData.keyAttributes[index].name.length > 10) {
    ElMessage.warning('关键属性名称最多支持10个字');
    formData.keyAttributes[index].name = formData.keyAttributes[index].name.substring(0, 10);
  }
  formRef.value?.validateField?.('keyAttributes');
};

// 法律依据文件相关
const handleLegalBasisUpload = (req: any) =>
  new Promise(async (resolve, reject) => {
    const rawFile = req.file;

    // 再次检查是否正在上传
    if (legalBasisUploadLoading.value) {
      ElMessage.warning('文件上传中，请勿重复上传');
      reject(new Error('文件上传中，请勿重复上传'));
      return;
    }

    if (!handleLegalBasisBeforeUpload(rawFile)) {
      reject(new Error('文件验证失败'));
      return;
    }

    legalBasisUploadLoading.value = true;
    try {
      // 统一使用分片上传（参考 legalDocumentEdit.vue）
      const res: any = await uploadByChunks(rawFile, (percent: number) => {
        // 更新上传进度
        if (typeof req.onProgress === 'function') {
          req.onProgress({ percent });
        }
      });

      // 从返回结果中获取数据
      if (!res || !res.ossId) {
        throw new Error('上传失败：未获取到文件ID');
      }

      const fileName = res.fileName || rawFile.name;
      const ossId = res.ossId;
      const url = res.url;

      let nextVersion = currentVersion.value;
      // 编辑模式：版本号只在第一次上传时变化，后续上传使用相同版本
      // 变化规则：1.0->1.1, 1.8->1.9, 1.9->2.0
      if (!isAddMode.value) {
        if (!isUpload.value) {
          nextVersion = getNextVersion(currentVersion.value);
          currentVersion.value = nextVersion;
          isUpload.value = true; // 标记已上传，后续上传不再变化版本号
        } else {
          nextVersion = currentVersion.value; // 使用已变化的版本号
        }
      } else {
        // 新增模式：版本号始终为 1.0，但仍需标记为已上传以便提交文件
        nextVersion = '1.0';
        currentVersion.value = '1.0';
        isUpload.value = true;
      }

      const uploadTimestamp = Date.now();
      const uploadTimeText = formatDateTime(uploadTimestamp);
      const newFile: LegalFile = {
        fileType: 'document',
        fileTypeText: '文件',
        originalName: fileName,
        fileSize: rawFile.size,
        version: nextVersion,
        uploadTime: uploadTimeText,
        remark: '',
        ossId: ossId,
        url: url
      };

      formData.legalBasisFiles = [newFile];
      formRef.value?.validateField?.('legalBasisFiles');

      if (typeof req.onSuccess === 'function') {
        req.onSuccess(res);
      }

      ElMessage.success('文件上传成功');
      resolve(newFile);
    } catch (error: any) {
      console.error('文件上传失败:', error);

      // 改进错误提示
      const errorMsg = error?.msg || error?.message || '文件上传失败，请稍后再试';
      if (errorMsg.includes('文件上传中') || errorMsg.includes('重复上传')) {
        ElMessage.warning(errorMsg);
      } else {
        ElMessage.error(errorMsg);
      }

      try {
        (legalBasisUploadRef.value as any)?.handleRemove(req);
      } catch {}

      if (typeof req.onError === 'function') {
        req.onError(error);
      }

      reject(error);
    } finally {
      legalBasisUploadLoading.value = false;
    }
  });

const handleRemoveLegalBasisFile = (index: number) => {
  formData.legalBasisFiles.splice(index, 1);
  formRef.value?.validateField?.('legalBasisFiles');
};

const handleDownloadLegalBasisFile = async (file: LegalFile) => {
  if (!file.url) {
    ElMessage.error('下载地址不存在');
    return;
  }
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.originalName || '文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

const handleDownloadLegalBasisHistory = async (file: HistoryFile) => {
  if (!file.ossInfo.url) {
    ElMessage.error('下载地址不存在');
    return;
  }
  try {
    const response = await fetch(file.ossInfo.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.ossInfo.originalName || '文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

const handleLegalBasisHistoryPageChange = (page: number) => {
  legalBasisHistoryPagination.page = page;
};

const handleLegalBasisHistorySizeChange = (size: number) => {
  legalBasisHistoryPagination.pageSize = size;
  legalBasisHistoryPagination.page = 1;
};

// 法律文书模版相关
const loadLegalDocumentTemplateData = async (value: string, showMessage = true) => {
  if (!value) {
    formData.legalDocumentFiles = [];
    legalDocumentHistoryList.value = [];
    return;
  }
  try {
    // 获取法律文书模版详情（最新文件）
    const res = await getLegalDocumentDetail(value);
    const data = res.data;
    const latestFile = data.newFile;

    if (latestFile) {
      const oss = latestFile?.ossInfo || {};
      const mappedFile: LegalFile = {
        fileType: 'document',
        fileTypeText: '文件',
        originalName: latestFile?.originalName || oss.originalName || '',
        fileSize: Number(latestFile?.fileSize || oss.fileSize || 0),
        version: data.currentVersion || '1.0',
        ossId: latestFile?.ossId || oss.ossId,
        url: oss.url || ''
      };
      formData.legalDocumentFiles = [mappedFile];
    } else {
      formData.legalDocumentFiles = [];
    }

    const historyData = data;
    if (historyData?.legalFiles && Array.isArray(historyData.legalFiles)) {
      legalDocumentHistoryList.value = historyData.legalFiles.map((file: any) => {
        const oss = file?.ossInfo || {};
        return {
          fileName: file?.originalName || oss.originalName || '',
          updateTime: file?.updateTime || file?.createTime || '',
          fileSize: Number(file?.fileSize || oss.fileSize || 0),
          version: file?.versionNo || '1.0',
          remark: file?.remark || '',
          url: oss.url || ''
        };
      });
    } else {
      legalDocumentHistoryList.value = [];
    }

    legalDocumentHistoryPagination.page = 1;
    if (showMessage) {
      formRef.value?.validateField?.('legalDocumentTemplate');
    }
  } catch (error) {
    console.error('获取法律文书模版详情失败:', error);
    if (showMessage) {
      ElMessage.error('获取法律文书模版详情失败');
    }
    formData.legalDocumentFiles = [];
    legalDocumentHistoryList.value = [];
  }
};

const handleRemoveLegalDocumentFile = (index: number) => {
  formData.legalDocumentFiles.splice(index, 1);
  formData.legalDocumentTemplate = '';
};

const handleDownloadLegalDocumentFile = async (file: LegalFile) => {
  if (!file.url) {
    ElMessage.error('下载地址不存在');
    return;
  }
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.originalName || '文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

const handleDownloadLegalDocumentHistory = async (file: HistoryFile) => {
  if (!file.url) {
    ElMessage.error('下载地址不存在');
    return;
  }
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.fileName || '文件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

const handleLegalDocumentHistoryPageChange = (page: number) => {
  legalDocumentHistoryPagination.page = page;
};

const handleLegalDocumentHistorySizeChange = (size: number) => {
  legalDocumentHistoryPagination.pageSize = size;
  legalDocumentHistoryPagination.page = 1;
};

const handleCaseScoreInput = (value: string | number) => {
  if (value === '' || value === null || value === undefined) {
    formData.caseScore = 0;
    return;
  }
  const strValue = value.toString().replace(/[^\d]/g, '');
  if (strValue === '') {
    formData.caseScore = 0;
    return;
  }
  let num = Number(strValue);
  if (num > 100) num = 100;
  formData.caseScore = num;
};

const applyData = (val?: typeof props.data) => {
  formData.caseTypeId = val?.caseTypeId ? String(val.caseTypeId) : '';
  formData.caseTypeCode = val?.caseTypeCode || '';
  formData.keyAttributes = val?.keyAttributes?.map((item) => ({ ...item })) || [];
  formData.legalBasisFiles = val?.legalBasisFiles?.map((item) => ({ ...item })) || [];
  formData.legalDocumentTemplate = val?.legalDocumentTemplate || '';
  formData.legalDocumentFiles = val?.legalDocumentFiles?.map((item) => ({ ...item })) || [];
  formData.status = val?.status || '';
  formData.caseScore = val?.caseScore || 0;
  legalBasisHistoryList.value = val?.legalBasisHistoryList?.map((item) => ({ ...item })) || [];
  legalDocumentHistoryList.value = val?.legalDocumentHistoryList?.map((item) => ({ ...item })) || [];
  legalBasisHistoryPagination.page = 1;
  legalDocumentHistoryPagination.page = 1;
  isUpload.value = false;
  currentVersion.value = val?.legalBasisFiles?.[0]?.version || '1.0';
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      applyData(props.data);
      loadLegalDocumentTemplateOptions();
    } else {
      resetForm();
    }
  }
);

watch(
  () => props.data,
  (val) => {
    if (props.modelValue) {
      applyData(val);
    }
  },
  { deep: true }
);

watch(
  () => formData.legalDocumentTemplate,
  (val, oldVal) => {
    if (val) {
      loadLegalDocumentTemplateData(val, oldVal !== undefined);
    } else {
      formData.legalDocumentFiles = [];
      legalDocumentHistoryList.value = [];
    }
  }
);

const resetForm = () => {
  // 在清空数据之前，如果是编辑模式，先保存最新的版本号
  let latestVersion = '1.0';
  if (!isAddMode.value) {
    latestVersion = formData.legalBasisFiles?.[0]?.version;
  }

  formData.caseTypeId = '';
  formData.caseTypeCode = '';
  formData.keyAttributes = [];
  formData.legalBasisFiles = [];
  formData.legalDocumentTemplate = '';
  formData.legalDocumentFiles = [];
  formData.status = '';
  formData.caseScore = 0;
  legalBasisHistoryList.value = [];
  legalDocumentHistoryList.value = [];
  legalBasisHistoryPagination.page = 1;
  legalDocumentHistoryPagination.page = 1;
  isUpload.value = false;
  // 如果是新增模式，版本号为 '1.0'；如果是编辑模式，使用最新的版本号
  currentVersion.value = isAddMode.value ? '1.0' : latestVersion;
  legalBasisUploadRef.value?.clearFiles?.();
  formRef.value?.resetFields?.();
};

const handleSubmit = () => {
  formRef.value?.validate((valid: boolean) => {
    if (!valid) return;
    if (formData.legalDocumentFiles.length <= 0) {
      ElMessage.error('请选择法律文书模版');
      return;
    }
    const hasNewUpload = isUpload.value;
    formData.currentVersion = isAddMode.value ? '1.0' : formData.legalBasisFiles[0].version;
    emit('submit', {
      ...formData,
      legalBasisFiles: hasNewUpload ? formData.legalBasisFiles : [],
      legalBasisHistoryList: legalBasisHistoryList.value,
      legalDocumentHistoryList: legalDocumentHistoryList.value
    });
  });
};

const handleClose = () => {
  emit('update:modelValue', false);
};
</script>

<style scoped lang="scss">
:deep(.el-button) {
  border-radius: 4px !important;
}

.case-type-edit-dialog {
  .el-dialog__body {
    padding-top: 10px;
    max-height: 70vh;
    overflow-y: auto;
  }
}

.case-type-edit-form {
  .case-type-first-item {
    margin: 20px 0 0 !important;

    :deep(.el-form-item__label) {
      width: auto !important;
      padding-right: 12px !important;
      margin-right: 0 !important;
    }

    :deep(.el-form-item__content) {
      margin-left: 0 !important;
    }
  }

  .tip-text {
    margin-top: 4px;
    color: #f56c6c;
    font-size: 12px;
  }

  .error-text {
    margin-left: 12px;
    color: #f56c6c;
    font-size: 12px;
  }

  :global(.key-attributes-table) {
    margin-top: 20px;
    margin-bottom: 20px !important;
  }

  :global(.fileTable) {
    margin-top: 20px;
    margin-bottom: 20px !important;
  }

  .legal-basis-section,
  .legal-document-section {
    .upload-wrapper {
      // margin-bottom: 12px;

      .upload-placeholder {
        margin-left: 12px;
        color: #f56c6c;
        font-size: 12px;
      }
    }

    .file-table {
      margin-top: 12px;
    }
  }

  .history-section {
    margin: 24px 0;

    .history-header {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 10px;
      font-weight: 600;
    }

    .history-pagination {
      display: flex;
      justify-content: flex-end;
      padding: 12px 0 0;
    }
  }
}

.case-type-edit-form.is-view-mode {
  :deep(.el-input__wrapper),
  :deep(.el-textarea__inner),
  :deep(.el-select .el-input__wrapper) {
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding-left: 0 !important;
    cursor: default !important;
  }

  :deep(.el-input__suffix) {
    display: none;
  }

  :deep(.el-input__inner),
  :deep(.el-textarea__inner) {
    color: #303133 !important;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 20px;
}
</style>
