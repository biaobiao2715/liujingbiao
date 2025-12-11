<template>
  <el-dialog
    :model-value="props.visible"
    @update:model-value="(val) => emit('update:visible', val)"
    :title="dialogTitle"
    width="60%"
    :close-on-click-modal="false"
    append-to-body
    @close="handleClose"
  >
    <div class="permission-popup">
      <!-- 审核状态显示 -->
      <div v-if="isPendingAudit || isRejected || props.auditStatus == 1" class="audit-status-bar">
        <div class="status-label">申请状态：</div>
        <el-tag :type="getStatusTagType()" size="large">{{ getStatusLabel() }}</el-tag>
      </div>

      <!-- 审核意见（仅审核驳回时显示） -->
      <div v-if="isRejected && auditComment" class="audit-comment-bar">
        <div class="comment-label">审核意见：</div>
        <div class="comment-content">{{ auditComment }}</div>
      </div>

      <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px" class="permission-form">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="请输入企业名称" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码号" prop="licenseCode" class="no-wrap-label">
              <el-input
                v-model="formData.licenseCode"
                placeholder="请输入统一社会信用代码号"
                :disabled="isReadOnly"
                @input="handleLicenseCodeInput"
                maxlength="18"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业性质(类型)" prop="companyType">
              <el-select v-model="formData.companyType" placeholder="请选择企业性质" style="width: 100%" :disabled="isReadOnly">
                <!-- <el-option label="企业" value="1" />
                <el-option label="个体工商户" value="2" />
                <el-option label="合作社" value="3" /> -->
                <el-option v-for="item in companyTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="法人/联系人" prop="legalPerson">
              <el-input v-model="formData.legalPerson" placeholder="请输入法人/联系人" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="formData.contactPhone" placeholder="请输入联系电话" :disabled="isReadOnly" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" prop="address">
              <el-input
                v-model="formData.address"
                placeholder="请输入地址"
                :disabled="isReadOnly"
                @blur="handleAddressBlur"
                @keyup.enter="handleAddressBlur"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 位置选择 -->
        <el-form-item label="位置" prop="location">
          <AMap
            :model-value="mapData"
            @update:model-value="handleMapUpdate"
            map-id="permission-map"
            :address-sync-signal="addressSyncSignal"
            :disabled="isReadOnly"
          />
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
          <el-input v-model="formData.companyIntro" type="textarea" :rows="4" placeholder="请输入简介" :disabled="isReadOnly" />
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
                :disabled="isReadOnly"
                class="contract-uploader"
              >
                <el-button type="primary" icon="Upload" :disabled="isReadOnly">点击上传</el-button>
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
        <el-button @click="handleClose">{{ isReadOnly ? '关闭' : '关闭' }}</el-button>
        <el-button v-if="!isPendingAudit && !isReadOnly" type="primary" @click="handleSubmit" :loading="submitting">
          {{ isRejected ? '提交修改' : '提交申请' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Close, Loading } from '@element-plus/icons-vue';
import type { UploadUserFile } from 'element-plus';
import { uploadByChunks } from '@/utils/chunkUpload';
import { uploadFile as uploadContractFile, deleteFile as deleteContractFile } from '@/api/creditPlatform/loanApplications';
import { traceableCompany, updateTraceableCompany } from '@/api/permissionPopup';
import AMap from './AMap.vue';

const props = defineProps<{
  visible: boolean;
  initialData?: any; // 初始数据，用于回显
  auditStatus?: number | null; // 审核状态：0-待审核，1-审核通过，2-审核驳回
}>();
let companyTypeOptions = reactive([
  { label: '企业', value: '1' },
  { label: '个体工商户', value: '2' },
  { label: '合作社', value: '3' }
  // { label: '超管', value: '99' }
]);
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

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

let formData = reactive({
  id: '',
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
const auditComment = ref<string>(''); // 审核意见

// 计算属性：判断是否为只读模式（审核通过或待审核）
const isReadOnly = computed(() => props.auditStatus == 1 || props.auditStatus == 0);
// 计算属性：判断是否为待审核状态
const isPendingAudit = computed(() => props.auditStatus == 0);
// 计算属性：判断是否为审核驳回状态
const isRejected = computed(() => props.auditStatus == 2);

// 计算属性：根据审核状态动态显示标题
const dialogTitle = computed(() => {
  if (props.auditStatus === null || props.auditStatus === undefined) {
    // auditStatus 为空，显示申请页
    return '全链条溯源服务系统权限申请页';
  } else if (props.auditStatus == 0) {
    // 待审核
    return '全链条溯源服务系统权限待审批页';
  } else if (props.auditStatus == 1) {
    // 审核通过
    return '全链条溯源服务系统权限申请页';
  } else if (props.auditStatus == 2) {
    // 审核驳回
    return '全链条溯源服务系统权限审批驳回页';
  }
  // 默认
  return '全链条溯源服务系统权限申请页';
});

// 获取状态标签文本
const getStatusLabel = () => {
  if (props.auditStatus == 0) {
    return '待审批';
  } else if (props.auditStatus == 1) {
    return '审批通过';
  } else if (props.auditStatus == 2) {
    return '审批驳回';
  }
  return '';
};

// 获取状态标签类型
const getStatusTagType = () => {
  if (props.auditStatus == 0) {
    return 'warning'; // 待审批 - 橙色
  } else if (props.auditStatus == 1) {
    return 'success'; // 审批通过 - 绿色
  } else if (props.auditStatus == 2) {
    return 'danger'; // 审批驳回 - 红色
  }
  return 'info';
};

const rules: FormRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  licenseCode: [
    { required: true, message: '请输入统一社会信用代码号', trigger: 'blur' },
    {
      validator: (_: any, value: any, callback: any) => {
        if (!value) {
          callback();
          return;
        }
        // 长度校验：必须是18位
        if (value.length !== 18) {
          callback(new Error('统一社会信用代码必须是18位的字母和数字组合。'));
          return;
        }
        // 格式校验：仅支持数字(0-9)和大写字母(A-Z)
        const pattern = /^[0-9A-Z]{18}$/;
        if (!pattern.test(value)) {
          callback(new Error('统一社会信用代码必须是18位的字母和数字组合。'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ],
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

// 统一社会信用代码输入处理：自动转换为大写，只允许数字和大写字母
const handleLicenseCodeInput = (value: string) => {
  // 过滤掉非数字和非字母的字符，并将字母转换为大写
  const filtered = value.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  formData.licenseCode = filtered;
};

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

// 回显数据
const fillFormData = (data: any) => {
  if (!data) return;

  // 填充表单数据
  formData.id = data.id || '';
  formData.companyName = data.companyName || '';
  formData.licenseCode = data.licenseCode || '';
  formData.companyType = data.companyType || '';
  formData.legalPerson = data.legalPerson || '';
  formData.contactPhone = data.contactPhone || '';
  formData.address = data.address || '';
  formData.longitude = data.longitude || '';
  formData.latitude = data.latitude || '';
  formData.companyIntro = data.companyIntro || '';
  formData.licenseFileId = data.licenseFileId || '';

  // 填充审核意见
  auditComment.value = data.auditRemark || '';

  // 如果有文件URL，回显文件（优先使用 licenseFileName，如果没有则从 URL 中提取文件名）
  if (data.licenseFileUrl) {
    // 优先使用 API 返回的 licenseFileName，如果没有则从 URL 中提取文件名
    let fileName = data.licenseFileName || '营业执照';
    if (!data.licenseFileName && data.licenseFileUrl) {
      try {
        const urlParts = data.licenseFileUrl.split('/');
        const lastPart = urlParts[urlParts.length - 1];
        // 去掉 URL 参数（如果有）
        const fileNamePart = lastPart.split('?')[0];
        if (fileNamePart && fileNamePart.includes('.')) {
          fileName = fileNamePart;
        }
      } catch (e) {
        console.warn('从 URL 提取文件名失败:', e);
      }
    }

    licenseFiles.value = [
      {
        name: fileName,
        fileName: fileName,
        displayName: fileName,
        url: data.licenseFileUrl, // 使用 licenseFileUrl 作为显示地址
        serverUrl: data.licenseFileUrl, // 使用 licenseFileUrl 作为服务器地址
        ossId: data.licenseFileId || '',
        fileType: 'license',
        status: 'success',
        percentage: 100
      }
    ];
  }
};

// 监听弹窗显示和初始数据变化
watch(
  () => [props.visible, props.initialData, props.auditStatus],
  ([visible, initialData]) => {
    if (visible) {
      const { sys_enterprise_type } = toRefs<any>(proxy?.useDict('sys_enterprise_type'));
      companyTypeOptions = Object.assign(
        companyTypeOptions,
        sys_enterprise_type.value.splice(
          sys_enterprise_type.value.findIndex((item) => item.value === '99'),
          1
        )
      );
      console.log(companyTypeOptions);
      fillFormData(initialData);
    } else if (!visible) {
      // 弹窗关闭时，清空数据
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
      formData.id = '';
      auditComment.value = '';
    }
  },
  { immediate: true }
);

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
  formData.id = '';
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 准备提交数据
    const payload: any = {
      ...formData,
      licenseFileId: licenseFiles.value[0]?.ossId || '',
      licenseFileUrl: licenseFiles.value[0]?.serverUrl || licenseFiles.value[0]?.url || '',
      licenseFileName: licenseFiles.value[0]?.displayName || licenseFiles.value[0]?.fileName || licenseFiles.value[0]?.name || ''
    };

    try {
      // 根据审核状态调用不同的接口
      if (isRejected.value) {
        // 审核驳回，调用更新接口，添加 auditStatus = 0 表示重新提交待审核
        payload.auditStatus = 0;
        const response = await updateTraceableCompany(payload);
        ElMessage.success('修改成功');
      } else {
        // 首次申请，调用创建接口
        const response = await traceableCompany(payload);
        ElMessage.success('提交成功');
      }
      submitting.value = false;
      emit('submit', payload);
      // 提交成功后可以关闭弹窗
      handleClose();
    } catch (error: any) {
      submitting.value = false;
      ElMessage.error(error?.msg || error?.message || '提交失败，请重试');
      console.error('提交失败:', error);
    }
  } catch (error) {
    console.error('表单验证失败:', error);
    submitting.value = false;
  }
};
</script>

<style scoped lang="scss">
.permission-popup {
  .audit-status-bar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 16px;
    background-color: #f5f7fa;
    border-radius: 4px;

    .status-label {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }

    :deep(.el-tag) {
      font-size: 14px;
      padding: 4px 12px;
      font-weight: 500;
    }
  }

  .audit-comment-bar {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 20px;
    padding: 12px 16px;
    background-color: #fef0f0;
    border-radius: 4px;

    .comment-label {
      font-size: 14px;
      font-weight: 500;
      color: #303133;
      flex-shrink: 0;
    }

    .comment-content {
      font-size: 14px;
      color: #f56c6c;
      line-height: 1.5;
      flex: 1;
      word-break: break-word;
    }
  }

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

    .form-item-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 4px;
      line-height: 1.5;
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
