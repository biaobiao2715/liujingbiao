<!--
  标题: details.vue
  功能: 知识库文章详情
  说明: 展示标题、作者、发布时间、类别、封面、正文与附件下载
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="kb-detail">
    <div class="header">
      <div class="title">{{ form.articleTitle || '-' }}</div>
      <div class="meta">
        <el-avatar :src="form.authorAvatar" size="small">
          {{ (form.authorName || '作者').slice(0, 1) }}
        </el-avatar>
        <span class="author">{{ form.authorName || '-' }}</span>
        <span class="dot" />
        <span>发布时间：{{ parseTime(form.publishTime) }}</span>
        <dict-text :options="article_type" :value="form.articleType" />
        <div class="stats">
          <el-icon><View /></el-icon>
          <span>{{ form.viewCount ?? form.views ?? 0 }}</span>
          <el-icon class="fav"><Star /></el-icon>
          <span>{{ form.favoriteCount ?? form.favorites ?? 0 }}</span>
        </div>
      </div>
    </div>

    <div v-if="form.articleCover" class="cover">
      <el-image :src="form.articleCover" fit="contain" />
    </div>

    <div class="content" v-html="form.articleContent"></div>

    <div v-if="imgList.length" class="attachments">
      <div class="section-title">附件</div>
      <el-table :data="imgList" border>
        <el-table-column prop="typeText" label="附件类型" width="120" align="center" />
        <el-table-column prop="name" label="附件名称" />
        <el-table-column prop="sizeText" label="文件大小" width="140" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button v-throttle type="primary" text @click="previewFile(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { useRoute } from 'vue-router';
import { View, Star } from '@element-plus/icons-vue';
import { getArticle } from '@/api/expertServicePlatform/knowledgeBaseManage/index';

const route = useRoute();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));

const form = ref<any>({});
const imgList = ref<Array<{ name: string; url: string; size?: number; sizeText?: string; type?: string; typeText?: string }>>([]);

const previewFile = async (file: any) => {
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.fileName; // 设置文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放 URL 对象
  } catch (error) {
    // console.error('下载失败', error);
  }
  // console.log('预览文件:', file);
};

onMounted(async () => {
  const id = route.query?.id;
  if (!id) {
    ElMessage.error('缺少文章ID');
    return;
  }

  const res = await getArticle(id as string);
  const data = res?.data ?? res ?? {};
  form.value = data;
  // buildAttachments(data);
});
</script>

<style scoped lang="scss">
.kb-detail {
  padding: 20px 24px;
  background: #fff;
}
.header .title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  text-align: center;
}
.header .meta {
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
  position: relative;
}
.header .meta .author {
  margin-left: 6px;
}
.header .meta .dot::after {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  background: #dcdfe6;
  border-radius: 50%;
  margin: 0 6px;
}
.header .meta .cate {
  color: #909399;
}
.header .meta .stats {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #909399;
}
.header .meta .stats .fav {
  margin-left: 8px;
}
.cover {
  margin: 16px auto;
  width: 100%;
  max-width: 1040px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}
.cover :deep(img),
.cover :deep(.el-image) {
  width: 100%;
}
.content {
  max-width: 1040px;
  margin: 0 auto;
  padding: 12px 0 8px;
  line-height: 1.8;
  color: #333;
  word-break: break-word;
}
.attachments {
  max-width: 1040px;
  margin: 12px auto 0;
}
.section-title {
  font-weight: 600;
  margin: 8px 0;
  color: #333;
}
</style>
