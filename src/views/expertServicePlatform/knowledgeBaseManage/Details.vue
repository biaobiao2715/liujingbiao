<!--
  标题: enterprise/index.vue
  功能: 知识库详情
  说明: 用于知识库详情查询
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
        <dict-text :options="article_type" :value="form.articleType ?? ''" />
        <div class="stats">
          <el-icon><View /></el-icon>
          <span>{{ form.viewCount ?? form.views ?? 0 }}</span>
          <el-icon class="fav"><Star /></el-icon>
          <span>{{ form.favoriteCount ?? form.favorites ?? 0 }}</span>
        </div>
      </div>
    </div>

    <div v-if="form.articleCover" class="flex-column-center" style="margin-top: 20px">
      <div class="section-title">文章摘要</div>
      <div>{{ form.articleSummary || '-' }}</div>
    </div>

    <!-- <div class="content" v-html=""></div> -->
    <!-- 编辑器内容 -->
    <ContentWithToc :content="form.articleContent" ref="contentWithTocRef" />

    <div v-if="form.articleCover" class="flex-column-center" style="margin-top: 20px">
      <div class="section-title">文章主图</div>
      <el-image :src="form.articleCover" style="height: 160px" />
    </div>

    <div v-if="imgList.length" class="attachments">
      <div class="section-title">附件</div>
      <el-divider />
      <el-table :data="imgList">
        <el-table-column prop="typeText" label="类型" width="100" align="center">
          <template #default="scope">{{ scope.row.fileSuffixDisplay }}</template>
        </el-table-column>
        <el-table-column prop="originalName" label="文件名称">
          <template #default="scope">{{ scope.row.originalName }}</template>
        </el-table-column>
        <el-table-column prop="sizeText" label="文件大小" width="140" align="center">
          <template #default="scope">{{ scope.row.sizeText || '--' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center">
          <template #default="scope">
            <el-button v-throttle type="primary" link @click="downloadAttachment(scope.row)">下载</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div class="flex-center-end" style="margin-top: 20px">
      <el-button v-throttle @click="emitCancel">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, type ComponentInternalInstance, toRefs } from 'vue';
import { View, Star } from '@element-plus/icons-vue';
import { getArticle } from '@/api/expertServicePlatform/knowledgeBaseManage/index';
import { ElMessage } from 'element-plus';
import { downloadFileByUrl } from '@/utils/downloadFileByUrl';
import ContentWithToc from '@/components/ContentWithToc/index.vue';
const props = defineProps<{ id?: string | number }>();
const emit = defineEmits(['cancel']);

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));

const form = ref<any>({});
const imgList = ref<Array<any>>([]);

const buildAttachments = (data: any) => {
  const files = data?.commonRelevanceFilesVos || [];
  imgList.value = files.map((item: any) => {
    const remote = (item.remoteOssVos && item.remoteOssVos[0]) || {};
    let fileSize = 0;
    try {
      if (remote.ext1) {
        const meta = typeof remote.ext1 === 'string' ? JSON.parse(remote.ext1) : remote.ext1;
        fileSize = Number(meta?.fileSize) || 0;
      }
    } catch {
      fileSize = 0;
    }
    const suffix = (remote.fileSuffix || '').replace(/^\./, '').toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'bmp', 'gif', 'webp'].includes(suffix);
    return {
      raw: item,
      url: remote.url || remote.name || '',
      originalName: remote.originalName || remote.name || '',
      fileName: remote.fileName || remote.originalName || remote.name || '',
      fileSuffix: remote.fileSuffix || suffix,
      fileSuffixDisplay: suffix ? suffix.replace(/^\./, '') : '--',
      fileSize,
      sizeText: formatSize(fileSize),
      isImage,
      remote,
      ossId: remote.ossId || remote.id || item.ossId || item.id
    };
  });
};

const downloadAttachment = async (row: any) => {
  try {
    const response = await fetch(row.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = row.originalName || row.fileName || '附件'; // 设置文件名
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href); // 释放 URL 对象
  } catch (error) {
    console.error('下载失败', error);
  }
};

const formatSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '--';
  const kb = 1024;
  const mb = kb * 1024;
  if (bytes >= mb) return (bytes / mb).toFixed(2) + ' MB';
  if (bytes >= kb) return (bytes / kb).toFixed(2) + ' KB';
  return bytes + ' B';
};

const emitCancel = () => emit('cancel');

onMounted(async () => {
  if (!props.id) {
    ElMessage.error('缺少文章ID');
    return;
  }
  const res = await getArticle(props.id);
  const data = res?.data ?? res ?? {};
  form.value = data;
  buildAttachments(data);
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
  // max-width: 1040px;
  border-radius: 4px;
  overflow: hidden;
  background: #f5f7fa;
}
.cover :deep(img),
.cover :deep(.el-image) {
  width: 100%;
}
.content {
  // max-width: 1040px;
  margin: 0 auto;
  padding: 12px 0 8px;
  line-height: 1.8;
  color: #333;
  word-break: break-word;
}
.attachments {
  // max-width: 1040px;
  margin: 12px auto 0;
}
.section-title {
  font-weight: 600;
  margin: 8px 0;
  color: #333;
}
.thumb {
  display: flex;
  justify-content: center;
  align-items: center;
}
.thumb-nonimg {
  width: 80px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
  color: #909399;
  border-radius: 4px;
}
</style>
