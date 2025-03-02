<script setup>
import CodeMirror from 'codemirror'

import { ref, onMounted, onUnmounted } from 'vue'
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

const editor = ref(null) // 绑定到模板中的 DOM 元素
let editorInstance = null // 存储 CodeMirror 实例

import { useOriginalCodeStore } from '@/stores/originalCode'
const originalCodeStore = useOriginalCodeStore()
const { originalCode } = storeToRefs(originalCodeStore)

//防抖函数
// function debounce(func, delay) {
//   let timeoutId

//   return function (...args) {
//     // 每次触发事件时，清除之前的定时器
//     clearTimeout(timeoutId)

//     // 设置新的定时器，延迟执行
//     timeoutId = setTimeout(() => {
//       func.apply(this, args)
//     }, delay)
//   }
// }

//编辑器修改代码函数
const newContentCode = ref()

const saveCode = () => {
  originalCodeStore.changeOriginalCode(newContentCode.value)
}
onMounted(() => {
  editorInstance = CodeMirror(editor.value, {
    value: originalCode.value, // 初始内容
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
})
</script>
<template>
  <div ref="editor" class="editor">
    <button @click="saveCode">保存</button>
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
}
</style>
