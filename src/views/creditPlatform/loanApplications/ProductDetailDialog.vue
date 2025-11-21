<template>
  <el-dialog :model-value="visible" width="900px" class="product-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">产品详情</div>
    </template>
    <div v-loading="loading" class="product-detail-content">
      <div class="section-title">基础信息</div>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">产品名称：</span>
          <span class="value">{{ productDetail.productName || '--' }}</span>
        </div>
        <div class="info-item">
          <span class="label">产品类型：</span>
          <span class="value">
            <dict-tag :options="prod_credit_type" :value="productDetail.productType" />
          </span>
        </div>
        <div class="info-item">
          <span class="label">适用对象：</span>
          <span class="value">
            <dict-tag :options="applicable_object" :value="typeof productDetail.applicableObject === 'string' ? productDetail.applicableObject.split(',') : productDetail.applicableObject" />
          </span>
        </div>
        <div class="info-item range">
          <span class="label">可贷金额：</span>
          <span class="value">
            <template v-if="productDetail.minLoanAmount !== null && productDetail.minLoanAmount !== undefined && productDetail.maxLoanAmount !== null && productDetail.maxLoanAmount !== undefined">
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
          <span class="value">
            <template v-if="productDetail.baseInterestRate !== null && productDetail.baseInterestRate !== undefined && productDetail.floatInterestRate !== null && productDetail.floatInterestRate !== undefined">
              <template v-if="productDetail.baseInterestRate === productDetail.floatInterestRate">
                {{ productDetail.baseInterestRate }}%
              </template>
              <template v-else>
                {{ productDetail.baseInterestRate }}% — {{ productDetail.floatInterestRate }}%
              </template>
            </template>
            <template v-else>--</template>
          </span>
        </div>
        <div class="info-item">
          <span class="label">可贷周期：</span>
          <span class="value">
            <dict-tag :options="loan_cycle" :value="typeof productDetail.loanCycle === 'string' ? productDetail.loanCycle.split(',') : productDetail.loanCycle" />
          </span>
        </div>
        <div class="info-item">
          <span class="label">还款方式：</span>
          <span class="value">
            <dict-tag :options="repayment_method" :value="typeof productDetail.repaymentMethod === 'string' ? productDetail.repaymentMethod.split(',') : productDetail.repaymentMethod" />
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

      <div class="info-block">
        <span class="label">产品优势：</span>
        <div v-if="productDetail.productAdvantages" class="rich-text-content" v-html="productDetail.productAdvantages"></div>
        <div v-else class="rich-text-content empty-content">暂无内容</div>
      </div>

      <div class="info-block">
        <span class="label">适用说明：</span>
        <div v-if="productDetail.applicableInstructions" class="rich-text-content" v-html="productDetail.applicableInstructions"></div>
        <div v-else class="rich-text-content empty-content">暂无内容</div>
      </div>

      <div class="info-block">
        <span class="label">申请条件：</span>
        <div v-if="productDetail.applicationInstructions" class="rich-text-content" v-html="productDetail.applicationInstructions"></div>
        <div v-else class="rich-text-content empty-content">暂无内容</div>
      </div>

      <div class="info-block">
        <span class="label">合作机构：</span>
        <div class="attachment-content">
          <template v-if="cooperationFileList.length > 0">
            <el-link
              v-for="(file, idx) in cooperationFileList"
              :key="file.uid || idx"
              :href="file.url"
              target="_blank"
              type="primary"
              class="file-link"
            >
              {{ file.name }}
            </el-link>
          </template>
          <span v-else class="empty-text">暂无文件</span>
        </div>
      </div>

      <div class="info-block">
        <span class="label">产品备注：</span>
        <el-input
          :model-value="productDetail.productRemark || ''"
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

watch(
  [() => props.visible, () => props.productId],
  ([visible, productId], [prevVisible, prevProductId]) => {
    if (visible && (!prevVisible || productId !== prevProductId)) {
      fetchProductDetail();
    }
  }
);

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.product-detail-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.product-detail-content {
  padding: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  &::before {
    content: '';
    width: 4px;
    height: 16px;
    background-color: #409eff;
    border-radius: 2px;
    margin-right: 8px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px 24px;
  margin-bottom: 24px;

  .info-item {
    display: flex;
    align-items: center;
    min-height: 32px;

    &.range {
      grid-column: span 2;
    }

    .label {
      min-width: 100px;
      color: #606266;
      font-size: 14px;
      margin-right: 8px;
    }

    .value {
      flex: 1;
      color: #303133;
      font-size: 14px;
    }
  }
}

.info-block {
  display: flex;
  margin-bottom: 24px;
  align-items: flex-start;

  .label {
    min-width: 100px;
    color: #606266;
    font-size: 14px;
    margin-right: 8px;
    padding-top: 8px;
  }

  .readonly-textarea {
    flex: 1;
    :deep(.el-textarea__inner) {
      background-color: #fff;
      border: 1px solid #dcdfe6;
      cursor: default;
      color: #606266;
    }
  }

  .rich-text-content {
    flex: 1;
    padding: 12px;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    min-height: 80px;
    line-height: 1.6;
    color: #606266;

    &.empty-content {
      color: #909399;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .attachment-content {
    flex: 1;
    display: flex;
    align-items: center;

    .file-link {
      font-size: 14px;
    }

    .empty-text {
      color: #909399;
      font-size: 14px;
    }
  }
}

.footer-actions {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}
</style>

