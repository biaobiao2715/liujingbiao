<!--
  标题: MessageDetailDialog.vue
  功能: 留言详情弹窗
  说明: 用于查看留言详细信息
  当前版本: 1.0
-->
<template>
  <div class="message-detail-dialog" v-loading="loading">
    <div class="question-section">
      <div class="section-header">
        <h3 class="section-title">我的问题</h3>
      </div>
      
      <div class="question-content">
        <div class="question-item">
          <el-tag class="question-tag">问</el-tag>
          <span class="question-text">{{ detailData.questionContent || detailData.messageContent }}</span>
        </div>
        
        <div class="question-time" v-if="detailData.publishTime || detailData.messageTime">
          {{ detailData.publishTime || detailData.messageTime }}
        </div>
        
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
          </div>
          
          <div class="reply-time">
            {{ reply.time }}
          </div>
        </div>
      </div>
      
      <div v-else class="no-reply">
        <el-empty description="暂无回复记录" :image-size="100" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Folder } from '@element-plus/icons-vue';
import { getMessageDetail } from '@/api/expertServicePlatform/messageManage/index';

const props = defineProps<{
  id: string | number | null;
}>();

const loading = ref(false);
const detailData = ref({
  id: undefined as number | undefined,
  questionNo: '',
  userId: undefined as number | undefined,
  expertType: '',
  expertId: undefined as number | undefined,
  questionTitle: '',
  questionContent: '',
  questionType: '',
  priorityLevel: '',
  questionStatus: '',
  isAnonymous: '',
  isPublic: '',
  publishTime: '',
  satisfactionScore: undefined as number | undefined,
  latestAnswerTime: '',
  expireTime: '',
  closeTime: '',
  closeUserId: undefined as number | undefined,
  closeUserType: '',
  hnCommonRelevanceFilesVos: [] as any[],
  hnAnswerVoList: [] as any[],
  replyCount: 0,
  messageContent: '',
  messageTime: '',
  attachments: [] as any[]
});

const replyList = ref<Array<{
  content: string;
  time: string;
  replyBy?: string;
}>>([]);

const fetchDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    const response: any = await getMessageDetail(props.id);
    
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      
      detailData.value = {
        id: data.id,
        questionNo: data.questionNo || '',
        userId: data.userId,
        expertType: data.expertType || '',
        expertId: data.expertId,
        questionTitle: data.questionTitle || '',
        questionContent: data.questionContent || '',
        questionType: data.questionType || '',
        priorityLevel: data.priorityLevel || '',
        questionStatus: data.questionStatus || '',
        isAnonymous: data.isAnonymous || '',
        isPublic: data.isPublic || '',
        publishTime: data.publishTime || '',
        satisfactionScore: data.satisfactionScore,
        latestAnswerTime: data.latestAnswerTime || '',
        expireTime: data.expireTime || '',
        closeTime: data.closeTime || '',
        closeUserId: data.closeUserId,
        closeUserType: data.closeUserType || '',
        hnCommonRelevanceFilesVos: data.hnCommonRelevanceFilesVos || [],
        hnAnswerVoList: data.hnAnswerVoList || [],
        replyCount: data.replyCount || 0,
        messageContent: data.questionContent || '',
        messageTime: data.publishTime || '',
        attachments: []
      };
      
      if (data.hnCommonRelevanceFilesVos && Array.isArray(data.hnCommonRelevanceFilesVos)) {
        detailData.value.attachments = data.hnCommonRelevanceFilesVos.flatMap((item: any) => {
          if (item.remoteOssVos && Array.isArray(item.remoteOssVos)) {
            return item.remoteOssVos.map((file: any) => ({
              url: file.url || file.name,
              fileName: file.name || file.originalName,
              originalName: file.originalName || file.name
            }));
          }
          return [];
        });
      }
      
      if (data.hnAnswerVoList && Array.isArray(data.hnAnswerVoList) && data.hnAnswerVoList.length > 0) {
        replyList.value = data.hnAnswerVoList.map((item: any) => ({
          content: item.answerContent || item.content || '',
          time: item.answerTime || item.time || '',
          replyBy: item.answerUserId || item.replyBy || ''
        }));
      } else {
        replyList.value = [];
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

const handleDownloadAttachment = (attachment: any) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

onMounted(() => {
  fetchDetail();
});
</script>

<style scoped lang="scss">
.message-detail-dialog {
  padding: 20px;
  min-height: 450px;
}

.question-section {
  margin-bottom: 24px;
  
  .section-header {
    margin-bottom: 20px;
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 0;
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
}

:deep(.el-divider--horizontal) {
  margin: 20px 0;
}

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
}
</style>
