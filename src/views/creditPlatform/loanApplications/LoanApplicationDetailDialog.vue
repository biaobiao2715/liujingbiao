<template>
  <el-dialog :model-value="visible" width="900px" class="loan-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">{{ dialogTitle }}</div>
    </template>
    <div v-loading="loading">
      <div class="detail-section">
        <div class="section-title">企业基础信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in companyInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
          <el-descriptions-item label="营业执照">
            <template v-if="companyLicenseList.length">
              <el-image
                v-for="(img, idx) in companyLicenseList"
                :key="idx"
                :src="img.url"
                :preview-src-list="companyLicenseList"
                fit="cover"
                class="license-image"
              >
                <template #error>
                  <div class="image-placeholder">暂无图片</div>
                </template>
              </el-image>
            </template>
            <span v-else>--</span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">法人信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in legalInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">申请人信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in applicantInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
          <el-descriptions-item label="个人身份证明" :span="2">
            <template v-if="applicantIdPhotos.length">
              <el-image v-for="(img, idx) in applicantIdPhotos" :key="idx" :src="img" :preview-src-list="applicantIdPhotos" class="license-image">
                <template #error>
                  <div class="image-placeholder">暂无图片</div>
                </template>
              </el-image>
            </template>
            <span v-else>--</span>
          </el-descriptions-item>
          <el-descriptions-item label="授权文件" :span="2">
            <template v-if="applicantAuthFiles.length">
              <el-image v-for="(img, idx) in applicantAuthFiles" :key="idx" :src="img" :preview-src-list="applicantAuthFiles" class="license-image">
                <template #error>
                  <div class="image-placeholder">暂无图片</div>
                </template>
              </el-image>
            </template>
            <div v-else class="image-placeholder">暂无图片</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <div class="detail-section">
        <div class="section-title">贷款信息</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item v-for="item in loanInfoList" :key="item.label" :label="item.label">
            {{ item.value }}
          </el-descriptions-item>
        </el-descriptions>
        <div class="bank-card-preview">
          <div>银行卡号正反面：</div>
          <div class="bank-card-images">
            <template v-if="bankCardImages.length">
              <el-image
                v-for="(img, idx) in bankCardImages"
                :key="idx"
                :src="img"
                :preview-src-list="bankCardImages"
                class="license-image"
              >
                <template #error>
                  <div class="image-placeholder">暂无图片</div>
                </template>
              </el-image>
            </template>
            <div v-else class="card-placeholder">暂无图片</div>
          </div>
        </div>
        <div class="product-link">
          <el-button type="primary" plain size="large" @click="handleViewProductDetail">查看产品详情</el-button>
        </div>
      </div>

      <div class="detail-section approval-section">
        <div class="section-title">审批信息</div>
        <el-alert
          v-if="showApprovalTip"
          :title="approvalTipMessage"
          type="warning"
          show-icon
          :closable="false"
          class="tips"
        />
        <el-form
          v-if="showApprovalForm"
          ref="approvalFormRef"
          :model="approvalForm"
          :rules="approvalRules"
          label-width="100px"
          class="approval-form no-wrap-label"
        >
          <el-form-item label="审批结果" prop="opinion">
            <el-select v-model="approvalForm.opinion" :disabled="isApprovalReadonly">
              <el-option label="同意" value="agree" />
              <el-option label="不同意" value="reject" />
            </el-select>
          </el-form-item>
          <el-form-item label="审批意见" prop="rejectionReason">
            <el-input
              v-model="approvalForm.rejectionReason"
              type="textarea"
              :rows="3"
              maxlength="200"
              show-word-limit
              placeholder="请输入审批意见"
              :disabled="isApprovalReadonly"
            />
          </el-form-item>
          <el-form-item v-if="isApproveAgree || (!isApprovalMode && approvalForm.loanDate)" label="放款日期" prop="loanDate">
            <el-date-picker
              v-model="approvalForm.loanDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              :disabled="isApprovalReadonly"
            />
          </el-form-item>
          <el-form-item
            v-if="isApproveAgree || (!isApprovalMode && approvalForm.firstRepaymentDate)"
            label="第一期还款日期"
            prop="firstRepaymentDate"
          >
            <el-date-picker
              v-model="approvalForm.firstRepaymentDate"
              type="date"
              placeholder="选择日期"
              style="width: 100%"
              :disabled="isApprovalReadonly"
            />
          </el-form-item>
          <el-form-item label="贷款合同" prop="contractId" class="contract-field">
            <template v-if="isApprovalMode">
              <el-upload
                class="contract-uploader inline-uploader"
                :disabled="contractUploading || submittingApproval"
                accept=".pdf,.jpg,.png"
                :limit="1"
                :file-list="approvalForm.contractFiles"
                :http-request="handleContractUpload"
                :on-remove="handleRemoveFile"
              >
                <el-button type="primary" :loading="contractUploading" icon="Upload">
                  点击上传
                </el-button>
                <template #tip>
                  <div class="upload-tip">支持 pdf/jpg/png，单文件上传</div>
                </template>
              </el-upload>
            </template>
            <template v-else>
              <div class="contract-files" v-if="approvalForm.contractFiles.length">
                <el-link
                  v-for="(file, idx) in approvalForm.contractFiles"
                  :key="file.url || idx"
                  :href="file.url"
                  target="_blank"
                  type="primary"
                >
                  {{ file.name || `合同文件${idx + 1}` }}
                </el-link>
              </div>
              <span v-else>--</span>
            </template>
          </el-form-item>
          <div class="approval-actions" v-if="isApprovalMode">
            <el-button
              type="primary"
              :loading="submittingApproval && currentApprovalAction === 'agree'"
              :disabled="submittingApproval || contractUploading"
              @click="handleSubmitApproval('agree')"
            >
              审批通过
            </el-button>
            <el-button
              :loading="submittingApproval && currentApprovalAction === 'reject'"
              :disabled="submittingApproval || contractUploading"
              @click="handleSubmitApproval('reject')"
            >
              审批驳回
            </el-button>
          </div>
        </el-form>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ isApprovalMode ? '关闭' : '返回' }}</el-button>
      </div>
    </template>
    <ProductDetailDialog v-model:visible="productDetailVisible" :product-id="currentDetail.productId" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref, nextTick } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage } from 'element-plus';
import { getRemainingDetail, getEnterprise, auditLoanApplication, uploadFile,getProduct } from '@/api/creditPlatform/loanApplications';
import ProductDetailDialog from './ProductDetailDialog.vue';

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
  mode?: 'detail' | 'approval';
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const approvalFormRef = ref<FormInstance>();
const approvalForm = reactive({
  opinion: 'agree',
  rejectionReason: '',
  loanDate: '',
  firstRepaymentDate: '',
  contractId: '',
  contractFiles: [] as any[]
});
const submittingApproval = ref(false);
const contractUploading = ref(false);
const currentApprovalAction = ref<'agree' | 'reject' | null>(null);

const loading = ref(false);
const detailRow = ref<Record<string, any>>(props.data || {});
const currentDetail = computed(() => detailRow.value || {});
const productDetailVisible = ref(false);

const reviewStatusMap: Record<string, string> = {
  '0': '待审核',
  '1': '审核通过',
  '99': '审核退回'
};

const credentialLevelMap: Record<string, string> = {
  '0': '一级认证',
  '1': '二级认证',
  '2': '三级认证'
};

const creditLevelMap: Record<string, string> = {
  '0': '优秀',
  '1': '良好',
  '2': '一般',
  '3': '一般以下',
  '99': '较差'
};

const applyStatusMap: Record<string, string> = {
  '0': '待审核',
  '1': '待审核',
  '2': '审批通过',
  '3': '审批驳回',
  '99': '审批异常'
};

const idCardTypeMap: Record<string, string> = {
  '0': '身份证',
  '1': '护照',
  '2': '其他'
};

const repaymentMethodMap: Record<string, string> = {
  '0': '等额本息',
  '2': '等额本金',
  '3': '先息后本',
  '4': '先本后息'
};

const formatValue = (value: any) => {
  if (value === undefined || value === null || value === '') return '--';
  return value;
};

const mapValue = (map: Record<string, string>, value: any) => {
  if (value === undefined || value === null || value === '') return '--';
  return map[String(value)] || '--';
};

const collectUrls = (...sources: any[]): string[] => {
  const urls: string[] = [];
  const append = (item: any) => {
    if (!item) return;
    if (Array.isArray(item)) {
      item.forEach(append);
      return;
    }
    if (typeof item === 'string') {
      if (item) urls.push(item);
      return;
    }
    if (typeof item === 'object') {
      const url = item.url || item.fileUrl || item.path || item.src;
      if (url) urls.push(url);
    }
  };
  sources.forEach(append);
  return urls;
};

const approvalRules: FormRules = {
  opinion: [{ required: true, message: '请选择审批结果', trigger: 'change' }],
  rejectionReason: [{ required: true, message: '请输入审批意见', trigger: 'blur' }],
  loanDate: [
    {
      validator: (_rule, value, callback) => {
        if (approvalForm.opinion === 'agree' && !value) {
          callback(new Error('请选择放款日期'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  firstRepaymentDate: [
    {
      validator: (_rule, value, callback) => {
        if (approvalForm.opinion === 'agree' && !value) {
          callback(new Error('请选择第一期还款日期'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ],
  contractId: [
    {
      validator: (_rule, _value, callback) => {
        if (approvalForm.opinion === 'agree' && !approvalForm.contractId) {
          callback(new Error('请上传贷款合同'));
        } else {
          callback();
        }
      },
      trigger: 'change'
    }
  ]
};

const fetchDetail = async () => {
  if (!props.data?.id) {
    detailRow.value = props.data || {};
    return;
  }
  loading.value = true;
  try {
    let merged: Record<string, any> = props.data ? { ...props.data } : {};
    const res = await getRemainingDetail(props.data.id);
    if (res && res.code === 200 && res.data) {
      merged = { ...merged, ...res.data };
    }
    const userId = merged.lenderId || merged.userId;
    if (userId) {
      try {
        const extra = await getEnterprise({ id: userId });
        if (extra && extra.code === 200 && extra.data) {
          merged = { ...merged, ...extra.data };
        }
      } catch (error) {
        console.error('获取企业信息失败:', error);
      }
    }
    detailRow.value = merged;
    if (props.mode === 'approval') {
      resetApprovalForm();
    } else {
      hydrateApprovalForm(merged);
    }
  } catch (error) {
    console.error('获取申请详情失败:', error);
    detailRow.value = props.data || {};
  } finally {
    loading.value = false;
  }
};

watch([() => props.visible, () => props.data?.id], ([visible, id], [prevVisible, prevId]) => {
  if (visible && (!prevVisible || id !== prevId)) {
    fetchDetail();
  }
});

const companyInfoList = computed(() => {
  const row = detailRow.value;
  const registerRegion = [row.province, row.city, row.district].filter(Boolean).join('');
  return [
    { label: '供应商编号', value: formatValue(row.enterpriseNumber || row.supplierNo) },
    { label: '审核状态', value: mapValue(reviewStatusMap, row.reviewStatus) },
    { label: '供应商名称', value: formatValue(row.companyName) },
    { label: '社会统一信用代码', value: formatValue(row.licenseNumber || row.creditCode) },
    { label: '注册资本', value: formatValue(row.signUpCapital || row.registeredCapital) },
    { label: '注册日期', value: formatValue(row.createTime || row.registerDate) },
    { label: '注册地址', value: registerRegion ? registerRegion : formatValue(row.registerAddress) },
    { label: '办公地址', value: formatValue(row.officeAddress) },
    { label: '资质等级', value: mapValue(credentialLevelMap, row.credentialLevel || row.qualification) },
    { label: '信用等级', value: mapValue(creditLevelMap, row.creditLevel) },
    { label: '经营范围', value: formatValue(row.businessScope) }
  ];
});

const companyLicenseList = computed(() => {
  const row = detailRow.value;
  return Array.isArray(row.licenses) ? row.licenses : [];
});

const legalInfoList = computed(() => {
  const row = detailRow.value;
  return [
    { label: '法人姓名', value: formatValue(row.legalPersonName || row.legalPerson) },
    { label: '证件类型', value: mapValue(idCardTypeMap, row.legalPersonIdCardType || row.certificateType) },
    { label: '证件号码', value: formatValue(row.legalPersonIdCardNumber || row.certificateNumber || row.legalPersonContactPhone) },
    { label: '联系电话', value: formatValue(row.legalPersonContactPhone || row.phoneNumber) }
  ];
});

const applicantInfoList = computed(() => {
  const row = detailRow.value;
  return [
    { label: '申请人', value: formatValue(row.realName || row.applicantName) },
    { label: '联系电话', value: formatValue(row.contactPhone || row.phone || row.applicantPhone) }
  ];
});

const applicantIdPhotos = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.idFrontUrl, row.idBackUrl, row.idBackUr, row.idCardUrl, row.idcardUrl, row.idcardUr);
});

const applicantAuthFiles = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.authorizationFiles, row.authorizationUrl);
});

const loanInfoList = computed(() => {
  const row = detailRow.value;
  return [
    { label: '贷款金额', value: formatValue(row.loanAmount) },
    { label: '贷款期限', value: formatValue(row.loanTerm) },
    { label: '还款方式', value: mapValue(repaymentMethodMap, row.repaymentMethod || row.repaymentType) },
    { label: '收款银行卡', value: formatValue(row.collectionAccountName || row.bankName) },
    { label: '银行卡号', value: formatValue(row.bankAccountNumber || row.bankCardNo) },
    { label: '申请时间', value: formatValue(row.createTime || row.applyTime) }
  ];
});

const bankCardImages = computed(() => {
  const row = detailRow.value;
  return collectUrls(row.bankFrontUrl, row.bankBackUrl);
});

const dialogTitle = computed(() => {
  return props.mode === 'approval' ? '企业贷款申请审核' : '贷款申请详情（企业）';
});

const isApprovalMode = computed(() => props.mode === 'approval');
const isApprovalReadonly = computed(() => !isApprovalMode.value);
const isApproveAgree = computed(() => approvalForm.opinion === 'agree');
const isPendingStatus = computed(() => {
  const status = detailRow.value?.applyStatus;
  if (status === undefined || status === null || status === '') return false;
  const label = applyStatusMap[String(status)] || detailRow.value?.applyStatusName || detailRow.value?.applyStatusLabel || '';
  return String(label).includes('待审');
});
const hasCompletedResult = computed(() => {
  const status = detailRow.value?.applyStatus;
  return status === '2' || status === '3';
});
const showApprovalTip = computed(() => !isApprovalMode.value && isPendingStatus.value && !hasCompletedResult.value);
const approvalTipMessage = computed(() => {
  return '当前申请状态为待审核，请前往审批流程处理。';
});
const showApprovalForm = computed(() => 
  (isApprovalMode.value && !hasCompletedResult.value) || 
  (!isApprovalMode.value && hasCompletedResult.value)
);

watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetApprovalForm();
    }
  }
);

const handleClose = () => {
  emit('update:visible', false);
};

const handleViewProductDetail = () => {
  if (!currentDetail.value.productId) {
    ElMessage.warning('产品ID不存在');
    return;
  }
  productDetailVisible.value = true;
};

const normalizeContractFiles = (row: Record<string, any>) => {
  const baseName = row.contractFileName || '合同文件';
  const files = collectUrls(row.contractFiles, row.contractFileUrl, row.contractUrl);
  if (!files.length) return [];
  return files.map((url: string, index: number) => ({
    name: files.length === 1 ? baseName : `${baseName}${index + 1}`,
    url,
    id: row.contractId || ''
  }));
};

const hydrateApprovalForm = (row: Record<string, any>) => {
  approvalForm.rejectionReason = row.rejectionReason || '';
  approvalForm.loanDate = row.loanDate || '';
  approvalForm.firstRepaymentDate = row.firstRepaymentDate || '';
  approvalForm.contractId = row.contractId || '';
  if (row.applyStatus === '3') {
    approvalForm.opinion = 'reject';
  } else if (row.applyStatus === '2') {
    approvalForm.opinion = 'agree';
  }
  approvalForm.contractFiles = normalizeContractFiles(row);
};

const resetApprovalForm = () => {
  approvalForm.opinion = 'agree';
  approvalForm.rejectionReason = '';
  approvalForm.loanDate = '';
  approvalForm.firstRepaymentDate = '';
  approvalForm.contractId = '';
  approvalForm.contractFiles = [];
  currentApprovalAction.value = null;
  nextTick(() => {
    approvalFormRef.value?.clearValidate();
  });
};

const handleContractUpload = async (options: any) => {
  if (isApprovalReadonly.value) {
    options?.onError?.(new Error('仅可查看'));
    return;
  }
  const formData = new FormData();
  formData.append('file', options.file);
  contractUploading.value = true;
  try {
    const res = await uploadFile(formData);
    if (res && res.code === 200 && res.data) {
      const resData = res.data;
      const fileInfo = {
        name: resData.fileName || resData.originalFilename || options.file.name,
        url: resData.url || resData.fileUrl || resData.path,
        id: resData.contractId || resData.ossId || resData.id || resData.fileId || '',
        ossId: resData.ossId
      };
      if (!fileInfo.url) {
        throw new Error('上传返回结果缺少文件地址');
      }
      approvalForm.contractFiles = [fileInfo];
      approvalForm.contractId = String(fileInfo.ossId || fileInfo.id || '');
      approvalFormRef.value?.validateField?.('contractId');
      options.onSuccess?.(res, options.file);
      ElMessage.success('合同上传成功');
    } else {
      throw new Error(res?.msg || '合同上传失败');
    }
  } catch (error: any) {
    options.onError?.(error);
    ElMessage.error(error?.message || '合同上传失败');
  } finally {
    contractUploading.value = false;
  }
};

const handleRemoveFile = () => {
  if (isApprovalReadonly.value) return;
  approvalForm.contractFiles = [];
  approvalForm.contractId = '';
  approvalFormRef.value?.validateField?.('contractId');
};

const handleSubmitApproval = async (action: 'agree' | 'reject') => {
  currentApprovalAction.value = action;
  approvalForm.opinion = action;
  await nextTick();
  try {
    await approvalFormRef.value?.validate();
  } catch (error) {
    currentApprovalAction.value = null;
    return;
  }
  if (!detailRow.value?.id && !props.data?.id) {
    ElMessage.error('缺少申请ID，无法提交审批');
    currentApprovalAction.value = null;
    return;
  }
  submittingApproval.value = true;
  try {
    const payload = {
      ...detailRow.value,
      id: detailRow.value?.id || props.data?.id,
      applyStatus: action === 'agree' ? '2' : '3',
      rejectionReason: approvalForm.rejectionReason,
      loanDate: approvalForm.loanDate,
      firstRepaymentDate: approvalForm.firstRepaymentDate,
      contractId: approvalForm.contractId
    };
    const res = await auditLoanApplication(payload);
    if (res && res.code === 200) {
      ElMessage.success(action === 'agree' ? '审批通过成功' : '审批驳回成功');
      emit('update:visible', false);
    } else {
      throw new Error(res?.msg || '审批提交失败');
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '审批提交失败');
  } finally {
    submittingApproval.value = false;
    currentApprovalAction.value = null;
  }
};
</script>

<style scoped lang="scss">
.no-wrap-label {
  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}
.loan-detail-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    width: 6px;
    height: 16px;
    background-color: #409eff;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.license-image {
  width: 100px;
  height: 70px;
  margin-right: 8px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.image-placeholder,
.card-placeholder {
  width: 100px;
  height: 70px;
  border: 1px dashed #dcdfe6;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 12px;
}

.bank-card-preview {
  margin-top: 12px;

  .bank-card-images {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }
}

.product-link {
  margin-top: 16px;
  display: flex;
  justify-content: center;
}

.approval-section {
  .tips {
    margin-bottom: 16px;
  }
}

.approval-actions {
  margin-top: 40px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.contract-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contract-field {
  :deep(.el-form-item__content) {
    width: 100%;
  }
  .contract-files {
    margin-top: 4px;
  }
  .inline-uploader {
    display: inline-flex;
    align-items: center;
  }
  .upload-tip {
    color: #909399;
    font-size: 12px;
    margin-left: 12px;
  }
}

.dialog-footer {
  text-align: right;
}
</style>
