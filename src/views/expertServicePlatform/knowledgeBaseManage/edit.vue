<!--
  标题: edit.vue
  功能: 新增/编辑共用页
  说明: 用于知识库文章的新增与编辑
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="kb-edit">
    <el-page-header @back="handleBack" :content="id ? '编辑知识库' : '新增知识库'" />

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
            </el-select> </el-form-item
        ></el-col>

        <el-col :span="12"></el-col>
        <el-col :span="24">
          <el-form-item label="正文编辑" prop="articleContent">
            <editor v-model="form.articleContent" :min-height="192" />
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
            </el-select> </el-form-item
        ></el-col>
      </el-row>

      <div class="btns">
        <!-- <el-button v-throttle type="primary" @click="submit('0')">保存草稿</el-button> -->
        <el-button v-throttle type="primary" @click="submit()">发布</el-button>
        <el-button v-throttle @click="handleBack">返回</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, type ComponentInternalInstance, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addArticle, getArticle, updateArticle, ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
const router = useRouter();
const route = useRoute();
const { id } = route.query;
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));

const article_status = computed(() => [
  // { value: '0', label: '草稿' },
  { value: '2', label: '已启用' },
  { value: '3', label: '已禁用' }
]);
const form = ref<any>({
  articleTitle: '',
  articleType: '',
  articleContent: '',
  articleStatus: '2' // 默认草稿
});
const formRef = ref();
const fileListtable = ref<Array<any>>([]); // 附件列表

const rules = {
  articleTitle: [
    { required: true, message: '请输入文章标题', trigger: 'blur' },
    { validator: (_: any, v: string, cb: any) => (v && v.length <= 30 ? cb() : cb(new Error('标题最多30个字'))), trigger: 'blur' }
  ],
  articleType: [{ required: true, message: '请选择文章类别', trigger: 'change' }],
  articleContent: [{ required: true, message: '请输入正文内容', trigger: 'blur' }],
  articleStatus: [{ required: true, message: '请选择文章状态', trigger: 'change' }]
};

const handleBack = () => router.back();

const submit = async () => {
  await formRef.value?.validate();
  const payload = {
    ...form.value,
    ossVoList: fileListtable.value
  };
  const api = id ? updateArticle : addArticle;
  const res = await api(payload);
  if ((res?.code ?? 200) === 200) {
    ElMessage.success(id ? '保存成功' : '新增成功');
    handleBack();
  } else {
    ElMessage.error(res?.msg ?? '操作失败');
  }
};

// 替换原 beforeUpload：按文件类型分别限制大小（图片10MB、视频500MB、文档100MB），并校验格式
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

// 处理文件选择：先校验格式与大小，再上传
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

// 预览文件
const previewFile = async (file: any) => {
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.fileName; // 设置文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放 URL 对象
  } catch (error) {
    console.error('下载失败', error);
  }
  console.log('预览文件:', file);
};

// 删除文件
const removeFile = (file: any) => {
  const index = fileListtable.value.findIndex((f) => f.uid === file.uid);
  if (index !== -1) {
    fileListtable.value.splice(index, 1);
  }
};

onMounted(async () => {
  if (id) {
    const res = await getArticle(Number(id));
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
</style>
