<!--
  标题: MessageDetailDialog.vue
  功能: 留言详情弹窗
  说明: 用于查看留言详细信息
  当前版本: 1.0
-->
<template>
  <div class="message-detail-dialog" v-loading="loading">
    <!-- 我的问题部分 -->
    <div class="question-section">
      <div class="section-header">
        <h3 class="section-title">我的问题</h3>
        <el-icon class="close-icon" @click="handleClose"><Close /></el-icon>
      </div>
      
      <div class="question-content">
        <div class="question-item">
          <el-tag class="question-tag">问</el-tag>
          <span class="question-text">{{ detailData.messageContent }}</span>
        </div>
        
        <div class="question-time" v-if="detailData.messageTime">
          {{ detailData.messageTime }}
        </div>
        
        <!-- 附件图标区域 -->
        <div v-if="detailData.attachments && detailData.attachments.length > 0" class="attachments">
          <el-icon 
            v-for="(attachment, index) in detailData.attachments" 
            :key="index" 
            class="attachment-icon"
            @click="handleDownloadAttachment(attachment)"
          >
            <Folder />
          </el-icon>
        </div>
      </div>
    </div>

    <el-divider />

    <!-- 回复历史部分 -->
    <div class="reply-section">
      <h3 class="section-title">回复历史</h3>
      
      <div v-if="replyList.length > 0" class="reply-list">
        <div 
          v-for="(reply, index) in replyList" 
          :key="index" 
          class="reply-item"
        >
          <div class="reply-header">
            <el-tag class="reply-tag">答</el-tag>
            <span class="reply-content">{{ reply.content }}</span>
            <div class="reply-actions">
              <el-icon class="more-icon"><MoreFilled /></el-icon>
              <span class="reply-count">10</span>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
          
          <div class="reply-time">
            {{ reply.time }}
          </div>
        </div>
      </div>
      
      <div v-else class="no-reply">
        <el-empty description="暂无回复记录" :image-size="100" />
      </div>
      
      <!-- 分页 -->
      <div v-if="replyTotal > 0" class="pagination-wrapper">
        <el-pagination
          :current-page="replyPage"
          :page-size="replyPageSize"
          :page-sizes="[10, 20, 30, 50]"
          :total="replyTotal"
          layout="total, prev, pager, next, sizes, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Close, Folder, MoreFilled, ArrowRight } from '@element-plus/icons-vue';
import { getMessageDetail } from '@/api/expertServicePlatform/messageManage/index';

const props = defineProps<{
  id: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 加载状态
const loading = ref(false);

// 详情数据
const detailData = ref({
  id: '',
  messageNo: '',
  messageContent: '',
  messageTime: '',
  userName: '',
  userPhone: '',
  userEmail: '',
  replyStatus: '0',
  replyContent: '',
  replyTime: '',
  replyBy: '',
  attachments: [] as any[]
});

// 回复列表
const replyList = ref<Array<{
  content: string;
  time: string;
  replyBy?: string;
}>>([]);

// 回复分页
const replyPage = ref(1);
const replyPageSize = ref(10);
const replyTotal = ref(0);

/** 获取留言详情 */
const fetchDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    const response: any = await getMessageDetail(props.id);
    
    if (response && response.code === 200 && response.data) {
      detailData.value = response.data;
      
      // 处理回复列表
      if (response.data.replyList && Array.isArray(response.data.replyList) && response.data.replyList.length > 0) {
        replyList.value = response.data.replyList.map((item: any) => ({
          content: item.replyContent || item.content || '',
          time: item.replyTime || item.time || '',
          replyBy: item.replyBy || ''
        }));
        replyTotal.value = replyList.value.length;
      } else if (response.data.replyContent && response.data.replyStatus === '1') {
        replyList.value = [{
          content: response.data.replyContent,
          time: response.data.replyTime || '',
          replyBy: response.data.replyBy || ''
        }];
        replyTotal.value = 1;
      } else {
        replyList.value = [];
        replyTotal.value = 0;
      }
      
      // 处理附件
      if (response.data.attachments && Array.isArray(response.data.attachments)) {
        detailData.value.attachments = response.data.attachments;
      }
    } else {
      ElMessage.error(response?.msg || '获取详情失败');
    }
  } catch (error) {
    ElMessage.error('获取留言详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 分页改变 */
const handlePageChange = (page: number) => {
  replyPage.value = page;
};

/** 每页条数改变 */
const handleSizeChange = (size: number) => {
  replyPageSize.value = size;
  replyPage.value = 1;
};

/** 下载附件 */
const handleDownloadAttachment = (attachment: any) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

/** 关闭 */
const handleClose = () => {
  emit('close');
};

// 页面加载时获取详情
onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.message-detail-dialog {
  padding: 20px;
  min-height: 450px;
}

// 我的问题部分
.question-section {
  margin-bottom: 24px;
  
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
    }
    
    .close-icon {
      font-size: 20px;
      color: #909399;
      cursor: pointer;
      
      &:hover {
        color: #606266;
      }
    }
  }
  
  .question-content {
    .question-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      margin-bottom: 12px;
      
      .question-tag {
        flex-shrink: 0;
        background-color: #67c23a;
        color: #fff;
        border: none;
        padding: 3px 10px;
        font-size: 13px;
        font-weight: 500;
      }
      
      .question-text {
        flex: 1;
        font-size: 14px;
        color: #303133;
        line-height: 1.8;
        word-break: break-all;
      }
    }
    
    .question-time {
      font-size: 13px;
      color: #909399;
      margin-bottom: 12px;
    }
    
    .attachments {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      
      .attachment-icon {
        font-size: 30px;
        color: #409eff;
        cursor: pointer;
        
        &:hover {
          opacity: 0.8;
        }
      }
    }
  }
}

// 回复历史部分
.reply-section {
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 20px 0;
  }
  
  .reply-list {
    .reply-item {
      margin-bottom: 16px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e4e7ed;
      
      &:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }
      
      .reply-header {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 8px;
        
        .reply-tag {
          flex-shrink: 0;
          background-color: #ff9800;
          color: #fff;
          border: none;
          padding: 3px 10px;
          font-size: 13px;
          font-weight: 500;
        }
        
        .reply-content {
          flex: 1;
          font-size: 14px;
          color: #303133;
          line-height: 1.8;
          word-break: break-all;
        }
        
        .reply-actions {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          gap: 6px;
          
          .more-icon {
            font-size: 16px;
            color: #909399;
            cursor: pointer;
            
            &:hover {
              color: #606266;
            }
          }
          
          .reply-count {
            font-size: 13px;
            color: #303133;
            font-weight: 500;
          }
          
          .arrow-icon {
            font-size: 14px;
            color: #909399;
            cursor: pointer;
            
            &:hover {
              color: #606266;
            }
          }
        }
      }
      
      .reply-time {
        font-size: 13px;
        color: #909399;
      }
    }
  }
  
  .no-reply {
    padding: 40px 0;
    text-align: center;
  }
  
  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: center;
  }
}

// 分隔线样式
:deep(.el-divider--horizontal) {
  margin: 20px 0;
}

// 响应式设计
@media (max-width: 768px) {
  .message-detail-dialog {
    padding: 16px;
  }
  
  .question-section {
    .question-content {
      .attachments {
        .attachment-icon {
          font-size: 26px;
        }
      }
    }
  }
  
  .reply-section {
    .reply-list {
      .reply-item {
        .reply-header {
          flex-wrap: wrap;
          
          .reply-actions {
            .reply-count {
              font-size: 12px;
            }
          }
        }
      }
    }
  }
}
</style>

