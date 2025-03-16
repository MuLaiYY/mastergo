<script setup>
import { ref, watch, reactive, onUnmounted, nextTick, defineProps, h } from 'vue'
import { storeToRefs } from 'pinia'

import { useComponentAreaStore } from '@/stores'
import { useAiChatStore } from '@/stores'
import Sortable from 'sortablejs'

const componentArea = useComponentAreaStore()
const { components } = storeToRefs(componentArea)
const aiChatStore = useAiChatStore()
const { setSelectedElement, setIframeEntrance, setIsRequireAIChange, setIsAllowSelectElement } =
  aiChatStore
const { isRequireAIChange, isAllowSelectElement, selectedElement } = storeToRefs(aiChatStore)
const myIframe = ref(null)
const iframeWrapper = ref(null)
const iframeObserver = ref(null) // 用于存储MutationObserver实例
let lastHoverElement = null
const isDragging = ref(false)

const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  targetElement: null,
})
const targetElementPropertyList = ref(null)
//暂存保存前的值，用于对比
let beforeSave
const propertyList = reactive([
  {
    name: 'DIV',
    props: {
      width: {
        value: '',
        name: '宽',
      },
      'padding-left': { value: '', name: '左内距' },
      'padding-right': { value: '', name: '右内距' },
      'padding-top': { value: '', name: '上内距' },
      'padding-bottom': { value: '', name: '下内距' },
      height: {
        value: '',
        name: '高',
      },
      'border-color': {
        value: '',
        name: '边框颜色',
      },
      'border-width': {
        value: '',
        name: '边框宽度',
      },
      'border-radius': {
        value: '',
        name: '边框圆角',
      },
      'background-color': {
        value: '',
        name: '背景色',
      },
    },
  },
  {
    name: 'P',
    props: {
      'font-size': {
        value: '',
        name: '字体大小',
      },
      color: {
        value: '',
        name: '颜色',
      },
      width: {
        value: '',
        name: '宽',
      },
      'padding-left': { value: '', name: '左内距' },
      'padding-right': { value: '', name: '右内距' },
      'padding-top': { value: '', name: '上内距' },
      'padding-bottom': { value: '', name: '下内距' },
      height: {
        value: '',
        name: '高',
      },
      'border-color': {
        value: '',
        name: '边框颜色',
      },
      'border-width': {
        value: '',
        name: '边框宽度',
      },
      'border-radius': {
        value: '',
        name: '边框圆角',
      },
      'background-color': {
        value: '',
        name: '背景色',
      },
    },
  },
])
const isAllowChangeProperty = ref(false)
const isRotate = ref(false)
const isScale = ref(false)
const isDrag = ref(false)
let sortableInstances = [] // 存储所有 Sortable 实例

const props = defineProps({
  page: {
    type: Object,
    required: true,
  },
})

//#region 元素信息展示模块

const initHoverAndLeaveEffect = (iframeDocument) => {
  console.log('iframe重新加载了')
  console.log(myIframe.value.contentDocument)

  //禁止#号跳转
  const aTags = iframeDocument.querySelectorAll('a')
  aTags.forEach((aTag) => {
    aTag.addEventListener('click', (event) => {
      //禁止#号跳转
      if (aTag.href.includes('#')) {
        event.preventDefault() // 阻止默认行为
      }
    })
  })
//禁止type=submit的按钮提交
  const submitButtons = iframeDocument.querySelectorAll('button[type="submit"]')
  submitButtons.forEach((submitButton) => {
    submitButton.addEventListener('click', (event) => {
      event.preventDefault() // 阻止默认行为
    })
  })
  // 添加全局样式
  const style = iframeDocument.createElement('style')
  //outline也可以换成下面这种
  // box-shadow: 0 0 0 2px #f00,
  //              inset 0 0 0 1px rgba(255, 0, 0, 0.3);
  style.textContent = `
    .special-hover-highlight {

        cursor: default;
        outline: 2px dashed rgb(225,93, 176);
        animation: pulse 1s infinite;
        background-color: rgba(225,93, 176, 0.1);
        input{
          pointer-events: none;
        }
    }

@keyframes pulse {
  0% {  opacity: 1; }
  50% {  opacity: 0.4; }
  100% {  opacity: 1; }
}
body{
    &::-webkit-scrollbar {
      width: 0px;

    }
      }
  `
  //老板.special-hover-highlight
//   .special-hover-highlight {

// cursor: default;
// outline: 2px dashed #f00;
// animation: pulse 1s infinite;
// background-color: rgba(255, 0, 0, 0.1);
// input{
//   pointer-events: none;
// }
// }

// @keyframes pulse {
// 0% {  opacity: 1; }
// 50% {  opacity: 0.4; }
// 100% {  opacity: 1; }
// }
// body{
// &::-webkit-scrollbar {
// width: 0px;

// }
// }

  iframeDocument.head.appendChild(style)

  // 事件委托处理
  iframeDocument.addEventListener('mouseover', handleElementHover)
  iframeDocument.addEventListener('mouseout', handleElementLeave)
}
//提示框
// const showTooltip = (element) => {
//   //target如果是html或者body（那么在前面已经被我排除掉了）直接退出
//   if (!element) return
//   const iframeWindow = myIframe.value.contentWindow
//   const iframeDocument = myIframe.value.contentDocument
//   //提示框内容
//   const tooltip = iframeDocument.createElement('div')
//   tooltip.className = 'element-tooltip'
//   // tooltip.innerHTML = `
//   //   <div>标签：${element.tagName}</div>
//   //   ${element.id ? `<div>ID：${element.id}</div>` : ''}
//   //   ${element.className ? `<div>Class：${element.className}</div>` : ''}
//   // `

//   tooltip.innerHTML = `
//     <div>标签：${element.tagName}</div>

//   `

//   // 动态更新提示框位置的函数
//   const updatePosition = () => {
//     const rect = element.getBoundingClientRect()
//     const scrollX = iframeWindow.scrollX || iframeWindow.pageXOffset
//     const scrollY = iframeWindow.scrollY || iframeWindow.pageYOffset
//     // 定位样式
//     tooltip.style = `
//     position: absolute;
//     left: ${rect.left + scrollX}px;
//     top: ${rect.bottom + 5 + scrollY}px;
//     background: rgba(0,0,0,0.8);
//     color: white;
//     padding: 8px;
//     border-radius: 4px;
//     z-index: 99999;
//   `
//   }
//   updatePosition()
//   iframeDocument.body.appendChild(tooltip)

//   // 添加滚动监听（）
//   iframeWindow.addEventListener('scroll', updatePosition)

//   // 添加resize监听
//   iframeWindow.addEventListener('resize', updatePosition)
// }

//是否允许选中元素
//

//是否允许选中元素
const changeAllowSelect = () => {
  setIsAllowSelectElement(!isAllowSelectElement.value)
  if (!isAllowSelectElement.value) {
    isDrag.value = false
    setSelectedElement(null)
  }
  // 清除当前高亮
  if (lastHoverElement) {
    lastHoverElement.classList.remove('special-hover-highlight')
    lastHoverElement = null
  }
}
//处理悬停
const handleElementHover = (e) => {
  if (
    !isAllowSelectElement.value ||
    isRotate.value ||
    isDragging.value ||
    contextMenu.visible ||
    isAllowChangeProperty.value ||
    isScale.value ||
    selectedElement.value

  )
    return // 菜单显示时、修改属性时不更新高亮
//先把selectedElement中的高亮去掉
if(selectedElement.value){
  selectedElement.value.classList.remove('special-hover-highlight')
}

  // console.log('鼠标进来了：', e.target)
  let target
  //排除html标签
  if (e.target.tagName !== 'HTML' && e.target.tagName !== 'BODY') target = e.target
  //提示框
  // showTooltip(target)
  //如果没变
  if (target === lastHoverElement) return

  // 移除旧元素的样式
  if (lastHoverElement) {
    lastHoverElement.classList.remove('special-hover-highlight')
  }

  // 添加新元素样式
  target?.classList.add('special-hover-highlight')
  lastHoverElement = target
}
// 处理悬停离开
const handleElementLeave = (e) => {
  if (
    !isAllowSelectElement.value ||
    isRotate.value ||
    isDragging.value ||
    contextMenu.visible ||
    isAllowChangeProperty.value ||
    isScale.value ||
    selectedElement.value
  )
    return

  // console.log(
  //   '鼠标离开了',
  //   e.target,
  //   '然后进入了',
  //   e.relatedTarget,
  //   '是否是从父元素进入子元素：',
  //   !!lastHoverElement?.contains(e.relatedTarget),
  // )
  //移除高亮
  if (!e.relatedTarget || !lastHoverElement?.contains(e.relatedTarget)) {
    lastHoverElement?.classList.remove('special-hover-highlight')
    lastHoverElement = null
  }
  //移除提示框
  const existing = myIframe.value.contentDocument.querySelector('.element-tooltip')
  existing?.remove()
}
//#endregion
//#region 右键菜单 以及修改属性
// 初始化右键菜单
const initContextMenu = (iframeWindow, iframeDocument) => {
  // 禁用默认右键菜单
  iframeDocument.addEventListener('contextmenu', (e) => {
    e.preventDefault()
    showCustomMenu(e)
  })

  // 点击其他区域隐藏菜单

  document.addEventListener('click', hideMenu)
  iframeDocument.addEventListener('click', hideMenu)

  //滚动也隐藏
  iframeWindow.addEventListener('scroll', hideMenu)
}
// 右键显示自定义菜单
//出现右键菜单
const contextMenuDiv = ref(null)
const showCustomMenu = (e) => {
  console.log('右键了一下')
  console.log('selectedElement', selectedElement.value)
  console.log('鼠标点击位置',e.clientX,e.clientY)
  //排除html和body
  if (selectedElement.value?.tagName === 'BODY' || selectedElement.value?.tagName === 'HTML') return
  contextMenu.targetElement = selectedElement.value

  //获取contextMenuDiv的宽高
  const { width, height } = contextMenuDiv.value.getBoundingClientRect()
  //获取iframe的位置和大小
  const iframeRect = myIframe.value.getBoundingClientRect()

  contextMenu.x = e.clientX+width>iframeRect.width?e.clientX-width:e.clientX
  contextMenu.y = e.clientY+height>iframeRect.height?e.clientY-height:e.clientY
 console.log('contextMenu.x',contextMenu.x)
 console.log('contextMenu.y',contextMenu.y)
  contextMenu.visible = true
}
// 隐藏菜单
const hideMenu = () => {
  if (contextMenu.visible) {
    contextMenu.visible = false
  }
}
// 删除元素
const deleteElement = () => {
  //lastHoverElement=== contextMenu.targetElement
  //移除高亮
  lastHoverElement?.classList.remove('special-hover-highlight')
  lastHoverElement = null
  //移除提示框
  const existing = myIframe.value.contentDocument.querySelector('.element-tooltip')
  existing?.remove()

  contextMenu.targetElement?.remove()
  setSelectedElement(null)
  lastSelectedElement = null
  hideMenu()
}
//#endregion
//#region 旋转
const allowRotate = () => {
  isRotate.value = true

  if (isDrag.value) {
    changeDrag()
  }

  const element = contextMenu.targetElement
  hideMenu()
  const iframeDocument = myIframe.value.contentDocument

  // 设置元素的定位（如果是input元素也要设置）
  if (window.getComputedStyle(element).position === 'static') {
    element.style.position = 'relative'
  }

  // 清除旧控制点
  const oldHandle = iframeDocument.querySelector('.rotate-handle')
  if (oldHandle) oldHandle.remove()

  // 获取元素相对于viewport的位置
  const elementRect = element.getBoundingClientRect()
  const topSpace = elementRect.top
  const placeHandleBelow = topSpace < 50

  // 创建旋转控制点
  const handle = iframeDocument.createElement('div')
  handle.className = 'rotate-handle'

  handle.style.cssText = `
    position: absolute;
    width: 12px;
    height: 12px;
    background: #fff;
    border: 2px solid #1890ff;
    border-radius: 50%;
    ${placeHandleBelow ? 'bottom: -40px' : 'top: -40px'};
    left: 50%;
    transform: translateX(-50%);
    cursor: move;
    z-index: 2147483647;
  `

  // 创建连接线
  const line = iframeDocument.createElement('div')
  line.className = 'rotate-line'
  line.style.cssText = `
    position: absolute;
    width: 2px;
    height: 30px;
    background: #1890ff;
    ${placeHandleBelow ? 'top: -28px' : 'bottom: -28px'};
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
  `
  handle.appendChild(line)
  element.appendChild(handle)

  // 提升目标元素的堆叠顺序
  const originalZIndex = element.style.zIndex
  element.style.zIndex = '2147483646'

  const handleMouseDown = (e) => {
    e.preventDefault()
    e.stopPropagation()

    const elementRect = element.getBoundingClientRect()
    const elementCenterX = elementRect.left + elementRect.width / 2
    const elementCenterY = elementRect.top + elementRect.height / 2

    // 获取初始鼠标角度
    const initialMouseX = e.clientX
    const initialMouseY = e.clientY
    const initialAngle = Math.atan2(initialMouseY - elementCenterY, initialMouseX - elementCenterX)

    // 获取当前旋转角度
    let currentRotation = 0
    const rotateValue = element.style.rotate || '0deg'
    const rotateMatch = rotateValue.match(/([-\d.]+)deg/)
    if (rotateMatch) {
      currentRotation = parseFloat(rotateMatch[1])
    }

    const onMouseMove = (e) => {
      const mouseX = e.clientX
      const mouseY = e.clientY

      // 计算角度差值
      const currentAngle = Math.atan2(mouseY - elementCenterY, mouseX - elementCenterX)
      const angleDiff = (currentAngle - initialAngle) * (180 / Math.PI)

      // 将角度差值添加到初始旋转角度上
      const newRotation = currentRotation + angleDiff

      // 使用 rotate 属性而不是 transform
      element.style.rotate = `${newRotation}deg`
    }

    const onMouseUp = () => {
      iframeDocument.removeEventListener('mousemove', onMouseMove)
      iframeDocument.removeEventListener('mouseup', onMouseUp)

      // 恢复原始的z-index
      element.style.zIndex = originalZIndex

      handle.remove()
      isRotate.value = false
    }

    iframeDocument.addEventListener('mousemove', onMouseMove)
    iframeDocument.addEventListener('mouseup', onMouseUp)
  }

  handle.addEventListener('mousedown', handleMouseDown)
}
//#endregion

//#region 放缩

//用transform-origin来控制缩放
// const allowScale = () => {
//   isScale.value = true
//   // 禁用拖拽
//   // const containerDiv = myIframe.value.contentDocument.getElementById('superContainer')
//   // const allSortableElements = containerDiv.querySelectorAll('*')

//   // allSortableElements.forEach((el) => {
//   //   if (el._sortable) {
//   //     el._sortable.option('disabled', true)
//   //   }
//   // })

//   // if (containerDiv._sortable) {
//   //   containerDiv._sortable.option('disabled', true)
//   // }

//   const element = contextMenu.targetElement
//   hideMenu()
//   const iframeDocument = myIframe.value.contentDocument

//   // 先清除可能存在的旧控制点
//   const oldHandles = element.querySelectorAll('.scale-handle')
//   oldHandles.forEach((handle) => handle.remove())

//   // 获取当前的X和Y缩放值
//   const transform = element.style.transform
//   let currentScaleX = 1
//   let currentScaleY = 1

//   if (transform) {
//     const scaleMatch = transform.match(/scale\((\d*\.?\d+),\s*(\d*\.?\d+)\)/)
//     if (scaleMatch) {
//       currentScaleX = parseFloat(scaleMatch[1])
//       currentScaleY = parseFloat(scaleMatch[2])
//     } else {
//       const singleScale = transform.match(/scale\((\d*\.?\d+)\)/)
//       if (singleScale) {
//         currentScaleX = currentScaleY = parseFloat(singleScale[1])
//       }
//     }
//   }

//   // 创建四个角的缩放控制点
//   const corners = ['nw', 'ne', 'se', 'sw']
//   const handles = corners.map((corner) => {
//     const handle = iframeDocument.createElement('div')
//     handle.className = `scale-handle ${corner}`

//     handle.style.cssText = `
//       position: absolute;
//       width: 8px;
//       height: 8px;
//       background: white;
//       border: 1px solid blue;
//       cursor: ${corner}-resize;
//       z-index: 1000;
//     `

//     const offset = 4 / Math.min(currentScaleX, currentScaleY)

//     if (corner.includes('n')) handle.style.top = `${-offset}px`
//     if (corner.includes('s')) handle.style.bottom = `${-offset}px`
//     if (corner.includes('w')) handle.style.left = `${-offset}px`
//     if (corner.includes('e')) handle.style.right = `${-offset}px`

//     element.appendChild(handle)
//     return handle
//   })

//   const handleMouseDown = (e, handle, corner) => {
//     e.stopPropagation()
//     const startX = e.clientX
//     const startY = e.clientY

//     // 获取开始时的缩放值
//     const transform = element.style.transform
//     console.log('开始缩放的元素', transform)
//     let startScaleX = 1
//     let startScaleY = 1

//     if (transform) {
//       const scaleMatch = transform.match(/scale\((\d*\.?\d+),\s*(\d*\.?\d+)\)/)
//       if (scaleMatch) {
//         startScaleX = parseFloat(scaleMatch[1])
//         startScaleY = parseFloat(scaleMatch[2])
//       } else {
//         const singleScale = transform.match(/scale\((\d*\.?\d+)\)/)
//         if (singleScale) {
//           startScaleX = startScaleY = parseFloat(singleScale[1])
//         }
//       }
//     }

//     const origin = {
//       nw: 'bottom right',
//       ne: 'bottom left',
//       se: 'top left',
//       sw: 'top right',
//     }[corner]

//     element.style.transformOrigin = origin

//     const onMouseMove = (e) => {
//       const dx = e.clientX - startX
//       const dy = e.clientY - startY
//       const scaleFactor = 0.005
//       let scaleX = startScaleX
//       let scaleY = startScaleY

//       // 分别计算X和Y方向的缩放
//       switch (corner) {
//         case 'nw': // 左上角
//           scaleX = startScaleX * (1 - dx * scaleFactor)
//           scaleY = startScaleY * (1 - dy * scaleFactor)
//           break
//         case 'ne': // 右上角
//           scaleX = startScaleX * (1 + dx * scaleFactor)
//           scaleY = startScaleY * (1 - dy * scaleFactor)
//           break
//         case 'se': // 右下角
//           scaleX = startScaleX * (1 + dx * scaleFactor)
//           scaleY = startScaleY * (1 + dy * scaleFactor)
//           break
//         case 'sw': // 左下角
//           scaleX = startScaleX * (1 - dx * scaleFactor)
//           scaleY = startScaleY * (1 + dy * scaleFactor)
//           break
//       }

//       // 限制最小和最大缩放值
//       scaleX = Math.max(0.1, Math.min(5, scaleX))
//       scaleY = Math.max(0.1, Math.min(5, scaleY))

//       // 应用分别的X和Y缩放
//       element.style.transform = `scale(${scaleX}, ${scaleY})`

//       // 更新控制点位置
//       const offset = 4 / Math.min(scaleX, scaleY)
//       handles.forEach((h) => {
//         if (h.classList.contains('nw')) {
//           h.style.top = `${-offset}px`
//           h.style.left = `${-offset}px`
//         } else if (h.classList.contains('ne')) {
//           h.style.top = `${-offset}px`
//           h.style.right = `${-offset}px`
//         } else if (h.classList.contains('se')) {
//           h.style.bottom = `${-offset}px`
//           h.style.right = `${-offset}px`
//         } else if (h.classList.contains('sw')) {
//           h.style.bottom = `${-offset}px`
//           h.style.left = `${-offset}px`
//         }
//       })
//     }

//     const onMouseUp = () => {
//       iframeDocument.removeEventListener('mousemove', onMouseMove)
//       iframeDocument.removeEventListener('mouseup', onMouseUp)

//       // if (!iframeDocument.querySelector('.scale-handle:hover')) {
//       handles.forEach((h) => h.remove())
//       isScale.value = false

//       // 重新启用拖拽
//       // allSortableElements.forEach((el) => {
//       //   if (el._sortable) {
//       //     el._sortable.option('disabled', false)
//       //   }
//       // })
//       // if (containerDiv._sortable) {
//       //   containerDiv._sortable.option('disabled', false)
//       // }
//       // }

//       //打印缩放后的元素
//       console.log('缩放后的元素', element.style.transform)
//     }

//     iframeDocument.addEventListener('mousemove', onMouseMove)
//     iframeDocument.addEventListener('mouseup', onMouseUp)
//   }

//   handles.forEach((handle, index) => {
//     handle.addEventListener('mousedown', (e) => handleMouseDown(e, handle, corners[index]))
//   })
// }
//用zoom来控制缩放
const allowScale = () => {
  isScale.value = true

  if (isDrag.value) {
    changeDrag()
  }
  const element = contextMenu.targetElement
  hideMenu()
  const iframeDocument = myIframe.value.contentDocument

  // 确保元素有正确的定位
  if (window.getComputedStyle(element).position === 'static') {
    element.style.position = 'relative'
  }

  // 先清除可能存在的旧控制点
  const oldHandles = element.querySelectorAll('.scale-handle')
  oldHandles.forEach((handle) => handle.remove())

  // 获取当前的zoom值
  const currentZoom = parseFloat(element.style.zoom || 1)

  // 创建四个角的缩放控制点
  const corners = ['nw', 'ne', 'se', 'sw']
  const handles = corners.map((corner) => {
    const handle = iframeDocument.createElement('div')
    handle.className = `scale-handle ${corner}`

    handle.style.cssText = `
      position: absolute;
      width: 8px;
      height: 8px;
      background: white;
      border: 1px solid blue;
      cursor: ${corner}-resize;
      z-index: 1000;
    `

    const offset = 4 / currentZoom

    if (corner.includes('n')) handle.style.top = `${-offset}px`
    if (corner.includes('s')) handle.style.bottom = `${-offset}px`
    if (corner.includes('w')) handle.style.left = `${-offset}px`
    if (corner.includes('e')) handle.style.right = `${-offset}px`

    element.appendChild(handle)
    return handle
  })

  const handleMouseDown = (e, handle, corner) => {
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY

    // 获取开始时的zoom值
    const startZoom = parseFloat(element.style.zoom || 1)
    console.log('开始缩放的元素zoom:', startZoom)

    const onMouseMove = (e) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const scaleFactor = 0.005
      let newZoom = startZoom

      // 根据拖动方向计算缩放
      switch (corner) {
        case 'nw': // 左上角
          newZoom = startZoom * (1 - ((dx + dy) * scaleFactor) / 2)
          break
        case 'ne': // 右上角
          newZoom = startZoom * (1 + ((dx - dy) * scaleFactor) / 2)
          break
        case 'se': // 右下角
          newZoom = startZoom * (1 + ((dx + dy) * scaleFactor) / 2)
          break
        case 'sw': // 左下角
          newZoom = startZoom * (1 + ((-dx + dy) * scaleFactor) / 2)
          break
      }

      // 限制最小和最大缩放值
      newZoom = Math.max(0.1, Math.min(5, newZoom))

      // 应用zoom
      element.style.zoom = newZoom

      // 更新控制点位置
      const offset = 4 / newZoom
      handles.forEach((h) => {
        if (h.classList.contains('nw')) {
          h.style.top = `${-offset}px`
          h.style.left = `${-offset}px`
        } else if (h.classList.contains('ne')) {
          h.style.top = `${-offset}px`
          h.style.right = `${-offset}px`
        } else if (h.classList.contains('se')) {
          h.style.bottom = `${-offset}px`
          h.style.right = `${-offset}px`
        } else if (h.classList.contains('sw')) {
          h.style.bottom = `${-offset}px`
          h.style.left = `${-offset}px`
        }
      })
    }

    const onMouseUp = () => {
      iframeDocument.removeEventListener('mousemove', onMouseMove)
      iframeDocument.removeEventListener('mouseup', onMouseUp)

      handles.forEach((h) => h.remove())
      isScale.value = false

      console.log('缩放后的元素zoom:', element.style.zoom)
    }

    iframeDocument.addEventListener('mousemove', onMouseMove)
    iframeDocument.addEventListener('mouseup', onMouseUp)
  }

  handles.forEach((handle, index) => {
    handle.addEventListener('mousedown', (e) => handleMouseDown(e, handle, corners[index]))
  })
}
//#endregion
//#region 修改属性
//开启修改属性
const allowChangeProperty = () => {
  isAllowChangeProperty.value = !isAllowChangeProperty.value
  hideMenu()
}
// //取消修改属性
// const cancelChangedProperty = () => {
//   setTimeout(() => {
//     isAllowChangeProperty.value = false
//   }, 500)
// }
//保存修改后的属性
const saveChangedProperty = () => {
  if (!isAllowChangeProperty.value) return

  //保存赋值
  for (const item in targetElementPropertyList.value) {
    //如果一样的，那就不变，
    if (targetElementPropertyList.value[item].value !== beforeSave[item].value) {
      //长和宽需要响应式，(罪魁祸首在于元素可能没有宽高，而是由子元素和padding撑开，所以不管对该元素的宽高设置什么都是不对的不论是vh还是百分比)
      if (item === 'width' || item === 'height') {
        //#region 百分比
        // const percent =
        //   Math.floor(
        //     (targetElementPropertyList.value[item].value /
        //       window
        //         .getComputedStyle(contextMenu.targetElement.parentElement)
        //         [item].split('px')[0]) *
        //       100,
        //   ) + '%'
        // console.log(
        //   `父元素${item}`,
        //   parseInt(
        //     window.getComputedStyle(contextMenu.targetElement.parentElement)[item].split('px')[0],
        //   ),
        //   `子元素${item}`,
        //   parseInt(targetElementPropertyList.value[item].value),
        //   '百分比',
        //   percent,
        // )
        //#endregion
        //转换为内距
        // const padding =
        //   (targetElementPropertyList.value[item].value -
        //     window.getComputedStyle(contextMenu.targetElement)[item].split('px')[0]) /
        //   2
        // console.log(padding)
        // if (item === 'width') {
        //   contextMenu.targetElement.style['padding-left'] =
        //     `${-contextMenu.targetElement.style['padding-left'].split('px')[0] + padding}px`
        //   contextMenu.targetElement.style['padding-right'] =
        //     `${-contextMenu.targetElement.style['padding-right'].split('px')[0] + padding}px`
        // } else {
        //   contextMenu.targetElement.style['padding-top'] =
        //     `${-contextMenu.targetElement.style['padding-top'].split('px')[0] + padding}px`
        //   contextMenu.targetElement.style['padding-bottom'] =
        //     `${-contextMenu.targetElement.style['padding-bottom'].split('px')[0] + padding}px`
        // }
        contextMenu.targetElement.style[item] = targetElementPropertyList.value[item].value + 'px'
      } else {
        //除了长宽以外的属性
        if (window.getComputedStyle(contextMenu.targetElement)[item].includes('px')) {
          contextMenu.targetElement.style[item] = targetElementPropertyList.value[item].value + 'px'
        } else {
          contextMenu.targetElement.style[item] = targetElementPropertyList.value[item].value
        }

        // console.log('修改后：', contextMenu.targetElement.style[item])
      }
    }
  }

  // targetElementPropertyList.value = null

  //没用的，还得改一下。延时是因为有bug,在点击了保存或者取消，但还没关闭属性栏时（），快速点击别的元素会有bug
  setTimeout(() => {
    isAllowChangeProperty.value = false
  }, 500)
}
//#endregion

//#region 拖拽

const changeDrag = () => {
  isDrag.value = !isDrag.value
  if (isDrag.value) {
    initDrag(myIframe.value.contentDocument)
  } else {
    // 销毁所有 Sortable 实例
    sortableInstances.forEach((instance) => {
      instance.destroy()
    })
    sortableInstances = []
  }
}

const initDrag = (iframeDocument) => {
  // 清空之前的实例
  sortableInstances = []

  const body = iframeDocument.body
  // const containerDiv = iframeDocument.createElement('div')
  // containerDiv.id = 'superContainer'

  // const bodyChildren = [...body.children]
  // bodyChildren.forEach((child) => {
  //   containerDiv.appendChild(child)
  // })

  // body.appendChild(containerDiv)

  // 创建主容器的 Sortable 实例
  const mainSortable = new Sortable(body, {
    animation: 150,
    draggable: '*',
    group: {
      name: 'root',
      put: ['component'],
    },
    fallbackOnBody: true,
    onStart: function (evt) {
      isDragging.value = true
      console.log('开始拖拽时的transform', evt.item.style.transform)
    },
    onEnd: function (evt) {
      isDragging.value = false
      console.log('元素交换位置:', evt.oldIndex, evt.newIndex)
      console.log('元素交换位置后的transform', evt.item.style.transform)
    },
    onAdd: function (evt) {
      const item = evt.item
      if (item.classList.contains('component-item')) {
        // 获取组件的索引
        const index = evt.oldIndex
        // 获取实际的模板内容
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = components.value[index].template.html
        const actualElement = tempDiv.firstElementChild

        // 替换放置的元素
        item.parentNode.replaceChild(actualElement, item)

        // 检查组件是否有JavaScript代码需要插入
        if (
          components.value[index].template &&
          typeof components.value[index].template === 'object' &&
          components.value[index].template.js
        ) {
          // 创建一个新的script元素
          const scriptElement = iframeDocument.createElement('script')
          // 直接设置JavaScript代码内容
          scriptElement.textContent = components.value[index].template.js
          // 添加到body中执行
          body.appendChild(scriptElement)
        }

        // 如果新添加的元素有子元素，将其初始化为 Sortable 实例
        if (actualElement.children.length > 0) {
          // 生成唯一的组名
          const uniqueIndex = `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`

          const newSortable = new Sortable(actualElement, {
            animation: 150,
            draggable: '*',
            group: {
              name: `shared${uniqueIndex}`,
              put: ['component'], // 允许接收组件库和自身的元素
            },
            fallbackOnBody: true,

            onStart: function (evt) {
              isDragging.value = true
              console.log('开始拖拽时的transform', evt.item.style.transform)
            },
            onEnd: function (evt) {
              isDragging.value = false
              console.log('嵌套元素交换位置:', evt.oldIndex, evt.newIndex)
              console.log('嵌套元素交换位置后的transform', evt.item.style.transform)
            },

            // 递归处理，当有新组件拖入时也初始化
            onAdd: function (evt) {
              const item = evt.item
              if (item.classList.contains('component-item')) {
                // 获取组件的索引
                const index = evt.oldIndex
                // 获取实际的模板内容
                const tempDiv = document.createElement('div')
                tempDiv.innerHTML = components.value[index].template.html
                const actualElement = tempDiv.firstElementChild

                // 替换放置的元素
                item.parentNode.replaceChild(actualElement, item)

                // 检查组件是否有JavaScript代码需要插入
                if (
                  components.value[index].template &&
                  typeof components.value[index].template === 'object' &&
                  components.value[index].template.js
                ) {
                  // 创建一个新的script元素
                  const scriptElement = iframeDocument.createElement('script')
                  // 直接设置JavaScript代码内容
                  scriptElement.textContent = components.value[index].template.js
                  // 添加到body中执行
                  body.appendChild(scriptElement)
                }

                // 递归初始化
                if (actualElement.children.length > 0) {
                  initElementAsSortable(actualElement)
                }
              }
            },
          })

          // 将新实例添加到实例列表中
          sortableInstances.push(newSortable)

          // 递归初始化所有子元素
          initNestedSortables(actualElement)
        }
      }
    },
  })
  sortableInstances.push(mainSortable)

  // 为嵌套容器创建 Sortable 实例
  const nestedContainers = body.querySelectorAll('*')
  nestedContainers.forEach((nestedContainer, index) => {
    if (nestedContainer.children.length > 0) {
      const nestedSortable = new Sortable(nestedContainer, {
        animation: 150,
        draggable: '*',
        group: {
          name: `shared${index}`,
          put: ['component'], // 允许接收组件库和自身的元素
        },
        fallbackOnBody: true,

        onStart: function (evt) {
          isDragging.value = true

          console.log('开始拖拽时的transform', evt.item.style.transform)
        },
        onEnd: function (evt) {
          isDragging.value = false
          console.log('嵌套元素交换位置:', evt.oldIndex, evt.newIndex)
          console.log('嵌套元素交换位置后的transform', evt.item.style.transform)
        },

        onAdd: function (evt) {
          const item = evt.item
          if (item.classList.contains('component-item')) {
            // 获取组件的索引
            const index = evt.oldIndex
            // 获取实际的模板内容
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = components.value[index].template.html
            const actualElement = tempDiv.firstElementChild

            // 替换放置的元素
            item.parentNode.replaceChild(actualElement, item)

            // 检查组件是否有JavaScript代码需要插入
            if (
              components.value[index].template &&
              typeof components.value[index].template === 'object' &&
              components.value[index].template.js
            ) {
              // 创建一个新的script元素
              const scriptElement = iframeDocument.createElement('script')
              // 直接设置JavaScript代码内容
              scriptElement.textContent = components.value[index].template.js
              // 添加到body中执行
              body.appendChild(scriptElement)
            }

            // 如果新添加的元素有子元素，将其初始化为 Sortable 实例
            if (actualElement.children.length > 0) {
              // 生成唯一的组名
              const uniqueIndex = `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`

              const newSortable = new Sortable(actualElement, {
                animation: 150,
                draggable: '*',
                group: {
                  name: `shared${uniqueIndex}`,
                  put: ['component'], // 允许接收组件库和自身的元素
                },
                fallbackOnBody: true,

                onStart: function (evt) {
                  isDragging.value = true
                  console.log('开始拖拽时的transform', evt.item.style.transform)
                },
                onEnd: function (evt) {
                  isDragging.value = false
                  console.log('嵌套元素交换位置:', evt.oldIndex, evt.newIndex)
                  console.log('嵌套元素交换位置后的transform', evt.item.style.transform)
                },

                // 递归处理，当有新组件拖入时也初始化
                onAdd: function (evt) {
                  const item = evt.item
                  if (item.classList.contains('component-item')) {
                    // 获取组件的索引
                    const index = evt.oldIndex
                    // 获取实际的模板内容
                    const tempDiv = document.createElement('div')
                    tempDiv.innerHTML = components.value[index].template.html
                    const actualElement = tempDiv.firstElementChild

                    // 替换放置的元素
                    item.parentNode.replaceChild(actualElement, item)

                    // 检查组件是否有JavaScript代码需要插入
                    if (
                      components.value[index].template &&
                      typeof components.value[index].template === 'object' &&
                      components.value[index].template.js
                    ) {
                      // 创建一个新的script元素
                      const scriptElement = iframeDocument.createElement('script')
                      // 直接设置JavaScript代码内容
                      scriptElement.textContent = components.value[index].template.js
                      // 添加到body中执行
                      body.appendChild(scriptElement)
                    }

                    // 递归初始化
                    if (actualElement.children.length > 0) {
                      initElementAsSortable(actualElement)
                    }
                  }
                },
              })

              // 将新实例添加到实例列表中
              sortableInstances.push(newSortable)

              // 递归初始化所有子元素
              initNestedSortables(actualElement)
            }
          }
        },
      })
      sortableInstances.push(nestedSortable)
    }
  })
}

// 辅助函数：初始化元素为 Sortable 实例
const initElementAsSortable = (element) => {
  if (element.children.length > 0) {
    const uniqueIndex = `new-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    const newSortable = new Sortable(element, {
      animation: 150,
      draggable: '*',
      group: {
        name: `shared${uniqueIndex}`,
        put: ['component'], // 允许接收组件库和自身的元素
      },
      fallbackOnBody: true,

      onStart: function (evt) {
        isDragging.value = true
        console.log('开始拖拽时的transform', evt.item.style.transform)
      },
      onEnd: function (evt) {
        isDragging.value = false
        console.log('嵌套元素交换位置:', evt.oldIndex, evt.newIndex)
        console.log('嵌套元素交换位置后的transform', evt.item.style.transform)
      },

      onAdd: function (evt) {
        const item = evt.item
        if (item.classList.contains('component-item')) {
          // 获取组件的索引
          const index = evt.oldIndex
          // 获取实际的模板内容
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = components.value[index].template.html
          const actualElement = tempDiv.firstElementChild

          // 替换放置的元素
          item.parentNode.replaceChild(actualElement, item)

          // 检查组件是否有JavaScript代码需要插入
          if (
            components.value[index].template &&
            typeof components.value[index].template === 'object' &&
            components.value[index].template.js
          ) {
            // 创建一个新的script元素
            const scriptElement = iframeDocument.createElement('script')
            // 直接设置JavaScript代码内容
            scriptElement.textContent = components.value[index].template.js
            // 添加到body中执行
            body.appendChild(scriptElement)
          }

          // 递归初始化
          if (actualElement.children.length > 0) {
            initElementAsSortable(actualElement)
          }
        }
      },
    })

    sortableInstances.push(newSortable)

    // 递归初始化所有子元素
    initNestedSortables(element)
  }
}

// 辅助函数：递归初始化所有嵌套元素
const initNestedSortables = (parentElement) => {
  const nestedElements = parentElement.querySelectorAll('*')
  nestedElements.forEach((element) => {
    if (element.children.length > 0) {
      initElementAsSortable(element)
    }
  })
}

//#endregion

const exportCode = () => {
  console.log('导出代码')
  // 获取iframe内容
  const iframeContent = myIframe.value.contentDocument.documentElement.outerHTML

  // 创建下载链接
  const link = document.createElement('a')
  link.href = 'data:text/html;charset=utf-8,' + encodeURIComponent(iframeContent)
  link.download = 'code.html'
  link.click()
}

const AIChange = () => {
  setIsRequireAIChange(!isRequireAIChange.value)
}
let lastSelectedElement = null
const treeClick = (e) => {
  //如果开启了元素选择，则可以点击元素
  if (isAllowSelectElement.value) {
    //设置被点击元素（即被选中元素）
    setSelectedElement(e.target)
    console.log('treeClick', selectedElement.value)
    //如果和上次被选中元素是同一个，则取消其选中
    if(lastSelectedElement===selectedElement.value){
      selectedElement.value?.classList.remove('special-hover-highlight')
      setSelectedElement(null)
      lastSelectedElement = null
    }else{
      lastSelectedElement?.classList.remove('special-hover-highlight')

      selectedElement.value?.classList.add('special-hover-highlight')
      lastSelectedElement = selectedElement.value
    }
  }
}

//只有在iframeload完毕之后才可对其进行操作

// 简化iframeLoad函数，移除重复的监听
const iframeLoad = () => {
  setIsAllowSelectElement(false)
  setIsRequireAIChange(false)
  setSelectedElement(null)
  isDrag.value = false
  const iframeWindow = myIframe.value.contentWindow
  const iframeDocument = myIframe.value.contentDocument
  setIframeEntrance(iframeDocument)

  initHoverAndLeaveEffect(iframeDocument)
  initContextMenu(iframeWindow, iframeDocument)
  //通知元素树现在点击的元素
  iframeDocument.addEventListener('click', treeClick)
}

const defaultIframeContent = `
  <!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: 'PingFang SC', 'Microsoft YaHei', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      background-color: #f9fafb;
      color: #6b7280;
    }
    .container {
      text-align: center;
      padding: 2rem;
      background-color: white;
      border-radius: 0.75rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      max-width: 80%;
    }
    .message {
      font-size: 1.25rem;
      margin-bottom: 1rem;
      font-weight: 500;
    }
    .tip {
      font-size: 0.875rem;
      color: #9ca3af;
    }
    .spinner {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      border: 3px solid rgba(139, 92, 246, 0.3);
      border-radius: 50%;
      border-top-color: #8b5cf6;
      animation: spin 1s ease-in-out infinite;
      margin-bottom: 1rem;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <div class="message">开始您的创作之旅...</div>
    <div class="tip">可以使用右侧AI助手，直接输入您的需求来生成页面</div>
  </div>
</body>
</html>
`
// 导出方法，以便其他组件可以调用
defineExpose({})
</script>
<template>
  <div ref="iframeWrapper" class="iframe-wrapper">
    <iframe
      @load="iframeLoad"
      ref="myIframe"
      :srcdoc="props.page?.htmlContent || defaultIframeContent"
      frameborder="0"
    ></iframe>
    <!-- 右键菜单 -->
    <div
      v-show="contextMenu.visible"
      ref="contextMenuDiv"
      :style="{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }"
      class="context-menu"
    >
      <button class="menu-item" @click="deleteElement" :disabled="!isAllowSelectElement||!selectedElement">
        删除
      </button>
      <!-- <button class="menu-item" id="changeProperty" :disabled="!isAllowSelectElement||!selectedElement">
        {{ isAllowChangeProperty ? '关闭修改属性' : '开启修改属性' }}
      </button> -->
      <button class="menu-item" @click="allowRotate" :disabled="!isAllowSelectElement||!selectedElement">旋转</button>
      <button class="menu-item" @click="allowScale" :disabled="!isAllowSelectElement||!selectedElement">放缩</button>
      <button
        class="menu-item"
        @click="changeDrag"
        :disabled="isScale || isRotate || !isAllowSelectElement"
      >
        {{ isDrag === true ? '关闭全局元素拖拽' : '开启全局元素拖拽' }}
      </button>
      <button class="menu-item" @click="changeAllowSelect">
        {{ isAllowSelectElement ? '关闭全局元素选择' : '开启全局元素选择' }}
      </button>
      <button class="menu-item" @click="exportCode">导出代码</button>
      <button class="menu-item" @click="AIChange" :disabled="!isAllowSelectElement">
        {{ isRequireAIChange ? '关闭AI修改' : '开启AI修改' }}
      </button>
    </div>
  </div>
</template>
<style lang="less" scoped>
.iframe-wrapper {
  width: 100%;
  height: 100%;
  position: relative;

  background-color: white;
  // transition: all 0.3s ease;
  // resize: both;
  overflow: hidden; /* 确保滚动条在调整大小时可用 */
  iframe {
    width: 100%;
    height: 100%;
    border-radius: 10px;
    outline: 1px solid rgb(229, 231, 235);
    //滚动条样式
  }
}

.property {
  transition: transform 0.3s ease;
  position: relative;
  // width: 400px;
  height: 600px;
  background-color: #f5f5f5;
  .item {
    display: flex;
    flex-direction: row;
    align-items: center;
    height: 40px;
    line-height: 40px;
    span {
      // padding: 5px 5px;
      display: inline-block;
      width: 70px;
    }
    input {
      padding: 5px 5px;
      background: #42b983;
      border-radius: 4px;
      text-align: center;
    }
  }
}
//是button但是类不是menu-item
button:not(.menu-item) {
  position: absolute;
  z-index: 999;

  padding: 8px 16px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;

  &.isFullscreen {
    top: 10px;
    right: 20px;
  }
  &.property-save {
    bottom: 10px;
    right: 20px;
  }
  &.property-cancel {
    bottom: 10px;
    right: 100px;
  }
}
.context-menu {
  position: absolute;
  background: rgba(255, 245, 250, 0.92);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 10px;
  box-shadow:
    0 8px 32px rgba(183, 157, 255, 0.25),
    // 调整阴影颜色为偏紫
    0 0 0 1px rgba(190, 170, 255, 0.15),
    inset 0 0 32px rgba(183, 157, 255, 0.12);
  border: 1px solid rgba(190, 170, 255, 0.35);
  z-index: 9999;
  min-width: 180px;
  animation: fadeIn 0.3s ease-out;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(183, 157, 255, 0.12) 0%, transparent 70%);
    animation: rotate 15s linear infinite;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      45deg,
      transparent 0%,
      rgba(255, 255, 255, 0.12) 45%,
      rgba(255, 255, 255, 0.25) 50%,
      rgba(255, 255, 255, 0.12) 55%,
      transparent 100%
    );
    animation: shine 4s ease-in-out infinite;
    pointer-events: none;
  }

  .menu-item {
    position: relative;
    display: block;
    width: 100%;
    padding: 10px 16px;
    border: none;
    background: transparent;
    color: rgb(188, 114, 219); // 更改为紫色
    font-size: 14px;
    font-weight: bold;
    text-align: left;
    cursor: pointer;
    border-radius: 8px;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;

    &:hover {
      background: linear-gradient(135deg, rgba(183, 157, 255, 0.25), rgba(190, 170, 255, 0.2));
      color: #6c3dd3; // 悬停时的深紫色
      transform: translateX(4px);
      text-shadow: 0 0 8px rgba(134, 87, 224, 0.2);

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(183, 157, 255, 0.5), transparent);
        animation: sparkle 1.5s ease-in-out infinite;
        pointer-events: none;
      }
    }

    &:disabled {
      color: #b4a2e0; // 禁用状态的浅紫色
      cursor: not-allowed;
      opacity: 0.5;
      &:hover {
        background: transparent;
        transform: none;
        text-shadow: none;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes sparkle {
  0% {
    left: -100%;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    left: 100%;
    opacity: 0;
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes shine {
  0%,
  100% {
    opacity: 0;
    transform: translateX(-100%);
  }
  50% {
    opacity: 1;
    transform: translateX(100%);
  }
}
</style>
