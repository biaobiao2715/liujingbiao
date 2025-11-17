<!-- 产品管理-信贷新增和编辑弹窗 -->

<template>
  <div class="product-credit-form-dialog" v-loading="loading">
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
          <el-form-item label="产品类型" prop="productType">
            <el-select v-model="formData.productType" placeholder="请选择产品类型" clearable>
              <el-option
                v-for="dict in prod_credit_type"
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


           <el-col :span="12">
          <el-form-item label="可贷金额" required>
            <div class="range-inputs">
              <el-form-item prop="minLoanAmount" label-width="0" class="inline-form-item">
                <el-input-number
                  v-model="formData.minLoanAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="最低额度"
                />
              </el-form-item>
              <span class="range-split">万元 —</span>
              <el-form-item prop="maxLoanAmount" label-width="0" class="inline-form-item">
                <el-input-number
                  v-model="formData.maxLoanAmount"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="最高额度"
                />
              </el-form-item>
              <span class="unit">万元</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
     
        <el-col :span="12">
          <el-form-item label="利率/费率" required>
            <div class="range-inputs">
              <el-form-item prop="baseInterestRate" label-width="0" class="inline-form-item">
                <el-input-number
                  v-model="formData.baseInterestRate"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="最低利率"
                />
              </el-form-item>
              <span class="range-split">% —</span>
              <el-form-item prop="floatInterestRate" label-width="0" class="inline-form-item">
                <el-input-number
                  v-model="formData.floatInterestRate"
                  :min="0"
                  :precision="2"
                  :controls="false"
                  placeholder="最高利率"
                />
              </el-form-item>
              <span class="unit">%</span>
            </div>
          </el-form-item>
        </el-col>


        <el-col :span="12">
          <el-form-item label="可贷周期" prop="loanCycle">
            <el-select v-model="formData.loanCycle" placeholder="请选择可贷周期" clearable>
              <el-option
                v-for="item in loanCycleOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <p class="cycle-tip">注：一期等同一个月</p>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="还款方式" prop="repaymentMethod">
            <el-select v-model="formData.repaymentMethod" placeholder="请选择还款方式" clearable>
              <el-option
                v-for="item in repaymentMethodOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
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
          maxlength="200"
          show-word-limit
          placeholder="请输入产品简介（不超过200字）"
          clearable
        />
      </el-form-item>

      <el-form-item label="产品优势" prop="productAdvantages">
        <Editor v-model="formData.productAdvantages" :height="420" :minHeight="420" :key="advantagesEditorKey" />
      </el-form-item>

      <el-form-item label="适用说明" prop="applicableInstructions">
        <Editor v-model="formData.applicableInstructions" :height="420" :minHeight="420" :key="instructionsEditorKey" />
      </el-form-item>

      <el-form-item label="申请条件" prop="applicationInstructions">
        <Editor v-model="formData.applicationInstructions" :height="420" :minHeight="420" :key="applicationEditorKey" />
      </el-form-item>

      <el-form-item label="合作机构" prop="cooperationAttachment">
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

      <el-form-item label="产品备注" prop="productRemark">
        <el-input
          v-model="formData.productRemark"
          type="textarea"
          :rows="3"
          maxlength="100"
          show-word-limit
          placeholder="具体开办的业务种类及办理程序、办理条件等以当地分行有关规定为准。"
          clearable
        />
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
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, nextTick } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus';
import {
  addCreditProduct,
  editCreditProduct,
  creditProductDetail
} from '@/api/creditPlatform/productCreditManage';
import { ossUploadImage } from '@/api/expertServicePlatform/knowledgeBaseManage/index';

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
const { prod_credit_type, applicable_object, product_status } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'product_status')
);

const formRef = ref<FormInstance>();
const saving = ref(false);
const loading = ref(false);
const advantagesEditorKey = ref(0);
const instructionsEditorKey = ref(0);
const applicationEditorKey = ref(0);

interface CreditProductForm {
  id?: number | string | null;
  productId?: number | string | null;
  productName: string;
  productType: string;
  applicableObject: string;
  status: string;
  minLoanAmount: number | null;
  maxLoanAmount: number | null;
  baseInterestRate: number | null;
  floatInterestRate: number | null;
  loanCycle: string;
  repaymentMethod: string;
  productIntro: string;
  productAdvantages: string;
  applicableInstructions: string;
  applicationInstructions: string;
  cooperationAttachment?: string | number | null;
  cooperationAttachmentName?: string;
  productRemark: string;
}

const formData = ref<CreditProductForm>({
  id: null,
  productId: null,
  productName: '',
  productType: '',
  applicableObject: '',
  status: '',
  minLoanAmount: null,
  maxLoanAmount: null,
  baseInterestRate: null,
  floatInterestRate: null,
  loanCycle: '',
  repaymentMethod: '',
  productIntro: '',
  productAdvantages: '',
  applicableInstructions: '',
  applicationInstructions: '',
  cooperationAttachment: null,
  cooperationAttachmentName: '',
  productRemark: ''
});

const loanCycleOptions = [
  { label: '3期（3个月）', value: '3' },
  { label: '6期（6个月）', value: '6' },
  { label: '12期（12个月）', value: '12' },
  { label: '24期（24个月）', value: '24' },
  { label: '36期（36个月）', value: '36' },
  { label: '48期（48个月）', value: '48' },
  { label: '60期（60个月）', value: '60' }
];

const repaymentMethodOptions = [
  { label: '等额本息', value: '0' },
  { label: '等额本金', value: '2' },
  { label: '先息后本', value: '3' },
  { label: '先本后息', value: '4' }
];

const attachmentFileList = ref<UploadFile[]>([]);

const rules: FormRules = {
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '产品名称长度需在1~50个字符内', trigger: 'blur' }
  ],
  productType: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  applicableObject: [{ required: true, message: '请选择适用对象', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  minLoanAmount: [
    {
      validator: (_rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入最小贷款额度'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  maxLoanAmount: [
    {
      validator: (_rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入最大贷款额度'));
        } else if (formData.value.minLoanAmount !== null && value < (formData.value.minLoanAmount ?? 0)) {
          callback(new Error('最大额度需大于等于最小额度'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  baseInterestRate: [
    {
      validator: (_rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入最低利率'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  floatInterestRate: [
    {
      validator: (_rule, value, callback) => {
        if (value === null || value === undefined) {
          callback(new Error('请输入最高利率'));
        } else if (formData.value.baseInterestRate !== null && value < (formData.value.baseInterestRate ?? 0)) {
          callback(new Error('最高利率需大于等于最低利率'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  loanCycle: [{ required: true, message: '请选择可贷周期', trigger: 'change' }],
  repaymentMethod: [{ required: true, message: '请选择还款方式', trigger: 'change' }],
  productIntro: [
    { required: true, message: '请输入产品简介', trigger: 'blur' },
    { min: 5, max: 200, message: '产品简介长度需在5~200个字符内', trigger: 'blur' }
  ],
  productAdvantages: [
    { required: true, message: '请输入产品优势', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        const text = (value || '').replace(/<[^>]+>/g, '').trim();
        if (!text) {
          callback(new Error('请输入产品优势'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  applicableInstructions: [
    { required: true, message: '请输入适用说明', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        const text = (value || '').replace(/<[^>]+>/g, '').trim();
        if (!text) {
          callback(new Error('请输入适用说明'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  applicationInstructions: [
    { required: true, message: '请输入申请条件', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        const text = (value || '').replace(/<[^>]+>/g, '').trim();
        if (!text) {
          callback(new Error('请输入申请条件'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

const fetchDetail = async () => {
  if (!props.id) return;
  loading.value = true;
  try {
    const response = await creditProductDetail(props.id as string | number);
    console.log('详情接口返回:', response);
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      console.log('详情数据:', data);
      
      let productAdvantages = data.productAdvantages || '';
      if (!productAdvantages || (typeof productAdvantages === 'string' && productAdvantages.trim() === '')) {
        productAdvantages = '';
      }
      
      let applicableInstructions = data.applicableInstructions || '';
      if (!applicableInstructions || (typeof applicableInstructions === 'string' && applicableInstructions.trim() === '')) {
        applicableInstructions = '';
      }
      
      let applicationInstructions = data.applicationInstructions || '';
      if (!applicationInstructions || (typeof applicationInstructions === 'string' && applicationInstructions.trim() === '')) {
        applicationInstructions = '';
      }
      
      formData.value = {
        id: data.id,
        productId: data.productId,
        productName: data.productName || '',
        productType: data.productType || '',
        applicableObject: data.applicableObject || '',
        status: data.productStatus || data.status || '',
        minLoanAmount: data.minLoanAmount ?? null,
        maxLoanAmount: data.maxLoanAmount ?? null,
        baseInterestRate: data.baseInterestRate ?? data.minInterestRate ?? null,
        floatInterestRate: data.floatInterestRate ?? data.maxInterestRate ?? null,
        loanCycle: data.loanCycle || '',
        repaymentMethod: data.repaymentMethod || '',
        productIntro: data.productIntro || '',
        productAdvantages: productAdvantages,
        applicableInstructions: applicableInstructions,
        applicationInstructions: applicationInstructions,
        cooperationAttachment: data.cooperationAttachment || null,
        cooperationAttachmentName: data.cooperationAttachmentName || data.cooperationAttachmentUrl || '',
        productRemark: data.productRemark || ''
      };
      
      advantagesEditorKey.value += 1;
      instructionsEditorKey.value += 1;
      applicationEditorKey.value += 1;
      await nextTick();
      await nextTick();
      
      if (data.cooperationAttachment && data.cooperationAttachmentName) {
        attachmentFileList.value = [
          {
            name: data.cooperationAttachmentName,
            url: data.cooperationAttachmentUrl,
            status: 'success'
          } as UploadFile
        ];
      } else {
        attachmentFileList.value = [];
      }
    } else {
      ElMessage.error(response?.msg || '获取产品详情失败');
    }
  } catch (error) {
    ElMessage.error('获取产品详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
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
        minLoanAmount: Math.round((formData.value.minLoanAmount ?? 0) * 100) / 100,
        maxLoanAmount: Math.round((formData.value.maxLoanAmount ?? 0) * 100) / 100,
        baseInterestRate: formData.value.baseInterestRate ?? 0,
        floatInterestRate: formData.value.floatInterestRate ?? 0,
        loanCycle: formData.value.loanCycle,
        repaymentMethod: formData.value.repaymentMethod,
        productIntro: formData.value.productIntro,
        productAdvantages: formData.value.productAdvantages,
        applicableInstructions: formData.value.applicableInstructions,
        applicationInstructions: formData.value.applicationInstructions,
        productRemark: formData.value.productRemark || ''
      };
      if (formData.value.cooperationAttachment) {
        payload.cooperationAttachment = formData.value.cooperationAttachment;
      }
      if (props.type === 'edit') {
        if (!formData.value.id || !formData.value.productId) {
          ElMessage.error('编辑ID为空，无法提交');
          return;
        }
        payload.id = formData.value.id;
        payload.productId = formData.value.productId;
        payload.productStatus = formData.value.status || '3';
        payload.optType = '1';
      } else {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        payload.createTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        payload.productStatus = '3';
      }
      console.log('提交参数:', payload, '类型:', props.type);
      const api = props.type === 'edit' ? editCreditProduct : addCreditProduct;
      const response = await api(payload);
      if (response && response.code === 200) {
        ElMessage.success(props.type === 'edit' ? '修改成功' : '新增成功');
        emit('success');
      } else {
        ElMessage.error(response?.msg || (props.type === 'edit' ? '修改失败' : '新增失败'));
      }
    } catch (error: any) {
      console.error('提交错误:', error);
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
      formData.value.cooperationAttachment = response.data.ossId;
      formData.value.cooperationAttachmentName = response.data.fileName || (file as File).name;
      attachmentFileList.value = [
        {
          name: formData.value.cooperationAttachmentName,
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
  formData.value.cooperationAttachment = null;
  formData.value.cooperationAttachmentName = '';
};

const emitCancel = () => {
  emit('cancel');
};

onMounted(() => {
  if (props.type === 'edit' && props.id) {
    fetchDetail();
  } else {
    formData.value.status = '';
    attachmentFileList.value = [];
    advantagesEditorKey.value += 1;
    instructionsEditorKey.value += 1;
    applicationEditorKey.value += 1;
  }
});
</script>

<style scoped lang="scss">
.product-credit-form-dialog {
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

.range-inputs {
  display: flex;
  align-items: center;
  gap: 8px;

  .range-split {
    color: #909399;
    white-space: nowrap;
  }

  .unit {
    color: #606266;
    margin-left: 4px;
  }

  :deep(.el-input-number) {
    width: 140px;
  }

  .inline-form-item {
    margin-bottom: 0;
  }
}

.cycle-tip {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
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
