<template>
  <el-dialog :model-value="visible" width="760px" class="buyer-detail-dialog" append-to-body destroy-on-close
    :close-on-click-modal="false" @close="handleClose">
    <template #header>
      <div class="dialog-title">贷款申请详情（采购商）</div>
    </template>
    <div v-loading="loading">

    <div class="detail-section">
      <div class="section-title">用户信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="姓名">{{ detail.user.name }}</el-descriptions-item>
        <el-descriptions-item label="出生年月">{{ detail.user.birthday }}</el-descriptions-item>
        <el-descriptions-item label="身份证号">{{ detail.user.idNumber }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ detail.user.phone }}</el-descriptions-item>
        <el-descriptions-item label="联系地址" :span="2">{{ detail.user.address }}</el-descriptions-item>
        <el-descriptions-item label="身份证正反面" :span="2">
          <template v-if="detail.user.idPhotos.length">
            <el-image v-for="(img, idx) in detail.user.idPhotos" :key="idx" :src="img"
              :preview-src-list="detail.user.idPhotos" class="identity-image">
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
      <div class="section-title">贷款信息</div>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="申请日期">{{ detail.loan.applyDate }}</el-descriptions-item>
        <el-descriptions-item label="贷款金额">{{ detail.loan.amount }}</el-descriptions-item>
        <el-descriptions-item label="还款周期">{{ detail.loan.period }}</el-descriptions-item>
        <el-descriptions-item label="还款方式">{{ detail.loan.repaymentType }}</el-descriptions-item>
        <el-descriptions-item label="收款卡银行">{{ detail.loan.bank }}</el-descriptions-item>
        <el-descriptions-item label="银行卡号">{{ detail.loan.bankCardNo }}</el-descriptions-item>
        <el-descriptions-item label="银行卡正反面" :span="2">
          <template v-if="detail.loan.cardPhotos.length">
            <el-image v-for="(img, idx) in detail.loan.cardPhotos" :key="idx" :src="img"
              :preview-src-list="detail.loan.cardPhotos" class="identity-image">
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
          <template v-if="detail.approval.contractFiles.length">
            <div class="contract-files">
              <div class="contract-file" v-for="(file, idx) in detail.approval.contractFiles" :key="idx">
                <el-icon><i-ep-document /></el-icon>
                <span>{{ file }}</span>
              </div>
            </div>
          </template>
          <span v-else>--</span>
        </el-descriptions-item>
      </el-descriptions>
    </div>

    </div>
    <template #footer>
      <el-button type="primary" @click="handleClose">返回</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { getRemainingDetail, getPersonal } from '@/api/creditPlatform/loanApplications'

const props = defineProps<{
  visible: boolean
  data: Record<string, any> | null
}>()

const emit = defineEmits<{ (event: 'update:visible', payload: boolean): void }>()

const loading = ref(false)
const detailRow = ref<Record<string, any>>(props.data || {})

const fetchDetail = async () => {
  if (!props.data?.id) {
    detailRow.value = props.data || {}
    return
  }
  loading.value = true
  try {
    let merged: Record<string, any> = props.data ? { ...props.data } : {}
    const res = await getRemainingDetail(props.data.id)
    if (res && res.code === 200 && res.data) {
      merged = { ...merged, ...res.data }
    }
    const userId = merged.lenderId || merged.userId
    if (userId) {
      try {
        const extra = await getPersonal({ id: userId })
        if (extra && extra.code === 200 && extra.data) {
          merged = { ...merged, ...extra.data }
        }
      } catch (error) {
        console.error('获取个人信息失败:', error)
      }
    }
    detailRow.value = merged
  } catch (error) {
    console.error('获取申请详情失败:', error)
    detailRow.value = props.data || {}
  } finally {
    loading.value = false
  }
}

watch(
  [() => props.visible, () => props.data?.id],
  ([visible, id], [prevVisible, prevId]) => {
    if (visible && (!prevVisible || id !== prevId)) {
      fetchDetail()
    }
  }
)

const detail = computed(() => {
  const row = detailRow.value || {}
  return {
    user: {
      name: row.name || row.realName || '--',
      birthday: row.birthday || '--',
      idNumber: row.idNumber || '--',
      phone: row.phoneNumber || row.phone || '--',
      address: row.address || '--',
      idPhotos: Array.isArray(row.idPhotos) ? row.idPhotos : []
    },
    loan: {
      applyDate: row.applyTime || '--',
      amount: row.loanAmount || '--',
      period: row.loanTerm || '--',
      repaymentType: row.repaymentType || '--',
      bank: row.bankName || '--',
      bankCardNo: row.bankCardNo || '--',
      cardPhotos: Array.isArray(row.cardPhotos) ? row.cardPhotos : []
    },
    approval: {
      opinion: row.approvalOpinion || '--',
      loanDate: row.loanDate || '--',
      firstRepaymentDate: row.firstRepaymentDate || '--',
      contractFiles: Array.isArray(row.contractFiles) ? row.contractFiles : []
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

