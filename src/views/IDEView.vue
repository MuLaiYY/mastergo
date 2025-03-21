<template>
  <div class="ide-container">
    <!-- 左侧文件树 -->
    <div class="file-explorer">
      <h3>项目文件</h3>
      <div class="file-tree">
        <div class="simple-file-tree">
          <div
            v-for="file in files"
            :key="file.id"
            class="file-item"
            :class="{ 'active': currentFile && currentFile.id === file.id }"
            @click="selectFile(file)"
          >
            {{ file.name }}
          </div>
        </div>
      </div>
    </div>

    <!-- 中间代码编辑器 -->
    <div class="code-editor">
      <textarea
        v-model="code"
        class="code-textarea"
        @input="handleCodeChange"
      ></textarea>
    </div>

    <!-- 右侧预览画布 -->
    <div class="preview-area">
      <div class="preview-toolbar">
        <el-button type="primary" size="small" @click="renderPreview">运行</el-button>
        <el-button size="small" @click="reset">重置</el-button>
      </div>
      <iframe ref="previewFrame" class="preview-frame"></iframe>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// 简化的文件类型
interface FileItem {
  id: number
  name: string
  content: string
}

// 简化的文件列表
const files = ref<FileItem[]>([
  {
    id: 1,
    name: 'App.jsx',
    content: `import React from 'react';

function App() {
  return (
    <div className="app">
      <h1>Hello React!</h1>
      <p>编辑并点击"运行"按钮查看效果</p>
    </div>
  );
}

export default App;`
  },
  {
    id: 2,
    name: 'index.js',
    content: `import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);`
  },
  {
    id: 3,
    name: 'styles.css',
    content: `body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}`
  }
])

// 当前编辑的文件和代码
const currentFile = ref<FileItem | null>(null)
const code = ref('')
const previewFrame = ref<HTMLIFrameElement | null>(null)

// 选择文件
const selectFile = (file: FileItem) => {
  currentFile.value = file
  code.value = file.content
}

// 处理代码更改
const handleCodeChange = () => {
  if (currentFile.value) {
    currentFile.value.content = code.value
  }
}

// 查找文件内容
const findFileContent = (fileName: string): string => {
  const file = files.value.find(file => file.name === fileName)
  return file ? file.content : ''
}

// 在预览框中渲染React代码
const renderPreview = () => {
  if (!previewFrame.value) return

  // 避免使用模板字符串和HTML标签，以防TypeScript解析错误
  let htmlContent = '';

  // 添加文档头
  htmlContent += '<!DOCTYPE html>';
  htmlContent += '<html>';
  htmlContent += '<head>';
  htmlContent += '<meta charset="UTF-8">';
  htmlContent += '<title>React Preview</title>';

  // 添加样式
  htmlContent += '<style>';
  htmlContent += findFileContent('styles.css');
  htmlContent += '</style>';

  // 添加外部脚本
  htmlContent += '<script src="https://unpkg.com/react@17/umd/react.development.js"><\/script>';
  htmlContent += '<script src="https://unpkg.com/react-dom@17/umd/react-dom.development.js"><\/script>';
  htmlContent += '<script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>';
  htmlContent += '</head>';

  // 添加body内容
  htmlContent += '<body>';
  htmlContent += '<div id="root"></div>';

  // 将应用程序组件和索引文件分开，避免React重复声明
  htmlContent += '<script type="text/babel" id="app-code">';
  // 移除重复的React导入，只保留组件代码
  const appContent = findFileContent('App.jsx').replace('import React from \'react\';', '');
  htmlContent += `// App.jsx
const React = window.React;
${appContent.replace('export default App;', 'window.App = App;')}`;
  htmlContent += '<\/script>';

  // 添加索引文件，引用全局React和App
  htmlContent += '<script type="text/babel" id="index-code">';
  // 移除重复的导入，使用全局变量
  htmlContent += `// index.js
const React = window.React;
const ReactDOM = window.ReactDOM;
const App = window.App;
`;
  // 移除导入语句，直接使用App
  const indexContent = findFileContent('index.js')
    .replace('import React from \'react\';', '')
    .replace('import ReactDOM from \'react-dom\';', '')
    .replace('import App from \'./App\';', '');
  htmlContent += indexContent;
  htmlContent += '<\/script>';

  // 关闭标签
  htmlContent += '</body>';
  htmlContent += '</html>';

  // 写入到iframe
  const frameWindow = previewFrame.value.contentWindow;
  if (frameWindow) {
    const frameDoc = frameWindow.document;
    frameDoc.open();
    frameDoc.write(htmlContent);
    frameDoc.close();
  }
}

// 重置预览
const reset = () => {
  if (previewFrame.value && previewFrame.value.contentWindow) {
    const frameDoc = previewFrame.value.contentWindow.document
    frameDoc.open()
    frameDoc.write('')
    frameDoc.close()
  }
}

// 初始化
onMounted(() => {
  // 选择第一个文件
  if (files.value.length > 0) {
    selectFile(files.value[0])
  }
})
</script>

<style scoped>
.ide-container {
  display: flex;
  height: calc(100vh - 60px);
  width: 100%;
  margin: 0;
  overflow: hidden;
}

.file-explorer {
  width: 250px;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.file-explorer h3 {
  padding: 10px;
  margin: 0;
  font-size: 14px;
  border-bottom: 1px solid #333;
}

.file-tree {
  padding: 10px;
  flex: 1;
  overflow-y: auto;
}

.simple-file-tree {
  display: flex;
  flex-direction: column;
}

.file-item {
  padding: 6px 8px;
  cursor: pointer;
  border-radius: 4px;
  margin-bottom: 2px;
  transition: background-color 0.2s;
}

.file-item:hover {
  background-color: #2a2d2e;
}

.file-item.active {
  background-color: #37373d;
}

.code-editor {
  flex: 1;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.code-textarea {
  width: 100%;
  height: 100%;
  background-color: #1e1e1e;
  color: #d4d4d4;
  border: none;
  resize: none;
  padding: 16px;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.5;
  tab-size: 2;
}

.code-textarea:focus {
  outline: none;
}

.preview-area {
  width: 40%;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #333;
}

.preview-toolbar {
  padding: 8px;
  background-color: #1e1e1e;
  border-bottom: 1px solid #333;
}

.preview-frame {
  flex: 1;
  border: none;
  width: 100%;
  height: 100%;
  background-color: white;
}
</style>
