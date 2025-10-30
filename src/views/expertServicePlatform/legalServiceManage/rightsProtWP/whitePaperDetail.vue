<!--
  标题: whitePaperDetail.vue
  功能: 维权白皮书详情
  说明: 用于查看维权白皮书的详细信息
  当前版本: 1.0
  开发信息: Created by AI Assistant
-->
<template>
  <div class="white-paper-detail">
    <!-- 主要内容区域 - 大盒子 -->
    <div class="main-content-box">
      <!-- 页面标题 -->
      <div class="page-header">
        <div class="header-left">
          <h2>{{ detailData.title }}</h2>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="handleEdit">编辑页面</el-button>
        </div>
      </div>

      <!-- 附件区域 -->
      <div class="attachments-section">
        <div class="section-header">
          <el-icon><Paperclip /></el-icon>
          <h3>附件</h3>
        </div>
        
        <div class="attachments-table">
          <el-table :data="detailData.attachments" border style="width: 100%">
            <el-table-column label="附件类型" width="120" align="center">
              <template #default>
                <div class="file-type-icon">
                  <el-icon><Document /></el-icon>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
            <el-table-column label="附件名称" prop="name" min-width="200" />
            <el-table-column label="版本号" prop="version" width="120" align="center" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleDownload(scope.row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 历史版本区域 -->
      <div class="history-section">
        <div class="section-header">
          <h3>历史版本</h3>
        </div>
        
        <div class="history-table">
          <el-table :data="detailData.historyVersions" border style="width: 100%">
            <el-table-column label="修改时间" prop="modifyTime" width="180" align="center" />
            <el-table-column label="历史版本" prop="version" width="120" align="center" />
            <el-table-column label="备注" prop="remarks" min-width="200" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" @click="handleDownloadHistory(scope.row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Document, Paperclip } from '@element-plus/icons-vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const { id, type } = route.query;

// 详情数据
const detailData = reactive({
  id: '',
  title: '',
  publishTime: '',
  status: '',
  remarks: '',
  viewCount: 0,
  downloadCount: 0,
  version: '',
  attachments: [],
  historyVersions: []
});

/** 获取白皮书详情 */
const getWhitePaperDetail = async () => {
  if (!id) return;
  
  try {
    // TODO: 调用获取详情接口
    // const response = await getWhitePaperDetail(id);
    
    // 模拟数据
    const mockData = {
      id: id,
      title: '种子维权白皮书',
      publishTime: '2019-12-12 10:29:30',
      status: '启用',
      remarks: '这是种子维权相关的白皮书，包含了详细的维权指南和案例分析。',
      viewCount: 1981,
      downloadCount: 192,
      version: '1.13',
      attachments: [
        {
          name: '维权白皮书1.0版本.pdf',
          version: '1.13',
          updateTime: '2019-3-23 12:34:34',
          url: '/files/white-paper-1.13.pdf'
        }
      ],
      historyVersions: [
        {
          modifyTime: '2019-3-23 12:34:34',
          version: '1.12',
          remarks: '格式调整',
          url: '/files/white-paper-1.12.pdf'
        },
        {
          modifyTime: '2019-3-23 12:34:34',
          version: '1.11',
          remarks: '更新标签',
          url: '/files/white-paper-1.11.pdf'
        },
        {
          modifyTime: '2019-3-23 12:34:34',
          version: '1.10',
          remarks: '更新标签',
          url: '/files/white-paper-1.10.pdf'
        },
        {
          modifyTime: '2019-3-23 12:34:34',
          version: '1.09',
          remarks: '知识发布',
          url: '/files/white-paper-1.09.pdf'
        }
      ]
    };
    
    Object.assign(detailData, mockData);
  } catch (error) {
    ElMessage.error('获取白皮书详情失败');
  }
};

/** 编辑操作 */
const handleEdit = () => {
  router.push({
    path: '/expertServicePlatform/legalServiceManage/editWhitePaper',
    query: { id: detailData.id }
  });
};

/** 下载附件 */
const handleDownload = (attachment: any) => {
  ElMessage.success(`开始下载：${attachment.name}`);
  // TODO: 实现文件下载逻辑
};

/** 下载历史版本 */
const handleDownloadHistory = (version: any) => {
  ElMessage.success(`开始下载历史版本：${version.version}`);
  // TODO: 实现文件下载逻辑
};

// 页面加载时获取详情
onMounted(() => {
  getWhitePaperDetail();
});
</script>

<style scoped lang="scss">
.white-paper-detail {
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
      margin: 0;
      color: #303133;
      font-size: 20px;
      font-weight: 600;
    }
  }
  
  .header-right {
    .el-button {
      margin-left: 8px;
    }
  }
}

// 附件区域
.attachments-section {
  margin-bottom: 32px;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    
    .el-icon {
      color: #409eff;
      font-size: 18px;
    }
    
    h3 {
      margin: 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
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
    
    .file-type-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      
      .el-icon {
        color: #409eff;
        font-size: 20px;
      }
    }
  }
}

// 历史版本区域
.history-section {
  .section-header {
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e4e7ed;
    
    h3 {
      margin: 0;
      color: #303133;
      font-size: 16px;
      font-weight: 600;
    }
  }
  
  .history-table {
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
  }
}

// 响应式设计
@media (max-width: 768px) {
  .white-paper-detail {
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
}

// 按钮样式优化
.el-button {
  border-radius: 4px;
  font-weight: 500;
  
  &.el-button--small {
    padding: 5px 12px;
    font-size: 12px;
  }
}
</style>
