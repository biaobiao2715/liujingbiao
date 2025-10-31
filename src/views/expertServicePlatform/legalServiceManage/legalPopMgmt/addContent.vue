<!--
  标题: addContent.vue
  功能: 新增普法内容
  说明: 用于新增普法内容，包括表单填写和提交
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="add-content">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 页面标题 -->
      <div class="page-header">
        <h2>新增普法内容</h2>
      </div>

      <!-- 表单内容 -->
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
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
            <el-col :span="12">
              <el-form-item label="发布状态" prop="status" required>
                <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                  <el-option label="请选择" value="请选择" />
                  <el-option 
                    v-for="item in legal_popularize_status" 
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
            <el-col :span="12">
              <el-form-item label="普法类别" prop="contentType" required>
                <el-select v-model="formData.contentType" placeholder="请选择" style="width: 100%">
                  <el-option label="请选择" value="请选择" />
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
                  <el-button size="small" icon="Link" title="插入链接" />
                  <el-button size="small" icon="Document" title="一级标题" />
                  <el-button size="small" icon="Code" title="代码" />
                  <el-button size="small" icon="CopyDocument" title="复制" />
                </div>
                <div class="toolbar-right">
                  <span class="article-catalog">文章目录</span>
                </div>
              </div>
              
              <!-- 编辑器主体区域 -->
              <div class="editor-main">
                <div class="editor-content">
                  <el-input 
                    v-model="formData.content" 
                    type="textarea" 
                    :rows="12" 
                    placeholder="请输入文章内容"
                    class="content-textarea"
                  />
                </div>
                
                <!-- 文章目录侧边栏 -->
                <div class="article-catalog-sidebar">
                  <div class="catalog-title">文章目录</div>
                  <div class="catalog-content">
                    <div class="catalog-item" v-for="(item, index) in catalogItems" :key="index">
                      <span class="catalog-level">{{ item.level }}</span>
                      <span class="catalog-text">{{ item.text }}</span>
                    </div>
                  </div>
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
              <div class="attachment-list" v-if="fileList.length > 0">
                <div 
                  v-for="(file, index) in fileList" 
                  :key="index" 
                  class="attachment-item"
                >
                  <el-icon><Document /></el-icon>
                  <span class="file-name">{{ file.name }}</span>
                  <span class="file-size">{{ formatFileSize(file.size) }}</span>
                  <el-button type="danger" size="small" @click="handleRemoveFile(index)">删除</el-button>
                </div>
              </div>
            </div>
          </el-form-item>
        </div>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="handleSave" :loading="saving">保存</el-button>
          <el-button type="success" @click="handlePublish" :loading="publishing">发布</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Plus } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
import { addContent } from '@/api/expertServicePlatform/legalServiceManage/contentManage';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_type, legal_popularize_status } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_type', 'legal_popularize_status')
);

// 表单数据
const formData = reactive({
  contentTitle: '',
  contentType: '',
  contentStatus: '',
  contentSummary: '',
  contentContent: '',
  contentLevel: '',
  lawKeywords: '',
  relatedLaws: '',
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
    { min: 5, max: 60, message: '简介长度在 5 到 60 个字符', trigger: 'blur' }
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
const fileList = ref([]);

// 文章目录数据
const catalogItems = ref([
  { level: '1', text: '第一章 总则' },
  { level: '2', text: '第一条 适用范围' },
  { level: '2', text: '第二条 基本原则' },
  { level: '1', text: '第二章 具体规定' },
  { level: '2', text: '第三条 实施要求' }
]);

/** 取消操作 */
const handleCancel = () => {
  ElMessageBox.confirm('确定要取消吗？未保存的内容将丢失。', '提示', {
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

    ElMessageBox.confirm('确定要保存吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    }).then(() => {
      saving.value = true;

      // 准备提交数据
      const submitData = {
        contentTitle: formData.contentTitle,
        contentType: formData.contentType,
        contentStatus: formData.contentStatus,
        contentSummary: formData.contentSummary,
        contentContent: formData.contentContent,
        contentLevel: formData.contentLevel || '',
        lawKeywords: formData.lawKeywords || '',
        relatedLaws: formData.relatedLaws || ''
      };

      addContent(submitData).then(() => {
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
      publishing.value = true;

      // 发布时强制设置状态为已发布
      const submitData = {
        contentTitle: formData.contentTitle,
        contentType: formData.contentType,
        contentStatus: '2', // 强制为已发布
        contentSummary: formData.contentSummary,
        contentContent: formData.contentContent,
        contentLevel: formData.contentLevel || '',
        lawKeywords: formData.lawKeywords || '',
        relatedLaws: formData.relatedLaws || ''
      };

      addContent(submitData).then(() => {
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
  input.accept = '.jpg,.jpeg,.png,.pdf,.doc,.docx';
  
  input.onchange = (e: any) => {
    const files = Array.from(e.target.files);
    files.forEach((file: any) => {
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error(`文件 ${file.name} 超过 10MB 限制`);
        return;
      }
      
      fileList.value.push({
        name: file.name,
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

/** 删除文件 */
const handleRemoveFile = (index: number) => {
  fileList.value.splice(index, 1);
  ElMessage.success('附件删除成功');
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
</script>

<style scoped lang="scss">
.add-content {
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
  display: flex;
  min-height: 400px;
}

// 编辑器内容区域
.editor-content {
  flex: 1;
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
      
      &:focus {
        box-shadow: none;
      }
    }
  }
}

// 文章目录侧边栏
.article-catalog-sidebar {
  width: 200px;
  background-color: #f8f9fa;
  border-left: 1px solid #dcdfe6;
  padding: 16px;
  
  .catalog-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid #dcdfe6;
  }
  
  .catalog-content {
    .catalog-item {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
      font-size: 12px;
      
      .catalog-level {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-color: #409eff;
        color: #fff;
        border-radius: 50%;
        text-align: center;
        line-height: 16px;
        font-size: 10px;
        margin-right: 8px;
        flex-shrink: 0;
      }
      
      .catalog-text {
        color: #606266;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }
}

// 附件容器
.attachment-container {
  .attachment-list {
    margin-top: 16px;
    
    .attachment-item {
      display: flex;
      align-items: center;
      padding: 12px;
      background-color: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 4px;
      margin-bottom: 8px;
      
      .el-icon {
        margin-right: 8px;
        color: #409eff;
      }
      
      .file-name {
        flex: 1;
        margin-right: 8px;
        color: #303133;
        font-size: 14px;
      }
      
      .file-size {
        margin-right: 8px;
        color: #909399;
        font-size: 12px;
      }
    }
  }
}

// 操作按钮
.form-actions {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  
  .el-button {
    margin: 0 8px;
    min-width: 100px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .add-content {
    padding: 16px;
  }
  
  .main-content-box {
    padding: 16px;
  }
  
  .editor-main {
    flex-direction: column;
  }
  
  .article-catalog-sidebar {
    width: 100%;
    border-left: none;
    border-top: 1px solid #dcdfe6;
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
</style>
