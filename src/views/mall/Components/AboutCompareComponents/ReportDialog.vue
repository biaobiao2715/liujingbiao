<template>
  <el-dialog v-model="visible" title="我要举报" width="750px" append-to-body @closed="handleClosed">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
      <el-form-item label="举报类别：" prop="category" required>
        <el-select v-model="form.category" placeholder="请选择">
          <el-option
            v-for="dict in report_type_id"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="被举报方：" prop="target" required>
        <el-input v-model="form.target" maxlength="50" placeholder="带出被举报方信息" disabled />
      </el-form-item>
      <el-form-item label="举报商品：" prop="goodsInfo" required>
        <el-input v-model="form.goodsInfo" maxlength="50" placeholder="带出举报商品信息" disabled />
      </el-form-item>
      <el-form-item label="举报材料：" prop="filesCount" required>
        <el-upload
          class="report-uploader"
          ref="uploaderRef"
          :file-list="fileList"
          list-type="picture-card"
          action="#"
          :http-request="handleUpload"
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
        <el-button type="primary" :loading="submitting" @click="handleSubmit">提交</el-button>
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
import { ref, reactive, watch, toRefs, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadUserFile } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import { uploadFile as uploadReportFile, deleteFile as deleteReportFile, report } from '@/api/mall/goods/index';

interface ReportMaterial extends UploadUserFile {
  ossId?: string | number;
  fileName?: string;
  fileType?: string;
  url?: string;
}

interface ReportApiMaterial {
  ossId?: string | number;
  fileName?: string;
  fileType?: string;
  url?: string;
}

interface ReportSubmitPayload {
  reportPersonId: string | number;
  reportDescription: string;
  reportGoodsCode: string | number;
  reportTypeId: string;
  ossList: ReportApiMaterial[];
}

const props = defineProps<{
  modelValue: boolean;
  reportPersonId?: string | number;
  reportGoodsCode?: string | number;
  defaultTarget?: string;
  defaultGoodsInfo?: string;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const dictData = reactive(proxy?.useDict('report_type_id') ?? { report_type_id: [] });
const { report_type_id } = toRefs<any>(dictData);

const emit = defineEmits<{
  'update:modelValue': [val: boolean];
  submit: [data: ReportSubmitPayload];
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

const fileList = ref<ReportMaterial[]>([]);
const uploaderRef = ref();
const preview = reactive({
  visible: false,
  url: '',
  isVideo: false
});

const submitting = ref(false);

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
const handleUpload = (file: any) =>
  new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file.file);
    uploadReportFile(fd)
      .then((response: any) => {
        const data = response?.data || {};
        const fileName = data.fileName || file.file.name;
        const newFile: ReportMaterial = {
          fileName,
          name: fileName,
          url: data.url,
          ossId: data.ossId,
          fileType: isVideo({ name: fileName }) ? '1' : '0',
          status: 'success'
        };
        fileList.value.push(newFile);
        form.filesCount = fileList.value.length;
        resolve(newFile);
      })
      .catch((error: any) => {
        ElMessage.error(error?.msg || '文件上传失败，请重试');
        try {
          (uploaderRef.value as any)?.handleRemove(file);
        } catch {
          // ignore
        }
        reject(error);
      });
  });
const handleRemove = async (file: ReportMaterial) => {
  if (file?.ossId) {
    try {
      await deleteReportFile([file.ossId]);
    } catch (error: any) {
      ElMessage.error(error?.msg || '删除文件失败，请重试');
      return;
    }
  }
  const idx = fileList.value.findIndex((f) => f.url === file.url);
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

const buildPayload = (): ReportSubmitPayload => ({
  reportPersonId: props.reportPersonId as string | number,
  reportDescription: form.desc,
  reportGoodsCode: props.reportGoodsCode as string | number,
  reportTypeId: form.category,
  ossList: fileList.value.map((item) => ({
    ossId: item.ossId,
    fileName: item.fileName,
    fileType: item.fileType ?? (isVideo({ name: item.fileName || item.name || '' }) ? '1' : '0'),
    url: item.url
  }))
});

const handleSubmit = () => {
  if (!formRef.value || submitting.value) return;
  formRef.value.validate(async (valid: boolean) => {
    if (!valid) return;
    if (!props.reportPersonId) {
      ElMessage.error('缺少被举报方信息，无法提交');
      return;
    }
    if (!props.reportGoodsCode) {
      ElMessage.error('缺少举报商品信息，无法提交');
      return;
    }

    const payload = buildPayload();
    submitting.value = true;
    try {
      await report(payload);
      ElMessage.success('已提交举报');
      emit('submit', payload);
      visible.value = false;
    } catch (error: any) {
      ElMessage.error(error?.msg || '举报提交失败，请稍后重试');
    } finally {
      submitting.value = false;
    }
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


