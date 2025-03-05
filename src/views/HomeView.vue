<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAiChatStore } from '@/stores';
import { storeToRefs } from 'pinia';
import { marked } from 'marked';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { useQwenAI } from '@/components/ai/qwenAI';

const router = useRouter();
const aiChatStore = useAiChatStore();
const { getResponse } = useQwenAI();

// 聊天相关状态
const userInput = ref('');
const isInputEmpty = ref(true);
const isProcessing = ref(false);
const chatMessages = ref([]);
const chatContainer = ref(null);

// 监听输入变化
const handleInput = (event) => {
  userInput.value = event.target.value;
  isInputEmpty.value = !userInput.value.trim();
};

// 发送消息
const sendMessage = async () => {
  if (userInput.value.trim() === '') return;

  // 保存当前输入内容
  const currentInput = userInput.value;

  // 清空输入框
  userInput.value = '';
  isInputEmpty.value = true;

  // 添加用户消息
  chatMessages.value.push({
    id: Date.now(),
    content: currentInput,
    role: 'user'
  });

  // 滚动到底部
  scrollToBottom();

  // 设置处理中状态
  isProcessing.value = true;

  try {
    // 添加AI回复消息占位
    const aiMsgId = Date.now() + 1;
    chatMessages.value.push({
      id: aiMsgId,
      content: '思考中...',
      role: 'assistant',
      isTyping: true
    });

    // 获取AI响应
    const completion = await getResponse(currentInput);

    // 用于累积完整响应的变量
    let fullResponse = '';

    // 处理流式响应
    for await (const chunk of completion) {
      if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
        const contentDelta = chunk.choices[0].delta.content || '';
        fullResponse += contentDelta;

        // 更新UI上的消息内容
        const msgIndex = chatMessages.value.findIndex(msg => msg.id === aiMsgId);
        if (msgIndex !== -1) {
          chatMessages.value[msgIndex].content = marked.parse(fullResponse);
          chatMessages.value[msgIndex].isTyping = false;
        }

        // 滚动到底部
        scrollToBottom();
      }
    }

    // 检查是否需要创建新项目
    if (fullResponse.toLowerCase().includes('创建项目') ||
        fullResponse.toLowerCase().includes('新项目') ||
        currentInput.toLowerCase().includes('创建项目') ||
        currentInput.toLowerCase().includes('新项目')) {

      // 添加系统消息
      chatMessages.value.push({
        id: Date.now() + 2,
        content: '系统正在为您创建新项目...',
        role: 'system'
      });

      // 创建新项目 - 跳转到新建项目页面
      setTimeout(() => {
        router.push('/new-project');
      }, 1500);
    }

  } catch (error) {
    console.error('AI响应错误:', error);

    // 更新错误消息
    const msgIndex = chatMessages.value.findIndex(msg => msg.isTyping);
    if (msgIndex !== -1) {
      chatMessages.value[msgIndex].content = '抱歉，我遇到了一些问题，请稍后再试。';
      chatMessages.value[msgIndex].isTyping = false;
      chatMessages.value[msgIndex].isError = true;
    }
  } finally {
    isProcessing.value = false;
    scrollToBottom();
  }
};

// 滚动到底部
const scrollToBottom = () => {
  setTimeout(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  }, 100);
};

// 初始化
onMounted(() => {
  // 初始化代码高亮
  hljs.highlightAll();

  // 添加欢迎消息
  chatMessages.value.push({
    id: Date.now(),
    content: '欢迎使用 MasterGo！我可以帮助您创建和设计项目。您可以直接告诉我您想要创建什么样的项目，或者使用侧边栏的"新建项目"按钮手动创建。',
    role: 'assistant'
  });
});
</script>

<template>
  <div class="home-container">
    <!-- 顶部标题 -->
    <div class="chat-header">
      <h1>What can I help you ship?</h1>
    </div>

    <!-- 聊天区域 -->
    <div class="chat-section">
      <div class="chat-messages" ref="chatContainer">
        <div v-for="message in chatMessages" :key="message.id"
             :class="['message', message.role, { 'error': message.isError }]">
          <div class="message-content" v-html="message.content"></div>
          <div v-if="message.isTyping" class="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>

      <div class="chat-input-container">
        <div class="chat-input">
          <textarea
            v-model="userInput"
            placeholder="Ask v0 to build..."
            @input="handleInput"
            @keydown.enter.prevent="!isInputEmpty && !isProcessing && sendMessage()"
          ></textarea>

          <div class="input-actions">
            <button class="attachment-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
            </button>

            <button class="project-button" @click="router.push('/new-project')">
              <span>+ Project</span>
            </button>

            <button class="send-button" @click="sendMessage" :disabled="isInputEmpty || isProcessing">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.home-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background-color: #f9fafb;
  padding: 0 20%;
}

// 顶部标题
.chat-header {
  text-align: center;
  padding: 40px 0;

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
}

// 聊天区域样式
.chat-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  margin: 0 auto;
}

.chat-messages {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;

  .message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 12px;
    line-height: 1.5;

    &.user {
      align-self: flex-end;
      background-color: #8b5cf6;
      color: white;
    }

    &.assistant {
      align-self: flex-start;
      background-color: #f3f4f6;
      color: #1f2937;
    }

    &.system {
      align-self: center;
      background-color: #fef3c7;
      color: #92400e;
      font-size: 0.875rem;
      padding: 8px 12px;
    }

    &.error {
      background-color: #fee2e2;
      color: #b91c1c;
    }

    .message-content {
      word-break: break-word;

      pre {
        background-color: #f8f9fa;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        margin: 8px 0;

        code {
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
          font-size: 0.875rem;
        }
      }
    }

    .typing-indicator {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;

      span {
        width: 8px;
        height: 8px;
        background-color: #9ca3af;
        border-radius: 50%;
        animation: typing 1s infinite ease-in-out;

        &:nth-child(1) {
          animation-delay: 0s;
        }

        &:nth-child(2) {
          animation-delay: 0.2s;
        }

        &:nth-child(3) {
          animation-delay: 0.4s;
        }
      }
    }
  }
}

.chat-input-container {
  padding: 16px 0 40px 0;
}

.chat-input {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  overflow: hidden;

  textarea {
    width: 100%;
    padding: 16px;
    border: none;
    resize: none;
    font-size: 1rem;
    font-family: inherit;
    min-height: 60px;

    &:focus {
      outline: none;
    }
  }

  .input-actions {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    border-top: 1px solid #f3f4f6;

    .attachment-button {
      background: none;
      border: none;
      color: #6b7280;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;

      &:hover {
        background-color: #f9fafb;
      }
    }

    .project-button {
      margin-left: auto;
      margin-right: 8px;
      background: none;
      border: 1px solid #e5e7eb;
      color: #6b7280;
      padding: 6px 12px;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;

      &:hover {
        background-color: #f9fafb;
      }
    }

    .send-button {
      background: none;
      border: none;
      color: #8b5cf6;
      cursor: pointer;
      padding: 8px;
      border-radius: 8px;

      &:hover {
        background-color: #f9fafb;
      }

      &:disabled {
        color: #d1d5db;
        cursor: not-allowed;
      }
    }
  }
}

@keyframes typing {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .home-container {
    padding: 0 10%;
  }
}

@media (max-width: 768px) {
  .home-container {
    padding: 0 16px;
  }

  .chat-header h1 {
    font-size: 2rem;
  }
}
</style>
