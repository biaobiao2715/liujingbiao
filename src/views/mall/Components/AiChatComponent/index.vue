<template>
  <div>
    <!-- 问答按钮 -->
    <div class="ai-btn">
      <button class="ai-chat-btn" @click="openDialog">智能问答</button>
    </div>
    <el-dialog
      v-model="visible"
      width="1200px"
      :show-close="false"
      :show-header="false"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      body-class="ai-chat-dialog"
    >
      <div class="close-btn" @click="visible = false">
        <el-icon class="close-icon" @click="visible = false" size="24">
          <CircleCloseFilled />
        </el-icon>
      </div>
      <div class="ai-chat">
        <!-- 左侧 -->
        <div class="sidebar flex-center">
          <img src="@/assets/images/mall/ai-logo.png" width="48" />
          <div class="title">农合智创智能问答AI助理</div>
          <el-button type="success" plain class="new-chat" @click="createSession"> 新对话 </el-button>

          <div class="history">
            <div class="history-title">历史会话</div>
            <div
              v-for="s in sessionList"
              :key="s.id"
              class="history-item"
              :class="{ active: s.id === activeSessionId }"
              @click="activeSessionId = s.id"
            >
              {{ s.title }}
            </div>
          </div>
        </div>

        <!-- 右侧 -->
        <div class="chat-main flex-center-center">
          <Welcome v-if="messages.length === 0 && !chatting" />

          <div class="chat-body" v-else>
            <div v-for="m in messages" :key="m.id" class="chat-item" :class="m.role">
              <div class="bubble" v-html="renderMarkdown(m.content)" />
            </div>
          </div>

          <div class="input-container">
            <el-input v-model="input" type="textarea" :rows="3" :placeholder="placeholder" @keydown="handleKeydown" />
            <div class="send-btn">
              <img src="@/assets/images/mall/send-btn.png" width="28" v-if="input.trim() === '' && !chatting" />
              <img src="@/assets/images/mall/stop-btn.png" width="28" v-else-if="chatting" @click="stopChat" />
              <img src="@/assets/images/mall/send-btn-active.png" width="28" v-else @click="startChat" />
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import MarkdownIt from 'markdown-it';
import { askFastGPTStream } from './useApi';
import Welcome from './Welcome.vue';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
}

const visible = ref(false); // 控制对话框显示/隐藏

const input = ref(''); // 输入框内容

const placeholder = '请将您遇到的问题告诉我，使用shift+Enter换行...';

const chatting = ref(false);

const sessionList = ref<ChatSession[]>([]);

const activeSessionId = ref<string>('');

const activeSession = computed(() => sessionList.value.find((s) => s.id === activeSessionId.value));

const messages = computed(() => activeSession.value?.messages || []);

const md = new MarkdownIt(); // 初始化 Markdown 解析器

const renderMarkdown = (text: string) => {
  return md.render(text);
};

// 创建新会话
const createSession = () => {
  const id = crypto.randomUUID();
  chatting.value = false;
  sessionList.value.unshift({
    id,
    title: '新对话',
    messages: []
  });
  activeSessionId.value = id;
};

const handleKeydown = (e: KeyboardEvent) => {
  // Shift + Enter → 换行（什么都不做，走浏览器默认）
  if (e.key === 'Enter' && e.shiftKey) {
    return;
  }

  // Enter → 发送
  if (e.key === 'Enter') {
    e.preventDefault(); // 阻止换行
    startChat();
  }
};

// 开始对话
const startChat = async () => {
  if (!input.value.trim() || !activeSession.value || chatting.value) return;
  chatting.value = true;
  const session = activeSession.value;
  const userText = input.value;

  input.value = '';

  session.messages.push({
    id: crypto.randomUUID(),
    role: 'user',
    content: userText
  });

  const assistantMsg: ChatMessage = {
    id: crypto.randomUUID(),
    role: 'assistant',
    content: ''
  };

  session.messages.push(assistantMsg);
  let answer = '';
  console.log(userText);

  await askFastGPTStream(userText, {
    appId: '695b578e83bf4cab9740ad9f',
    chatId: session.id,
    onMessage(chunk) {
      console.log(chunk);
      answer += chunk;
    },
    onDone() {
      console.log('回答完成');
    }
  });
};

// 停止回答
const stopChat = () => {
  chatting.value = false;
};

const openDialog = async () => {
  visible.value = true;
  await nextTick();
  const node = document.getElementsByClassName('el-dialog__body');
  console.log(node);
  if (node.length > 0) {
    node[0].setAttribute('style', 'padding: 0 !important');
  }
};

</script>

<style scoped lang="scss">
.ai-btn {
  position: fixed;
  top: 50%;
  right: 12px;
  background-color: #108c58;
  color: #ffffff;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.ai-chat {
  display: flex;
  height: 70vh;
}

/* 左侧 */
.sidebar {
  width: 200px;
  background: #fff;
  padding: 16px;
  flex-direction: column;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.title {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 500;
  font-size: 14px;
  color: #333333;
  margin: 12px 0;
}

.new-chat {
  width: 100%;
  margin-bottom: 12px;
  background: rgba(16, 140, 88, 0.05);
  border-radius: 8px;
  border: 1px solid #108c58;
  color: #108c58;
  font-size: 12px;
}

.history {
  width: 100%;
  border-top: 1px solid #eee;
  .history-title {
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 400;
    font-size: 12px;
    color: #909090;
    margin: 12px 0;
  }
}

.history-item {
  padding: 8px;
  cursor: pointer;
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 12px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 12px;
  color: #333333;
}

.history-item.active {
  background: rgba(235, 235, 235, 0.5);
  border-radius: 8px 8px 8px 8px;
  border: 1px solid rgba(234, 234, 234, 0.5);
}

/* 右侧 */
.chat-main {
  flex: 1;
  flex-direction: column;
}

.chat-body {
  width: 100%;
  height: calc(100% - 130px);
  padding: 24px;
  overflow-y: auto;
}

.chat-item {
  display: flex;
  margin-bottom: 12px;
}

.chat-item.user {
  justify-content: flex-end;
}

.chat-item .bubble {
  max-width: 70%;
  padding: 0 6px;
  border-radius: 8px;
}

.chat-item.user .bubble {
  background: #e6f4ea;
}

.chat-item.assistant .bubble {
  background: #fff;
  border: 1px solid #eee;
}

/* 输入区 */
.chat-input {
  display: flex;
  padding: 16px;
  border-top: 1px solid #eee;
}

.send-btn {
  margin-left: 8px;
}

.input-container {
  width: 70%;
  border-radius: 12px;
  border: 1px solid #108c58;
  padding: 12px;
  position: relative;
  ::v-deep .el-textarea__inner {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
  }
  .send-btn {
    position: absolute;
    right: 12px;
    bottom: 8px;
    cursor: pointer;
  }
}
.close-btn {
  position: absolute;
  right: 12px;
  top: 8px;
  cursor: pointer;
}
</style>

<style>
.el-dialog {
  border-radius: 16px !important;
  background: url('@/assets/images/mall/ai-bg.png') no-repeat center center;
  background-size: cover;
}

.el-dialog__body {
  padding: 0 !important;
  position: relative;
}
.el-dialog,
.ai-chat-dialog {
  padding-top: 0 !important;
  padding: 0 !important;
}

.el-dialog__header {
  display: none;
}

.el-textarea__inner {
  resize: none;
}
</style>
