<template>
  <div class="sidebar" :class="{ 'expanded': isExpanded }">
    <!-- 侧边栏内容 -->
    <div class="sidebar-content">
      <!-- Logo 区域 -->
      <div class="logo-container">
        <img src="@/assets/original.png" alt="Logo" class="logo"  />
        <span v-if="isExpanded" class="logo-text">Reblend</span>
      </div>

      <!-- 导航菜单 -->
      <nav class="nav-menu">
        <ul>
          <li v-for="(item, index) in menuItems" :key="index"
              :class="{ 'active': activeItem === item.id }"
              @click="navigateTo(item)">
            <router-link :to="item.route" class="nav-link">
              <component :is="item.icon" class="nav-icon" />
              <span v-if="isExpanded" class="nav-text">{{ item.text }}</span>
            </router-link>
          </li>
        </ul>
      </nav>
    </div>

    <!-- 展开/收起按钮 -->
    <div class="toggle-button" @click="toggleSidebar">
      <chevron-right-icon v-if="!isExpanded" />
      <chevron-left-icon v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import {
  Home as HomeIcon,
  Plus as PlusIcon,
  Folder as FolderIcon,
  Settings as SettingsIcon,
  User as UserIcon,
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();

// 从 localStorage 获取侧边栏状态，默认为收起状态
const isExpanded = ref(false);

// 当前激活的菜单项
const activeItem = ref('home');

// 菜单项配置
const menuItems = [
  { id: 'home', text: '首页', icon: HomeIcon, route: '/' },
  { id: 'new-project', text: '新建项目', icon: PlusIcon, route: '/new-project' },
  { id: 'projects', text: '我的项目', icon: FolderIcon, route: '/projects' },
  { id: 'settings', text: '设置', icon: SettingsIcon, route: '/settings' },
  { id: 'profile', text: '个人中心', icon: UserIcon, route: '/profile' }
];

// 初始化
onMounted(() => {
  // 从 localStorage 获取侧边栏状态
  const savedState = localStorage.getItem('sidebar-expanded');
  if (savedState !== null) {
    isExpanded.value = savedState === 'true';
  }

  // 根据当前路由设置激活项
  setActiveItemByRoute();
});

// 监听侧边栏状态变化，保存到 localStorage
watch(isExpanded, (newValue) => {
  localStorage.setItem('sidebar-expanded', newValue.toString());

  // 触发自定义事件，通知App组件侧边栏状态已变化
  window.dispatchEvent(new Event('sidebar-toggle'));
});

// 根据当前路由设置激活项
const setActiveItemByRoute = () => {
  const currentPath = route.path;
  const matchedItem = menuItems.find(item => {
    // 精确匹配路由
    if (item.route === currentPath) return true;

    // 对于项目详情页，激活"我的项目"菜单项
    if (currentPath.startsWith('/project/') && item.id === 'projects') return true;

    return false;
  });

  if (matchedItem) {
    activeItem.value = matchedItem.id;
  }
};

// 监听路由变化，更新激活项
watch(() => route.path, () => {
  setActiveItemByRoute();
});

// 切换侧边栏展开/收起状态
const toggleSidebar = () => {
  isExpanded.value = !isExpanded.value;
};

// 导航到指定路由
const navigateTo = (item: any) => {
  activeItem.value = item.id;
  // 路由导航由 router-link 自动处理
};
</script>

<style lang="less" scoped>
// 变量定义
@sidebar-width-collapsed: 64px;
@sidebar-width-expanded: 200px;
@transition-duration: 0.3s;

// 侧边栏容器
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: @sidebar-width-collapsed;
  background-color: var(--bg-secondary);
  backdrop-filter: blur(10px);
  border-right: 1px solid var(--border-light);
  transition: all @transition-duration ease;
  overflow: hidden;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;

  &.expanded {
    width: @sidebar-width-expanded;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(180deg, var(--primary-light) 0%, transparent 100%);
    opacity: 0.05;
    pointer-events: none;
  }
}

// 侧边栏内容
.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 4px;
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(139, 92, 246, 0.2);
    border-radius: 2px;

    &:hover {
      background-color: rgba(139, 92, 246, 0.4);
    }
  }
}

// Logo 区域
.logo-container {
  display: flex;
  align-items: center;
  padding: 16px;
  padding-left: 0px;
  height: 64px;
  border-bottom: 1px solid var(--border-light);

  .logo {
    width: 64px;
    height: 64px;
    object-fit: contain;
    filter: drop-shadow(0 2px 4px rgba(139, 92, 246, 0.2));
    transition: all @transition-duration ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .logo-text {
    font-size: 18px;
    font-weight: 600;
    background: var(--primary-gradient);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    white-space: nowrap;
  }
}

// 导航菜单
.nav-menu {
  padding: 16px 0;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  li {
    position: relative;
    cursor: pointer;
    margin: 4px 8px;
    border-radius: var(--radius-md);
    transition: all @transition-duration ease;

    &.active {
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05));

      .nav-link {
        color: var(--primary-color);
      }

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 60%;
        width: 3px;
        background: var(--primary-gradient);
        border-radius: 0 3px 3px 0;
      }
    }

    &:hover:not(.active) {
      background-color: rgba(255, 255, 255, 0.5);
      transform: translateX(2px);
    }
  }

  .nav-link {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    color: var(--text-primary);
    text-decoration: none;
    transition: all @transition-duration ease;

    .nav-icon {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      transition: all @transition-duration ease;
    }

    .nav-text {
      margin-left: 12px;
      font-size: 14px;
      white-space: nowrap;
      font-weight: 500;
    }

    &:hover .nav-icon {
      transform: scale(1.1);
      color: var(--primary-color);
    }
  }
}

// 展开/收起按钮
.toggle-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-light);
  border-radius: 50%;
  position: absolute;
  top: 20px;
  right: -12px;
  cursor: pointer;
  color: var(--primary-color);
  box-shadow: var(--shadow-sm);
  transition: all @transition-duration ease;
  z-index: 101;

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0 10px rgba(139, 92, 246, 0.3);
  }
}
</style>
