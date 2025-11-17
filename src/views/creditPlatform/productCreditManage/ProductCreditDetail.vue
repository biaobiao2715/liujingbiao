<!-- 产品管理-信贷详情弹窗 -->
<template>
  <div class="product-credit-detail" v-loading="loading">
    <div class="section-title">基本信息</div>

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
          {{ getLoanCycleLabel(productDetail.loanCycle) }}
        </span>
      </div>
      <div class="info-item">
        <span class="label">还款方式：</span>
        <span class="value">
          {{ getRepaymentMethodLabel(productDetail.repaymentMethod) }}
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

    <div class="info-block" v-if="productDetail.cooperationAttachment || (productDetail.ossFileVo && productDetail.ossFileVo.length > 0)">
      <span class="label">合作机构：</span>
      <div class="attachment-content">
        <div v-if="productDetail.ossFileVo && productDetail.ossFileVo.length > 0" class="file-list">
          <div v-for="(file, index) in productDetail.ossFileVo" :key="index" class="file-item">
            <el-link :href="file.url" target="_blank" type="primary" :underline="false">
              <el-icon><Document /></el-icon>
              {{ file.name || file.fileName || '附件' }}
            </el-link>
          </div>
        </div>
        <div v-else-if="productDetail.cooperationAttachment" class="file-item">
          <el-link :href="productDetail.cooperationAttachment" target="_blank" type="primary" :underline="false">
            <el-icon><Document /></el-icon>
            合作机构附件
          </el-link>
        </div>
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
      />
    </div>

    <div class="footer-actions">
      <el-button @click="handleBack">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { creditProductDetail } from '@/api/creditPlatform/productCreditManage';

const normalizeRichText = (content?: string | null): string => {
  if (!content) return '';
  const str = typeof content === 'string' ? content : String(content);
  if (!str) return '';

  try {
    if (typeof window !== 'undefined' && typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(str, 'text/html');
      return doc.body?.innerHTML || str;
    }
  } catch (error) {
    console.warn('normalizeRichText error:', error);
  }

  return str
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
};

const props = defineProps<{
  id?: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_credit_type, applicable_object, product_status } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'product_status')
);

const loading = ref(false);
const productDetail = ref<any>({});

// 利率类型映射
const getInterestRateType = (type: string) => {
  if (type === '0') return '固定利率';
  if (type === '1') return '浮动利率';
  return '--';
};

// 可贷周期选项
const loanCycleOptions = [
  { label: '3期（3个月）', value: '3' },
  { label: '6期（6个月）', value: '6' },
  { label: '12期（12个月）', value: '12' },
  { label: '24期（24个月）', value: '24' },
  { label: '36期（36个月）', value: '36' },
  { label: '48期（48个月）', value: '48' },
  { label: '60期（60个月）', value: '60' }
];

// 获取可贷周期标签
const getLoanCycleLabel = (value: string) => {
  if (!value) return '--';
  const option = loanCycleOptions.find(item => item.value === value);
  return option ? option.label : value;
};

// 还款方式选项
const repaymentMethodOptions = [
  { label: '等额本息', value: '0' },
  { label: '等额本金', value: '2' },
  { label: '先息后本', value: '3' },
  { label: '先本后息', value: '4' }
];

// 获取还款方式标签
const getRepaymentMethodLabel = (value: string) => {
  if (!value) return '--';
  const option = repaymentMethodOptions.find(item => item.value === value);
  return option ? option.label : value;
};

const fetchDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少产品ID');
    return;
  }

  loading.value = true;
  try {
    const response = await creditProductDetail(props.id);
    if (response && response.code === 200 && response.data) {
      productDetail.value = {
        ...response.data,
        productAdvantages: normalizeRichText(response.data.productAdvantages),
        applicableInstructions: normalizeRichText(response.data.applicableInstructions),
        applicationInstructions: normalizeRichText(response.data.applicationInstructions)
      };
    } else {
      ElMessage.error(response?.msg || '获取详情失败');
    }
  } catch (error) {
    ElMessage.error('获取详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  emit('cancel');
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.product-credit-detail {
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
  }

  .attachment-content {
    flex: 1;
    max-width: 800px;

    .file-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .file-item {
      display: flex;
      align-items: center;
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      border: 1px solid #dcdfe6;

      .el-icon {
        margin-right: 8px;
        font-size: 16px;
      }
    }
  }
}

.footer-actions {
  display: flex;
  justify-content: center;
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
