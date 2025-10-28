<!--
  标题: editWhitePaper.vue
  功能: 编辑维权白皮书
  说明: 用于编辑维权白皮书，包括表单填写和提交
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="edit-white-paper">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>编辑维权白皮书</h2>
      </div>

      <!-- 表单内容 -->
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="130px">
        <!-- 维权白皮书标题 -->
        <el-form-item label="*维权白皮书标题" prop="title" required>
          <el-input 
            v-model="formData.title" 
            placeholder="请输入标题内容" 
            maxlength="30"
            show-word-limit
          />
          <div class="form-tip error-tip">请输入标题内容,最多支持30个汉字</div>
        </el-form-item>

        <!-- 上传文件 -->
        <el-form-item label="*上传文件" prop="attachments" required>
          <div class="attachment-container">
            <el-button type="primary" @click="handleAddAttachment">
              <el-icon><Plus /></el-icon>
              添加附件
            </el-button>
            
            <!-- 附件列表表格 -->
            <div class="attachment-table" v-if="fileList.length > 0">
              <el-table :data="fileList" border style="width: 100%; margin-top: 16px;">
                <el-table-column type="index" label="序号" width="80" align="center" />
                <el-table-column label="附件类型" prop="type" width="120" align="center">
                  <template #default="scope">
                    <el-tag :type="getFileTypeTag(scope.row.type)">
                      {{ scope.row.type }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="附件名称" prop="name" min-width="200" />
                <el-table-column label="附件大小" prop="size" width="120" align="center">
                  <template #default="scope">
                    {{ formatFileSize(scope.row.size) }}
                  </template>
                </el-table-column>
                <el-table-column label="版本号" width="200" align="center">
                  <template #default="scope">
                    <el-input 
                      v-model="scope.row.version" 
                      placeholder="请输入版本号"
                      size="small"
                    />
                    <div class="form-tip error-tip">请输入版本号</div>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="center">
                  <template #default="scope">
                    <el-button type="primary" size="small" @click="handleReupload(scope.$index)">重新上传</el-button>
                    <el-button type="danger" size="small" @click="handleRemoveFile(scope.$index)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </el-form-item>

        <!-- 备注 -->
        <el-form-item label="备注">
          <el-input 
            v-model="formData.remarks" 
            type="textarea" 
            :rows="4" 
            placeholder="请输入备注信息(200字以内)"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <div class="submit-section">
          <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting">
            <el-icon><Check /></el-icon>
            提交
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 附件区域 -->
    <div class="attachments-section">
      <div class="section-header">
        <el-icon><Paperclip /></el-icon>
        <h3>附件</h3>
      </div>
      
      <div class="attachments-table">
        <el-table :data="existingAttachments" border style="width: 100%">
          <el-table-column label="附件类型" width="120" align="center">
            <template #default="scope">
              <div class="file-type-icon">
                <el-icon><Document /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="附件名称" prop="name" min-width="200" />
          <el-table-column label="版本号" prop="version" width="120" align="center" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleDownload(scope.row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 历史版本区域 -->
    <div class="history-section">
      <div class="section-header">
        <h3>历史版本</h3>
      </div>
      
      <div class="history-table">
        <el-table :data="historyVersions" border style="width: 100%">
          <el-table-column label="修改时间" prop="modifyTime" width="180" align="center" />
          <el-table-column label="历史版本" prop="version" width="120" align="center" />
          <el-table-column label="备注" prop="remarks" min-width="200" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" size="small" @click="handleDownloadHistory(scope.row)">下载</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Plus, Check, Paperclip } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const { id } = route.query;

// 表单数据
const formData = reactive({
  id: '',
  title: '',
  remarks: ''
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入维权白皮书标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  attachments: [
    { required: true, message: '请上传至少一个附件', trigger: 'change' }
  ]
};

// 表单引用
const formRef = ref();
// 提交状态
const submitting = ref(false);
// 文件列表
const fileList = ref([]);

// 现有附件
const existingAttachments = ref([
  {
    name: '维权白皮书1.0版本.pdf',
    version: '1.0',
    url: '/files/white-paper-1.0.pdf'
  }
]);

// 历史版本
const historyVersions = ref([
  {
    modifyTime: '2019-3-23 12:34:34',
    version: '1.12',
    remarks: '格式调整',
    url: '/files/white-paper-1.12.pdf'
  },
  {
    modifyTime: '2019-3-23 12:34:34',
    version: '1.11',
    remarks: '更新标签',
    url: '/files/white-paper-1.11.pdf'
  },
  {
    modifyTime: '2019-3-23 12:34:34',
    version: '1.10',
    remarks: '更新标签',
    url: '/files/white-paper-1.10.pdf'
  },
  {
    modifyTime: '2019-3-23 12:34:34',
    version: '1.09',
    remarks: '知识发布',
    url: '/files/white-paper-1.09.pdf'
  }
]);

/** 获取白皮书详情 */
const getWhitePaperDetail = async () => {
  if (!id) return;
  
  try {
    // TODO: 调用获取详情接口
    // const response = await getWhitePaperDetail(id);
    
    // 模拟数据
    const mockData = {
      id: id,
      title: '种子维权白皮书',
      remarks: '这是种子维权相关的白皮书，包含了详细的维权指南和案例分析。'
    };
    
    Object.assign(formData, mockData);
  } catch (error) {
    ElMessage.error('获取白皮书详情失败');
  }
};

/** 提交操作 */
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    // 验证附件版本号
    const hasEmptyVersion = fileList.value.some(file => !file.version);
    if (hasEmptyVersion) {
      ElMessage.error('请为所有附件填写版本号');
      return;
    }
    
    submitting.value = true;
    
    // TODO: 调用提交接口
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟API调用
    
    ElMessage.success('提交成功');
    router.push('/expertServicePlatform/legalServiceManage/whitePaperManage');
  } catch (error) {
    ElMessage.error('提交失败，请检查表单信息');
  } finally {
    submitting.value = false;
  }
};

/** 添加附件 */
const handleAddAttachment = () => {
  // 创建文件输入元素
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
  
  input.onchange = (e: any) => {
    const files = Array.from(e.target.files);
    files.forEach((file: any) => {
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error(`文件 ${file.name} 超过 10MB 限制`);
        return;
      }
      
      const fileType = getFileType(file.name);
      fileList.value.push({
        name: file.name,
        type: fileType,
        size: file.size,
        version: '',
        file: file
      });
    });
    
    if (files.length > 0) {
      ElMessage.success(`成功添加 ${files.length} 个附件`);
    }
  };
  
  input.click();
};

/** 重新上传 */
const handleReupload = (index: number) => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png';
  
  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error(`文件 ${file.name} 超过 10MB 限制`);
        return;
      }
      
      const fileType = getFileType(file.name);
      fileList.value[index] = {
        name: file.name,
        type: fileType,
        size: file.size,
        version: fileList.value[index].version, // 保持原版本号
        file: file
      };
      
      ElMessage.success('重新上传成功');
    }
  };
  
  input.click();
};

/** 删除文件 */
const handleRemoveFile = (index: number) => {
  fileList.value.splice(index, 1);
  ElMessage.success('附件删除成功');
};

/** 下载附件 */
const handleDownload = (attachment: any) => {
  ElMessage.success(`开始下载：${attachment.name}`);
  // TODO: 实现文件下载逻辑
};

/** 下载历史版本 */
const handleDownloadHistory = (version: any) => {
  ElMessage.success(`开始下载历史版本：${version.version}`);
  // TODO: 实现文件下载逻辑
};

/** 获取文件类型 */
const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const typeMap: { [key: string]: string } = {
    'pdf': '文档',
    'doc': '文档',
    'docx': '文档',
    'txt': '文档',
    'jpg': '图片',
    'jpeg': '图片',
    'png': '图片'
  };
  return typeMap[extension || ''] || '其他';
};

/** 获取文件类型标签 */
const getFileTypeTag = (type: string): 'success' | 'primary' | 'warning' | 'info' => {
  const tagMap: { [key: string]: 'success' | 'primary' | 'warning' | 'info' } = {
    '图片': 'success',
    '文档': 'primary',
    '其他': 'info'
  };
  return tagMap[type] || 'info';
};

/** 格式化文件大小 */
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

// 页面加载时获取详情
onMounted(() => {
  getWhitePaperDetail();
});
</script>

<style scoped lang="scss">
.edit-white-paper {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

// 主要内容区域 - 大盒子
.main-content-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

// 页面标题
.page-header {
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  
  h2 {
    margin: 0;
    color: #303133;
    font-size: 20px;
    font-weight: 600;
  }
}

// 表单提示文字
.form-tip {
  font-size: 12px;
  margin-top: 4px;
  line-height: 1.4;
  
  &.error-tip {
    color: #f56c6c;
  }
}

// 附件容器
.attachment-container {
  .attachment-table {
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
  }
}

// 提交按钮区域
.submit-section {
  text-align: left;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  
  .el-button {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
  }
}

// 附件区域
.attachments-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    
    .el-icon {
      color: #409eff;
      font-size: 18px;
    }
    
    h3 {
      margin: 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .attachments-table {
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
    
    .file-type-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      
      .el-icon {
        color: #409eff;
        font-size: 20px;
      }
    }
  }
}

// 历史版本区域
.history-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  
  .section-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    
    h3 {
      margin: 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .history-table {
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
  }
}

// 响应式设计
@media (max-width: 768px) {
  .edit-white-paper {
    padding: 16px;
  }
  
  .main-content-box,
  .attachments-section,
  .history-section {
    padding: 16px;
  }
  
  .submit-section {
    text-align: center;
    
    .el-button {
      width: 100%;
    }
  }
}

// 表单验证样式优化
:deep(.el-form-item) {
  .el-form-item__label {
    font-weight: 500;
    color: #606266;
  }
  
  &.is-required .el-form-item__label::before {
    color: #f56c6c;
  }
}

// 输入框样式优化
:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  border-radius: 4px;
  
  &:focus {
    border-color: #409eff;
  }
}

// 表格内输入框样式
:deep(.el-table) {
  .el-input {
    .el-input__inner {
      border: 1px solid #dcdfe6;
      font-size: 12px;
      padding: 4px 8px;
      height: 28px;
      
      &:focus {
        border-color: #409eff;
      }
    }
  }
}
</style>
