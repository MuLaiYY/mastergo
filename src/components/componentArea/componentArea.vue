<script setup>
import { ref, computed, onMounted } from 'vue'
import Sortable from 'sortablejs'
import { useComponentAreaStore } from '@/stores'
import { storeToRefs } from 'pinia'
import { componentTypes, platformTypes } from '@/stores/componentArea'

const componentArea = useComponentAreaStore()
const { components } = storeToRefs(componentArea)

// 当前选中的平台和类型
const selectedPlatform = ref('onlineEducation')
const selectedType = ref('all')

// 根据筛选条件获取组件列表
const filteredComponents = computed(() => {
  let filtered = components.value

  if (selectedPlatform.value !== 'all') {
    filtered = filtered.filter(c => c.platform === selectedPlatform.value)
  }

  if (selectedType.value !== 'all') {
    filtered = filtered.filter(c => c.type === selectedType.value)
  }

  return filtered
})

onMounted(() => {
  // 初始化组件库的 Sortable
  const componentList = document.querySelector('.components-list')
  new Sortable(componentList, {
    group: {
      name: 'component',
      pull: 'clone',
      put: false,
    },
    sort: false,
    draggable: '.component-item',
    animation: 150,
    setData: function (dataTransfer, dragEl) {
      // 获取组件索引
      const index = [...dragEl.parentElement.children].indexOf(dragEl)
      const component = components.value[index]

      // 直接使用组件卡片作为拖拽预览
      const rect = dragEl.getBoundingClientRect()
      const centerX = Math.floor(rect.width / 2)
      const centerY = Math.floor(rect.height / 2)
      dataTransfer.setDragImage(dragEl, centerX, centerY)
    },
  })
})

</script>

<template>
  <div class="components">
    <div class="components-header">
      <div class="platform-selector">
        <select v-model="selectedPlatform">
          <option value="all">全部平台</option>
          <option v-for="(platform, key) in platformTypes" :key="key" :value="key">
            {{ platform.name }}
          </option>
        </select>
      </div>
      <div class="type-tabs">
        <button
          class="type-tab"
          :class="{ active: selectedType === 'all' }"
          @click="selectedType = 'all'"
        >
          全部组件
        </button>
        <button
          v-for="(type, key) in componentTypes"
          :key="key"
          class="type-tab"
          :class="{ active: selectedType === key }"
          @click="selectedType = key"
        >
          <component :is="type.icon" class="tab-icon" />
          {{ type.name }}
        </button>
      </div>
    </div>

    <div class="components-list">
      <div
        v-for="(component, index) in filteredComponents"
        :key="index"
        class="component-item"
        draggable="true"
      >
        <div class="component-icon-wrapper">
          <component :is="component.icon" class="component-icon" />
        </div>
        <span class="component-name">{{ component.name }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.components {
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.05) 0%,
    rgba(236, 72, 153, 0.05) 50%,
    rgba(139, 92, 246, 0.05) 100%
  );
  border-right: 1px solid rgba(139, 92, 246, 0.15);
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  position: relative;

  .components-header {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;

    .platform-selector {
      position: relative;
      width: 100%;

      &::after {
        content: '▼';
        position: absolute;
        right: 16px;
        top: 50%;
        transform: translateY(-50%);
        color: rgba(139, 92, 246, 0.7);
        pointer-events: none;
        font-size: 12px;
        transition: all 0.3s ease;
      }

      &:hover::after {
        color: rgba(139, 92, 246, 0.9);
      }

      select {
        width: 100%;
        padding: 12px 16px;
        appearance: none;
        border: 1px solid rgba(139, 92, 246, 0.15);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        color: rgba(139, 92, 246, 0.8);
        font-size: 0.95rem;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.08);

        &:hover {
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 6px 24px -4px rgba(139, 92, 246, 0.12);
          color: rgba(139, 92, 246, 1);
        }

        &:focus {
          outline: none;
          border-color: rgba(139, 92, 246, 0.5);
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
        }

        option {
          background: white;
          color: rgba(139, 92, 246, 0.8);
          padding: 8px;
        }
      }
    }

    .type-tabs {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding: 4px;

      .type-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: 1px solid rgba(139, 92, 246, 0.15);
        border-radius: 12px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        color: rgba(139, 92, 246, 0.7);
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.3s ease;
        white-space: nowrap;
        box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.08);

        .tab-icon {
          width: 18px;
          height: 18px;
          transition: all 0.3s ease;
        }

        &:hover {
          transform: translateY(-1px);
          border-color: rgba(139, 92, 246, 0.3);
          box-shadow: 0 6px 24px -4px rgba(139, 92, 246, 0.12);
          color: rgba(139, 92, 246, 0.9);

          .tab-icon {
            transform: scale(1.1);
          }
        }

        &.active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));
          border-color: transparent;
          color: white;
          box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.2);
        }
      }
    }
  }

  .components-list {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    gap: 10px;
    padding: 8px;
    overflow-y: auto;
    mask-image: linear-gradient(
      to bottom,
      transparent,
      black 8px,
      black calc(100% - 8px),
      transparent
    );
    margin: -8px;
    padding: 8px;

    .component-item {
      width: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 16px;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: 12px;
      cursor: move;
      transition: all 0.3s ease;
      box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.08);

      &:hover {
        transform: translateY(-2px);
        border-color: rgba(139, 92, 246, 0.3);
        box-shadow: 0 6px 24px -4px rgba(139, 92, 246, 0.12);

        .component-icon-wrapper {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));

          .component-icon {
            color: white;
            transform: scale(1.1);
          }
        }

        .component-name {
          color: rgba(139, 92, 246, 0.9);
        }
      }

      .component-icon-wrapper {
        background: rgba(139, 92, 246, 0.1);
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 12px;
        transition: all 0.3s ease;
      }

      .component-icon {
        width: 24px;
        height: 24px;
        color: rgba(139, 92, 246, 0.9);
        transition: all 0.3s ease;
      }

      .component-name {
        font-size: 0.9rem;
        color: rgba(139, 92, 246, 0.8);
        text-align: center;
        transition: all 0.3s ease;
        font-weight: 500;
      }
    }
  }
}
</style>
