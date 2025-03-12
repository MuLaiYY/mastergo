<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import LeftSideBar from '@/views/leftSideBar.vue';
import { useUserStore } from '@/stores/user';

const route = useRoute();
const userStore = useUserStore();
const particlesContainer = ref(null);

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

// 初始化粒子效果
const initParticles = () => {
  if (particlesContainer.value && window.particlesJS && route.name !== 'home') {
    window.particlesJS('app-particles', {
      particles: {
        number: {
          value: 30,
          density: {
            enable: true,
            value_area: 1000
          }
        },
        color: {
          value: ["#c084fc", "#e879f9", "#818cf8", "#38bdf8"]
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000"
          },
        },
        opacity: {
          value: 0.2,
          random: true,
          anim: {
            enable: true,
            speed: 0.5,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#a78bfa",
          opacity: 0.1,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.5,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "bubble"
          },
          onclick: {
            enable: false,
            mode: "push"
          },
          resize: true
        },
        modes: {
          bubble: {
            distance: 150,
            size: 4,
            duration: 2,
            opacity: 0.5,
            speed: 3
          }
        }
      },
      retina_detect: true
    });
  }
};

// 初始化时也检查一次侧边栏状态
onMounted(() => {
  isSidebarExpanded.value = localStorage.getItem('sidebar-expanded') === 'true';

  // 添加事件监听器，当localStorage变化时立即更新状态
  window.addEventListener('storage', handleStorageChange);

  // 添加自定义事件监听器，用于组件内部通信
  window.addEventListener('sidebar-toggle', handleSidebarToggle);

  // 初始化粒子效果
  initParticles();
});

// 监听路由变化，重新初始化粒子效果
watch(() => route.name, (newRouteName) => {
  if (newRouteName !== 'home') {
    setTimeout(() => {
      initParticles();
    }, 100);
  }
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

// 计算当前路由是否是首页
const isHomePage = computed(() => {
  return route.name === 'home';
});
</script>

<template>
  <div class="app-container" :class="{
    'with-sidebar': showSidebar,
    'sidebar-expanded': isSidebarExpanded,
    'is-home-page': isHomePage
  }">
    <!-- 全局粒子背景 -->
    <div id="app-particles" ref="particlesContainer" class="app-particles" v-if="!isHomePage"></div>

    <!-- 背景装饰 -->
    <div class="background-decoration" v-if="!isHomePage">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

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
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  overflow-x: hidden;
  background: var(--bg-primary);
  color: var(--text-primary);
}

// 应用容器
.app-container {
  display: flex;
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  &.with-sidebar {
    padding-left: 0;
    transition: all 0.3s ease;
  }

  &.sidebar-expanded {
    padding-left: 0;
  }

  &:not(.is-home-page) {
    background: var(--bg-primary);
  }
}

// 全局粒子背景
.app-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;
}

// 背景装饰
.background-decoration {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(100px);
    opacity: 0.1;

    &.shape-1 {
      top: -10%;
      right: -5%;
      width: 40vw;
      height: 40vw;
      background: linear-gradient(135deg, var(--primary-light), var(--blue-light));
      animation: float 30s ease-in-out infinite alternate;
    }

    &.shape-2 {
      bottom: -15%;
      left: -10%;
      width: 35vw;
      height: 35vw;
      background: linear-gradient(135deg, var(--accent-light), var(--primary-light));
      animation: float 35s ease-in-out infinite alternate-reverse;
    }

    &.shape-3 {
      top: 40%;
      right: 25%;
      width: 20vw;
      height: 20vw;
      background: linear-gradient(135deg, var(--blue-light), var(--primary-color));
      animation: float 25s ease-in-out infinite alternate;
    }
  }
}

// 主内容区域
.main-content {
  flex: 1;
  transition: all 0.3s ease;
  width: 100%;
  margin-left: 0;
  position: relative;
  z-index: 1;

  &.with-sidebar {
    width: calc(100% - @sidebar-width-collapsed);
    margin-left: @sidebar-width-collapsed;
  }

  &.with-sidebar.sidebar-expanded {
    width: calc(100% - @sidebar-width-expanded);
    margin-left: @sidebar-width-expanded;
  }
}

// 动画关键帧
@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(3%, 3%);
  }
}
</style>
