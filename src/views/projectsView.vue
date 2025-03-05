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
          <select v-model="filterType" @change="filterProjects">
            <option value="all">所有类型</option>
            <option value="web">网站</option>
            <option value="mobile">移动应用</option>
            <option value="desktop">桌面应用</option>
          </select>

          <select v-model="sortOption" @change="filterProjects">
            <option value="newest">最新创建</option>
            <option value="oldest">最早创建</option>
            <option value="name">名称排序</option>
          </select>
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
  padding: 32px;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .page-title {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .new-project-button {
    display: flex;
    align-items: center;
    background-color: #8b5cf6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: #7c3aed;
    }

    .icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }
  }
}

.projects-content {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.projects-filter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;

  .search-box {
    position: relative;
    flex: 1;
    max-width: 300px;

    .search-icon {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      width: 16px;
      height: 16px;
      color: #9ca3af;
    }

    input {
      width: 100%;
      padding: 8px 8px 8px 36px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 14px;

      &:focus {
        outline: none;
        border-color: #8b5cf6;
        box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
      }
    }
  }

  .filter-options {
    display: flex;
    gap: 12px;

    select {
      padding: 8px 12px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      background-color: white;
      font-size: 14px;
      cursor: pointer;

      &:focus {
        outline: none;
        border-color: #8b5cf6;
      }
    }
  }
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  text-align: center;

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e5e7eb;
    border-top-color: #8b5cf6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  .empty-icon {
    width: 48px;
    height: 48px;
    color: #9ca3af;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    font-weight: 500;
    color: #1f2937;
    margin: 0 0 8px 0;
  }

  p {
    color: #6b7280;
    margin: 0 0 24px 0;
  }

  .new-project-button {
    display: flex;
    align-items: center;
    background-color: #8b5cf6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    font-weight: 500;
    cursor: pointer;

    &:hover {
      background-color: #7c3aed;
    }

    .icon {
      width: 18px;
      height: 18px;
      margin-right: 8px;
    }
  }
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  padding: 16px;
}

.project-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

    .project-actions {
      opacity: 1;
    }
  }

  .project-thumbnail {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;

    .project-icon {
      width: 48px;
      height: 48px;
      color: white;
    }
  }

  .project-info {
    padding: 16px;

    .project-name {
      font-size: 16px;
      font-weight: 600;
      color: #1f2937;
      margin: 0 0 8px 0;
    }

    .project-description {
      font-size: 14px;
      color: #6b7280;
      margin: 0 0 16px 0;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .project-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #6b7280;

      .project-type {
        display: flex;
        align-items: center;

        .type-icon {
          width: 14px;
          height: 14px;
          margin-right: 4px;
        }
      }
    }
  }

  .project-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;

    .action-button {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border: 1px solid #e5e7eb;
      cursor: pointer;

      &:hover {
        background-color: #f9fafb;

        &.edit {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        &.delete {
          color: #ef4444;
          border-color: #ef4444;
        }
      }

      .action-icon {
        width: 16px;
        height: 16px;
      }
    }
  }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .projects-container {
    padding: 16px;
  }

  .projects-filter {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;

    .search-box {
      max-width: none;
    }

    .filter-options {
      justify-content: space-between;
    }
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }
}
</style>
