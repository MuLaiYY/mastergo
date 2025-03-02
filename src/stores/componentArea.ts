import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useComponentAreaStore = defineStore('componentArea', () => {
  const components = ref([
    {
      type: 'div',
      name: '容器',
      icon: '📦',
      template:

        '<div style="min-width: 100px; min-height: 100px; border: 1px dashed #ccc; padding: 10px;"></div>',
    },
    {
      type: 'button',
      name: '按钮',
      icon: '🔘',
      template:
        '<button style="padding: 8px 16px; background: #42b983; color: white; border: none; border-radius: 4px;">按钮</button>',
    },
    {
      type: 'text',
      name: '文本',
      icon: '📝',
      template: '<p style="margin: 0; padding: 8px;">这是一段文本</p>',
    },
    {
      type: 'input',
      name: '输入框',
      icon: '✏️',
      template:
        '<input style="padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="请输入...">',
    },
    {
      type: 'image',
      name: '图片',
      icon: '🖼️',
      template: '<img src="https://via.placeholder.com/200x150" alt="示例图片" style="max-width: 100%; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">',
    },
    {
      type: 'card',
      name: '卡片',
      icon: '🗂️',
      template: '<div style="padding: 16px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); background: white;"><h3 style="margin: 0 0 8px 0;">卡片标题</h3><p style="margin: 0; color: #666;">卡片内容描述</p></div>',
    },


    {
      type: 'alert',
      name: '提示框',
      icon: '⚠️',
      template: '<div style="padding: 12px 16px; background: #f8f9fa; border-left: 4px solid #42b983; margin: 8px 0; color: #2c3e50;">提示信息</div>',
    }
  ])



  return { components }
})
