<script setup>
import { ref, watch, reactive, onUnmounted, nextTick, defineProps } from 'vue'
import { storeToRefs } from 'pinia'

import { useOriginalCodeStore } from '@/stores'
import { useComponentAreaStore } from '@/stores'
import { useAiChatStore } from '@/stores'
import Sortable from 'sortablejs'

const originalCodeStore = useOriginalCodeStore()
const { originalCode } = storeToRefs(originalCodeStore)
const componentArea = useComponentAreaStore()
const { components } = storeToRefs(componentArea)
const aiChatStore = useAiChatStore()
const { setSelectedElement, setIframeEntrance, setIsRequireAIChange } = aiChatStore
const { isRequireAIChange } = storeToRefs(aiChatStore)
const myIframe = ref(null)
const iframeWrapper = ref(null)
const iframeObserver = ref(null) // 用于存储MutationObserver实例
let lastHoverElement = null
const isDragging = ref(false)
const isAllowSelectElement = ref(false)
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
    required: true
  }
})

//#region 元素信息展示模块

const initHoverAndLeaveEffect = (iframeDocument) => {
  console.log('iframe重新加载了')
  console.log(myIframe.value.contentDocument)

  //禁止所有a标签跳转
  const aTags = iframeDocument.querySelectorAll('a')
  aTags.forEach((aTag) => {
    aTag.addEventListener('click', (event) => {
      //禁止#号跳转
      if (aTag.href.includes('#')) {
        event.preventDefault() // 阻止默认行为
      }
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
        outline: 1px dashed #f00;
        animation: pulse 1s infinite;
        background-color: rgba(255, 0, 0, 0.1);
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
  isAllowSelectElement.value = !isAllowSelectElement.value
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
    isRequireAIChange.value
  )
    return // 菜单显示时、修改属性时不更新高亮

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
    isRequireAIChange.value
  )
    return // 菜单显示时、修改属性时不更新高亮

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
//监听srcdoc变化
watch(
  originalCode,
  (newCode) => {
    console.log('originalCode发生变化，将重新加载iframe')

    // 如果iframe已经加载，则重新加载
    if (myIframe.value) {
      // 断开之前的MutationObserver
      if (iframeObserver.value) {
        iframeObserver.value.disconnect()
      }

      // 重新设置iframe的srcdoc，这将触发iframe的load事件
      // 注意：这里使用nextTick确保Vue更新完DOM后再操作
      nextTick(() => {
        myIframe.value.srcdoc = newCode
      })
    }
  },
  { deep: true },
)
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
const showCustomMenu = (e) => {
  console.log('右键了一下')
  //排除html和body
  if (e.target.tagName === 'BODY' || e.target.tagName === 'HTML') return
  contextMenu.targetElement = e.target
  // const iframeRect = myIframe.value.getBoundingClientRect()
  //菜单出现位置
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.visible = true

  //元素对应可修改的属性（不同的元素能修改的属性是不同的）

  targetElementPropertyList.value = propertyList.find(
    (item) => item.name === contextMenu.targetElement.tagName,
  ).props

  //getComputedStyle可以获取内联和非内联样式，而.style只能获取内联样式
  const sourceCss = window.getComputedStyle(e.target)
  for (const item in targetElementPropertyList.value) {
    targetElementPropertyList.value[item].value = sourceCss[item].includes('px')
      ? sourceCss[item].split('px')[0]
      : sourceCss[item]
  }
  console.log('读取到的属性', targetElementPropertyList.value)
  beforeSave = JSON.parse(JSON.stringify(targetElementPropertyList.value))
  console.log('被保存前（同上）', beforeSave)
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
  isAllowChangeProperty.value = true
  hideMenu()
}
//取消修改属性
const cancelChangedProperty = () => {
  setTimeout(() => {
    isAllowChangeProperty.value = false
  }, 500)
}
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
  const containerDiv = iframeDocument.createElement('div')
  containerDiv.id = 'superContainer'

  const bodyChildren = [...body.children]
  bodyChildren.forEach((child) => {
    containerDiv.appendChild(child)
  })

  body.appendChild(containerDiv)

  // 创建主容器的 Sortable 实例
  const mainSortable = new Sortable(containerDiv, {
    animation: 150,
    draggable: '*',
    group: 'shared',
    onStart: function (evt) {
      isDragging.value = true
      console.log('开始拖拽时的transform', evt.item.style.transform)
    },
    onEnd: function (evt) {
      isDragging.value = false
      console.log('元素交换位置:', evt.oldIndex, evt.newIndex)
      console.log('元素交换位置后的transform', evt.item.style.transform)
    },
  })
  sortableInstances.push(mainSortable)

  // 为嵌套容器创建 Sortable 实例
  const nestedContainers = containerDiv.querySelectorAll('*')
  nestedContainers.forEach((nestedContainer) => {
    if (nestedContainer.children.length > 0) {
      const nestedSortable = new Sortable(nestedContainer, {
        animation: 150,
        draggable: '*',
        group: 'shared',
        onStart: function (evt) {
          isDragging.value = true

          console.log('开始拖拽时的transform', evt.item.style.transform)
        },
        onEnd: function (evt) {
          isDragging.value = false
          console.log('嵌套元素交换位置:', evt.oldIndex, evt.newIndex)
          console.log('嵌套元素交换位置后的transform', evt.item.style.transform)
        },
        // onAdd: function (evt) {
        //   console.log('元素被添加', evt)
        //   //打印实际添加的元素
        //   console.log('实际添加的元素', evt.item)
        // },
        onAdd: function (evt) {
          const item = evt.item
          if (item.classList.contains('component-item')) {
            // 获取组件的索引
            const index = evt.oldIndex
            // 获取实际的模板内容
            const tempDiv = document.createElement('div')
            tempDiv.innerHTML = components.value[index].template
            const actualElement = tempDiv.firstElementChild

            // 替换放置的元素
            item.parentNode.replaceChild(actualElement, item)
          }
        },
      })
      sortableInstances.push(nestedSortable)
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
  if (isRequireAIChange.value) {
    setSelectedElement(lastHoverElement)
  } else {
    setSelectedElement(null)
  }
}

//只有在iframeload完毕之后才可对其进行操作

// 处理iframe文档变化的函数
const handleIframeDocumentChange = (mutations) => {
  console.log('iframe文档发生变化:', mutations)

  // 过滤出添加或删除节点的变化
  const nodeChanges = mutations.filter(
    (mutation) =>
      mutation.type === 'childList' &&
      (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0),
  )

  // 过滤出属性变化
  const attributeChanges = mutations.filter((mutation) => mutation.type === 'attributes')

  // 如果有节点添加或删除
  if (nodeChanges.length > 0) {
    console.log('DOM结构发生变化，节点添加或删除')
    // 这里可以执行DOM结构变化后的逻辑
    // 例如：重新初始化拖拽功能、更新组件树等
  }

  // 如果有属性变化
  if (attributeChanges.length > 0) {
    console.log('元素属性发生变化')
    // 这里可以执行属性变化后的逻辑
    // 例如：更新样式面板、同步状态等
  }

  // 如果需要，可以在这里触发Vue的响应式更新
  // nextTick(() => {
  //   // 更新UI或状态
  // });
}

const iframeLoad = () => {
  const iframeWindow = myIframe.value.contentWindow
  const iframeDocument = myIframe.value.contentDocument
  setIframeEntrance(iframeDocument)

  initHoverAndLeaveEffect(iframeDocument) // 调用 initHoverEffect 函数
  initContextMenu(iframeWindow, iframeDocument) //右键菜单

  // 使用MutationObserver监听iframe文档变化
  const observer = new MutationObserver(handleIframeDocumentChange)

  // 配置观察选项
  const config = {
    attributes: true, // 监听属性变化
    childList: true, // 监听子节点增删
    subtree: true, // 监听所有后代节点
    characterData: true, // 监听文本内容变化
  }

  // 开始观察目标节点
  observer.observe(iframeDocument.body, config)

  // 将observer保存到ref中，以便在组件卸载时断开连接
  iframeObserver.value = observer
}

// 在组件卸载时断开MutationObserver连接
onUnmounted(() => {
  if (iframeObserver.value) {
    iframeObserver.value.disconnect()
    console.log('MutationObserver已断开连接')
  }
})

// 监听页面内容变化，更新iframe内容
watch(() => props.page, (newPage) => {
  if (newPage) {
    console.log('页面内容已更新，正在更新iframe...');
    // 优先使用htmlContent，如果没有则使用content
    const content = newPage.htmlContent || newPage.content || '';
    originalCodeStore.changeOriginalCode(content);

    // 如果iframe已经加载，则手动重新加载
    if (myIframe.value) {
      reloadIframe();
    }
  }
}, { deep: true });

// 手动重新加载iframe内容的方法
const reloadIframe = () => {
  console.log('手动重新加载iframe内容');

  // 断开之前的MutationObserver
  if (iframeObserver.value) {
    iframeObserver.value.disconnect();
  }

  // 重新加载iframe
  if (myIframe.value) {
    // 优先使用页面的htmlContent，如果没有则使用content，最后才使用originalCode
    const content = props.page?.htmlContent || props.page?.content || originalCode.value;
    myIframe.value.srcdoc = content;
  }
}

// 导出方法，以便其他组件可以调用
defineExpose({
  reloadIframe,
})
</script>
<template>
  <div ref="iframeWrapper" class="iframe-wrapper">
    <iframe @load="iframeLoad" ref="myIframe" :srcdoc="props.page?.htmlContent || props.page?.content || originalCode" frameborder="0"></iframe>
    <!-- 右键菜单 -->
    <div
      v-if="contextMenu.visible"
      :style="{
        left: `${contextMenu.x}px`,
        top: `${contextMenu.y}px`,
      }"
      class="context-menu"
    >
      <button class="menu-item" @click="deleteElement" :disabled="!isAllowSelectElement">
        删除
      </button>
      <button
        class="menu-item"
        @click="allowChangeProperty"
        id="changeProperty"
        :disabled="!isAllowSelectElement"
      >
        修改属性
      </button>
      <button class="menu-item" @click="allowRotate" :disabled="!isAllowSelectElement">旋转</button>
      <button class="menu-item" @click="allowScale" :disabled="!isAllowSelectElement">放缩</button>
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

  <div class="property" v-if="isAllowChangeProperty">
    <div
      class="item"
      v-for="(item, index) in Object.values(targetElementPropertyList)"
      :key="index"
    >
      <span>{{ item.name }}：</span>
      <input v-model="item.value" />
    </div>

    <button @click="cancelChangedProperty" class="property-cancel">取消</button>
    <button @click="saveChangedProperty" class="property-save">保存</button>
  </div>
</template>
<style scoped lang="less">
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
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  z-index: 9999;
  min-width: 120px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  flex-direction: column;
  &:hover {
    background: #f5f5f5;
  }
}
</style>
