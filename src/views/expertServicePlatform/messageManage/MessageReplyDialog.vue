<!--
  标题: MessageReplyDialog.vue
  功能: 回复留言弹窗
  说明: 用于回复用户留言
  当前版本: 1.0
-->
<template>
  <div class="message-reply-dialog" v-loading="loading">
    <!-- 问题展示区域 -->
    <div class="question-section">
      <div class="question-header">
        <el-tag class="question-tag">问</el-tag>
        <span class="question-text">{{ props.messageContent }}</span>
      </div>
      
      <div class="question-time" v-if="messageTime">{{ messageTime }}</div>
      
      <!-- 附件图标 -->
      <div v-if="attachments && attachments.length > 0" class="attachments">
        <el-icon 
          v-for="(attachment, index) in attachments" 
          :key="index" 
          class="attachment-icon"
          @click="handleDownloadAttachment(attachment)"
        >
          <Folder />
        </el-icon>
      </div>
    </div>

    <!-- 回复输入区域 -->
    <div class="reply-input-section">
      <el-form ref="formRef" :model="formData" :rules="rules">
        <el-form-item prop="replyContent">
          <div class="textarea-wrapper">
            <el-input 
              v-model="formData.replyContent" 
              type="textarea" 
              :rows="10" 
              placeholder="输入留言内容"
              maxlength="300"
              resize="none"
              class="reply-textarea"
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

    <!-- 底部按钮 -->
    <div class="footer-buttons">
      <el-button @click="emitCancel">取消</el-button>
      <el-button type="primary" @click="handleSubmit" :loading="saving">
        回复
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Folder } from '@element-plus/icons-vue';
import { replyMessage, getMessageDetail } from '@/api/expertServicePlatform/messageManage/index';

const props = defineProps<{
  id: string | number | null;
  messageContent: string;
}>();

const emit = defineEmits<{
  (e: 'success'): void;
  (e: 'cancel'): void;
}>();

// 表单引用
const formRef = ref();
// 保存状态
const saving = ref(false);
// 加载状态
const loading = ref(false);

// 表单数据
const formData = ref({
  replyContent: ''
});

// 留言时间
const messageTime = ref('');
// 附件列表
const attachments = ref<any[]>([]);

/** 获取留言详情（用于显示留言时间和附件） */
const fetchMessageDetail = async () => {
  if (!props.id) return;
  
  loading.value = true;
  try {
    const response: any = await getMessageDetail(props.id);
    if (response && response.code === 200 && response.data) {
      messageTime.value = response.data.messageTime || '';
      attachments.value = response.data.attachments || [];
    }
  } catch (error) {
    // 静默处理，不影响回复功能
  } finally {
    loading.value = false;
  }
};

/** 下载附件 */
const handleDownloadAttachment = (attachment: any) => {
  if (attachment.url) {
    window.open(attachment.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

// 字符计数
const charCount = computed(() => formData.value.replyContent.length);

// 剩余字符数
const remainingChars = computed(() => 300 - charCount.value);

// 表单验证规则
const rules = {
  replyContent: [
    { required: true, message: '请输入回复内容', trigger: 'blur' },
    { min: 1, max: 300, message: '回复内容不能超过300个字符', trigger: 'blur' }
  ]
};

/** 提交表单 */
const handleSubmit = async () => {
  if (!formRef.value) return;
  
  try {
    const valid = await formRef.value.validate();
    if (!valid) return;
    
    if (formData.value.replyContent.trim().length === 0) {
      ElMessage.warning('请输入回复内容');
      return;
    }
    
    saving.value = true;
    
    const submitData = {
      id: props.id as string | number,
      replyContent: formData.value.replyContent.trim()
    };
    
    const response: any = await replyMessage(submitData);
    
    if (response && response.code === 200) {
      ElMessage.success('回复成功');
      emit('success');
    } else {
      ElMessage.error(response?.msg || '回复失败');
    }
  } catch (error) {
    ElMessage.error('回复失败，请稍后重试');
  } finally {
    saving.value = false;
  }
};

/** 取消 */
const emitCancel = () => {
  emit('cancel');
};

// 页面加载时获取留言详情
onMounted(() => {
  fetchMessageDetail();
});
</script>

<style scoped lang="scss">
.message-reply-dialog {
  padding: 20px;
  min-height: 450px;
}

// 问题展示区域
.question-section {
  margin-bottom: 30px;
  
  .question-header {
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

// 回复输入区域
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

// 底部按钮
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

// 响应式设计
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

