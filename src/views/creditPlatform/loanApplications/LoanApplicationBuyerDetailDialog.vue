<template>
  <el-dialog :model-value="visible" width="760px" class="buyer-detail-dialog" append-to-body destroy-on-close
    :close-on-click-modal="false" @close="handleClose">
    <template #header>
      <div class="dialog-title">贷款申请详情（采购商）</div>
    </template>

    <div class="detail-section">
      <div class="section-title">用户信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ detail.user.name }}</el-descriptions-item>
        <el-descriptions-item label="出生年月">{{ detail.user.birthday }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail.user.idNumber }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.user.phone }}</el-descriptions-item>
        <el-descriptions-item label="联系地址" :span="2">{{ detail.user.address }}</el-descriptions-item>
        <el-descriptions-item label="身份证正反面" :span="2">
          <el-image v-for="(img, idx) in detail.user.idPhotos" :key="idx" :src="img"
            :preview-src-list="detail.user.idPhotos" class="identity-image">
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
        <el-descriptions-item label="申请日期">{{ detail.loan.applyDate }}</el-descriptions-item>
        <el-descriptions-item label="贷款金额">{{ detail.loan.amount }}</el-descriptions-item>
        <el-descriptions-item label="还款周期">{{ detail.loan.period }}</el-descriptions-item>
        <el-descriptions-item label="还款方式">{{ detail.loan.repaymentType }}</el-descriptions-item>
        <el-descriptions-item label="收款卡银行">{{ detail.loan.bank }}</el-descriptions-item>
        <el-descriptions-item label="银行卡号">{{ detail.loan.bankCardNo }}</el-descriptions-item>
        <el-descriptions-item label="银行卡正反面" :span="2">
          <el-image v-for="(img, idx) in detail.loan.cardPhotos" :key="idx" :src="img"
            :preview-src-list="detail.loan.cardPhotos" class="identity-image">
            <template #error>
              <div class="image-placeholder">暂无图片</div>
            </template>
          </el-image>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <div class="detail-section">
      <div class="section-title">产品信息</div>
      <div class="product-link">
        <el-button type="primary" plain>查看产品信息</el-button>
      </div>
    </div>

    <div class="detail-section approval-section">
      <div class="section-title">审批信息</div>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="审批意见">{{ detail.approval.opinion }}</el-descriptions-item>
        <el-descriptions-item label="放款日期">{{ detail.approval.loanDate }}</el-descriptions-item>
        <el-descriptions-item label="第一期还款日">{{ detail.approval.firstRepaymentDate }}</el-descriptions-item>
        <el-descriptions-item label="贷款合同">
          <div class="contract-files">
            <div class="contract-file" v-for="(file, idx) in detail.approval.contractFiles" :key="idx">
              <el-icon><i-ep-document /></el-icon>
              <span>{{ file }}</span>
            </div>
          </div>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">返回</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  visible: boolean
  data: Record<string, any> | null
}>()

const emit = defineEmits<{ (event: 'update:visible', payload: boolean): void }>()

const fallbackImages = [
  'https://via.placeholder.com/120x80.png?text=Image+1',
  'https://via.placeholder.com/120x80.png?text=Image+2'
]

const detail = computed(() => {
  const row = props.data || {}
  return {
    user: {
      name: row.realName || '张三',
      birthday: row.birthday || '1995-04-01',
      idNumber: row.idNumber || '41152419940125619',
      phone: row.phone || '13429113218',
      address: row.address || '测试联系地址',
      idPhotos: row.idPhotos || fallbackImages
    },
    loan: {
      applyDate: row.applyTime || '2025-11-06',
      amount: row.loanAmount || '5万',
      period: row.loanTerm || '12',
      repaymentType: row.repaymentType || '等额本息',
      bank: row.bankName || '招商银行',
      bankCardNo: row.bankCardNo || '5252252565651555',
      cardPhotos: row.cardPhotos || fallbackImages
    },
    approval: {
      opinion: row.approvalOpinion || '同意',
      loanDate: row.loanDate || '2025-11-07',
      firstRepaymentDate: row.firstRepaymentDate || '2025-12-07',
      contractFiles: row.contractFiles || ['贷款合同.pdf']
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}
</script>

<style scoped lang="scss">
.buyer-detail-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.detail-section {
  margin-bottom: 20px;
  background: #fefefe;
  border-radius: 8px;
  border: 1px solid #f0f2f5;
  padding: 16px 20px;
  box-shadow: 0 2px 10px rgba(31, 45, 61, 0.06);
}

.section-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  color: #303133;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background-color: #409eff;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.identity-image {
  width: 92px;
  height: 64px;
  border-radius: 4px;
  margin-right: 8px;
  border: 1px solid #ebeef5;
}

.image-placeholder {
  width: 92px;
  height: 64px;
  border: 1px dashed #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  font-size: 12px;
  background: #fff;
}

.product-link {
  display: flex;
  justify-content: center;
}

.approval-section {
  :deep(.el-descriptions__body) {
    background: #fafbfc;
  }
}

.contract-files {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .contract-file {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #409eff;
    font-size: 13px;

    span {
      color: #606266;
    }
  }
}
</style>

