<template>
  <div class="file-tree-component">
    <ul class="file-list">
      <template v-for="file in files" :key="file.id">
        <FileTreeNode :file="file" @select-file="selectFile" />
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import FileTreeNode from './FileTreeNode.vue'

// 文件类型定义
interface FileNode {
  id: number
  name: string
  isFolder: boolean
  content?: string
  children?: FileNode[]
}

const props = defineProps<{
  files: FileNode[]
}>()

const emit = defineEmits<{
  (e: 'select-file', file: FileNode): void
}>()

const selectFile = (file: FileNode) => {
  emit('select-file', file)
}
</script>

<style scoped>
.file-tree-component {
  width: 100%;
}

.file-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
