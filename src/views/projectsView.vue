<template>
  <div class="projects-container">
    <div class="projects-header">
      <h1 class="page-title">我的项目</h1>
      <button class="new-project-button" @click="router.push('/new-project')">
        <plus-icon class="icon" />
        <span>新建项目</span>
      </button>
    </div>

    <div class="projects-content">
      <!-- 项目过滤和搜索 -->
      <div class="projects-filter">
        <div class="search-box">
          <search-icon class="search-icon" />
          <input
            type="text"
            v-model="searchQuery"
            placeholder="搜索项目..."
            @input="filterProjects"
          />
        </div>

        <div class="filter-options">
          <!-- 类型筛选下拉框 -->
          <div class="custom-select" v-click-outside="() => closeDropdown('type')">
            <button
              class="select-trigger"
              :class="{ active: activeDropdown === 'type' }"
              @click="toggleDropdown('type')"
            >
              {{ getTypeLabel(filterType) }}
            </button>
            <div class="select-options" :class="{ active: activeDropdown === 'type' }">
              <div
                v-for="option in typeOptions"
                :key="option.value"
                class="option"
                :class="{ selected: filterType === option.value }"
                @click="selectOption('type', option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>

          <!-- 排序下拉框 -->
          <div class="custom-select" v-click-outside="() => closeDropdown('sort')">
            <button
              class="select-trigger"
              :class="{ active: activeDropdown === 'sort' }"
              @click="toggleDropdown('sort')"
            >
              {{ getSortLabel(sortOption) }}
            </button>
            <div class="select-options" :class="{ active: activeDropdown === 'sort' }">
              <div
                v-for="option in sortOptions"
                :key="option.value"
                class="option"
                :class="{ selected: sortOption === option.value }"
                @click="selectOption('sort', option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 项目列表 -->
      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>加载项目中...</p>
      </div>

      <div v-else-if="filteredProjects.length === 0" class="empty-state">
        <folder-icon class="empty-icon" />
        <h3>没有找到项目</h3>
        <p v-if="searchQuery || filterType !== 'all'">尝试调整搜索条件或筛选器</p>
        <p v-else>点击"新建项目"按钮创建您的第一个项目</p>
        <button class="new-project-button" @click="router.push('/new-project')">
          <plus-icon class="icon" />
          <span>新建项目</span>
        </button>
      </div>

      <div v-else class="projects-grid">
        <div
          v-for="project in filteredProjects"
          :key="project._id"
          class="project-card"
          @click="openProject(project._id)"
        >
          <div class="project-thumbnail" :style="{ backgroundColor: project.color || '#8b5cf6' }">
            <component :is="getProjectIcon(project.type || 'web')" class="project-icon" />
          </div>

          <div class="project-info">
            <h3 class="project-name">{{ project.name }}</h3>
            <p class="project-description">{{ project.description || '无描述' }}</p>

            <div class="project-meta">
              <span class="project-type">
                <component :is="getProjectIcon(project.type || 'web')" class="type-icon" />
                {{ getProjectTypeName(project.type || 'web') }}
              </span>
              <span class="project-date">{{ formatDate(project.createdAt) }}</span>
            </div>
          </div>

          <div class="project-actions">
            <button class="action-button edit" @click.stop="editProject(project._id)">
              <edit-icon class="action-icon" />
            </button>
            <button class="action-button delete" @click.stop="confirmDelete(project)">
              <trash-icon class="action-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus as PlusIcon,
  Search as SearchIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Globe as WebIcon,
  Smartphone as MobileIcon,
  Layout as DesktopIcon
} from 'lucide-vue-next';
import { getAllProjects, deleteProject as apiDeleteProject } from '@/api/project';
import type { Project } from '@/api/project';

const router = useRouter();
const isLoading = ref(true);
const searchQuery = ref('');
const filterType = ref('all');
const sortOption = ref('newest');

// 项目数据
const projects = ref<Project[]>([]);

// 下拉框相关
const activeDropdown = ref<'type' | 'sort' | null>(null);

// 类型选项
const typeOptions = [
  { value: 'all', label: '所有类型' },
  { value: 'web', label: '网站' },
  { value: 'mobile', label: '移动应用' },
  { value: 'desktop', label: '桌面应用' }
];

// 排序选项
const sortOptions = [
  { value: 'newest', label: '最新创建' },
  { value: 'oldest', label: '最早创建' },
  { value: 'name', label: '名称排序' }
];

// 获取类型标签
const getTypeLabel = (value: string) => {
  return typeOptions.find(option => option.value === value)?.label || '所有类型';
};

// 获取排序标签
const getSortLabel = (value: string) => {
  return sortOptions.find(option => option.value === value)?.label || '最新创建';
};

// 切换下拉框
const toggleDropdown = (type: 'type' | 'sort') => {
  activeDropdown.value = activeDropdown.value === type ? null : type;
};

// 关闭下拉框
const closeDropdown = (type: 'type' | 'sort') => {
  if (activeDropdown.value === type) {
    activeDropdown.value = null;
  }
};

// 选择选项
const selectOption = (type: 'type' | 'sort', value: string) => {
  if (type === 'type') {
    filterType.value = value;
  } else {
    sortOption.value = value;
  }
  filterProjects();
  closeDropdown(type);
};

// 点击外部关闭指令
const clickOutside = {
  mounted(el: HTMLElement & { _clickOutside?: (event: Event) => void }, binding: any) {
    el._clickOutside = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event);
      }
    };
    document.addEventListener('click', el._clickOutside);
  },
  unmounted(el: HTMLElement & { _clickOutside?: (event: Event) => void }) {
    if (el._clickOutside) {
      document.removeEventListener('click', el._clickOutside);
    }
  }
};

// 加载项目数据
const loadProjects = async () => {
  isLoading.value = true;
  try {
    const data = await getAllProjects();

    // 为每个项目添加默认颜色和类型（如果API返回的数据中没有）
    projects.value = data.map(project => ({
      ...project,
      type: project.type || 'web',
      color: project.color || getRandomColor()
    }));
  } catch (error) {
    console.error('加载项目失败:', error);
    ElMessage.error('加载项目失败，请重试');
    projects.value = [];
  } finally {
    isLoading.value = false;
  }
};

// 生成随机颜色
const getRandomColor = () => {
  const colors = [
    '#8b5cf6', // 紫色
    '#ec4899', // 粉色
    '#3b82f6', // 蓝色
    '#10b981', // 绿色
    '#f59e0b', // 橙色
    '#ef4444'  // 红色
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// 过滤后的项目列表
const filteredProjects = computed(() => {
  let result = [...projects.value];

  // 按类型过滤
  if (filterType.value !== 'all') {
    result = result.filter(project => project.type === filterType.value);
  }

  // 按搜索词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(project =>
      project.name.toLowerCase().includes(query) ||
      (project.description && project.description.toLowerCase().includes(query))
    );
  }

  // 排序
  result.sort((a, b) => {
    if (sortOption.value === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortOption.value === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    } else if (sortOption.value === 'name') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  return result;
});

// 获取项目类型图标
const getProjectIcon = (type: string) => {
  switch (type) {
    case 'web': return WebIcon;
    case 'mobile': return MobileIcon;
    case 'desktop': return DesktopIcon;
    default: return FolderIcon;
  }
};

// 获取项目类型名称
const getProjectTypeName = (type: string) => {
  switch (type) {
    case 'web': return '网站';
    case 'mobile': return '移动应用';
    case 'desktop': return '桌面应用';
    default: return '未知类型';
  }
};

// 格式化日期
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 过滤项目
const filterProjects = () => {
  // 使用计算属性自动过滤
};

// 打开项目
const openProject = (projectId: string) => {
  router.push(`/project/${projectId}`);
};

// 编辑项目
const editProject = (projectId: string) => {
  router.push(`/project/${projectId}/edit`);
};

// 确认删除项目
const confirmDelete = (project: Project) => {
  ElMessageBox.confirm(
    `确定要删除项目 "${project.name}" 吗？此操作不可撤销。`,
    '删除项目',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deleteProject(project._id);
  }).catch(() => {
    // 用户取消删除
  });
};

// 删除项目
const deleteProject = async (projectId: string) => {
  try {
    await apiDeleteProject(projectId);
    projects.value = projects.value.filter(p => p._id !== projectId);
    ElMessage.success('项目已删除');
  } catch (error) {
    console.error('删除项目失败:', error);
    ElMessage.error('删除项目失败，请重试');
  }
};

// 初始化
onMounted(async () => {
  await loadProjects();
});
</script>

<style scoped lang="less">
.projects-container {
  padding: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  color: rgba(76, 29, 149, 0.85);
  font-family: 'Inter', system-ui, sans-serif;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
      radial-gradient(circle at 15% 15%, rgba(167, 139, 250, 0.08) 0%, transparent 35%),
      radial-gradient(circle at 85% 85%, rgba(244, 114, 182, 0.08) 0%, transparent 35%),
      radial-gradient(circle at 50% 50%, rgba(196, 181, 253, 0.05) 0%, transparent 60%);
    pointer-events: none;
    z-index: -1;
  }
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  .page-title {
    font-size: 2.2rem;
    font-weight: 700;
    margin: 0;
    background: linear-gradient(135deg, #8b5cf6, #ec4899);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 40%;
      height: 3px;
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.8), rgba(236, 72, 153, 0.2));
      border-radius: 3px;
    }
  }

  .new-project-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: rgba(139, 92, 246, 0.15);
    color: rgba(76, 29, 149, 0.9);
    border: 1px solid rgba(139, 92, 246, 0.3);
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(8px);

    &:hover {
      background: rgba(139, 92, 246, 0.25);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px -5px rgba(139, 92, 246, 0.4);
    }

    .icon {
      width: 1.125rem;
      height: 1.125rem;
      transition: transform 0.3s ease;
      color: rgba(139, 92, 246, 0.9);
    }

    &:hover .icon {
      transform: rotate(90deg);
      color: rgba(139, 92, 246, 1);
    }
  }
}

.projects-content {
  position: relative;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  box-shadow:
    0 4px 24px -2px rgba(139, 92, 246, 0.08),
    0 0 0 1px rgba(139, 92, 246, 0.03);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.3),
      rgba(236, 72, 153, 0.3),
      rgba(139, 92, 246, 0.1)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
    pointer-events: none;
  }
}

.projects-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);

  .search-box {
    position: relative;
    flex: 1;
    max-width: 300px;

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      width: 1rem;
      height: 1rem;
      color: rgba(139, 92, 246, 0.5);
    }

    input {
      width: 100%;
      padding: 0.75rem 0.75rem 0.75rem 2.5rem;
      border: 1px solid rgba(139, 92, 246, 0.15);
      border-radius: 12px;
      font-size: 0.95rem;
      color: rgba(76, 29, 149, 0.9);
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(8px);
      transition: all 0.3s ease;

      &::placeholder {
        color: rgba(107, 114, 128, 0.5);
      }

      &:hover {
        border-color: rgba(139, 92, 246, 0.3);
        background: rgba(255, 255, 255, 0.6);
      }

      &:focus {
        outline: none;
        border-color: rgba(139, 92, 246, 0.5);
        background: rgba(255, 255, 255, 0.7);
        box-shadow:
          0 0 0 3px rgba(139, 92, 246, 0.1),
          0 4px 12px -2px rgba(139, 92, 246, 0.08);
      }
    }
  }

  .filter-options {
    display: flex;
    gap: 1rem;

    .custom-select {
      position: relative;
      min-width: 140px;

      .select-trigger {
        width: 100%;
        padding: 0.75rem 2.5rem 0.75rem 1rem;
        border: 1px solid rgba(139, 92, 246, 0.15);
        border-radius: 12px;
        background-color: rgba(255, 255, 255, 0.5);
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(139, 92, 246, 0.5)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.75rem center;
        backdrop-filter: blur(8px);
        font-size: 0.95rem;
        color: rgba(76, 29, 149, 0.9);
        cursor: pointer;
        transition: all 0.3s ease;
        text-align: left;
        display: flex;
        align-items: center;

        &:hover {
          border-color: rgba(139, 92, 246, 0.3);
          background-color: rgba(255, 255, 255, 0.6);
        }

        &.active {
          border-color: rgba(139, 92, 246, 0.5);
          background-color: rgba(255, 255, 255, 0.7);
          box-shadow:
            0 0 0 3px rgba(139, 92, 246, 0.1),
            0 4px 12px -2px rgba(139, 92, 246, 0.08);
        }
      }

      .select-options {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        width: 100%;
        background: rgba(255, 255, 255, 0.98);
        border: 1px solid rgba(139, 92, 246, 0.15);
        border-radius: 12px;
        padding: 0.5rem;
        box-shadow:
          0 4px 20px -2px rgba(139, 92, 246, 0.12),
          0 0 0 1px rgba(139, 92, 246, 0.03);
        backdrop-filter: blur(12px);
        z-index: 1000;
        opacity: 0;
        transform: translateY(-10px);
        visibility: hidden;
        transition: all 0.2s ease;

        &.active {
          opacity: 1;
          transform: translateY(0);
          visibility: visible;
        }

        .option {
          padding: 0.75rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: rgba(76, 29, 149, 0.9);
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: space-between;

          &:hover {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
            color: rgba(139, 92, 246, 1);
          }

          &.selected {
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
            color: rgba(139, 92, 246, 1);
            font-weight: 500;

            &::after {
              content: '';
              width: 14px;
              height: 14px;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgba(139, 92, 246, 1)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
              background-size: contain;
              background-repeat: no-repeat;
            }
          }
        }
      }
    }
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 0;
  text-align: center;

  .spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid rgba(139, 92, 246, 0.1);
    border-top-color: rgba(139, 92, 246, 0.8);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1.5rem;
  }

  .empty-icon {
    width: 3.5rem;
    height: 3.5rem;
    color: rgba(139, 92, 246, 0.5);
    margin-bottom: 1.25rem;
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(76, 29, 149, 0.85);
    margin: 0 0 0.75rem;
  }

  p {
    margin: 0 0 2rem;
    font-size: 0.95rem;
    line-height: 1.6;
    color: rgba(107, 114, 128, 0.8);
    max-width: 360px;
    text-align: center;
  }

  .new-project-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.5);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px -4px rgba(139, 92, 246, 0.6);
      background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(236, 72, 153, 1));
    }

    .icon {
      width: 1.125rem;
      height: 1.125rem;
      transition: transform 0.3s ease;
    }

    &:hover .icon {
      transform: rotate(90deg);
    }
  }
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
  padding: 1.5rem;
}

.project-card {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(139, 92, 246, 0.08);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(8px);

  &:hover {
    background: rgba(255, 255, 255, 0.4);
    border-color: rgba(139, 92, 246, 0.15);
    transform: translateY(-2px);
    box-shadow:
      0 8px 16px -4px rgba(139, 92, 246, 0.08),
      0 0 0 1px rgba(139, 92, 246, 0.05);

    .project-actions {
      opacity: 1;
    }

    .project-thumbnail {
      .project-icon {
        transform: scale(1.1);
      }
    }
  }

  .project-thumbnail {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.9),
      rgba(236, 72, 153, 0.9)
    );

    .project-icon {
      width: 3rem;
      height: 3rem;
      color: white;
      transition: transform 0.3s ease;
    }
  }

  .project-info {
    padding: 1.5rem;

    .project-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: rgba(76, 29, 149, 0.9);
      margin: 0 0 0.75rem;
      transition: color 0.3s ease;
    }

    .project-description {
      font-size: 0.95rem;
      color: rgba(107, 114, 128, 0.8);
      margin: 0 0 1.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.5;
    }

    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      color: rgba(107, 114, 128, 0.8);

      .project-type {
        display: flex;
        align-items: center;
        gap: 0.375rem;

        .type-icon {
          width: 1rem;
          height: 1rem;
          color: rgba(139, 92, 246, 0.8);
        }
      }

      .project-date {
        font-size: 0.75rem;
        color: rgba(107, 114, 128, 0.7);
      }
    }
  }

  .project-actions {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    display: flex;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;

    .action-button {
      width: 2rem;
      height: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid rgba(139, 92, 246, 0.15);
      cursor: pointer;
      transition: all 0.3s ease;

      .action-icon {
        width: 1rem;
        height: 1rem;
        transition: transform 0.3s ease;
      }

      &.edit {
        color: rgba(59, 130, 246, 0.8);
        &:hover {
          color: rgba(59, 130, 246, 1);
          background: rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.3);
          transform: translateY(-1px);

          .action-icon {
            transform: rotate(15deg);
          }
        }
      }

      &.delete {
        color: rgba(236, 72, 153, 0.8);
        &:hover {
          color: rgba(236, 72, 153, 1);
          background: rgba(236, 72, 153, 0.1);
          border-color: rgba(236, 72, 153, 0.3);
          transform: translateY(-1px);

          .action-icon {
            transform: scale(1.1);
          }
        }
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .projects-container {
    padding: 1.5rem;
  }

  .projects-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;

    .page-title {
      font-size: 1.8rem;
    }

    .new-project-button {
      width: 100%;
      justify-content: center;
    }
  }

  .projects-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;

    .search-box {
      max-width: none;
    }

    .filter-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
  }

  .projects-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}
</style>
