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
      <el-form-item label="上传附件" required>
        <div class="attachment-section">
          <el-upload
            action="#"
            :auto-upload="false"
            accept=".jpg,.jpeg,.png,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-button type="primary">
              <el-icon class="el-icon--left"><Upload /></el-icon>
              添加附件
            </el-button>
          </el-upload>
          <div class="upload-tip">请上传一个附件</div>
        </div>
      </el-form-item>

      <!-- 附件列表 -->
      <el-form-item label="" v-if="attachmentList.length > 0">
        <el-table :data="attachmentList" border class="attachment-table">
          <el-table-column type="index" label="序号" width="80" align="center" />
          <el-table-column label="附件类型" prop="fileType" width="120" align="center">
            <template #default="scope">
              <span>{{ scope.row.fileType }}</span>
            </template>
          </el-table-column>
          <el-table-column label="附件名称" prop="fileName" align="center" :show-overflow-tooltip="true" />
          <el-table-column label="附件大小" prop="fileSize" width="120" align="center" />
          <el-table-column label="版本号" prop="version" width="120" align="center">
            <template #default="scope">
              <el-input 
                v-model="scope.row.version" 
                placeholder="请输入版本号" 
                clearable
                size="small"
              />
              <div v-if="!scope.row.version" class="version-tip">请输入版本号</div>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center">
            <template #default="scope">
              <el-button type="primary" link size="small" @click="handleReplaceFile(scope.row)">
                替换上传
              </el-button>
              <el-button type="danger" link size="small" @click="handleRemoveFile(scope.row)">
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
          发 布
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload } from '@element-plus/icons-vue';
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
  remark: ''
});

// 附件列表
const attachmentList = ref<Array<{
  ossId?: number;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSuffix: string;
  url: string;
  fileSize: string;
  version: string;
  uid?: string;
}>>([]);

// 表单验证规则
const rules = {
  paperTitle: [
    { required: true, message: '请输入白皮书标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度在 2 到 30 个字符', trigger: 'blur' }
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
    'txt': '文本文档',
    'jpg': '图片',
    'jpeg': '图片',
    'png': '图片'
  };
  return typeMap[suffix.toLowerCase()] || '文档';
};

/** 文件变化处理 */
const handleFileChange = async (file: any) => {
  const rawFile = file.raw;
  
  // 验证文件大小（100MB）
  const maxSize = 100 * 1024 * 1024;
  if (rawFile.size > maxSize) {
    ElMessage.error('文件大小不能超过100MB');
    return;
  }
  
  // 验证文件类型
  const allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.txt'];
  const fileName = rawFile.name.toLowerCase();
  const isValidType = allowedTypes.some(type => fileName.endsWith(type));
  if (!isValidType) {
    ElMessage.error('不支持的文件类型');
    return;
  }
  
  try {
    loading.value = true;
    
    // 调用OSS上传接口
    const response: any = await ossUploadImage(rawFile);
    
    if (response && response.code === 200 && response.data) {
      const ossData = response.data;
      const fileSuffix = ossData.originalName.split('.').pop() || '';
      
      // 添加到附件列表
      attachmentList.value.push({
        ossId: ossData.ossId,
        fileName: ossData.fileName,
        originalName: ossData.originalName,
        fileType: getFileTypeName(fileSuffix),
        fileSuffix: fileSuffix,
        url: ossData.url,
        fileSize: formatFileSize(rawFile.size),
        version: '',
        uid: file.uid
      });
      
      ElMessage.success('文件上传成功');
    } else {
      ElMessage.error(response?.msg || '文件上传失败');
    }
  } catch (error) {
    console.error('文件上传失败:', error);
    ElMessage.error('文件上传失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 替换文件 */
const handleReplaceFile = async (row: any) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.jpg,.jpeg,.png,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt';
  
  input.onchange = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // 验证文件大小
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      ElMessage.error('文件大小不能超过100MB');
      return;
    }
    
    try {
      loading.value = true;
      
      // 调用OSS上传接口
      const response: any = await ossUploadImage(file);
      
      if (response && response.code === 200 && response.data) {
        const ossData = response.data;
        const fileSuffix = ossData.originalName.split('.').pop() || '';
        
        // 更新附件信息
        Object.assign(row, {
          ossId: ossData.ossId,
          fileName: ossData.fileName,
          originalName: ossData.originalName,
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
      console.error('文件上传失败:', error);
      ElMessage.error('文件上传失败，请稍后重试');
    } finally {
      loading.value = false;
    }
  };
  
  input.click();
};

/** 删除附件 */
const handleRemoveFile = (row: any) => {
  const index = attachmentList.value.findIndex(item => item.uid === row.uid || item.ossId === row.ossId);
  if (index > -1) {
    attachmentList.value.splice(index, 1);
    ElMessage.success('删除成功');
  }
};

/** 获取白皮书详情 */
const fetchWhitePaperDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    const response: any = await getWhitePaperDetail(props.id);
    
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      
      formData.value = {
        id: data.id,
        paperTitle: data.paperTitle || '',
        remark: data.remark || ''
      };
      
      // 加载附件列表
      if (data.ossVoList && data.ossVoList.length > 0) {
        attachmentList.value = data.ossVoList.map((item: any) => ({
          ossId: item.ossId,
          fileName: item.fileName,
          originalName: item.originalName,
          fileType: getFileTypeName(item.fileSuffix),
          fileSuffix: item.fileSuffix,
          url: item.url,
          fileSize: item.fileSize || '',
          version: item.version || ''
        }));
      }
    } else {
      ElMessage.error(response?.msg || '获取详情失败');
    }
  } catch (error) {
    console.error('获取白皮书详情失败:', error);
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
    
    // 验证附件
    if (attachmentList.value.length === 0) {
      ElMessage.warning('请至少上传一个附件');
      return;
    }
    
    // 验证版本号
    const hasEmptyVersion = attachmentList.value.some(item => !item.version);
    if (hasEmptyVersion) {
      ElMessage.warning('请为所有附件填写版本号');
      return;
    }
    
    const confirmMsg = '确定要发布此维权白皮书吗？发布后用户将可以查看此内容。';
    
    await ElMessageBox.confirm(confirmMsg, '系统提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    
    saving.value = true;
    
    // 构建OSS附件列表
    const ossVoList = attachmentList.value.map(item => ({
      ossId: item.ossId,
      fileName: item.fileName,
      originalName: item.originalName,
      fileSuffix: item.fileSuffix,
      url: item.url,
      version: item.version
    }));
    
    // 构建提交数据
    const submitData: any = {
      paperTitle: formData.value.paperTitle,
      remark: formData.value.remark || '',
      ossVoList: ossVoList
    };
    
    if (props.type === 'edit' && formData.value.id) {
      submitData.id = formData.value.id;
    }
    
    console.log('提交数据:', submitData);
    
    // 调用对应的接口
    const api = props.type === 'add' ? addWhitePaper : editWhitePaper;
    const response: any = await api(submitData);
    
    if (response && response.code === 200) {
      ElMessage.success(props.type === 'add' ? '维权白皮书发布成功' : '维权白皮书修改成功');
      emit('success');
    } else {
      ElMessage.error(response?.msg || '操作失败');
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('操作失败:', error);
      ElMessage.error('操作失败，请稍后重试');
    }
  } finally {
    saving.value = false;
  }
};

// 页面加载时的处理
onMounted(() => {
  if (props.type === 'edit' && props.id) {
    fetchWhitePaperDetail();
  }
});
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
  
  .upload-tip {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1.5;
    margin-top: 8px;
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
    min-width: 120px;
    padding: 12px 30px;
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
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}
</style>

