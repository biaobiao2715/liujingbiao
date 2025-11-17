<!-- 产品管理-保险新增/编辑页 -->
<template>
  <div class="product-insurance-form" v-loading="loading">
    <div class="section-title">基础信息</div>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="产品名称" prop="productName">
            <el-input
              v-model="formData.productName"
              placeholder="请输入产品名称"
              maxlength="50"
              show-word-limit
              clearable
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="适用对象" prop="applicableObject">
            <el-select v-model="formData.applicableObject" placeholder="请选择适用对象" clearable>
              <el-option
                v-for="dict in applicable_object"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="产品类型" prop="productType">
            <el-select v-model="formData.productType" placeholder="请选择产品类型" clearable>
              <el-option
                v-for="dict in product_insurance_type"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="产品简介" prop="productIntro">
        <el-input
          v-model="formData.productIntro"
          type="textarea"
          :rows="3"
          maxlength="100"
          show-word-limit
          placeholder="请输入产品简介（不超过100字）"
          clearable
        />
      </el-form-item>

      <el-form-item label="产品优势" prop="productAdvantages">
        <Editor v-model="formData.productAdvantages" :height="420" :minHeight="420" :key="advantagesEditorKey" />
      </el-form-item>

      <el-form-item label="保障计划" prop="guaranteePlan">
        <Editor v-model="formData.guaranteePlan" :height="420" :minHeight="420" :key="guaranteePlanEditorKey" />
      </el-form-item>

      <el-form-item label="申请条件" prop="applicationInstructions">
        <Editor v-model="formData.applicationInstructions" :height="420" :minHeight="420" :key="applicationEditorKey" />
      </el-form-item>

      <el-form-item label="产品备注" prop="productRemark">
        <el-input
          v-model="formData.productRemark"
          type="textarea"
          :rows="3"
          maxlength="100"
          show-word-limit
          placeholder="具体开办的业务种类及办理程序、办理条件等以线下网点信息为准。"
          clearable
        />
      </el-form-item>

      <el-form-item label="网点清单" prop="branchOfficeAttachment">
        <div class="attachment-upload">
          <el-upload
            class="upload-block"
            :file-list="attachmentFileList"
            :http-request="handleAttachmentUpload"
            :before-upload="beforeAttachmentUpload"
            :on-remove="handleAttachmentRemove"
            accept=".pdf"
            :limit="1"
            action=""
            list-type="text"
          >
            <el-button type="primary" plain>上传PDF文件</el-button>
          </el-upload>
          <p class="attachment-tip">注：请上传PDF文件，大小不超过 10MB</p>
        </div>
      </el-form-item>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '保存' : '确认修改' }}
        </el-button>
        <el-button @click="emitCancel">取消</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus';
import { addInsuranceProduct, editInsuranceProduct, insuranceProductDetail } from '@/api/creditPlatform/productInsuranceManage';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';

const Editor = defineAsyncComponent(() => import('@/components/Editor/index.vue'));

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit' | 'view';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { product_insurance_type, applicable_object, product_status } = toRefs<any>(
  proxy?.useDict('product_insurance_type', 'applicable_object', 'product_status')
);

const formRef = ref<FormInstance>();
const saving = ref(false);
const loading = ref(false);
const advantagesEditorKey = ref(0);
const guaranteePlanEditorKey = ref(0);
const applicationEditorKey = ref(0);

interface InsuranceProductForm {
  productName: string;
  productType: string;
  applicableObject: string;
  productIntro: string;
  productAdvantages: string;
  guaranteePlan: string;
  applicationInstructions: string;
  branchOfficeAttachment?: string | number | null;
  branchOfficeAttachmentName?: string;
  productRemark: string;
}

const formData = ref<InsuranceProductForm>({
  productName: '',
  productType: '',
  applicableObject: '',
  productIntro: '',
  productAdvantages: '',
  guaranteePlan: '',
  applicationInstructions: '',
  branchOfficeAttachment: null,
  branchOfficeAttachmentName: '',
  productRemark: ''
});

const attachmentFileList = ref<UploadFile[]>([]);

const rules: FormRules = {
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '产品名称长度需在1~50个字符内', trigger: 'blur' }
  ],
  productType: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  applicableObject: [{ required: true, message: '请选择适用对象', trigger: 'change' }],
  productIntro: [
    { required: true, message: '请输入产品简介', trigger: 'blur' },
    { min: 5, max: 100, message: '产品简介长度需在5~100个字符内', trigger: 'blur' }
  ],
  productAdvantages: [
    { required: true, message: '请输入产品优势', trigger: 'change' }
  ],
  guaranteePlan: [
    { required: true, message: '请输入保障计划', trigger: 'change' }
  ],
  applicationInstructions: [
    { required: true, message: '请输入申请条件', trigger: 'change' }
  ]
};

const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      const payload: any = {
        productName: formData.value.productName,
        productType: formData.value.productType,
        applicableObject: formData.value.applicableObject,
        productIntro: formData.value.productIntro,
        productAdvantages: formData.value.productAdvantages,
        guaranteePlan: formData.value.guaranteePlan,
        applicationInstructions: formData.value.applicationInstructions,
        productRemark: formData.value.productRemark || ''
      };
      if (formData.value.branchOfficeAttachment) {
        payload.branchOfficeAttachment = formData.value.branchOfficeAttachment;
      }
      if (props.type === 'edit') {
        payload.id = props.id;
        payload.optType = '1';
      }
      const response = props.type === 'edit' 
        ? await editInsuranceProduct(payload)
        : await addInsuranceProduct(payload);
      if (response && response.code === 200) {
        ElMessage.success(props.type === 'edit' ? '修改成功' : '新增成功');
        emit('success');
      } else {
        ElMessage.error(response?.msg || (props.type === 'edit' ? '修改失败' : '新增失败'));
      }
    } catch (error: any) {
      ElMessage.error(error?.message || (props.type === 'edit' ? '修改失败，请稍后重试' : '新增失败，请稍后重试'));
    } finally {
      saving.value = false;
    }
  });
};

const beforeAttachmentUpload: UploadProps['beforeUpload'] = (file) => {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    ElMessage.error('仅支持上传 PDF 文件');
    return false;
  }
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过 10MB');
    return false;
  }
  return true;
};

const handleAttachmentUpload: UploadProps['httpRequest'] = async (options) => {
  const { file, onError, onSuccess } = options;
  try {
    const response = await ossUploadImage({ file: file as File });
    if (response.code === 200 && response.data?.ossId) {
      formData.value.branchOfficeAttachment = response.data.ossId;
      formData.value.branchOfficeAttachmentName = response.data.fileName || (file as File).name;
      attachmentFileList.value = [
        {
          name: formData.value.branchOfficeAttachmentName,
          url: response.data.url,
          status: 'success'
        } as UploadFile
      ];
      ElMessage.success('附件上传成功');
      onSuccess?.(response);
    } else {
      throw new Error(response?.msg || '上传失败');
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '上传失败，请重试');
    onError?.(error);
  }
};

const handleAttachmentRemove: UploadProps['onRemove'] = () => {
  attachmentFileList.value = [];
  formData.value.branchOfficeAttachment = null;
  formData.value.branchOfficeAttachmentName = '';
};

const emitCancel = () => {
  emit('cancel');
};

const loadDetail = async () => {
  if (!props.id) return;
  loading.value = true;
  try {
    const response = await insuranceProductDetail(props.id);
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      formData.value = {
        productName: data.productName || '',
        productType: data.productType || '',
        applicableObject: data.applicableObject || '',
        productIntro: data.productIntro || '',
        productAdvantages: data.productAdvantages || '',
        guaranteePlan: data.guaranteePlan || '',
        applicationInstructions: data.applicationInstructions || '',
        branchOfficeAttachment: data.branchOfficeAttachment || null,
        branchOfficeAttachmentName: data.branchOfficeAttachmentName || '',
        productRemark: data.productRemark || ''
      };
      if (data.branchOfficeAttachment && data.branchOfficeAttachmentName) {
        attachmentFileList.value = [{
          name: data.branchOfficeAttachmentName,
          url: '',
          status: 'success'
        } as UploadFile];
      }
    }
  } catch (error) {
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  advantagesEditorKey.value += 1;
  guaranteePlanEditorKey.value += 1;
  applicationEditorKey.value += 1;
  if (props.type === 'edit') {
    loadDetail();
  }
});
</script>

<style scoped lang="scss">
.product-insurance-form {
  padding: 20px 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.attachment-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .attachment-tip {
    font-size: 12px;
    color: #909399;
    margin: 0;
  }
}

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
</style>
