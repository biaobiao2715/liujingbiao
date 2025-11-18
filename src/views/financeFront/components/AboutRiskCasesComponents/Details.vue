<!--
  标题: CourseDetailComponent.vue
  功能: 风险案例详情组件
  说明: 显示风险案例的详细信息，包括风险案例名称、风险案例描述、风险案例图片、风险案例价格、风险案例时长、风险案例讲师等。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-29
-->

<template>
  <div class="course-detail-container">
    <div class="title">{{ detail?.cultivateName }}</div>
    <!-- 课程描述 -->
    <div class="description flex-center gap-24 mt-24 mb-24">
      <!-- 头像 -->
      <img :src="detail?.avatar" width="40" />
      <div>{{ '发布人：  ' + detail?.createBy }}</div>
      <div>{{ '发布时间：  ' + detail?.publishTime }}</div>
      <el-tag type="primary">{{ detail?.cultivateType === '0' ? '农业知识' : '法律知识' }}</el-tag>
      <div class="flex-center gap-12">
        <div class="views flex-center gap-2">
          <el-icon size="20"><View /></el-icon>
          <span>{{ detail?.pageViews }}</span>
        </div>
        <div class="collection flex-center gap-2">
          <el-icon size="20" v-if="!isCollected"><Star /></el-icon>
          <el-icon size="24" color="#ff9800" v-else> <StarFilled /></el-icon>
          <span>{{ detail?.collectCount }}</span>
        </div>
      </div>
    </div>
    <!-- 编辑器内容 -->
    <ContentWithToc :content="detail?.cultivateContent" ref="contentWithTocRef" />
    <!-- 附件部分 -->
    <el-table :data="detail?.attachments">
      <el-table-column prop="type" label="附件类型" width="180" />
      <el-table-column prop="name" label="文件名" />
      <el-table-column prop="size" label="文件大小" width="180" />
      <el-table-column prop="downloadUrl" label="下载链接" />
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { courseDetail } from '@/api/mall/expert';
import { getCreditArticle, getCreditArticleList } from '@/api/financeFront/RiskCasesComponent/index';
import ContentWithToc from '@/components/ContentWithToc/index.vue';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});
const detail = ref();

const isCollected = ref(false);

onMounted(() => {
  getArticleDetail();
});

// 详情
const getArticleDetail = async () => {
  const res = await getCreditArticle(props.id);
  if (res.code === 200) {
    detail.value = res.data || {};
  }
};
</script>

<style scoped lang="scss">
.course-detail-container {
  padding: 12px;
  .title {
    text-align: center;
    font-size: 20px;
    font-weight: bold;
  }
  .description {
    .collection {
      cursor: pointer;
    }
  }
}
</style>
