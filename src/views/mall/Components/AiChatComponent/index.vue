<template>
  <div>
    <!-- 问答按钮 -->
    <div class="ai-btn flex-center-center">
      <img src="@/assets/images/mall/ai-logo-left.png" width="32" />
      <div class="btn-text flex-center-center" @click="openDialog">智能问答</div>
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
        <div class="sidebar flex-center" v-loading="loading">
          <img src="@/assets/images/mall/ai-logo.png" width="48" />
          <div class="title">农合智创智能问答AI助理</div>
          <el-button type="success" plain class="new-chat" @click="readySession"> 新对话 </el-button>

          <div class="history">
            <div class="history-title">历史会话</div>
            <div
              v-for="s in sessionList"
              :key="s.id"
              class="history-item flex-center-between"
              :class="{ active: s.chatId === activeSessionId }"
              @click="initSession(s.chatId)"
            >
              <div class="session-title">
                {{ s.title }}
              </div>
              <el-dropdown class="history-dropdown" placement="bottom-start" @command="handleCommand($event, s)">
                <div @click.stop>
                  <el-icon><More /></el-icon>
                </div>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="delete"
                      ><el-icon size="18" color="#ff4d4f"><DeleteFilled /></el-icon
                    ></el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>
        </div>

        <!-- 右侧 -->
        <div class="chat-main flex-center-center">
          <Welcome v-if="!activeSessionId" />

          <div class="chat-body" v-else>
            <div v-for="m in messages" :key="m.id" class="chat-item">
              <div class="question">
                <div class="user" v-html="renderMarkdown(m.questionContent)" />
              </div>
              <div class="answer">
                <div class="assistant" v-html="renderMarkdown(m.answerContent)" />
              </div>
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
import { ref } from 'vue';
import MarkdownIt from 'markdown-it';
// import MarkdownItMultimdTable from 'markdown-it-multimd-table'
import Welcome from './Welcome.vue';
import { getToken } from '@/utils/auth';

import { getChatQuestionsList, initChatQuestions, getChatQuestionDetail, deleteChatRecord } from '@/api/chatting';

interface ChatMessage {
  id: string;
  chatId: string;
  questionContent: string;
  answerContent: string;
}

interface ChatSession {
  id: string;
  title: string;
  appId: string;
  chatId: string;
  messages?: ChatMessage[];
}

let abortController: AbortController | null = null;
let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
let stoppedByUser = false;

const visible = ref(false); // 控制对话框显示/隐藏

const input = ref(''); // 输入框内容

const chatId = ref('');

const appId = ref('');

const loading = ref(false);

const placeholder = '请将您遇到的问题告诉我，使用shift+Enter换行...';

const chatting = ref(false);

const sessionList = ref<ChatSession[]>([]);

const activeSessionId = ref<string>('');

const messages = ref([]);

const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
});

// md.use(MarkdownItMultimdTable, {
//   multiline: true,
//   rowspan: true,
//   headerless: true
// })

// 禁用分割线
// md.disable('hr');

// （可选）禁用标题
// md.disable('heading');

onMounted(() => {});

const renderMarkdown = (text: string) => {
  return md.render(text);
};

const openDialog = async () => {
  visible.value = true;
  await nextTick();
  getChatRecordsList();
  const node = document.getElementsByClassName('el-dialog__body');
  if (node.length > 0) {
    node[0].setAttribute('style', 'padding: 0 !important');
  }
};

//  准备新会话
const readySession = () => {
  activeSessionId.value = '';
  messages.value = [];
};

// 创建新会话
const createSession = async () => {
  const id = crypto.randomUUID() + 'false';
  await getNewChatId('');
  sessionList.value.unshift({
    id,
    title: input.value?.trim().substring(0, 8) || '新对话',
    appId: appId.value,
    chatId: chatId.value,
    messages: []
  });
  activeSessionId.value = chatId.value;
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

// 每次发起新的会话时，都需要初始化问答
const getNewChatId = async (id?: string) => {
  const res: any = await initChatQuestions(id);
  if (res.code === 200) {
    chatId.value = res.data.chatId;
    appId.value = res.data.appId;
  }
};

// 获取问答记录
const getChatRecordsList = async () => {
  loading.value = true;
  const res = await getChatQuestionsList({
    pageNum: 1,
    pageSize: 9999,
    orderByColumn: 'updateTime',
    isAsc: 'desc'
  });

  if (res.code === 200) {
    sessionList.value = res.rows;
    loading.value = false;
  }
};

// 初始化会话详情
const initSession = async (id: string) => {
  activeSessionId.value = id;
  const res: any = await getChatQuestionDetail({
    chatId: id
  });
  if (res.code === 200) {
    messages.value = res.data;
  }
  console.log(messages.value);
};

// 开始对话
const startChat = async () => {
  if (!input.value.trim() || chatting.value) return;
  chatting.value = true;

  // ⭐⭐⭐ 关键位置（每次新请求都要重新创建）
  abortController = new AbortController();
  stoppedByUser = false;

  const userText = input.value;

  // 如果当前没有会话，先创建一个
  if (!activeSessionId.value) {
    await createSession();
  }

  messages.value.push({
    id: crypto.randomUUID(),
    chatId: chatId.value,
    questionContent: userText,
    answerContent: ''
  });

  input.value = '';

  const res = await fetch(import.meta.env.VITE_APP_STREAM_URL, {
    method: 'POST',
    signal: abortController.signal, // ⭐⭐⭐ 关键
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`, // 👈 必须
      clientid: import.meta.env.VITE_APP_CLIENT_ID
    },
    body: JSON.stringify({
      chatId: chatId.value || activeSessionId.value,
      content: userText
    })
  });

  const reader = res.body!.getReader();
  const decoder = new TextDecoder('utf-8');
  console.log(reader);

  let buffer = '';

  while (true) {
    if (stoppedByUser) break;

    const { value, done } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    // 按 SSE 事件切割（\n\n）
    const events = buffer.split('\n\n');
    buffer = events.pop()!; // 剩下半截留着
    for (const event of events) {
      // 一个 event 里可能有多行
      const lines = event.split('\n');

      const lastMsg = messages.value[messages.value.length - 1];

      for (const line of lines) {
        if (!line.startsWith('data:')) continue;

        const data = line.slice(5); // 去掉 data:

        // [DONE] 只会单独一行
        if (data.trim() === '[DONE]') {
          chatting.value = false;
          reader.cancel();
          console.log('done-=--=-=-=-==-');
          getChatRecordsList();
          return;
        }

        // ⚠️ 空 data: 表示换行
        if (data === '') {
          lastMsg.answerContent += '\n';
        } else {
          lastMsg.answerContent += data;
        }
      }
    }
  }
};

// 停止回答
const stopChat = () => {
  stoppedByUser = true;
  chatting.value = false;

  // 1️⃣ 中断 fetch
  if (abortController) {
    abortController.abort();
    abortController = null;
  }

  // 2️⃣ 停止流读取
  if (reader) {
    reader.cancel();
    reader = null;
  }
};

const handleCommand = async (command: string, session: ChatSession) => {
  if (command === 'delete') {
    ElMessageBox.confirm('确定删除该对话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      if (session.id.includes('false')) {
        ElMessage({
          message: '正在进行中的会话不能删除',
          type: 'warning'
        });
        return;
      }
      loading.value = true;
      const res = await deleteChatRecord(session.id);
      if (res.code === 200) {
        if (session.chatId === activeSessionId.value) {
          readySession();
        }
        getChatRecordsList();
      }
    });
  }
};
</script>

<style scoped lang="scss">
.ai-btn {
  position: fixed;
  top: 50%;
  right: 12px;
  cursor: pointer;
  flex-direction: column;
  img {
    position: relative;
    top: 8px;
  }
  .btn-text {
    width: 32px;
    height: 88px;
    font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
    font-weight: 400;
    font-size: 14px;
    color: #ffffff;
    background: #108c58;
    border-radius: 4px;
    // 文字竖着展示 文字间隔 12px
    letter-spacing: 4px;
    writing-mode: vertical-rl;
    padding-top: 8px;
  }
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
  height: calc(100% - 150px);
  overflow: auto;
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

  .session-title {
    width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .history-dropdown {
    display: none;
  }
  &:hover {
    .history-dropdown {
      display: block;
    }
  }
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
  margin-bottom: 12px;

  .question {
    display: flex;
    justify-content: end;
  }

  .user,
  .assistant {
    padding: 0 12px;
    border-radius: 8px;
  }

  .user {
    max-width: 50%;
    text-align: right;
    background: #108c58;
    margin-bottom: 16px;
    color: #fff;
  }
  .assistant {
    padding: 12px;
    background: #f7faf8;
    color: #333;
  }
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
