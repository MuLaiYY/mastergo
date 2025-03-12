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
import { createProject } from '@/api/project';
import { getProjectHomePage } from '@/api/page';

const router = useRouter();
const aiChatStore = useAiChatStore();
const { getResponse } = useQwenAI();

// 聊天相关状态
const userInput = ref('');
const isInputEmpty = ref(true);
const isProcessing = ref(false);
const particlesContainer = ref(null);

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

  // 设置处理中状态
  isProcessing.value = true;

  try {
    // 显示创建项目提示
    ElMessage({
      message: '正在为您创建新项目...',
      type: 'info',
      duration: 2000
    });

    // 创建新项目
    const project = await createProject({
      name: '新建项目'+' '+new Date().getMonth()+'月'+new Date().getDate()+'日',
      description: currentInput.slice(0, 15)+'...',
      type: 'auto_generated'
    });

    console.log('项目创建成功:', project);

    // 获取项目首页
    const homePage = await getProjectHomePage(project._id);
    console.log('获取项目首页:', homePage);

    // 先设置pageId
    aiChatStore.setCurrentPageId(homePage._id);
    console.log('设置当前页面ID:', homePage._id);

    // 再设置初始消息
    aiChatStore.setInitialMessage(currentInput);
    console.log('设置初始消息:', currentInput);

    try {
      // 最后跳转到项目首页
      await router.push({
        name: 'page-design',
        params: {
          projectId: project._id,
          pageId: homePage._id
        }
      });
    } catch (routerError) {
      console.error('路由跳转失败:', routerError);
      ElMessage.error({
        message: '项目已创建，但页面跳转失败。请稍后在项目列表中查看。',
        duration: 5000
      });
    }

  } catch (error) {
    console.error('创建项目失败:', error);
    ElMessage.error({
      message: '创建项目失败，请稍后重试',
      duration: 5000
    });
  } finally {
    isProcessing.value = false;
  }
};

// 初始化particles.js
const initParticles = () => {
  if (particlesContainer.value && window.particlesJS) {
    window.particlesJS('particles-js', {
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            value_area: 900
          }
        },
        color: {
          value: ["#c084fc", "#e879f9", "#818cf8", "#38bdf8"]
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000"
          },
        },
        opacity: {
          value: 0.4,
          random: true,
          anim: {
            enable: true,
            speed: 0.8,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 1.5,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#a78bfa",
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.8,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "bubble"
          },
          onclick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          bubble: {
            distance: 150,
            size: 5,
            duration: 2,
            opacity: 0.8,
            speed: 3
          },
          push: {
            particles_nb: 3
          }
        }
      },
      retina_detect: true
    });
  }
};

// 初始化
onMounted(() => {
  // 初始化particles.js
  initParticles();
});
</script>

<template>
  <div class="home-container">
    <!-- Particles.js 背景 -->
    <div id="particles-js" ref="particlesContainer" class="particles-container"></div>

    <!-- 顶部标题 -->
    <div class="chat-header">
      <h1>What can I help you <span class="highlight">ship</span>?</h1>
      <div class="header-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-container">
      <div class="chat-input">
        <textarea
          v-model="userInput"
          placeholder="告诉我你想要创建什么..."
          @input="handleInput"
          @keydown.enter.prevent="!isInputEmpty && !isProcessing && sendMessage()"
        ></textarea>

        <div class="input-actions">
          <button class="project-button" @click="router.push('/new-project')">
            <span>+ 新建项目</span>
          </button>

          <button class="send-button" @click="sendMessage" :disabled="isInputEmpty || isProcessing">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
      <div class="bg-shape shape-4"></div>
    </div>
  </div>
</template>

<style scoped lang="less">
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  position: relative;
  overflow: hidden;
}

// Particles.js 容器
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.2;

    &.shape-1 {
      top: -10%;
      right: -5%;
      width: 40vw;
      height: 40vw;
      background: linear-gradient(135deg, #c084fc, #818cf8);
      animation: float 20s ease-in-out infinite alternate;
    }

    &.shape-2 {
      bottom: -15%;
      left: -10%;
      width: 35vw;
      height: 35vw;
      background: linear-gradient(135deg, #e879f9, #c084fc);
      animation: float 25s ease-in-out infinite alternate-reverse;
    }

    &.shape-3 {
      top: 40%;
      right: 25%;
      width: 20vw;
      height: 20vw;
      background: linear-gradient(135deg, #818cf8, #38bdf8);
      animation: float 18s ease-in-out infinite alternate;
    }

    &.shape-4 {
      top: 30%;
      left: 20%;
      width: 25vw;
      height: 25vw;
      background: linear-gradient(135deg, #38bdf8, #a78bfa);
      animation: float 22s ease-in-out infinite alternate-reverse;
    }
  }
}

// 顶部标题
.chat-header {
  text-align: center;
  padding: 0 0 40px;
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;

  h1 {
    font-size: 3.5rem;
    font-weight: 800;
    color: #4c1d95;
    margin: 0;
    letter-spacing: -0.03em;
    line-height: 1.2;
    position: relative;
    z-index: 2;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.5);

    .highlight {
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      position: relative;
      font-size: 3.8rem;

      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 6px;
        background: linear-gradient(135deg, #8b5cf6, #ec4899);
        border-radius: 3px;
        opacity: 0.7;
      }
    }
  }

  .header-decoration {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;

    .decoration-circle {
      position: absolute;
      border-radius: 50%;

      &.circle-1 {
        top: 20%;
        left: 15%;
        width: 12px;
        height: 12px;
        background-color: #8b5cf6;
        opacity: 0.7;
        animation: pulse 4s ease-in-out infinite;
      }

      &.circle-2 {
        top: 60%;
        right: 20%;
        width: 18px;
        height: 18px;
        background-color: #ec4899;
        opacity: 0.6;
        animation: pulse 5s ease-in-out infinite 1s;
      }

      &.circle-3 {
        bottom: 10%;
        left: 30%;
        width: 8px;
        height: 8px;
        background-color: #3b82f6;
        opacity: 0.8;
        animation: pulse 3s ease-in-out infinite 0.5s;
      }
    }
  }
}

// 输入区域样式
.chat-input-container {
  width: 100%;
  max-width: 700px;
  padding: 0 20px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.chat-input {
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  overflow: hidden;
  transition: all 0.3s ease;

  &:focus-within {
    box-shadow: 0 15px 40px rgba(139, 92, 246, 0.25),
                0 0 0 2px rgba(139, 92, 246, 0.3) inset;
    transform: translateY(-2px);
  }

  textarea {
    width: 100%;
    padding: 24px;
    border: none;
    resize: none;
    font-size: 1.1rem;
    font-family: inherit;
    min-height: 80px;
    transition: all 0.3s ease;
    background: transparent;
    color: #4c1d95;

    &:focus {
      outline: none;
    }

    &::placeholder {
      color: rgba(76, 29, 149, 0.6);
      transition: all 0.3s ease;
    }

    &:focus::placeholder {
      opacity: 0.5;
    }
  }

  .input-actions {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid rgba(139, 92, 246, 0.1);

    .project-button {
      margin-left: auto;
      margin-right: 16px;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      color: #6d28d9;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(139, 92, 246, 0.15);
        border-color: rgba(139, 92, 246, 0.3);
        transform: translateY(-2px);
      }
    }

    .send-button {
      background: linear-gradient(135deg, #8b5cf6, #c084fc);
      border: none;
      color: white;
      cursor: pointer;
      padding: 12px;
      border-radius: 12px;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2);

      &:hover {
        transform: translateY(-2px) translateX(2px);
        box-shadow: 0 6px 15px rgba(139, 92, 246, 0.3);
      }

      &:disabled {
        background: rgba(139, 92, 246, 0.2);
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
      }
    }
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(3%, 3%);
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .chat-header h1 {
    font-size: 3rem;

    .highlight {
      font-size: 3.2rem;
    }
  }
}

@media (max-width: 768px) {
  .chat-header h1 {
    font-size: 2.2rem;

    .highlight {
      font-size: 2.4rem;
    }
  }

  .chat-input-container {
    padding: 0 16px;
  }

  .chat-input textarea {
    padding: 20px;
    font-size: 1rem;
  }
}
</style>

