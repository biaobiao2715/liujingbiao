<!--
  标题: ProductCreditFormDialog.vue
  功能: 信贷产品新增和编辑弹窗
  说明: 提供信贷产品的新增和编辑功能
  当前版本: 1.0
  开发信息: Created by 门世超, Refactored by 门世超
-->
<template>
  <div class="product-credit-form-dialog" v-loading="loading">
    <div class="upload-global-hint" @click="triggerUpload">
      <img :src="uploadIcon" alt="上传" class="upload-icon-img" />
      <span class="upload-text">上传文件自动解析</span>
    </div>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px" label-position="right">
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="formData.productName" placeholder="我是产品名称" maxlength="50" show-word-limit clearable />
      </el-form-item>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="产品类型" prop="productType">
            <el-select v-model="formData.productType" placeholder="请选择" clearable>
              <el-option v-for="dict in prod_credit_type" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="适用对象" prop="applicableObject">
            <el-select v-model="formData.applicableObject" placeholder="请选择" clearable multiple>
              <el-option v-for="dict in applicable_object" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="可贷金额" required class="loan-amount-item">
            <div class="range-inputs">
              <el-form-item prop="minLoanAmount" label-width="0" class="inline-form-item">
                <el-input-number v-model="formData.minLoanAmount" :min="0" :precision="2" :controls="false" placeholder="请输入" />
              </el-form-item>
              <span class="range-split">万元</span>
              <span class="range-line"></span>
              <el-form-item prop="maxLoanAmount" label-width="0" class="inline-form-item">
                <el-input-number v-model="formData.maxLoanAmount" :min="0" :precision="2" :controls="false" placeholder="请输入" />
              </el-form-item>
              <span class="unit">万元</span>
            </div>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="利率/费率" required class="loan-amount-item">
            <div class="range-inputs">
              <el-form-item prop="baseInterestRate" label-width="0" class="inline-form-item">
                <el-input-number v-model="formData.baseInterestRate" :min="0" :precision="2" :controls="false" placeholder="请输入" />
              </el-form-item>
              <span class="range-split">%</span>
              <span class="range-line"></span>
              <el-form-item prop="floatInterestRate" label-width="0" class="inline-form-item">
                <el-input-number v-model="formData.floatInterestRate" :min="0" :precision="2" :controls="false" placeholder="请输入" />
              </el-form-item>
              <span class="unit">%</span>
            </div>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="可贷周期" prop="loanCycle">
            <el-select v-model="formData.loanCycle" placeholder="请选择" clearable multiple :collapse-tags="false">
              <el-option v-for="dict in loan_cycle" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="还款方式" prop="repaymentMethod">
            <el-select v-model="formData.repaymentMethod" placeholder="请选择" clearable multiple>
              <el-option v-for="dict in repayment_method" :key="dict.value" :label="dict.label" :value="dict.value" />
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

      <el-form-item label="产品优势" prop="productAdvantages" class="editor-field-item">
        <Editor v-model="formData.productAdvantages" :height="420" :minHeight="420" :key="advantagesEditorKey" />
      </el-form-item>

      <el-form-item label="适用说明" prop="applicableInstructions" class="editor-field-item">
        <Editor v-model="formData.applicableInstructions" :height="420" :minHeight="420" :key="instructionsEditorKey" />
      </el-form-item>

      <el-form-item label="申请条件" prop="applicationInstructions" class="editor-field-item">
        <Editor v-model="formData.applicationInstructions" :height="420" :minHeight="420" :key="applicationEditorKey" />
      </el-form-item>

      <el-form-item label="合作机构" prop="cooperationAttachment" class="editor-field-item">
        <div class="attachment-upload">
          <el-upload
            ref="uploadRef"
            class="upload-block"
            :file-list="attachmentFileList"
            :http-request="handleAttachmentUpload"
            :before-upload="beforeAttachmentUpload"
            :on-remove="handleAttachmentRemove"
            accept=".pdf"
            :limit="1"
            action=""
            list-type="text"
            :show-file-list="false"
          >
            <div class="custom-upload-btn">
              <img :src="uploadBtnIcon" alt="上传" class="upload-btn-icon" />
              <span class="upload-btn-text">上传文件</span>
            </div>
          </el-upload>
          <div v-if="attachmentFileList.length > 0" class="file-list">
            <div v-for="file in attachmentFileList" :key="file.uid" class="file-item">
              <span class="file-name">{{ file.name }}</span>
              <el-icon class="file-remove" @click="handleAttachmentRemove"><Close /></el-icon>
            </div>
          </div>
          <p class="attachment-tip">支持格式：请上传PDF文件</p>
        </div>
      </el-form-item>

      <el-form-item label="产品备注" prop="productRemark" class="editor-field-item">
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
        <el-button @click="emitCancel">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="saving">
          {{ props.type === 'add' ? '保存' : '确认修改' }}
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, nextTick, watch } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules, UploadFile, UploadProps } from 'element-plus';
import { uploadByChunks } from '@/utils/chunkUpload';
import { Document, Close } from '@element-plus/icons-vue';
import { addCreditProduct, editCreditProduct, creditProductDetail } from '@/api/creditPlatform/productCreditManage';
import { uploadFileToFastGPT, fileAnalysis } from '@/api/common/fileUpload';
import { getDicts } from '@/api/system/dict/data';
import { useDictStore } from '@/store/modules/dict';
import uploadIconImg from '@/assets/images/finance/上传图标.png';
import uploadBtnIconImg from '@/assets/images/finance/切图 73.png';

const Editor = defineAsyncComponent(() => import('@/components/Editor/index.vue'));

const uploadIcon = uploadIconImg;
const uploadBtnIcon = uploadBtnIconImg;

const props = defineProps<{
  id?: string | number | null;
  type: 'add' | 'edit';
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const dictStore = useDictStore();
const { prod_credit_type, applicable_object, repayment_method, loan_cycle } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'repayment_method', 'loan_cycle')
);

const formRef = ref<FormInstance>();
const uploadRef = ref();
const saving = ref(false);
const loading = ref(false);
const advantagesEditorKey = ref(0);
const instructionsEditorKey = ref(0);
const applicationEditorKey = ref(0);
const MB = 1024 * 1024;
const CHUNK_UPLOAD_THRESHOLD = 100 * MB; 
const loanCycleLoading = ref(false);

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
    if (formRef.value && newVal !== oldVal) {
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
  // 最大贷款额度校验
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
        // 检查最大额度是否大于等于最小额度
        const numValue = Number(value);
        const numMinAmount = Number(minAmount);
        if (isNaN(numValue) || isNaN(numMinAmount)) {
          callback(new Error('请输入有效的数字'));
          return;
        }
        if (numValue < numMinAmount) {
          callback(new Error('最大额度需大于等于最小额度'));
          return;
        }
        callback();
      },
      trigger: 'blur'
    }
  ],
  // 利率/费率校验
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
  // 最高利率校验
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
  // 可贷周期校验
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
  // 还款方式校验
  repaymentMethod: [{ required: true, message: '请选择还款方式', trigger: 'change' }],
  productIntro: [
    { required: true, message: '请输入产品简介', trigger: 'blur' },
    { min: 1, max: 100, message: '产品简介长度需在1~100个字符内', trigger: 'blur' }
  ],
  // 产品优势校验
  productAdvantages: [
    { required: true, message: '请输入产品优势', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        // 检查内容是否为空：去除HTML标签后的文本 + 检查是否有图片
        const htmlContent = (value || '').trim();
        if (!htmlContent || htmlContent === '<p></p>' || htmlContent === '<p><br></p>') {
          callback(new Error('请输入产品优势，文字或图片均可'));
          return;
        }
        // 去除HTML标签后的纯文本
        const text = htmlContent
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        // 检查是否有图片标签
        const hasImage = /<img[^>]+>/i.test(htmlContent);
        // 只要有文本或图片就认为不为空
        if (!text && !hasImage) {
          callback(new Error('请输入产品优势，文字或图片均可'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  // 适用说明校验
  applicableInstructions: [
    { required: true, message: '请输入适用说明', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        // 检查内容是否为空：去除HTML标签后的文本 + 检查是否有图片
        const htmlContent = (value || '').trim();
        if (!htmlContent || htmlContent === '<p></p>' || htmlContent === '<p><br></p>') {
          callback(new Error('请输入适用说明，文字或图片均可'));
          return;
        }
        // 去除HTML标签后的纯文本
        const text = htmlContent
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        // 检查是否有图片标签
        const hasImage = /<img[^>]+>/i.test(htmlContent);
        // 只要有文本或图片就认为不为空
        if (!text && !hasImage) {
          callback(new Error('请输入适用说明，文字或图片均可'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  // 申请条件校验
  applicationInstructions: [
    { required: true, message: '请输入申请条件', trigger: 'change' },
    {
      validator: (_rule, value, callback) => {
        // 检查内容是否为空：去除HTML标签后的文本 + 检查是否有图片
        const htmlContent = (value || '').trim();
        if (!htmlContent || htmlContent === '<p></p>' || htmlContent === '<p><br></p>') {
          callback(new Error('请输入申请条件，文字或图片均可'));
          return;
        }
        // 去除HTML标签后的纯文本
        const text = htmlContent
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .trim();
        // 检查是否有图片标签
        const hasImage = /<img[^>]+>/i.test(htmlContent);
        // 只要有文本或图片就认为不为空
        if (!text && !hasImage) {
          callback(new Error('请输入申请条件，文字或图片均可'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ],
  // 合作机构附件校验
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

// 获取产品详情
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
        applicableObject: data.applicableObject
          ? Array.isArray(data.applicableObject)
            ? data.applicableObject
            : data.applicableObject.split(',')
          : [],
        status: data.productStatus || data.status || '',
        minLoanAmount: data.minLoanAmount ?? null,
        maxLoanAmount: data.maxLoanAmount ?? null,
        baseInterestRate: data.baseInterestRate ?? data.minInterestRate ?? null,
        floatInterestRate: data.floatInterestRate ?? data.maxInterestRate ?? null,
        loanCycle: data.loanCycle ? (Array.isArray(data.loanCycle) ? data.loanCycle : data.loanCycle.split(',')) : [],
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

      // 格式化文件名称，确保有 .pdf 扩展名
      const formatFileName = (fileName: string | undefined | null): string => {
        if (!fileName) return '合作机构附件.pdf';
        if (fileName.toLowerCase().endsWith('.pdf')) {
          return fileName;
        }
        return `${fileName}.pdf`;
      };

      // 处理合作机构附件显示
      if (data.ossFileVo && Array.isArray(data.ossFileVo) && data.ossFileVo.length > 0) {
        const file = data.ossFileVo[0];
        // 优先使用 originalName，然后是 fileName，最后是 name
        const originalFileName = file.originalName || file.fileName || file.name || data.cooperationAttachmentName || '合作机构附件';
        const displayName = formatFileName(originalFileName);

        // 设置表单数据和文件列表
        formData.value.cooperationAttachment = file.ossId || data.cooperationAttachment || null;
        formData.value.cooperationAttachmentName = originalFileName;
        attachmentFileList.value = [
          {
            uid: file.ossId?.toString() || Date.now().toString(),
            name: displayName,
            url: file.url || data.cooperationAttachmentUrl || '',
            status: 'success'
          } as UploadFile
        ];
      } else if (data.cooperationAttachment) {
        const displayName = formatFileName(data.cooperationAttachmentName);
        formData.value.cooperationAttachment = data.cooperationAttachment;
        formData.value.cooperationAttachmentName = data.cooperationAttachmentName || '合作机构附件';
        attachmentFileList.value = [
          {
            uid: data.cooperationAttachment.toString() || Date.now().toString(),
            name: displayName,
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

// 组件挂载时获取详情
const handleSubmit = () => {
  if (!formRef.value) return;
  formRef.value.validate(async (valid) => {
    if (!valid) return;
    saving.value = true;
    try {
      const payload: any = {
        productName: formData.value.productName,
        productType: formData.value.productType,
        applicableObject: Array.isArray(formData.value.applicableObject)
          ? formData.value.applicableObject.join(',')
          : formData.value.applicableObject,
        minLoanAmount: Math.round((formData.value.minLoanAmount ?? 0) * 100) / 100,
        maxLoanAmount: Math.round((formData.value.maxLoanAmount ?? 0) * 100) / 100,
        baseInterestRate: formData.value.baseInterestRate ?? 0,
        floatInterestRate: formData.value.floatInterestRate ?? 0,
        loanCycle: Array.isArray(formData.value.loanCycle) ? formData.value.loanCycle.join(',') : formData.value.loanCycle,
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

const validateFile = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const imageExt = ['jpg', 'jpeg', 'png'];
  const docExt = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  const allExt = [...imageExt, ...docExt];

  if (!allExt.includes(ext)) {
    ElMessage.error(`不支持 ${ext.toUpperCase()} 格式的文件`);
    return false;
  }

  const limit = imageExt.includes(ext) ? 10 * MB : 100 * MB;
  if (file.size > limit) {
    ElMessage.error(imageExt.includes(ext) ? '图片文件最大10MB' : '文档文件最大100MB');
    return false;
  }

  return true;
};

// 格式化文件大小（参考普法内容实现）
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const uploadAttachmentFile = async (file: File) => {
  const modal = (proxy as any)?.$modal;
  modal?.loading?.('正在上传附件，请稍候...');

  try {
    // 统一使用 uploadByChunks，内部会自动判断是否需要分片上传（参考普法内容实现）
    const res: any = await uploadByChunks(file, (percent: number) => {
      modal?.setLoadingText?.(`正在上传...${percent}%`);
    });

    // 兼容处理不同的返回格式（参考普法内容实现）
    let uploadResult = res;
    if (res && !res.ossId && !res.ossid && res.data) {
      uploadResult = res.data;
    }

    // 兼容 ossId 和 ossid 两种字段名（参考普法内容实现）
    const ossId = uploadResult?.ossId || uploadResult?.ossid || uploadResult?.data?.ossId || uploadResult?.data?.ossid;
    if (!ossId) {
      throw new Error('上传失败，未获取到文件标识');
    }

    return {
      ossId,
      fileName: uploadResult?.fileName || uploadResult?.data?.fileName || file.name,
      originalName: file.name,
      fileSuffix: (file.name.split('.').pop() || '').toLowerCase(),
      url: uploadResult?.url || uploadResult?.data?.url || '',
      fileSize: formatFileSize(file.size)
    };
  } catch (error: any) {
    console.error('附件上传失败:', error);
    throw new Error(error?.msg || error?.message || '上传失败，请重试');
  } finally {
    modal?.closeLoading?.();
  }
};

// 附件上传前的校验
const beforeAttachmentUpload: UploadProps['beforeUpload'] = (file) => validateFile(file);

// 附件移除处理
const handleAttachmentUpload: UploadProps['httpRequest'] = async (options) => {
  const { file, onError, onSuccess } = options;
  const modal = (proxy as any)?.$modal;
  modal?.loading?.('正在上传附件，请稍候...');

  try {
    const res = await uploadAttachmentFile(file as File);

    // 保存上传结果（ossId）
    formData.value.cooperationAttachment = res.ossId;
    formData.value.cooperationAttachmentName = res.originalName || res.fileName || (file as File).name;
    attachmentFileList.value = [
      {
        name: formData.value.cooperationAttachmentName,
        status: 'success',
        url: res.url || ''
      } as UploadFile
    ];
    ElMessage.success('附件上传成功');
    onSuccess?.(res as any);
  } catch (error: any) {
    console.error('文件上传失败:', error);
    ElMessage.error(error?.message || error?.response?.data?.message || '上传失败，请重试');
    onError?.(error);
  } finally {
    modal?.closeLoading?.();
  }
};

// 信贷产品解析提示词（与后端保持一致）
const CREDIT_EXTRACT_PROMPT = `你是一个专业的产品信息提取器，可以根据文档内容，提取产品信息并返回JSON格式返回。
你当前的任务是根据给定的文档内容，严格遵守提取规则，提取产品信息，并根据提取规则映射至对应的英文key，不能有缺失。
提取规则如下:
- productName是对应的英文key，提取产品名称。优先从文档标题、首行或特定标识符（如'产品名称：XXX'）中提取。
- productType是对应的英文key，提取产品类型。识别关键词如'信贷'、'贷款'等，若匹配则设为'信贷'；否则设为'其他'。
- applicableObject是对应的英文key，提取适用对象。识别目标客群。关键词匹配：'农户'或'农业'则设为'采购商'；'中小企业'或'有限公司'则设为'企业'；'经销商'或'供应商'则设为'供应商'；未识别则留空。
- minLoanAmount是对应的英文key，提取可贷金额。识别金额数字及单位（如'万元'、'元'），支持区间（如'10-100万元'）和固定值（如'最高50万'），统一转换为'万元'单位，例如'10-100万元'转换为'10'。
- maxLoanAmount是对应的英文key，提取可贷金额。识别金额数字及单位（如'万元'、'元'），支持区间（如'10-100万元'）和固定值（如'最高50万'），统一转换为'万元'单位，例如'10-100万元'转换为'100'。
- baseInterestRate是对应的英文key，提取最小利率。识别数字及'%'符号，支持区间（如'5-10%'）和固定值（如'6%'），保留2位小数，例如'5-10%'转换为'5.00'。
- floatInterestRate是对应的英文key，提取最大利率。识别数字及'%'符号，支持区间（如'5-10%'）和固定值（如'6%'），保留2位小数，例如'5-10%'转换为'10.00'。
- loanCycle是对应的英文key，提取贷款周期。识别数字及单位（如'月'、'年'），支持区间（如'3-6月'）和固定值（如'12月'），获得最大值，单位统一为'月'，例如'3-6月'转换为'6'。
- repaymentMethod是对应的英文key，提取还款方式。关键词匹配：'等额本息'、'等额本金'、'先息后本'、'先本后息'等，未识别则留空。
- productIntro是对应的英文key，提取产品简介。优先从文档标题、首行或特定标识符（如'产品简介：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。
- productAdvantages是对应的英文key，提取产品优势。优先从文档标题、首行或特定标识符（如'产品优势：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。
- applicableInstructions是对应的英文key，提取适用对象说明。优先从文档标题、首行或特定标识符（如'适用说明：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。
- applicationInstructions是对应的英文key，提取申请条件。优先从文档标题、首行或特定标识符（如'申请条件：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。

响应, 请直接返回JSON结果: \`\`\`json`;

// 校验自动解析文件（只允许 PDF 和 DOCX）
const validateFileForParse = (file: File): boolean => {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const allowedExt = ['pdf', 'docx'];

  if (!allowedExt.includes(ext)) {
    ElMessage.error('自动解析功能仅支持 PDF 和 DOCX 格式的文件');
    return false;
  }

  const limit = 100 * MB;
  if (file.size > limit) {
    ElMessage.error('文档文件最大100MB');
    return false;
  }

  return true;
};

// 触发文件上传和解析
const triggerUpload = async () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.pdf,.docx';
  input.onchange = async (e: Event) => {
    const file = (e.target as HTMLInputElement)?.files?.[0];
    if (!file) return;

    // 验证文件（自动解析只允许 PDF 和 DOCX）
    if (!validateFileForParse(file)) {
      return;
    }

    // 调试：验证文件对象
    console.log('选择的文件对象:', {
      name: file.name,
      size: file.size,
      type: file.type,
      isFile: file instanceof File,
      constructor: file.constructor.name
    });

    const modal = (proxy as any)?.$modal;
    modal?.loading?.('正在上传文件并解析，请稍候...');

    try {
      // 1. 上传文件
      modal?.setLoadingText?.('正在上传文件...');
      let uploadRes: any;
      try {
        // 获取 appId（从环境变量或使用默认值）
        const env = (import.meta as any)?.env || {};
        const appId = env.VITE_FILE_PARSE_APPID || '693144b8dd48d8d992951257';
        uploadRes = await uploadFileToFastGPT(file, appId);
        console.log('上传响应:', uploadRes);
      } catch (uploadError: any) {
        console.error('上传文件失败:', uploadError);
        console.error('错误响应:', uploadError?.response);
        console.error('错误数据:', uploadError?.response?.data);
        console.error('请求配置:', uploadError?.config);
        console.error('请求数据:', uploadError?.config?.data);

        // 检查 FormData 是否正确
        if (uploadError?.config?.data instanceof FormData) {
          console.log('FormData 内容检查:');
          for (const [key, value] of uploadError.config.data.entries()) {
            if (value instanceof File) {
              console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
            } else {
              console.log(`  ${key}:`, value);
            }
          }
        }

        const errorMsg = uploadError?.response?.data?.message || uploadError?.response?.data?.msg || uploadError?.message || '上传失败';
        throw new Error(`文件上传失败: ${errorMsg}`);
      }

      // 尝试多种可能的 previewUrl 路径（严格按照接口文档：上传接口返回 previewUrl）
      const previewUrl =
        uploadRes?.data?.previewUrl ||
        uploadRes?.data?.data?.previewUrl ||
        uploadRes?.data?.url ||
        uploadRes?.data?.data?.url ||
        uploadRes?.previewUrl ||
        uploadRes?.url ||
        // 兼容旧格式（如果返回的是 fileId，可能需要拼接 URL）
        (uploadRes?.data?.fileId ? `http://8.153.15.72:81/fastgpt/file/${uploadRes.data.fileId}` : null);

      console.log('提取的 previewUrl:', previewUrl, '完整响应:', uploadRes);

      if (!previewUrl) {
        console.error('未找到 previewUrl，完整响应:', uploadRes);
        throw new Error(`上传失败，未获取到文件预览URL。响应数据: ${JSON.stringify(uploadRes?.data || uploadRes)}`);
      }

      // 2. 解析文件（使用 previewUrl）
      modal?.setLoadingText?.('正在解析文件内容...');
      let analysisRes: any;
      try {
        analysisRes = await fileAnalysis(previewUrl, CREDIT_EXTRACT_PROMPT);
        console.log('解析响应:', analysisRes);
      } catch (analysisError: any) {
        console.error('解析文件失败:', analysisError);
        const errorMsg = analysisError?.response?.data?.message || analysisError?.response?.data?.msg || analysisError?.message || '解析失败';
        throw new Error(`文件解析失败: ${errorMsg}`);
      }

      // 解析返回的JSON（支持新的数据结构：responseData数组）
      let parsedData: any = {};
      try {
        const responseData = analysisRes?.data || analysisRes;

        // 优先尝试从新的数据结构中提取（responseData数组）
        if (responseData?.responseData && Array.isArray(responseData.responseData)) {
          // 遍历 responseData 数组，查找 extractResult.info 或 pluginOutput.info
          for (const item of responseData.responseData) {
            if (item?.extractResult?.info) {
              parsedData = item.extractResult.info;
              break;
            } else if (item?.pluginOutput?.info) {
              parsedData = item.pluginOutput.info;
              break;
            }
          }
        }

        // 如果新结构中没有找到，尝试旧的解析方式
        if (!parsedData || Object.keys(parsedData).length === 0) {
          // 如果返回的是字符串，尝试解析JSON
          if (typeof responseData === 'string') {
            // 尝试提取JSON部分（可能包含在代码块中）
            const jsonMatch = responseData.match(/```json\s*([\s\S]*?)\s*```/) || responseData.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
            } else {
              parsedData = JSON.parse(responseData);
            }
          } else if (typeof responseData === 'object') {
            // 如果已经是对象，检查是否有嵌套的data字段
            parsedData = responseData?.data || responseData;
            // 如果data是字符串，尝试解析
            if (typeof parsedData === 'string') {
              const jsonMatch = parsedData.match(/```json\s*([\s\S]*?)\s*```/) || parsedData.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
              } else {
                parsedData = JSON.parse(parsedData);
              }
            }
          }
        }

        console.log('提取的解析数据:', parsedData);
      } catch (parseError) {
        console.error('解析返回数据失败:', parseError);
        ElMessage.warning('文件解析完成，但返回格式异常，请手动填写表单');
        return;
      }

      // 3. 填充表单数据
      if (parsedData && typeof parsedData === 'object') {
        // 产品名称
        if (parsedData.productName) {
          formData.value.productName = String(parsedData.productName);
        }

        // 产品类型
        if (parsedData.productType) {
          formData.value.productType = String(parsedData.productType);
        }

        // 适用对象（可能是字符串或数组）
        if (parsedData.applicableObject) {
          if (Array.isArray(parsedData.applicableObject)) {
            formData.value.applicableObject = parsedData.applicableObject;
          } else if (typeof parsedData.applicableObject === 'string') {
            formData.value.applicableObject = parsedData.applicableObject.split(',').filter(Boolean);
          }
        }

        // 可贷金额
        if (parsedData.minLoanAmount !== undefined && parsedData.minLoanAmount !== null) {
          formData.value.minLoanAmount = Number(parsedData.minLoanAmount);
        }
        if (parsedData.maxLoanAmount !== undefined && parsedData.maxLoanAmount !== null) {
          formData.value.maxLoanAmount = Number(parsedData.maxLoanAmount);
        }

        // 利率
        if (parsedData.baseInterestRate !== undefined && parsedData.baseInterestRate !== null) {
          formData.value.baseInterestRate = Number(parsedData.baseInterestRate);
        }
        if (parsedData.floatInterestRate !== undefined && parsedData.floatInterestRate !== null) {
          formData.value.floatInterestRate = Number(parsedData.floatInterestRate);
        }

        // 贷款周期（可能是字符串或数组）
        if (parsedData.loanCycle) {
          if (Array.isArray(parsedData.loanCycle)) {
            formData.value.loanCycle = parsedData.loanCycle;
          } else if (typeof parsedData.loanCycle === 'string') {
            formData.value.loanCycle = parsedData.loanCycle.split(',').filter(Boolean);
          }
        }

        // 还款方式（可能是字符串或数组）
        if (parsedData.repaymentMethod) {
          if (Array.isArray(parsedData.repaymentMethod)) {
            formData.value.repaymentMethod = parsedData.repaymentMethod;
          } else if (typeof parsedData.repaymentMethod === 'string') {
            formData.value.repaymentMethod = parsedData.repaymentMethod.split(',').filter(Boolean);
          }
        }

        // 产品简介
        if (parsedData.productIntro) {
          formData.value.productIntro = String(parsedData.productIntro);
        }

        // 产品优势
        if (parsedData.productAdvantages) {
          formData.value.productAdvantages = String(parsedData.productAdvantages);
          advantagesEditorKey.value += 1;
        }

        // 适用说明
        if (parsedData.applicableInstructions) {
          formData.value.applicableInstructions = String(parsedData.applicableInstructions);
          instructionsEditorKey.value += 1;
        }

        // 申请条件
        if (parsedData.applicationInstructions) {
          formData.value.applicationInstructions = String(parsedData.applicationInstructions);
          applicationEditorKey.value += 1;
        }

        ElMessage.success('文件解析成功，已自动填充表单');

        // 触发表单验证
        await nextTick();
        formRef.value?.validateField('productName').catch(() => {});
      } else {
        ElMessage.warning('文件解析完成，但未获取到有效数据');
      }
    } catch (error: any) {
      console.error('文件上传解析失败:', error);
      const errorMsg =
        error?.message || error?.response?.data?.message || error?.response?.data?.msg || error?.response?.statusText || '文件上传解析失败，请重试';
      ElMessage.error(errorMsg);
    } finally {
      modal?.closeLoading?.();
    }
  };
  input.click();
};

// 附件移除处理
const handleAttachmentRemove: UploadProps['onRemove'] = () => {
  attachmentFileList.value = [];
  formData.value.cooperationAttachment = null;
  formData.value.cooperationAttachmentName = '';
};

// 强制刷新可贷周期字典，确保系统新增的周期选项立即可用
const refreshLoanCycleDict = async () => {
  try {
    loanCycleLoading.value = true;
    const resp = await getDicts('loan_cycle');
    const options =
      resp?.data?.map((p: any) => ({
        label: p.dictLabel,
        value: p.dictValue,
        elTagType: p.listClass,
        elTagClass: p.cssClass
      })) ?? [];
    dictStore.setDict('loan_cycle', options);
    if (loan_cycle && 'value' in loan_cycle) {
      (loan_cycle as any).value = options;
    }
  } catch (error) {
    console.error('刷新可贷周期字典失败:', error);
  } finally {
    loanCycleLoading.value = false;
  }
};

const emitCancel = () => {
  emit('cancel');
};

onMounted(() => {
  // 每次打开弹窗时强制刷新可贷周期字典，避免旧缓存缺少新选项
  refreshLoanCycleDict();
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

  :deep(.el-form) {
    .el-form-item__label {
      text-align: right;
      padding-right: 12px;
    }

    .editor-field-item {
      .el-form-item__label {
        text-align: right;
        padding-right: 12px;
      }

      .el-form-item__content {
        margin-left: 0 !important;
      }
    }

    .editor-item-top {
      .el-form-item__label {
        float: none;
        display: block;
        text-align: left;
        padding-right: 0;
        padding-bottom: 8px;
        line-height: 1.5;
      }

      .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }

  :deep(.el-form-item) {
    &:has(.Editor),
    &:has(.attachment-upload) {
      .el-form-item__content {
        margin-left: 0 !important;
      }
    }
  }

  .field-title {
    font-size: 14px;
    font-weight: 400;
    color: #202020;
    margin-bottom: 8px;
    margin-left: 0;
    padding-left: 0;
    line-height: 1.5;
    display: block;
    text-align: left;
    width: 100%;
    box-sizing: border-box;

    &::before {
      content: '*';
      color: #F56C6C;
      margin-right: 4px;
    }
  }
}

.upload-global-hint {
  width: 100%;
  height: 114px;
  border: 2px dashed #D9D9D9;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 8px 0 24px;
  cursor: pointer;
  background: #FAFAFA;
  transition: all 0.3s;

  &:hover {
    border-color: #108C58;
    background: #F5F5F5;
  }

  .upload-icon-img {
    width: 48px;
    height: 48px;
    object-fit: contain;
  }

  .upload-text {
    color: #606266;
    font-size: 14px;
    font-family: 'PingFang SC', sans-serif;
    font-weight: 400;
  }
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
  flex-wrap: nowrap;
  white-space: nowrap;

  .range-split {
    color: #909399;
    white-space: nowrap;
    font-size: 14px;
  }

  .range-line {
    width: 16px;
    height: 1px;
    background-color: #DCDFE6;
    margin: 0 4px;
  }

  .unit {
    color: #606266;
    font-size: 14px;
  }

  :deep(.el-input-number) {
    width: 120px;
  }

  .inline-form-item {
    margin-bottom: 0;
  }
}

.loan-amount-item :deep(.el-form-item__content) {
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.attachment-upload {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .upload-block {
    :deep(.el-upload) {
      width: auto;
    }

    .custom-upload-btn {
      width: 126px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0;
      background: #108C58;
      border-radius: 2px;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        background: #0D7347;
      }

      .upload-btn-icon {
        width: 16px;
        height: 16px;
        object-fit: contain;
      }

      .upload-btn-text {
        color: #FFFFFF;
        font-size: 14px;
        font-weight: 400;
      }
    }
  }

  .file-list {
    margin-top: 8px;

    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: #F5F7FA;
      border-radius: 4px;
      margin-bottom: 8px;

      .file-name {
        color: #606266;
        font-size: 14px;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .file-remove {
        color: #909399;
        cursor: pointer;
        font-size: 16px;
        margin-left: 8px;

        &:hover {
          color: #F56C6C;
        }
      }
    }
  }

  .attachment-tip {
    font-size: 12px;
    color: #909399;
    margin: 4px 0 0 0;
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 0;
  border-top: none;
  gap: 12px;

  .el-button {
    min-width: 100px;
  }
}
</style>
