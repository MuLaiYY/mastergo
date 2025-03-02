<script setup>
import codeMirrorEditor from '@/components/codeMirrorEditor.vue'
import iframePage from '@/components/iframePage/iframePage.vue'

import componentStore from '@/components/componentArea/componentArea.vue'
import { ref, onMounted } from 'vue'
import chatBox from '@/components/ai/chatBox.vue'
const currentComponent = ref('codeMirrorEditor')
const iframeDiv = ref()
const isFullscreen = ref(false)
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value

  if (isFullscreen.value) {
    iframeDiv.value.classList.add('fullScreen')
  } else {
    iframeDiv.value.classList.remove('fullScreen')
  }
}
onMounted(async () => {})
</script>

<template>
  <main>
    <div style="width: 5vw"></div>
    <div class="mainContent">
      <div>
        <button>主题色</button>
        <button>设备</button>
        <button
          :class="{ enterFullScreen: !isFullscreen, exitFullScreen: isFullscreen }"
          @click="toggleFullscreen"
        >
          {{ isFullscreen ? '退出全屏' : '进入全屏' }}
        </button>
      </div>
      <div class="iframe" ref="iframeDiv">
        <iframePage></iframePage>
      </div>
    </div>
    <div class="right-operator">
      <div class="tab">
        <button @click="currentComponent = 'codeMirrorEditor'">代码编辑</button>
        <button @click="currentComponent = 'componentStore'">组件库</button>
        <button @click="currentComponent = 'chatBox'">AI对话</button>
      </div>

      <div class="component-area">
        <codeMirrorEditor v-if="currentComponent === 'codeMirrorEditor'"></codeMirrorEditor>

        <componentStore v-if="currentComponent === 'componentStore'"></componentStore>
        <chatBox v-if="currentComponent === 'chatBox'"></chatBox>
      </div>
    </div>
  </main>
</template>

<style scoped lang="less">
button {
  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
main {
  width: 100vw;
  height: 100vh;

  display: flex;
  flex-direction: row;
  .mainContent {
    width: 60vw;

    margin: auto;
    position: relative;
    .enterFullScreen {
      position: absolute;
      right: 0;
      top: 0;
    }
    .exitFullScreen {
      position: fixed;
      right: 2vw;
      top: 1vh;
      z-index: 1000;
    }
    .iframe {
      width: 60vw;
      height: 80vh;
      outline: 1px solid rgb(229, 231, 235);
      border-radius: 10px;
      & button {
        position: absolute;
        right: 0;
        top: 0;
      }
    }
    .fullScreen {
      width: 100vw;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 999;
    }
  }

  .right-operator {
    width: 35vw;
    height: 95%;
    .tab {
      height: 5%;
      padding: auto;
    }
    .component-area {
      height: 100%;
      padding: 10px 20px;
    }
  }
}
</style>
