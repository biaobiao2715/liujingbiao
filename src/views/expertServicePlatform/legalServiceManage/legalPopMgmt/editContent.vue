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
              <el-form-item label="内容编号" prop="contentNo">
                <el-input v-model="formData.contentNo" placeholder="内容编号" disabled />
              </el-form-item>
            </el-col>
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
            <el-col :span="12">
              <el-form-item label="内容级别" prop="contentLevel" required>
                <el-select v-model="formData.contentLevel" placeholder="请选择" style="width: 100%">
                  <el-option label="请选择" value="" />
                  <el-option label="初级" value="1" />
                  <el-option label="中级" value="2" />
                  <el-option label="高级" value="3" />
                </el-select>
                <div class="form-tip">1-初级 2-中级 3-高级</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="发布状态" prop="status" required>
                <el-select v-model="formData.status" placeholder="请选择" style="width: 100%">
                  <el-option label="请选择" value="" />
                  <el-option 
                    v-for="item in legal_popularize_status" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="发布时间" prop="publishTime">
                <el-input v-model="formData.publishTime" placeholder="发布时间" disabled />
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
                  maxlength="200"
                  show-word-limit
                />
                <div class="form-tip">请输入简介,最多支持200个字符</div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="法律关键词" prop="lawKeywords">
                <el-input 
                  v-model="formData.lawKeywords" 
                  placeholder="请输入法律关键词，多个关键词用逗号分隔"
                  clearable
                />
                <div class="form-tip">多个关键词用逗号分隔</div>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="相关法条" prop="relatedLaws">
                <el-input 
                  v-model="formData.relatedLaws" 
                  placeholder="请输入相关法条"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="作者姓名" prop="authorName">
                <el-input v-model="formData.authorName" placeholder="作者姓名" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="浏览量" prop="viewCount">
                <el-input v-model="formData.viewCount" placeholder="浏览量" disabled />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="下载量" prop="downloadCount">
                <el-input v-model="formData.downloadCount" placeholder="下载量" disabled />
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
import { Document, Plus, Upload } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { 
  getContentDetail, 
  editContent 
} from '../../../../api/expertServicePlatform/legalServiceManage/contentManage';

const router = useRouter();
const route = useRoute();
const { id } = route.query;
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { legal_popularize_type, legal_popularize_status } = toRefs<any>(
  (proxy as any)?.useDict('legal_popularize_type', 'legal_popularize_status')
);

// 加载状态
const loading = ref(false);

// 表单数据 - 使用后端字段名并支持模板别名
const formData = reactive({
  id: 0,
  contentNo: '',
  contentTitle: '',
  contentType: '',
  contentLevel: '',
  contentSummary: '',
  contentContent: '',
  contentStatus: '',
  publishTime: '',
  lawKeywords: '',
  relatedLaws: '',
  viewCount: 0,
  downloadCount: 0,
  authorId: 0,
  authorName: '',
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
    { max: 200, message: '简介最多 200 个字符', trigger: 'blur' }
  ],
  contentType: [
    { required: true, message: '请选择普法类别', trigger: 'change' }
  ],
  contentLevel: [
    { required: true, message: '请选择内容级别', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ],
  lawKeywords: [
    { max: 100, message: '关键词最多 100 个字符', trigger: 'blur' }
  ],
  relatedLaws: [
    { max: 200, message: '相关法条最多 200 个字符', trigger: 'blur' }
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

// 文章目录数据
const catalogItems = ref([
  { level: '1', text: '第一章 总则' },
  { level: '2', text: '第一条 适用范围' },
  { level: '2', text: '第二条 基本原则' },
  { level: '1', text: '第二章 具体规定' },
  { level: '2', text: '第三条 实施要求' }
]);

/** 获取内容详情 */
const fetchContentDetail = async () => {
  console.log('===== 🚀 开始获取内容详情 =====');
  console.log('路由参数 id:', id);
  console.log('id 类型:', typeof id);
  
  if (!id) {
    console.error('❌ 缺少内容ID');
    ElMessage.warning('缺少内容ID');
    return;
  }
  
  loading.value = true;
  console.log('🔄 开始调用 getContentDetail API, ID:', Number(id));
  
  try {
    const response = await getContentDetail(Number(id));
    console.log('📡 API 原始响应:', response);
    
    // 处理响应数据结构：response.data 是 Axios 包装，实际数据在 response.data.data
    const resData: any = response?.data || response;
    console.log('📦 解析后的响应数据:', resData);
    console.log('响应码:', resData?.code);
    
    if (resData && resData.code === 200) {
      // 详情数据在 resData.data 中
      const data = resData.data;
      if (!data) {
        console.error('❌ 详情数据为空');
        ElMessage.error('获取内容详情失败：数据为空');
        return;
      }
      
      console.log('✅ 获取普法内容详情成功!');
      console.log('📄 详情数据:', data);
      console.log('详情数据字段:', Object.keys(data));
      
      console.log('开始映射数据到表单...');
      // 映射后端数据到表单（使用 ?? 处理 null 值，保留空字符串和 0 作为有效值）
      formData.id = data.id ?? 0;
      formData.contentNo = data.contentNo ?? '';
      formData.contentTitle = data.contentTitle ?? '';
      formData.contentType = data.contentType ?? '';
      formData.contentLevel = data.contentLevel ?? '';
      formData.contentSummary = data.contentSummary ?? '';
      formData.contentContent = data.contentContent ?? '';
      formData.contentStatus = data.contentStatus ?? '';
      formData.publishTime = data.publishTime ?? '';
      formData.lawKeywords = data.lawKeywords ?? '';
      formData.relatedLaws = data.relatedLaws ?? '';
      // 处理 null 值：如果为 null 则设为 0，否则使用原值
      formData.viewCount = data.viewCount != null ? data.viewCount : 0;
      formData.downloadCount = data.downloadCount != null ? data.downloadCount : 0;
      formData.authorId = data.authorId ?? 0;
      formData.authorName = data.authorName ?? '';
      
      console.log('✅ 基础数据映射完成!');
      console.log('formData.id:', formData.id);
      console.log('formData.contentTitle:', formData.contentTitle);
      console.log('formData.title (别名):', formData.title);
      console.log('formData.contentType:', formData.contentType);
      console.log('formData.contentStatus:', formData.contentStatus);
      console.log('formData.contentSummary:', formData.contentSummary);
      console.log('formData.contentContent:', formData.contentContent);
      console.log('formData.viewCount:', formData.viewCount);
      console.log('formData.downloadCount:', formData.downloadCount);
      
      console.log('开始处理附件列表...');
      // 处理附件列表（sysOssLists 可能为 null）
      if (data.sysOssLists && Array.isArray(data.sysOssLists) && data.sysOssLists.length > 0) {
        console.log('找到附件:', data.sysOssLists);
        fileList.value = data.sysOssLists.map((file: any) => ({
          id: file.ossId,
          name: file.fileName || file.originalName || '未知文件',
          type: getFileTypeFromSuffix(file.fileSuffix),
          size: file.size || 0,
          url: file.url,
          file: null
        }));
        formData.ids = data.sysOssLists.map((file: any) => file.ossId).filter((id: any) => id != null);
        console.log('附件处理完成, fileList:', fileList.value);
        console.log('附件ID列表:', formData.ids);
      } else {
        console.log('没有附件 (sysOssLists为null或空数组)');
        fileList.value = [];
        formData.ids = [];
      }
      
      console.log('✅ 表单数据填充完成!');
      console.log('最终 formData 摘要:', {
        id: formData.id,
        contentNo: formData.contentNo,
        contentTitle: formData.contentTitle,
        title: formData.title,
        contentType: formData.contentType,
        contentLevel: formData.contentLevel,
        contentSummary: formData.contentSummary?.substring(0, 50) + '...',
        contentContent: formData.contentContent?.substring(0, 50) + '...',
        contentStatus: formData.contentStatus,
        publishTime: formData.publishTime,
        viewCount: formData.viewCount,
        downloadCount: formData.downloadCount,
        fileCount: fileList.value.length
      });
      
      // 验证关键字段是否已填充
      if (formData.contentTitle) {
        console.log('✅ 表单数据验证通过，标题已填充');
      } else {
        console.warn('⚠️ 警告：标题为空');
      }
    } else {
      console.error('❌ API 返回错误!');
      console.error('错误信息:', resData?.msg);
      console.error('完整响应:', resData);
      ElMessage.error(resData?.msg || '获取内容详情失败');
    }
  } catch (error: any) {
    console.error('❌ 获取内容详情异常!');
    console.error('错误对象:', error);
    console.error('错误消息:', error.message);
    console.error('错误响应:', error.response);
    ElMessage.error('获取内容详情失败，请稍后重试');
  } finally {
    loading.value = false;
    console.log('===== 获取内容详情结束 =====');
  }
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
const handleSave = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    await ElMessageBox.confirm('确定要保存修改吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'info'
    });
    
    saving.value = true;
    
    // 准备提交数据
    const submitData = {
      id: formData.id,
      contentTitle: formData.contentTitle,
      contentType: formData.contentType,
      contentLevel: formData.contentLevel,
      contentSummary: formData.contentSummary,
      contentContent: formData.contentContent,
      contentStatus: formData.contentStatus,
      lawKeywords: formData.lawKeywords,
      relatedLaws: formData.relatedLaws,
      ids: formData.ids
    };
    
    const response = await editContent(submitData);
    const resData: any = response?.data || response;
    
    if (resData && resData.code === 200) {
      ElMessage.success('保存成功');
      router.push('/expertServicePlatform/legalServiceManage/contentManage');
    } else {
      ElMessage.error(resData?.msg || '保存失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('保存失败:', error);
      ElMessage.error('保存失败，请检查表单信息');
    }
  } finally {
    saving.value = false;
  }
};

/** 发布操作 */
const handlePublish = async () => {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    await ElMessageBox.confirm('确定要发布该内容吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    
    publishing.value = true;
    
    // 发布时强制设置状态为已发布
    const submitData = {
      id: formData.id,
      contentTitle: formData.contentTitle,
      contentType: formData.contentType,
      contentLevel: formData.contentLevel,
      contentSummary: formData.contentSummary,
      contentContent: formData.contentContent,
      contentStatus: '2', // 强制为已发布
      lawKeywords: formData.lawKeywords,
      relatedLaws: formData.relatedLaws,
      ids: formData.ids
    };
    
    const response = await editContent(submitData);
    const resData: any = response?.data || response;
    
    if (resData && resData.code === 200) {
      ElMessage.success('发布成功');
      router.push('/expertServicePlatform/legalServiceManage/contentManage');
    } else {
      ElMessage.error(resData?.msg || '发布失败');
    }
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('发布失败:', error);
      ElMessage.error('发布失败，请检查表单信息');
    }
  } finally {
    publishing.value = false;
  }
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
  console.log('🎬 编辑页面已挂载 (onMounted)');
  console.log('当前路由:', route);
  console.log('路由 query:', route.query);
  console.log('路由 id 参数:', id);
  console.log('formData 初始状态:', formData);
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
