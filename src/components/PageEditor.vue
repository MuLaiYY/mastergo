<template>
  <div class="page-editor">
    <div class="editor-container">
      <div class="toolbar">
        <el-button type="primary" @click="previewPage">预览</el-button>
        <el-button type="success" @click="savePage">保存</el-button>
      </div>

      <div class="editor-content">
        <!-- 代码编辑器 -->
        <div class="code-editor">
          <textarea ref="codeEditor"></textarea>
        </div>

        <!-- 预览区域 -->
        <div class="preview-area">
          <iframe ref="previewFrame" sandbox="allow-scripts allow-same-origin"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material.css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/css/css';
import 'codemirror/mode/javascript/javascript';
import { savePageHtml, getPagePreviewUrl } from '../api/page';

const props = defineProps<{
  pageId: string;
  initialContent: string;
}>();

const emit = defineEmits(['saved']);

// 引用
const codeEditor = ref<HTMLTextAreaElement | null>(null);
const previewFrame = ref<HTMLIFrameElement | null>(null);
let editor: CodeMirror.Editor;

// 当前编辑的HTML内容
const htmlContent = ref(props.initialContent || getDefaultTemplate());

// 初始化编辑器
onMounted(() => {
  if (codeEditor.value) {
    editor = CodeMirror.fromTextArea(codeEditor.value, {
      mode: 'htmlmixed',
      theme: 'material',
      lineNumbers: true,
      lineWrapping: true,
      autoCloseTags: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 2,
      tabSize: 2,
    });

    // 设置初始内容
    editor.setValue(htmlContent.value);

    // 监听编辑器内容变化
    editor.on('change', () => {
      htmlContent.value = editor.getValue();
      updatePreview();
    });

    // 初始化预览
    updatePreview();
  }
});

// 更新预览
const updatePreview = () => {
  if (previewFrame.value) {
    previewFrame.value.srcdoc = htmlContent.value;
  }
};

// 预览页面（在新窗口中）
const previewPage = () => {
  // 方法1：使用srcdoc内容在新窗口中打开
  const newWindow = window.open('', '_blank');
  if (newWindow) {
    newWindow.document.write(htmlContent.value);
    newWindow.document.close();
  } else {
    ElMessage.warning('浏览器阻止了弹出窗口，请允许弹出窗口或使用保存后预览功能');
  }

  // 方法2：如果已保存，可以使用预览链接
  // const previewUrl = getPagePreviewUrl(props.pageId);
  // window.open(previewUrl, '_blank');
};

// 保存页面
const savePage = async () => {
  try {
    // 获取当前iframe中的HTML内容
    const content = htmlContent.value;

    // 确认保存
    await ElMessageBox.confirm('确定要保存当前页面吗？', '保存确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    // 调用API保存HTML内容
    await savePageHtml({
      pageId: props.pageId,
      htmlContent: content
    });

    ElMessage.success('页面保存成功');
    emit('saved', content);
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存页面失败:', error);
      ElMessage.error('保存页面失败，请重试');
    }
  }
};

// 获取右键菜单的DOM元素
const getIframeDocument = () => {
  return previewFrame.value?.contentDocument;
};

// 获取默认模板
function getDefaultTemplate() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>新页面</title>
  <style>
    body {
      font-family: 'Arial', sans-serif;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      color: #333;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>欢迎使用页面编辑器</h1>
    <p>这是一个由AI生成的页面，您可以自由编辑它。</p>
  </div>
</body>
</html>`;
}
</script>

<style scoped>
.page-editor {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.editor-container {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

.toolbar {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  display: flex;
  gap: 10px;
}

.editor-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.code-editor {
  flex: 1;
  overflow: hidden;
  border-right: 1px solid #ddd;
}

.preview-area {
  flex: 1;
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  background-color: white;
}

:deep(.CodeMirror) {
  height: 100%;
  font-size: 14px;
}
</style>
