<script setup>
import { marked } from 'marked'
import { ref, watch, nextTick, onMounted } from 'vue'
import { useQwenAI } from './qwenAI'
import { useAiChatStore } from '@/stores'
import { storeToRefs } from 'pinia'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
const aiChatStore = useAiChatStore()
const { chatMsgs } = storeToRefs(aiChatStore)
const { removeChatMsg, addChatMsg, setSelectedElement, setIsRequireAIChange } = aiChatStore
const { selectedElement, iframeEntrance } = storeToRefs(aiChatStore)
const userInput = ref('')
const sendBtn = ref(null)
const chatContainer = ref(null)
const isInputEmpty = ref(true) // 新增：跟踪输入是否为空
const { getResponse } = useQwenAI()
const isEnlarged = ref(false) // 跟踪输入框是否放大

// 监听输入变化
const handleInput = (event) => {
  userInput.value = event.target.value
  isInputEmpty.value = !userInput.value.trim() // 更新输入状态
}

onMounted(() => {
  scrollToBottom()
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
    deep: true, // 深度监听
    immediate: true, // 立即触发
  },
)
const sendMessage = async () => {
  let parsedContent = ''
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

    addChatMsg({
      id: chatMsgs.value.length + 1,
      message: currentInput,
      content: trueMessage,
      role: 'user',
      selectedElement: null,
      newElement: null,
    })
    const loadingMsg = '牧濑正在思考...'
    addChatMsg({
      id: 0,
      message: loadingMsg,
      content: trueMessage,
      role: 'assistant',
      selectedElement: null,
      newElement: null,
      type: 'chat',
    })

    const res = await getResponse(trueMessage)

    parsedContent = marked.parse(res)

    // 已经在函数开始时清空了输入框，这里不需要再清空
  } catch (error) {
    console.log(error)
    throw error
  } finally {
    //移除loadingMsg
    removeChatMsg(0)
    let type
    const newElement = parseAIResponse(parsedContent)
    if (selectedElement.value) {
      type = 'modify'
    } else if (newElement.html !== '') {
      type = 'generate'
    } else {
      type = 'chat'
    }

    addChatMsg({
      id: chatMsgs.value.length + 1,
      message: parsedContent,
      content: parsedContent,
      role: 'assistant',
      selectedElement: selectedElement.value,
      newElement: newElement,
      type: type,
    })

    // 只对新添加的消息应用代码高亮，而不是所有消息
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
  }
}
//提取回答中的组件代码
function parseAIResponse(response) {
  const parser = new DOMParser()
  const doc = parser.parseFromString(response, 'text/html')

  // 提取 HTML 部分
  const htmlElement = doc.querySelector('.language-html')
  const htmlContent = htmlElement ? htmlElement.textContent.trim() : ''

  // 提取 CSS 部分
  const cssElement = doc.querySelector('.language-css')
  const cssContent = cssElement ? cssElement.textContent.trim() : ''

  return { html: htmlContent, css: cssContent }
}
const insertElement = (id) => {
  const msg = chatMsgs.value.find((item) => item.id === id)
  console.log(msg.newElement)
  //先移除选中元素的特殊高亮
  msg.selectedElement.classList.remove('special-hover-highlight')
  //关闭ai修改
  setIsRequireAIChange(false)
  //插入元素
  msg.selectedElement.outerHTML = msg.newElement.html
  //插入css
  const styleTag = iframeEntrance.value.createElement('style')
  styleTag.textContent = msg.newElement.css
  iframeEntrance.value.head.appendChild(styleTag)
  //清空选中元素
  setSelectedElement(null)
}
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
        <div v-if="item.type === 'modify' || item.type === 'generate'" class="tools">
          <button @click="insertElement(item.id)" :disabled="item.type === 'generate'">
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

          <button>
            <svg
              t="1740816369391"
              class="icon"
              viewBox="0 0 1426 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="39341"
              width="24"
              height="24"
            >
              <path
                d="M985.6 1022.976c-14.848 0-31.744-4.096-47.104-12.288L716.288 899.584l-223.744 111.104c-14.336 7.68-30.208 11.776-47.104 11.776-21.504 0-42.496-6.656-59.392-19.456-31.232-23.552-47.104-64-39.936-101.376l45.568-237.056-175.616-163.328c-27.136-27.648-37.376-67.072-27.136-104.448l0.512-1.024c12.8-38.4 44.544-65.024 82.944-70.144l243.712-44.544L625.152 58.88C642.56 23.552 678.4 1.024 716.288 1.024c39.424 0 76.288 23.552 91.648 58.368l109.056 221.696 243.712 42.496c38.4 5.632 70.656 33.28 81.408 71.168 12.288 36.864 2.048 77.312-25.6 104.96l-0.512 0.512-174.592 164.864 44.032 237.568c7.168 37.888-8.192 76.288-39.424 100.352-17.92 12.8-38.912 19.968-60.416 19.968z"
                fill="#707070"
                p-id="39342"
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
    margin-bottom: 20px;
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
