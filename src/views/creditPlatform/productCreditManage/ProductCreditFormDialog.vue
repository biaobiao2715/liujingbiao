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
            <el-select
              v-model="formData.loanCycle"
              placeholder="请选择可贷周期"
              clearable
              multiple
              :collapse-tags="false"
            >
              <el-option
                v-for="dict in loan_cycle"
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
          <el-form-item label="还款方式" prop="repaymentMethod">
            <el-select v-model="formData.repaymentMethod" placeholder="请选择还款方式" clearable multiple>
              <el-option
                v-for="dict in repayment_method"
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
          <p class="attachment-tip">注：请上传PDF文件</p>
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
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, nextTick, watch } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus';
import {
  addCreditProduct,
  editCreditProduct,
  creditProductDetail
} from '@/api/creditPlatform/productCreditManage';
import { uploadByChunks } from '@/utils/chunkUpload';

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
const { prod_credit_type, applicable_object, repayment_method, loan_cycle } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'repayment_method', 'loan_cycle')
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
  applicableObject: string[];
  status: string;
  minLoanAmount: number | null;
  maxLoanAmount: number | null;
  baseInterestRate: number | null;
  floatInterestRate: number | null;
  loanCycle: string[];
  repaymentMethod: string[];
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
  applicableObject: [],
  status: '',
  minLoanAmount: null,
  maxLoanAmount: null,
  baseInterestRate: null,
  floatInterestRate: null,
  loanCycle: [],
  repaymentMethod: [],
  productIntro: '',
  productAdvantages: '',
  applicableInstructions: '',
  applicationInstructions: '',
  cooperationAttachment: null,
  cooperationAttachmentName: '',
  productRemark: ''
});

const attachmentFileList = ref<UploadFile[]>([]);

watch(
  () => formData.value.minLoanAmount,
  (newVal, oldVal) => {
    // 当最小额度变化时，重新验证最大额度
    if (formRef.value && (newVal !== oldVal)) {
      nextTick(() => {
        formRef.value?.validateField('maxLoanAmount').catch(() => {});
      });
    }
  }
);

watch(
  () => formData.value.maxLoanAmount,
  () => {
    // 当最大额度变化时，重新验证最小额度（确保最小额度仍然有效）
    if (formRef.value) {
      nextTick(() => {
        formRef.value?.validateField('minLoanAmount').catch(() => {});
      });
    }
  }
);

const rules: FormRules = {
  productName: [
    { required: true, message: '请输入产品名称', trigger: 'blur' },
    { min: 1, max: 50, message: '产品名称长度需在1~50个字符内', trigger: 'blur' }
  ],
  productType: [{ required: true, message: '请选择产品类型', trigger: 'change' }],
  applicableObject: [{ required: true, message: '请选择适用对象', trigger: 'change' }],
  minLoanAmount: [
    {
      validator: (_rule, value, callback) => {
        // 检查值是否为空（包括 null、undefined、0）
        if (value === null || value === undefined || value === 0) {
          callback(new Error('请输入最小贷款额度'));
          return;
        }
        // 检查是否为有效数字
        const numValue = Number(value);
        if (isNaN(numValue)) {
          callback(new Error('请输入有效的数字'));
          return;
        }
        // 检查最小额度是否大于等于1
        if (numValue < 1) {
          callback(new Error('最小额度需大于等于1万元'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ],
  maxLoanAmount: [
    {
      validator: (_rule, value, callback) => {
        // 检查值是否为空（包括 null、undefined、0）
        if (value === null || value === undefined || value === 0) {
          callback(new Error('请输入最大贷款额度'));
          return;
        }
        // 检查最小额度是否已输入
        const minAmount = formData.value.minLoanAmount;
        if (minAmount === null || minAmount === undefined || minAmount === 0) {
          callback(new Error('请先输入最小贷款额度'));
          return;
        }
        // 检查最大额度是否大于最小额度
        const numValue = Number(value);
        const numMinAmount = Number(minAmount);
        if (isNaN(numValue) || isNaN(numMinAmount)) {
          callback(new Error('请输入有效的数字'));
          return;
        }
        if (numValue <= numMinAmount) {
          callback(new Error('最大额度需大于最小额度'));
          return;
        }
        callback();
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
  loanCycle: [
    {
      validator: (_rule, value, callback) => {
        if (!Array.isArray(value) || value.length === 0) {
          callback(new Error('请选择可贷周期'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  repaymentMethod: [{ required: true, message: '请选择还款方式', trigger: 'change' }],
  productIntro: [
    { required: true, message: '请输入产品简介', trigger: 'blur' },
    { min: 1, max: 100, message: '产品简介长度需在1~100个字符内', trigger: 'blur' }
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
  ],
  cooperationAttachment: [
    {
      validator: (_rule, value, callback) => {
        if (!value) {
          callback(new Error('请上传合作机构PDF文件'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

const fetchDetail = async () => {
  if (!props.id) return;
  loading.value = true;
  try {
    const response = await creditProductDetail(props.id as string | number);
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      const productAdvantages = data.productAdvantages || '';
      const applicableInstructions = data.applicableInstructions || '';
      const applicationInstructions = data.applicationInstructions || '';
      
      formData.value = {
        id: data.id,
        productId: data.productId,
        productName: data.productName || '',
        productType: data.productType || '',
        applicableObject: data.applicableObject ? (Array.isArray(data.applicableObject) ? data.applicableObject : data.applicableObject.split(',')) : [],
        status: data.productStatus || data.status || '',
        minLoanAmount: data.minLoanAmount ?? null,
        maxLoanAmount: data.maxLoanAmount ?? null,
        baseInterestRate: data.baseInterestRate ?? data.minInterestRate ?? null,
        floatInterestRate: data.floatInterestRate ?? data.maxInterestRate ?? null,
        loanCycle: data.loanCycle
          ? (Array.isArray(data.loanCycle) ? data.loanCycle : data.loanCycle.split(','))
          : [],
        repaymentMethod: data.repaymentMethod ? (Array.isArray(data.repaymentMethod) ? data.repaymentMethod : data.repaymentMethod.split(',')) : [],
        productIntro: data.productIntro || '',
        productAdvantages,
        applicableInstructions,
        applicationInstructions,
        cooperationAttachment: data.cooperationAttachment || null,
        cooperationAttachmentName: data.cooperationAttachmentName || '',
        productRemark: data.productRemark || ''
      };
      
      advantagesEditorKey.value += 1;
      instructionsEditorKey.value += 1;
      applicationEditorKey.value += 1;
      await nextTick();
      
      if (data.ossFileVo && Array.isArray(data.ossFileVo) && data.ossFileVo.length > 0) {
        const file = data.ossFileVo[0];
        formData.value.cooperationAttachment = file.ossId || data.cooperationAttachment || null;
        formData.value.cooperationAttachmentName = file.fileName || file.name || data.cooperationAttachmentName || '';
        attachmentFileList.value = [
          {
            uid: file.ossId?.toString() || Date.now().toString(),
            name: file.fileName || file.name || data.cooperationAttachmentName || '附件',
            url: file.url || data.cooperationAttachmentUrl || '',
            status: 'success'
          } as UploadFile
        ];
      } else if (data.cooperationAttachment) {
        formData.value.cooperationAttachment = data.cooperationAttachment;
        formData.value.cooperationAttachmentName = data.cooperationAttachmentName || '合作机构附件';
        attachmentFileList.value = [
          {
            uid: data.cooperationAttachment.toString() || Date.now().toString(),
            name: data.cooperationAttachmentName || '合作机构附件',
            url: data.cooperationAttachmentUrl || '',
            status: 'success'
          } as UploadFile
        ];
      } else {
        attachmentFileList.value = [];
        formData.value.cooperationAttachment = null;
        formData.value.cooperationAttachmentName = '';
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
        applicableObject: Array.isArray(formData.value.applicableObject) ? formData.value.applicableObject.join(',') : formData.value.applicableObject,
        minLoanAmount: Math.round((formData.value.minLoanAmount ?? 0) * 100) / 100,
        maxLoanAmount: Math.round((formData.value.maxLoanAmount ?? 0) * 100) / 100,
        baseInterestRate: formData.value.baseInterestRate ?? 0,
        floatInterestRate: formData.value.floatInterestRate ?? 0,
        loanCycle: Array.isArray(formData.value.loanCycle)
          ? formData.value.loanCycle.join(',')
          : formData.value.loanCycle,
        repaymentMethod: Array.isArray(formData.value.repaymentMethod) ? formData.value.repaymentMethod.join(',') : formData.value.repaymentMethod,
        productIntro: formData.value.productIntro,
        productAdvantages: formData.value.productAdvantages,
        applicableInstructions: formData.value.applicableInstructions,
        applicationInstructions: formData.value.applicationInstructions,
        productRemark: formData.value.productRemark || '具体开办的业务种类及办理程序、办理条件等以当地分行有关规定为准。'
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
      const api = props.type === 'edit' ? editCreditProduct : addCreditProduct;
      const response = await api(payload);
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
  modal?.loading?.('正在上传附件，请稍候...');

  try {
    // 统一使用 uploadByChunks，内部会自动判断是否需要分片上传
    const res: any = await uploadByChunks(file as File, (percent: number) => {
      modal?.setLoadingText?.(`正在上传...${percent}%`);
    });

    // 兼容处理不同的返回格式
    let uploadResult = res;
    if (res && !res.ossId && !res.ossid && res.data) {
      uploadResult = res.data;
    }

    // 兼容 ossId 和 ossid 两种字段名
    const ossId = uploadResult?.ossId || uploadResult?.ossid || uploadResult?.data?.ossId || uploadResult?.data?.ossid;
    if (!ossId) {
      throw new Error('上传失败，未获取到文件标识');
    }

    // 保存 ossId 作为附件标识
    formData.value.cooperationAttachment = ossId;
    formData.value.cooperationAttachmentName = uploadResult?.fileName || uploadResult?.data?.fileName || (file as File).name;
    attachmentFileList.value = [
      {
        name: formData.value.cooperationAttachmentName,
        status: 'success'
      } as UploadFile
    ];
    ElMessage.success('附件上传成功');
    onSuccess?.(uploadResult);
  } catch (error: any) {
    console.error('文件上传失败:', error);
    ElMessage.error(error?.msg || error?.message || '上传失败，请重试');
    onError?.(error);
  } finally {
    modal?.closeLoading?.();
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

.attachment-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .upload-block {
    :deep(.el-upload-list) {
      margin-top: 8px;
    }

    :deep(.el-upload-list__item) {
      margin-top: 8px;
    }

    :deep(.el-upload-list__item-delete) {
      display: none !important;
    }
  }

  .attachment-tip {
    font-size: 12px;
    color: #909399;
    margin: 0;
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
