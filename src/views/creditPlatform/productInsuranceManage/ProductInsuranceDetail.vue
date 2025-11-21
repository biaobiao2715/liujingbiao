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
          <dict-tag :options="applicable_object" :value="typeof detailData.applicableObject === 'string' ? detailData.applicableObject.split(',') : detailData.applicableObject" />
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

    <div class="info-block" v-if="mainAttachment">
      <span class="label">网点清单：</span>
      <div class="attachment-content">
        <div class="uploaded-file-box">
          <el-icon class="file-icon"><Document /></el-icon>
          <span class="file-name" v-if="mainAttachment?.url">
            <el-link type="primary" :href="mainAttachment.url" target="_blank" :underline="false">
              {{ mainAttachment.name || '网点清单.pdf' }}
            </el-link>
          </span>
          <span class="file-name" v-else>{{ mainAttachment?.name || '网点清单.pdf' }}</span>
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
import { ref, onMounted, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Document } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';
import { insuranceProductDetail } from '@/api/creditPlatform/productInsuranceManage';
import { listByIds } from '@/api/system/oss';

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
  ossFileVo?: any[];
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
  ossFileVo: [],
  productRemark: ''
});

const detailFileList = ref<UploadFile[]>([]);
const mainAttachment = computed(() => (detailFileList.value.length > 0 ? detailFileList.value[0] : null));

const buildUploadFileItem = (payload: { ossId?: string | number | null; name?: string; url?: string }) => {
  const rawUid = payload.ossId !== undefined && payload.ossId !== null ? Number(payload.ossId) : NaN;
  const uid = Number.isFinite(rawUid) ? rawUid : Date.now();
  return {
    uid,
    name: payload.name || '附件',
    url: payload.url || '',
    status: 'success'
  } as UploadFile;
};

const formatFileName = (fileName: string | undefined | null): string => {
  if (!fileName) return '网点清单.pdf';
  if (fileName.toLowerCase().endsWith('.pdf')) {
    return fileName;
  }
  return `${fileName}.pdf`;
};

const syncDetailAttachmentList = async (data: any) => {
  if (data?.remoteFile && data.remoteFile.ossId) {
    const remoteFile = data.remoteFile;
    const fileName = remoteFile.originalName || remoteFile.name || data.branchOfficeAttachmentName || '网点清单';
    const displayName = formatFileName(fileName);
    
    detailFileList.value = [
      buildUploadFileItem({
        ossId: remoteFile.ossId,
        name: displayName,
        url: remoteFile.url || data.branchOfficeAttachmentUrl || ''
      })
    ];
    detailData.value.branchOfficeAttachment = remoteFile.ossId || data.branchOfficeAttachment || null;
    detailData.value.branchOfficeAttachmentName = displayName;
    detailData.value.branchOfficeAttachmentUrl = remoteFile.url || data.branchOfficeAttachmentUrl || '';
    return;
  }
  
  const ossList = Array.isArray(data?.ossFileVo) ? data.ossFileVo : [];
  if (ossList.length > 0) {
    const firstFile = ossList[0];
    const fileName = firstFile.originalName || firstFile.fileName || firstFile.name || data.branchOfficeAttachmentName || '网点清单';
    const displayName = formatFileName(fileName);
    
    detailFileList.value = [
      buildUploadFileItem({
        ossId: firstFile.ossId,
        name: displayName,
        url: firstFile.url || firstFile.fileUrl || data.branchOfficeAttachmentUrl || ''
      })
    ];
    detailData.value.branchOfficeAttachment = firstFile.ossId || data.branchOfficeAttachment || null;
    detailData.value.branchOfficeAttachmentName = displayName;
    detailData.value.branchOfficeAttachmentUrl = firstFile.url || firstFile.fileUrl || data.branchOfficeAttachmentUrl || '';
    return;
  }
  
  if (data?.branchOfficeAttachment) {
    try {
      const ossResponse: any = await listByIds(data.branchOfficeAttachment);
      const ossData = Array.isArray(ossResponse?.data) ? ossResponse.data : ossResponse ?? [];
      if (Array.isArray(ossData) && ossData.length > 0) {
        const firstFile = ossData[0];
        const fileName = firstFile.originalName || firstFile.fileName || data.branchOfficeAttachmentName || '网点清单';
        const displayName = formatFileName(fileName);
        
        detailFileList.value = [
          buildUploadFileItem({
            ossId: firstFile.ossId,
            name: displayName,
            url: firstFile.url || firstFile.fileUrl || ''
          })
        ];
        detailData.value.branchOfficeAttachment = firstFile.ossId || data.branchOfficeAttachment || null;
        detailData.value.branchOfficeAttachmentName = displayName;
        detailData.value.branchOfficeAttachmentUrl = firstFile.url || firstFile.fileUrl || '';
        return;
      }
      const displayName = formatFileName(data.branchOfficeAttachmentName);
      detailFileList.value = [
        buildUploadFileItem({
          ossId: data.branchOfficeAttachment,
          name: displayName,
          url: data.branchOfficeAttachmentUrl || ''
        })
      ];
      detailData.value.branchOfficeAttachment = data.branchOfficeAttachment;
      detailData.value.branchOfficeAttachmentName = displayName;
      detailData.value.branchOfficeAttachmentUrl = data.branchOfficeAttachmentUrl || '';
      return;
    } catch (error) {
      const displayName = formatFileName(data.branchOfficeAttachmentName);
      detailFileList.value = [
        buildUploadFileItem({
          ossId: data.branchOfficeAttachment,
          name: displayName,
          url: data.branchOfficeAttachmentUrl || ''
        })
      ];
      detailData.value.branchOfficeAttachment = data.branchOfficeAttachment;
      detailData.value.branchOfficeAttachmentName = displayName;
      detailData.value.branchOfficeAttachmentUrl = data.branchOfficeAttachmentUrl || '';
      return;
    }
  }
  detailData.value.branchOfficeAttachment = null;
  detailData.value.branchOfficeAttachmentName = '';
  detailData.value.branchOfficeAttachmentUrl = '';
  detailFileList.value = [];
};

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
        ossFileVo: data.ossFileVo || [],
        productRemark: data.productRemark || ''
      };
      await syncDetailAttachmentList(data);
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

    .uploaded-file-box {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background-color: #fff;
      min-width: 150px;
      max-width: 300px;

      .file-icon {
        font-size: 18px;
        color: #409eff;
        flex-shrink: 0;
      }

      .file-name {
        font-size: 14px;
        color: #606266;
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
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
