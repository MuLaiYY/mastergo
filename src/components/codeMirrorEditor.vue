<script setup>
import CodeMirror from 'codemirror'

import { ref, onMounted, onUnmounted, defineProps, defineEmits, watch } from 'vue'
// 引入css文件
import 'codemirror/lib/codemirror.css'

// 引入语言模式 可以从 codemirror/mode/ 下引入多个
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/htmlmixed/htmlmixed'
// 引入格式化相关插件
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/fold/xml-fold'
import 'codemirror/addon/edit/matchtags'
// placeholder
// import "codemirror/addon/display/placeholder.js";
// 引入主题 可以从 codemirror/theme/ 下引入多个
import 'codemirror/theme/idea.css'
import { ElMessage } from 'element-plus'
import { useAiChatStore } from '@/stores'
import { storeToRefs } from 'pinia'
const aiChatStore=useAiChatStore()
const {iframeEntrance} =storeToRefs(aiChatStore)
const props = defineProps({
  page: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:content'])

// 处理代码格式化，移除每行开头的空白字符
const formatCode = (code) => {
  if (!code) return '';

  // 分割成行并处理每一行
  const lines = code.split('\n');
  let result = [];
  let inStyleOrScript = false; // 标记是否在 style 或 script 标签内

  for (let line of lines) {
    // 检查是否进入或离开 style/script 标签
    if (line.trim().match(/<(style|script).*>/i)) {
      inStyleOrScript = true;
      result.push(line);
      continue;
    }
    if (line.trim().match(/<\/(style|script)>/i)) {
      inStyleOrScript = false;
      result.push(line);
      continue;
    }

    // 如果在 style 或 script 标签内，保持原有格式
    if (inStyleOrScript) {
      result.push(line);
    } else {
      // 只处理 HTML 部分的代码
      line = line.replace(/^\s+/, '');
      result.push(line);
    }
  }

  return result.join('\n');
};

const editor = ref(null) // 绑定到模板中的 DOM 元素
let editorInstance = null // 存储 CodeMirror 实例

//编辑器修改代码函数
const newContentCode = ref()
const isUpdating = ref(false)

const saveCode = async () => {
  isUpdating.value = true
  try {
    if (!newContentCode.value) {
      ElMessage.warning('没有内容可以更新')
      return
    }

    // 更新页面内容
    emit('update:content', newContentCode.value)

    ElMessage.success('预览已更新')
  } catch (error) {
    console.error('更新代码失败:', error)
    ElMessage.error('更新失败，请重试')
  } finally {
    isUpdating.value = false
  }
}

onMounted(() => {
  // 初始化编辑器内容，并格式化

  const initialContent = formatCode(props.page?.htmlContent)

  editorInstance = CodeMirror(editor.value, {
    value: initialContent,
    mode: 'htmlmixed',
    theme: 'default',
    lineNumbers: true,
    indentUnit: 0,
    tabSize: 2,
    lineWrapping: 'wrap',
    matchBrackets: true,
    autoCloseBrackets: true,
    matchTags: {bothTags: true},
    extraKeys: {
      'Tab': false,
      'Enter': false,
      'Ctrl-J': 'toMatchingTag'
    },
    smartIndent: false,
    electricChars: false,
    indentWithTabs: false,
    gutters: ["CodeMirror-linenumbers"],
    viewportMargin: Infinity
  })

  // 强制重新渲染
  editorInstance.refresh();

  // 监听内容变化并格式化
  editorInstance.on('change', (instance) => {
    const value = instance.getValue();
    const formattedValue = formatCode(value);

    // 只有当格式化后的内容不同时才更新
    if (value !== formattedValue) {
      const cursor = instance.getCursor();
      instance.setValue(formattedValue);
      instance.setCursor(cursor);
    }

    newContentCode.value = formattedValue;
  });

  // 确保初始值设置
  newContentCode.value = initialContent;
})

// 监听页面内容变化，更新编辑器内容
watch(() => props.page, (newPage, oldPage) => {
  if (newPage && editorInstance) {
    // 如果页面内容发生变化，更新编辑器内容，并格式化
    if (newPage.htmlContent !== editorInstance.getValue()) {
      console.log('页面内容已更新，正在更新编辑器...');
      const formattedContent = formatCode(newPage.htmlContent || '');
      editorInstance.setValue(formattedContent);
      newContentCode.value = formattedContent;
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
  position: relative;
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.05) 0%,
    rgba(236, 72, 153, 0.05) 50%,
    rgba(139, 92, 246, 0.05) 100%
  );

  :deep(.CodeMirror) {
    height: 100%;
    background: transparent;
    font-family: 'JetBrains Mono', Consolas, Monaco, 'Andale Mono', monospace;
    color: rgba(76, 29, 149, 0.9);
    line-height: 1.6;
    padding: 16px;

    .CodeMirror-gutters {
      background: transparent;
      border-right: 1px solid rgba(139, 92, 246, 0.15);
      padding: 0;
      width: 40px;
    }

    .CodeMirror-linenumber {
      color: rgba(139, 92, 246, 0.5);
      font-size: 0.9em;
      padding: 0;
      text-align: right;
      margin-right: 8px;
    }

    .CodeMirror-cursor {
      border-left: 2px solid rgba(139, 92, 246, 0.8);
    }

    .CodeMirror-selected {
      background: rgba(139, 92, 246, 0.1) !important;
    }

    .CodeMirror-line {
      padding: 2px 0;
    }

    // 语法高亮自定义
    .cm-tag {
      color: rgba(139, 92, 246, 0.9);
    }

    .cm-attribute {
      color: rgba(236, 72, 153, 0.9);
    }

    .cm-string {
      color: rgba(16, 185, 129, 0.9);
    }

    .cm-bracket {
      color: rgba(139, 92, 246, 0.7);
    }

    &::-webkit-scrollbar {
      width: 6px;
      height: 6px;
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
  }

  button {
    position: absolute;
    z-index: 2;
    top: 12px;
    right: 16px;
    padding: 8px 20px;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));
    color: white;
    border: none;
    border-radius: 12px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.3s ease;
    backdrop-filter: blur(12px);
    box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.2);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px -4px rgba(139, 92, 246, 0.3);
      background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(236, 72, 153, 1));
    }

    &:active {
      transform: translateY(0);
    }

    &:disabled {
      background: linear-gradient(135deg,
        rgba(139, 92, 246, 0.5),
        rgba(236, 72, 153, 0.5)
      );
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }
  }
}
</style>
