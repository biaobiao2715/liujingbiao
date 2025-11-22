<template>
  <el-dialog :model-value="visible" width="900px" class="buyer-repayment-detail-dialog" append-to-body destroy-on-close
    :close-on-click-modal="false" @close="handleClose">
    <template #header>
      <div class="dialog-title">贷后管理详情（个人）</div>
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
              <el-image
                v-for="(img, idx) in detail.user.idPhotos"
                :key="idx"
                :src="img"
                :preview-src-list="detail.user.idPhotos"
                class="identity-image"
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
              <el-image
                v-for="(img, idx) in detail.loan.cardPhotos"
                :key="idx"
                :src="img"
                :preview-src-list="detail.loan.cardPhotos"
                class="identity-image"
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
      <div class="section-title">产品信息</div>
      <div class="product-link">
          <el-button type="primary" plain @click="handleViewProductDetail">查看产品信息</el-button>
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
      <el-button type="primary" @click="handleClose">返回</el-button>
    </template>
    <ProductDetailDialog v-model:visible="productDetailVisible" :product-id="currentDetail.productId" />
    <RepaymentPlanDialog v-model:visible="repaymentPlanVisible" :data="props.data" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import ProductDetailDialog from '../loanApplications/ProductDetailDialog.vue'
import RepaymentPlanDialog from './RepaymentPlanDialog.vue'

const props = defineProps<{
  visible: boolean
  data: Record<string, any> | null
}>()

const emit = defineEmits<{ (event: 'update:visible', payload: boolean): void }>()

const loading = ref(false)
const detailRow = ref<Record<string, any>>(props.data || {})
const currentDetail = computed(() => detailRow.value || {})
const productDetailVisible = ref(false)
const repaymentPlanVisible = ref(false)

const collectUrls = (...sources: any[]): string[] => {
  const urls: string[] = []
  const append = (item: any) => {
    if (!item) return
    if (Array.isArray(item)) {
      item.forEach(append)
      return
    }
    if (typeof item === 'string') {
      urls.push(item)
      return
    }
    if (typeof item === 'object') {
      const url = item.url || item.fileUrl || item.path || item.src
      if (url) urls.push(url)
    }
  }
  sources.forEach(append)
  return urls
}

const fetchDetail = async () => {
  if (!props.data?.id) {
    detailRow.value = props.data || {}
    return
  }
  loading.value = true
  try {
    // 这里应该调用真实的API获取详细信息
    // const res = await getRepaymentDetail(props.data.id)
    // detailRow.value = res.data
    detailRow.value = props.data || {}
  } catch (error) {
    console.error('获取贷后详情失败:', error)
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

const fallback = (value: any) => {
  if (value === undefined || value === null || value === '') return '--'
  return value
}

const detail = computed(() => {
  const row = detailRow.value || {}
  return {
    user: {
      name: fallback(row.realName || row.name),
      birthday: fallback(row.birthday),
      idNumber: fallback(row.idCardNumber),
      phone: fallback(row.contactPhone || row.phone),
      address: fallback(row.contactAddress || row.address),
      idPhotos: collectUrls(row.idFrontUrl, row.idBackUrl, row.idCardPhotoFront, row.idCardPhotoBack)
    },
    loan: {
      applyDate: fallback(row.createTime || row.applyTime),
      amount: fallback(row.loanAmount),
      period: fallback(row.loanTerm),
      repaymentType: fallback(row.repaymentMethod || row.repaymentType),
      bank: fallback(row.collectionBankCode || row.bankName),
      bankCardNo: fallback(row.bankAccountNumber || row.bankCardNo),
      cardPhotos: collectUrls(row.bankFrontUrl, row.bankBackUrl, row.bankCardPhotoFront, row.bankCardPhotoBack)
    }
  }
})

const handleClose = () => {
  emit('update:visible', false)
}

const handleViewProductDetail = () => {
  if (!currentDetail.value.productId) {
    ElMessage.warning('产品ID不存在')
    return
  }
  productDetailVisible.value = true
}

const handleViewContract = () => {
  ElMessage.info('查看合同详情功能待开发')
}

const handleViewRepaymentPlan = () => {
  repaymentPlanVisible.value = true
}
</script>

<style scoped lang="scss">
.buyer-repayment-detail-dialog {
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

.contract-section,
.repayment-section {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>
