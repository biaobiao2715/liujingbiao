<template>
  <el-dialog :model-value="visible" width="900px" class="loan-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">贷款申请详情</div>
    </template>

    <div class="detail-section">
      <div class="section-title">企业基础信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="供应商编号">{{ detail.company.supplierNo }}</el-descriptions-item>
        <el-descriptions-item label="审核状态">{{ detail.company.reviewStatus }}</el-descriptions-item>
        <el-descriptions-item label="供应商名称">{{ detail.company.companyName }}</el-descriptions-item>
        <el-descriptions-item label="社会统一信用代码">{{ detail.company.creditCode }}</el-descriptions-item>
        <el-descriptions-item label="注册资本">{{ detail.company.registeredCapital }}</el-descriptions-item>
        <el-descriptions-item label="注册日期">{{ detail.company.registerDate }}</el-descriptions-item>
        <el-descriptions-item label="注册地址">{{ detail.company.registerAddress }}</el-descriptions-item>
        <el-descriptions-item label="营业执照">
          <el-image
            v-for="(img, idx) in detail.company.licenses"
            :key="idx"
            :src="img"
            :preview-src-list="detail.company.licenses"
            fit="cover"
            class="license-image"
          >
            <template #error>
              <div class="image-placeholder">暂无图片</div>
            </template>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="办公地址" :span="2">{{ detail.company.officeAddress }}</el-descriptions-item>
        <el-descriptions-item label="资质等级">{{ detail.company.qualification }}</el-descriptions-item>
        <el-descriptions-item label="信用等级">{{ detail.company.creditLevel }}</el-descriptions-item>
        <el-descriptions-item label="经营范围" :span="2">{{ detail.company.businessScope }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="detail-section">
      <div class="section-title">法人信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="法人姓名">{{ detail.legal.name }}</el-descriptions-item>
        <el-descriptions-item label="证件类型">{{ detail.legal.certificateType }}</el-descriptions-item>
        <el-descriptions-item label="证件号码">{{ detail.legal.certificateNumber }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.legal.phone }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="detail-section">
      <div class="section-title">申请人信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请人">{{ detail.applicant.name }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detail.applicant.phone }}</el-descriptions-item>
        <el-descriptions-item label="个人身份证明" :span="2">
          <el-image
            v-for="(img, idx) in detail.applicant.idPhotos"
            :key="idx"
            :src="img"
            :preview-src-list="detail.applicant.idPhotos"
            class="license-image"
          >
            <template #error>
              <div class="image-placeholder">暂无图片</div>
            </template>
          </el-image>
        </el-descriptions-item>
        <el-descriptions-item label="授权文件" :span="2">
          <el-image
            v-for="(img, idx) in detail.applicant.authorizationFiles"
            :key="idx"
            :src="img"
            :preview-src-list="detail.applicant.authorizationFiles"
            class="license-image"
          >
            <template #error>
              <div class="image-placeholder">暂无图片</div>
            </template>
          </el-image>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="detail-section">
      <div class="section-title">贷款信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="贷款金额">{{ detail.loan.amount }}</el-descriptions-item>
        <el-descriptions-item label="贷款期限">{{ detail.loan.term }}</el-descriptions-item>
        <el-descriptions-item label="还款方式">{{ detail.loan.repaymentType }}</el-descriptions-item>
        <el-descriptions-item label="收款银行卡">{{ detail.loan.bankName }}</el-descriptions-item>
        <el-descriptions-item label="银行卡号">{{ detail.loan.bankCardNo }}</el-descriptions-item>
        <el-descriptions-item label="申请时间">{{ detail.loan.applyTime }}</el-descriptions-item>
      </el-descriptions>
      <div class="bank-card-preview">
        <div>银行卡号正反面：</div>
        <div class="bank-card-images">
          <div class="card-placeholder" v-for="idx in 2" :key="idx">预览</div>
        </div>
      </div>
      <div class="product-link">
        <el-button type="primary" plain size="large">查看产品详情</el-button>
      </div>
    </div>

    <div class="detail-section approval-section">
      <div class="section-title">审批信息</div>
      <el-alert
        title="审核通过时需填写放款日期、第一期还款日并上传合同；审批前需确认状态为待审核。"
        type="warning"
        show-icon
        :closable="false"
        class="tips"
      />
      <el-form label-width="100px" class="approval-form">
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

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue';

interface LoanApplicationDetail {
  supplierNo?: string;
  companyName?: string;
  reviewStatus?: string;
  creditCode?: string;
  registeredCapital?: string;
  registerDate?: string;
  registerAddress?: string;
  officeAddress?: string;
  qualification?: string;
  creditLevel?: string;
  businessScope?: string;
  licenses?: string[];
  legal?: {
    name?: string;
    certificateType?: string;
    certificateNumber?: string;
    phone?: string;
  };
  applicant?: {
    name?: string;
    phone?: string;
    idPhotos?: string[];
    authorizationFiles?: string[];
  };
  loan?: {
    amount?: string;
    term?: string;
    repaymentType?: string;
    bankName?: string;
    bankCardNo?: string;
    applyTime?: string;
  };
}

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const defaultDetail: LoanApplicationDetail = {
  supplierNo: 'GYS202509300001',
  companyName: '奔腾种业',
  reviewStatus: '审批通过',
  creditCode: 'B1440300C604861117',
  registeredCapital: '10000万',
  registerDate: '2025年9月30日',
  registerAddress: '浙江省·台州市·玉环市',
  officeAddress: '浙江省·台州市·玉环市',
  qualification: '一级认证',
  creditLevel: '优秀',
  businessScope: '农资销售、农技服务等。',
  licenses: ['https://via.placeholder.com/120x80.png?text=License'],
  legal: {
    name: '胡杰',
    certificateType: '身份证',
    certificateNumber: '04010419900311375X',
    phone: '17236832789'
  },
  applicant: {
    name: '张三',
    phone: '15629657691',
    idPhotos: ['https://via.placeholder.com/120x80.png?text=ID+1', 'https://via.placeholder.com/120x80.png?text=ID+2'],
    authorizationFiles: ['https://via.placeholder.com/120x80.png?text=Auth']
  },
  loan: {
    amount: '20 万元',
    term: '48 期',
    repaymentType: '等额本金',
    bankName: '招商银行',
    bankCardNo: '4555555515555555555',
    applyTime: '2025-11-07 12:30:00'
  }
};

const approvalForm = reactive({
  opinion: 'agree',
  loanDate: '',
  firstRepaymentDate: '',
  contractFiles: [] as any[]
});

const detail = computed(() => {
  const row = props.data || {};
  return {
    company: {
      ...defaultDetail,
      supplierNo: row.supplierNo || defaultDetail.supplierNo,
      companyName: row.companyName || defaultDetail.companyName,
      reviewStatus: row.reviewStatus || defaultDetail.reviewStatus,
      creditCode: row.creditCode || defaultDetail.creditCode,
      registeredCapital: row.registeredCapital || defaultDetail.registeredCapital,
      registerDate: row.registerDate || defaultDetail.registerDate,
      registerAddress: row.registerAddress || defaultDetail.registerAddress,
      officeAddress: row.officeAddress || defaultDetail.officeAddress,
      qualification: row.qualification || defaultDetail.qualification,
      creditLevel: row.creditLevel || defaultDetail.creditLevel,
      businessScope: row.businessScope || defaultDetail.businessScope,
      licenses: row.licenses || defaultDetail.licenses
    },
    legal: {
      ...defaultDetail.legal,
      ...(row.legal || {})
    },
    applicant: {
      ...defaultDetail.applicant,
      name: row.realName || defaultDetail.applicant?.name,
      phone: row.phone || defaultDetail.applicant?.phone
    },
    loan: {
      ...defaultDetail.loan,
      amount: row.loanAmount ? `${row.loanAmount}` : defaultDetail.loan?.amount,
      term: row.loanTerm ? `${row.loanTerm}` : defaultDetail.loan?.term,
      applyTime: row.applyTime || defaultDetail.loan?.applyTime
    }
  };
});

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
