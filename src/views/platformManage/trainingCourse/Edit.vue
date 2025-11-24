<!-- 
标题：			trainingcourseEdit.vue
功能：			新增编辑培训课程
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-11-4
修改人信息：张峰     2025-11-13
修改内容：新增编辑培训课程-删除主图后依旧能正常提交bug修复
 -->
<template>
  <div class="content-edit-dialog" v-loading="loading">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <!-- 基础信息区域 -->
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="课程标题" prop="cultivateName" required>
            <el-input v-model="formData.cultivateName" placeholder="请输入课程标题内容" maxlength="30" show-word-limit clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="发布状态" prop="cultivateStatus" required>
            <el-select v-model="formData.cultivateStatus" placeholder="请选择发布状态" filterable clearable>
              <el-option v-for="item in cultivate_status" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="24">
          <el-form-item label="课程类别" prop="cultivateType" required>
            <el-select v-model="formData.cultivateType" placeholder="请选择课程类别" style="width: 100%" clearable>
              <el-option v-for="item in cultivate_type" :key="item.value" :label="item.label" :value="item.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <!-- 正文编辑区域 -->
      <el-form-item label="正文编辑" prop="cultivateContent" required>
        <div class="editor-container">
          <!-- 富文本编辑器 -->
          <div class="editor-wrapper">
            <Editor v-model="formData.cultivateContent" :height="500" :minHeight="500" />
          </div>

          <!-- 文章目录 -->
          <TocSidebar
            :content="formData.cultivateContent"
            editor-container=".w-e-text-container"
            :auto-scroll="true"
            @toc-click="handleTocClick"
            @active-change="handleActiveChange"
            @content-update="handleContentUpdate"
            ref="tocSidebarRef"
          />
          <!-- <div class="toc-sidebar">
                        <div class="toc-header">文章目录</div>
                        <div class="toc-content">
                            <div v-if="tocList.length > 0" class="toc-list">
                                <div v-for="item in tocList" :key="item.id"
                                    :class="['toc-item', `toc-level-${item.level}`]" @click="scrollToHeading(item.id)">
                                    <span class="toc-text">{{ item.text }}</span>
                                </div>
                            </div>
                            <div v-else class="toc-empty">
                                <el-icon class="empty-icon">
                                    <Document />
                                </el-icon>
                                <p class="empty-text">暂无目录</p>
                                <p class="empty-tip">使用标题格式编辑内容后将自动生成目录</p>
                            </div>
                        </div>
                    </div> -->
        </div>
      </el-form-item>

      <!-- 附件上传区域 -->
      <div class="attachment-section">
        <div class="attachment-title">附件上传</div>
        <el-upload
          action="#"
          :auto-upload="false"
          accept=".png,.jpg,.MP4,.mov,.avi,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt"
          :show-file-list="false"
          :limit="1"
          :on-change="handleFileChange"
        >
          <el-button type="primary" plain>
            <el-icon class="el-icon--left">
              <Upload />
            </el-icon>
            添加附件
          </el-button>
          <template #tip>
            <div class="upload-tip">支持格式：图片(png/jpg),视频(MP4,mov,avi)文档(pdf/doc/docx/ppt/pptx/xls/xlsx/txt)，单个文件最大100MB</div>
          </template>
        </el-upload>
        <!-- 重新上传的隐藏输入框 -->
        <input ref="reuploadInputRef" type="file" :accept="acceptTypes" style="display: none" @change="handleReuploadChange" />
        <!-- 附件列表 -->
        <el-table v-if="attachmentList.length > 0" :data="attachmentList" stripe class="attachment-table">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="fileName" label="附件名称" align="left" :show-overflow-tooltip="true" />
          <el-table-column prop="fileSize" label="文件大小" width="120" align="center" />
          <el-table-column label="操作" width="200" align="center">
            <template #default="scope">
              <el-button type="primary" link @click="handleAgainFile(scope.row, scope.$index)">
                <el-icon>
                  <Upload />
                </el-icon>
                重新上传
              </el-button>
              <el-button type="danger" link @click="handleRemoveFile(scope.row)">
                <el-icon>
                  <Delete />
                </el-icon>
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <!-- 主图上传 -->
      <div class="attachment-section">
        <div class="attachment-title">上传主图</div>
        <el-upload
          action="#"
          :auto-upload="false"
          list-type="picture-card"
          :on-preview="handlePictureCardPreview"
          accept=".jpg,.gif,.png"
          :limit="1"
          :file-list="fileList"
          :on-change="handleImgFileChange"
          :on-exceed="handleExceed"
          :on-remove="handleRemove"
        >
          <el-icon>
            <Plus />
          </el-icon>
          <template #tip>
            <div class="upload-tip">支持格式：支持jpg、gif、png三种格式，大小不超过10MB</div>
          </template>
        </el-upload>
        <el-dialog v-model="dialogVisible">
          <img width="100%" :src="dialogImageUrl" alt="" />
        </el-dialog>
      </div>
      <!-- 表单操作按钮 -->
      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '发布' : '保存' }}
        </el-button>
        <el-button @click="emitCancel">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, watch } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, View, Delete, Document, Plus } from '@element-plus/icons-vue';
import { getcourseCultivatequeryDetail, courseCultivateadd, courseCultivateupdate } from '@/api/system/courseCultivate';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import TocSidebar from '@/components/Tocsidebar/index.vue';

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();
const tocSidebarRef = ref();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { cultivate_type, cultivate_status } = toRefs<any>((proxy as any)?.useDict('cultivate_type', 'cultivate_status'));

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 加载状态
const loading = ref(false);
/* 缩略图弹窗 */
const dialogVisible = ref(false);
/* 查看上传图片的url */
const dialogImageUrl = ref('');
// 表单数据
const formData = ref({
  id: undefined as number | undefined,
  cultivateName: '', //课程标题
  cultivateStatus: '', //发布状态
  cultivateType: '', //课程类别
  cultivateContent: ''
});
/* 主图图片 */
const fileList = ref([]);
// 附件列表
const attachmentList = ref<
  Array<{
    ossId?: number;
    fileName: string;
    originalName: string;
    fileSuffix: string;
    url: string;
    fileSize?: string;
    uid?: string;
  }>
>([]);
const reuploadInputRef = ref<HTMLInputElement>(); // 重新上传的input引用
const currentReuploadIndex = ref<number>(-1); // 当前重新上传的附件索引
const acceptTypes = '.png,.jpg,.mp4,.mov,.avi,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt';
// 文章目录列表
const tocList = ref<
  Array<{
    id: string;
    text: string;
    tag: string;
    level: number;
  }>
>([]);

// 表单验证规则
const rules = {
  cultivateName: [
    { required: true, message: '请输入课程标题', trigger: 'blur' },
    { min: 2, max: 30, message: '标题长度在 2 到 30 个字符', trigger: 'blur' }
  ],
  cultivateStatus: [{ required: true, message: '请选择发布状态', trigger: 'change' }],
  cultivateType: [{ required: true, message: '请选择课程类别', trigger: 'change' }],
  cultivateContent: [
    { required: true, message: '请输入文章内容', trigger: 'blur' },
    { min: 10, message: '内容至少 10 个字符', trigger: 'blur' }
  ]
};

/** 获取内容详情 */
const fetchContentDetail = async () => {
  if (!props.id) return;

  loading.value = true;
  try {
    const response: any = await getcourseCultivatequeryDetail({ id: props.id as number, isView: false });

    if (response && response.code === 200) {
      const data = response.data;

      if (!data) {
        ElMessage.error('获取内容详情失败：数据为空');
        return;
      }

      // 将接口返回的数据赋值给表单
      formData.value = {
        id: data.id,
        cultivateName: data.cultivateName || '',
        cultivateType: data.cultivateType || '',
        cultivateStatus: data.cultivateStatus || '',
        cultivateContent: data.cultivateContent || ''
      };
      // 回显主图数据
      if (data.imageFile && data.imageFile.ossId) {
        fileList.value = [
          {
            name: data.imageFile.originalName,
            url: data.imageFile.url,
            ossId: data.imageFile.ossId,
            uid: Date.now().toString() // 生成一个临时 uid
          }
        ];
      } else {
        fileList.value = [];
      }
      // 加载附件数据
      if (data.ossVoList && Array.isArray(data.ossVoList) && data.ossVoList.length > 0) {
        attachmentList.value = data.ossVoList.map((item: any) => {
          let fileSize = '--';

          // 解析 ext1 字段获取文件大小
          if (item.ext1) {
            try {
              const ext1Obj = JSON.parse(item.ext1);
              if (ext1Obj.fileSize) {
                fileSize = formatFileSize(ext1Obj.fileSize);
              }
            } catch (error) {
              console.error('解析 ext1 失败:', error);
              // 如果解析失败，可以尝试从其他字段获取或保持默认值
            }
          }

          return {
            ossId: item.ossId,
            fileName: item.fileName || item.originalName,
            originalName: item.originalName || item.fileName,
            fileSuffix: item.fileSuffix,
            url: item.url,
            fileSize: fileSize
          };
        });
      } else {
        attachmentList.value = [];
      }
    } else {
      ElMessage.error(response?.msg || '获取内容详情失败');
    }
  } catch (error) {
    console.error('获取内容详情失败:', error);
    ElMessage.error('获取内容详情失败，请稍后重试');
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
    console.log('fileList.value', fileList.value);

    if (fileList.value.length == 0) {
      return ElMessage.warning('请上传主图');
    }
    saving.value = true;

    // 构建提交数据
    const submitData = {
      ...(props.type === 'edit' ? { id: formData.value.id } : {}),
      cultivateName: formData.value.cultivateName,
      cultivateType: formData.value.cultivateType,
      cultivateStatus: formData.value.cultivateStatus,
      cultivateContent: formData.value.cultivateContent,
      ossVoList: attachmentList.value,
      ossId: fileList.value[0].ossId
    };
    console.log('submitData提交的数据', submitData);
    // 调用对应的接口
    const api = props.type === 'add' ? courseCultivateadd : courseCultivateupdate;
    const response: any = await api(submitData);

    if (response && response.code === 200) {
      ElMessage.success(props.type === 'add' ? '培训课程发布成功' : '培训课程修改成功');
      emit('success');
    } else {
      ElMessage.error(response?.msg || '操作失败，请稍后重试');
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
/** 处理目录点击事件 */
const handleTocClick = (item: any) => {
  // 可以在这里添加额外的逻辑
};

/** 处理激活状态变化 */
const handleActiveChange = (id: string) => {
  // 可以在这里添加额外的逻辑
};
const handleContentUpdate = (updatedContent: string) => {
  formData.value.cultivateContent = updatedContent;
};
/** 取消 */
const emitCancel = () => {
  emit('cancel');
};

/** 文件大小格式化 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/** 文件验证 */
const validateFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'png'];
  const videoExt = ['mp4', 'mov', 'avi'];
  const docExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  const allExt = [...docExt, ...imageExt, ...videoExt];

  if (!allExt.includes(ext)) {
    ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
    return false;
  }

  const MB = 1024 * 1024;
  let limit: number;
  let typeName: string;

  // 根据文件类型设置不同的限制
  if (imageExt.includes(ext)) {
    limit = 10 * MB; // 图片限制10MB
    typeName = '图片';
  } else if (videoExt.includes(ext)) {
    limit = 500 * MB; // 视频限制500MB
    typeName = '视频';
  } else {
    limit = 100 * MB; // 文档限制100MB
    typeName = '文档';
  }

  // 检查文件大小
  if (file.size > limit) {
    const actualSize = (file.size / MB).toFixed(2);
    const maxSize = limit / MB;
    ElMessage.error(`${typeName}文件大小 ${actualSize}MB 超过限制，最大${maxSize}MB`);
    return false;
  }

  return true;
};
/* 主图验证 */
const valiImgFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'gif', 'png'];
  const allExt = [...imageExt];

  if (!allExt.includes(ext)) {
    ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
    return false;
  }

  const MB = 1024 * 1024;
  const limit = imageExt.includes(ext) ? 10 * MB : 100 * MB;
  if (file.size > limit) {
    ElMessage.error(imageExt.includes(ext) ? '图片文件最大10MB' : '文档文件最大100MB');
    return false;
  }

  return true;
};

/** 处理文件上传 */
const handleFileChange = async (file: any) => {
  console.log('正常上传的文件', file);

  if (!validateFile(file.raw)) return;

  (proxy as any)?.$modal?.loading('正在上传附件，请稍候...');

  try {
    const response = await ossUploadImage({ file: file.raw });

    if (response.code === 200 && response.data?.ossId) {
      attachmentList.value.push({
        ossId: response.data.ossId,
        fileName: response.data.fileName,
        originalName: file.raw.name,
        fileSuffix: file.raw.type,
        url: response.data.url,
        fileSize: formatFileSize(file.raw.size),
        uid: file.uid
      });
      ElMessage.success('附件上传成功');
    } else {
      ElMessage.error(response?.msg || '上传失败，请重试');
    }
  } catch (error) {
    console.error('附件上传失败:', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
  }
};
/* 处理超出限制 */
const handleExceed = (files: any, fileList: any) => {
  // 先清空现有文件
  console.log('替换files', files);

  const wrappedFile = {
    name: files[0].name,
    raw: files[0]
  };
  fileList.value = [];
  // 手动触发新文件的上传
  handleImgFileChange(wrappedFile);
};
/* 主图上传 */
const handleImgFileChange = async (file: any) => {
  console.log('file', file);

  if (!valiImgFile(file.raw)) return;

  (proxy as any)?.$modal?.loading('正在上传附件，请稍候...');

  try {
    const response = await ossUploadImage({ file: file.raw });
    console.log('response', response);

    // 直接替换而不是追加
    fileList.value = [
      {
        name: response.data.fileName,
        url: response.data.url,
        ossId: response.data.ossId,
        uid: file.uid
      }
    ];
  } catch (error) {
    console.error('附件上传失败:', error);
    ElMessage.error('上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
  }
};
/* 主图删除的回调 */
const handleRemove = () => {
  fileList.value = [];
};
/** 重新上传 */
const handleAgainFile = async (file: any, index: number) => {
  console.log('重新上传文件:', file);
  console.log('索引:', index);

  // 记录当前重新上传的索引
  currentReuploadIndex.value = index;

  // 触发隐藏的文件输入框点击
  if (reuploadInputRef.value) {
    reuploadInputRef.value.click();
  }
};
/** 处理重新上传文件选择 */
const handleReuploadChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  console.log('target.files', target.files);

  if (!files || files.length === 0) {
    return;
  }

  const file = files[0];
  // 验证文件
  if (!validateFile(file)) {
    // 清空input值，允许重新选择
    target.value = '';
    return;
  }

  // 上传文件
  uploadReplacementFile(file);

  // 清空input值，允许重新选择
  target.value = '';
};
/** 上传替换文件 */
const uploadReplacementFile = async (file: File) => {
  console.log('重新上传的文件', file);

  (proxy as any)?.$modal?.loading('正在重新上传附件，请稍候...');

  try {
    const response = await ossUploadImage({ file });

    if (response.code === 200 && response.data?.ossId) {
      // 替换指定索引的附件
      if (currentReuploadIndex.value >= 0) {
        attachmentList.value[currentReuploadIndex.value] = {
          ossId: response.data.ossId,
          fileName: response.data.fileName,
          originalName: file.name,
          fileSuffix: file.type,
          url: response.data.url,
          fileSize: formatFileSize(file.size),
          uid: Date.now().toString() // 生成新的uid
        };

        ElMessage.success('附件重新上传成功');
      }
    } else {
      ElMessage.error(response?.msg || '重新上传失败，请重试');
    }
  } catch (error) {
    console.error('附件重新上传失败:', error);
    ElMessage.error('重新上传失败，请重试');
  } finally {
    (proxy as any)?.$modal?.closeLoading();
    // 重置索引
    currentReuploadIndex.value = -1;
  }
};
/** 删除文件 */
const handleRemoveFile = (file: any) => {
  ElMessageBox.confirm('确定要删除该附件吗？', '删除确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      const index = attachmentList.value.findIndex((item) => item.uid === file.uid || item.ossId === file.ossId);
      if (index !== -1) {
        attachmentList.value.splice(index, 1);
        ElMessage.success('附件删除成功');
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};
/* 查看图片 */
const handlePictureCardPreview = (file) => {
  console.log('file', file);

  dialogImageUrl.value = file.url;
  dialogVisible.value = true;
};

// 页面加载时的处理
onMounted(() => {
  if (props.type === 'edit' && props.id) {
    fetchContentDetail();
  }
});
</script>

<style scoped lang="scss">
.content-edit-dialog {
  padding: 20px 0;
}

// 编辑器容器 - 左右布局
.editor-container {
  display: flex;
  gap: 0;
  width: 100%;
  min-height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
}

// 编辑器包装器 - 左侧主编辑区
.editor-wrapper {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  border-right: 1px solid #dcdfe6;

  :deep(.w-e-text-container) {
    border: none !important;
    border-radius: 0;
  }

  :deep(.w-e-toolbar) {
    border: none !important;
    border-bottom: 1px solid #dcdfe6 !important;
    border-radius: 0;
    background-color: #fafafa;
  }

  :deep(.w-e-text-placeholder) {
    color: #c0c4cc;
    font-style: normal;
  }
}

// 文章目录侧边栏 - 右侧
.toc-sidebar {
  width: 260px;
  min-width: 260px;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;

  .toc-header {
    padding: 16px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    background: #ebebeb;
    border-bottom: 1px solid #dcdfe6;
    text-align: center;
  }

  .toc-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 3px;

      &:hover {
        background-color: #909399;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #e4e7ed;
    }
  }

  .toc-list {
    max-height: none;
  }

  .toc-item {
    padding: 8px 10px;
    margin-bottom: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #606266;
    font-size: 13px;
    line-height: 1.5;
    position: relative;

    &:hover {
      background-color: #e4e7ed;
      color: #409eff;
    }

    &:active {
      background-color: #d9dcdf;
    }

    .toc-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    // 不同层级的缩进
    &.toc-level-1 {
      font-weight: 600;
      font-size: 13px;
      color: #303133;
      padding-left: 10px;
    }

    &.toc-level-2 {
      padding-left: 20px;
      font-size: 12px;
    }

    &.toc-level-3 {
      padding-left: 30px;
      font-size: 12px;
      color: #909399;
    }

    &.toc-level-4,
    &.toc-level-5,
    &.toc-level-6 {
      padding-left: 40px;
      font-size: 12px;
      color: #a8abb2;
    }
  }

  .toc-empty {
    text-align: center;
    padding: 60px 20px;
    color: #909399;

    .empty-icon {
      font-size: 36px;
      color: #c0c4cc;
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 13px;
      color: #909399;
      margin: 8px 0 4px;
    }

    .empty-tip {
      font-size: 11px;
      color: #c0c4cc;
      line-height: 1.6;
      margin: 0;
      padding: 0 10px;
    }
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

// 附件上传区域
.attachment-section {
  margin: 32px 0;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e4e7ed;

  .attachment-title {
    font-size: 16px;
    font-weight: 600;
    color: #333333;
    margin-bottom: 16px;
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 16px;
      background-color: #409eff;
      border-radius: 2px;
    }
  }

  .upload-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 8px;
    line-height: 1.6;
  }

  .attachment-table {
    margin-top: 20px;

    :deep(.el-button) {
      padding: 4px 8px;

      .el-icon {
        margin-right: 4px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .editor-container {
    flex-direction: column;
  }

  .toc-sidebar {
    width: 100%;
    min-width: 100%;
    max-height: 300px;

    .toc-list {
      max-height: 200px;
    }
  }

  .form-actions {
    .el-button {
      width: 100%;
    }
  }

  .attachment-section {
    .attachment-table {
      :deep(.el-table__body-wrapper) {
        overflow-x: auto;
      }
    }
  }
}

// 中等屏幕优化
@media (min-width: 769px) and (max-width: 1024px) {
  .toc-sidebar {
    width: 200px;
    min-width: 200px;
    padding: 16px;
  }

  .editor-container {
    gap: 16px;
  }
}
</style>
