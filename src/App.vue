<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import LeftSideBar from '@/views/leftSideBar.vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const userStore = useUserStore();

// 侧边栏是否展开
const isSidebarExpanded = ref(false);

// 监听侧边栏状态变化
watch(() => localStorage.getItem('sidebar-expanded'), (newValue) => {
  isSidebarExpanded.value = newValue === 'true';
}, { immediate: true });

// 处理localStorage变化的事件处理函数
const handleStorageChange = (event: StorageEvent) => {
  if (event.key === 'sidebar-expanded') {
    isSidebarExpanded.value = event.newValue === 'true';
  }
};

// 处理自定义事件
const handleSidebarToggle = () => {
  isSidebarExpanded.value = localStorage.getItem('sidebar-expanded') === 'true';
};

// 初始化时也检查一次侧边栏状态
onMounted(() => {
  isSidebarExpanded.value = localStorage.getItem('sidebar-expanded') === 'true';

  // 添加事件监听器，当localStorage变化时立即更新状态
  window.addEventListener('storage', handleStorageChange);

  // 添加自定义事件监听器，用于组件内部通信
  window.addEventListener('sidebar-toggle', handleSidebarToggle);
});

// 组件卸载时移除事件监听器
onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('sidebar-toggle', handleSidebarToggle);
});

// 计算当前路由是否需要显示侧边栏
const showSidebar = computed(() => {
  // 在登录页面不显示侧边栏
  return route.name !== 'login' && userStore.isLoggedIn;
});
</script>

<template>
  <div class="app-container" :class="{
    'with-sidebar': showSidebar,
    'sidebar-expanded': isSidebarExpanded
  }">
    <!-- 侧边栏 -->
    <LeftSideBar v-if="showSidebar" />

    <!-- 主内容区域 -->
    <main class="main-content" :class="{
      'with-sidebar': showSidebar,
      'sidebar-expanded': isSidebarExpanded
    }">
      <RouterView />
    </main>
  </div>
</template>

<style lang="less">
// 变量定义
@sidebar-width-collapsed: 64px;
@sidebar-width-expanded: 200px;

// 重置样式
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow-x: hidden;
  background-color: #f9fafb;
}

// 应用容器
.app-container {
  display: flex;
  min-height: 100vh;
  position: relative;

  &.with-sidebar {
    padding-left: 0;
    transition: all 0.3s ease;
  }

  &.sidebar-expanded {
    padding-left: 0;
  }
}

// 主内容区域
.main-content {
  flex: 1;
  transition: all 0.3s ease;
  width: 100%;
  margin-left: 0;

  &.with-sidebar {
    width: calc(100% - @sidebar-width-collapsed);
    margin-left: @sidebar-width-collapsed;
  }

  &.with-sidebar.sidebar-expanded {
    width: calc(100% - @sidebar-width-expanded);
    margin-left: @sidebar-width-expanded;
  }
}
</style>
