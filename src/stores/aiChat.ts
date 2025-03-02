import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAiChatStore = defineStore('aiChat', () => {
  //对话消息
  //消息类型有三种：修改组件、生成组件、普通聊天
  type MsgType = 'modify' | 'generate' | 'chat'
  const chatMsgs = ref<{ id: number; message: string;content:string,role: string ,selectedElement:HTMLElement,newElement:{html:string,css:string},type:MsgType}[]>([])
  //选中的dom元素
  const selectedElement = ref<HTMLElement | null>(null)
//iframe的document
const iframeEntrance=ref<HTMLIFrameElement | null>(null)
//是否运行ai修改
const isRequireAIChange=ref<boolean>(false)
  //添加对话消息
  function addChatMsg(msg: { id: number; message: string;content:string,role: string ,selectedElement:HTMLElement,newElement:{html:string,css:string},type:MsgType}) {
    chatMsgs.value.push(msg)
  }
  //删除对话消息
  function removeChatMsg(id: number) {
    chatMsgs.value = chatMsgs.value.filter((item) => item.id !== id)
  }
  //设置选中的dom元素
  function setSelectedElement(element: HTMLElement) {
    selectedElement.value = element
  }
  //设置iframe的document
  function setIframeEntrance(element: HTMLIFrameElement) {
    iframeEntrance.value = element
  }
  //设置是否运行ai修改
  function setIsRequireAIChange(value: boolean) {
    isRequireAIChange.value = value
  }
  return { chatMsgs, addChatMsg, removeChatMsg, selectedElement, setSelectedElement,iframeEntrance,setIframeEntrance,isRequireAIChange,setIsRequireAIChange }
},{ persist: true })
