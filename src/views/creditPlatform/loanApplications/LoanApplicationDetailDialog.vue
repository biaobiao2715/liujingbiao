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
          <el-button type="primary" plain size="large">查看产品详情</el-button>
        </div>
      </div>

      <div v-if="isApprovalMode" class="detail-section approval-section">
        <div class="section-title">审批信息</div>
        <el-alert
          title="审核通过时需填写放款日期、第一期还款日并上传合同；审批前需确认状态为待审核。"
          type="warning"
          show-icon
          :closable="false"
          class="tips"
        />
        <el-form label-width="100px" class="approval-form no-wrap-label">
          <el-form-item label="审批意见" required>
            <el-select v-model="approvalForm.opinion">
              <el-option label="同意" value="agree" />
              <el-option label="不同意" value="reject" />
            </el-select>
          </el-form-item>
          <el-form-item label="放款日期" required>
            <el-date-picker v-model="approvalForm.loanDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="第一期还款日" required>
            <el-date-picker v-model="approvalForm.firstRepaymentDate" type="date" placeholder="选择日期" style="width: 100%" />
          </el-form-item>
          <el-form-item label="贷款合同" required>
            <el-upload
              class="contract-uploader"
              drag
              :auto-upload="false"
              accept=".pdf,.jpg,.png"
              :file-list="approvalForm.contractFiles"
              :on-remove="handleRemoveFile"
              :on-change="handleUploadChange"
            >
              <i class="el-icon-upload" />
              <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            </el-upload>
          </el-form-item>
          <div class="approval-actions">
            <el-button type="primary">审批通过</el-button>
            <el-button>审批驳回</el-button>
          </div>
        </el-form>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">{{ isApprovalMode ? '关闭' : '返回' }}</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch, ref } from 'vue';
import { getRemainingDetail, getEnterprise } from '@/api/creditPlatform/loanApplications';

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
  mode?: 'detail' | 'approval';
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const approvalForm = reactive({
  opinion: 'agree',
  loanDate: '',
  firstRepaymentDate: '',
  contractFiles: [] as any[]
});

const loading = ref(false);
const detailRow = ref<Record<string, any>>(props.data || {});

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
  const photos: string[] = [];
  if (row.idFrontUrl) photos.push(row.idFrontUrl);
  const back = row.idBackUrl || row.idBackUr;
  if (back) photos.push(back);
  return photos;
});

const applicantAuthFiles = computed(() => {
  const row = detailRow.value;
  const files: string[] = [];
  const pushUrl = (val: any) => {
    if (!val) return;
    if (typeof val === 'string' && val) {
      files.push(val);
    } else if (typeof val === 'object') {
      const url = val.url || val.fileUrl || val.path || val.src;
      if (url) files.push(url);
    }
  };

  if (Array.isArray(row.authorizationFiles)) {
    row.authorizationFiles.forEach(pushUrl);
  } else {
    pushUrl(row.authorizationUrl);
  }

  return files;
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
  const list: string[] = [];
  if (row.bankFrontUrl) list.push(row.bankFrontUrl);
  if (row.bankBackUrl) list.push(row.bankBackUrl);
  return list;
});

const dialogTitle = computed(() => {
  return props.mode === 'approval' ? '企业贷款申请审批' : '贷款申请详情';
});

const isApprovalMode = computed(() => props.mode === 'approval');

watch(
  () => props.visible,
  (val) => {
    if (val) {
      approvalForm.opinion = 'agree';
      approvalForm.loanDate = '';
      approvalForm.firstRepaymentDate = '';
      approvalForm.contractFiles = [];
    }
  }
);

const handleClose = () => {
  emit('update:visible', false);
};

const handleUploadChange = (file: any, fileList: any[]) => {
  approvalForm.contractFiles = fileList;
};

const handleRemoveFile = (_file: any, fileList: any[]) => {
  approvalForm.contractFiles = fileList;
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
  margin-top: 8px;
  display: flex;
  gap: 12px;
}

.dialog-footer {
  text-align: right;
}
</style>
