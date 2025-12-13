<!--
  标题: creditPlatform/loanApplications/ProductDetailDialog.vue
  功能: 产品详情
  说明: 产品详情
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

<template>
  <!-- 产品详情对话框 -->
  <el-dialog :model-value="visible" width="50%" class="product-detail-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">产品详情</div>
    </template>
    
    <div v-loading="loading" class="product-detail-content">
      <div class="section-title">基本信息</div>

      <div class="info-grid">
        <!-- 产品名称 -->
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
            <!-- 如果最小和最大金额都存在 -->
            <template
              v-if="
                productDetail.minLoanAmount !== null &&
                productDetail.minLoanAmount !== undefined &&
                productDetail.maxLoanAmount !== null &&
                productDetail.maxLoanAmount !== undefined
              "
            >
              <!-- 如果最小和最大金额相等，显示单个值 -->
              <template v-if="productDetail.minLoanAmount === productDetail.maxLoanAmount"> {{ productDetail.minLoanAmount }} 万元 </template>
              <!-- 否则显示范围 -->
              <template v-else> {{ productDetail.minLoanAmount }} 万元 — {{ productDetail.maxLoanAmount }} 万元 </template>
            </template>
            <!-- 如果金额为空，显示默认值 -->
            <template v-else>--</template>
          </span>
        </div>
        
        <div class="info-item range">
          <span class="label">利率/费率：</span>
          <span class="value">{{ interestRateRangeText }}</span>
        </div>
        
        <div class="info-item loan-cycle-item">
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
          <el-upload class="upload-display" :file-list="cooperationFileList" :disabled="true" list-type="text" />
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
import { getProduct } from '@/api/creditPlatform/loanApplications';

/**
 *Props 定义
 */
const props = defineProps<{
  visible: boolean;
  productId?: string | number | null;
}>();


const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

// 获取当前组件实例，用于访问全局方法
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

/**
 * 字典选项
 */
const { prod_credit_type, applicable_object, repayment_method, loan_cycle } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'repayment_method', 'loan_cycle')
);

/**
 * 加载状态
 */
const loading = ref(false);

/**
 * 产品详情数据
 */
const productDetail = ref<any>({});

/**
 * 将字典值转换为数组格式
 */
const formatDictValue = (value: unknown) => {
  // 如果已经是数组，直接返回
  if (Array.isArray(value)) return value;
  
  // 如果是字符串，按逗号分割并去除空白
  if (typeof value === 'string') {
    const arr = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
    return arr.length ? arr : undefined;
  }
  
  // 如果值为空，返回 undefined
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  
  // 单个值转换为数组
  return [value];
};

/**
 * 产品类型字典选项
 */
const prodCreditOptions = computed(() => prod_credit_type?.value ?? []);

/**
 * 适用对象字典选项
 */
const applicableObjectOptions = computed(() => applicable_object?.value ?? []);

/**
 * 可贷周期字典选项
 */
const loanCycleOptions = computed(() => loan_cycle?.value ?? []);

/**
 * 还款方式字典选项
 */
const repaymentMethodOptions = computed(() => repayment_method?.value ?? []);

/**
 * - 如果两个利率相等，显示单个百分比
 * - 如果不同，显示范围格式
 * - 如果任一值为空，显示 '--'
 */
const interestRateRangeText = computed(() => {
  const { baseInterestRate, floatInterestRate } = productDetail.value;
  
  // 如果任一利率值为空，返回默认显示
  if (baseInterestRate === null || baseInterestRate === undefined || floatInterestRate === null || floatInterestRate === undefined) {
    return '--';
  }
  
  // 如果两个利率相等，显示单个值
  if (Number(baseInterestRate) === Number(floatInterestRate)) {
    return `${baseInterestRate}%`;
  }
  
  // 显示利率范围
  return `${baseInterestRate}% - ${floatInterestRate}%`;
});

/**
 * 将产品详情中的适用对象值格式化为数组格式
 */
const applicableObjectValue = computed(() => formatDictValue(productDetail.value.applicableObject));

/**
 * 将产品详情中的可贷周期值格式化为数组格式
 */
const loanCycleValue = computed(() => formatDictValue(productDetail.value.loanCycle));

/**
 * 将产品详情中的还款方式值格式化为数组格式
 */
const repaymentMethodValue = computed(() => formatDictValue(productDetail.value.repaymentMethod));

/**
 * 合作机构文件列表
 */
const cooperationFileList = computed<UploadFile[]>(() => {
  // 优先使用 ossFileVo 数组格式
  if (productDetail.value.ossFileVo && Array.isArray(productDetail.value.ossFileVo) && productDetail.value.ossFileVo.length > 0) {
    return productDetail.value.ossFileVo.map((file: any) => ({
      uid: file.ossId?.toString() || Date.now().toString(),
      name: file.fileName || file.name || '附件',
      url: file.url || file.fileUrl || '',
      status: 'success'
    }));
  }
  
  // 兼容旧格式：单个文件
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

/**
 * 获取产品详情
 */
const fetchProductDetail = async () => {
  // 如果没有产品ID，清空数据并返回
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
      productDetail.value = {};
    }
  } catch (error) {
    console.error('获取产品详情失败:', error);
    productDetail.value = {};
  } finally {
    loading.value = false;
  }
};

/**
 * 避免重复请求：仅在对话框从关闭变为打开，或产品ID发生变化时触发
 */
watch([() => props.visible, () => props.productId], ([visible, productId], [prevVisible, prevProductId]) => {
  if (visible && (!prevVisible || productId !== prevProductId)) {
    fetchProductDetail();
  }
});

/**
 * 关闭对话框
 */
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

  /* 可贷周期与还款方式展示一致：标签多行左对齐 */
  &.loan-cycle-item {
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
