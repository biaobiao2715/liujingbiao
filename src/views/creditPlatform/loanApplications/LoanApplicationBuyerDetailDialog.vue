<template>
  <el-dialog :model-value="visible" width="760px" class="buyer-detail-dialog" append-to-body destroy-on-close
    :close-on-click-modal="false" @close="handleClose">
    <template #header>
      <div class="dialog-title">{{ dialogTitle }}</div>
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
              />
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
              />
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
          <el-form-item label="审批意见" prop="opinion">
            <el-select v-model="approvalForm.opinion" :disabled="isApprovalReadonly">
              <el-option label="同意" value="agree" />
              <el-option label="不同意" value="reject" />
            </el-select>
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
              <div class="contract-upload-wrapper">
                <div class="contract-files" v-if="approvalForm.contractFiles.length">
                  <div
                    v-for="(file, idx) in approvalForm.contractFiles"
                    :key="file.url || idx"
                    class="contract-file-item"
                  >
                    <el-link
                      :href="file.url"
                      target="_blank"
                      type="primary"
                    >
                      {{ file.name || `合同文件${idx + 1}` }}
                    </el-link>
                    <el-icon
                      class="file-remove-icon"
                      @click="handleRemoveFile"
                      title="删除文件"
                    >
                      <Close />
                    </el-icon>
              </div>
                </div>
                <el-upload
                  v-if="!approvalForm.contractFiles.length"
                  class="contract-uploader inline-uploader"
                  :disabled="contractUploading || submittingApproval"
                  accept=".pdf,.doc,.docx"
                  :limit="1"
                  :file-list="approvalForm.contractFiles"
                  :http-request="handleContractUpload"
                  :on-remove="handleRemoveFile"
                  :show-file-list="false"
                >
                  <el-button type="primary" :loading="contractUploading" icon="Upload">
                    点击上传
                  </el-button>
                  <template #tip>
                    <div class="upload-tip">支持 Word/PDF 格式，单文件上传</div>
                  </template>
                </el-upload>
            </div>
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
      <el-button type="primary" @click="handleClose">返回</el-button>
    </template>
    <ProductDetailDialog v-model:visible="productDetailVisible" :product-id="currentDetail.productId" />
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, reactive, nextTick } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { Close } from '@element-plus/icons-vue'
import { getRemainingDetail, auditLoanApplication, uploadFile } from '@/api/creditPlatform/loanApplications'
import ProductDetailDialog from './ProductDetailDialog.vue'

const props = defineProps<{
  visible: boolean
  data: Record<string, any> | null
  mode?: 'detail' | 'approval'
}>()

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
  (event: 'refresh'): void;
}>()

const approvalFormRef = ref<FormInstance>()
const approvalForm = reactive({
  opinion: 'agree',
  rejectionReason: '',
  loanDate: '',
  firstRepaymentDate: '',
  contractId: '',
  contractFiles: [] as any[]
})
const submittingApproval = ref(false)
const contractUploading = ref(false)
const currentApprovalAction = ref<'agree' | 'reject' | null>(null)

const loading = ref(false)
const detailRow = ref<Record<string, any>>(props.data || {})
const currentDetail = computed(() => detailRow.value || {})
const productDetailVisible = ref(false)

const extractBirthdayFromId = (id: string | undefined | null) => {
  const value = (id || '').trim()
  if (!value) return ''
  if (/^\d{17}[\dXx]$/.test(value)) {
    const birth = value.substring(6, 14)
    const year = birth.substring(0, 4)
    const month = birth.substring(4, 6)
    const day = birth.substring(6, 8)
    return `${year}-${month}-${day}`
  }
  if (/^\d{15}$/.test(value)) {
    const birth = value.substring(6, 12)
    const year = `19${birth.substring(0, 2)}`
    const month = birth.substring(2, 4)
    const day = birth.substring(4, 6)
    return `${year}-${month}-${day}`
  }
  return ''
}

const repaymentMethodMap: Record<string, string> = {
  '0': '等额本息',
  '2': '等额本金',
  '3': '先息后本',
  '4': '先本后息'
}

const isLikelyUrl = (value: string) => {
  if (!value) return false
  const lower = value.toLowerCase()
  return lower.startsWith('http') || lower.startsWith('//') || lower.includes('/')
}

const collectUrls = (...sources: any[]): string[] => {
  const urls: string[] = []
  const append = (item: any) => {
    if (!item) return
    if (Array.isArray(item)) {
      item.forEach(append)
      return
    }
    if (typeof item === 'string') {
      const trimmed = item.trim()
      if (trimmed && isLikelyUrl(trimmed)) urls.push(trimmed)
      return
    }
    if (typeof item === 'object') {
      const url = (item.url || item.fileUrl || item.path || item.src || '').toString().trim()
      if (url && isLikelyUrl(url)) urls.push(url)
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
    let merged: Record<string, any> = props.data ? { ...props.data } : {}
    const res = await getRemainingDetail(props.data.id)
    if (res && res.code === 200 && res.data) {
      merged = { ...merged, ...res.data }
    }
    detailRow.value = merged
    if (props.mode === 'approval') {
      resetApprovalForm()
    } else {
      hydrateApprovalForm(merged)
    }
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

watch(
  () => props.visible,
  (val) => {
    if (val) {
      resetApprovalForm()
    }
  }
)

const fallback = (value: any) => {
  if (value === undefined || value === null || value === '') return '--'
  return value
}

const detail = computed(() => {
  const row = detailRow.value || {}
  const birthday = row.birthday || row.birthDate || extractBirthdayFromId(row.idCardNumber || row.idNumber)
  return {
    user: {
      name: fallback(row.realName || row.name),
      birthday: fallback(birthday),
      idNumber: fallback(row.idCardNumber),
      phone: fallback(row.contactPhone || row.phone),
      address: fallback(row.contactAddress || row.address),
      idPhotos: collectUrls(row.idFrontUrl, row.idBackUrl, row.idCardPhotoFront, row.idCardPhotoBack)
    },
    loan: {
      applyDate: fallback(row.createTime || row.applyTime),
      amount: fallback(row.loanAmount),
      period: fallback(row.loanTerm),
      repaymentType: fallback(
        repaymentMethodMap[String(row.repaymentMethod || row.repaymentType)] || row.repaymentType
      ),
      bank: fallback(row.collectionBankCode || row.bankName),
      bankCardNo: fallback(row.bankAccountNumber || row.bankCardNo),
      cardPhotos: collectUrls(row.bankFrontUrl, row.bankBackUrl, row.bankCardPhotoFront, row.bankCardPhotoBack)
    },
    approval: {
      opinion: fallback(row.reviewNotes || row.rejectionReason),
      loanDate: fallback(row.loanDate),
      firstRepaymentDate: fallback(row.firstRepaymentDate),
      contractFiles: collectUrls(row.contractFiles, row.contractUrl)
    }
  }
})

const applyStatusMap: Record<string, string> = {
  '0': '待审核',
  '1': '待审核',
  '2': '审批通过',
  '3': '审批驳回',
  '99': '审批异常'
}

const approvalRules: FormRules = {
  opinion: [{ required: true, message: '请选择审批意见', trigger: 'change' }]
}

const isApprovalMode = computed(() => props.mode === 'approval')
const isApprovalReadonly = computed(() => !isApprovalMode.value)
const isApproveAgree = computed(() => approvalForm.opinion === 'agree')
const isPendingStatus = computed(() => {
  const status = detailRow.value?.applyStatus
  if (status === undefined || status === null || status === '') return false
  const label = applyStatusMap[String(status)] || detailRow.value?.applyStatusName || detailRow.value?.applyStatusLabel || ''
  return String(label).includes('待审')
})
const hasCompletedResult = computed(() => {
  const status = detailRow.value?.applyStatus
  return status === '2' || status === '3'
})
const showApprovalTip = computed(() => !isApprovalMode.value && isPendingStatus.value && !hasCompletedResult.value)
const approvalTipMessage = computed(() => {
  return '当前申请状态为待审核，请前往审批流程处理。'
})
const showApprovalForm = computed(() => 
  (isApprovalMode.value && !hasCompletedResult.value) || 
  (!isApprovalMode.value && hasCompletedResult.value)
)

const dialogTitle = computed(() => {
  return props.mode === 'approval' ? '个人贷款申请审核' : '贷款申请详情（采购商）'
})

const normalizeContractFiles = (row: Record<string, any>) => {
  const baseName = row.contractFileName || '合同文件'
  const files = collectUrls(row.contractFiles, row.contractFileUrl, row.contractUrl)
  if (!files.length) return []
  return files.map((url: string, index: number) => ({
    name: files.length === 1 ? baseName : `${baseName}${index + 1}`,
    url,
    id: row.contractId || ''
  }))
}

const hydrateApprovalForm = (row: Record<string, any>) => {
  approvalForm.rejectionReason = row.rejectionReason || ''
  approvalForm.loanDate = row.loanDate || ''
  approvalForm.firstRepaymentDate = row.firstRepaymentDate || ''
  approvalForm.contractId = row.contractId || ''
  if (row.applyStatus === '3') {
    approvalForm.opinion = 'reject'
  } else if (row.applyStatus === '2') {
    approvalForm.opinion = 'agree'
  }
  approvalForm.contractFiles = normalizeContractFiles(row)
}

const resetApprovalForm = () => {
  approvalForm.opinion = 'agree'
  approvalForm.rejectionReason = ''
  approvalForm.loanDate = ''
  approvalForm.firstRepaymentDate = ''
  approvalForm.contractId = ''
  approvalForm.contractFiles = []
  currentApprovalAction.value = null
  nextTick(() => {
    approvalFormRef.value?.clearValidate()
  })
}

const handleContractUpload = async (options: any) => {
  if (isApprovalReadonly.value) {
    options?.onError?.(new Error('仅可查看'))
    return
  }
  const formData = new FormData()
  formData.append('file', options.file)
  contractUploading.value = true
  try {
    const res = await uploadFile(formData)
    if (res && res.code === 200 && res.data) {
      const resData = res.data
      const fileInfo = {
        name: resData.fileName || resData.originalFilename || options.file.name,
        url: resData.url || resData.fileUrl || resData.path,
        id: resData.contractId || resData.ossId || resData.id || resData.fileId || '',
        ossId: resData.ossId
      }
      if (!fileInfo.url) {
        throw new Error('上传返回结果缺少文件地址')
      }
      approvalForm.contractFiles = [fileInfo]
      approvalForm.contractId = String(fileInfo.ossId || fileInfo.id || '')
      approvalFormRef.value?.validateField?.('contractId')
      options.onSuccess?.(res, options.file)
      ElMessage.success('合同上传成功')
    } else {
      throw new Error(res?.msg || '合同上传失败')
    }
  } catch (error: any) {
    options.onError?.(error)
    ElMessage.error(error?.message || '合同上传失败')
  } finally {
    contractUploading.value = false
  }
}

const handleRemoveFile = () => {
  if (isApprovalReadonly.value) return
  approvalForm.contractFiles = []
  approvalForm.contractId = ''
  approvalFormRef.value?.validateField?.('contractId')
}

const handleSubmitApproval = async (action: 'agree' | 'reject') => {
  currentApprovalAction.value = action
  approvalForm.opinion = action
  await nextTick()
  try {
    await approvalFormRef.value?.validate()
  } catch (error) {
    currentApprovalAction.value = null
    return
  }
  if (!detailRow.value?.id && !props.data?.id) {
    ElMessage.error('缺少申请ID，无法提交审批')
    currentApprovalAction.value = null
    return
  }
  submittingApproval.value = true
  try {
    const payload = {
      ...detailRow.value,
      id: detailRow.value?.id || props.data?.id,
      applyStatus: action === 'agree' ? '2' : '3',
      rejectionReason: approvalForm.rejectionReason,
      loanDate: approvalForm.loanDate,
      firstRepaymentDate: approvalForm.firstRepaymentDate,
      contractId: approvalForm.contractId
    }
    const res = await auditLoanApplication(payload)
    if (res && res.code === 200) {
      ElMessage.success(action === 'agree' ? '审批通过成功' : '审批驳回成功')
      emit('refresh')
      emit('update:visible', false)
    } else {
      throw new Error(res?.msg || '审批提交失败')
    }
  } catch (error: any) {
    ElMessage.error(error?.message || '审批提交失败')
  } finally {
    submittingApproval.value = false
    currentApprovalAction.value = null
  }
}

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
</script>

<style scoped lang="scss">
.no-wrap-label {
  :deep(.el-form-item__label) {
    white-space: nowrap;
  }
}

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
  .tips {
    margin-bottom: 16px;
  }
}

.approval-actions {
  margin-top: 32px;
  display: flex;
  justify-content: center;
  gap: 12px;
}

.contract-files,
.contract-field .contract-files {
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

.contract-field {
  :deep(.el-form-item__content) {
    width: 100%;
  }

  .contract-upload-wrapper {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .contract-files {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .contract-file-item {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
    width: fit-content;

    &:hover {
      background-color: #f5f7fa;

      .file-remove-icon {
        opacity: 1;
      }
    }
  }

  .file-remove-icon {
    position: absolute;
    top: -6px;
    right: -6px;
    font-size: 16px;
    color: #f56c6c;
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
    background: white;
    border-radius: 50%;
    padding: 2px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    &:hover {
      color: #f23030;
    }
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
</style>


