<!--
  标题: 保险产品新增/编辑页
  功能: 提供保险产品的新增和编辑功能
  说明: 支持保险产品的基本信息录入、富文本编辑、附件上传等功能
  当前版本: 1.0
  开发信息: 门世超
-->
<template>
  <div class="product-insurance-form" v-loading="loading">
    <div class="section-title">基础信息</div>
    <div class="upload-global-hint" @click="triggerUpload">
      <div class="upload-icon-box">
        <span class="plus">+</span>
      </div>
      <el-icon class="file-icon" :size="24"><Document /></el-icon>
      <span class="upload-text">注：上传文件自动解析</span>
    </div>
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="产品名称" prop="productName">
            <el-input v-model="formData.productName" placeholder="请输入产品名称" maxlength="50" show-word-limit clearable />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="适用对象" prop="applicableObject">
            <el-select v-model="formData.applicableObject" placeholder="请选择适用对象" clearable multiple>
              <el-option v-for="dict in applicable_object" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="24">
        <el-col :span="12">
          <el-form-item label="产品类型" prop="productType">
            <el-select v-model="formData.productType" placeholder="请选择产品类型" clearable>
              <el-option v-for="dict in product_insurance_type" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          <div v-if="showReplaceTip" class="replace-tip">请删除后重新上传</div>
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
import { uploadByChunks } from '@/utils/chunkUpload';
import { listByIds } from '@/api/system/oss';
import { uploadFileToFastGPT, fileAnalysis } from '@/api/common/fileUpload';
import { nextTick } from 'vue';

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
const MB = 1024 * 1024;
const CHUNK_UPLOAD_THRESHOLD = 100 * MB;

// 保险产品解析提示词（与后端保持一致）
const INSURANCE_EXTRACT_PROMPT = `你是一个专业的产品信息提取器，可以根据文档内容，提取产品信息并返回JSON格式返回。
你当前的任务是根据给定的文档内容，严格遵守提取规则，提取产品信息，并根据提取规则映射至对应的英文key，不能有缺失。
提取规则如下:
- productName是对应的英文key，提取产品名称。优先从文档标题、首行或特定标识符（如'产品名称：XXX'）中提取。
- productType是对应的英文key，提取产品类型。识别关键词如'成本保险'、'价格保险'、'收入保险'、'气象指数保险'等，未识别则留空。
- applicableObject是对应的英文key，提取适用对象。识别目标客群。关键词匹配：'农户'或'农业'则设为'采购商'；'中小企业'或'有限公司'则设为'企业'；'经销商'或'供应商'则设为'供应商'；未识别则留空。
- productIntro是对应的英文key，提取产品简介。优先从文档标题、首行或特定标识符（如'产品简介：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。
- productAdvantages是对应的英文key，提取产品优势。优先从文档标题、首行或特定标识符（如'产品优势：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。
- guaranteePlan是对应的英文key，提取保障计划。优先从文档标题、首行或特定标识符（如'保障计划：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。
- applicationInstructions是对应的英文key，提取申请条件。优先从文档标题、首行或特定标识符（如'申请条件：XXX'）中提取。若无明确标识，则从结合文档内容推断，未识别则留空。

响应, 请直接返回JSON结果: \`\`\`json`;

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

// 触发上传解析
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
        analysisRes = await fileAnalysis(previewUrl, INSURANCE_EXTRACT_PROMPT);
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

        // 产品简介
        if (parsedData.productIntro) {
          formData.value.productIntro = String(parsedData.productIntro);
        }

        // 产品优势
        if (parsedData.productAdvantages) {
          formData.value.productAdvantages = String(parsedData.productAdvantages);
          advantagesEditorKey.value += 1;
        }

        // 保障计划
        if (parsedData.guaranteePlan) {
          formData.value.guaranteePlan = String(parsedData.guaranteePlan);
          guaranteePlanEditorKey.value += 1;
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
// 构建上传文件项
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

// 触发附件上传
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
  productAdvantages: [{ required: true, message: '请输入产品优势', trigger: 'change' }],
  guaranteePlan: [{ required: true, message: '请输入保障计划', trigger: 'change' }],
  applicationInstructions: [{ required: true, message: '请输入申请条件', trigger: 'change' }],
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
      // 产品备注默认值（未填写时使用）
      const defaultProductRemark = '具体开办的业务种类及办理程序、办理条件等以线下网点信息为准。';

      const payload: any = {
        productName: formData.value.productName,
        productType: formData.value.productType,
        applicableObject: Array.isArray(formData.value.applicableObject)
          ? formData.value.applicableObject.join(',')
          : formData.value.applicableObject,
        productStatus: formData.value.status || '3',
        productIntro: formData.value.productIntro,
        productAdvantages: formData.value.productAdvantages,
        guaranteePlan: formData.value.guaranteePlan,
        applicationInstructions: formData.value.applicationInstructions,
        productRemark: formData.value.productRemark?.trim() || defaultProductRemark,
        branchOfficeAttachment: formData.value.branchOfficeAttachment ?? null
      };
      if (props.type === 'edit') {
        payload.id = props.id;
        payload.productId = formData.value.productId;
        payload.optType = '1';
      }
      const response = props.type === 'edit' ? await editInsuranceProduct(payload) : await addInsuranceProduct(payload);
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

// 加载编辑数据
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
  uploadLoading.value = true;
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
    uploadLoading.value = false;
    modal?.closeLoading?.();
  }
};

const beforeAttachmentUpload: UploadProps['beforeUpload'] = (file) => {
  if (attachmentFileList.value.length > 0) {
    showReplaceTip.value = true;
    setTimeout(() => {
      showReplaceTip.value = false;
    }, 3000);
    return false;
  }
  return validateFile(file);
};

// 处理附件上传
const handleAttachmentUpload: UploadProps['httpRequest'] = async (options) => {
  const { file, onError, onSuccess } = options;
  const modal = (proxy as any)?.$modal;
  uploadLoading.value = true;
  modal?.loading?.('正在上传附件，请稍候...');

  try {
    const res = await uploadAttachmentFile(file as File);

    formData.value.branchOfficeAttachment = res.ossId;
    formData.value.branchOfficeAttachmentName = res.originalName || res.fileName || (file as File).name;
    attachmentFileList.value = [
      buildUploadFileItem({
        name: formData.value.branchOfficeAttachmentName,
        url: res.url || ''
      })
    ];
    ElMessage.success('附件上传成功');
    showReplaceTip.value = false;
    if (formRef.value) {
      formRef.value.validateField('branchOfficeAttachment');
    }
    onSuccess?.(res as any);
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

// 处理附件移除
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

// 从详情数据同步附件信息
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

  // 优先使用 ossFileVo 数组中的文件信息
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
      const ossData = Array.isArray(ossResponse?.data) ? ossResponse.data : (ossResponse ?? []);
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
        applicableObject: data.applicableObject
          ? Array.isArray(data.applicableObject)
            ? data.applicableObject
            : data.applicableObject.split(',')
          : [],
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

.upload-global-hint {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #f56c6c;
  margin: 8px 0 12px;
  cursor: pointer;

  .upload-icon-box {
    width: 36px;
    height: 36px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266;
    box-sizing: border-box;
    background: #fff;
  }

  .upload-icon-box .plus {
    font-size: 16px;
    line-height: 1;
  }

  .file-icon {
    color: #303133;
  }

  .upload-text {
    color: #f56c6c;
    font-size: 12px;
  }
}

.attachment-upload-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .upload-hint,
  .upload-global-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #f56c6c;
  }

  .upload-icon-box {
    width: 36px;
    height: 36px;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #606266;
    box-sizing: border-box;
  }

  .upload-icon-box .plus {
    font-size: 16px;
    line-height: 1;
  }

  .file-icon {
    color: #303133;
  }

  .upload-text {
    color: #f56c6c;
    font-size: 12px;
  }

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
