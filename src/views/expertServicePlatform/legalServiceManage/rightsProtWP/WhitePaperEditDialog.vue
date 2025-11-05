<!--
  标题: WhitePaperEditDialog.vue
  功能: 维权白皮书新增/编辑弹窗
  说明: 用于新增和编辑维权白皮书
  当前版本: 1.0
-->
<template>
  <div class="whitepaper-edit-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px">
      <!-- 维权白皮书标题 -->
      <el-form-item label="维权白皮书标题" prop="paperTitle" required>
        <el-input 
          v-model="formData.paperTitle" 
          placeholder="请输入标题内容" 
          maxlength="30"
          clearable
        />
        <div class="form-tip">请输入标题内容，最多支持30个汉字</div>
      </el-form-item>

      <!-- 上传附件 -->
      <el-form-item label="上传附件" prop="attachment" required>
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
            <el-button type="primary" plain>
              <el-icon class="el-icon--left"><Upload /></el-icon>
              添加附件
            </el-button>
            <template #tip>
              <div class="upload-tip">支持格式：PDF、Word、Excel、PPT、TXT，单个文件最大100MB，最多上传10个文件</div>
            </template>
          </el-upload>
        </div>
      </el-form-item>

      <!-- 附件列表 -->
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
              <el-button type="primary" link size="small" @click="handleReplaceFile(scope.row)">
                重新上传
              </el-button>
              <el-button type="danger" link size="small" @click="handleRemoveFile(scope.row)">
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>

      <!-- 备注 -->
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

      <!-- 表单操作按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '发布' : '保存' }}
        </el-button>
        <el-button @click="emitCancel">取消</el-button>
      </div>
    </el-form>

    <!-- 附件部分（仅编辑模式显示） -->
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
        <el-table-column label="附件名称" prop="originalName" :show-overflow-tooltip="true" min-width="200" />
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

    <!-- 历史版本部分（仅编辑模式显示） -->
    <div v-if="props.type === 'edit' && historyVersions.length > 0" class="history-section">
      <div class="section-header">
        <el-icon><FolderOpened /></el-icon>
        <span class="section-title">历史版本</span>
      </div>
      <el-table :data="historyVersions" border style="width: 100%">
        <el-table-column label="修改时间" prop="updateTime" width="180" align="center" />
        <el-table-column label="历史版本" prop="version" width="120" align="center" />
        <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="200" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleDownloadHistory(scope.row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, getCurrentInstance, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, View, Delete, Document, Paperclip, FolderOpened } from '@element-plus/icons-vue';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
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

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 加载状态
const loading = ref(false);

// 表单数据
const formData = ref({
  id: undefined as number | string | undefined,
  paperTitle: '',
  remark: '',
  attachment: '' // 用于表单验证的虚拟字段
});

  // 附件列表（用于编辑的表单）
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

// 当前附件列表（已发布的附件，仅编辑模式显示）
const detailData = ref({
  ossVoList: [] as any[],
  historyVersionsList: [] as any[],
  updateTime: '',
  currentVersion: '',
  paperStatus: ''  // 保存原有的状态，用于编辑时保持状态
});

// 当前附件列表（计算属性）
const currentAttachments = computed(() => {
  if (!detailData.value.ossVoList || !Array.isArray(detailData.value.ossVoList)) {
    return [];
  }
  return detailData.value.ossVoList.map((item: any) => ({
    ossId: item.ossId,
    originalName: item.originalName || item.fileName || '',
    version: item.version || detailData.value.currentVersion || '',
    url: item.url || '',
    fileSuffix: item.fileSuffix || ''
  }));
});

// 历史版本列表（计算属性）
const historyVersions = computed(() => {
  if (!detailData.value.historyVersionsList || !Array.isArray(detailData.value.historyVersionsList)) {
    return [];
  }
  return detailData.value.historyVersionsList.map((item: any) => ({
    ...item,
    updateTime: item.updateTime || item.createTime || '',
    version: item.versionNo || item.version || '', // 使用 versionNo（API文档中的字段名）
    remark: item.remark || '',
    ossId: item.ossId,
    url: item.url || ''
  }));
});

// 表单验证规则
const rules = {
  paperTitle: [
    { required: true, message: '请输入标题内容，最多支持30个汉字', trigger: 'blur' },
    { min: 1, max: 30, message: '标题长度在 1 到 30 个字符', trigger: 'blur' }
  ],
  attachment: [
    {
      validator: (_rule: any, _value: any, callback: any) => {
        if (attachmentList.value.length === 0) {
          callback(new Error('请上传一个附件'));
        } else {
          callback();
        }
      },
      trigger: ['change', 'blur']
    }
  ]
};

/** 格式化文件大小 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

/** 获取文件类型显示名称 */
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

/** 文件验证 */
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

/** 文件个数超出限制 */
const handleExceed = () => {
  ElMessage.warning('最多只能上传10个附件');
};

// 上传状态标记，防止重复上传
const uploadingFiles = ref<Set<string>>(new Set());

/** 处理文件上传 */
const handleFileChange = async (file: any, fileList: any) => {
  // 确保 file 对象存在
  if (!file) {
    ElMessage.error('文件对象不存在');
    return;
  }
  
  // 获取实际文件对象（el-upload 可能返回 file 或 file.raw）
  const rawFile = file.raw || file;
  
  if (!rawFile) {
    ElMessage.error('无法获取文件对象');
    return;
  }
  
  // 生成文件唯一标识，防止重复上传
  const fileKey = `${rawFile.name}_${rawFile.size}_${rawFile.lastModified}`;
  
  // 检查是否正在上传
  if (uploadingFiles.value.has(fileKey)) {
    return;
  }
  
  // 检查是否已经上传过（根据文件名和大小判断）
  const isDuplicate = attachmentList.value.some(
    item => item.originalName === rawFile.name && item.fileSize === formatFileSize(rawFile.size)
  );
  if (isDuplicate) {
    ElMessage.warning('该文件已上传，请勿重复上传');
    return;
  }
  
  // 验证文件
  if (!validateFile(rawFile)) {
    return;
  }
  
  // 检查是否超过限制
  if (attachmentList.value.length >= 10) {
    ElMessage.warning('最多只能上传10个附件');
    return;
  }
  
  // 标记为正在上传
  uploadingFiles.value.add(fileKey);
  
  // 显示加载提示
  if ((proxy as any)?.$modal) {
    (proxy as any).$modal.loading('正在上传附件，请稍候...');
  }
  
  try {
    const response = await ossUploadImage({ file: rawFile });
    
    if (response && response.code === 200 && response.data?.ossId) {
      const ossData = response.data;
      // 从文件名获取后缀
      const fileSuffix = (rawFile.name.split('.').pop() || '').toLowerCase();
      
      // 添加到附件列表
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
      
      // 更新表单数据触发验证
      formData.value.attachment = 'has_attachment';
      // 触发表单验证更新
      formRef.value?.validateField('attachment');
      
      ElMessage.success('附件上传成功');
    } else {
      const errorMsg = (response as any)?.msg || (response as any)?.data?.msg || '上传失败，请重试';
      ElMessage.error(errorMsg);
      console.error('上传失败:', response);
    }
  } catch (error: any) {
    console.error('上传附件异常:', error);
    const errorMsg = error?.message || error?.msg || error?.response?.data?.msg || '上传失败，请重试';
    ElMessage.error(errorMsg);
  } finally {
    // 移除上传标记
    uploadingFiles.value.delete(fileKey);
    // 关闭加载提示
    if ((proxy as any)?.$modal) {
      (proxy as any).$modal.closeLoading();
    }
  }
};

/** 替换文件 */
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
        
        // 更新附件信息
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

/** 验证版本号格式 */
const validateVersion = (row: any) => {
  if (!row.version) {
    row.versionError = '';
    return;
  }
  
  // 验证是否为数字类型（支持小数，如 1.0）
  const versionPattern = /^\d+(\.\d+)?$/;
  if (!versionPattern.test(row.version)) {
    row.versionError = '版本号只能输入数字，例如：1.0';
  } else {
    row.versionError = '';
  }
};

/** 预览文件 */
const handlePreviewFile = (file: any) => {
  if (file.url) {
    window.open(file.url, '_blank');
  } else {
    ElMessage.warning('文件链接不存在');
  }
};

/** 删除附件 */
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
        // 更新表单数据触发验证
        formData.value.attachment = attachmentList.value.length > 0 ? 'has_attachment' : '';
        // 触发表单验证更新
        formRef.value?.validateField('attachment');
        ElMessage.success('附件删除成功');
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

/** 下载附件（附件部分） */
const handleDownloadAttachment = (file: any) => {
  if (file.ossId) {
    // 使用OSS下载接口
    (proxy as any)?.$download?.oss(file.ossId);
  } else if (file.url) {
    // 备用方案：直接打开URL
    window.open(file.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

/** 下载历史版本 */
const handleDownloadHistory = (version: any) => {
  if (version.ossId) {
    // 使用OSS下载接口
    (proxy as any)?.$download?.oss(version.ossId);
  } else if (version.url) {
    // 备用方案：直接打开URL
    window.open(version.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

/** 获取白皮书详情 */
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
      
      // 将接口返回的数据赋值给表单
    formData.value = {
        id: data.id,
        paperTitle: data.paperTitle || '',
        remark: data.remark || '',
        attachment: data.ossVoList && data.ossVoList.length > 0 ? 'has_attachment' : ''
      };
      
      // 保存详情数据（用于显示附件和历史版本）
      detailData.value = {
        ossVoList: data.ossVoList || [],
        historyVersionsList: data.historyVersionsList || [],
        updateTime: data.updateTime || data.createTime || '',
        currentVersion: data.currentVersion || '',
        paperStatus: data.paperStatus || '1'  // 保存原有状态，如果没有则默认为启用
      };
      
      // 加载附件数据（用于编辑）
      if (data.ossVoList && Array.isArray(data.ossVoList) && data.ossVoList.length > 0) {
        attachmentList.value = data.ossVoList.map((item: any, index: number) => ({
          ossId: item.ossId,
          fileName: item.fileName || item.originalName,
          originalName: item.originalName || item.fileName,
          fileType: getFileTypeName(item.fileSuffix || ''),
          fileSuffix: item.fileSuffix || '',
          url: item.url || '',
          fileSize: item.fileSize || '--',
          version: item.version || '',
          versionError: '',
          uid: item.ossId || Date.now() + index
        }));
      } else {
        attachmentList.value = [];
      }
    } else {
      ElMessage.error(response?.msg || '获取白皮书详情失败');
    }
  } catch (error) {
    ElMessage.error('获取白皮书详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 提交表单 */
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    // 验证附件（通过表单验证规则）
    const attachmentValid = await new Promise((resolve) => {
      formRef.value?.validateField('attachment', (valid: boolean) => {
        resolve(valid);
      });
    });
    if (!attachmentValid) {
      return;
    }
    
    // 验证版本号
    const hasEmptyVersion = attachmentList.value.some(item => !item.version || !item.version.trim());
    if (hasEmptyVersion) {
      ElMessage.warning('请为所有附件填写版本号');
      return;
    }
    
    // 验证版本号格式
    const hasInvalidVersion = attachmentList.value.some(item => {
      validateVersion(item);
      return item.versionError;
    });
    if (hasInvalidVersion) {
      ElMessage.warning('请检查版本号格式，版本号只能输入数字（例如：1.0）');
      return;
    }
    
    const confirmMsg = props.type === 'add' 
      ? '确定要发布此维权白皮书吗？发布后用户将可以查看此内容。'
      : '确定要保存并发布此维权白皮书吗？';
    
    await ElMessageBox.confirm(confirmMsg, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    saving.value = true;
    
    // 构建OSS附件列表（按照API文档结构）
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
    
    // 获取当前版本号（从附件列表中取第一个附件的版本号，所有附件版本号应该一致）
    const currentVersion = attachmentList.value.length > 0 
      ? attachmentList.value[0].version 
      : detailData.value.currentVersion || '';
    
    // 获取所属状态：新增时默认为"启用"（1），编辑时保持原有状态或默认为"启用"
    const paperStatus = props.type === 'add' 
      ? '1'  // 新增时默认启用
      : (detailData.value.paperStatus || '1');  // 编辑时保持原有状态，如果没有则默认启用
    
    // 构建提交数据 - 按照实际API期望的数据结构（扁平化结构）
    const submitData: any = {
      createDept: 0,
      createBy: 0,
      createTime: '',
      updateBy: 0,
      updateTime: '',
      params: {
        '': {}
      },
      ...(props.type === 'edit' && formData.value.id ? { id: formData.value.id } : { id: 0 }),
      paperNo: '',
      paperTitle: formData.value.paperTitle?.trim() || '',
      paperType: '',
      paperStatus: paperStatus,  // 默认启用状态
      currentVersion: currentVersion || '',
      remark: formData.value.remark || '',
      sortOrder: 0,
      beginTime: '',
      endTime: '',
      ossVoList: ossVoList,
      ids: [0],
      historyVersionsList: []
    };
    
    // 调试日志：打印提交的数据结构
    console.log('提交数据详情:', {
      type: props.type,
      submitData: submitData,
      ossVoListCount: ossVoList.length
    });
    
    // 调用对应的接口
    // 新增时调用 POST /skill-server/skill/whitePaper
    // 编辑时调用 PUT /skill-server/skill/whitePaper
    const api = props.type === 'add' ? addWhitePaper : editWhitePaper;
    console.log('调用接口:', props.type === 'add' ? '新增' : '编辑', '提交数据:', submitData);
    
    const response: any = await api(submitData);
    
    if (response && response.code === 200) {
      ElMessage.success(props.type === 'add' ? '维权白皮书发布成功' : '维权白皮书修改成功');
      emit('success');
    } else {
      const errorMsg = response?.msg || response?.message || '操作失败，请重试';
      ElMessage.error(errorMsg);
      console.error('接口返回错误:', response);
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      // 处理特定的错误信息
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

/** 取消 */
const emitCancel = () => {
  emit('cancel');
};

// 监听 props.id 变化，确保弹窗打开时加载数据
watch(
  () => [props.id, props.type],
  ([newId, newType]) => {
    if ((newType === 'edit' || newType === 'view') && newId) {
      fetchWhitePaperDetail();
    } else if (newType === 'add') {
      // 新增模式：重置表单
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

// 表单提示文字（红色）
.form-tip {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 4px;
}

// 附件上传区域
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

// 附件表格
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

// 表单操作按钮
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

// 响应式设计
@media (max-width: 768px) {
  .form-actions {
    .el-button {
      width: 100%;
    }
  }
}

// 优化表单布局
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

// 附件信息部分（编辑模式显示）
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

// 历史版本部分
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

// 按钮样式
:deep(.el-button--link) {
  padding: 0;
  font-size: 14px;
}
</style>

