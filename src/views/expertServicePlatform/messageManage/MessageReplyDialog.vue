<!--
  标题: MessageDetailDialog.vue
  功能: 留言回复弹窗
  说明: 用于查看留言详细信息
  当前版本: 1.0
-->
<template>
  <div class="message-reply-dialog" v-loading="loading">
    <div class="question-section">
      <div class="question-header">
        <el-tag class="question-tag">问</el-tag>
        <span class="question-text">{{ questionDetail?.questionContent || props.messageContent }}</span>
        <div class="question-actions">
          <el-button 
            v-throttle 
            type="primary" 
            size="small" 
            plain
            @click="handlePinToTop"
          >
            {{ props.isPinned ? '取消置顶' : '置顶' }}
          </el-button>
          <el-button 
            v-throttle 
            v-hasPermi="['system:question:stopQuestion']"
            type="danger" 
            size="small" 
            plain
            @click="handleCloseQuestion"
            :loading="closing"
          >
            关闭
          </el-button>
        </div>
      </div>
      
      <div class="question-time" v-if="messageTime">{{ messageTime }}</div>
      
      <div v-if="attachments && attachments.length > 0" class="attachments">
        <template v-for="(attachment, index) in attachments">
          <el-image
            v-if="isImage(attachment.url)"
            :key="`img-${index}-${attachment.url}`"
            class="attachment-thumb"
            :src="attachment.url"
            fit="cover"
            :preview-src-list="imagePreviewList"
            :initial-index="getImageIndex(attachment.url)"
            :z-index="3000"
          />
          <div
            v-else
            :key="`file-${index}-${attachment.url}`"
            class="attachment-file"
            @click="handleDownloadAttachment(attachment)"
          >
            <el-icon class="attachment-icon"><Folder /></el-icon>
            <div class="file-name" :title="attachment.originalName || attachment.fileName">文件</div>
          </div>
        </template>
      </div>
    </div>

    <div class="reply-input-section">
      <el-form ref="formRef" :model="formData" :rules="rules">
        <el-form-item prop="answerContent">
          <div class="textarea-wrapper">
            <el-input 
              v-model="formData.answerContent" 
              type="textarea" 
              :rows="10" 
              placeholder="输入回复内容"
              maxlength="300"
              resize="none"
              class="reply-textarea"
              @keydown.enter="onEnterKey"
            />
            <div class="char-counter">
              已输入{{ charCount }}/300
            </div>
          </div>
        </el-form-item>
      </el-form>
      
      <div class="input-hint">
        还可以输入{{ remainingChars }}字，按下Shift+Enter键换行
      </div>
    </div>

    <div class="footer-buttons">
      <el-button @click="emitCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">
        回复
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Folder } from '@element-plus/icons-vue';
import { replyMessage, getMessageDetail, stopQuestion, type ReplyAnswerParams } from '@/api/expertServicePlatform/messageManage/index';

const props = defineProps<{
  id: string | number | null;
  messageContent: string;
  rowData?: any;
  batchIds?: Array<string | number>;
  batchIndex?: number;
  isPinned?: boolean;
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'batch-next'): void;
  (e: 'cancel'): void;
  (e: 'pin'): void;
  (e: 'unpin'): void;
}>();

const formRef = ref();
const saving = ref(false);
const loading = ref(false);
const closing = ref(false);
const formData = ref({
  answerContent: ''
});
const questionDetail = ref<any>(null);
const messageTime = ref('');
const attachments = ref<any[]>([]);
const imagePreviewList = computed(() => {
  return attachments.value
    .map((a: any) => a?.url)
    .filter((u: string) => !!u && isImage(u));
});
const isImage = (url?: string) => {
  if (!url) return false;
  const u = url.split('?')[0].toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].some(ext => u.endsWith(ext));
};
const getImageIndex = (url?: string) => {
  if (!url) return 0;
  return imagePreviewList.value.findIndex(u => u === url);
};

const fetchMessageDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    const response: any = await getMessageDetail(props.id);
    
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      
      questionDetail.value = {
        id: data.id,
        questionNo: data.questionNo || '',
        questionTitle: data.questionTitle || '',
        questionContent: data.questionContent || '',
        publishTime: data.publishTime || '',
        hnCommonRelevanceFilesVos: data.hnCommonRelevanceFilesVos || [],
        hnAnswerVoList: data.hnAnswerVoList || []
      };
      
      messageTime.value = data.publishTime || '';
      
      if (data.hnCommonRelevanceFilesVos && Array.isArray(data.hnCommonRelevanceFilesVos)) {
        attachments.value = data.hnCommonRelevanceFilesVos.flatMap((item: any) => {
          if (item.remoteOssVos && Array.isArray(item.remoteOssVos)) {
            return item.remoteOssVos.map((file: any) => ({
              url: file.url || file.name,
              fileName: file.name || file.originalName,
              originalName: file.originalName || file.name
            }));
          }
          return [];
        });
      } else {
        attachments.value = [];
      }
    }
  } catch (error) {
    messageTime.value = '';
    attachments.value = [];
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

const charCount = computed(() => formData.value.answerContent.length);
const remainingChars = computed(() => 300 - charCount.value);

const rules = {
  answerContent: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 1, max: 300, message: '回复内容不能超过300个字符', trigger: 'blur' }
  ]
};

const onEnterKey = (e: KeyboardEvent) => {
  // Shift+Enter 换行；单独 Enter 不换行也不提交
  if (e.shiftKey) {
    // Shift+Enter：允许默认行为，正常换行
    return;
  }
  // 单独 Enter：阻止默认行为，不换行也不提交
  e.preventDefault();
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    if (formData.value.answerContent.trim().length === 0) {
      ElMessage.warning('请输入回复内容');
      return;
    }
    
    let questionId: string | number | null = null;
    
    if (props.id !== undefined && props.id !== null && props.id !== '') {
      questionId = props.id;
    } else if (props.rowData?.id !== undefined && props.rowData?.id !== null && props.rowData?.id !== '') {
      questionId = props.rowData.id;
    } else if (questionDetail.value?.id !== undefined && questionDetail.value?.id !== null && questionDetail.value?.id !== '') {
      questionId = questionDetail.value.id;
    }
    
    if (!questionId || questionId === '' || (typeof questionId === 'number' && (isNaN(questionId) || questionId <= 0))) {
      ElMessage.error('问题ID不存在或无效');
      return;
    }
    
    let finalQuestionId: string | number = questionId;
    if (typeof questionId === 'string') {
      const numId = Number(questionId);
      if (!isNaN(numId) && numId > 0 && numId <= Number.MAX_SAFE_INTEGER) {
        finalQuestionId = numId;
      } else if (!isNaN(numId) && numId > 0) {
        finalQuestionId = questionId;
      } else {
        ElMessage.error('问题ID格式错误');
        return;
      }
    }
    
    saving.value = true;
    
    const submitData: ReplyAnswerParams = {
      questionId: finalQuestionId,
      answerContent: formData.value.answerContent.trim()
    };
    
    const response: any = await replyMessage(submitData);
    
    if (response && response.code === 200) {
      ElMessage.success('回复成功');
      // 触发父组件刷新列表
      emit('success');
      // 触发批量下一条
      if (props.batchIds && props.batchIds.length) {
        emit('batch-next');
      } else {
        // 非批量操作，关闭弹窗返回列表
        emit('cancel');
      }
    } else {
      ElMessage.error(response?.msg || '回复失败');
    }
  } catch (error) {
    ElMessage.error('回复失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};

const emitCancel = () => {
  emit('cancel');
};

const getReplyCount = computed(() => {
  if (questionDetail.value?.hnAnswerVoList && Array.isArray(questionDetail.value.hnAnswerVoList)) {
    return questionDetail.value.hnAnswerVoList.length;
  }
  return 0;
});

const handlePinToTop = () => {
  if (props.isPinned) {
    emit('unpin');
  } else {
    emit('pin');
  }
};

const handleCloseQuestion = async () => {
  // 简化ID获取逻辑，优先使用props.id，其次是rowData.id，最后是questionDetail.id
  let questionId: string | number | null = props.id || props.rowData?.id || questionDetail.value?.id || null;
  
  // 统一转换为字符串类型，避免类型问题和大整数精度丢失
  const finalQuestionId = String(questionId || '');
  
  if (!finalQuestionId || finalQuestionId === 'null' || finalQuestionId === 'undefined') {
    ElMessage.error('问题ID不存在或无效');
    return;
  }
  
  // 判断是否回复过消息
  const hasReplied = getReplyCount.value > 0;
  const confirmMessage = hasReplied 
    ? '确定要关闭该会话吗？' 
    : '至少需回复一条信息，请确认是否关闭该会话?';
  
  try {
    await ElMessageBox.confirm(
      confirmMessage,
      '关闭确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    );
  } catch (error) {
    if (error === 'cancel') {
      return;
    }
  }
  
  closing.value = true;
  
  try {
    // 调用关闭接口：专家单向关闭，关闭后用户需重新发起提问
    const response: any = await stopQuestion(finalQuestionId);
    
    if (response && response.code === 200) {
      ElMessage.success('关闭成功');
      // 关闭成功后，关闭弹窗并刷新列表
      emit('cancel');
      emit('success');
    } else {
      ElMessage.error(response?.msg || '关闭失败');
    }
  } catch (error: any) {
    ElMessage.error(error?.msg || '关闭失败，请稍后重试');
  } finally {
    closing.value = false;
  }
}

watch(
  () => props.id,
  (newId) => {
    if (newId) {
      formData.value.answerContent = '';
      fetchMessageDetail();
    }
  },
  { immediate: true }
);
</script>

<style scoped lang="scss">
.message-reply-dialog {
  padding: 20px;
  min-height: 450px;
}

.question-section {
  margin-bottom: 30px;
  
  .question-header {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 12px;
    flex-wrap: nowrap;
    
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
      min-width: 0;
      font-size: 14px;
      color: #303133;
      line-height: 1.8;
      word-break: break-word;
      overflow-wrap: break-word;
    }
    
    .question-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
      margin-left: 12px;
      white-space: nowrap;
      
      .el-button {
        padding: 5px 12px;
        font-size: 12px;
        white-space: nowrap;
      }
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
  
  .attachment-thumb {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    cursor: zoom-in;
    background: #f8f8f8;
  }
  
  .attachment-file {
    width: 80px;
    height: 80px;
    border-radius: 4px;
    background: #f0f4ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    cursor: pointer;
    border: 1px solid #e5e7ef;
    
    .attachment-icon {
      font-size: 28px;
      color: #409eff;
      margin-bottom: 4px;
    }
    .file-name {
      font-size: 12px;
      color: #606266;
      max-width: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    &:hover { opacity: 0.9; }
  }
  }
}

.reply-input-section {
  margin-bottom: 24px;
  
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
  
  .textarea-wrapper {
    position: relative;
    width: 100%;
    
    .reply-textarea {
      :deep(.el-textarea__inner) {
        padding: 12px;
        font-size: 14px;
        line-height: 1.6;
        border-radius: 4px;
        border: 1px solid #dcdfe6;
        
        &:focus {
          border-color: #409eff;
        }
        
        &::placeholder {
          color: #c0c4cc;
        }
      }
    }
    
    .char-counter {
      position: absolute;
      right: 12px;
      bottom: 10px;
      font-size: 12px;
      color: #909399;
      background-color: rgba(255, 255, 255, 0.9);
      padding: 2px 6px;
      border-radius: 2px;
      pointer-events: none;
    }
  }
  
  .input-hint {
    font-size: 12px;
    color: #909399;
    margin-top: 10px;
    text-align: center;
    line-height: 1.5;
  }
}

.footer-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  
  .el-button {
    min-width: 100px;
    padding: 10px 24px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .message-reply-dialog {
    padding: 16px;
  }
  
  .question-section {
    .attachments {
      .attachment-icon {
        font-size: 26px;
      }
    }
  }
  
  .footer-buttons {
    flex-direction: column;
    
    .el-button {
      width: 100%;
    }
  }
}
</style>
