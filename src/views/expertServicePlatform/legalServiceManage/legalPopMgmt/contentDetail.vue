<!--
  标题: contentDetail.vue
  功能: 普法内容详情
  说明: 用于查看普法内容的详细信息
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="content-detail">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h2>普法内容详情</h2>
          <p class="page-description">查看普法内容的详细信息</p>
        </div>
        <div class="header-right">
          <el-button @click="handleBack">返回</el-button>
          <el-button type="primary" @click="handleEdit">编辑</el-button>
        </div>
      </div>

      <!-- 文章内容区域 -->
      <div class="article-content">
        <!-- 文章标题 -->
        <div class="article-title">
          <h1>{{ detailData.title }}</h1>
        </div>

        <!-- 文章元信息 -->
        <div class="article-meta">
          <div class="meta-left">
            <div class="author-info">
              <div class="avatar">
                <el-icon><User /></el-icon>
              </div>
              <span class="author-name">发布人: {{ detailData.author || '管理员' }}</span>
            </div>
            <div class="publish-time">
              发布时间: {{ detailData.publishTime }}
            </div>
            <div class="category-tag">
              <el-tag type="primary">{{ detailData.contentType }}</el-tag>
            </div>
          </div>
          <div class="meta-right">
            <div class="stats">
              <span class="view-count">
                <el-icon><View /></el-icon>
                {{ detailData.viewCount }}
              </span>
              <span class="like-count">
                <el-icon><Star /></el-icon>
                {{ detailData.likeCount || 12 }}
              </span>
            </div>
          </div>
        </div>

        <!-- 文章正文 -->
        <div class="article-body">
          <div class="content-text">{{ detailData.content }}</div>
        </div>

        <!-- 图片展示区域 -->
        <div class="image-section" v-if="detailData.imageUrl">
          <div class="image-container">
            <el-image 
              :src="detailData.imageUrl" 
              :alt="detailData.title"
              fit="cover"
              class="article-image"
            />
          </div>
        </div>
        <div class="image-placeholder" v-else>
          <div class="placeholder-content">
            <el-icon><Picture /></el-icon>
            <span>图片</span>
          </div>
        </div>

        <!-- 附件区域 -->
        <div class="attachments-section" v-if="detailData.attachments && detailData.attachments.length > 0">
          <div class="attachments-header">
            <h3>附件</h3>
          </div>
          
          <div class="attachments-table">
            <el-table :data="detailData.attachments" border style="width: 100%">
              <el-table-column label="附件类型" prop="type" width="120" align="center">
                <template #default="scope">
                  <div class="file-type">
                    <el-icon><VideoPlay /></el-icon>
                    <span>{{ scope.row.type }}</span>
                  </div>
                </template>
              </el-table-column>
              <el-table-column label="附件名称" prop="name" min-width="200" />
              <el-table-column label="文件大小" prop="size" width="120" align="center">
                <template #default="scope">
                  {{ formatFileSize(scope.row.size) }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" align="center">
                <template #default="scope">
                  <el-button type="primary" size="small" @click="handleDownload(scope.row)">下载</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, User, View, Star, Picture, VideoPlay } from '@element-plus/icons-vue';
import { useRouter, useRoute } from 'vue-router';
import { getContentDetail } from '@/api/expertServicePlatform/legalServiceManage/contentManage';
import { formatDate } from '@/utils/index';

const router = useRouter();
const route = useRoute();
const { id, type } = route.query;

// 详情数据
const detailData = reactive({
  id: '',
  contentType: '',
  title: '',
  publishTime: '',
  status: '',
  summary: '',
  content: '',
  viewCount: 0,
  downloadCount: 0,
  likeCount: 0,
  author: '',
  imageUrl: '',
  attachments: []
});

// 操作记录
const operationRecords = ref([
  {
    time: '2025-01-15 10:30:00',
    action: '创建内容',
    user: '管理员',
    type: 'primary',
    remark: '初始创建普法内容'
  },
  {
    time: '2025-01-15 14:20:00',
    action: '发布内容',
    user: '管理员',
    type: 'success',
    remark: '内容审核通过并发布'
  },
  {
    time: '2025-01-16 09:15:00',
    action: '更新内容',
    user: '编辑员',
    type: 'warning',
    remark: '更新了部分内容描述'
  }
]);

/** 根据文件后缀获取文件类型 */
const getFileTypeFromSuffix = (suffix: string) => {
  const s = suffix?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(s)) return '图片';
  if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(s)) return '文档';
  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv'].includes(s)) return '视频';
  if (['mp3', 'wav', 'flac', 'aac'].includes(s)) return '音频';
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(s)) return '压缩包';
  return '其他';
};

/** 获取内容详情 */
const fetchContentDetail = () => {
  if (!id) return;
  
  getContentDetail(Number(id))
    .then((res: any) => {
      // 响应拦截器已处理，res 直接是 res.data，如果成功则 res.code === 200
      if (res && res.code === 200) {
        const data = res.data;
        if (!data) {
          ElMessage.error('获取内容详情失败：数据为空');
          return;
        }
      
        // 映射后端数据到详情数据
        detailData.id = data.id ?? '';
        detailData.contentType = data.contentType ?? '';
        detailData.title = data.contentTitle ?? '';
        // 格式化发布时间为 YYYY-MM-DD HH:MM:SS 24小时制
        detailData.publishTime = data.publishTime ? formatDate(data.publishTime) : '';
        detailData.status = data.contentStatus ?? '';
        detailData.summary = data.contentSummary ?? '';
        detailData.content = data.contentContent ?? '';
        detailData.viewCount = data.viewCount != null ? data.viewCount : 0;
        detailData.downloadCount = data.downloadCount != null ? data.downloadCount : 0;
        detailData.author = data.authorName ?? '';
        
        // 处理附件列表
        if (data.sysOssLists && Array.isArray(data.sysOssLists) && data.sysOssLists.length > 0) {
          detailData.attachments = data.sysOssLists.map((file: any) => ({
            id: file.ossId,
            name: file.fileName || file.originalName || '未知文件',
            type: getFileTypeFromSuffix(file.fileSuffix),
            size: file.size || 0,
            url: file.url
          }));
        } else {
          detailData.attachments = [];
        }
        
        // 处理图片（如果有）
        if (data.sysOssLists && Array.isArray(data.sysOssLists)) {
          const imageFile = data.sysOssLists.find((file: any) => {
            const suffix = file.fileSuffix?.toLowerCase() || '';
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(suffix);
          });
          detailData.imageUrl = imageFile?.url || '';
        }
      } else {
        ElMessage.error(res?.msg || '获取内容详情失败');
      }
    })
    .catch((error) => {
      ElMessage.error('获取内容详情失败');
    });
};

/** 返回操作 */
const handleBack = () => {
  router.back();
};

/** 编辑操作 */
const handleEdit = () => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/editContent',
    query: { id: detailData.id }
  });
};

/** 下载附件 */
const handleDownload = (attachment: any) => {
  ElMessage.success(`开始下载：${attachment.name}`);
  // TODO: 实现文件下载逻辑
};

/** 格式化文件大小 */
const formatFileSize = (size: number) => {
  if (size < 1024) {
    return size + ' B';
  } else if (size < 1024 * 1024) {
    return (size / 1024).toFixed(1) + ' KB';
  } else {
    return (size / (1024 * 1024)).toFixed(1) + ' MB';
  }
};

// 页面加载时获取详情
onMounted(() => {
  fetchContentDetail();
});
</script>

<style scoped lang="scss">
.content-detail {
  padding: 24px;
  background-color: #f5f5f5;
  min-height: 100vh;
}

// 主要内容区域 - 大盒子
.main-content-box {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
}

// 页面标题
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  
  .header-left {
    h2 {
      margin: 0 0 8px 0;
      color: #303133;
      font-size: 20px;
      font-weight: 600;
    }
    
    .page-description {
      margin: 0;
      color: #909399;
      font-size: 14px;
    }
  }
  
  .header-right {
    .el-button {
      margin-left: 8px;
    }
  }
}

// 文章内容区域
.article-content {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

// 文章标题
.article-title {
  text-align: center;
  margin-bottom: 24px;
  
  h1 {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
    line-height: 1.4;
    margin: 0;
  }
}

// 文章元信息
.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e7ed;
  
  .meta-left {
    display: flex;
    align-items: center;
    gap: 20px;
    
    .author-info {
      display: flex;
      align-items: center;
      gap: 8px;
      
      .avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: #f0f2f5;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          color: #909399;
          font-size: 16px;
        }
      }
      
      .author-name {
        color: #606266;
        font-size: 14px;
      }
    }
    
    .publish-time {
      color: #909399;
      font-size: 14px;
    }
    
    .category-tag {
      .el-tag {
        font-size: 12px;
      }
    }
  }
  
  .meta-right {
    display: flex;
    align-items: center;
    gap: 16px;
    
    .stats {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .view-count,
      .like-count {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #909399;
        font-size: 14px;
        
        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
}

// 文章摘要
.article-summary {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #409eff;
  
  p {
    margin: 0;
    color: #606266;
    line-height: 1.6;
    font-size: 15px;
  }
}

// 文章正文
.article-body {
  margin-bottom: 32px;
  
  .content-text {
    color: #303133;
    line-height: 1.8;
    font-size: 16px;
    white-space: pre-wrap;
  }
}

// 图片展示区域
.image-section {
  margin-bottom: 32px;
  
  .image-container {
    text-align: center;
    
    .article-image {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
  }
}

.image-placeholder {
  margin-bottom: 32px;
  height: 300px;
  background-color: #f5f7fa;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  .placeholder-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    color: #c0c4cc;
    
    .el-icon {
      font-size: 48px;
    }
    
    span {
      font-size: 16px;
    }
  }
}

// 附件区域
.attachments-section {
  margin-top: 32px;
  
  .attachments-header {
    margin-bottom: 16px;
    
    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .attachments-table {
    :deep(.el-table) {
      .el-table__header {
        background-color: #fafafa;
        
        th {
          background-color: #fafafa !important;
          color: #606266;
          font-weight: 600;
        }
      }
      
      .el-table__body {
        tr {
          &:hover {
            background-color: #f5f7fa;
          }
        }
      }
    }
    
    .file-type {
      display: flex;
      align-items: center;
      gap: 6px;
      
      .el-icon {
        color: #409eff;
        font-size: 16px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .content-detail {
    padding: 16px;
  }
  
  .main-content-box {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: stretch;
    
    .header-right {
      margin-top: 16px;
      text-align: center;
      
      .el-button {
        margin: 4px;
        width: 100%;
      }
    }
  }
  
  .article-content {
    padding: 0 10px;
  }
  
  .article-title h1 {
    font-size: 24px;
  }
  
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    
    .meta-left {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      width: 100%;
    }
    
    .meta-right {
      width: 100%;
      justify-content: flex-start;
    }
  }
  
  .image-placeholder {
    height: 200px;
  }
}
</style>
