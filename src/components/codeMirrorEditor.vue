<script setup>
import CodeMirror from 'codemirror'

import { ref, onMounted, onUnmounted, defineProps, defineEmits, watch } from 'vue'
import { storeToRefs } from 'pinia'
// 引入css文件
import 'codemirror/lib/codemirror.css'

// 引入语言模式 可以从 codemirror/mode/ 下引入多个
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/htmlmixed/htmlmixed'
// placeholder
// import "codemirror/addon/display/placeholder.js";
// 引入主题 可以从 codemirror/theme/ 下引入多个
import 'codemirror/theme/idea.css'
import { ElMessage } from 'element-plus'

const props = defineProps({
  page: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:content'])

const editor = ref(null) // 绑定到模板中的 DOM 元素
let editorInstance = null // 存储 CodeMirror 实例

import { useOriginalCodeStore } from '@/stores/originalCode'
const originalCodeStore = useOriginalCodeStore()
const { originalCode } = storeToRefs(originalCodeStore)



//编辑器修改代码函数
const newContentCode = ref()
const isUpdating = ref(false)

const saveCode = async () => {
  isUpdating.value = true
  try {
    // 更新页面内容
    emit('update:content', newContentCode.value)

    ElMessage.success('代码已更新')
  } catch (error) {
    console.error('更新代码失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  // 初始化编辑器内容
  const initialContent = props.page?.content || originalCode.value || ''

  editorInstance = CodeMirror(editor.value, {
    value: initialContent, // 初始内容
    mode: 'htmlmixed', // 语言模式
    theme: 'default', // 主题（可选）
    lineNumbers: true, // 显示行号
    indentUnit: 2, // 缩进单位
    tabSize: 2, // Tab 大小
    lineWrapping: 'wrap',
  })

  // 监听内容变化
  editorInstance.on('change', (instance) => {
    newContentCode.value = instance.getValue()
  })

  // 确保初始值设置
  newContentCode.value = initialContent
})

// 监听页面内容变化，更新编辑器内容
watch(() => props.page, (newPage, oldPage) => {
  if (newPage && editorInstance) {
    // 如果页面内容发生变化，更新编辑器内容
    if (newPage.content !== editorInstance.getValue()) {
      console.log('页面内容已更新，正在更新编辑器...');
      editorInstance.setValue(newPage.content || '');
      newContentCode.value = newPage.content || '';
    }
  }
}, { deep: true });
</script>
<template>
  <div ref="editor" class="editor">
    <button @click="saveCode" :disabled="isUpdating">
      {{ isUpdating ? '更新中...' : '更新预览' }}
    </button>
  </div>
</template>
<style scoped lang="less">
.editor {
  margin: auto;
  width: 100%;
  height: 100%;
  // text-align: left;
  position: relative;
  :deep(.CodeMirror) {
    height: 100%;
  }
}
button {
  position: absolute;
  z-index: 2;
  top: 10px;
  right: 20px;
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &:disabled {
    background: #a8d5c2;
    cursor: not-allowed;
  }
}
</style>
