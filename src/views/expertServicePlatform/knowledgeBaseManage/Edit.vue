<!--
  标题: enterprise/index.vue
  功能: 知识库编辑
  说明: 用于知识库编辑
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="kb-edit">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="form-wrap">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="文章标题" prop="articleTitle">
            <el-input v-model="form.articleTitle" maxlength="30" show-word-limit placeholder="请输入标题，最多30个字" clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>
        <el-col :span="12">
          <el-form-item label="文章类别" prop="articleType">
            <el-select v-model="form.articleType" placeholder="请选择" clearable filterable style="width: 100%">
              <el-option v-for="d in article_type" :key="d.value" :label="d.label" :value="String(d.value)" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12"></el-col>
        <el-col :span="24">
          <el-form-item label="正文编辑" prop="articleContent">
            <div style="display: flex">
              <!-- 编辑器区 -->
              <div style="flex: 1">
                <Editor v-model="form.articleContent" :height="500" :minHeight="500" />
              </div>
              <!-- 文章目录 -->
              <div class="toc-sidebar">
                <div class="toc-header">文章目录</div>
                <div class="toc-content">
                  <div v-if="tocList.length > 0" class="toc-list">
                    <div v-for="item in tocList" :key="item.id" :class="['toc-item', `toc-level-${item.level}`]" @click="scrollTo(item.id)">
                      <span class="toc-text">{{ item.text }}</span>
                    </div>
                  </div>
                  <div v-else class="toc-empty">
                    <el-icon class="empty-icon"><Document /></el-icon>
                    <p class="empty-text">暂无目录</p>
                    <p class="empty-tip">使用标题格式编辑内容后将自动生成目录</p>
                  </div>
                </div>
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="title-text">附件上传</div>
      <el-upload
        action="#"
        :auto-upload="false"
        accept=".jpg,.jpeg,.png,.mp4,.mov,.avi,.pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.txt"
        :show-file-list="false"
        :on-change="handleChange"
      >
        <div class="upload-btn">
          <el-button v-throttle plain style="color: #108c58; border-color: #108c58">
            <img src="@/assets/images/register5.svg" class="el-icon-view" />添加附件</el-button
          >
        </div>
      </el-upload>

      <div class="h20"></div>

      <el-table :data="fileListtable" stripe>
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="fileName" label="附件名" align="center" />
        <el-table-column label="操作" width="250" align="center">
          <template #default="scope">
            <el-button v-throttle text @click="previewFile(scope.row)" style="color: #108c58; border-color: #108c58; margin-right: 10px">
              <img src="@/assets/images/register1.svg" class="el-icon-view" />
              <span style="height: 16px; line-height: 16px">预览</span>
            </el-button>
            <el-button v-throttle text v-if="scope.row.fileType !== '1'" @click="removeFile(scope.row)" style="color: #ff3131; border-color: #ff3131">
              <img src="@/assets/images/register4.svg" class="el-icon-view" />
              <span style="height: 16px; line-height: 16px">删除</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="h20"></div>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="启用状态" prop="articleStatus">
            <el-select v-model="form.articleStatus" placeholder="请选择" clearable filterable style="width: 100%">
              <el-option v-for="d in article_status" :key="d.value" :label="d.label" :value="String(d.value)" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <div class="btns">
        <el-button v-throttle type="primary" @click="submit()">发布</el-button>
        <el-button v-throttle @click="emitCancel">返回</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, getCurrentInstance, type ComponentInternalInstance, computed } from 'vue';
import { addArticle, getArticle, updateArticle, ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';

const props = defineProps<{ id?: string | number }>();
const emit = defineEmits(['success', 'cancel']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));

const article_status = computed(() => [
  { value: '2', label: '已启用' },
  { value: '3', label: '已禁用' }
]);
const form = ref<any>({
  articleTitle: '',
  articleType: '',
  articleContent: '',
  articleStatus: '2'
});
const formRef = ref();
const fileListtable = ref<Array<any>>([]);
const tocList = ref([]); // 目录列表
const rules = {
  articleTitle: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { validator: (_: any, v: string, cb: any) => (v && v.length <= 30 ? cb() : cb(new Error('标题最多30个字'))), trigger: 'blur' }
  ],
  articleType: [{ required: true, message: '请选择文章类别', trigger: 'change' }],
  articleContent: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
  articleStatus: [{ required: true, message: '请选择文章状态', trigger: 'change' }]
};

const emitCancel = () => emit('cancel');

// 监听内容变化，自动生成目录
watch(
  () => form.value.articleContent,
  (val) => {
    const div = document.createElement('div');
    div.innerHTML = val;
    const headings = div.querySelectorAll('h1, h2, h3');
    tocList.value = Array.from(headings).map((el, idx) => {
      el.id = `toc-${idx}`; // 给标题加 id
      return {
        text: el.innerText,
        tag: el.tagName,
        id: el.id
      };
    });
    // 把加了 id 的内容写回编辑器
    form.value.articleContent = div.innerHTML;
  }
);

function scrollTo(id: string) {
  const editor = document.querySelector('.ql-editor');
  if (editor) {
    const el = editor.querySelector(`#${id}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}
const submit = async () => {
  await formRef.value?.validate();
  const payload = {
    ...form.value,
    ossVoList: fileListtable.value
  };
  const api = props.id ? updateArticle : addArticle;
  const res = await api(payload);
  if ((res?.code ?? 200) === 200) {
    ElMessage.success(props.id ? '保存成功' : '新增成功');
    emit('success');
  } else {
    ElMessage.error(res?.msg ?? '操作失败');
  }
};

const validateFile = (file: File) => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'jpeg', 'png'];
  const videoExt = ['mp4', 'mov', 'avi'];
  const docExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  const all = [...imageExt, ...videoExt, ...docExt];

  if (!all.includes(ext)) {
    ElMessage.error(`${ext.toUpperCase() || '该'}文件格式不正确，上传失败`);
    return false;
  }

  const MB = 1024 * 1024;
  const limit = imageExt.includes(ext) ? 10 * MB : videoExt.includes(ext) ? 500 * MB : 100 * MB;
  if (file.size > limit) {
    ElMessage.error(imageExt.includes(ext) ? '图片最大10MB' : videoExt.includes(ext) ? '视频最大500MB' : '文档最大100MB');
    return false;
  }
  return true;
};

const handleChange = (file: any) => {
  if (!validateFile(file.raw)) return;
  proxy?.$modal.loading('正在上传附件，请稍候...');
  ossUploadImage({ file: file.raw })
    .then((res) => {
      if (res.code === 200 && res.data?.ossId) {
        fileListtable.value.push({
          ossId: res.data.ossId,
          fileName: res.data.fileName,
          originalName: file.raw.name,
          fileSuffix: file.raw.type,
          url: res.data.url
        });
      } else {
        ElMessage.error('上传失败，请重试');
      }
    })
    .catch((error) => {
      console.error('上传失败:', error);
      ElMessage.error('上传失败，请重试');
    })
    .finally(() => proxy?.$modal.closeLoading());
};

const previewFile = async (file: any) => {
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败', error);
  }
};

const removeFile = (file: any) => {
  const index = fileListtable.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileListtable.value.splice(index, 1);
  }
};

onMounted(async () => {
  if (props.id) {
    console.log('[Edit]', props.id);
    const res = await getArticle(props.id);
    if ((res?.code ?? 500) === 200) {
      form.value = {
        ...form.value,
        ...res.data
      };
    } else {
      ElMessage.error(res?.msg ?? '获取文章信息失败');
    }
  }
});
</script>

<style scoped lang="scss">
.kb-edit {
  padding: 20px;
  background: #fff;

  .form-wrap {
    margin-top: 16px;
  }

  .side-card {
    height: 100%;
  }

  .btns {
    margin-top: 16px;
    display: flex;
    justify-content: center;
    gap: 12px;
  }
}

.title-text {
  font-size: 16px;
  font-weight: 600;
  color: #333333;
  margin-bottom: 20px;
}

.h20 {
  height: 20px;
}

.toc-container {
  cursor: pointer;
  width: 120px;
  height: 200px;
  background-color: #b42020;
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
</style>
