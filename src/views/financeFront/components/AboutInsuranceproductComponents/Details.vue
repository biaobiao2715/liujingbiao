<!--
  标题: CourseDetailComponent.vue
  功能: 保险产品详情组件
  说明: 显示保险产品的详细信息，包括保险产品名称、保险产品描述、保险产品图片、保险产品价格、保险产品时长、保险产品讲师等。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->

<template>
  <div>
    <div class="details_title">
      <div class="item_productName">{{ form?.productName }}</div>
      <dict-text class="item_type" :options="product_insurance_type" :value="form.productType ?? ''" />
      <div class="item_productIntro">{{ form?.productIntro }}</div>
    </div>

    <div class="detail-content detail-content--advantages">
      <div class="detail-content_title">保险特点</div>
      <div class="rich-text" v-html="form?.productAdvantages"></div>
    </div>

    <div class="detail-content detail-content--applicable">
      <div class="detail-content_title">保障计划</div>
      <div class="rich-text" v-html="form?.guaranteePlan"></div>
    </div>

    <div class="detail-content detail-content--conditions">
      <div class="detail-content_title">申请条件</div>
      <div class="rich-text" v-html="form?.applicationInstructions"></div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">网点清单</div>
      <div v-if="firstAttachment" class="attachment-item" @click="downloadAttachmentByObj(firstAttachment)">
        <span class="attachment-name">{{ firstAttachment.originalName }}</span>
        <span class="attachment-click">下载</span>
      </div>
      <div v-else class="attachment-empty">暂无附件</div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">产品备注</div>
      <div class="remark">{{ form?.productRemark }}</div>
    </div>
    <div style="height: 87px"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getInsuranceProductsVersion } from '@/api/financeFront/Insuranceproduct/index';
const props = defineProps({
  id: {
    type: String || Number,
    required: null
  }
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { product_insurance_type } = toRefs<any>(proxy?.useDict('product_insurance_type'));

const form = ref({
  productName: '',
  productType: '',
  productIntro: '',
  productAdvantages: '',
  guaranteePlan: '',
  applicationInstructions: '',
  branchOfficeAttachment: '',
  productRemark: '',
  remoteFile: {
    originalName: '',
    url: ''
  }
});

const firstAttachment = computed(() => form.value?.remoteFile || null);

const downloadAttachmentByObj = async (file?: { originalName?: string; url?: string }) => {
  if (!file?.url) {
    ElMessage.warning('附件不存在或无下载地址');
    return;
  }
  try {
    const response = await fetch(file.url);
    if (!response.ok) throw new Error('网络错误');
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.originalName || '附件';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error('下载失败', error);
    ElMessage.error('下载失败，请稍后重试');
  }
};

onMounted(() => {
  getArticleDetail();
});

// 详情
const getArticleDetail = async () => {
  const res = await getInsuranceProductsVersion(props.id);
  if (res.code === 200) {
    form.value = res.data || {};
  }
};
</script>

<style scoped lang="scss">
.details_title {
  width: 100%;
  margin-bottom: 20px;
  padding: 40px 30px;
  border-radius: 8px 8px 8px 8px;
  /* 图片在上层，渐变在底层，确保图片可见 */
  background:
    url('@/assets/images/finance/loan-hero-decoration.png') right bottom / 224px 231px no-repeat,
    linear-gradient(319deg, #108c58 0%, rgba(16, 140, 105, 0.76) 100%);
}

.item_productName {
  height: 69px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 50px;
  color: #ffffff;
  line-height: 69px;
  text-align: left;
  font-style: normal;
  text-transform: none;
  margin-bottom: 22px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.item_type {
  width: 328px;
  height: 58px;
  line-height: 58px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 30px;
  color: #ffffff;
  text-align: left;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  background: linear-gradient(270deg, rgba(5, 238, 130, 0) 0%, rgba(255, 255, 255, 0.34) 100%);
  border-radius: 0px 0px 0px 0px;
  margin-bottom: 19px;
  padding-left: 20px;
}

.item_productIntro {
  margin-top: 12px;
  font-size: 16px;
  color: #ffffff;
  line-height: 28px;
}

.item-end {
  height: 20px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #3d3d3d;
  line-height: 20px;
  text-align: left;
  font-style: normal;
  text-transform: none;
}

.detail-content {
  width: 100%;
  padding: 20px;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
  margin-bottom: 20px;
}

/* 右下角背景图（根据需要替换各自的图片路径） */
.detail-content--advantages {
  min-height: 105px;
  background: #ffffff url('@/assets/images/finance/section-advantages-decoration.png') no-repeat right 18px bottom 10px;
  background-size: 85px 85px auto;
}
.detail-content--applicable {
  min-height: 105px;
  background: #ffffff url('@/assets/images/finance/section-guarantee-decoration.png') no-repeat right 18px bottom 10px;
  background-size: 85px 85px auto;
}
.detail-content--conditions {
  min-height: 105px;
  background: #ffffff url('@/assets/images/finance/section-conditions-decoration.png') no-repeat right 0px bottom 0px;
  background-size: 85px 85px auto;
}

.detail-content_title {
  height: 24px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
  line-height: 24px;
  display: flex;
  align-items: center;
}

.detail-content_title::before {
  content: '';
  display: inline-block;
  width: 2px;
  height: 10px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 4px;
}

.remark {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 14px;
  color: #3d3d3d;
  line-height: 24px;
}

.attachment-item {
  display: inline-flex; /* 允许宽度随内容撑开 */
  align-items: center; /* 垂直居中 "下载" */
  width: fit-content; /* 根据内容自适应宽度 */
  max-width: 100%; /* 避免超出父容器 */
  padding: 8px 16px; /* 内边距 */
  margin-top: 15px;
  background: #f6f7fb;
  border: 1px solid #eaeaea;
  border-radius: 4px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #3d3d3d;
  box-sizing: border-box;
  min-height: 36px;
}

.attachment-name {
  flex: 0 1 auto; /* 不强制占满，跟随内容 */
  word-break: break-all; /* 避免超长不换行导致溢出 */
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 20px;
}

.attachment-click {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
  cursor: pointer;
  margin-left: 58px;
}

/* 通用图片约束（容器内的所有图片） */
.detail-content :deep(img),
.detail-content .rich-text :deep(img) {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  margin: 0 auto !important; /* 图片居中且不超出容器 */
}

.detail-content :deep(table) {
  width: 100%;
  table-layout: fixed;
}

.detail-content :deep(video),
.detail-content :deep(iframe) {
  max-width: 100%;
}

.detail-content--advantages :deep(img),
.detail-content--applicable :deep(img),
.detail-content--conditions :deep(img) {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
}

/* v-html 富文本通用规范：去除异常间距与换行 */
.detail-content :deep(p),
.detail-content :deep(h1),
.detail-content :deep(h2),
.detail-content :deep(h3),
.detail-content :deep(h4),
.detail-content :deep(h5),
.detail-content :deep(h6) {
  margin: 0 0 12px; /* 标题/段落统一下间距 */
}

.detail-content :deep(ul),
.detail-content :deep(ol) {
  padding-left: 20px;
  margin: 0 0 12px;
}

.detail-content :deep(blockquote) {
  margin: 0 0 12px;
  padding-left: 12px;
  border-left: 3px solid #e5e5e5;
  color: #666;
}

/* 表格横向溢出时可滚动 */
.detail-content {
  overflow-x: hidden;
}
.detail-content :deep(.table-wrapper) {
  width: 100%;
  overflow-x: auto;
}

/* 防止富文本里图片设置了固定宽度导致溢出 */
.detail-content :deep(img[style*='width']),
.detail-content :deep(img[style*='height']),
.detail-content .rich-text :deep(img[style*='width']),
.detail-content .rich-text :deep(img[style*='height']) {
  width: auto !important; /* 解除固定宽度 */
  height: auto !important; /* 解除固定高度 */
  max-width: 100% !important; /* 约束最大宽度 */
}
</style>
