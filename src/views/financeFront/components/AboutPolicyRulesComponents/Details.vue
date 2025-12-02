<!--
  标题: CourseDetailComponent.vue
  功能: 政策规则详情组件
  说明: 显示政策规则的详细信息，包括政策规则名称、政策规则描述、政策规则图片、政策规则价格、政策规则时长、政策规则讲师等。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->

<template>
  <div>
    <div class="details_title">
      <div class="flex item-start">
        <div class="item_title">{{ form?.articleTitle }}</div>
        <dict-text class="item_type" :options="art_article_type" :value="form.articleType ?? ''" />
      </div>

      <div class="flex item-end">
        <div>{{ '发布时间：' + form?.publishTime }}</div>
        <div style="margin-left: 50px">{{ '来源：' + form?.articleSource }}</div>
      </div>
    </div>

    <div class="detail-content" v-html="form?.articleContent"></div>

    <div style="height: 78px"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getCreditArticle } from '@/api/financeFront/PolicyRules/index';
const props = defineProps({
  id: {
    type: String || Number,
    required: true
  }
});

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { art_article_type } = toRefs<any>(proxy?.useDict('art_article_type'));

const form = ref({
  articleTitle: '',
  articleType: '',
  publishTime: '',
  articleSource: '',
  articleContent: ''
});

onMounted(() => {
  getArticleDetail();
});

// 详情
const getArticleDetail = async () => {
  const res = await getCreditArticle(props.id);
  if (res.code === 200) {
    form.value = res.data || {};
  }
};
</script>

<style scoped lang="scss">
.details_title {
  width: 100%;
  padding: 28px 20px;
  margin-bottom: 16px;
  border-radius: 8px 8px 8px 8px;
  /* 背景优化：保留白色底色 + 分离尺寸，稍作内边距偏移避免紧贴边缘 */
  background: #ffffff url('@/assets/images/finance/loan-book-decoration.png') no-repeat right 40px top 0px;
  background-size: 180px auto;
  /* 视网膜屏细节提升（可选） */
  image-rendering: -webkit-optimize-contrast;
}

.detail-content {
  width: 100%;
  min-height: 633px;
  padding: 30px 20px;
  background: #ffffff;
  border-radius: 8px 8px 8px 8px;
}

.item_title {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.item_type {
  font-size: 14px;
  color: #ff7b00;
  height: 25px;
  display: flex;
  align-items: center;
  white-space: nowrap;

  border-radius: 221px 221px 221px 221px;
  border: 1px solid #ff7b00;
  padding: 0 12px;
  margin-left: 10px;
}

.item-start {
  height: 21px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 28px;
  color: #3d3d3d;
  line-height: 21px;
  margin-bottom: 36px;
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
</style>
