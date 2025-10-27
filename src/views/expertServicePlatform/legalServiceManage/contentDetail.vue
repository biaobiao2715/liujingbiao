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

/** 获取内容详情 */
const getContentDetail = async () => {
  if (!id) return;
  
  try {
    // TODO: 调用获取详情接口
    // const response = await getContentDetail(id);
    
    // 模拟数据
    const mockData = {
      id: id,
      contentType: '农技知识',
      title: '农技学堂种子科教种植',
      publishTime: '2019-12-12 10:29:30',
      status: '启用',
      summary: '苎麻细切种根繁殖方法是一种无性繁殖技术,它利用苎麻地下根茎(俗称"种根"或"龙头根")的强大萌蘖能力,通过将其切割成小块(小段)来繁殖新植株。',
      content: `苎麻细切种根繁殖方法是一种无性繁殖技术,它利用苎麻地下根茎(俗称"种根"或"龙头根")的强大萌蘖能力,通过将其切割成小块(小段)来繁殖新植株。这种方法具有繁殖系数大、成活率高、生长快、能保持品种原有优质高产种性等优点,是生产上最常用、最传统的繁殖方法之一。

具体操作步骤：
1. 选择健壮的种根，要求根茎粗壮、无病虫害
2. 将种根切成3-5厘米的小段，每段至少包含1-2个芽眼
3. 切口要平整，避免损伤芽眼
4. 种植时保持适当的株行距，一般行距60-80厘米，株距30-40厘米
5. 种植深度以种根顶端露出土面2-3厘米为宜
6. 种植后及时浇水，保持土壤湿润

注意事项：
- 选择适宜的种植时间，一般在春季3-4月或秋季9-10月
- 种植前要对土壤进行深翻和施肥
- 种植后要加强田间管理，及时除草、施肥、防治病虫害
- 注意保持土壤湿润，但不要积水`,
      viewCount: 232633,
      downloadCount: 988,
      likeCount: 12,
      author: '张三',
      imageUrl: '',
      attachments: [
        {
          name: '视频演示.mp4',
          type: '视频',
          url: '/files/video.mp4',
          size: 500 * 1024 * 1024 // 500MB
        }
      ]
    };
    
    Object.assign(detailData, mockData);
  } catch (error) {
    ElMessage.error('获取内容详情失败');
  }
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
  getContentDetail();
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
