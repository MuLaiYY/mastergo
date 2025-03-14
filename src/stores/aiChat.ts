import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { getPageAiConversation, sendAiMessage, saveAiResponseToApi } from '@/api/page'
import { marked } from 'marked' // 导入marked库用于Markdown转换

export const useAiChatStore = defineStore('aiChat', () => {
  // 消息类型
  type MsgType = 'modify_component' | 'generate_page' | 'generate_component' | 'chat'

  // 消息接口
  interface ChatMessage {
    id: number;
    message: string;
    content: string;
    role: string;
    selectedElement: any;
    newElement: {html: string, css: string, js: string} | null;
    type: MsgType;
  }

  // 按页面ID组织聊天记录
  const pageChats = reactive<Record<string, ChatMessage[]>>({})

  // 选中的DOM元素
  const selectedElement = ref<HTMLElement | null>(null)

  // iframe的document
  const iframeEntrance = ref<Document | null>(null)

  // 是否允许AI修改
  const isRequireAIChange = ref<boolean>(false)

  // 当前页面ID
  const currentPageId = ref<string>('')

  // 当前会话ID
  const currentConversationId = ref<string>('')

  // 添加初始消息状态
  const initialMessage = ref<string>('')

  // 是否允许选择元素
  const isAllowSelectElement = ref<boolean>(false)
  function setIsAllowSelectElement(value: boolean) {
    isAllowSelectElement.value = value
  }
  // 设置当前页面ID
  function setCurrentPageId(pageId: string) {
    currentPageId.value = pageId
    // 确保pageChats中存在该页面的记录
    if (!pageChats[pageId]) {
      pageChats[pageId] = []
    }
  }

  // 设置当前会话ID
  function setCurrentConversationId(id: string) {
    currentConversationId.value = id
  }

  // 获取当前页面的聊天记录
  function getCurrentPageChatMsgs() {
    if (!currentPageId.value || !pageChats[currentPageId.value]) {
      return []
    }
    return pageChats[currentPageId.value]
  }

  // 添加对话消息
  function addChatMsg(msg: ChatMessage) {
    if (!currentPageId.value) {
      console.error('无法添加消息: 没有设置当前页面ID')
      return
    }

    // 确保pageChats中存在该页面的记录
    if (!pageChats[currentPageId.value]) {
      pageChats[currentPageId.value] = []
    }

    pageChats[currentPageId.value].push(msg)
  }

  // 删除对话消息
  function removeChatMsg(id: number) {
    if (!currentPageId.value || !pageChats[currentPageId.value]) {
      return
    }

    pageChats[currentPageId.value] = pageChats[currentPageId.value].filter(
      (item) => item.id !== id
    )
  }

  // 清除当前页面的聊天记录
  function clearCurrentPageChatMsgs() {
    if (currentPageId.value) {
      pageChats[currentPageId.value] = []
    }
  }

  // 设置选中的DOM元素
  function setSelectedElement(element: HTMLElement) {
    selectedElement.value = element
  }

  // 设置iframe的document
  function setIframeEntrance(element: Document) {
    iframeEntrance.value = element
  }

  // 设置是否运行AI修改
  function setIsRequireAIChange(value: boolean) {
    isRequireAIChange.value = value
  }

  // 设置初始消息
  function setInitialMessage(message: string) {
    initialMessage.value = message
  }

  // 获取并清除初始消息
  function getAndClearInitialMessage() {
    const message = initialMessage.value
    initialMessage.value = ''
    return message
  }

  // 加载页面聊天记录
  async function loadPageChatMessages(pageId: string) {
    try {
      if (!pageId) {
        console.error('无法加载聊天记录: 页面ID为空')
        return
      }

      // // 设置当前页面ID
      // setCurrentPageId(pageId)

      // 清除当前页面的聊天记录
      if (!pageChats[pageId]) {
        pageChats[pageId] = []
      }

      // 调用API获取页面聊天记录
      const data = await getPageAiConversation(pageId)

      // 保存会话ID
      if (data.conversation && data.conversation._id) {
        setCurrentConversationId(data.conversation._id)
      }

      // 转换并保存消息
      if (data.messages && Array.isArray(data.messages)) {
        pageChats[pageId] = data.messages.map((msg: any) => {
          // 基础消息对象，先保存原始内容
          const rawMessage = msg.message || msg.content

          // 根据角色处理不同的消息格式
          if (msg.role === 'assistant') {
            // 对AI回复消息进行Markdown转换
            return {
              id: msg._id,
              message: marked.parse(rawMessage), // 转换Markdown为HTML
              content: msg.content,
              role: msg.role,
              selectedElement: null,
              newElement: msg.metadata?.newElement || { html: '', css: '', js: '' },
              type: msg.type || 'chat'
            }
          } else {
            // 用户消息，不需要Markdown转换
            return {
              id: msg._id,
              message: rawMessage, // 用户消息不需要转换
              content: msg.content,
              role: msg.role,
              selectedElement: null,
              newElement: null,
              type: msg.type || 'chat'
            }
          }
        })
      }
    } catch (error) {
      console.error('加载页面聊天记录失败:', error)
      // 确保页面有一个空的聊天记录数组
      if (!pageChats[pageId]) {
        pageChats[pageId] = []
      }
    }
  }

  // 发送消息到服务器
  async function sendMessageToApi(message: string, userMsgOnly: boolean = false) {
    try {
      if (!currentConversationId.value) {
        console.error('无法发送消息: 当前没有活跃会话')
        return null
      }

      return await sendAiMessage(currentConversationId.value, message, userMsgOnly)
    } catch (error) {
      console.error('发送消息失败:', error)
      return null
    }
  }

  // 保存AI回复到后端
  async function saveAiResponse(content: string, type: MsgType, newElement: any = null) {
    try {
      if (!currentConversationId.value) {
        console.error('无法保存AI回复: 当前没有活跃会话')
        return null
      }

      // 调用API保存AI回复
      return await saveAiResponseToApi(
        currentConversationId.value,
        content,
        type,
        newElement
      )
    } catch (error) {
      console.error('保存AI回复失败:', error)
      return null
    }
  }

  return {
    initialMessage,
    setInitialMessage,
    getAndClearInitialMessage,
    pageChats,
    getCurrentPageChatMsgs,
    selectedElement,
    setSelectedElement,
    iframeEntrance,
    setIframeEntrance,
    isRequireAIChange,
    setIsRequireAIChange,
    currentPageId,
    setCurrentPageId,
    currentConversationId,
    setCurrentConversationId,
    addChatMsg,
    removeChatMsg,
    clearCurrentPageChatMsgs,
    loadPageChatMessages,
    sendMessageToApi,
    saveAiResponse,
    isAllowSelectElement,
    setIsAllowSelectElement
  }
}, { persist: true })
