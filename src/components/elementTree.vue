<template>
  <div class="element-tree" @click="clearSelection">
    <div class="element-tree-header" @click.stop @click="showContextMenu = false">
      <h3>节点树</h3>
    </div>
    <div class="tree-container" @click.stop>
      <div v-if="elementTree.length > 0" class="tree-root">
        <TreeNode
          v-for="node in elementTree"
          :key="node.id"
          :node="node"
          @node-selected="handleNodeSelected"
          @node-context-menu="handleNodeContextMenu"

        />
      </div>
      <div v-else class="no-content">
        <button @click="refreshComponent">加载DOM结构失败,可刷新重试</button>
      </div>
    </div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="context-menu"
        :style="{
          left: `${contextMenuPosition.x}px`,
          top: `${contextMenuPosition.y}px`
        }"
        @click.stop
      >
        <div class="context-menu-item" @click="copyNode">
          复制节点
        </div>
        <div class="context-menu-item" @click="deleteNode">
          删除节点
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, defineComponent, h, type VNode, onBeforeUnmount, watch } from 'vue';
import { useAiChatStore } from '@/stores/aiChat';
import { storeToRefs } from 'pinia';

// 定义树节点类型
interface TreeNodeType {
  id: string;
  element: Element | HTMLElement;
  tagName: string;
  level: number;
  isSelected: boolean;
  children: TreeNodeType[];
  expand?: () => void; // 添加展开方法
  parent?: TreeNodeType; // 添加父节点引用
}

// 树节点组件
const TreeNode = defineComponent({
  name: 'TreeNode',
  props: {
    node: {
      type: Object as () => TreeNodeType,
      required: true
    }
  },
  emits: ['node-selected', 'node-context-menu'],
  setup(props, { emit }): () => VNode {
    const isExpanded = ref(false);

    // 暴露展开方法给父组件
    const expand = (): void => {
      isExpanded.value = true;
    };

    // 将展开方法添加到节点对象上，以便外部访问
    if (props.node) {
      props.node.expand = expand;
    }

    const toggleExpand = (): void => {
      isExpanded.value = !isExpanded.value;
    };

    const selectNode = (event: Event): void => {
      event.stopPropagation();

      // 点击节点同时切换展开状态（如果有子节点）
      if (props.node.children && props.node.children.length > 0) {
        toggleExpand();
      }

      // 发送节点选中事件
      emit('node-selected', props.node);
    };

    // 处理右键菜单
    const handleContextMenu = (event: MouseEvent): void => {
      event.preventDefault();
      event.stopPropagation();
      console.log('右键菜单事件触发', props.node.tagName);
      emit('node-context-menu', { node: props.node, event });
    };

    return () => h('div', {
      class: 'tree-node',
    }, [
      h('div', {
        class: ['node-header', { 'node-selected': props.node.isSelected }],
        style: props.node.isSelected ? {
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))',
          color: 'rgba(76, 29, 149, 0.9)',
          fontWeight: '500',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.15)'
        } : {},
        onClick: selectNode,
        onContextmenu: handleContextMenu
      }, [
        props.node.children && props.node.children.length > 0
          ? h('span', {
              class: ['expand-icon', isExpanded.value ? 'expanded' : 'collapsed'],
              style: {
                display: 'inline-block',
                width: '16px',
                height: '16px',
                textAlign: 'center',
                lineHeight: '14px',
                cursor: 'pointer',
                userSelect: 'none',
                marginRight: '8px',
                color: 'rgba(139, 92, 246, 0.6)',
                fontSize: '10px',
                transform: isExpanded.value ? 'rotate(0deg)' : 'rotate(-90deg)',
                transition: 'transform 0.2s ease'
              },
              onClick: (e: Event) => {
                // 防止点击图标时触发节点的点击事件
                e.stopPropagation();
                toggleExpand();
              }
            }, isExpanded.value ? '▼' : '►')
          : h('span', {
              class: 'no-children',
              style: {
                display: 'inline-block',
                width: '16px',
                marginRight: '8px'
              }
            }, ''),
        h('span', {
          class: 'tag-name',
          style: {
            fontWeight: props.node.isSelected ? '500' : '400',
            color: props.node.isSelected ? 'rgba(76, 29, 149, 1)' : 'rgba(76, 29, 149, 0.8)',
            transition: 'color 0.2s'
          }
        }, `<${props.node.tagName.toLowerCase()}>`)
      ]),
      isExpanded.value && props.node.children && props.node.children.length > 0
        ? h('div', {
            class: 'node-children',
            style: {
              marginTop: '4px',
              marginLeft: '16px',
              paddingLeft: '16px',
              borderLeft: '1px dashed rgba(139, 92, 246, 0.3)'
            }
          },
            props.node.children.map(child =>
              h(TreeNode, {
                key: child.id,
                node: child,
                onNodeSelected: (node: TreeNodeType) => emit('node-selected', node),
                onNodeContextMenu: (data: { node: TreeNodeType, event: MouseEvent }) => emit('node-context-menu', data)
              })
            )
          )
        : null
    ]);
  }
});

const aiChatStore = useAiChatStore();
const { iframeEntrance, selectedElement } = storeToRefs(aiChatStore);

const elementTree = ref<TreeNodeType[]>([]);
const activeElement = ref<Element | null>(null);
const highlightElement = ref<Element | null>(null);
let resizeObserver: ResizeObserver | null = null;
let mutationObserver: MutationObserver | null = null; // 添加MutationObserver引用

// 组件刷新功能
const refreshComponent = (): void => {
  // 清空当前树结构
  elementTree.value = [];

  // 清除选中状态
  activeElement.value = null;
  highlightElement.value = null;

  // 重新构建元素树
  if (iframeEntrance.value) {
    const body = iframeEntrance.value.body;
    const rootNode = buildElementTree(body);
    if (rootNode) {
      elementTree.value = [rootNode];
    }
  }
};

// 高亮DOM元素
const highlightDomElement = (element: Element | Text): void => {
  if (!iframeEntrance.value || !element) return;

  // 移除之前的高亮
  removeHighlight();

  // 检查元素是否已经有高亮类，如果有则不再添加
  let elementToHighlight: Element;

  // 文本节点需要特殊处理，因为它们不能直接添加类名
  if (element.nodeType === 3) { // 文本节点
    // 对于文本节点，我们尝试高亮其父元素
    const parentElement = element.parentElement;
    if (!parentElement) return; // 如果没有父元素，无法高亮

    elementToHighlight = parentElement;
  } else { // Element节点
    elementToHighlight = element as Element;
  }

  // 检查元素是否已经有高亮类
  if (!elementToHighlight.classList.contains('special-hover-highlight')) {
    // 为元素添加高亮类
    elementToHighlight.classList.add('special-hover-highlight');
  }

  // 保存当前高亮的元素引用
  highlightElement.value = elementToHighlight;

  // 滚动到元素，但不锁定滚动
  if (element.nodeType === 1 && iframeEntrance.value) {
    try {
      // 获取元素位置
      const rect = (element as Element).getBoundingClientRect();
      const iframe = iframeEntrance.value.defaultView;

      if (iframe) {
        // 计算元素中心点相对于视口的位置
        const elementCenterY = rect.top + rect.height / 2;
        const viewportHeight = iframe.innerHeight;

        // 如果元素不在视口中心附近，平滑滚动到使元素在视口中心
        if (elementCenterY < viewportHeight * 0.3 || elementCenterY > viewportHeight * 0.7) {
          // 计算需要滚动的距离，使元素在视口中心
          const scrollY = iframe.scrollY + elementCenterY - viewportHeight / 2;

          // 使用一次性滚动，不添加任何事件监听器或锁定机制
          iframe.scrollTo({
            top: scrollY,
            behavior: 'smooth'
          });
        }
      }
    } catch (e) {
      console.error('滚动到元素视图失败:', e);
    }
  }
};

// 递归构建DOM树结构
const buildElementTree = (element: Element | Text | Comment | Node, level = 0, parent?: TreeNodeType): TreeNodeType | null => {
  if (!element) return null;

  // 排除script标签
  if (element.nodeType === 1 && (element as Element).tagName && (element as Element).tagName.toLowerCase() === 'script') {
    return null;
  }

  // 对于Text节点，如果只包含空白，则跳过
  if (element.nodeType === 3 && element.textContent && element.textContent.trim() === '') {
    return null;
  }

  // 如果是注释节点，也跳过
  if (element.nodeType === 8) {
    return null;
  }

  // 生成唯一ID
  const id = `elem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // 获取合适的标签名
  let tagName = 'UNKNOWN';
  if (element.nodeType === 1) {
    tagName = (element as Element).tagName || 'UNKNOWN';
  } else if (element.nodeType === 3) {
    tagName = '#text';
  } else if (element.nodeType === 8) {
    tagName = '#comment';
  }

  // 创建节点对象
  const node: TreeNodeType = {
    id,
    element: element as Element, // 保存DOM引用
    tagName,
    level,
    isSelected: false,
    children: [],
    parent // 保存父节点引用
  };

  // 处理子元素
  if (element.childNodes && element.childNodes.length > 0) {
    Array.from(element.childNodes).forEach(child => {
      // 排除script标签、空文本节点和注释节点
      if (
        !(child.nodeType === 1 && (child as Element).tagName && (child as Element).tagName.toLowerCase() === 'script') &&
        !(child.nodeType === 3 && child.textContent && child.textContent.trim() === '') &&
        !(child.nodeType === 8) // 排除注释节点
      ) {
        const childNode = buildElementTree(child, level + 1, node);
        if (childNode) {
          node.children.push(childNode);
        }
      }
    });
  }

  return node;
};

// 处理节点选择
const handleNodeSelected = (node: TreeNodeType): void => {
  // 如果点击的是已选中的节点，则取消选择
  if (node.isSelected) {
    node.isSelected = false;
    activeElement.value = null;
    removeHighlight(); // 确保已移除高亮
    // 取消选中时，将selectedElement设为null
    selectedElement.value = null;
    return;
  }

  // 重置先前选中的节点
  const resetSelection = (nodes: TreeNodeType[]): void => {
    if (!nodes) return;
    nodes.forEach(node => {
      node.isSelected = false;
      if (node.children) {
        resetSelection(node.children);
      }
    });
  };

  resetSelection(elementTree.value);

  // 设置当前选中节点
  node.isSelected = true;
  activeElement.value = node.element;

  // 更新selectedElement
  selectedElement.value = node.element as HTMLElement;

  // 高亮显示选中的DOM元素
  highlightDomElement(node.element);
};

// 清除选择
const clearSelection = (): void => {
  const resetSelection = (nodes: TreeNodeType[]): void => {
    if (!nodes) return;
    nodes.forEach(node => {
      node.isSelected = false;
      if (node.children) {
        resetSelection(node.children);
      }
    });
  };

  resetSelection(elementTree.value);
  activeElement.value = null;
  removeHighlight();
};

// 移除高亮
const removeHighlight = (): void => {
  if (!iframeEntrance.value) return;

  try {
    // 如果有保存的高亮元素，移除其高亮类
    if (highlightElement.value) {
      highlightElement.value.classList.remove('special-hover-highlight');
      highlightElement.value = null;
    }

    // 以防万一，也查找并移除所有带有高亮类的元素
    const doc = iframeEntrance.value;
    const highlightedElements = doc.querySelectorAll('.special-hover-highlight');
    highlightedElements.forEach(el => {
      el.classList.remove('special-hover-highlight');
    });
  } catch (e) {
    console.error('移除高亮失败:', e);
  }
};

// 大小变化处理函数
const handleResize = () => {
  if (activeElement.value) {
    highlightDomElement(activeElement.value);
  }
};

// 在元素树中查找对应DOM元素的节点
const findNodeByElement = (nodes: TreeNodeType[], element: Element | null): TreeNodeType | null => {
  if (!nodes || nodes.length === 0 || !element) return null;

  // 遍历所有节点
  for (const node of nodes) {
    // 检查当前节点
    if (node.element === element) {
      return node;
    }

    // 递归检查子节点
    if (node.children && node.children.length > 0) {
      const foundNode = findNodeByElement(node.children, element);
      if (foundNode) {
        return foundNode;
      }
    }
  }

  return null;
};

// 展开节点的所有父节点并确保节点可见
const expandParents = (node: TreeNodeType): void => {
  // 创建一个节点路径数组，从目标节点到根节点
  const nodePath: TreeNodeType[] = [];
  let currentNode: TreeNodeType | undefined = node;

  // 构建节点路径
  while (currentNode) {
    nodePath.unshift(currentNode); // 添加到路径开头
    currentNode = currentNode.parent;
  }

  // 从根节点开始，逐层展开
  // 使用setTimeout确保每一层的展开有时间渲染
  const expandNodesSequentially = (index: number) => {
    if (index >= nodePath.length - 1) return; // 最后一个节点不需要展开

    const nodeToExpand = nodePath[index];
    if (nodeToExpand.expand) {
      nodeToExpand.expand();
    }

    // 延迟展开下一层
    setTimeout(() => {
      expandNodesSequentially(index + 1);
    }, 50); // 短暂延迟，确保DOM有时间更新
  };

  // 开始从根节点展开
  if (nodePath.length > 1) { // 至少有父子两层
    expandNodesSequentially(0);
  }

  // 滚动到元素树中的选中节点，但不锁定滚动
  setTimeout(() => {
    const selectedNodeElement = document.querySelector('.node-selected') as HTMLElement | null;
    if (selectedNodeElement) {
      // 获取容器
      const container = document.querySelector('.tree-container');
      if (container) {
        // 获取元素位置
        const rect = selectedNodeElement.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();

        // 计算元素中心点相对于容器的位置
        const elementCenterY = rect.top + rect.height / 2 - containerRect.top;
        const containerHeight = containerRect.height;

        // 如果元素不在容器中心附近，平滑滚动到使元素在容器中心
        if (elementCenterY < containerHeight * 0.3 || elementCenterY > containerHeight * 0.7) {
          // 计算需要滚动的距离，使元素在容器中心
          const scrollTop = (container as HTMLElement).scrollTop + elementCenterY - containerHeight / 2;

          // 使用一次性滚动，不添加任何事件监听器或锁定机制
          container.scrollTo({
            top: scrollTop,
            behavior: 'smooth'
          });
        }
      }
    }
  }, 100 + (nodePath.length * 50)); // 根据层级深度调整延迟
};

// 改进监听selectedElement的变化逻辑
watch(() => selectedElement.value, (newElement) => {
  if (!elementTree.value || elementTree.value.length === 0) {
    // 如果元素树还没有构建，则跳过
    return;
  }

  if (newElement) {
    // 在元素树中查找对应的节点
    const node = findNodeByElement(elementTree.value, newElement);

    if (node) {
      // 展开所有父节点，确保节点可见
      expandParents(node);

      // 如果找到了对应的节点，选中它（但不触发selectedElement的更新）
      // 避免循环更新
      const wasSelected = node.isSelected;
      if (!wasSelected) {
        // 重置先前选中的节点
        const resetSelection = (nodes: TreeNodeType[]): void => {
          if (!nodes) return;
          nodes.forEach(n => {
            n.isSelected = false;
            if (n.children) {
              resetSelection(n.children);
            }
          });
        };

        resetSelection(elementTree.value);

        // 设置当前选中节点
        node.isSelected = true;
        activeElement.value = node.element;

        // 高亮显示选中的DOM元素
        highlightDomElement(node.element);
      }
    } else {
      console.log('在元素树中未找到对应的节点');
    }
  } else {
    // 如果selectedElement为null，清除选择
    clearSelection();
  }
}, { immediate: false }); // 不立即触发，避免与onMounted中的逻辑冲突

// 右键菜单相关状态
const showContextMenu = ref(false);
const contextMenuPosition = ref({ x: 0, y: 0 });
const contextMenuNode = ref<TreeNodeType | null>(null);

// 处理节点右键菜单
const handleNodeContextMenu = (data: { node: TreeNodeType, event: MouseEvent }): void => {
  // 显示右键菜单
  console.log('处理右键菜单', data.node.tagName, data.event.clientX, data.event.clientY);
  showContextMenu.value = true;
  contextMenuPosition.value = { x: data.event.clientX, y: data.event.clientY };
  contextMenuNode.value = data.node;
};

// 关闭右键菜单
const closeContextMenu = (): void => {
  console.log('关闭右键菜单');
  showContextMenu.value = false;
  contextMenuNode.value = null;
};

// 复制节点
const copyNode = (): Promise<void> => {
  console.log('复制节点', contextMenuNode.value?.tagName);
  if (!contextMenuNode.value || !iframeEntrance.value) return Promise.resolve();

  try {
    // 获取原始DOM元素
    const originalElement = contextMenuNode.value.element;
    const originalNode = contextMenuNode.value;

    // 克隆DOM元素
    const clonedElement = originalElement.cloneNode(true) as Element;

    // 将克隆的元素插入到原始元素之后
    if (originalElement.parentNode) {
      originalElement.parentNode.insertBefore(clonedElement, originalElement.nextSibling);

      // 不重建整个树，而是直接在当前节点旁边添加新节点
      // 创建新的树节点
      const newNode: TreeNodeType = {
        id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        element: clonedElement,
        tagName: originalNode.tagName,
        level: originalNode.level,
        isSelected: false,
        children: [],
        parent: originalNode.parent
      };

      // 递归克隆子节点
      const cloneChildren = (originalChildren: TreeNodeType[], parentNode: TreeNodeType, originalDOM: Element, clonedDOM: Element): void => {
        if (!originalChildren || originalChildren.length === 0) return;

        // 获取原始DOM和克隆DOM的子元素
        const originalChildElements = Array.from(originalDOM.children);
        const clonedChildElements = Array.from(clonedDOM.children);

        // 确保两者长度相同
        if (originalChildElements.length !== clonedChildElements.length) return;

        // 遍历原始子节点
        for (let i = 0; i < originalChildren.length; i++) {
          const originalChild = originalChildren[i];

          // 找到对应的DOM元素
          const index = originalChildElements.indexOf(originalChild.element as Element);
          if (index >= 0 && index < clonedChildElements.length) {
            // 创建新的子节点
            const newChildNode: TreeNodeType = {
              id: `elem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
              element: clonedChildElements[index],
              tagName: originalChild.tagName,
              level: originalChild.level,
              isSelected: false,
              children: [],
              parent: parentNode
            };

            // 添加到父节点
            parentNode.children.push(newChildNode);

            // 递归处理子节点的子节点
            cloneChildren(
              originalChild.children,
              newChildNode,
              originalChild.element as Element,
              clonedChildElements[index]
            );
          }
        }
      };

      // 处理子节点
      if (originalNode.element.nodeType === 1 && clonedElement.nodeType === 1) {
        cloneChildren(
          originalNode.children,
          newNode,
          originalNode.element as Element,
          clonedElement as Element
        );
      }

      // 找到父节点的子节点数组
      if (originalNode.parent && originalNode.parent.children) {
        // 找到原始节点在父节点子节点数组中的索引
        const index = originalNode.parent.children.findIndex(child => child.id === originalNode.id);
        if (index >= 0) {
          // 在原始节点后插入新节点
          originalNode.parent.children.splice(index + 1, 0, newNode);

          // 选中新节点
          // 清除之前的选择
          const resetSelection = (nodes: TreeNodeType[]): void => {
            if (!nodes) return;
            nodes.forEach(node => {
              node.isSelected = false;
              if (node.children) {
                resetSelection(node.children);
              }
            });
          };

          resetSelection(elementTree.value);

          // 选中新节点
          newNode.isSelected = true;
          activeElement.value = newNode.element;

          // 更新selectedElement
          selectedElement.value = newNode.element as HTMLElement;

          // 高亮显示选中的DOM元素
          highlightDomElement(newNode.element);

          console.log('节点复制成功');
        } else {
          console.log('未找到原始节点在父节点中的位置');
          // 回退到重建整个树的方法
          rebuildTreeAndSelectClonedNode(clonedElement);
        }
      } else if (!originalNode.parent && elementTree.value) {
        // 处理根节点的情况
        const index = elementTree.value.findIndex(node => node.id === originalNode.id);
        if (index >= 0) {
          // 在原始节点后插入新节点
          elementTree.value.splice(index + 1, 0, newNode);

          // 选中新节点
          // 清除之前的选择
          const resetSelection = (nodes: TreeNodeType[]): void => {
            if (!nodes) return;
            nodes.forEach(node => {
              node.isSelected = false;
              if (node.children) {
                resetSelection(node.children);
              }
            });
          };

          resetSelection(elementTree.value);

          // 选中新节点
          newNode.isSelected = true;
          activeElement.value = newNode.element;

          // 更新selectedElement
          selectedElement.value = newNode.element as HTMLElement;

          // 高亮显示选中的DOM元素
          highlightDomElement(newNode.element);

          console.log('节点复制成功');
        } else {
          console.log('未找到原始节点在根节点数组中的位置');
          // 回退到重建整个树的方法
          rebuildTreeAndSelectClonedNode(clonedElement);
        }
      } else {
        // 如果无法直接添加节点，回退到重建整个树的方法
        rebuildTreeAndSelectClonedNode(clonedElement);
      }
    }
  } catch (e) {
    console.error('复制节点失败:', e);
    // 出错时回退到重建整个树的方法
    if (contextMenuNode.value && contextMenuNode.value.element.parentNode) {
      const clonedElement = contextMenuNode.value.element.cloneNode(true) as Element;
      contextMenuNode.value.element.parentNode.insertBefore(clonedElement, contextMenuNode.value.element.nextSibling);
      rebuildTreeAndSelectClonedNode(clonedElement);
    }
  }

  // 关闭右键菜单
  closeContextMenu();
  return Promise.resolve();
};

// 回退方法：重建整个树并选中克隆的节点
const rebuildTreeAndSelectClonedNode = (clonedElement: Element): void => {
  if (!iframeEntrance.value) return;

  const body = iframeEntrance.value.body;
  const rootNode = buildElementTree(body);
  if (rootNode) {
    elementTree.value = [rootNode];

    // 延迟一下，确保元素树已经更新
    setTimeout(() => {
      // 查找新复制的节点
      const findClonedNode = (nodes: TreeNodeType[]): TreeNodeType | null => {
        for (const node of nodes) {
          // 检查是否是我们复制的节点
          if (node.element === clonedElement) {
            return node;
          }

          // 递归检查子节点
          if (node.children && node.children.length > 0) {
            const found = findClonedNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      // 查找并选中复制的节点
      const clonedNode = findClonedNode(elementTree.value);
      if (clonedNode) {
        console.log('找到复制的节点，选中它');

        // 清除之前的选择
        const resetSelection = (nodes: TreeNodeType[]): void => {
          if (!nodes) return;
          nodes.forEach(node => {
            node.isSelected = false;
            if (node.children) {
              resetSelection(node.children);
            }
          });
        };

        resetSelection(elementTree.value);

        // 选中新节点
        clonedNode.isSelected = true;
        activeElement.value = clonedNode.element;

        // 更新selectedElement
        selectedElement.value = clonedNode.element as HTMLElement;

        // 高亮显示选中的DOM元素
        highlightDomElement(clonedNode.element);

        // 展开父节点，确保新节点可见
        expandParents(clonedNode);
      } else {
        console.log('未找到复制的节点');
      }
    }, 100); // 短暂延迟，确保DOM和元素树都已更新
  }
};

// 点击文档时关闭右键菜单
const handleDocumentClick = (event: MouseEvent): void => {
  // 只有当右键菜单显示时才处理点击事件
  if (showContextMenu.value) {
    // 检查点击是否在菜单外部
    const menu = document.querySelector('.context-menu');
    if (menu && !menu.contains(event.target as Node)) {
      closeContextMenu();
    }
  }
};

// 添加ESC键关闭右键菜单
const handleKeyDown = (event: KeyboardEvent): void => {
  if (event.key === 'Escape' && showContextMenu.value) {
    closeContextMenu();
  }
};

// 防止默认的浏览器右键菜单
const preventDefaultContextMenu = (event: MouseEvent): void => {
  // 只在元素树组件内阻止默认右键菜单
  const elementTree = document.querySelector('.element-tree');
  if (elementTree && elementTree.contains(event.target as Node)) {
    event.preventDefault();
  }
};

// 处理DOM变化
const handleDomMutations = (mutations: MutationRecord[]): void => {
  let hasStructuralChanges = false;

  for (const mutation of mutations) {
    if (mutation.type === 'childList') {
      // 处理节点删除
      if (mutation.removedNodes.length > 0) {
        for (const removedNode of mutation.removedNodes) {
          // 如果删除的是元素节点或文本节点，从树中移除对应节点
          if (removedNode.nodeType === 1 || removedNode.nodeType === 3) {
            // 找到并删除节点
            const result = removeNodeFromTree(elementTree.value, removedNode as Element | Text);
            if (result) {
              hasStructuralChanges = true;
              console.log('从树中删除了节点:', (removedNode as Element).tagName || '#text');
            }
          }
        }
      }

      // 处理节点添加
      if (mutation.addedNodes.length > 0) {
        // 我们在复制节点时已经处理了添加的情况，不需要在这里处理
        // 如果是第三方代码添加的节点，由于我们无法确定具体位置，
        // 这种情况我们暂不特殊处理，留着下次刷新树时自动加载
      }
    }
  }

  // 如果结构发生了变化，更新高亮显示
  if (hasStructuralChanges && activeElement.value) {
    // 检查选中的元素是否仍然存在于DOM中
    try {
      // 尝试获取元素的父节点，如果元素已被删除，会抛出异常
      if (!activeElement.value.parentNode) {
        // 元素已被删除，清除选择
        clearSelection();
      } else {
        // 元素仍存在，重新高亮
        highlightDomElement(activeElement.value);
      }
    } catch (e) {
      // 如果访问元素属性出错，说明元素已被删除
      clearSelection();
    }
  }
};

// 从树中删除节点
const removeNodeFromTree = (nodes: TreeNodeType[], element: Element | Text): boolean => {
  if (!nodes || nodes.length === 0) return false;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    // 检查当前节点是否是要删除的节点
    if (node.element === element) {
      // 如果是当前选中的节点，清除选择
      if (node.isSelected) {
        clearSelection();
        selectedElement.value = null; // 确保selectedElement也被清除
      }

      // 从父节点的children数组中移除
      nodes.splice(i, 1);
      return true;
    }

    // 递归检查子节点
    if (node.children && node.children.length > 0) {
      const removed = removeNodeFromTree(node.children, element);
      if (removed) return true;
    }
  }

  return false;
};

// 删除节点
const deleteNode = (): Promise<void> => {
  console.log('删除节点', contextMenuNode.value?.tagName);
  if (!contextMenuNode.value || !iframeEntrance.value) return Promise.resolve();

  try {
    // 获取要删除的DOM元素
    const elementToDelete = contextMenuNode.value.element;
    const nodeToDelete = contextMenuNode.value;

    // 如果是当前选中的节点，清除选择
    if (nodeToDelete.isSelected) {
      clearSelection();
      selectedElement.value = null; // 确保selectedElement也被清除
    }

    // 从DOM中删除元素
    if (elementToDelete.parentNode) {
      elementToDelete.parentNode.removeChild(elementToDelete);

      // 不需要手动从树中移除节点，因为我们的MutationObserver会监听到DOM变化并自动处理
      // 但为了确保UI立即响应，我们还是手动移除节点

      // 找到父节点的子节点数组
      if (nodeToDelete.parent && nodeToDelete.parent.children) {
        // 找到要删除的节点在父节点子节点数组中的索引
        const index = nodeToDelete.parent.children.findIndex(child => child.id === nodeToDelete.id);
        if (index >= 0) {
          // 从父节点的children数组中移除
          nodeToDelete.parent.children.splice(index, 1);
          console.log('节点删除成功');
        }
      } else if (!nodeToDelete.parent && elementTree.value) {
        // 处理根节点的情况
        const index = elementTree.value.findIndex(node => node.id === nodeToDelete.id);
        if (index >= 0) {
          // 从根节点数组中移除
          elementTree.value.splice(index, 1);
          console.log('根节点删除成功');
        }
      }
    }
  } catch (e) {
    console.error('删除节点失败:', e);
  }

  // 关闭右键菜单
  closeContextMenu();
  return Promise.resolve();
};


onMounted(() => {
  //iframeEntrance.value 已经是iframe的contentDocument属性了
  if(iframeEntrance.value){
    const body = iframeEntrance.value.body;
    console.log(body);

    // 构建元素树
    const rootNode = buildElementTree(body);
    if (rootNode) {
      elementTree.value = [rootNode];

      // 在元素树构建完成后，检查是否有已选中的元素
      if (selectedElement.value) {
        // 延迟执行，确保树已完全渲染
        setTimeout(() => {
          const node = findNodeByElement(elementTree.value, selectedElement.value);
          if (node) {
            console.log('找到已选中的节点，展开并选中它');
            // 展开所有父节点，确保节点可见
            expandParents(node);

            // 选中节点，但不触发任何滚动
            // 重置先前选中的节点
            const resetSelection = (nodes: TreeNodeType[]): void => {
              if (!nodes) return;
              nodes.forEach(n => {
                n.isSelected = false;
                if (n.children) {
                  resetSelection(n.children);
                }
              });
            };

            resetSelection(elementTree.value);

            // 设置当前选中节点
            node.isSelected = true;
            activeElement.value = node.element;

            // 高亮显示选中的DOM元素
            highlightDomElement(node.element);
          } else {
            console.log('未找到已选中的节点');
          }
        }, 300); // 增加延迟时间，确保树已完全渲染
      }
    }

    // 监听iframe的滚动事件，更新高亮位置
    const iframe = iframeEntrance.value.defaultView;
    if (iframe) {
      // iframe.addEventListener('scroll', handleScroll);

      // 监听iframe内容大小变化
      resizeObserver = new ResizeObserver(handleResize);

      // 监听body大小变化
      resizeObserver.observe(body);

      // 监听DOM变化
      mutationObserver = new MutationObserver(handleDomMutations);
      mutationObserver.observe(body, {
        childList: true, // 监听子节点的添加或删除
        subtree: true,   // 监听所有后代节点
        attributes: false,
        characterData: false
      });
    }
  }

  // 添加文档点击事件监听器
  document.addEventListener('click', handleDocumentClick);

  // 添加键盘事件监听器
  document.addEventListener('keydown', handleKeyDown);

  // 阻止默认右键菜单
  document.addEventListener('contextmenu', preventDefaultContextMenu);
});

onBeforeUnmount(() => {
  // 移除高亮效果
  // removeHighlight();

  // 清空选中状态
  activeElement.value = null;
  highlightElement.value = null;

  // 断开ResizeObserver连接
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  // 断开MutationObserver连接
  if (mutationObserver) {
    mutationObserver.disconnect();
    mutationObserver = null;
  }

  // // 移除滚动事件监听器
  // if (iframeEntrance.value && iframeEntrance.value.defaultView) {
  //   // iframeEntrance.value.defaultView.removeEventListener('scroll', handleScroll);
  // }

  // 移除文档点击事件监听器
  document.removeEventListener('click', handleDocumentClick);

  // 移除键盘事件监听器
  document.removeEventListener('keydown', handleKeyDown);

  // 移除右键菜单事件监听器
  document.removeEventListener('contextmenu', preventDefaultContextMenu);
});
</script>

<style lang="less">
.element-tree {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.02) 0%,
    rgba(236, 72, 153, 0.02) 50%,
    rgba(139, 92, 246, 0.02) 100%
  );
  border-radius: 12px;
  box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.08);
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
  backdrop-filter: blur(5px);
  border: 1px solid rgba(139, 92, 246, 0.15);
}

.element-tree-header {
  padding: 12px 15px;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.05) 0%,
    rgba(236, 72, 153, 0.05) 100%
  );
  backdrop-filter: blur(8px);
}

.element-tree-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: rgba(76, 29, 149, 0.9);
  text-shadow: 0 1px 1px rgba(255, 255, 255, 0.7);
}

.tree-container {
  flex: 1;
  overflow: auto;
  padding: 12px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);

  &::-webkit-scrollbar {
    width: 6px;
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

.tree-root {
  font-size: 13px;
}

.tree-node {
  padding: 0;
  margin-bottom: 4px;
}

.node-header {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.node-header:hover {
  background-color: rgba(111, 134, 244, 0.08);
}

.node-selected {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
  color: rgba(76, 29, 149, 0.9);
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.15);
}

.expand-icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  text-align: center;
  line-height: 14px;
  cursor: pointer;
  user-select: none;
  margin-right: 8px;
  color: rgba(139, 92, 246, 0.6);
  font-size: 10px;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(0deg);
}

.expand-icon.collapsed {
  transform: rotate(-90deg);
}

.no-children {
  display: inline-block;
  width: 16px;
  margin-right: 8px;
}

.tag-name {
  font-weight: 400;
  color: rgba(76, 29, 149, 0.8);
  transition: color 0.2s;
}

.node-selected .tag-name {
  color: rgba(76, 29, 149, 1);
  font-weight: 500;
}

.node-children {
  margin-top: 4px;
  margin-left: 16px;
  padding-left: 16px;
  border-left: 1px dashed rgba(139, 92, 246, 0.3);
}

.no-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: rgba(139, 92, 246, 0.4);
  font-style: italic;
  background: linear-gradient(120deg, rgba(249, 248, 253, 0.8), rgba(250, 245, 255, 0.8));
  border-radius: 8px;
  padding: 20px;
}

// 右键菜单样式
.context-menu {
  position: fixed;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 150px;
  z-index: 9999;
  border: 1px solid rgba(139, 92, 246, 0.2);
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  user-select: none;
  pointer-events: auto;
}

.context-menu-item {
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.2s;
  color: rgba(76, 29, 149, 0.8);
  font-size: 13px;

  &:hover {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
    color: rgba(76, 29, 149, 1);
  }
}
</style>
