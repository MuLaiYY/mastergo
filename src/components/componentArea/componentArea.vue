<script setup>
import { onMounted } from 'vue'
import Sortable from 'sortablejs'
import { useComponentAreaStore } from '@/stores'
import { storeToRefs } from 'pinia'
const componentArea = useComponentAreaStore()
const { components } = storeToRefs(componentArea)

// 定义组件库中的组件列表

onMounted(() => {
  // 初始化组件库的 Sortable
  const componentList = document.querySelector('.components-list')
  new Sortable(componentList, {
    group: {
      name: 'shared',
      pull: 'clone',
      put: false,
    },
    sort: false,
    draggable: '.component-item',
    animation: 150,
    setData: function (dataTransfer, dragEl) {
      // 获取实际要拖拽的元素内容
      const index = [...dragEl.parentElement.children].indexOf(dragEl)
      const component = components.value[index]

      // 创建实际元素
      const tempDiv = document.createElement('div')
      tempDiv.innerHTML = component.template
      const actualElement = tempDiv.firstElementChild

      // 将实际元素添加到 body 但设置为不可见
      actualElement.style.position = 'absolute'
      actualElement.style.top = '-9999px'
      actualElement.style.left = '-9999px'
      document.body.appendChild(actualElement)

      // 设置拖拽图像为实际元素
      dataTransfer.setDragImage(actualElement, 0, 0)

      // 延迟移除临时元素
      setTimeout(() => {
        document.body.removeChild(actualElement)
      }, 0)
    },
  })
})

// 开始拖拽时
// const onDragStart = (e, component) => {
//   // 创建预览元素
//   const previewElement = document.createElement('div')
//   previewElement.innerHTML = component.template

//   // 设置拖拽图像
//   if (previewElement.firstElementChild) {
//     // 克隆节点以便设置样式而不影响原始模板
//     const dragImage = previewElement.firstElementChild.cloneNode(true)
//     document.body.appendChild(dragImage)

//     // 设置样式使其不可见但仍能用作拖拽图像
//     dragImage.style.position = 'absolute'
//     dragImage.style.top = '-9999px'
//     dragImage.style.left = '-9999px'

//     // 设置拖拽图像
//     e.dataTransfer.setDragImage(dragImage, 0, 0)

//     // 稍后移除临时元素
//     setTimeout(() => {
//       document.body.removeChild(dragImage)
//     }, 0)
//   }
// }
</script>

<template>
  <div class="components">
    <div class="components-list">
      <div
        v-for="(component, index) in components"
        :key="index"
        class="component-item"
        draggable="true"
      >
        <span class="component-icon">{{ component.icon }}</span>
        <span class="component-name">{{ component.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.components {
  background: #fff;
  border-right: 1px solid #eee;

  width: 100%;
  height: 100%;

  .components-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  .component-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px;
    border: 1px solid #eee;
    border-radius: 4px;
    cursor: move;
    transition: all 0.3s;

    &:hover {
      background: #f5f5f5;
      border-color: #42b983;
    }

    .component-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .component-name {
      font-size: 12px;
      color: #666;
    }
  }
}
</style>
