<!--
  标题: WhitePaperEditDialog.vue
  功能: 维权白皮书新增/编辑弹窗
  说明: 用于新增和编辑维权白皮书
  当前版本: 1.0
-->
<template>
  <div class="whitepaper-edit-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px">
      <el-form-item label="维权白皮书标题" prop="paperTitle" required>
        <el-input 
          v-model="formData.paperTitle" 
          placeholder="请输入标题内容" 
          maxlength="30"
          clearable
        />
        <div class="form-tip">请输入标题内容，最多支持30个汉字</div>
      </el-form-item>

      <el-form-item label="上传附件" prop="attachment" :required="props.type === 'add'">
        <div class="attachment-section">
          <el-upload
            action="#"
            :auto-upload="false"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt"
            :show-file-list="false"
            :on-change="handleFileChange"
            :limit="10"
            :on-exceed="handleExceed"
          >
            <el-button v-throttle v-hasPermi="['system:oss:upload']" type="primary" plain>
              <el-icon class="el-icon--left"><Upload /></el-icon>
              添加附件
            </el-button>
            <template #tip>
              <div class="upload-tip">支持格式：PDF、Word、Excel、PPT、TXT，单个文件最大100MB，最多上传10个文件</div>
            </template>
          </el-upload>
        </div>
      </el-form-item>

      <el-form-item label="" v-if="attachmentList.length > 0">
        <el-table :data="attachmentList" border stripe class="attachment-table">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column label="附件类型" prop="fileType" width="120" align="center">
            <template #default="scope">
              <el-tag size="small">{{ scope.row.fileType }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="附件名称" prop="originalName" align="left" :show-overflow-tooltip="true" min-width="200">
            <template #default="scope">
              <el-link :href="scope.row.url" target="_blank" :underline="false">
                <el-icon><Document /></el-icon>
                {{ scope.row.originalName }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column label="附件大小" prop="fileSize" width="120" align="center" />
          <el-table-column label="版本号" prop="version" width="200" align="center">
            <template #default="scope">
              <el-input 
                v-model="scope.row.version" 
                placeholder="请输入版本号" 
                clearable
                size="small"
                @blur="validateVersion(scope.row)"
              />
              <div v-if="scope.row.versionError" class="version-tip">{{ scope.row.versionError }}</div>
              <div v-else-if="!scope.row.version" class="version-tip">请输入版本号</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button v-throttle v-hasPermi="['system:oss:upload']" type="primary" link size="small" @click="handleReplaceFile(scope.row)">
                重新上传
              </el-button>
              <el-button v-throttle type="danger" link size="small" @click="handleRemoveFile(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input 
          v-model="formData.remark" 
          type="textarea" 
          :rows="5" 
          placeholder="请输入备注内容（200字以内）"
          maxlength="200"
          clearable
        />
      </el-form-item>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '发布' : '提交' }}
        </el-button>
      </div>
    </el-form>

    <div v-if="props.type === 'edit' && currentAttachments.length > 0" class="attachment-info-section">
      <div class="section-header">
        <el-icon><Paperclip /></el-icon>
        <span class="section-title">附件</span>
      </div>
      <el-table :data="currentAttachments" border style="width: 100%">
        <el-table-column label="附件类型" width="120" align="center">
          <template #default>
            <el-icon class="file-icon"><Document /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="附件名称" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            {{ scope.row.fileName || scope.row.originalName || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="版本号" prop="version" width="120" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleDownloadAttachment(scope.row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="props.type === 'edit'" class="history-section">
      <div class="section-header">
        <el-icon><FolderOpened /></el-icon>
        <span class="section-title">历史版本</span>
      </div>
      <el-table :data="historyVersions" border style="width: 100%" empty-text="暂无历史版本">
        <el-table-column label="修改时间" prop="updateTime" width="180" align="center" />
        <el-table-column label="历史版本" prop="version" width="120" align="center" />
        <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="200" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleDownloadHistory(scope.row)" :disabled="!scope.row.ossId">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, getCurrentInstance, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Delete, Document, Paperclip, FolderOpened } from '@element-plus/icons-vue';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { listByIds } from '@/api/system/oss';
import { 
  getWhitePaperDetail, 
  addWhitePaper,
  editWhitePaper
} from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const formRef = ref();
const saving = ref(false);
const loading = ref(false);

const formData = ref({
  id: undefined as number | string | undefined,
  paperTitle: '',
  remark: '',
  attachment: ''
});

const attachmentList = ref<Array<{
  ossId?: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSuffix: string;
  url: string;
  fileSize: string;
  version: string;
  versionError?: string;
  uid?: string;
}>>([]);

const originalData = ref({
  paperTitle: '',
  remark: '',
  attachmentOssIds: [] as number[]
});

const detailData = ref({
  ossVoList: [] as any[],
  latestFiles: [] as any[],
  historyVersionsList: [] as any[],
  updateTime: '',
  currentVersion: '',
  paperStatus: ''
});

const currentAttachments = ref<Array<{
  ossId: number | string;
  fileName: string;
  originalName: string;
  fileType: string;
  version: string;
  url: string;
  fileSuffix: string;
}>>([]);

const loadCurrentAttachments = async () => {
  const attachments = detailData.value.latestFiles && detailData.value.latestFiles.length > 0
    ? detailData.value.latestFiles
    : (detailData.value.ossVoList || []);
  
  if (!Array.isArray(attachments) || attachments.length === 0) {
    currentAttachments.value = [];
    return;
  }
  
  const ossIds = attachments.map((item: any) => item.ossId).filter(Boolean);
  
  if (ossIds.length === 0) {
    currentAttachments.value = [];
    return;
  }
  
  try {
    const ossIdsStr = ossIds.join(',');
    const ossResponse: any = await listByIds(ossIdsStr);
    
    const ossMap = new Map();
    if (ossResponse && ossResponse.data && Array.isArray(ossResponse.data)) {
      ossResponse.data.forEach((oss: any) => {
        ossMap.set(String(oss.ossId), oss);
      });
    }
    
    currentAttachments.value = attachments.map((item: any) => {
      const ossInfo = ossMap.get(String(item.ossId)) || {};
      
      return {
        ossId: item.ossId,
        fileName: ossInfo.fileName || item.fileName || '',
        originalName: ossInfo.originalName || item.originalName || ossInfo.fileName || '',
        fileType: getFileTypeName(ossInfo.fileSuffix || item.fileSuffix || ''),
        version: item.versionNo || item.version || detailData.value.currentVersion || '',
        url: ossInfo.url || item.url || '',
        fileSuffix: ossInfo.fileSuffix || item.fileSuffix || ''
      };
    });
  } catch (error) {
    currentAttachments.value = attachments.map((item: any) => ({
      ossId: item.ossId,
      fileName: item.fileName || '',
      originalName: item.originalName || item.fileName || '',
      fileType: getFileTypeName(item.fileSuffix || ''),
      version: item.versionNo || item.version || detailData.value.currentVersion || '',
      url: item.url || '',
      fileSuffix: item.fileSuffix || ''
    }));
  }
};

const historyVersions = computed(() => {
  const list = detailData.value.historyVersionsList;
  if (!list || (list !== null && !Array.isArray(list))) {
    return [];
  }
  if (list === null) {
    return [];
  }
  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }
  
  return list.map((item: any) => {
    const version = item.versionNo 
      || item.version 
      || item.versionNum
      || item.currentVersion
      || (item.ossVoList && item.ossVoList[0] && item.ossVoList[0].version)
      || '';
    
    return {
      ...item,
      updateTime: item.updateTime || item.createTime || '',
      version: version,
      remark: item.remark || '',
      ossId: item.ossId,
      url: item.url || ''
    };
  });
});

const rules = {
  paperTitle: [
    { required: true, message: '请输入标题内容，最多支持30个汉字', trigger: 'blur' },
    { min: 1, max: 30, message: '标题长度在 1 到 30 个字符', trigger: 'blur' }
  ],
  attachment: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (props.type === 'add' && attachmentList.value.length === 0) {
          callback(new Error('请上传一个附件'));
        } else {
          callback();
        }
      },
      trigger: ['change', 'blur']
    }
  ]
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

const getFileTypeName = (suffix: string): string => {
  const typeMap: Record<string, string> = {
    'pdf': 'PDF文档',
    'doc': 'Word文档',
    'docx': 'Word文档',
    'xls': 'Excel表格',
    'xlsx': 'Excel表格',
    'ppt': 'PPT演示',
    'pptx': 'PPT演示',
    'txt': '文本文档'
  };
  return typeMap[suffix.toLowerCase()] || '文档';
};

const validateFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const docExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];

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

const handleExceed = () => {
  ElMessage.warning('最多只能上传10个附件');
};

const uploadingFiles = ref<Set<string>>(new Set());

const handleFileChange = async (file: any) => {
  if (!file) {
    ElMessage.error('文件对象不存在');
    return;
  }
  
  const rawFile = file.raw || file;
  
  if (!rawFile) {
    ElMessage.error('无法获取文件对象');
    return;
  }
  
  const fileKey = `${rawFile.name}_${rawFile.size}_${rawFile.lastModified}`;
  
  if (uploadingFiles.value.has(fileKey)) {
    return;
  }
  
  const isDuplicate = attachmentList.value.some(
    item => item.originalName === rawFile.name && item.fileSize === formatFileSize(rawFile.size)
  );
  if (isDuplicate) {
    ElMessage.warning('该文件已上传，请勿重复上传');
    return;
  }
  
  if (!validateFile(rawFile)) {
    return;
  }
  
  if (attachmentList.value.length >= 10) {
    ElMessage.warning('最多只能上传10个附件');
    return;
  }
  
  uploadingFiles.value.add(fileKey);
  
  if ((proxy as any)?.$modal) {
    (proxy as any).$modal.loading('正在上传附件，请稍候...');
  }
  
  try {
    const response = await ossUploadImage({ file: rawFile });
    
    if (response && response.code === 200 && response.data?.ossId) {
      const ossData = response.data;
      const fileSuffix = (rawFile.name.split('.').pop() || '').toLowerCase();
      
      attachmentList.value.push({
        ossId: ossData.ossId,
        fileName: ossData.fileName || ossData.originalName || rawFile.name,
        originalName: rawFile.name,
        fileType: getFileTypeName(fileSuffix),
        fileSuffix: fileSuffix,
        url: ossData.url,
        fileSize: formatFileSize(rawFile.size),
        version: '',
        versionError: '',
        uid: file.uid || Date.now() + Math.random()
      });
      
      formData.value.attachment = 'has_attachment';
      formRef.value?.validateField('attachment');
      
      ElMessage.success('附件上传成功');
    } else {
      const errorMsg = (response as any)?.msg || (response as any)?.data?.msg || '上传失败，请重试';
      ElMessage.error(errorMsg);
    }
  } catch (error: any) {
    const errorMsg = error?.message || error?.msg || error?.response?.data?.msg || '上传失败，请重试';
    ElMessage.error(errorMsg);
  } finally {
    uploadingFiles.value.delete(fileKey);
    if ((proxy as any)?.$modal) {
      (proxy as any).$modal.closeLoading();
    }
  }
};

const handleReplaceFile = async (row: any) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt';
  
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!validateFile(file)) return;
    
    (proxy as any)?.$modal?.loading('正在上传附件，请稍候...');
    
    try {
      const response = await ossUploadImage({ file: file });
      
      if (response.code === 200 && response.data?.ossId) {
        const ossData = response.data;
        const fileSuffix = (file.name.split('.').pop() || '').toLowerCase();
        
        Object.assign(row, {
          ossId: ossData.ossId,
          fileName: ossData.fileName,
          originalName: file.name,
          fileType: getFileTypeName(fileSuffix),
          fileSuffix: fileSuffix,
          url: ossData.url,
          fileSize: formatFileSize(file.size)
        });
        
        ElMessage.success('文件替换成功');
      } else {
        ElMessage.error(response?.msg || '文件上传失败');
      }
    } catch (error) {
      ElMessage.error('文件上传失败，请稍后重试');
    } finally {
      (proxy as any)?.$modal?.closeLoading();
    }
  };
  
  input.click();
};

const validateVersion = (row: any) => {
  if (!row.version) {
    row.versionError = '';
    return;
  }
  
  const versionPattern = /^\d+(\.\d+)?$/;
  if (!versionPattern.test(row.version)) {
    row.versionError = '版本号只能输入数字，例如：1.0';
  } else {
    row.versionError = '';
  }
};

const handleRemoveFile = (file: any) => {
  ElMessageBox.confirm('确定要删除该附件吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      const index = attachmentList.value.findIndex(
        (item) => item.uid === file.uid || item.ossId === file.ossId
      );
      if (index !== -1) {
        attachmentList.value.splice(index, 1);
        formData.value.attachment = attachmentList.value.length > 0 ? 'has_attachment' : '';
        formRef.value?.validateField('attachment');
        ElMessage.success('附件删除成功');
      }
    })
    .catch(() => {});
};

const handleDownloadAttachment = (file: any) => {
  if (file.ossId) {
    (proxy as any)?.$download?.oss(file.ossId);
  } else if (file.url) {
    window.open(file.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

const handleDownloadHistory = (version: any) => {
  if (version.ossId) {
    (proxy as any)?.$download?.oss(version.ossId);
  } else if (version.url) {
    window.open(version.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

const fetchWhitePaperDetail = async () => {
  if (!props.id) {
    ElMessage.error('白皮书ID不存在');
    return;
  }
  
  loading.value = true;
  try {
    const response: any = await getWhitePaperDetail(props.id);
    
    if (response && response.code === 200) {
      const data = response.data;
      
      if (!data) {
        ElMessage.error('获取白皮书详情失败：数据为空');
        return;
      }
      
      formData.value = {
        id: data.id,
        paperTitle: data.paperTitle || '',
        remark: data.remark || '',
        attachment: data.ossVoList && data.ossVoList.length > 0 ? 'has_attachment' : ''
      };
      
      const historyVersionsList = data.historyVersionsList === null 
        ? [] 
        : (Array.isArray(data.historyVersionsList) ? data.historyVersionsList : []);
      
      detailData.value = {
        ossVoList: data.ossVoList || [],
        latestFiles: data.latestFiles || [],
        historyVersionsList: historyVersionsList,
        updateTime: data.updateTime || data.createTime || '',
        currentVersion: data.currentVersion || '',
        paperStatus: data.paperStatus || '1'
      };
      
      await loadCurrentAttachments();
      
      const attachmentsForEdit = (data.latestFiles && data.latestFiles.length > 0) 
        ? data.latestFiles 
        : (data.ossVoList || []);
      
      if (attachmentsForEdit && Array.isArray(attachmentsForEdit) && attachmentsForEdit.length > 0) {
        const ossIds = attachmentsForEdit.map((item: any) => item.ossId).filter(Boolean);
        
        if (ossIds.length > 0) {
          try {
            const ossIdsStr = ossIds.join(',');
            const ossResponse: any = await listByIds(ossIdsStr);
            
            const ossMap = new Map();
            if (ossResponse && ossResponse.data && Array.isArray(ossResponse.data)) {
              ossResponse.data.forEach((oss: any) => {
                ossMap.set(String(oss.ossId), oss);
              });
            }
            
            attachmentList.value = attachmentsForEdit.map((item: any, index: number) => {
              const ossInfo = ossMap.get(String(item.ossId)) || {};
              
              let fileSize = '--';
              try {
                if (ossInfo.ext1) {
                  const meta = typeof ossInfo.ext1 === 'string' ? JSON.parse(ossInfo.ext1) : ossInfo.ext1;
                  if (meta?.fileSize) {
                    const sizeBytes = Number(meta.fileSize);
                    if (sizeBytes > 0) {
                      const kb = 1024;
                      const mb = kb * 1024;
                      if (sizeBytes >= mb) {
                        fileSize = (sizeBytes / mb).toFixed(2) + ' MB';
                      } else if (sizeBytes >= kb) {
                        fileSize = (sizeBytes / kb).toFixed(2) + ' KB';
                      } else {
                        fileSize = sizeBytes + ' B';
                      }
                    }
                  }
                }
              } catch (e) {
              }
              
              return {
                ossId: item.ossId,
                fileName: ossInfo.fileName || item.fileName || '',
                originalName: ossInfo.originalName || item.originalName || ossInfo.fileName || '',
                fileType: getFileTypeName(ossInfo.fileSuffix || item.fileSuffix || ''),
                fileSuffix: ossInfo.fileSuffix || item.fileSuffix || '',
                url: ossInfo.url || item.url || '',
                fileSize: fileSize,
                version: item.versionNo || item.version || '',
                versionError: '',
                uid: item.ossId || Date.now() + index
              };
            });
          } catch (error) {
            attachmentList.value = attachmentsForEdit.map((item: any, index: number) => ({
              ossId: item.ossId,
              fileName: item.fileName || '',
              originalName: item.originalName || item.fileName || '',
              fileType: getFileTypeName(item.fileSuffix || ''),
              fileSuffix: item.fileSuffix || '',
              url: item.url || '',
              fileSize: '--',
              version: item.versionNo || item.version || '',
              versionError: '',
              uid: item.ossId || Date.now() + index
            }));
          }
        } else {
          attachmentList.value = [];
        }
      } else {
        attachmentList.value = [];
      }
      
      originalData.value = {
        paperTitle: formData.value.paperTitle || '',
        remark: formData.value.remark || '',
        attachmentOssIds: attachmentList.value.map(item => item.ossId || 0).filter(id => id > 0)
      };
    } else {
      ElMessage.error(response?.msg || '获取白皮书详情失败');
    }
  } catch (error) {
    ElMessage.error('获取白皮书详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    const attachmentValid = await new Promise((resolve) => {
      formRef.value?.validateField('attachment', (valid: boolean) => {
        resolve(valid);
      });
    });
    if (!attachmentValid) {
      return;
    }
    
    if (attachmentList.value.length > 0) {
      const hasEmptyVersion = attachmentList.value.some(item => !item.version || !item.version.trim());
      if (hasEmptyVersion) {
        ElMessage.warning('请为所有附件填写版本号');
        return;
      }
      
      const hasInvalidVersion = attachmentList.value.some(item => {
        validateVersion(item);
        return item.versionError;
      });
      if (hasInvalidVersion) {
        ElMessage.warning('请检查版本号格式，版本号只能输入数字（例如：1.0）');
        return;
      }
    }
    
    saving.value = true;
    
    const ossVoList = attachmentList.value.map(item => {
      const ossItem: any = {
        ossId: item.ossId || 0,
        fileName: item.fileName || item.originalName || '',
        originalName: item.originalName || '',
        fileSuffix: item.fileSuffix || '',
        url: item.url || '',
        ext1: '',
        createTime: '',
        createBy: 0,
        service: ''
      };
      return ossItem;
    });
    
    const currentVersion = attachmentList.value.length > 0 
      ? attachmentList.value[0].version 
      : detailData.value.currentVersion || '';
    
    const paperStatus = props.type === 'add' 
      ? '1'
      : (detailData.value.paperStatus || '1');
    
    const submitData: any = {
      createDept: 0,
      createBy: 0,
      createTime: '',
      updateBy: 0,
      updateTime: '',
      params: {
        '': {}
      },
      ...(props.type === 'edit' && formData.value.id ? { id: formData.value.id } : {}),
      paperNo: '',
      paperTitle: formData.value.paperTitle?.trim() || '',
      paperType: '',
      paperStatus: paperStatus,
      currentVersion: currentVersion || '',
      remark: formData.value.remark || '',
      sortOrder: 0,
      beginTime: '',
      endTime: '',
      ossVoList: ossVoList,
      ids: [0],
      historyVersionsList: []
    };
    
    const api = props.type === 'add' ? addWhitePaper : editWhitePaper;
    
    if (props.type === 'edit') {
      const currentTitle = formData.value.paperTitle?.trim() || '';
      const currentRemark = formData.value.remark?.trim() || '';
      const currentAttachmentOssIds = attachmentList.value.map(item => item.ossId || 0).filter(id => id > 0).sort();
      const originalAttachmentOssIds = [...originalData.value.attachmentOssIds].sort();
      
      const hasChanged = currentTitle !== originalData.value.paperTitle ||
                        currentRemark !== originalData.value.remark ||
                        JSON.stringify(currentAttachmentOssIds) !== JSON.stringify(originalAttachmentOssIds);
      
      if (!hasChanged) {
        emit('success');
        return;
      }
    }
    
    const response: any = await api(submitData);
    
    if (response && response.code === 200) {
      const hasWhitePaperInfo = (submitData.paperTitle && submitData.paperTitle.trim()) || 
                                 (submitData.ossVoList && submitData.ossVoList.length > 0) ||
                                 (submitData.remark && submitData.remark.trim());
      
      if (props.type === 'edit' && !hasWhitePaperInfo) {
        ElMessage.success('修改成功');
      } else {
        ElMessage.success(props.type === 'add' ? '维权白皮书发布成功' : '维权白皮书提交成功');
      }
      
      emit('success');
    } else {
      const errorMsg = response?.msg || response?.message || '操作失败，请重试';
      ElMessage.error(errorMsg);
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      if (error?.response?.data?.msg) {
        ElMessage.error(error.response.data.msg);
      } else if (error?.msg) {
        ElMessage.error(error.msg);
      } else {
        ElMessage.error('操作失败，请稍后重试');
      }
    }
  } finally {
    saving.value = false;
  }
};

watch(
  () => [props.id, props.type],
  ([newId, newType]) => {
    if ((newType === 'edit' || newType === 'view') && newId) {
      fetchWhitePaperDetail();
    } else if (newType === 'add') {
      formData.value = {
        id: undefined,
        paperTitle: '',
        remark: '',
        attachment: ''
      };
      attachmentList.value = [];
      formRef.value?.resetFields?.();
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.whitepaper-edit-dialog {
  padding: 20px 0;
}

.form-tip {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}

.attachment-section {
  width: 100%;
  
  :deep(.el-upload__tip) {
    margin-top: 8px;
    
    .upload-tip {
      color: #909399;
      font-size: 12px;
      line-height: 1.5;
    }
  }
}

.attachment-table {
  margin-top: 16px;
  width: 100%;
  
  :deep(.el-table__header) {
    background-color: #fafafa;
    
    th {
      background-color: #fafafa !important;
      color: #606266;
      font-weight: 600;
    }
  }
  
  .version-tip {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1.5;
    margin-top: 4px;
  }
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  gap: 12px;
  
  .el-button {
    min-width: 100px;
  }
}

@media (max-width: 768px) {
  .form-actions {
    .el-button {
      width: 100%;
    }
  }
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

.attachment-info-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .el-icon {
      font-size: 18px;
      color: #606266;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .file-icon {
    font-size: 24px;
    color: #409eff;
  }
  
  :deep(.el-table) {
    .el-table__header {
      th {
        background-color: #fafafa;
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
}

.history-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .el-icon {
      font-size: 18px;
      color: #606266;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  :deep(.el-table) {
    .el-table__header {
      th {
        background-color: #fafafa;
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
}

:deep(.el-button--link) {
  padding: 0;
  font-size: 14px;
}
</style>
