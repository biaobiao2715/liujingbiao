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

    <div class="detail-content">
      <div class="detail-content_title">保险特点</div>
      <div v-html="form?.productAdvantages"></div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">保障计划</div>
      <div v-html="form?.guaranteePlan"></div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">申请条件</div>
      <div v-html="form?.applicationInstructions"></div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">网点清单</div>
      <div v-if="firstAttachment" class="attachment-item" @click="downloadAttachmentByObj(firstAttachment)">
        <span>{{ firstAttachment.originalName }}</span>
        <span class="attachment-click">下载</span>
      </div>
      <div v-else class="attachment-empty">暂无附件</div>
    </div>

    <div class="detail-content">
      <div class="detail-content_title">产品备注</div>
      <div class="remark">{{ form?.productRemark }}</div>
    </div>
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
  background: linear-gradient(319deg, #108c58 0%, rgba(16, 140, 105, 0.76) 100%);
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
  white-space: nowrap;
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
  white-space: nowrap;
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
  width: 232px;
  height: 36px;
  background: #f6f7fb;
  border-radius: 4px 4px 4px 4px;
  border: 1px solid #eaeaea;

  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #3d3d3d;
  padding: 0px 19px 0px 16px;
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.attachment-click {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #108c58;
}
</style>
