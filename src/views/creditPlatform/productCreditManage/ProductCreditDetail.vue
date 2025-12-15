<!--
  标题: ProductCreditDetail.vue
  功能: 信贷产品详情弹窗
  说明: 显示信贷产品的详细信息
  当前版本: 1.0
  开发信息: Created by 门世超, Refactored by 门世超
-->
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
          <dict-tag
            :options="applicable_object"
            :value="typeof productDetail.applicableObject === 'string' ? productDetail.applicableObject.split(',') : productDetail.applicableObject"
          />
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
            <template v-if="productDetail.minLoanAmount === productDetail.maxLoanAmount"> {{ productDetail.minLoanAmount }} 万元 </template>
            <template v-else> {{ productDetail.minLoanAmount }} 万元 — {{ productDetail.maxLoanAmount }} 万元 </template>
          </template>
          <template v-else>--</template>
        </span>
      </div>
      <div class="info-item range">
        <span class="label">利率/费率：</span>
        <span class="value">
          <template
            v-if="
              productDetail.baseInterestRate !== null &&
              productDetail.baseInterestRate !== undefined &&
              productDetail.floatInterestRate !== null &&
              productDetail.floatInterestRate !== undefined
            "
          >
            <template v-if="productDetail.baseInterestRate === productDetail.floatInterestRate"> {{ productDetail.baseInterestRate }}% </template>
            <template v-else> {{ productDetail.baseInterestRate }}% — {{ productDetail.floatInterestRate }}% </template>
          </template>
          <template v-else>--</template>
        </span>
      </div>
      <div class="info-item">
        <span class="label">可贷周期：</span>
        <span class="value">
          <dict-tag
            :options="loan_cycle"
            :value="typeof productDetail.loanCycle === 'string' ? productDetail.loanCycle.split(',') : productDetail.loanCycle"
          />
        </span>
      </div>
      <div class="info-item">
        <span class="label">还款方式：</span>
        <span class="value">
          <dict-tag
            :options="repayment_method"
            :value="typeof productDetail.repaymentMethod === 'string' ? productDetail.repaymentMethod.split(',') : productDetail.repaymentMethod"
          />
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
        <el-upload class="upload-display" :file-list="detailFileList" :disabled="true" list-type="text"> </el-upload>
      </div>
    </div>

    <div class="info-block" v-if="productDetail.productRemark">
      <span class="label">产品备注：</span>
      <el-input :model-value="productDetail.productRemark" type="textarea" class="readonly-textarea" :autosize="{ minRows: 3 }" readonly />
    </div>

    <div class="footer-actions">
      <el-button @click="handleBack">返回</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import { creditProductDetail } from '@/api/creditPlatform/productCreditManage';
import { listByIds } from '@/api/system/oss';

const props = defineProps<{
  id?: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_credit_type, applicable_object, repayment_method, loan_cycle } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'repayment_method', 'loan_cycle')
);

const loading = ref(false);
const productDetail = ref<any>({});
const detailFileList = ref<UploadFile[]>([]);

// 重新组装PDF文件名称（参考保险产品管理的实现）
const formatFileName = (fileName: string | undefined | null): string => {
  if (!fileName) return '合作机构附件.pdf';
  if (fileName.toLowerCase().endsWith('.pdf')) {
    return fileName;
  }
  return `${fileName}.pdf`;
};

// 构建上传文件对象
const buildUploadFileItem = (payload: { ossId?: string | number | null; name?: string; url?: string }) => {
  const rawUid = payload.ossId !== undefined && payload.ossId !== null ? Number(payload.ossId) : NaN;
  const uid = Number.isFinite(rawUid) ? rawUid : Date.now();
  return {
    uid,
    name: payload.name || '合作机构附件.pdf',
    url: payload.url || '',
    status: 'success'
  } as UploadFile;
};

// 同步详情附件列表（参考保险产品管理的实现）
const syncDetailAttachmentList = async (data: any) => {
  if (data?.remoteFile && data.remoteFile.ossId) {
    const remoteFile = data.remoteFile;
    const fileName = remoteFile.originalName || remoteFile.name || data.cooperationAttachmentName || '合作机构附件';
    const displayName = formatFileName(fileName);

    detailFileList.value = [
      buildUploadFileItem({
        ossId: remoteFile.ossId,
        name: displayName,
        url: remoteFile.url || data.cooperationAttachmentUrl || ''
      })
    ];
    return;
  }

  const ossList = Array.isArray(data?.ossFileVo) ? data.ossFileVo : [];
  if (ossList.length > 0) {
    const firstFile = ossList[0];
    // 优先使用 originalName，然后是 fileName，最后是 name
    const fileName = firstFile.originalName || firstFile.fileName || firstFile.name || data.cooperationAttachmentName || '合作机构附件';
    const displayName = formatFileName(fileName);

    detailFileList.value = [
      buildUploadFileItem({
        ossId: firstFile.ossId,
        name: displayName,
        url: firstFile.url || firstFile.fileUrl || data.cooperationAttachmentUrl || ''
      })
    ];
    return;
  }

  if (data?.cooperationAttachment) {
    try {
      const ossResponse: any = await listByIds(data.cooperationAttachment);
      const ossData = Array.isArray(ossResponse?.data) ? ossResponse.data : (ossResponse ?? []);
      if (Array.isArray(ossData) && ossData.length > 0) {
        const firstFile = ossData[0];
        const fileName = firstFile.originalName || firstFile.fileName || data.cooperationAttachmentName || '合作机构附件';
        const displayName = formatFileName(fileName);

        detailFileList.value = [
          buildUploadFileItem({
            ossId: firstFile.ossId,
            name: displayName,
            url: firstFile.url || firstFile.fileUrl || ''
          })
        ];
        return;
      }
      const displayName = formatFileName(data.cooperationAttachmentName);
      detailFileList.value = [
        buildUploadFileItem({
          ossId: data.cooperationAttachment,
          name: displayName,
          url: data.cooperationAttachmentUrl || ''
        })
      ];
      return;
    } catch (error) {
      const displayName = formatFileName(data.cooperationAttachmentName);
      detailFileList.value = [
        buildUploadFileItem({
          ossId: data.cooperationAttachment,
          name: displayName,
          url: data.cooperationAttachmentUrl || ''
        })
      ];
      return;
    }
  }
  detailFileList.value = [];
};

// 获取产品详情
const fetchDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少产品ID');
    return;
  }

  loading.value = true;
  try {
    const response = await creditProductDetail(props.id);
    if (response && response.code === 200 && response.data) {
      productDetail.value = response.data;
      await syncDetailAttachmentList(response.data);
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
