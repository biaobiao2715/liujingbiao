<!--
  标题: WhitePaperDetailDialog.vue
  功能: 维权白皮书详情弹窗
  说明: 用于查看维权白皮书的详细信息（弹窗形式）
  当前版本: 1.0
-->
<template>
  <div class="whitepaper-detail-dialog" v-loading="loading">
    <!-- 白皮书元信息 -->
    <div class="paper-meta">
      <div class="meta-left">
        <div class="publish-info">
          <span class="publish-time">发布时间: {{ detailData.publishTime || '-' }}</span>
          <span class="version-tag">
            <el-tag type="primary">{{ detailData.version || 'V1.0' }}</el-tag>
          </span>
        </div>
      </div>
      <div class="meta-right">
        <el-tag :type="detailData.status === '启用' ? 'success' : 'danger'">
          {{ detailData.status || '-' }}
        </el-tag>
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

    <!-- 分割线 -->
    <el-divider />

    <!-- 白皮书详细信息 -->
    <div class="paper-details">
      <div class="detail-row" v-if="detailData.summary">
        <span class="detail-label">简介:</span>
        <span class="detail-value">{{ detailData.summary }}</span>
      </div>
      
      <div class="detail-row content-row">
        <span class="detail-label">正文内容:</span>
        <div class="detail-content" v-html="detailData.content || '-'"></div>
      </div>

      <!-- 附件列表 -->
      <div class="detail-row" v-if="detailData.attachments && detailData.attachments.length > 0">
        <span class="detail-label">附件列表:</span>
        <div class="attachments-list">
          <el-table :data="detailData.attachments" border>
            <el-table-column label="附件名称" prop="fileName" />
            <el-table-column label="文件大小" prop="size" width="120" align="center">
              <template #default="scope">
                {{ formatFileSize(scope.row.size) }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" text @click="handleDownload(scope.row)">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <div class="dialog-footer">
      <el-button @click="emitCancel">关闭</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { View, Download } from '@element-plus/icons-vue';
// import { getWhitePaperDetail } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const props = defineProps<{
  id?: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

// 加载状态
const loading = ref(false);

// 详情数据
const detailData = ref({
  id: undefined as number | string | undefined,
  title: '',
  status: '',
  version: '',
  summary: '',
  content: '',
  publishTime: '',
  viewCount: 0,
  downloadCount: 0,
  attachments: [] as any[]
});

/** 格式化文件大小 */
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

/** 获取白皮书详情 */
const fetchWhitePaperDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少白皮书ID');
    return;
  }
  
  loading.value = true;
  try {
    // TODO: 替换为真实API调用
    // const response: any = await getWhitePaperDetail(props.id);
    
    // 模拟数据
    await new Promise(resolve => setTimeout(resolve, 500));
    const mockData = {
      id: props.id,
      title: '2025年XXX通告',
      status: '启用',
      version: 'V1.0',
      summary: '这是一份维权白皮书的简介说明，包含了重要的法律法规和政策解读。',
      content: '<p>这是维权白皮书的详细内容...</p><p>包含了完整的法律条文和案例分析。</p>',
      publishTime: '2019-12-12 10:29:30',
      viewCount: 1550,
      downloadCount: 988,
      attachments: [
        {
          fileName: '维权白皮书附件.pdf',
          size: 1024000,
          url: 'https://example.com/file1.pdf'
        }
      ]
    };
    
    detailData.value = {
      id: mockData.id,
      title: mockData.title || '',
      status: mockData.status || '',
      version: mockData.version || '',
      summary: mockData.summary || '',
      content: mockData.content || '',
      publishTime: mockData.publishTime || '',
      viewCount: mockData.viewCount || 0,
      downloadCount: mockData.downloadCount || 0,
      attachments: mockData.attachments || []
    };
  } catch (error) {
    console.error('获取白皮书详情失败:', error);
    ElMessage.error('获取白皮书详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 下载附件 */
const handleDownload = (file: any) => {
  if (file.url) {
    window.open(file.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

/** 关闭弹窗 */
const emitCancel = () => {
  emit('cancel');
};

// 页面加载时获取详情数据
onMounted(() => {
  fetchWhitePaperDetail();
});
</script>

<style scoped lang="scss">
.whitepaper-detail-dialog {
  padding: 20px;
}

// 白皮书元信息区域
.paper-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  .meta-left {
    .publish-info {
      display: flex;
      align-items: center;
      gap: 16px;
      
      .publish-time {
        font-size: 14px;
        color: #606266;
      }
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

// 白皮书详细信息
.paper-details {
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

// 底部按钮
.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;
  
  .el-button {
    min-width: 100px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .paper-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    
    .meta-right {
      align-items: flex-start;
    }
  }
  
  .paper-details {
    .detail-row {
      flex-direction: column;
      
      .detail-label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>

