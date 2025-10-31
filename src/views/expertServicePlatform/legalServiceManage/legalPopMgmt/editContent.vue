<!--
  标题: editContent.vue
  功能: 编辑普法内容
  说明: 用于编辑普法内容，包括表单填写和提交
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="edit-content">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>编辑普法内容</h2>
      </div>

      <!-- 表单内容 -->
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" v-loading="loading">
        <!-- 基础信息区域 -->
        <div class="form-section basic-info">
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="普法标题" prop="title" required>
                <el-input 
                  v-model="formData.title" 
                  placeholder="请输入标题内容" 
                  maxlength="30"
                  show-word-limit
                />
                <div class="form-tip">请输入标题,最多支持30个汉字</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="24">
              <el-form-item label="普法简介" prop="summary" required>
                <el-input 
                  v-model="formData.summary" 
                  type="textarea" 
                  :rows="3" 
                  placeholder="请输入简介"
                  maxlength="60"
                  show-word-limit
                />
                <div class="form-tip">请输入简介,最多支持60个汉字</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="普法类别" prop="contentType" required>
                <el-select v-model="formData.contentType" placeholder="请选择" style="width: 100%">
                  <el-option label="请选择" value="" />
                  <el-option 
                    v-for="item in legal_popularize_type" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="发布状态" prop="status" required>
                <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                  <el-option label="启用" value="3" />
                  <el-option label="禁用" value="2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 正文编辑区域 -->
        <div class="form-section content-editor">
          <el-form-item label="正文编辑" prop="content" required>
            <div class="editor-container">
              <!-- 富文本编辑器工具栏 -->
              <div class="editor-toolbar">
                <div class="toolbar-group">
                  <el-button size="small" icon="EditPen" title="字体大小" />
                  <el-button size="small" icon="Brush" title="字体颜色" />
                  <el-button size="small" icon="Bold" title="加粗" />
                  <el-button size="small" icon="Italic" title="斜体" />
                  <el-button size="small" icon="Underline" title="下划线" />
                </div>
                <div class="toolbar-divider"></div>
                <div class="toolbar-group">
                  <el-button size="small" icon="AlignLeft" title="左对齐" />
                  <el-button size="small" icon="AlignCenter" title="居中" />
                  <el-button size="small" icon="AlignRight" title="右对齐" />
                  <el-button size="small" icon="AlignJustify" title="两端对齐" />
                </div>
                <div class="toolbar-group">
                  <el-button size="small" icon="List" title="无序列表" />
                  <el-button size="small" icon="Menu" title="有序列表" />
                  <el-button size="small" icon="Link" title="插入链接" />
                  <el-button size="small" icon="Picture" title="插入图片" />
                </div>
                <div class="toolbar-group">
                  <el-button size="small" icon="Document" title="一级标题" />
                  <el-button size="small" icon="Code" title="代码" />
                  <el-button size="small" icon="DocumentCopy" title="保存" />
                </div>
                <div class="toolbar-right">
                  <el-button size="small" type="primary" plain>文章目录</el-button>
                </div>
              </div>
              
              <!-- 编辑器主体区域 -->
              <div class="editor-main">
                <div class="editor-content">
                  <el-input 
                    v-model="formData.content" 
                    type="textarea" 
                    :rows="15" 
                    placeholder="请输入文章内容"
                    class="content-textarea"
                  />
                </div>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 附件上传区域 -->
        <div class="form-section attachment-section">
          <el-form-item label="上传附件">
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
        </div>

        <!-- 发布按钮 -->
        <div class="publish-section">
          <el-button type="primary" size="large" @click="handlePublish" :loading="publishing">
            <el-icon><Upload /></el-icon>
            发布
          </el-button>
        </div>

        <!-- 其他操作按钮 -->
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Upload } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  getContentDetail, 
  editContent 
} from '@/api/expertServicePlatform/legalServiceManage/contentManage';

const router = useRouter();
const route = useRoute();
const { id } = route.query;
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_type } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_type')
);

// 加载状态
const loading = ref(false);

// 表单数据 - 使用后端字段名并支持模板别名
const formData = reactive({
  id: 0,
  contentTitle: '',
  contentType: '',
  contentSummary: '',
  contentContent: '',
  contentStatus: '',
  ids: [] as number[],
  // 模板使用的别名(getter/setter)
  get title() { return this.contentTitle; },
  set title(val) { this.contentTitle = val; },
  get summary() { return this.contentSummary; },
  set summary(val) { this.contentSummary = val; },
  get content() { return this.contentContent; },
  set content(val) { this.contentContent = val; },
  get status() { return this.contentStatus; },
  set status(val) { this.contentStatus = val; }
});

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入普法标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择发布状态', trigger: 'change' }
  ],
  summary: [
    { required: true, message: '请输入普法简介', trigger: 'blur' },
    { max: 60, message: '简介最多 60 个汉字', trigger: 'blur' }
  ],
  contentType: [
    { required: true, message: '请选择普法类别', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ]
};

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 发布状态
const publishing = ref(false);
// 文件列表
const fileList = ref<any[]>([]);

/** 获取内容详情 */
const fetchContentDetail = () => {
  if (!id) {
    ElMessage.warning('缺少内容ID');
    return;
  }
  
  loading.value = true;
  
  getContentDetail(Number(id))
    .then((res: any) => {
      // 响应拦截器已处理，res 直接是 res.data，如果成功则 res.code === 200
      if (res && res.code === 200) {
        const data = res.data;
        if (!data) {
          ElMessage.error('获取内容详情失败：数据为空');
          loading.value = false;
          return;
        }
        
        
        const contentId = data.id != null ? Number(data.id) : (id ? Number(id) : 0);
        if (!contentId || contentId === 0) {
          ElMessage.error('内容ID获取失败，请刷新页面重试');
          loading.value = false;
          return;
        }
        formData.id = contentId;
        formData.contentTitle = data.contentTitle ?? '';
        formData.contentType = data.contentType ?? '';
        formData.contentSummary = data.contentSummary ?? '';
        formData.contentContent = data.contentContent ?? '';
        formData.contentStatus = data.contentStatus ?? '';
        
        // 处理附件列表
        if (data.sysOssLists && Array.isArray(data.sysOssLists) && data.sysOssLists.length > 0) {
          fileList.value = data.sysOssLists.map((file: any) => ({
            id: file.ossId,
            name: file.fileName || file.originalName || '未知文件',
            type: getFileTypeFromSuffix(file.fileSuffix),
            size: file.size || 0,
            url: file.url,
            file: null
          }));
          formData.ids = data.sysOssLists.map((file: any) => file.ossId).filter((id: any) => id != null);
        } else {
          fileList.value = [];
          formData.ids = [];
        }
      } else {
        ElMessage.error(res?.msg || '获取内容详情失败');
      }
      loading.value = false;
    })
    .catch((error: any) => {
      console.error('获取内容详情失败:', error);
      ElMessage.error('获取内容详情失败，请稍后重试');
      loading.value = false;
    });
};

/** 取消操作 */
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消吗？未保存的修改将丢失。', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    router.back();
  }).catch(() => {
    // 用户取消
  });
};

/** 保存操作 */
const handleSave = () => {
  if (!formRef.value) return;
  
  formRef.value.validate((valid: boolean) => {
    if (!valid) {
      return;
    }
    
    ElMessageBox.confirm('确定要保存修改吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      // 验证ID是否存在
      if (!formData.id || formData.id === 0) {
        ElMessage.error('内容ID缺失，无法保存');
        return;
      }
      
      saving.value = true;
      
      // 准备提交数据
      const submitData = {
        id: formData.id,
        contentTitle: formData.contentTitle,
        contentType: formData.contentType,
        contentSummary: formData.contentSummary,
        contentContent: formData.contentContent,
        contentStatus: formData.contentStatus,
        ids: formData.ids
      };
      
      editContent(submitData).then(() => {
        ElMessage.success('保存成功');
        router.push('/expertServicePlatform/legalServiceManage/contentManage');
      }).catch(() => {
        ElMessage.error('保存失败，请检查表单信息');
      }).finally(() => {
        saving.value = false;
      });
    }).catch(() => {
      // 用户取消操作
    });
  });
};

/** 发布操作 */
const handlePublish = () => {
  if (!formRef.value) return;
  
  formRef.value.validate((valid: boolean) => {
    if (!valid) {
      return;
    }
    
    ElMessageBox.confirm('确定要发布该内容吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      // 验证ID是否存在
      if (!formData.id || formData.id === 0) {
        ElMessage.error('内容ID缺失，无法发布');
        return;
      }
      
      publishing.value = true;
      
      // 发布时强制设置状态为已启用
      const submitData = {
        id: formData.id,
        contentTitle: formData.contentTitle,
        contentType: formData.contentType,
        contentSummary: formData.contentSummary,
        contentContent: formData.contentContent,
        contentStatus: '3', // 强制为已启用
        ids: formData.ids
      };
      
      editContent(submitData).then(() => {
        ElMessage.success('发布成功');
        router.push('/expertServicePlatform/legalServiceManage/contentManage');
      }).catch(() => {
        ElMessage.error('发布失败，请检查表单信息');
      }).finally(() => {
        publishing.value = false;
      });
    }).catch(() => {
      // 用户取消操作
    });
  });
};

/** 添加附件 */
const handleAddAttachment = () => {
  // 创建文件输入元素
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.avi,.mov';
  
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
  input.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx,.mp4,.avi,.mov';
  
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

/** 获取文件类型 */
const getFileType = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  const typeMap: { [key: string]: string } = {
    'jpg': '图片',
    'jpeg': '图片',
    'png': '图片',
    'pdf': '文档',
    'doc': '文档',
    'docx': '文档',
    'mp4': '视频',
    'avi': '视频',
    'mov': '视频'
  };
  return typeMap[extension || ''] || '其他';
};

/** 获取文件类型标签 */
const getFileTypeTag = (type: string): 'success' | 'primary' | 'warning' | 'info' => {
  const tagMap: { [key: string]: 'success' | 'primary' | 'warning' | 'info' } = {
    '图片': 'success',
    '文档': 'primary',
    '视频': 'warning',
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

/** 根据文件后缀获取文件类型 */
const getFileTypeFromSuffix = (suffix: string) => {
  const s = suffix?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(s)) return '图片';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(s)) return '文档';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(s)) return '视频';
  if (['mp3', 'wav', 'flac', 'aac'].includes(s)) return '音频';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(s)) return '压缩包';
  return '其他';
};

// 页面加载时获取详情
onMounted(() => {
  fetchContentDetail();
});
</script>

<style scoped lang="scss">
.edit-content {
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

// 表单区域
.form-section {
  margin-bottom: 32px;
  
  &.basic-info {
    background-color: #fafafa;
    padding: 20px;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
  }
  
  &.content-editor {
    .el-form-item__label {
      font-weight: 600;
      color: #303133;
    }
  }
  
  &.attachment-section {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 6px;
    border: 1px solid #e4e7ed;
  }
}

// 表单提示文字
.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.4;
}

// 富文本编辑器容器
.editor-container {
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  overflow: hidden;
}

// 编辑器工具栏
.editor-toolbar {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-bottom: 1px solid #dcdfe6;
  
  .toolbar-group {
    display: flex;
    align-items: center;
    margin-right: 12px;
    
    .el-button {
      margin-right: 4px;
      padding: 4px 8px;
      border: none;
      background: transparent;
      
      &:hover {
        background-color: #e4e7ed;
      }
    }
  }
  
  .toolbar-divider {
    width: 1px;
    height: 20px;
    background-color: #dcdfe6;
    margin: 0 8px;
  }
  
  .toolbar-right {
    margin-left: auto;
    
    .article-catalog {
      font-size: 12px;
      color: #606266;
      font-weight: 500;
    }
  }
}

// 编辑器主体区域
.editor-main {
  min-height: 500px;
}

// 编辑器内容区域
.editor-content {
  padding: 16px;
  
  .content-textarea {
    border: none;
    resize: none;
    
    :deep(.el-textarea__inner) {
      border: none;
      box-shadow: none;
      font-size: 14px;
      line-height: 1.6;
      padding: 0;
      min-height: 500px;
      
      &:focus {
        box-shadow: none;
      }
    }
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

// 发布按钮区域
.publish-section {
  text-align: left;
  padding: 20px 0;
  border-top: 1px solid #e4e7ed;
  
  .el-button {
    padding: 12px 24px;
    font-size: 16px;
    font-weight: 600;
  }
}

// 操作按钮
.form-actions {
  text-align: center;
  padding-top: 16px;
  
  .el-button {
    margin: 0 8px;
    min-width: 100px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .edit-content {
    padding: 16px;
  }
  
  .main-content-box {
    padding: 16px;
  }
  
  .editor-main {
    min-height: 300px;
  }
  
  .editor-content {
    .content-textarea {
      :deep(.el-textarea__inner) {
        min-height: 300px;
      }
    }
  }
  
  .publish-section {
    text-align: center;
    
    .el-button {
      width: 100%;
    }
  }
  
  .form-actions {
    .el-button {
      margin: 4px;
      width: 100%;
    }
  }
  
  .editor-toolbar {
    flex-wrap: wrap;
    
    .toolbar-group {
      margin-bottom: 8px;
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

// 选择器样式优化
:deep(.el-select) {
  .el-input__inner {
    border-radius: 4px;
  }
}

// 禁用状态样式
:deep(.el-input.is-disabled .el-input__inner) {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
}
</style>

