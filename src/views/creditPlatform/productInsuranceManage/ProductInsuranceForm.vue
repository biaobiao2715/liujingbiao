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
            <el-select v-model="formData.applicableObject" placeholder="请选择适用对象" clearable multiple>
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

      <el-form-item label="网点清单" prop="branchOfficeAttachment" required>
        <div class="attachment-upload-wrapper" v-loading="uploadLoading">
          <div class="attachment-content">
            <div v-if="attachmentFileList.length > 0" class="uploaded-file-box">
              <el-icon class="file-icon"><Document /></el-icon>
              <span class="file-name">{{ attachmentFileList[0].name || '网点清单.pdf' }}</span>
              <el-icon class="delete-icon" @click="handleAttachmentRemove" v-if="!uploadLoading">
                <Close />
              </el-icon>
            </div>
            <el-upload
              :key="uploadKey"
              ref="uploadRef"
              class="upload-box"
              :http-request="handleAttachmentUpload"
              :before-upload="beforeAttachmentUpload"
              accept=".pdf"
              :limit="1"
              :disabled="uploadLoading"
              :show-file-list="false"
              action=""
              :on-exceed="handleExceed"
            >
              <div class="upload-trigger">
                <el-icon class="plus-icon"><Plus /></el-icon>
              </div>
            </el-upload>
            <span class="upload-tip">注: 请上传PDF文件</span>
          </div>
          <div v-if="showReplaceTip" class="replace-tip">
            请删除后重新上传
          </div>
        </div>
      </el-form-item>

      <div class="form-actions">
        <el-button type="primary" @click="handleSubmit" :loading="saving" :disabled="uploadLoading">
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
import { Document, Close, Plus } from '@element-plus/icons-vue';
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus';
import { addInsuranceProduct, editInsuranceProduct, insuranceProductDetail } from '@/api/creditPlatform/productInsuranceManage';
import { uploadFileForParse } from '@/api/common/fileUpload';
import { listByIds } from '@/api/system/oss';

const Editor = defineAsyncComponent(() => import('@/components/Editor/index.vue'));

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit';
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
const uploadRef = ref();
const saving = ref(false);
const loading = ref(false);
const uploadLoading = ref(false);
const showReplaceTip = ref(false);
const uploadKey = ref(0);
const advantagesEditorKey = ref(0);
const guaranteePlanEditorKey = ref(0);
const applicationEditorKey = ref(0);

interface InsuranceProductForm {
  productName: string;
  productType: string;
  applicableObject: string[];
  productId?: string | number | null;
  status?: string;
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
  applicableObject: [],
  productId: null,
  status: '',
  productIntro: '',
  productAdvantages: '',
  guaranteePlan: '',
  applicationInstructions: '',
  branchOfficeAttachment: null,
  branchOfficeAttachmentName: '',
  productRemark: ''
});

const attachmentFileList = ref<UploadFile[]>([]);

const buildUploadFileItem = (payload: { ossId?: string | number | null; name?: string; url?: string }) => {
  const rawUid = payload.ossId !== undefined && payload.ossId !== null ? Number(payload.ossId) : NaN;
  const uid = Number.isFinite(rawUid) ? rawUid : Date.now();
  return {
    uid,
    name: payload.name || '附件',
    url: payload.url || '',
    status: 'success'
  } as UploadFile;
};

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
  ],
  branchOfficeAttachment: [
    {
      validator: (_rule, value, callback) => {
        if (!formData.value.branchOfficeAttachment) {
          callback(new Error('请上传网点清单PDF文件'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

const handleSubmit = () => {
  if (uploadLoading.value) {
    ElMessage.warning('附件上传中，请稍候再提交');
    return;
  }
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      const payload: any = {
        productName: formData.value.productName,
        productType: formData.value.productType,
        applicableObject: Array.isArray(formData.value.applicableObject) ? formData.value.applicableObject.join(',') : formData.value.applicableObject,
        productStatus: formData.value.status || '3',
        productIntro: formData.value.productIntro,
        productAdvantages: formData.value.productAdvantages,
        guaranteePlan: formData.value.guaranteePlan,
        applicationInstructions: formData.value.applicationInstructions,
        productRemark: formData.value.productRemark || '',
        branchOfficeAttachment: formData.value.branchOfficeAttachment ?? null
      };
      if (props.type === 'edit') {
        payload.id = props.id;
        payload.productId = formData.value.productId;
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
  if (attachmentFileList.value.length > 0) {
    showReplaceTip.value = true;
    setTimeout(() => {
      showReplaceTip.value = false;
    }, 3000);
    return false;
  }
  
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    ElMessage.error('仅支持上传 PDF 文件');
    return false;
  }
  const MB = 1024 * 1024;
  const limit = 100 * MB;
  if (file.size > limit) {
    ElMessage.error('文件大小不能超过 100MB');
    return false;
  }
  return true;
};

const handleAttachmentUpload: UploadProps['httpRequest'] = async (options) => {
  const { file, onError, onSuccess } = options;
  const modal = (proxy as any)?.$modal;
  uploadLoading.value = true;
  modal?.loading?.('正在上传附件并解析，请稍候...');

  try {
    // 使用文件自动解析接口
    const response = await uploadFileForParse(file as File);

    // 接口可能返回 { data: {...} } 或直接返回数据
    const responseData = (response as any)?.data || response;

    const fileName = (file as File).name;
    const displayName = fileName.toLowerCase().endsWith('.pdf') ? fileName : `${fileName}.pdf`;

    // 保存解析结果（后端解析后的完整数据）
    formData.value.branchOfficeAttachment = responseData;
    formData.value.branchOfficeAttachmentName = displayName;
    attachmentFileList.value = [
      buildUploadFileItem({
        name: displayName
      })
    ];
    ElMessage.success('附件上传成功');
    showReplaceTip.value = false;
    if (formRef.value) {
      formRef.value.validateField('branchOfficeAttachment');
    }
    onSuccess?.(response);
  } catch (error: any) {
    console.error('文件上传失败:', error);
    ElMessage.error(error?.message || error?.response?.data?.message || '上传失败，请重试');
    onError?.(error);
  } finally {
    uploadLoading.value = false;
    modal?.closeLoading?.();
  }
};

const handleExceed: UploadProps['onExceed'] = () => {};

const handleAttachmentRemove = () => {
  attachmentFileList.value = [];
  formData.value.branchOfficeAttachment = null;
  formData.value.branchOfficeAttachmentName = '';
  showReplaceTip.value = false;
  if (uploadRef.value) {
    uploadRef.value.clearFiles();
  }
  uploadKey.value += 1;
  if (formRef.value) {
    formRef.value.validateField('branchOfficeAttachment');
  }
};

const emitCancel = () => {
  emit('cancel');
};

const formatFileName = (fileName: string | undefined | null): string => {
  if (!fileName) return '网点清单.pdf';
  if (fileName.toLowerCase().endsWith('.pdf')) {
    return fileName;
  }
  return `${fileName}.pdf`;
};

const syncAttachmentFromDetail = async (data: any) => {
  if (data?.remoteFile && data.remoteFile.ossId) {
    const remoteFile = data.remoteFile;
    const fileName = remoteFile.originalName || remoteFile.name || data.branchOfficeAttachmentName || '网点清单';
    const displayName = formatFileName(fileName);
    
    attachmentFileList.value = [
      buildUploadFileItem({
        ossId: remoteFile.ossId,
        name: displayName,
        url: remoteFile.url || data.branchOfficeAttachmentUrl || ''
      })
    ];
    formData.value.branchOfficeAttachment = remoteFile.ossId || data.branchOfficeAttachment || null;
    formData.value.branchOfficeAttachmentName = displayName;
    return;
  }
  
  const ossList = Array.isArray(data?.ossFileVo) ? data.ossFileVo : [];
  if (ossList.length > 0) {
    const firstFile = ossList[0];
    const fileName = firstFile.originalName || firstFile.fileName || firstFile.name || data.branchOfficeAttachmentName || '网点清单';
    const displayName = formatFileName(fileName);
    
    attachmentFileList.value = [
      buildUploadFileItem({
        ossId: firstFile.ossId,
        name: displayName,
        url: firstFile.url || firstFile.fileUrl || data.branchOfficeAttachmentUrl || ''
      })
    ];
    formData.value.branchOfficeAttachment = firstFile.ossId || data.branchOfficeAttachment || null;
    formData.value.branchOfficeAttachmentName = displayName;
    return;
  }
  
  if (data?.branchOfficeAttachment) {
    try {
      const ossResponse: any = await listByIds(data.branchOfficeAttachment);
      const ossData = Array.isArray(ossResponse?.data) ? ossResponse.data : ossResponse ?? [];
      if (Array.isArray(ossData) && ossData.length > 0) {
        const firstFile = ossData[0];
        const fileName = firstFile.originalName || firstFile.fileName || data.branchOfficeAttachmentName || '网点清单';
        const displayName = formatFileName(fileName);
        
        attachmentFileList.value = [
          buildUploadFileItem({
            ossId: firstFile.ossId,
            name: displayName,
            url: firstFile.url || firstFile.fileUrl || ''
          })
        ];
        formData.value.branchOfficeAttachment = firstFile.ossId || data.branchOfficeAttachment || null;
        formData.value.branchOfficeAttachmentName = displayName;
      } else {
        const displayName = formatFileName(data.branchOfficeAttachmentName);
        attachmentFileList.value = [
          buildUploadFileItem({
            ossId: data.branchOfficeAttachment,
            name: displayName,
            url: data.branchOfficeAttachmentUrl || ''
          })
        ];
        formData.value.branchOfficeAttachment = data.branchOfficeAttachment;
        formData.value.branchOfficeAttachmentName = displayName;
      }
    } catch (error) {
      const displayName = formatFileName(data.branchOfficeAttachmentName);
      attachmentFileList.value = [
        buildUploadFileItem({
          ossId: data.branchOfficeAttachment,
          name: displayName,
          url: data.branchOfficeAttachmentUrl || ''
        })
      ];
      formData.value.branchOfficeAttachment = data.branchOfficeAttachment;
      formData.value.branchOfficeAttachmentName = displayName;
    }
    return;
  }
  attachmentFileList.value = [];
  formData.value.branchOfficeAttachment = null;
  formData.value.branchOfficeAttachmentName = '';
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
        applicableObject: data.applicableObject ? (Array.isArray(data.applicableObject) ? data.applicableObject : data.applicableObject.split(',')) : [],
        productId: data.productId || null,
        status: data.productStatus || data.status || '',
        productIntro: data.productIntro || '',
        productAdvantages: data.productAdvantages || '',
        guaranteePlan: data.guaranteePlan || '',
        applicationInstructions: data.applicationInstructions || '',
        branchOfficeAttachment: data.branchOfficeAttachment || null,
        branchOfficeAttachmentName: data.branchOfficeAttachmentName || '',
        productRemark: data.productRemark || ''
      };

      await syncAttachmentFromDetail(data);
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

.attachment-upload-wrapper {
  width: 100%;

  .attachment-content {
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: nowrap;
  }

  .uploaded-file-box {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background-color: #fff;
    min-width: 150px;
    max-width: 300px;
    position: relative;

    .file-icon {
      font-size: 18px;
      color: #409eff;
      flex-shrink: 0;
    }

    .file-name {
      font-size: 14px;
      color: #606266;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .delete-icon {
      font-size: 16px;
      color: #909399;
      cursor: pointer;
      flex-shrink: 0;
      margin-left: 4px;

      &:hover {
        color: #f56c6c;
      }
    }
  }

  .upload-box {
    display: inline-block;
    flex-shrink: 0;

    .upload-trigger {
      width: 80px;
      height: 80px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background-color: #fafafa;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        border-color: #409eff;
        background-color: #f0f9ff;
      }

      .plus-icon {
        font-size: 28px;
        color: #909399;
      }

      &:hover .plus-icon {
        color: #409eff;
      }
    }
  }

  .upload-tip {
    font-size: 14px;
    color: #f56c6c;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .replace-tip {
    margin-top: 8px;
    color: #f56c6c;
    font-size: 14px;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  gap: 12px;

  .el-button {
    min-width: 100px;
  }
}
</style>
