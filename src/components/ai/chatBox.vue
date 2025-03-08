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
const { addChatMsg, setSelectedElement, setIsRequireAIChange, setCurrentPageId } = aiChatStore
const { selectedElement, iframeEntrance } = storeToRefs(aiChatStore)
const userInput = ref('')
const sendBtn = ref(null)
const chatContainer = ref(null)
const isInputEmpty = ref(true) // 新增：跟踪输入是否为空
const { getResponse } = useQwenAI()
const isEnlarged = ref(false) // 跟踪输入框是否放大

// 新增：存储代码块折叠状态
const codeFoldStates = ref({})

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

// 监听输入变化
const handleInput = (event) => {
  userInput.value = event.target.value
  isInputEmpty.value = !userInput.value.trim() // 更新输入状态
}

onMounted(() => {
  scrollToBottom()

  // 设置当前页面ID
  if (props.page && props.page._id) {
    setCurrentPageId(props.page._id)
  }

  // 添加输入事件监听
  const textarea = document.getElementById('user-input')
  if (textarea) {
    textarea.addEventListener('input', handleInput)
  }
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

  // 立即清空输入框
  document.getElementById('user-input').value = ''
  userInput.value = ''
  isInputEmpty.value = true // 更新输入状态为空

  if (selectedElement.value) {
    trueMessage = `${currentInput} 。待修改组件代码如下：${selectedElement.value.outerHTML}`
  } else {
    trueMessage = currentInput
  }
  try {
    //禁用发送按钮
    sendBtn.value.disabled = true

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

    // 创建AI回复消息，初始为空，将通过流式更新
    const aiMsgId = Date.now() + 1
    addChatMsg({
      id: aiMsgId,
      message: '', // 初始为空，将通过流式更新
      content: '',
      role: 'assistant',
      selectedElement: null,
      newElement: null,
      type: 'chat',
    })

    // 尝试使用API发送消息
    try {
      // 只发送用户消息，先不创建AI回复
      await aiChatStore.sendMessageToApi(trueMessage, true) // 添加参数表示只发送用户消息
    } catch (error) {
      console.error('通过API发送消息失败，使用本地模型:', error)
    }

    // 获取流式响应
    const completion = await getResponse(trueMessage)

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
          chatMsgs.value[msgIndex].content = marked.parse(fullResponse)
        }
      }
    }

    // 解析AI响应中的HTML和CSS
    const newElement = parseAIResponse(marked.parse(fullResponse))

    // 确定消息类型
    let type
    if (selectedElement.value) {
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

    const msgIndex = chatMsgs.value.findIndex((msg) => msg.id === aiMsgId)//
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
    renderGeneratedPage(chatMsgs.value[msgIndex].id)
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
          console.log('未找到AI消息')
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

    // // 如果没有.language-html，则尝试从整个响应中提取
    // if (!htmlContent) {
    //   const tempDoc = parser.parseFromString(response, 'text/html')
    //   const allStyles = tempDoc.querySelectorAll('style')
    //   const allScripts = tempDoc.querySelectorAll('script')

    //   if (allStyles.length > 0) {
    //     cssContent = Array.from(allStyles).map(el => {
    //       const tempDiv = document.createElement('div')
    //       tempDiv.appendChild(el.cloneNode(true))
    //       return tempDiv.innerHTML
    //     }).join('\n\n')
    //   }

    //   if (allScripts.length > 0) {
    //     jsContent = Array.from(allScripts).map(el => {
    //       const tempDiv = document.createElement('div')
    //       tempDiv.appendChild(el.cloneNode(true))
    //       return tempDiv.innerHTML
    //     }).join('\n\n')
    //   }
    // }
  }

  console.log('提取结果:', { html: htmlContent, css: cssContent, js: jsContent })
  return { html: htmlContent, css: cssContent, js: jsContent }
}

const insertElement = (id) => {
  const msg = chatMsgs.value.find((item) => item.id === id)
  if (!msg || !msg.selectedElement || !iframeEntrance.value) return

  console.log(msg.newElement)
   //先移除选中元素的特殊高亮
   console.log('清除特殊高亮前',msg.selectedElement)
   msg.selectedElement.classList.remove('special-hover-highlight')
   console.log('清除特殊高亮后',msg.selectedElement)


  //关闭ai修改
  setIsRequireAIChange(false)
  //插入元素
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

    // // 使用srcdoc属性更新iframe内容
    // if (iframeEntrance.value) {
    //   iframeEntrance.value.srcdoc = fullHtmlContent
    // }

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

onMounted(() => {
  hljs.highlightAll()
})
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
</script>

<template>
  <div class="chat-box">
    <div id="chat-container" ref="chatContainer" :class="{ 'reduced-height': isEnlarged }">
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
          <button v-if="item.type === 'modify_component'" @click="insertElement(item.id)">
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
          </button>

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
            d="M301.4 278l180.4 184.6c6.2 6.3 6.1 16.5-0.3 22.6-6.3 6.2-16.5 6.1-22.6-0.3L278.5 300.4c-6.2-6.3-6.1-16.5 0.3-22.6 6.3-6.2 16.4-6.1 22.6 0.2zM756.6 590.7c8.8 0 16 7.2 15.9 16.1l-0.5 166-166.1-0.5c-8.8 0-16-7.2-15.9-16.1 0-8.8 7.2-16 16.1-15.9l134.1 0.4 0.4-134.1c0-8.8 7.2-16 16-15.9z"
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
      <div class="input-box">
        <textarea
          id="user-input"
          placeholder="输入你的问题..."
          @keydown.enter.prevent="!isInputEmpty && sendMessage()"
        ></textarea>
        <button id="send-btn" ref="sendBtn" @click="sendMessage" :disabled="isInputEmpty">
          <img src="@/assets/发送.png" alt="发送" />
        </button>
      </div>
    </div>
  </div>
</template>
<style scoped lang="less">
.chat-box {
  width: 100%;
  height: 100%;
  background-color: #fff;
  position: relative;

  #chat-container {
    width: 100%;
    height: 80%;
    overflow-y: auto;

    gap: 20px;
    // padding-bottom: 10px;
    transition: height 0.3s ease; // 添加过渡效果

    &.reduced-height {
      height: 45%; // 当输入框放大时，聊天容器高度减少
    }

    &::-webkit-scrollbar-track-piece {
      background-color: white;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgb(229, 231, 235);
    }

    // 移除旧的代码折叠按钮样式，只保留折叠后的代码样式
    :deep(pre) {
      position: relative;

      code.code-folded {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: block;
        max-height: 24px;
        position: relative;

        &::after {
          content: "...（已折叠）";
          color: #888;
          margin-left: 10px;
        }
      }
    }
  }
  #input-container {
    width: 100%;
    height: 20%;
    position: relative;
    transition: all 0.3s ease; // 添加过渡效果

    &.enlarged {
      height: 55%; // 放大后的高度
      z-index: 10;

      .input-box {
        height: calc(100% - 30px);

        textarea {
          height: 90%; // 放大后文本区域高度
        }
      }
    }

    .input-box {
      border: 1px solid rgb(229, 231, 235);
      border-radius: 30px;
      padding: 5px 10px;
      position: relative;
      width: 100%;
      height: calc(100% - 30px);
      transition: height 0.3s ease;
      background-color: white;

      textarea {
        width: 90%;
        height: 80%;
        font-size: 16px;
        font-weight: 500;
        color: #333;
        //行间距
        line-height: 1.3;
        padding: 10px;
        resize: none; // 防止用户手动调整大小
        transition: height 0.3s ease; // 添加过渡效果
        border: none;
        outline: none;
      }
      button {
        position: absolute;
        right: 10px;
        bottom: 10px;
        width: 30px;
        height: 30px;
        cursor: pointer;
        img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .input-tools {
      width: 100%;
      height: 30px;
      padding: 0 5%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;

      .icon {
        cursor: pointer;
        transition: transform 0.3s ease;

        &:hover {
          transform: scale(1.1);
        }
      }
    }
  }
  .user-message {
    display: flex;
    flex-direction: row-reverse;
    width: 95%;
    margin: auto;
    margin-bottom: 20px;

    .message-content {
      max-width: 80%;

      font-size: 16px;
      padding: 8px 10px;
      border-radius: 10px;
      background-color: rgb(249, 250, 251);
      overflow-y: auto;
      border: 1px solid rgb(229, 231, 235);
    }
  }
  .ai-message {
    display: flex;
    flex-direction: row;
    width: 95%;
    margin: auto;
    margin-bottom: 30px; // 增加底部间距，为工具栏腾出空间
    position: relative;
    .tools {
      position: absolute;
      bottom: -30px;
      left: 5%;
      display: flex;
      flex-direction: row;
      gap: 10px;
      button {
        cursor: pointer;
        background: transparent;
        border: none;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;

        &:hover {
          background-color: #f0f0f0;
        }

        &:active {
          background-color: #e0e0e0;
        }
      }
    }
    .message-content {
      max-width: 100%;
      border: 1px solid rgb(229, 231, 235);
      scrollbar-width: none;

      text-align: left;
      font-size: 16px;
      padding: 8px 10px;
      border-radius: 10px;
      background-color: rgb(249, 250, 251);
      overflow-y: auto;
    }
  }
}
</style>
