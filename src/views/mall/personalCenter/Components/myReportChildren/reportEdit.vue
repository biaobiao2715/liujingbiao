<!--
        标题: myReport.vue
        功能: 举报内容编辑弹窗
        说明: 用于编辑已驳回和已撤回的举报内容。
        当前版本: 1.0
        开发信息: Created by 邓和杰 2025-11-06
    -->
<template>
  <el-dialog v-model="dialogVisible" title="编辑举报信息" width="60%" :before-close="handleCancel" @close="handleCancel">
    <div class="edit-header">
      <p class="status-info" v-if="statusLabel">状态：{{ statusLabel }}</p>
    </div>

    <div v-if="reportData">
      <el-form ref="formRef" :model="formData" :rules="formRules" :label-width="100" :inline="false" class="report-form">
        <el-row>
          <el-col :span="12">
            <el-form-item label="举报编号">
              <el-input v-model="formData.reportCode" disabled readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="举报类别" required prop="reportTypeId">
              <el-select v-model="formData.reportTypeId" placeholder="请选择举报类别" style="width: 100%">
                <el-option v-for="type in reportTypeOptions" :key="type.value" :label="type.label" :value="type.value"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="被举报方">
              <el-input v-model="formData.reportPersonName" disabled readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="举报商品">
              <el-input v-model="formData.reportGoodsName" disabled readonly />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item label="举报描述" required prop="reportDescription">
              <el-input v-model="formData.reportDescription" type="textarea" :rows="4" placeholder="请输入举报描述，最大长度为300个字" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="*举报材料">
          <div class="file-list-section">
            <el-upload
              class="upload-demo"
              action=""
              :auto-upload="false"
              :on-change="handleFileChange"
              :before-upload="beforeFileUpload"
              accept="image/*,video/*"
            >
              <el-button type="primary">
                <el-icon><Plus /></el-icon>
                上传文件
              </el-button>
            </el-upload>
            <el-table :data="fileList" style="width: 100%; margin-bottom: 20px">
              <el-table-column prop="index" label="序号" width="80">
                <template #default="{ $index }">
                  {{ $index + 1 }}
                </template>
              </el-table-column>
              <el-table-column prop="type" label="附件类型" width="120">
                <template #default="{ row }">
                  {{ row.fileType === '1' ? '视频' : '图片' }}
                </template>
              </el-table-column>
              <el-table-column prop="name" label="附件名称" min-width="200">
                <template #default="{ row }">
                  {{ row.originalName }}
                </template>
              </el-table-column>
              <el-table-column prop="size" label="附件大小" width="120">
                <template #default="{ row }">
                  {{ formatFileSize(row.fileSize || row.size || 0) }}
                </template>
              </el-table-column>
              <el-table-column prop="action" label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button link type="danger" size="small" @click="handleFileRemove(row, fileList)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-form-item>
      </el-form>
    </div>
    <div v-else class="loading">加载中...</div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
        <el-button @click="handleCancel">取消</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, defineExpose, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { resubmitReportList, resubmitReportAll } from '@/api/mall/personalCenter/myReport';
import { ossUploadImage } from '@/api/supplier/productManagement/product';

// 定义props和emits
const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'submit-success': [];
}>();

// 控制弹窗显示状态 - 确保关闭时同步状态
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:modelValue', value);
  }
});

// 状态和数据
const status = ref('');
const currentReportId = ref<string | number | null>(null);
const reportData = ref<any>(null);
const fileList = ref<any[]>([]);
const formRef = ref<any>(null);
const uploadingFiles = ref<any[]>([]); // 用于存储待上传的文件
const formRules = {
  reportTypeId: [{ required: true, message: '请选择举报类别', trigger: 'change' }],
  reportDescription: [{ required: true, message: '请输入举报描述', trigger: 'blur' }]
};

// 监听弹窗显示状态，当弹窗打开时检查是否有初始化数据
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      if (!reportData.value || !currentReportId.value) {
        console.warn('reportEdit：弹窗打开但没有初始化数据，请检查 handleReSubmit 是否调用 initData');
        ElMessage.warning('举报数据未加载，请重新打开');
      }
    } else {
      resetForm();
    }
  }
);

function resetForm() {
  reportData.value = null;
  currentReportId.value = null;
  formData.reportCode = '';
  formData.reportTypeId = '';
  formData.reportPersonName = '';
  formData.reportGoodsName = '';
  formData.reportDescription = '';
  fileList.value = [];
  uploadingFiles.value = [];
  formRef.value?.clearValidate();
}

// 举报类别选项数组
const reportTypeOptions = [
  { value: 1, label: '假种子销售' },
  { value: 2, label: '品种权侵权' },
  { value: 3, label: '虚假宣传' },
  { value: 4, label: '无证生产经营' },
  { value: 5, label: '其他' }
];

const statusLabelMap: Record<string, string> = {
  '0': '待处理',
  '1': '处理中',
  '2': '已驳回',
  '3': '已结案',
  '4': '已撤回'
};
const statusLabel = computed(() => {
  if (!status.value) return '';
  return statusLabelMap[status.value] || status.value;
});

// 表单数据
const formData = reactive({
  reportCode: '',
  reportTypeId: '',
  reportPersonName: '',
  reportGoodsName: '',
  reportDescription: '',
  files: []
});

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (typeof bytes === 'string') {
    return bytes;
  }
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 初始化数据的方法，供父组件调用
const initData = async (data: { reportCode: string; status: string; reportData: any }) => {
  status.value = data.status || '';

  try {
    reportData.value = data.reportData;
    currentReportId.value = reportData.value?.id ?? null;
    // 根据reportData初始化表单数据
    formData.reportCode = reportData.value.reportCode || '';
    formData.reportTypeId = reportData.value.reportTypeId ?? '';
    formData.reportPersonName = reportData.value.reportPersonName || '';
    formData.reportGoodsName = reportData.value.reportGoodsName || reportData.value.reportGoods || '';
    formData.reportDescription = reportData.value.reportDescription || '';
    await loadReportMaterials(currentReportId.value);
  } catch (error) {
    console.error('初始化数据失败:', error);
    ElMessage.error('数据加载失败');
  }
};

const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv'];
const isVideoFile = (type?: string, name?: string) => {
  const lowerType = type?.toLowerCase() || '';
  if (lowerType.includes('video')) return true;
  if (type === '1' || type === 1 || lowerType === 'video') return true;
  const ext = name?.split('.').pop()?.toLowerCase();
  if (ext && videoExtensions.includes(ext)) return true;
  return false;
};

const loadReportMaterials = async (reportId: string | number | null) => {
  fileList.value = [];
  uploadingFiles.value = [];
  if (!reportId) return;
  try {
    const res = await resubmitReportList(reportId);
    const materials = res.data?.reportFiles || res.data?.ossInfoList || res.data?.files || [];
    if (Array.isArray(materials)) {
      const normalized = materials.map((file: any) => {
        const name = file.ossInfo?.originalName || file.originalName || file.name;
        const type = file.fileType;
        const isVideo = isVideoFile(type, name);
        return {
          uid: file.ossInfo?.ossId || file.id || `${Date.now()}-${Math.random()}`,
          id: file.ossInfo?.ossId || file.id,
          originalName: name,
          url: file.ossInfo?.url || file.url,
          fileType: isVideo ? '1' : '0',
          fileSize: file.fileSize,
          status: 'success'
        };
      });
      fileList.value = normalized;
      uploadingFiles.value = [...normalized];
    }
  } catch (error) {
    console.error('举报材料加载失败:', error);
    ElMessage.error('举报材料加载失败');
  }
};

// 文件变更处理
const handleFileChange = async (file: any, elFileList: any[]) => {
  // 如果是新添加的文件，上传到服务器
  if (file.status === 'ready') {
    // 检查文件大小限制
    const fileSize = file.raw?.size || file.size || 0;
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    const maxVideoSize = 200 * 1024 * 1024; // 200MB

    if (file.type?.startsWith('image/') && fileSize > maxImageSize) {
      ElMessage.error('图片大小不能超过10MB');
      // 从列表中移除超出限制的文件
      const index = elFileList.findIndex((f: any) => f.uid === file.uid);
      if (index > -1) {
        elFileList.splice(index, 1);
      }
      return;
    }

    if (file.type?.startsWith('video/') && fileSize > maxVideoSize) {
      ElMessage.error('视频大小不能超过200MB');
      // 从列表中移除超出限制的文件
      const index = elFileList.findIndex((f: any) => f.uid === file.uid);
      if (index > -1) {
        elFileList.splice(index, 1);
      }
      return;
    }

    // 检查文件数量限制，如果达到上限则覆盖第一个文件
    // 基于实际文件列表检查数量
    const currentImageCount = fileList.value.filter((f: any) => {
      const fileType = f.fileType || (f.type?.startsWith('image/') ? '0' : '1');
      return fileType === '0';
    }).length;
    const currentVideoCount = fileList.value.filter((f: any) => {
      const fileType = f.fileType || (f.type?.startsWith('video/') ? '1' : '0');
      return fileType === '1';
    }).length;

    if (file.type?.startsWith('image/') && currentImageCount >= 6) {
      // 找到第一个图片并删除（覆盖）
      const firstImage = fileList.value.find((f: any) => {
        const fileType = f.fileType || (f.type?.startsWith('image/') ? '0' : '1');
        return fileType === '0';
      });
      if (firstImage) {
        handleFileRemove(firstImage);
        // 同时从 elFileList 中移除
        const elIndex = elFileList.findIndex((f: any) => {
          const identifier = firstImage.uid || firstImage.id;
          return (f.uid || f.id) === identifier;
        });
        if (elIndex > -1) {
          elFileList.splice(elIndex, 1);
        }
      }
    }

    if (file.type?.startsWith('video/') && currentVideoCount >= 3) {
      // 找到第一个视频并删除（覆盖）
      const firstVideo = fileList.value.find((f: any) => {
        const fileType = f.fileType || (f.type?.startsWith('video/') ? '1' : '0');
        return fileType === '1';
      });
      if (firstVideo) {
        handleFileRemove(firstVideo);
        // 同时从 elFileList 中移除
        const elIndex = elFileList.findIndex((f: any) => {
          const identifier = firstVideo.uid || firstVideo.id;
          return (f.uid || f.id) === identifier;
        });
        if (elIndex > -1) {
          elFileList.splice(elIndex, 1);
        }
      }
    }
    // 调用上传接口
    try {
      const rawFile = file.raw || file.file;
      const response = await ossUploadImage({ file: rawFile });
      const data = response.data || {};
      const isVideo = rawFile?.type?.startsWith('video/') || isVideoFile(data.fileType, data.originalName || data.fileName || file.name);
      const uploaded = {
        uid: file.uid || `${Date.now()}-${Math.random()}`,
        id: data.ossId || file.id,
        originalName: data.originalName || data.fileName || file.name,
        url: data.url,
        fileType: isVideo ? '1' : '0',
        fileSize: data.fileSize || rawFile?.size || 0,
        status: 'success'
      };
      const idx = fileList.value.findIndex((item) => item.uid === uploaded.uid);
      if (idx > -1) {
        fileList.value[idx] = uploaded;
      } else {
        fileList.value.push(uploaded);
      }
      const uIdx = uploadingFiles.value.findIndex((item) => item.uid === uploaded.uid);
      if (uIdx > -1) {
        uploadingFiles.value[uIdx] = uploaded;
      } else {
        uploadingFiles.value.push(uploaded);
      }
      ElMessage.success('文件上传成功');
    } catch (error) {
      console.error('文件上传失败:', error);
      ElMessage.error('文件上传失败');
      // 从列表中移除上传失败的文件
      const index = elFileList.findIndex((f: any) => f.uid === file.uid);
      if (index > -1) {
        elFileList.splice(index, 1);
      }
    }
  }
};

// 上传前检查
const beforeFileUpload = (file: any) => {
  // 检查文件类型
  const isImage = file.type?.startsWith('image/');
  const isVideo = file.type?.startsWith('video/');
  if (!isImage && !isVideo) {
    ElMessage.error('只能上传图片或视频文件！');
    return false;
  }
  // 根据文件类型设置不同的大小限制
  if (isImage) {
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxImageSize) {
      ElMessage.error('图片大小不能超过10MB！');
      return false;
    }
  } else if (isVideo) {
    const maxVideoSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxVideoSize) {
      ElMessage.error('视频大小不能超过200MB！');
      return false;
    }
  }
  return true;
};

// 删除文件
const handleFileRemove = (file: any, list?: any[]) => {
  const targetList = list || fileList.value;
  const identifier = file.uid || file.id;
  // 从fileList中移除文件
  const index = targetList.findIndex((f: any) => (f.uid || f.id) === identifier);
  if (index > -1) {
    targetList.splice(index, 1);
  }
  // 从uploadingFiles中移除文件
  const uploadIndex = uploadingFiles.value.findIndex((f) => (f.uid || f.id) === identifier);
  if (uploadIndex > -1) {
    uploadingFiles.value.splice(uploadIndex, 1);
  }
  // 如果文件已上传到服务器，可以在这里调用删除接口
  if (file.status === 'success' && file.id) {
    // 调用删除接口
    console.log('删除服务器文件:', file.id);
  }
  ElMessage.success('文件已删除');
};

// 提交表单
const handleSubmit = async () => {
  // 表单验证
  if (!formRef.value) {
    ElMessage.error('表单未初始化');
    return;
  }
  try {
    await formRef.value.validate();
    const submitData = {
      id: currentReportId.value,
      reportCode: formData.reportCode,
      reportTypeId: formData.reportTypeId,
      reportDescription: formData.reportDescription,
      ossList: uploadingFiles.value.map((file) => ({
        ossId: file.id,
        fileName: file.originalName || file.name,
        fileType: file.fileType || file.type || '0'
      }))
    };
    await resubmitReportAll(submitData);
    ElMessage.success('提交成功');
    // 提交成功后关闭弹窗
    dialogVisible.value = false;
    // 通知父组件提交成功
    emit('submit-success');
  } catch (error) {
    console.error('表单验证失败或提交失败:', error);
    ElMessage.error('提交失败，请检查表单信息');
  }
};

// 取消操作 - 确保状态同步
const handleCancel = () => {
  // 直接更新 modelValue，computed 会自动处理
  emit('update:modelValue', false);
  resetForm();
};

// 暴露方法给父组件
defineExpose({
  initData,
  dialogVisible
});
</script>

<style scoped>
.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.report-edit {
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  min-height: 600px;
}

.edit-header {
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e0e0e0;
}

.edit-header h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: bold;
}

.status-info {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.report-content {
  max-width: 800px;
}

.report-info {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 25px;
}

.info-item {
  display: flex;
  margin-bottom: 10px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.label {
  width: 100px;
  color: #606266;
  font-weight: 500;
}

.value {
  color: #303133;
}

.edit-form {
  margin-bottom: 30px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.loading {
  text-align: center;
  padding: 50px;
  color: #606266;
}

/* 文件上传相关样式 */
.file-list-section {
  margin-bottom: 20px;
}

.file-name {
  max-width: 200px;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.upload-tips {
  margin-top: 10px;
  font-size: 12px;
  color: #909399;
}

/* 上传组件样式调整 */
.el-upload--picture-card {
  width: 120px;
  height: 120px;
  line-height: 118px;
}

/* 确保表格在小屏幕上也能正常显示 */
@media (max-width: 768px) {
  .file-name {
    max-width: 100px;
  }
  .el-upload--picture-card {
    width: 100px;
    height: 100px;
    line-height: 98px;
  }
}
</style>
