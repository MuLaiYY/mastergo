<template>
  <li class="file-node">
    <div
      :class="['file-item', { 'is-folder': file.isFolder, 'is-file': !file.isFolder }]"
      @click="handleClick"
    >
      <span class="file-icon">
        <i :class="getIcon"></i>
      </span>
      <span class="file-name">{{ file.name }}</span>
    </div>

    <ul v-if="file.isFolder && isOpen" class="folder-children">
      <template v-for="child in file.children" :key="child.id">
        <FileTreeNode :file="child" @select-file="selectFile" />
      </template>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, ref, computed } from 'vue'

// 文件类型定义
interface FileNode {
  id: number
  name: string
  isFolder: boolean
  content?: string
  children?: FileNode[]
}

const props = defineProps<{
  file: FileNode
}>()

const emit = defineEmits<{
  (e: 'select-file', file: FileNode): void
}>()

// 文件夹展开状态
const isOpen = ref(true)

// 根据文件类型和扩展名获取图标
const getIcon = computed(() => {
  if (props.file.isFolder) {
    return isOpen.value ? 'el-icon-folder-opened' : 'el-icon-folder'
  }

  // 根据文件扩展名返回不同图标
  const ext = props.file.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
    case 'jsx':
      return 'el-icon-document'
    case 'css':
      return 'el-icon-document'
    case 'html':
      return 'el-icon-document'
    default:
      return 'el-icon-document'
  }
})

// 处理点击事件
const handleClick = (event: MouseEvent) => {
  event.stopPropagation()

  if (props.file.isFolder) {
    isOpen.value = !isOpen.value
  } else {
    emit('select-file', props.file)
  }
}

// 向上传递文件选择事件
const selectFile = (file: FileNode) => {
  emit('select-file', file)
}
</script>

<style scoped>
.file-node {
  list-style: none;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  cursor: pointer;
  user-select: none;
  color: #d4d4d4;
}

.file-item:hover {
  background-color: #2a2d2e;
}

.is-folder {
  font-weight: bold;
}

.file-icon {
  margin-right: 5px;
  width: 16px;
  text-align: center;
}

.folder-children {
  padding-left: 16px;
  list-style: none;
}
</style>
