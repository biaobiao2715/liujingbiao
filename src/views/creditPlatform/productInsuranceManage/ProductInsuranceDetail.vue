<!-- 产品管理-保险详情页 -->
<template>
  <div class="product-insurance-detail" v-loading="loading">
    <div class="section-title">基本信息</div>

    <div class="info-grid">
      <div class="info-item">
        <span class="label">产品名称：</span>
        <span class="value">{{ detailData.productName || '--' }}</span>
      </div>
      <div class="info-item">
        <span class="label">产品类型：</span>
        <span class="value">
          <dict-tag :options="product_insurance_type" :value="detailData.productType" />
        </span>
      </div>
      <div class="info-item">
        <span class="label">适用对象：</span>
        <span class="value">
          <dict-tag :options="applicable_object" :value="detailData.applicableObject" />
        </span>
      </div>
    </div>

    <div class="info-block">
      <span class="label">产品简介：</span>
      <el-input
        :model-value="detailData.productIntro || ''"
        type="textarea"
        class="readonly-textarea"
        :autosize="{ minRows: 3 }"
        readonly
        placeholder="暂无产品简介"
      />
    </div>

    <div class="info-block" v-if="detailData.productAdvantages">
      <span class="label">产品优势：</span>
      <div class="rich-text-content" v-html="detailData.productAdvantages"></div>
    </div>

    <div class="info-block" v-if="detailData.guaranteePlan">
      <span class="label">保障计划：</span>
      <div class="rich-text-content" v-html="detailData.guaranteePlan"></div>
    </div>

    <div class="info-block" v-if="detailData.applicationInstructions">
      <span class="label">申请条件：</span>
      <div class="rich-text-content" v-html="detailData.applicationInstructions"></div>
    </div>

    <div class="info-block" v-if="detailData.branchOfficeAttachment || detailData.branchOfficeAttachmentName">
      <span class="label">网点清单：</span>
      <div class="attachment-content">
        <div class="file-item">
          <el-link :href="detailData.branchOfficeAttachmentUrl" target="_blank" type="primary" :underline="false">
            <el-icon><Document /></el-icon>
            {{ detailData.branchOfficeAttachmentName || '附件' }}
          </el-link>
        </div>
      </div>
    </div>

    <div class="info-block" v-if="detailData.productRemark">
      <span class="label">产品备注：</span>
      <el-input
        :model-value="detailData.productRemark"
        type="textarea"
        class="readonly-textarea"
        :autosize="{ minRows: 3 }"
        readonly
      />
    </div>

    <div class="footer-actions">
      <el-button @click="emitCancel">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import { insuranceProductDetail } from '@/api/creditPlatform/productInsuranceManage';

const props = defineProps<{
  id?: string | number | null;
  type: 'view';
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { product_insurance_type, applicable_object } = toRefs<any>(
  proxy?.useDict('product_insurance_type', 'applicable_object')
);

const loading = ref(false);

interface InsuranceProductDetail {
  productName: string;
  productType: string;
  applicableObject: string;
  productIntro: string;
  productAdvantages: string;
  guaranteePlan: string;
  applicationInstructions: string;
  branchOfficeAttachment?: string | number | null;
  branchOfficeAttachmentName?: string;
  branchOfficeAttachmentUrl?: string;
  productRemark: string;
}

const detailData = ref<InsuranceProductDetail>({
  productName: '',
  productType: '',
  applicableObject: '',
  productIntro: '',
  productAdvantages: '',
  guaranteePlan: '',
  applicationInstructions: '',
  branchOfficeAttachment: null,
  branchOfficeAttachmentName: '',
  branchOfficeAttachmentUrl: '',
  productRemark: ''
});

const fetchDetail = async () => {
  if (!props.id) return;
  loading.value = true;
  try {
    const response = await insuranceProductDetail(props.id as string | number);
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      detailData.value = {
        productName: data.productName || '',
        productType: data.productType || '',
        applicableObject: data.applicableObject || '',
        productIntro: data.productIntro || '',
        productAdvantages: data.productAdvantages || '',
        guaranteePlan: data.guaranteePlan || '',
        applicationInstructions: data.applicationInstructions || '',
        branchOfficeAttachment: data.branchOfficeAttachment || null,
        branchOfficeAttachmentName: data.branchOfficeAttachmentName || '',
        branchOfficeAttachmentUrl: data.branchOfficeAttachmentUrl || '',
        productRemark: data.productRemark || ''
      };
    } else {
      ElMessage.error(response?.msg || '获取产品详情失败');
    }
  } catch (error) {
    ElMessage.error('获取产品详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const emitCancel = () => {
  emit('cancel');
};

onMounted(() => {
  if (props.id) {
    fetchDetail();
  }
});
</script>

<style scoped lang="scss">
.product-insurance-detail {
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
