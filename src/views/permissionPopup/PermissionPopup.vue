<template>
  <el-dialog
    :model-value="props.visible"
    @update:model-value="(val) => emit('update:visible', val)"
    title="全链条溯源服务系统权限申请页"
    width="60%"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <div class="permission-popup">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" class="permission-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="请输入企业名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码号" prop="licenseCode" class="no-wrap-label">
              <el-input v-model="formData.licenseCode" placeholder="请输入统一社会信用代码号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业性质(类型)" prop="companyType">
              <el-select v-model="formData.companyType" placeholder="请选择企业性质" style="width: 100%">
                <el-option label="企业" value="enterprise" />
                <el-option label="个体工商户" value="supplier" />
                <el-option label="合作社" value="other" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人/联系人" prop="legalPerson">
              <el-input v-model="formData.legalPerson" placeholder="请输入法人/联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" prop="address">
              <el-input v-model="formData.address" placeholder="请输入地址" @blur="handleAddressBlur" @keyup.enter="handleAddressBlur" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 位置选择 -->
        <el-form-item label="位置" prop="location">
          <AMap :model-value="mapData" @update:model-value="handleMapUpdate" map-id="permission-map" :address-sync-signal="addressSyncSignal" />
        </el-form-item>

        <!-- 经纬度显示，与上方布局对齐 -->
        <el-row :gutter="20" class="coord-row">
          <el-col :span="12">
            <el-form-item label="经度">
              <el-input v-model="formData.longitude" readonly />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="纬度">
              <el-input v-model="formData.latitude" readonly />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 简介 -->
        <el-form-item label="简介" prop="companyIntro">
          <el-input v-model="formData.companyIntro" type="textarea" :rows="4" placeholder="请输入简介" />
        </el-form-item>

        <!-- 营业执照附件（上传逻辑与 RepaymentPlanDialog 对齐） -->
        <el-form-item label="营业执照附件" prop="licenseFileId">
          <div class="upload-row">
            <div class="upload-inline" :class="{ 'uploading-layout': licenseFiles.length && licenseFiles[0].status === 'uploading' }">
              <div class="contract-files" v-if="licenseFiles.length">
                <div class="contract-file-item">
                  <template v-if="licenseFiles[0].status === 'success'">
                    <el-link :href="licenseFiles[0].serverUrl || licenseFiles[0].url" target="_blank" type="primary" class="contract-link">
                      {{ licenseFiles[0].displayName || licenseFiles[0].name }}
                    </el-link>
                    <el-icon class="file-remove-icon" @click.stop="handleDeleteFile" title="删除文件">
                      <Close />
                    </el-icon>
                  </template>
                  <template v-else-if="licenseFiles[0].status === 'uploading'">
                    <div class="uploading-status">
                      <el-icon class="uploading-icon"><Loading /></el-icon>
                      <span class="uploading-text">上传中...</span>
                    </div>
                  </template>
                </div>
              </div>
              <el-upload
                v-if="!licenseFiles.length || (licenseFiles.length > 0 && licenseFiles[0].status !== 'success')"
                ref="uploaderRef"
                :file-list="licenseFiles"
                action="#"
                accept=".jpg,.jpeg,.png"
                :http-request="handleUpload"
                :before-upload="beforeUpload"
                :on-remove="handleLicenseRemove"
                :limit="1"
                class="contract-uploader"
              >
                <el-button type="primary" icon="Upload">点击上传</el-button>
                <template #tip>
                  <div class="upload-tip">仅支持 JPG、PNG 图片，大小不超过10MB</div>
                </template>
              </el-upload>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消申请</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">提交申请</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Close, Loading } from '@element-plus/icons-vue';
import type { UploadUserFile } from 'element-plus';
import { uploadByChunks } from '@/utils/chunkUpload';
import { uploadFile as uploadContractFile, deleteFile as deleteContractFile } from '@/api/creditPlatform/loanApplications';
import AMap from './AMap.vue';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  (event: 'update:visible', value: boolean): void;
  (event: 'close'): void;
  (event: 'submit', data: any): void;
}>();

const formRef = ref<FormInstance>();
const submitting = ref(false);

interface LicenseFile extends UploadUserFile {
  ossId?: string | number;
  fileName?: string;
  fileType?: string;
  url?: string;
  serverUrl?: string;
  percentage?: number;
  status?: 'ready' | 'uploading' | 'success' | 'fail';
  displayName?: string;
}

const formData = reactive({
  companyName: '',
  licenseCode: '',
  companyType: '',
  legalPerson: '',
  contactPhone: '',
  address: '',
  longitude: '',
  latitude: '',
  companyIntro: '',
  // 用于校验：上传成功后写入 ossId
  licenseFileId: ''
});

const licenseFiles = ref<LicenseFile[]>([]);
const uploaderRef = ref();
const objectUrls = new Map<string, string>();
const addressSyncSignal = ref(0);

const rules: FormRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  licenseCode: [{ required: true, message: '请输入统一社会信用代码号', trigger: 'blur' }],
  companyType: [{ required: true, message: '请选择企业性质', trigger: 'change' }],
  legalPerson: [{ required: true, message: '请输入法人/联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  companyIntro: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  licenseFileId: [
    {
      required: true,
      validator: (_: any, __: any, callback: any) => {
        if (licenseFiles.value.length && licenseFiles.value[0].status === 'success') {
          callback();
        } else {
          callback(new Error('请上传营业执照附件'));
        }
      },
      trigger: 'change'
    }
  ]
};

// 地图数据
const mapData = computed({
  get() {
    return {
      longitude: formData.longitude,
      latitude: formData.latitude,
      address: formData.address
    };
  },
  set(val) {
    if (val) {
      formData.longitude = val.longitude || '';
      formData.latitude = val.latitude || '';
      formData.address = val.address || '';
    }
  }
});

// 地址输入框失焦后，同步地图位置
const handleAddressBlur = () => {
  addressSyncSignal.value += 1;
};

// 地图更新处理
const handleMapUpdate = (val: any) => {
  if (val) {
    formData.longitude = val.longitude || '';
    formData.latitude = val.latitude || '';
    formData.address = val.address || '';
  }
};

// 上传前校验（按业务要求：JPG/PNG，<=10MB，单文件）
const beforeUpload = (file: any) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  const isValidType = allowedTypes.includes(file.type);

  if (!isValidType) {
    ElMessage.error('只能上传 JPG、PNG 格式的图片！');
    return false;
  }

  // 重复文件拦截（按名称简单判断）
  if (licenseFiles.value.some((f) => (f.fileName || f.name) === file.name)) {
    ElMessage.error('已选择相同文件，请勿重复上传');
    return false;
  }

  // 文件大小限制（10MB）
  const sizeMB = file.size / 1024 / 1024;
  if (sizeMB > 10) {
    ElMessage.error('上传文件大小不能超过10MB!');
    return false;
  }

  // 限制只能上传一个文件
  if (licenseFiles.value.length >= 1) {
    ElMessage.error('只能上传一个附件');
    return false;
  }

  return true;
};

// 自定义上传（与 RepaymentPlanDialog 一致）
const MAX_SIZE = 5 * 1024 * 1024; // 5MB：大文件走分片
const handleUpload = (req: any) =>
  new Promise(async (resolve, reject) => {
    const rawFile = req.file;
    const tempUrl = URL.createObjectURL(rawFile);
    const tempItem: LicenseFile = {
      fileName: rawFile.name,
      name: rawFile.name,
      displayName: rawFile.name,
      url: tempUrl,
      fileType: 'license',
      status: 'uploading',
      percentage: 0
    };
    licenseFiles.value = [tempItem];
    objectUrls.set(rawFile.name, tempUrl);
    try {
      if (rawFile.size > MAX_SIZE) {
        const res: any = await uploadByChunks(rawFile, (percent: number) => {
          if (typeof req.onProgress === 'function') req.onProgress({ percent });
        });
        const uploadedFile: LicenseFile = {
          fileName: res.fileName || rawFile.name,
          name: res.fileName || rawFile.name,
          displayName: res.fileName || rawFile.name,
          url: tempUrl,
          serverUrl: res.url,
          ossId: res.ossId,
          fileType: 'license',
          status: 'success',
          percentage: 100
        };
        licenseFiles.value = [uploadedFile];
        formData.licenseFileId = String(res.ossId || '');
        ElMessage.success('文件上传成功');
        if (typeof req.onSuccess === 'function') req.onSuccess(res);
        return resolve(uploadedFile);
      }

      const fd = new FormData();
      fd.append('file', rawFile);
      const response: any = await uploadContractFile(fd);
      const data = response?.data || {};
      const fileName = data.fileName || rawFile.name;
      const uploadedFile: LicenseFile = {
        fileName: fileName,
        name: fileName,
        displayName: fileName,
        url: tempUrl,
        serverUrl: data.url,
        ossId: data.ossId,
        fileType: 'license',
        status: 'success',
        percentage: 100
      };
      licenseFiles.value = [uploadedFile];
      formData.licenseFileId = String(data.ossId || '');
      ElMessage.success('文件上传成功');
      if (typeof req.onSuccess === 'function') req.onSuccess(data);
      return resolve(uploadedFile);
    } catch (error: any) {
      ElMessage.error(error?.msg || '文件上传失败，请重试');
      const idx = licenseFiles.value.indexOf(tempItem);
      if (idx > -1) licenseFiles.value.splice(idx, 1);
      try {
        URL.revokeObjectURL(tempUrl);
      } catch {}
      try {
        (uploaderRef.value as any)?.handleRemove(tempItem);
      } catch {}
      if (typeof req.onError === 'function') req.onError(error);
      reject(error);
    }
  });

// 删除文件
const handleLicenseRemove = async (file: LicenseFile) => {
  if (file?.ossId) {
    try {
      await deleteContractFile([file.ossId]);
    } catch (error: any) {
      ElMessage.error(error?.msg || '删除文件失败，请重试');
      return;
    }
  }
  const idx = licenseFiles.value.findIndex((f) => f.url === file.url || f.serverUrl === file.serverUrl);
  if (idx > -1) licenseFiles.value.splice(idx, 1);
  formData.licenseFileId = '';
  if (file?.url && file.url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(file.url);
    } catch {}
  }
};

const handleDeleteFile = async () => {
  if (!licenseFiles.value.length) return;
  await handleLicenseRemove(licenseFiles.value[0]);
};

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
  formRef.value?.resetFields();
  licenseFiles.value.forEach((file) => {
    if (file?.url && file.url.startsWith('blob:')) {
      try {
        URL.revokeObjectURL(file.url);
      } catch {}
    }
  });
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
  objectUrls.clear();
  licenseFiles.value = [];
  formData.licenseFileId = '';
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 此处可调用真实提交接口；带上附件 ossId 与下载地址
    const payload = {
      ...formData,
      licenseFileId: licenseFiles.value[0]?.ossId || ''
      // businessLicenseUrl: licenseFiles.value[0]?.serverUrl || licenseFiles.value[0]?.url || ''
    };
    console.log(payload);
    // 模拟提交
    setTimeout(() => {
      ElMessage.success('提交成功');
      submitting.value = false;
      emit('submit', payload);
      // handleClose();
    }, 1000);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};
</script>

<style scoped lang="scss">
.permission-popup {
  .note-text {
    color: #f56c6c;
    font-size: 14px;
    margin-bottom: 20px;
    text-align: right;
  }

  .permission-form {
    :deep(.no-wrap-label) {
      .el-form-item__label {
        white-space: nowrap;
      }
    }

    .license-uploader {
      :deep(.el-upload) {
        .el-button {
          margin-right: 12px;
        }
      }

      .upload-tip {
        color: #909399;
        font-size: 12px;
        margin-top: 8px;
      }
    }

    .upload-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .upload-inline {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;

      &.uploading-layout {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
    }

    .contract-files {
      display: flex;
      align-items: center;
    }

    .contract-file-item {
      position: relative;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background-color 0.2s;

      &:hover {
        background-color: #f5f7fa;

        .file-remove-icon {
          opacity: 1;
        }
      }
    }

    .contract-link {
      font-size: 14px;
    }

    .uploading-status {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #409eff;
      font-size: 14px;

      .uploading-icon {
        animation: rotating 2s linear infinite;
      }

      .uploading-text {
        color: #409eff;
      }
    }

    @keyframes rotating {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

    .file-remove-icon {
      position: absolute;
      top: -6px;
      right: -6px;
      font-size: 16px;
      color: #f56c6c;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
      background: white;
      border-radius: 50%;
      padding: 2px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

      &:hover {
        color: #f23030;
      }
    }

    .contract-uploader {
      display: inline-flex;
      align-items: center;

      :deep(.el-upload-list) {
        display: none;
      }

      .upload-tip {
        color: #909399;
        font-size: 12px;
        margin-left: 12px;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>
