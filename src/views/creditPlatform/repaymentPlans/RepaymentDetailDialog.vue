<template>
  <el-dialog :model-value="visible" width="900px" class="repayment-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">贷后管理详情（企业）</div>
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

      <div class="detail-section">
        <div class="section-title">查看合同</div>
        <div class="contract-section">
          <el-button type="primary" @click="handleViewContract">查看合同详情</el-button>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-title">还款计划</div>
        <div class="repayment-section">
          <el-button type="success" @click="handleViewRepaymentPlan">查看还款计划</el-button>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">返回</el-button>
      </div>
    </template>
    <ProductDetailDialog v-model:visible="productDetailVisible" :product-id="currentDetail.productId" />
    <RepaymentPlanDialog v-model:visible="repaymentPlanVisible" :data="props.data" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import ProductDetailDialog from '../loanApplications/ProductDetailDialog.vue';
import RepaymentPlanDialog from './RepaymentPlanDialog.vue';

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const loading = ref(false);
const detailRow = ref<Record<string, any>>(props.data || {});
const currentDetail = computed(() => detailRow.value || {});
const productDetailVisible = ref(false);
const repaymentPlanVisible = ref(false);

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

const fetchDetail = async () => {
  if (!props.data?.id) {
    detailRow.value = props.data || {};
    return;
  }
  loading.value = true;
  try {
    // 这里应该调用真实的API获取详细信息
    // const res = await getRepaymentDetail(props.data.id);
    // detailRow.value = res.data;
    detailRow.value = props.data || {};
  } catch (error) {
    console.error('获取贷后详情失败:', error);
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

const handleViewContract = () => {
  ElMessage.info('查看合同详情功能待开发');
};

const handleViewRepaymentPlan = () => {
  repaymentPlanVisible.value = true;
};
</script>

<style scoped lang="scss">
.repayment-detail-dialog {
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

.contract-section,
.repayment-section {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}

.dialog-footer {
  text-align: right;
}
</style>
