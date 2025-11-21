<template>
  <el-dialog :model-value="visible" width="1300px" class="repayment-plan-dialog" append-to-body destroy-on-close
    :close-on-click-modal="false" @close="handleClose">
    <template #header>
      <div class="dialog-title">还款计划</div>
    </template>

    <div class="top-actions">
      <div class="buttons">
        <el-button type="primary">提交修改信息</el-button>
        <el-button>返回</el-button>
      </div>
      <div class="contract-upload">
        <div class="upload-row">
          <div class="label">贷款合同：</div>
          <div class="upload-inline">
            <div class="file-preview" v-if="contractFiles.length" @click="previewFile">
              <div class="file-icon">
                <el-icon><i-ep-document /></el-icon>
              </div>
              <div class="file-name">{{ contractFiles[0].displayName || contractFiles[0].name }}</div>
            </div>
            <el-upload :auto-upload="false" action="#" :file-list="contractFiles" list-type="text"
              :show-file-list="false" :on-change="handleContractChange" :on-remove="handleContractRemove">
              <el-button type="primary" plain icon="UploadFilled">点击上传</el-button>
            </el-upload>
          </div>
        </div>
        <div class="tips-card">
          贷款合同可重复上传，还款计划的期数、日期需生成的，请仔细校验，允许修改，还款金额需为整数。
        </div>
      </div>
    </div>

    <div class="plan-grid">
      <div class="plan-card" v-for="item in plans" :key="item.period">
        <div class="card-content">
          <el-form label-width="70px" class="plan-form">
            <el-form-item label="期数：">
              <el-input v-model="item.period" disabled />
            </el-form-item>
            <el-form-item label="还款日期：">
              <el-date-picker v-model="item.repayDate" type="date" format="YYYY-MM-DD" value-format="YYYY-MM-DD" />
            </el-form-item>
            <el-form-item label="还款金额：">
              <div class="amount-input">
                <el-input 
                  :model-value="item.amount"
                  type="number"
                  :min="0"
                  :step="1"
                  @input="handleAmountInput(item, $event)"
                  @blur="handleAmountBlur(item)"
                />
                <span class="unit">元</span>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" plain @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps<{
  visible: boolean
  data: {
    plans: Array<{ period: number; repayDate: string; amount: number }>
    contractFiles?: string[]
  } | null
}>()

const emit = defineEmits<{ (event: 'update:visible', payload: boolean): void }>()

const plans = computed(() => props.data?.plans || [])

const contractFiles = ref<any[]>([])
const objectUrls = new Map<string, string>()

// 处理还款金额输入，确保为整数
const handleAmountInput = (item: any, event: any) => {
  const value = event?.target?.value ?? event
  // 将输入值转换为整数
  const intValue = Math.floor(Number(value) || 0)
  // 确保不为负数
  item.amount = Math.max(0, intValue)
}

// 处理失焦事件，确保最终值为整数
const handleAmountBlur = (item: any) => {
  item.amount = Math.floor(Number(item.amount) || 0)
}

const normalizeFiles = (files: Array<any> = []) =>
  files.map((item, index) => {
    if (typeof item === 'string') {
      return { name: item, displayName: item, url: item, uid: `preset-${index}` }
    }
    if (!item.url && item.raw) {
      const url = URL.createObjectURL(item.raw)
      objectUrls.set(item.uid, url)
      item.url = url
    }
    if (!item.displayName) {
      item.displayName = item.name || `文件${index + 1}`
    }
    return item
  })

watch(
  () => props.data?.contractFiles,
  (files) => {
    contractFiles.value = normalizeFiles(files)
  },
  { immediate: true }
)

const handleContractChange = (_file: any, fileList: any[]) => {
  contractFiles.value = normalizeFiles(fileList)
}

const handleContractRemove = (file: any, fileList: any[]) => {
  if (objectUrls.has(file.uid)) {
    URL.revokeObjectURL(objectUrls.get(file.uid)!)
    objectUrls.delete(file.uid)
  }
  contractFiles.value = normalizeFiles(fileList)
}

const previewFile = () => {
  if (contractFiles.value.length) {
    const file = contractFiles.value[0]
    if (file.url) {
      window.open(file.url, '_blank')
    }
  }
}

const handleClose = () => {
  emit('update:visible', false)
}

onBeforeUnmount(() => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url))
  objectUrls.clear()
})
</script>

<style scoped lang="scss">
.repayment-plan-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.top-actions {
  margin-bottom: 20px;

  .buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }

  .contract-upload {
    display: flex;
    flex-direction: column;
    gap: 10px;

    .upload-row {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .label {
      font-weight: 600;
      color: #303133;
    }

    .upload-inline {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      color: #409eff;

      .file-icon {
        width: 48px;
        height: 48px;
        border: 1px solid #dcdfe6;
        border-radius: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;

        .el-icon {
          font-size: 24px;
        }
      }
    }

    .file-name {
      max-width: 160px;
      color: #606266;
      font-size: 13px;
      word-break: break-all;
    }

    .tips-card {
      background: #fff6d9;
      border: 1px solid #fbd786;
      border-radius: 4px;
      padding: 10px 12px;
      color: #735c0f;
      font-size: 13px;
      min-width: 240px;
    }
  }
}

  .plan-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .plan-card {
    border: 1px solid #dcdfe6;
    border-radius: 6px;
    background: #fff;
    padding: 16px 30px;
    flex: 1 1 calc((100% - 32px) / 3);
    min-width: 320px;

  .plan-form {
    :deep(.el-form-item) {
      margin-bottom: 12px;
    }

    :deep(.el-input__wrapper) {
      width: 100%;
    }

    :deep(.el-form-item__label) {
      white-space: nowrap;
    }
  }

  .amount-input {
    display: flex;
    align-items: center;
    gap: 4px;

    .unit {
      color: #909399;
    }
  }
}

.dialog-footer {
  text-align: center;
}
</style>

