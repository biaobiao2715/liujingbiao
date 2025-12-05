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
      <div class="note-text">
        注:信息补充完整后提交申请,审核通过后可使用该系统具体功能
      </div>
      
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="140px"
        class="permission-form"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="formData.companyName" placeholder="请输入企业名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="统一社会信用代码号" prop="creditCode" class="no-wrap-label">
              <el-input v-model="formData.creditCode" placeholder="请输入统一社会信用代码号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业性质(类型)" prop="enterpriseType">
              <el-select v-model="formData.enterpriseType" placeholder="请选择企业性质" style="width: 100%">
                <el-option label="企业" value="enterprise" />
                <el-option label="供应商" value="supplier" />
                <el-option label="其他" value="other" />
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
              <el-input v-model="formData.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 位置选择 -->
        <el-form-item label="位置" prop="location">
          <AMap
            :model-value="mapData"
            @update:model-value="handleMapUpdate"
            map-id="permission-map"
          />
        </el-form-item>

        <!-- 简介 -->
        <el-form-item label="简介" prop="introduction">
          <el-input
            v-model="formData.introduction"
            type="textarea"
            :rows="4"
            placeholder="请输入简介"
          />
        </el-form-item>

        <!-- 营业执照附件 -->
        <el-form-item label="营业执照附件" prop="businessLicense">
          <el-upload
            class="license-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleLicenseChange"
            :on-remove="handleLicenseRemove"
            :file-list="licenseFileList"
            :limit="1"
            accept=".jpg,.jpeg,.png,.pdf"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="upload-tip">支持 JPG、PNG、PDF 格式，文件大小不超过10MB</div>
            </template>
          </el-upload>
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
import { ref, reactive, computed, watch } from 'vue';
import type { FormInstance, FormRules, UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
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

const formData = reactive({
  companyName: '',
  creditCode: '',
  enterpriseType: '',
  legalPerson: '',
  contactPhone: '',
  address: '',
  longitude: '',
  latitude: '',
  introduction: '',
  businessLicense: null as File | null
});

const licenseFileList = ref<UploadFile[]>([]);

const rules: FormRules = {
  companyName: [{ required: true, message: '请输入企业名称', trigger: 'blur' }],
  creditCode: [{ required: true, message: '请输入统一社会信用代码号', trigger: 'blur' }],
  enterpriseType: [{ required: true, message: '请选择企业性质', trigger: 'change' }],
  legalPerson: [{ required: true, message: '请输入法人/联系人', trigger: 'blur' }],
  contactPhone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  introduction: [{ required: true, message: '请输入简介', trigger: 'blur' }],
  businessLicense: [{ required: true, message: '请上传营业执照附件', trigger: 'change' }]
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

// 地图更新处理
const handleMapUpdate = (val: any) => {
  if (val) {
    formData.longitude = val.longitude || '';
    formData.latitude = val.latitude || '';
    formData.address = val.address || '';
  }
};

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
  // 重置表单
  formRef.value?.resetFields();
  licenseFileList.value = [];
  formData.businessLicense = null;
};

const handleLicenseChange = (file: UploadFile) => {
  const rawFile = file.raw;
  if (rawFile) {
    // 检查文件大小（10MB）
    const maxSize = 10 * 1024 * 1024;
    if (rawFile.size > maxSize) {
      ElMessage.error('文件大小不能超过10MB');
      return;
    }
    formData.businessLicense = rawFile;
    licenseFileList.value = [file];
  }
};

const handleLicenseRemove = () => {
  formData.businessLicense = null;
  licenseFileList.value = [];
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitting.value = true;

    // 这里调用提交接口
    // const formDataToSubmit = new FormData();
    // Object.keys(formData).forEach(key => {
    //   if (key === 'businessLicense' && formData.businessLicense) {
    //     formDataToSubmit.append(key, formData.businessLicense);
    //   } else {
    //     formDataToSubmit.append(key, formData[key]);
    //   }
    // });

    // 模拟提交
    setTimeout(() => {
      ElMessage.success('提交成功');
      submitting.value = false;
      emit('submit', { ...formData });
      handleClose();
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
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>


