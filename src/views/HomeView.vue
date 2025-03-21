<script setup>
import { ref, onMounted, reactive, nextTick } from 'vue';
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
import { getCurrentUser } from '@/api/user';
const router = useRouter();
const aiChatStore = useAiChatStore();
const { optimizePrompt: optimizePromptAPI } = useQwenAI();

// 聊天相关状态
const userInput = ref('');
const isInputEmpty = ref(true);
const isProcessing = ref(false);
const particlesContainer = ref(null);

// 语音识别相关状态
const isRecording = ref(false);
const recognition = ref(null);
const recordingTimeout = ref(null);
const preSpeechText = ref('');
const userInitiatedStop = ref(false);

// 提示词优化相关状态
const isOptimizingPrompt = ref(false);

// 监听输入变化
const handleInput = () => {
  isInputEmpty.value = !userInput.value.trim();
  adjustTextareaHeight();
};

// 抽取出调整高度的函数，以便在多处调用
const adjustTextareaHeight = () => {
  nextTick(() => {
    const textarea = document.querySelector('.chat-input textarea');
    if (textarea) {
      // 重置高度，以便我们可以正确计算
      textarea.style.height = 'auto';

      // 计算内容高度 (scrollHeight包含内容实际需要的高度)
      const scrollHeight = textarea.scrollHeight;

      // 应用高度，但最大不超过300px
      textarea.style.height = Math.min(scrollHeight, 300) + 'px';
    }
  });
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

// 新增：初始化语音识别
const initSpeechRecognition = () => {
  try {
    // 检查浏览器是否支持语音识别API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      console.error('当前浏览器不支持语音识别')
      return false
    }

    recognition.value = new SpeechRecognition()
    recognition.value.continuous = false
    recognition.value.interimResults = true
    recognition.value.lang = 'zh-CN' // 设置为中文识别

    // 监听识别结果
    recognition.value.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('')

      // 更新输入框内容 - 使用初始文本加上新识别的文本
      const separator = preSpeechText.value && preSpeechText.value.trim() ? ' ' : ''
      userInput.value = preSpeechText.value + separator + transcript
      isInputEmpty.value = !userInput.value.trim()
    }

    // 监听识别结束
    recognition.value.onend = () => {
      console.log('语音识别会话结束')
      // 如果不是用户主动停止且仍在录音状态，则重新启动
      if (!userInitiatedStop.value && isRecording.value) {
        console.log('自动重启语音识别')
        try {
          // 在重新启动前，保存当前文本作为新的初始文本
          preSpeechText.value = userInput.value || ''

          // 短暂延迟后重新启动，避免可能的冲突
          setTimeout(() => {
            if (isRecording.value) { // 再次检查，确保用户没有在延迟期间松开按钮
              recognition.value.start()
            }
          }, 100)
        } catch (err) {
          console.error('重新启动语音识别失败:', err)
          stopRecording()
        }
      } else {
        stopRecording()
      }
    }

    // 监听错误
    recognition.value.onerror = (event) => {
      console.error('语音识别错误:', event.error)
      // 只有特定错误才停止，比如无法识别的语音
      if (event.error === 'no-speech') {
        // 无语音时不显示警告，因为这可能是用户停顿
        console.log('未检测到语音，继续监听')
      } else {
        ElMessage.error('语音识别出错，请重试')
        stopRecording()
      }
    }

    return true
  } catch (err) {
    console.error('初始化语音识别失败:', err)
    return false
  }
}

// 新增：开始录音
const startRecording = () => {
  // 防止重复启动
  if (isRecording.value) return

  // 重置用户主动停止标记
  userInitiatedStop.value = false

  // 初始化语音识别
  if (!recognition.value) {
    const initialized = initSpeechRecognition()
    if (!initialized) {
      ElMessage.error('您的浏览器不支持语音识别')
      return
    }
  }

  try {
    // 记录开始识别前的文本内容
    preSpeechText.value = userInput.value || ''

    recognition.value.start()
    isRecording.value = true

    // 设置最长录音时间（60秒）
    recordingTimeout.value = setTimeout(() => {
      userInitiatedStop.value = true // 设置为用户主动停止（超时）
      stopRecording()
    }, 60000)

    ElMessage.success('开始录音，请说话...')
  } catch (err) {
    console.error('启动语音识别失败:', err)
    ElMessage.error('启动语音识别失败')
    stopRecording()
  }
}

// 新增：停止录音
const stopRecording = () => {
  if (!isRecording.value) return

  try {
    if (recognition.value) {
      recognition.value.stop()
    }
  } catch (err) {
    console.error('停止语音识别失败:', err)
  }

  isRecording.value = false

  // 清除超时计时器
  if (recordingTimeout.value) {
    clearTimeout(recordingTimeout.value)
    recordingTimeout.value = null
  }
}

// 新增：语音按钮按下和释放处理
const handleVoiceButtonDown = () => {
  startRecording()
}

const handleVoiceButtonUp = () => {
  userInitiatedStop.value = true // 设置为用户主动停止
  stopRecording()
}

// 新增：提示词优化
const optimizePrompt = async () => {
  // 如果输入为空，不执行优化
  if (userInput.value.trim() === '') {
    ElMessage.warning('请先输入内容再优化')
    return
  }

  // 设置正在优化状态
  isOptimizingPrompt.value = true

  try {
    // 调用qwenAI.js中的优化方法
    const optimizedPrompt = await optimizePromptAPI(userInput.value,userData.value);

    // 更新输入框内容为优化后的提示词
    userInput.value = optimizedPrompt.trim();
    isInputEmpty.value = !userInput.value.trim();

    // 手动调整高度以适应新内容
    adjustTextareaHeight();

    ElMessage.success('提示词已优化');
  } catch (error) {
    console.error('优化提示词失败:', error);
    ElMessage.error('优化失败，请重试');
  } finally {
    isOptimizingPrompt.value = false;
  }
}
const userData = ref({})
// 初始化
onMounted(async () => {
  // 初始化particles.js
  initParticles();

  // 初始化语音识别
  initSpeechRecognition();
  //获取用户信息中的用户名，个人信息
  const res = await getCurrentUser()

  userData.value = {
    username: res.username,
    //获取对象中属性值不为空的对象
    personalInfo: Object.fromEntries(
        Object.entries(res.personalInfo).filter(([_, value]) => {
            return value !== "" && (Array.isArray(value) ? value.length > 0 : true);
        })
    )
  }
});
</script>

<template>
  <div class="home-container">
    <!-- Particles.js 背景 -->
    <div id="particles-js" ref="particlesContainer" class="particles-container"></div>

    <!-- 顶部标题 -->
    <div class="chat-header">
      <h1>需  要  我  为  您  <span class="highlight">做  什  么</span>?</h1>
      <div class="header-decoration">
        <div class="decoration-circle circle-1"></div>
        <div class="decoration-circle circle-2"></div>
        <div class="decoration-circle circle-3"></div>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-container">
      <div class="chat-input" :class="{ 'is-optimizing': isOptimizingPrompt }">
        <div class="input-wrapper">
          <textarea
            v-model="userInput"
            placeholder="告诉我你想要创建什么..."
            @input="handleInput"
            @keydown.enter.prevent="!isInputEmpty && !isProcessing && sendMessage()"
            :disabled="isOptimizingPrompt"
            class="auto-resize-textarea"
          ></textarea>

          <!-- 优化中加载指示器 -->
          <div v-if="isOptimizingPrompt" class="loading-indicator">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="loading-text">正在优化提示词...</div>
          </div>
        </div>

        <div class="input-actions">
          <button class="project-button" @click="router.push('/new-project')">
            <span>+ 新建项目</span>
          </button>

          <!-- 优化按钮 -->
          <button
            class="tool-button optimize-button"
            @click="optimizePrompt"
            :disabled="isInputEmpty || isProcessing || isOptimizingPrompt"
            :class="{ 'optimizing': isOptimizingPrompt }"
            title="优化提示词"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.7-3.7c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l.8-.8c.5.3 1 .4 1.5.4V15c0 .6.4 1 1 1s1-.4 1-1v-1.7c1.8-.5 3-2.1 3-4.3 0-2.8-2.2-5-5-5S6 6.2 6 9c0 1.4.6 2.7 1.5 3.6l-.2.7zm4.7-7.3c2.2 0 4 1.8 4 4 0 2.1-1.7 3.9-3.8 4l-.2-2c.5-.1 1-.4 1.4-.8.4-.5.6-1.1.6-1.7 0-1.4-1.1-2.5-2.5-2.5S9 6.1 9 7.5c0 .6.2 1.1.6 1.6l-1.3 1.3c-.5-.7-.8-1.6-.8-2.4 0-2.2 1.8-4 4-4z" fill="currentColor"/>
            </svg>
          </button>

          <!-- 语音按钮 -->
          <button
            class="tool-button voice-button"
            :class="{ 'recording': isRecording }"
            @mousedown="handleVoiceButtonDown"
            @mouseup="handleVoiceButtonUp"
            @mouseleave="stopRecording"
            @touchstart="handleVoiceButtonDown"
            @touchend="handleVoiceButtonUp"
            @touchcancel="stopRecording"
            :disabled="isProcessing || isOptimizingPrompt"
          >
            <svg t="1690860982235" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2760" width="20" height="20">
              <path d="M512 614.4c93.866667 0 170.666667-76.8 170.666667-170.666667V256c0-93.866667-76.8-170.666667-170.666667-170.666667S341.333333 162.133333 341.333333 256v187.733333c0 93.866667 76.8 170.666667 170.666667 170.666667z" fill="currentColor" p-id="2761"></path>
              <path d="M682.666667 443.733333c0 93.866667-76.8 170.666667-170.666667 170.666667s-170.666667-76.8-170.666667-170.666667H256c0 128 93.866667 234.666667 213.333333 256v153.6h85.333334v-153.6c119.466667-21.333333 213.333333-128 213.333333-256h-85.333333z" fill="currentColor" p-id="2762"></path>
            </svg>
          </button>

          <button class="send-button" @click="sendMessage" :disabled="isInputEmpty || isProcessing || isOptimizingPrompt">
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
      font-size: 3.2rem;

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

  /* 优化中的状态 */
  &.is-optimizing {
    background: rgba(243, 242, 255, 0.85);
    border-color: rgba(139, 92, 246, 0.3);
    box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
  }

  .input-wrapper {
    position: relative;

    /* Loading指示器 */
    .loading-indicator {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: rgba(243, 242, 255, 0.85);
      backdrop-filter: blur(3px);
      z-index: 2;
      pointer-events: none;

      .loading-text {
        color: rgba(139, 92, 246, 0.8);
        font-size: 0.9rem;
        margin-top: 0.5rem;
      }

      .loading-dots {
        display: flex;
        gap: 0.25rem;

        span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: rgba(139, 92, 246, 0.6);
          display: inline-block;
          animation: loadingDots 1.4s infinite ease-in-out both;

          &:nth-child(1) {
            animation-delay: -0.32s;
          }

          &:nth-child(2) {
            animation-delay: -0.16s;
          }
        }
      }
    }

    .auto-resize-textarea {
      width: 100%;
      padding: 24px;
      border: none;
      resize: none;
      font-size: 1.1rem;
      font-family: inherit;
      min-height: 80px;
      max-height: 300px; // 设置最大高度
      transition: height 0.2s ease; // 平滑过渡效果
      background: transparent;
      color: #4c1d95;
      overflow-y: auto; // 超出时显示垂直滚动条

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

      &:disabled {
        color: rgba(76, 29, 149, 0.6);
        cursor: not-allowed;
      }

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: rgba(139, 92, 246, 0.05);
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(139, 92, 246, 0.2);
        border-radius: 3px;

        &:hover {
          background: rgba(139, 92, 246, 0.3);
        }
      }
    }
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

    &:disabled {
      color: rgba(76, 29, 149, 0.6);
      cursor: not-allowed;
    }
  }

  .input-actions {
    display: flex;
    align-items: center;
    padding: 16px 24px;
    border-top: 1px solid rgba(139, 92, 246, 0.1);

    .project-button {
      margin-right: auto; // 改为左对齐
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

    // 新增工具按钮样式
    .tool-button {
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      color: #6d28d9;
      padding: 8px;
      border-radius: 12px;
      cursor: pointer;
      margin-right: 10px;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover:not(:disabled) {
        background-color: rgba(139, 92, 246, 0.15);
        border-color: rgba(139, 92, 246, 0.3);
        transform: translateY(-2px);
      }

      &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }

      &.recording {
        color: white;
        background: linear-gradient(135deg, rgba(220, 38, 38, 0.8), rgba(239, 68, 68, 0.8));
        animation: pulse 1s infinite;
      }

      &.optimizing {
        animation: spin 1.5s linear infinite;
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

// 新增动画
@keyframes loadingDots {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

