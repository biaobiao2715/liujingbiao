<!--
  标题: 专家咨询服务平台 - 普法内容详情弹窗
  功能: 用于查看普法内容的详细信息（弹窗形式）
  说明: 弹窗用于查看普法内容的详细信息，包括标题、简介、类别、正文和附件等信息
  当前版本: 1.0
  负责人： 门世超
-->
<template>
  <div class="content-detail-dialog" v-loading="loading">
    <div class="title">{{ detailData?.contentTitle }}</div>
    <div class="article-meta">
      <div class="meta-left">
        <div class="author-info">
          <el-avatar :size="48">{{ (detailData.author || '作者').slice(0, 1) }}</el-avatar>
          <span class="author-name">发布人: {{ detailData.author || '未知' }}</span>
        </div>
        <div class="publish-time">发布时间: {{ detailData.publishTime || '-' }}</div>
      </div>
      <div class="meta-right">
        <div class="stats">
          <span class="stat-item">
            <el-icon><View /></el-icon>
            浏览: {{ detailData.viewCount || 0 }}
          </span>
          <span class="stat-item">
            <el-icon><Download /></el-icon>
            下载: {{ detailData.downloadCount || 0 }}
          </span>
        </div>
      </div>
    </div>

    <el-divider />

    <div class="content-details">
      <div class="detail-row content-row">
        <div class="detail-content" v-html="detailData.contentContent || '-'"></div>
      </div>

      <div class="detail-row" v-if="detailData.attachments && detailData.attachments.length > 0">
        <span class="detail-label">附件列表:</span>
        <div class="attachments-list">
          <el-table :data="detailData.attachments" border>
            <el-table-column label="附件名称" prop="originalName" :show-overflow-tooltip="true" />
            <el-table-column label="附件类型" width="120" align="center">
              <template #default="scope">
                <span>{{ getFileTypeText(scope.row) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="文件大小" width="120" align="center">
              <template #default="scope">
                <span>{{ scope.row.fileSize || '--' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" text @click="handleDownload(scope.row)">
                  <el-icon><Download /></el-icon>
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { View, Download } from '@element-plus/icons-vue';
import { getContentDetail } from '@/api/expertServicePlatform/legalServiceManage/contentManage';
import { downloadFileByUrl } from '@/utils/downloadFileByUrl';

const props = defineProps<{
  id?: string | number | null;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const loading = ref(false);
const detailData = ref({
  id: undefined as number | undefined,
  contentNo: '',
  contentTitle: '',
  contentType: '',
  contentSummary: '',
  contentContent: '',
  contentStatus: '',
  publishTime: '',
  viewCount: 0,
  downloadCount: 0,
  author: '',
  status: '',
  attachments: [] as any[]
});

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const fetchContentDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少内容ID');
    return;
  }
  loading.value = true;
  try {
    const response: any = await getContentDetail(props.id as number);
    if (response && response.code === 200) {
      const data = response.data;
      if (!data) {
        ElMessage.error('获取内容详情失败：数据为空');
        return;
      }
      let statusText = '未知';
      if (data.contentStatus === '3' || data.contentStatus === 3) {
        statusText = '启用';
      } else if (data.contentStatus === '2' || data.contentStatus === 2) {
        statusText = '禁用';
      }
      // 处理附件列表，格式化文件大小等信息
      const sysList = Array.isArray(data.sysOssLists) ? data.sysOssLists : [];
      const voList = Array.isArray(data.ossVoList) ? data.ossVoList : [];
      const list = sysList.length > 0 ? sysList : voList;
      const attachments = list.map((item: any) => {
        const ossId = item.ossId || item.id || item.ossID;
        const url = item.url || '';
        const originalName = item.originalName || item.fileName || item.name || '附件';
        const fileSuffix = item.fileSuffix || (originalName.includes('.') ? '.' + originalName.split('.').pop() : '');
        let fileSizeText = item.fileSize || '--';

        // 从 ext1 中解析文件大小（字节数），转为可读文本
        if ((!fileSizeText || fileSizeText === '--') && item.ext1) {
          try {
            const extra = JSON.parse(item.ext1);
            if (extra && typeof extra.fileSize === 'number') {
              fileSizeText = formatFileSize(extra.fileSize);
            }
          } catch (_) {
            // ignore json parse error
          }
        }

        return {
          ossId,
          fileName: originalName,
          originalName,
          fileSuffix,
          url,
          fileSize: fileSizeText
        };
      });
      detailData.value = {
        id: data.id,
        contentNo: data.contentNo || '',
        contentTitle: data.contentTitle || '',
        contentType: data.contentType || '',
        contentSummary: data.contentSummary || '',
        contentContent: data.contentContent || '',
        contentStatus: data.contentStatus || '',
        publishTime: data.publishTime || '',
        viewCount: data.viewCount || 0,
        downloadCount: data.downloadCount || 0,
        author: data.authorName || data.author || '未知',
        status: statusText,
        attachments: attachments
      };
    } else {
      ElMessage.error(response?.msg || '获取内容详情失败');
    }
  } catch (error) {
    ElMessage.error('获取内容详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleDownload = async (file: any) => {
  try {
    // 优先使用 ossId 通过后端接口下载
    if (file.ossId) {
      (proxy as any)?.$download?.oss(String(file.ossId));
      return;
    }
    // 如果没有 ossId，但有 url，则直接下载
    if (file.url) {
      const fileName = file.originalName || file.fileName || '附件';
      downloadFileByUrl(file.url, fileName);
      return;
    }
    // 如果既没有 ossId 也没有 url，提示用户
    ElMessage.warning('附件链接不存在，无法下载');
  } catch (error) {
    console.error('下载失败:', error);
    ElMessage.error('下载失败，请重试');
  }
};

const getFileTypeText = (row: any): string => {
  const name: string = row?.originalName || row?.fileName || '';
  const suffix: string = (row?.fileSuffix || '').toString().toLowerCase();
  const ext = (name.split('.').pop() || suffix.replace('.', '') || '').toLowerCase();
  const img = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
  const video = ['mp4', 'mov', 'avi', 'mkv', 'wmv', 'flv'];
  const audio = ['mp3', 'wav', 'aac', 'flac', 'ogg'];
  const doc = ['pdf', 'ppt', 'pptx', 'doc', 'docx', 'xls', 'xlsx', 'txt'];
  if (img.includes(ext)) return '图片';
  if (video.includes(ext)) return '视频';
  if (audio.includes(ext)) return '音频';
  if (doc.includes(ext)) return '文档';
  return '其他';
};

onMounted(() => {
  fetchContentDetail();
});
</script>

<style scoped lang="scss">
.content-detail-dialog {
  padding: 20px;
}

.title {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
}

.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  .meta-left {
    display: flex;
    align-items: center;
    gap: 24px;
    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;
      .author-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }
    .publish-time {
      font-size: 14px;
      color: #909399;
    }
  }
  .meta-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    .stats {
      display: flex;
      gap: 16px;
      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: #606266;
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
}

.content-details {
  .detail-row {
    display: flex;
    margin-bottom: 20px;
    line-height: 1.8;
    &.content-row {
      flex-direction: column;
    }
    .detail-label {
      min-width: 100px;
      font-weight: 600;
      color: #606266;
      flex-shrink: 0;
    }
    .detail-value {
      flex: 1;
      color: #303133;
      word-break: break-all;
    }
    .detail-content {
      margin-top: 8px;
      padding: 16px;
      background-color: #f5f7fa;
      border-radius: 4px;
      min-height: 200px;
      color: #303133;
      line-height: 1.8;
      :deep(img) {
        max-width: 100%;
        height: auto;
      }
    }
    .attachments-list {
      flex: 1;
      margin-top: 8px;
    }
  }
}

@media (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    .meta-left {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .meta-right {
      align-items: flex-start;
    }
  }
  .content-details {
    .detail-row {
      flex-direction: column;
      .detail-label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>
