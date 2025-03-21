<script setup>
import { marked } from 'marked'
import { ref, watch, nextTick, onMounted, defineProps, defineEmits, computed } from 'vue'
import { useQwenAI } from './qwenAI'
import { useAiChatStore } from '@/stores'
import { storeToRefs } from 'pinia'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import { getPageById } from '@/api/page'
import { ElMessage } from 'element-plus'
import { getCurrentUser } from '@/api/user'
const props = defineProps({
  page: {
    type: Object,
    required: true
  }
})

// 添加emit定义
const emit = defineEmits(['update:content'])

const aiChatStore = useAiChatStore()
// 使用获取当前页面聊天记录的函数
const chatMsgs = computed(() => aiChatStore.getCurrentPageChatMsgs())
const { addChatMsg, setSelectedElement, setIsRequireAIChange, setIsAllowSelectElement } = aiChatStore
const { selectedElement, iframeEntrance, currentPageId, isRequireAIChange } = storeToRefs(aiChatStore)
const userInput = ref('')
const sendBtn = ref(null)
const chatContainer = ref(null)
const isInputEmpty = ref(true) // 新增：跟踪输入是否为空
const { getResponse, optimizePrompt: optimizePromptAPI } = useQwenAI()
const isEnlarged = ref(false) // 跟踪输入框是否放大

// 新增：存储代码块折叠状态
const codeFoldStates = ref({})

// 新增：对话上下文，按照通义千问API要求的格式存储对话历史
const chatContext = ref([])

// 新增：语音识别相关状态
const isRecording = ref(false)
const recognition = ref(null)
const recordingTimeout = ref(null)

// 新增：记录语音识别开始前的文本
const preSpeechText = ref('')

// 新增：标记是否用户主动停止录音
const userInitiatedStop = ref(false)

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
      const textarea = document.getElementById('user-input')
      if (textarea) {
        // 添加空格分隔符，只有当初始文本不为空时
        const separator = preSpeechText.value && preSpeechText.value.trim() ? ' ' : ''
        // 使用初始文本作为基础，而不是当前文本
        textarea.value = preSpeechText.value + separator + transcript
        userInput.value = textarea.value
        isInputEmpty.value = !userInput.value.trim()
      }
    }

    // 修改：监听识别结束
    recognition.value.onend = () => {
      console.log('语音识别会话结束')
      // 如果不是用户主动停止且仍在录音状态，则重新启动
      if (!userInitiatedStop.value && isRecording.value) {
        console.log('自动重启语音识别')
        try {
          // 重要修改：在重新启动前，保存当前文本作为新的初始文本
          const textarea = document.getElementById('user-input')
          if (textarea) {
            preSpeechText.value = textarea.value || ''
            console.log('更新初始文本为:', preSpeechText.value)
          }

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

// 修改：开始录音
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
    const textarea = document.getElementById('user-input')
    preSpeechText.value = textarea ? textarea.value : ''

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

// 修改：停止录音
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

// 修改：语音按钮按下和释放处理
const handleVoiceButtonDown = () => {
  startRecording()
}

const handleVoiceButtonUp = () => {
  userInitiatedStop.value = true // 设置为用户主动停止
  stopRecording()
}

// 新增：初始化聊天上下文，只取最新10条消息
const initChatContext = () => {
  // 清空现有上下文
  chatContext.value = []

  // 获取最新的10条消息
  const recentMessages = [...chatMsgs.value].slice(-10)

  // 将消息转换为通义千问API所需的格式并添加到上下文
  recentMessages.forEach(msg => {
    chatContext.value.push({
      role: msg.role, // 'user' 或 'assistant'
      content: msg.content || msg.message // 优先使用content，因为它包含原始文本
    })
  })

  console.log('已初始化聊天上下文，包含最新的', chatContext.value.length, '条消息')
}

// 新增：切换消息中所有代码块的折叠状态
const toggleCodeFold = (msgId) => {
  // 获取该消息的折叠状态，如果不存在则初始化为false
  if (codeFoldStates.value[msgId] === undefined) {
    codeFoldStates.value[msgId] = true // 初始点击时设为已折叠
  } else {
    codeFoldStates.value[msgId] = !codeFoldStates.value[msgId] // 切换折叠状态
  }

  // 应用折叠状态
  nextTick(() => {
    const msg = document.querySelector(`.ai-message[data-id="${msgId}"]`)
    if (msg) {
      const codeBlocks = msg.querySelectorAll('pre code')
      codeBlocks.forEach(block => {
        if (codeFoldStates.value[msgId]) {
          block.classList.add('code-folded')
        } else {
          block.classList.remove('code-folded')
        }
      })
    }
  })
}

// 修改监听输入变化函数
const handleInput = () => {
  // 直接使用v-model双向绑定，这里只需更新空状态
  isInputEmpty.value = !userInput.value.trim()
}

const userData = ref({
  username: '',
  personalInfo: {}
})

onMounted(async () => {
  scrollToBottom()

  // 先加载聊天记录
  if (aiChatStore.currentPageId) {
    console.log('开始加载聊天记录')
    await aiChatStore.loadPageChatMessages(aiChatStore.currentPageId)
    console.log('聊天记录加载完成')

    // 初始化聊天上下文，只取最新10条
    initChatContext()
  }

  // 检查是否有初始消息需要发送
  const initialMsg = aiChatStore.getAndClearInitialMessage()
  if (initialMsg) {
    // 将初始消息设置到输入框
    userInput.value = initialMsg
    // 自动发送消息
    nextTick(() => {
      sendMessage()
    })
  }

  // 添加输入事件监听
  const textarea = document.getElementById('user-input')
  if (textarea) {
    textarea.addEventListener('input', handleInput)
  }
  hljs.highlightAll()

  // 初始化语音识别
  initSpeechRecognition()

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
  console.log('用户信息:', userData.value)
})

// 添加滚动到底部的函数
const scrollToBottom = async () => {
  await nextTick() // 等待 DOM 更新
  const container = chatContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}

// 监听消息列表变化，自动滚动到底部
watch(
  chatMsgs,
  () => {
    scrollToBottom()
  },
  {
    deep: true,
    immediate: true,
  },
)

const sendMessage = async () => {
  let trueMessage = ''

  // 如果输入为空，不执行发送
  if (userInput.value.trim() === '') {
    return
  }

  // 保存当前输入内容
  const currentInput = userInput.value
  console.log('currentInput', currentInput)

  try {
    // 禁用发送按钮
    if (sendBtn.value) {
      sendBtn.value.disabled = true
    }

    // 确保有pageId
    if (!aiChatStore.currentPageId) {
      throw new Error('页面ID未设置')
    }

    // 如果没有conversationId，先加载一次聊天记录
    if (!aiChatStore.currentConversationId) {
      console.log('尝试重新加载聊天记录以获取会话ID')
      await aiChatStore.loadPageChatMessages(aiChatStore.currentPageId)
    }

    // 修改：直接清空userInput，不再单独操作DOM
    userInput.value = ''
    isInputEmpty.value = true // 更新输入状态为空

    if (selectedElement.value && isRequireAIChange.value) {
      trueMessage = `${currentInput} 。待修改组件代码如下：${selectedElement.value.outerHTML}`
    } else {
      trueMessage = currentInput
    }

    // 添加用户消息到UI
    const userMsgId = Date.now()
    addChatMsg({
      id: userMsgId,
      message: currentInput,
      content: trueMessage,
      role: 'user',
      selectedElement: null,
      newElement: null,
      type: 'chat',
    })

    // 添加用户消息到上下文
    chatContext.value.push({
      role: 'user',
      content: trueMessage
    })

    // 创建AI回复消息，初始为空，将通过流式更新
    const aiMsgId = Date.now() + 1
    addChatMsg({
      id: aiMsgId,
      message: '思考中...', // 初始显示思考中
      content: '',
      role: 'assistant',
      selectedElement: null,
      newElement: null,
      type: 'chat',
    })

    // 尝试使用API发送消息
    try {
      // 发送用户消息到API
      await aiChatStore.sendMessageToApi(trueMessage, true)
      console.log('用户消息已发送到API')
    } catch (error) {
      console.error('通过API发送消息失败:', error)
      ElMessage.error('消息发送失败，但会继续尝试获取AI回复')
    }

    // 获取流式响应，传入完整的对话上下文
    console.log('发送请求到AI，包含上下文消息数:', chatContext.value.length)
    const completion = await getResponse(chatContext.value, userData.value)

    // 用于累积完整响应的变量
    let fullResponse = ''

    // 处理流式响应
    for await (const chunk of completion) {
      // 如果stream_options.include_usage为true，则最后一个chunk的choices字段为空数组，需要跳过
      if (Array.isArray(chunk.choices) && chunk.choices.length > 0) {
        const contentDelta = chunk.choices[0].delta.content || ''
        fullResponse += contentDelta

        // 更新UI上的消息内容 - 实时渲染markdown
        const msgIndex = chatMsgs.value.findIndex((msg) => msg.id === aiMsgId)
        if (msgIndex !== -1) {
          chatMsgs.value[msgIndex].message = marked.parse(fullResponse)
          chatMsgs.value[msgIndex].content = fullResponse // 存储原始内容
        }
      }
    }

    // 将AI回复添加到上下文
    chatContext.value.push({
      role: 'assistant',
      content: fullResponse
    })

    // 解析AI响应中的HTML和CSS
    const newElement = parseAIResponse(marked.parse(fullResponse))

    // 确定消息类型
    let type
    if (selectedElement.value && isRequireAIChange.value) {
      type = 'modify_component'
    } else if (newElement.html !== '') {
      // 检查HTML内容是否包含完整的HTML文档结构
      const isFullPage = newElement.html.includes('<!DOCTYPE html>') ||
                         (newElement.html.includes('<html') &&
                          newElement.html.includes('<head') &&
                          newElement.html.includes('<body'));

      // 检查用户输入是否包含生成网站/网页的关键词
      const pageKeywords = ['网站', '网页', '首页', '页面', '官网', '门户', 'website', 'webpage', 'page', 'site'];
      const userInputHasPageKeywords = pageKeywords.some(keyword =>
        currentInput.toLowerCase().includes(keyword.toLowerCase())
      );

      // 如果HTML内容包含完整的HTML文档结构，或者用户输入包含生成网站/网页的关键词
      if (isFullPage || userInputHasPageKeywords) {
        type = 'generate_page';
        console.log('识别为生成页面请求:', { isFullPage, userInputHasPageKeywords });
      } else {
        type = 'generate_component';
        console.log('识别为生成组件请求');
      }
    } else {
      type = 'chat'
    }

    // 更新最终消息类型和内容
    const msgIndex = chatMsgs.value.findIndex((msg) => msg.id === aiMsgId)
    if (msgIndex !== -1) {
      chatMsgs.value[msgIndex].type = type
      chatMsgs.value[msgIndex].newElement = newElement
      chatMsgs.value[msgIndex].selectedElement = selectedElement.value
    }

    // 将完整的AI回复发送到后端存储
    try {
      await aiChatStore.saveAiResponse(fullResponse, type, newElement)
      console.log('AI回复已保存到数据库')
    } catch (error) {
      console.error('保存AI回复到数据库失败:', error)
    }

    // 只有生成页面类型时才自动渲染
    if (type === 'generate_page') {
      console.log('检测到生成页面类型，自动渲染页面')
      renderGeneratedPage(chatMsgs.value[msgIndex].id)
    } else if (type === 'modify_component') {
      if(chatMsgs.value[msgIndex].newElement.html){
        insertElement(chatMsgs.value[msgIndex].id)
        console.log('检测到修改组件类型,AI已自动修改组件代码')
      }
    }

    // 应用代码高亮
    nextTick(() => {
      const container = chatContainer.value
      if (container) {
        const aiMessages = container.querySelectorAll('.ai-message')
        if (aiMessages.length > 0) {
          // 获取最后一个AI消息
          const latestMsg = aiMessages[aiMessages.length - 1]
          // 查找代码块并高亮
          const codeBlocks = latestMsg.querySelectorAll('pre code')
          if (codeBlocks.length > 0) {
            codeBlocks.forEach((block) => {
              hljs.highlightElement(block)
            })
            console.log('成功高亮代码块:', codeBlocks.length)
          } else {
            console.log('最新消息中未找到代码块')
          }
        } else {
          console.log('AI消息中未产生代码块')
        }
      }
    })
  } catch (error) {
    console.log(error)
    throw error
  } finally {
    //启用发送按钮
    if (sendBtn.value) {
      sendBtn.value.disabled = false
    }
  }
  console.log('msg',chatMsgs.value)
}

//提取回答中的组件代码
function parseAIResponse(response) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(response, 'text/html')

  // 提取 HTML 部分
  const htmlElement = doc.querySelector('.language-html')
  let htmlContent = ''
  let cssContent = ''
  let jsContent = ''
  if (!htmlElement) {
    return { html: '', css: '', js: '' }
  }
  if (htmlElement.textContent.trim().includes('<html')) {
    // 保存完整的HTML内容
    htmlContent = htmlElement.textContent.trim()

    // 创建临时容器用于提取style和script，不影响原始HTML内容
    const tempContainer = document.createElement('div')
    tempContainer.innerHTML = htmlContent

    // 提取所有style标签内容（保留标签）
    const styleElements = tempContainer.querySelectorAll('style')
    if (styleElements.length > 0) {
      cssContent = Array.from(styleElements).map(el => {
        // 创建新的div来获取outerHTML，确保获取完整的标签
        const tempDiv = document.createElement('div')
        tempDiv.appendChild(el.cloneNode(true))
        return tempDiv.innerHTML
      }).join('\n\n')
    }

    // 提取所有script标签内容（保留标签）
    const scriptElements = tempContainer.querySelectorAll('script')
    if (scriptElements.length > 0) {
      jsContent = Array.from(scriptElements).map(el => {
        // 创建新的div来获取outerHTML，确保获取完整的标签
        const tempDiv = document.createElement('div')
        tempDiv.appendChild(el.cloneNode(true))
        return tempDiv.innerHTML
      }).join('\n\n')
    }
  } else {
    htmlContent = htmlElement.textContent.trim()
    // 尝试从单独的语言块中提取内容（兼容旧的方式）
    // 提取 CSS 部分
    const cssElement = doc.querySelector('.language-css')
    if (cssElement) {
      const cssText = cssElement.textContent.trim()
      // 如果内容不为空且不包含style标签，则添加标签
      if (cssText && !cssText.includes('<style')) {
        cssContent = `<style>\n${cssText}\n</style>`
      } else {
        cssContent = cssText
      }
    }

    // 提取 JS 部分
    const jsElement = doc.querySelector('.language-js')
    if (jsElement) {
      const jsText = jsElement.textContent.trim()
      // 如果内容不为空且不包含script标签，则添加标签
      if (jsText && !jsText.includes('<script')) {
        // 分段处理script标签，避免与Vue组件结构冲突
        jsContent = '<' + 'script' + '>\n' + jsText + '\n</' + 'script' + '>'
      } else {
        jsContent = jsText
      }
    }
  }

  console.log('提取结果:', { html: htmlContent, css: cssContent, js: jsContent })
  return { html: htmlContent, css: cssContent, js: jsContent }
}

const insertElement = (id) => {
  const msg = chatMsgs.value.find((item) => item.id === id)
  if (!msg || !msg.selectedElement || !iframeEntrance.value) return

  console.log(msg.newElement)

  //关闭ai修改
  setIsRequireAIChange(false)
  //插入元素
  //移除掉msg.newElement.html里的special-hover-highlight类名
  // 使用正则表达式匹配独立的special-hover-highlight类名，避免影响其他包含该字符串的类名
  msg.newElement.html = msg.newElement.html.replace(/\bspecial-hover-highlight\b/g, '')
  msg.selectedElement.outerHTML = msg.newElement.html

  //插入css
  if (iframeEntrance.value && iframeEntrance.value.head) {
    const styleTag = iframeEntrance.value.createElement('style')
    styleTag.textContent = msg.newElement.css
    iframeEntrance.value.head.appendChild(styleTag)
  }
  //插入js
  if (iframeEntrance.value && iframeEntrance.value.body) {
    const scriptTag = iframeEntrance.value.createElement('script')
    scriptTag.textContent = msg.newElement.js
    iframeEntrance.value.body.appendChild(scriptTag)
  }

  //清空选中元素
  setSelectedElement(null)
  //关闭元素选择
   setIsAllowSelectElement(false)

}

// 新增：渲染生成的页面
const renderGeneratedPage = (id) => {
  const msg = chatMsgs.value.find((item) => item.id === id)
  if (!msg || !msg.newElement || !iframeEntrance.value) return

  console.log('渲染生成的页面:', msg.newElement)

  try {
    // 使用工具函数构建完整的HTML文档
    const fullHtmlContent = msg.newElement.html

    // 如果在页面设计视图中，更新页面内容
    if (props.page) {
      // 使用emit事件通知父组件更新内容
      emit('update:content', fullHtmlContent)
    }

    // 提示用户保存操作，使用更显眼的提示
    ElMessage({
      message: '页面内容已更新，请点击右上角"保存"按钮永久保存更改，否则退出后将丢失！',
      type: 'warning',
      duration: 8000, // 显示更长时间
      showClose: true // 允许手动关闭
    })

    console.log('页面渲染成功，并已更新编辑器内容')
  } catch (error) {
    console.error('渲染页面时出错:', error)
  }
}

// // 监听消息类型变化，自动渲染生成的页面
// watch(
//   chatMsgs,
//   (newMsgs, oldMsgs) => {
//     // 检查是否有新的消息被添加或消息类型被更新
//     if (newMsgs.length > 0) {
//       const latestMsg = newMsgs[newMsgs.length - 1]

//       // 如果最新消息是AI助手的回复，且类型是generate_page，自动渲染
//       if (latestMsg.role === 'assistant' && latestMsg.type === 'generate_page' && latestMsg.newElement?.html) {
//         // 确保消息已经完全接收（通过检查newElement是否存在）
//         if (latestMsg.newElement) {
//           console.log('检测到页面生成请求，准备自动渲染')
//           // 使用nextTick确保DOM已更新
//           nextTick(() => {
//             renderGeneratedPage(latestMsg.id)
//           })
//         }
//       }
//     }
//   },
//   { deep: true }
// )


//放大输入框
const enlargeInput = () => {
  isEnlarged.value = !isEnlarged.value

  nextTick(() => {
    const textarea = document.getElementById('user-input')
    if (textarea) {
      // 如果放大了，自动聚焦
      if (isEnlarged.value) {
        textarea.focus()
      }
    }
    // 滚动到底部
    scrollToBottom()
  })
}

// 添加一个新方法处理prompt优化
const isOptimizingPrompt = ref(false) // 跟踪优化状态

// 优化按钮点击处理方法
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
    const optimizedPrompt = await optimizePromptAPI(userInput.value, userData.value);

    // 更新输入框内容为优化后的提示词
    userInput.value = optimizedPrompt.trim();
    isInputEmpty.value = !userInput.value.trim();

    // 聚焦输入框并触发动画效果
    const textarea = document.getElementById('user-input');
    if (textarea) {
      // 不再需要手动设置textarea.value
      textarea.focus();
      textarea.classList.add('optimized');
      setTimeout(() => {
        textarea.classList.remove('optimized');
      }, 1000);
    }

    ElMessage.success('提示词已优化');
  } catch (error) {
    console.error('优化提示词失败:', error);
    ElMessage.error('优化失败，请重试');
  } finally {
    isOptimizingPrompt.value = false;
  }
}
</script>

<template>
  <div class="chat-box">
    <div id="chat-container" ref="chatContainer" :class="{ 'reduced-height': isEnlarged }">
      <div v-show="chatMsgs.length===0" class="ai-message"> <span class="message-content">hello，{{ userData.username }}，我是智能助手小濑，有什么需要帮助的吗?</span></div>
      <div
        v-for="item in chatMsgs"
        :key="item.id"
        :class="{ 'user-message': item.role === 'user', 'ai-message': item.role === 'assistant' }"
        :data-id="item.id"
      >
        <div v-if="item.role === 'user'" v-html="item.message" class="message-content"></div>

        <div v-if="item.role === 'assistant'" v-html="item.message" class="message-content"></div>
        <div v-if="item.role === 'assistant' && item.type !== 'chat'" class="tools">
          <!-- 修改组件按钮，仅在修改组件类型时启用 -->
          <!-- <button v-if="item.type === 'modify_component'" @click="insertElement(item.id)">
            <svg
              t="1740816043564"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="38343"
              width="20"
              height="20"
            >
              <path
                d="M938.666667 42.666667a42.666667 42.666667 0 0 1 42.666666 42.666666v853.333334a42.666667 42.666667 0 0 1-42.666666 42.666666H85.333333a42.666667 42.666667 0 0 1-42.666666-42.666666V85.333333a42.666667 42.666667 0 0 1 42.666666-42.666666h853.333334z m-42.666667 85.333333H128v768h768V128zM362.666667 213.333333a21.333333 21.333333 0 0 1 21.333333 21.333334V298.666667h42.666667a42.666667 42.666667 0 0 1 42.666666 42.666666v170.666667a42.666667 42.666667 0 0 1-42.666666 42.666667H384v234.666666a21.333333 21.333333 0 0 1-21.333333 21.333334h-42.666667a21.333333 21.333333 0 0 1-21.333333-21.333334V554.666667H256a42.666667 42.666667 0 0 1-42.666667-42.666667V341.333333a42.666667 42.666667 0 0 1 42.666667-42.666666h42.666667V234.666667a21.333333 21.333333 0 0 1 21.333333-21.333334h42.666667z m341.333333 0a21.333333 21.333333 0 0 1 21.333333 21.333334V469.333333h42.666667a42.666667 42.666667 0 0 1 42.666667 42.666667v170.666667a42.666667 42.666667 0 0 1-42.666667 42.666666h-42.666667v64a21.333333 21.333333 0 0 1-21.333333 21.333334h-42.666667a21.333333 21.333333 0 0 1-21.333333-21.333334V725.333333h-42.666667a42.666667 42.666667 0 0 1-42.666666-42.666666v-170.666667a42.666667 42.666667 0 0 1 42.666666-42.666667h42.666667V234.666667a21.333333 21.333333 0 0 1 21.333333-21.333334h42.666667z m21.333333 341.333334h-85.333333v85.333333h85.333333v-85.333333zM384 384H298.666667v85.333333h85.333333V384z"
                fill="#707070"
                p-id="38344"
              ></path>
            </svg>
          </button> -->

          <!-- 渲染页面按钮，仅在生成页面类型时启用 -->
          <button v-if="item.type === 'generate_page'" @click="renderGeneratedPage(item.id)">
            <svg
              t="1740816043564"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="38343"
              width="20"
              height="20"
            >
              <path
                d="M512 42.666667C270.933333 42.666667 85.333333 228.266667 85.333333 469.333333s185.6 426.666667 426.666667 426.666667 426.666667-185.6 426.666667-426.666667S753.066667 42.666667 512 42.666667z m0 810.666666c-211.2 0-384-172.8-384-384s172.8-384 384-384 384 172.8 384 384-172.8 384-384 384z"
                fill="#707070"
                p-id="38344"
              ></path>
              <path
                d="M426.666667 341.333333v341.333334l256-170.666667z"
                fill="#707070"
                p-id="38345"
              ></path>
            </svg>
          </button>

          <!-- 新增：代码折叠/展开按钮，检测消息中是否有代码块 -->
          <button v-if="item.message && item.message.includes('<pre><code')" @click="toggleCodeFold(item.id)">
            <svg
              t="1740816369391"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="38943"
              width="20"
              height="20"
            >
              <path
                d="M857.088 224.256H167.936c-11.264 0-20.48-9.216-20.48-20.48V171.52c0-11.264 9.216-20.48 20.48-20.48h689.152c11.264 0 20.48 9.216 20.48 20.48v32.256c0 11.264-9.216 20.48-20.48 20.48zM857.088 532.48H167.936c-11.264 0-20.48-9.216-20.48-20.48v-32.256c0-11.264 9.216-20.48 20.48-20.48h689.152c11.264 0 20.48 9.216 20.48 20.48V512c0 11.264-9.216 20.48-20.48 20.48zM857.088 840.704H167.936c-11.264 0-20.48-9.216-20.48-20.48v-32.256c0-11.264 9.216-20.48 20.48-20.48h689.152c11.264 0 20.48 9.216 20.48 20.48v32.256c0 11.264-9.216 20.48-20.48 20.48z"
                fill="#707070"
                p-id="38944"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div id="input-container" :class="{ enlarged: isEnlarged }">
      <div class="input-tools">
        <svg
          t="1740827252736"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="4053"
          width="20 "
          height="20"
          @click="enlargeInput"
        >
          <path
            d="M872.3 899.1h-718c-14.3 0-26-11.7-26-26v-718c0-14.3 11.7-26 26-26h718c14.3 0 26 11.7 26 26v718c0 14.3-11.6 26-26 26z m-711.9-32h706v-706h-706v706z"
            fill=""
            p-id="4054"
          ></path>
          <path
            d="M252.8 249.9l166.1 2.1c8.8 0.1 15.9 7.4 15.8 16.2-0.1 8.8-7.4 15.9-16.2 15.8l-134.1-1.7-1.7 134.1c-0.1 8.8-7.4 15.9-16.2 15.8-8.8-0.1-15.9-7.4-15.8-16.2l2.1-166.1z"
            fill=""
            p-id="4055"
          ></path>
          <path
            d="M301.4 278l180.4 184.6c6.2 6.3 6.1 16.5-0.3 22.6-6.3 6.2-16.5 6.1-22.6-0.3L278.5 300.4c-6.2-6.3-6.1-16.5 0.3-22.6 6.3-6.2 16.4-6.1 22.6 0zM756.6 590.7c8.8 0 16 7.2 15.9 16.1l-0.5 166-166.1-0.5c-8.8 0-16-7.2-15.9-16.1 0-8.8 7.2-16 16.1-15.9l134.1 0.4 0.4-134.1c0-8.8 7.2-16 16-15.9z"
            fill=""
            p-id="4056"
          ></path>
          <path
            d="M564.7 542.1L761 737.8l-22.6 22.7-196.2-195.8c-6.3-6.2-6.3-16.4 0-22.6 6.2-6.3 16.3-6.3 22.5 0z"
            fill=""
            p-id="4057"
          ></path>
        </svg>
      </div>
      <div class="input-box" :class="{ 'is-optimizing': isOptimizingPrompt }">
        <div class="input-wrapper">
          <textarea
            id="user-input"
            v-model="userInput"
            placeholder="输入你的问题..."
            @keydown.enter.prevent="!isInputEmpty && sendMessage()"
            :disabled="isOptimizingPrompt"
            @input="handleInput"
          ></textarea>
          <div v-if="isOptimizingPrompt" class="loading-indicator">
            <div class="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <div class="loading-text">正在优化提示词...</div>
          </div>
        </div>

        <div class="buttons-wrapper">
          <!-- 优化按钮 - 修改为使用首页样式 -->
          <button
            id="optimize-btn"
            class="tool-button optimize-button"
            :class="{ 'optimizing': isOptimizingPrompt }"
            @click="optimizePrompt"
            :disabled="isInputEmpty || isOptimizingPrompt"
            title="优化提示词"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 16c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm-4.7-3.7c-.4.4-.4 1 0 1.4.4.4 1 .4 1.4 0l.8-.8c.5.3 1 .4 1.5.4V15c0 .6.4 1 1 1s1-.4 1-1v-1.7c1.8-.5 3-2.1 3-4.3 0-2.8-2.2-5-5-5S6 6.2 6 9c0 1.4.6 2.7 1.5 3.6l-.2.7zm4.7-7.3c2.2 0 4 1.8 4 4 0 2.1-1.7 3.9-3.8 4l-.2-2c.5-.1 1-.4 1.4-.8.4-.5.6-1.1.6-1.7 0-1.4-1.1-2.5-2.5-2.5S9 6.1 9 7.5c0 .6.2 1.1.6 1.6l-1.3 1.3c-.5-.7-.8-1.6-.8-2.4 0-2.2 1.8-4 4-4z" fill="currentColor"/>
            </svg>
          </button>

          <!-- 语音输入按钮 - 修改为使用首页样式 -->
          <button
            id="voice-btn"
            class="tool-button voice-button"
            :class="{ 'recording': isRecording }"
            @mousedown="handleVoiceButtonDown"
            @mouseup="handleVoiceButtonUp"
            @mouseleave="stopRecording"
            @touchstart="handleVoiceButtonDown"
            @touchend="handleVoiceButtonUp"
            @touchcancel="stopRecording"
            :disabled="isOptimizingPrompt"
          >
            <svg t="1690860982235" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="2760" width="20" height="20">
              <path d="M512 614.4c93.866667 0 170.666667-76.8 170.666667-170.666667V256c0-93.866667-76.8-170.666667-170.666667-170.666667S341.333333 162.133333 341.333333 256v187.733333c0 93.866667 76.8 170.666667 170.666667 170.666667z" fill="currentColor" p-id="2761"></path>
              <path d="M682.666667 443.733333c0 93.866667-76.8 170.666667-170.666667 170.666667s-170.666667-76.8-170.666667-170.666667H256c0 128 93.866667 234.666667 213.333333 256v153.6h85.333334v-153.6c119.466667-21.333333 213.333333-128 213.333333-256h-85.333333z" fill="currentColor" p-id="2762"></path>
            </svg>
          </button>

          <!-- 发送按钮 - 修改为使用首页样式 -->
          <button id="send-btn" ref="sendBtn" @click="sendMessage" :disabled="isInputEmpty || isOptimizingPrompt" class="send-button">
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.chat-box {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.02) 0%,
    rgba(236, 72, 153, 0.02) 50%,
    rgba(139, 92, 246, 0.02) 100%
  );
  position: relative;

  #chat-container {
    width: 100%;
    height: 80%;
    overflow-y: auto;
    gap: 20px;
    transition: height 0.3s ease;
    padding: 1rem;

    &.reduced-height {
      height: 45%;
    }

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(139, 92, 246, 0.2);
      border-radius: 3px;

      &:hover {
        background: rgba(139, 92, 246, 0.3);
      }
    }

    :deep(pre) {
      position: relative;
      background: rgba(255, 255, 255, 0.6) !important;
      backdrop-filter: blur(8px);
      border: 1px solid rgba(139, 92, 246, 0.1);
      border-radius: 12px;
      margin: 1rem 0;

      code {
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
        line-height: 1.5;

        &.code-folded {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
          max-height: 24px;
          position: relative;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          transition: all 0.3s ease;

          &::after {
            content: "...（已折叠）";
            color: rgba(139, 92, 246, 0.6);
            margin-left: 0.5rem;
            font-style: italic;
          }
        }
      }
    }
  }

  #input-container {
    width: 100%;
    height: 20%;
    position: relative;
    transition: all 0.3s ease;
    padding: 0 1rem 1rem;

    &.enlarged {
      height: 55%;
      z-index: 10;

      .input-box {
        height: calc(100% - 30px);

        textarea {
          height: 90%;
        }
      }
    }

    .input-tools {
      width: 100%;
      height: 30px;
      padding: 0 0.5rem;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      margin-bottom: 0.5rem;

      .icon {
        cursor: pointer;
        transition: all 0.3s ease;
        color: rgba(139, 92, 246, 0.6);

        &:hover {
          transform: scale(1.1);
          color: rgba(139, 92, 246, 0.8);
        }
      }
    }

    .input-box {
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: 18px;
      position: relative;
      width: 100%;
      height: calc(100% - 30px);
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(12px);
      box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;

      &:hover:not(.is-optimizing) {
        border-color: rgba(139, 92, 246, 0.3);
        box-shadow: 0 6px 24px -4px rgba(139, 92, 246, 0.12);
      }

      /* 优化中的状态 */
      &.is-optimizing {
        background: rgba(243, 242, 255, 0.95);
        border-color: rgba(139, 92, 246, 0.3);
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.1);
      }

      .input-wrapper {
        flex: 1;
        position: relative;
        padding: 0.75rem 1rem 0.5rem;

        textarea {
          width: 100%;
          height: 100%;
          font-size: 0.95rem;
          font-weight: 400;
          color: rgba(76, 29, 149, 0.9);
          line-height: 1.5;
          padding: 0.5rem;
          resize: none;
          border: none;
          outline: none;
          background: transparent;
          border-radius: 12px;
          transition: all 0.3s ease;

          &::placeholder {
            color: rgba(139, 92, 246, 0.4);
          }

          &:disabled {
            color: rgba(76, 29, 149, 0.6);
            cursor: not-allowed;
          }

          &.optimized {
            animation: highlight 1s ease;
          }
        }

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
          border-radius: 16px;
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
      }

      /* 按钮容器 */
      .buttons-wrapper {
        display: flex;
        justify-content: flex-end;
        padding: 0.5rem 0.75rem;
        gap: 0.5rem;
        background: rgba(249, 248, 255, 0.8);
        border-top: 1px solid rgba(139, 92, 246, 0.08);
      }

      /* 工具按钮样式 - 使用首页样式 */
      .tool-button {
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.2);
        color: #6d28d9;
        padding: 8px;
        border-radius: 12px;
        cursor: pointer;
        margin-right: 0; /* 移除margin-right，使用gap代替 */
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

      /* 发送按钮样式 - 使用首页样式 */
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
        width: 36px;
        height: 36px;

        &:hover:not(:disabled) {
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

  .user-message {
    display: flex;
    flex-direction: row-reverse;
    width: 95%;
    margin: 0 auto 1.5rem;

    .message-content {
      max-width: 80%;
      font-size: 0.95rem;
      padding: 1rem 1.25rem;
      border-radius: 16px 16px 4px 16px;
      background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));
      color: white;
      box-shadow: 0 4px 16px -4px rgba(139, 92, 246, 0.3);
      line-height: 1.5;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg,
          rgba(255, 255, 255, 0.1),
          rgba(255, 255, 255, 0.05)
        );
        border-radius: inherit;
      }
    }
  }

  .ai-message {
    display: flex;
    flex-direction: row;
    width: 95%;
    margin: 0 auto 2rem;
    position: relative;

    .message-content {
      max-width: 100%;
      font-size: 0.95rem;
      padding: 1rem 1.25rem;
      border-radius: 16px 16px 16px 4px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(139, 92, 246, 0.15);
      color: rgba(76, 29, 149, 0.9);
      box-shadow: 0 4px 20px -4px rgba(139, 92, 246, 0.08);
      line-height: 1.5;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg,
          rgba(139, 92, 246, 0.05),
          rgba(236, 72, 153, 0.05)
        );
        border-radius: inherit;
        pointer-events: none;
      }
    }

    .tools {
      position: absolute;
      bottom: -2rem;
      left: 1.25rem;
      display: flex;
      gap: 0.75rem;
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.3s ease;

      button {
        cursor: pointer;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(139, 92, 246, 0.15);
        padding: 0.375rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        transition: all 0.3s ease;
        box-shadow: 0 2px 8px -2px rgba(139, 92, 246, 0.1);

        &:hover {
          background: rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.15);
          border-color: rgba(139, 92, 246, 0.3);

          .icon {
            color: rgba(139, 92, 246, 0.9);
            transform: scale(1.1);
          }
        }

        .icon {
          color: rgba(139, 92, 246, 0.6);
          transition: all 0.3s ease;
        }
      }
    }

    &:hover .tools {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* 动画效果 */
@keyframes highlight {
  0% { background-color: rgba(139, 92, 246, 0.1); }
  100% { background-color: transparent; }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.4);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 6px rgba(220, 38, 38, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(220, 38, 38, 0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes loadingDots {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 移除不再需要的控制按钮样式 */
// .control-btn 样式被移除，使用 .tool-button 和 .send-button 代替
</style>
