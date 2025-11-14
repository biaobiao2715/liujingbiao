<template>
  <el-dialog v-model="visible" title="我要举报" width="750px" append-to-body @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="举报类别：" prop="category" required>
        <el-select v-model="form.category" placeholder="请选择">
          <el-option label="虚假信息" value="falseInfo" />
          <el-option label="诈骗行为" value="fraud" />
          <el-option label="侵权/违法" value="rights" />
          <el-option label="其他" value="other" />
        </el-select>
      </el-form-item>
      <el-form-item label="被举报方：" prop="target" required>
        <el-input v-model="form.target" maxlength="50" placeholder="带出被举报方信息" />
      </el-form-item>
      <el-form-item label="举报商品：" prop="goodsInfo" required>
        <el-input v-model="form.goodsInfo" maxlength="50" placeholder="带出举报商品信息" />
      </el-form-item>
      <el-form-item label="举报材料：" prop="filesCount" required>
        <el-upload
          class="report-uploader"
          ref="uploaderRef"
          :file-list="fileList"
          list-type="picture-card"
          action="#"
          :http-request="uploadFile"
          :before-upload="handleBeforeUpload"
          :on-remove="handleRemove"
          :on-exceed="handleExceed"
          :on-preview="onPreview"
          multiple
          :limit="9"
          accept=".jpg,.jpeg,.png,.mp4,.mov,.avi"
        >
          <el-icon><Plus /></el-icon>
        </el-upload>
        <div class="el-upload__tip" style="color:#f56c6c;margin-top:8px;">
          注：支持jpg、jpeg、png三种图片格式，最多上传六张图片，每张≤10MB；支持MP4、mov、avi三种视频格式，最多上传三个视频，每个≤200MB
        </div>
      </el-form-item>
      <el-form-item label="举报描述：" prop="desc" required>
        <el-input
          v-model="form.desc"
          type="textarea"
          :rows="4"
          maxlength="200"
          show-word-limit
          placeholder="请输入举报描述，最长200个字"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div style="text-align:center">
        <el-button type="primary" @click="handleSubmit">提交</el-button>
      </div>
    </template>
    <!-- 预览弹窗 -->
    <el-dialog v-model="preview.visible" width="60%" append-to-body>
      <template #default>
        <img v-if="!preview.isVideo" :src="preview.url" alt="" style="width: 100%; display: block;" />
        <video v-else :src="preview.url" style="width: 100%; display: block;" controls></video>
      </template>
    </el-dialog>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { ossUploadImage } from '@/api/mall/personalCenter/orders';

const props = defineProps<{
  modelValue: boolean;
  defaultTarget?: string;
  defaultGoodsInfo?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  submit: [data: FormData];
  closed: [];
}>();

const visible = ref(false);
watch(
  () => props.modelValue,
  (v) => {
    visible.value = v;
    if (v) initDefaults();
  },
  { immediate: true }
);
watch(visible, (v) => emit('update:modelValue', v));

const formRef = ref();
const form = reactive({
  category: '',
  target: '',
  goodsInfo: '',
  desc: '',
  filesCount: 0
});

const rules = {
  category: [{ required: true, message: '请选择举报类别', trigger: 'change' }],
  target: [{ required: true, message: '请输入被举报方', trigger: 'blur' }],
  goodsInfo: [{ required: true, message: '请输入举报商品', trigger: 'blur' }],
  desc: [{ required: true, message: '请输入举报描述', trigger: 'blur' }],
  filesCount: [
    {
      validator: (_: any, __: any, cb: Function) => {
        if (!fileList.value || fileList.value.length === 0) {
          cb(new Error('请至少上传一份材料'));
        } else {
          cb();
        }
      },
      trigger: 'change'
    }
  ]
};

const fileList = ref<any[]>([]);
const uploaderRef = ref();
const preview = reactive({
  visible: false,
  url: '',
  isVideo: false
});

const MAX_IMAGE = 6;
const MAX_VIDEO = 3;
const imageExt = ['jpg', 'jpeg', 'png'];
const videoExt = ['mp4', 'mov', 'avi'];
const getExt = (name: string) => {
  const i = name.lastIndexOf('.');
  return i > -1 ? name.slice(i + 1).toLowerCase() : '';
};
const isImage = (file: any) => imageExt.includes(getExt(file.name || ''));
const isVideo = (file: any) => videoExt.includes(getExt(file.name || ''));
const countTypes = () => {
  let img = 0, vid = 0;
  fileList.value.forEach((f: any) => {
    if (isImage(f)) img += 1;
    else if (isVideo(f)) vid += 1;
  });
  return { img, vid };
};
const handleBeforeUpload = (file: any) => {
  const ext = getExt(file.name || '');
  const isImg = imageExt.includes(ext);
  const isVid = videoExt.includes(ext);
  if (!isImg && !isVid) {
    ElMessage.error('仅支持jpg/jpeg/png图片或mp4/mov/avi视频!');
    return false;
  }
  const sizeMB = file.size / 1024 / 1024;
  if (isImg && sizeMB > 10) {
    ElMessage.error('上传图片大小不能超过10MB!');
    return false;
  }
  if (isVid && sizeMB > 200) {
    ElMessage.error('上传视频大小不能超过200MB!');
    return false;
  }
  const { img, vid } = countTypes();
  if (isImg && img >= MAX_IMAGE) {
    ElMessage.error('最多上传六张图片');
    return false;
  }
  if (isVid && vid >= MAX_VIDEO) {
    ElMessage.error('最多上传三个视频');
    return false;
  }
  return true;
};
const handleExceed = () => ElMessage.error('已达到最多可选择的文件数量');
const uploadFile = (file: any) =>
  new Promise((resolve, reject) => {
    ossUploadImage({ file: file.file })
      .then((response: any) => {
        const newFile = {
          name: response.data.fileName || file.file.name,
          url: response.data.url,
          ossId: response.data.ossId,
          fileType: '0'
        };
        fileList.value.push(newFile);
        form.filesCount = fileList.value.length;
        resolve(newFile);
      })
      .catch((error: any) => {
        ElMessage.error(error?.msg || '文件上传失败，请重试');
        try { (uploaderRef.value as any)?.handleRemove(file); } catch {}
        reject(error);
      });
  });
const handleRemove = (file: any) => {
  const idx = fileList.value.map((f: any) => f.url).indexOf(file.url);
  if (idx > -1) fileList.value.splice(idx, 1);
  form.filesCount = fileList.value.length;
};
const onPreview = (file: any) => {
  const url = file?.url || '';
  preview.url = url;
  const name = String(file?.name || '').toLowerCase();
  preview.isVideo = /\.(mp4|mov|avi|m4v|webm)$/.test(name);
  preview.visible = true;
};

const initDefaults = () => {
  form.category = '';
  form.target = props.defaultTarget || '';
  form.goodsInfo = props.defaultGoodsInfo || '';
  form.desc = '';
  form.filesCount = 0;
  fileList.value = [];
};

const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate((valid: boolean) => {
    if (!valid) return;
    const fd = new FormData();
    fd.set('category', form.category);
    fd.set('target', form.target);
    fd.set('goodsInfo', form.goodsInfo);
    fd.set('desc', form.desc);
    fd.set('materials', JSON.stringify(fileList.value));
    emit('submit', fd);
    visible.value = false;
    ElMessage.success('已提交举报');
  });
};

const handleClosed = () => {
  emit('closed');
};
</script>

<style scoped>
.report-uploader .el-upload--picture-card {
  border: 1px dashed #c0ccda;
}
.report-uploader .el-upload--picture-card .el-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>


