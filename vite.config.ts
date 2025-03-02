import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import monacoEditorPlugin from 'vite-plugin-monaco-editor'
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
    // monacoEditorPlugin({}),//启用Monaco Editor 插件
  ],
  // optimizeDeps: {
  //   include: [
  //     'monaco-editor/esm/vs/language/json/json.worker',
  //     'monaco-editor/esm/vs/language/css/css.worker',
  //     'monaco-editor/esm/vs/language/html/html.worker',
  //     'monaco-editor/esm/vs/language/typescript/ts.worker',
  //     'monaco-editor/esm/vs/editor/editor.worker'
      
  //   ]
  // },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
