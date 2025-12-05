<template>
  <el-dialog :model-value="visible" width="50%" class="product-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">产品详情</div>
    </template>
    <div v-loading="loading" class="product-detail-content">
      <div class="section-title">基本信息</div>

      <div class="info-grid">
        <div class="info-item">
          <span class="label">产品名称：</span>
          <span class="value">{{ productDetail.productName || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="label">产品类型：</span>
          <span class="value">
            <dict-tag :options="prodCreditOptions" :value="productDetail.productType" />
          </span>
        </div>
        <div class="info-item">
          <span class="label">适用对象：</span>
          <span class="value">
            <dict-tag :options="applicableObjectOptions" :value="applicableObjectValue" />
          </span>
        </div>
        <div class="info-item range">
          <span class="label">可贷金额：</span>
          <span class="value">
            <template
              v-if="
                productDetail.minLoanAmount !== null &&
                productDetail.minLoanAmount !== undefined &&
                productDetail.maxLoanAmount !== null &&
                productDetail.maxLoanAmount !== undefined
              "
            >
              <template v-if="productDetail.minLoanAmount === productDetail.maxLoanAmount">
                {{ productDetail.minLoanAmount }} 万元
              </template>
              <template v-else>
                {{ productDetail.minLoanAmount }} 万元 — {{ productDetail.maxLoanAmount }} 万元
              </template>
            </template>
            <template v-else>--</template>
          </span>
        </div>
        <div class="info-item range">
          <span class="label">利率/费率：</span>
          <span class="value">{{ interestRateRangeText }}</span>
        </div>
        <div class="info-item">
          <span class="label">可贷周期：</span>
          <span class="value">
            <dict-tag :options="loanCycleOptions" :value="loanCycleValue" />
          </span>
        </div>
        <div class="info-item repayment-method-item">
          <span class="label">还款方式：</span>
          <span class="value">
            <dict-tag :options="repaymentMethodOptions" :value="repaymentMethodValue" />
          </span>
        </div>
      </div>

      <div class="info-block">
        <span class="label">产品简介：</span>
        <el-input
          :model-value="productDetail.productIntro || ''"
          type="textarea"
          class="readonly-textarea"
          :autosize="{ minRows: 3 }"
          readonly
          placeholder="暂无产品简介"
        />
      </div>

      <div class="info-block" v-if="productDetail.productAdvantages">
        <span class="label">产品优势：</span>
        <div class="rich-text-content" v-html="productDetail.productAdvantages"></div>
      </div>

      <div class="info-block" v-if="productDetail.applicableInstructions">
        <span class="label">适用说明：</span>
        <div class="rich-text-content" v-html="productDetail.applicableInstructions"></div>
      </div>

      <div class="info-block" v-if="productDetail.applicationInstructions">
        <span class="label">申请条件：</span>
        <div class="rich-text-content" v-html="productDetail.applicationInstructions"></div>
      </div>

      <div class="info-block" v-if="cooperationFileList.length > 0">
        <span class="label">合作机构：</span>
        <div class="attachment-content">
          <el-upload
            class="upload-display"
            :file-list="cooperationFileList"
            :disabled="true"
            list-type="text"
          />
        </div>
      </div>

      <div class="info-block" v-if="productDetail.productRemark">
        <span class="label">产品备注：</span>
        <el-input
          :model-value="productDetail.productRemark"
          type="textarea"
          class="readonly-textarea"
          :autosize="{ minRows: 3 }"
          readonly
          placeholder="暂无产品备注"
        />
      </div>

      <div class="footer-actions">
        <el-button @click="handleClose">返回</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import type { UploadFile } from 'element-plus';
import { ElMessage } from 'element-plus';
import { getProduct } from '@/api/creditPlatform/loanApplications';

const props = defineProps<{
  visible: boolean;
  productId?: string | number | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_credit_type, applicable_object, repayment_method, loan_cycle } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'repayment_method', 'loan_cycle')
);

const loading = ref(false);
const productDetail = ref<any>({});

const formatDictValue = (value: unknown) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const arr = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
    return arr.length ? arr : undefined;
  }
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  return [value];
};

const prodCreditOptions = computed(() => prod_credit_type?.value ?? []);
const applicableObjectOptions = computed(() => applicable_object?.value ?? []);
const loanCycleOptions = computed(() => loan_cycle?.value ?? []);
const repaymentMethodOptions = computed(() => repayment_method?.value ?? []);

const interestRateRangeText = computed(() => {
  const { baseInterestRate, floatInterestRate } = productDetail.value;
  if (baseInterestRate === null || baseInterestRate === undefined || floatInterestRate === null || floatInterestRate === undefined) {
    return '--';
  }
  if (Number(baseInterestRate) === Number(floatInterestRate)) {
    return `${baseInterestRate}%`;
  }
  return `${baseInterestRate}% - ${floatInterestRate}%`;
});

const applicableObjectValue = computed(() => formatDictValue(productDetail.value.applicableObject));
const loanCycleValue = computed(() => formatDictValue(productDetail.value.loanCycle));
const repaymentMethodValue = computed(() => formatDictValue(productDetail.value.repaymentMethod));

const cooperationFileList = computed<UploadFile[]>(() => {
  if (productDetail.value.ossFileVo && Array.isArray(productDetail.value.ossFileVo) && productDetail.value.ossFileVo.length > 0) {
    return productDetail.value.ossFileVo.map((file: any) => ({
      uid: file.ossId?.toString() || Date.now().toString(),
      name: file.fileName || file.name || '附件',
      url: file.url || file.fileUrl || '',
      status: 'success'
    }));
  }
  if (productDetail.value.cooperationAttachment && productDetail.value.cooperationAttachmentUrl) {
    return [
      {
        uid: productDetail.value.cooperationAttachment.toString(),
        name: productDetail.value.cooperationAttachmentName || '合作机构名单.pdf',
        url: productDetail.value.cooperationAttachmentUrl,
        status: 'success'
      }
    ];
  }
  return [];
});

const fetchProductDetail = async () => {
  if (!props.productId) {
    productDetail.value = {};
    return;
  }
  loading.value = true;
  try {
    const res = await getProduct(props.productId);
    if (res && res.code === 200 && res.data) {
      productDetail.value = res.data;
    } else {
      ElMessage.error(res?.msg || '获取产品详情失败');
      productDetail.value = {};
    }
  } catch (error) {
    console.error('获取产品详情失败:', error);
    ElMessage.error('获取产品详情失败，请稍后重试');
    productDetail.value = {};
  } finally {
    loading.value = false;
  }
};

watch([() => props.visible, () => props.productId], ([visible, productId], [prevVisible, prevProductId]) => {
  if (visible && (!prevVisible || productId !== prevProductId)) {
    fetchProductDetail();
  }
});

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.product-detail-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }
}

.product-detail-content {
  padding: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 4px solid #409eff;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 16px 24px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #303133;

  .label {
    min-width: 100px;
    color: #606266;
    text-align: right;
    padding-right: 8px;
    flex-shrink: 0;
  }

  .value {
    flex: 1;
    color: #303133;
    word-break: break-word;
  }

  &.range {
    grid-column: span 2;
  }

  &.repayment-method-item {
    align-items: flex-start;

    .value {
      :deep(> div) {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: flex-start;
        align-content: flex-start;
        justify-content: flex-start;
        width: 100%;
      }

      :deep(.el-tag) {
        margin: 0 !important;
        margin-left: 0 !important;
        flex-shrink: 0;
      }

      :deep(.el-tag + .el-tag) {
        margin-left: 0 !important;
      }
    }
  }
}

.info-block {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 24px;

  .label {
    min-width: 100px;
    color: #606266;
    text-align: right;
    line-height: 32px;
    flex-shrink: 0;
  }

  .readonly-textarea {
    flex: 1;
    max-width: 800px;

    :deep(.el-textarea__inner) {
      background-color: #f5f7fa;
      border-radius: 6px;
      border: 1px solid #dcdfe6;
      color: #303133;
      cursor: default;
      resize: none;
    }
  }

  .rich-text-content {
    flex: 1;
    padding: 16px;
    background-color: #f5f7fa;
    border-radius: 6px;
    border: 1px solid #dcdfe6;
    color: #303133;
    line-height: 1.8;
    min-height: 100px;
    word-break: break-word;

    :deep(img) {
      max-width: 100%;
      height: auto;
    }

    :deep(p) {
      margin: 8px 0;
    }

    :deep(ul),
    :deep(ol) {
      margin: 8px 0;
      padding-left: 24px;
    }

    :deep(li) {
      margin: 4px 0;
    }

    &.empty-content {
      color: #909399;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      font-style: italic;
    }
  }

  .attachment-content {
    flex: 1;
    max-width: 800px;

    .upload-display {
      :deep(.el-upload) {
        display: none;
      }

      :deep(.el-upload-list) {
        margin-top: 0;
      }

      :deep(.el-upload-list__item) {
        margin-top: 8px;
      }

      :deep(.el-upload-list__item-delete) {
        display: none !important;
      }
    }

    &.empty-text {
      color: #909399;
      font-size: 14px;
      line-height: 32px;
    }
  }
}

.footer-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
}

@media (max-width: 920px) {
  .info-grid {
    grid-template-columns: 1fr;
  }

  .info-item.range {
    grid-column: span 1;
  }

  .info-block {
    flex-direction: column;
    align-items: stretch;

    .label {
      text-align: left;
      padding-right: 0;
      margin-bottom: 8px;
    }

    .readonly-textarea,
    .rich-text-content,
    .attachment-content {
      max-width: 100%;
    }
  }
}
</style>
