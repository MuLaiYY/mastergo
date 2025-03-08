<template>
  <div class="project-detail-container">
    <!-- 项目标题和页面列表 -->
    <div class="project-header">
      <h1 class="project-title">{{ project?.name || '加载中...' }}</h1>
      <div class="project-actions">
        <button class="action-button" @click="addNewPage">
          <plus-icon class="icon" />
          <span>新建页面</span>
        </button>
      </div>
    </div>

    <!-- 页面列表 -->
    <div class="pages-container">
      <h2 class="section-title">项目页面</h2>

      <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
        <p>加载页面中...</p>
      </div>

      <div v-else-if="pages.length === 0" class="empty-state">
        <file-icon class="empty-icon" />
        <h3>没有页面</h3>
        <p>点击"新建页面"按钮创建您的第一个页面</p>
        <button class="new-page-button" @click="addNewPage">
          <plus-icon class="icon" />
          <span>新建页面</span>
        </button>
      </div>

      <div v-else class="pages-list">
        <div
          v-for="page in pages"
          :key="page._id"
          class="page-item"
          @click="openPageDesign(page._id)"
        >
          <file-icon class="page-icon" />
          <span class="page-name">{{ page.name }}</span>
          <div class="page-actions">
            <button class="page-action edit" @click.stop="renamePage(page)">
              <edit-icon class="action-icon" />
            </button>
            <button class="page-action delete" @click.stop="confirmDeletePage(page)">
              <trash-icon class="action-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 项目介绍和统计信息 -->
    <div class="project-info-container">
      <div class="project-info-card">
        <h2 class="info-title">项目介绍</h2>
        <p class="project-description">{{ project?.description || '暂无项目介绍' }}</p>
      </div>

      <div class="project-info-card">
        <h2 class="info-title">项目统计</h2>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-value">{{ pages.length }}</span>
            <span class="stat-label">页面数量</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatDate(project?.createdAt) }}</span>
            <span class="stat-label">创建时间</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatDate(project?.updatedAt) }}</span>
            <span class="stat-label">最后更新</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus as PlusIcon,
  File as FileIcon,
  Edit as EditIcon,
  Trash as TrashIcon
} from 'lucide-vue-next';

// 导入API接口
import { getProjectById } from '@/api/project';
import { getProjectPages, createPage, updatePage, deletePage as deletePageApi } from '@/api/page';
import type { Page } from '@/api/page';

// 路由和项目ID
const route = useRoute();
const router = useRouter();
const projectId = computed(() => route.params.id as string);

// 项目和页面数据
const project = ref<any>(null);
const pages = ref<Page[]>([]);
const isLoading = ref(true);

// 获取项目详情
const loadProject = async () => {
  isLoading.value = true;
  try {
    // 获取项目详情
    const projectData = await getProjectById(projectId.value);
    project.value = projectData;

    // 加载项目页面
    await loadPages();
  } catch (error) {
    console.error('加载项目失败:', error);
    ElMessage.error('加载项目失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

// 加载项目页面
const loadPages = async () => {
  try {
    // 获取项目页面
    const pagesData = await getProjectPages(projectId.value);
    pages.value = pagesData;
  } catch (error) {
    console.error('加载页面失败:', error);
    ElMessage.error('加载页面失败，请重试');
  }
};

// 打开页面设计视图
const openPageDesign = (pageId: string) => {
  router.push(`/project/${projectId.value}/page/${pageId}`);
};

// 添加新页面
const addNewPage = async () => {
  // 弹出对话框输入页面名称
  ElMessageBox.prompt('请输入页面名称', '新建页面', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '页面名称不能为空'
  }).then(async ({ value }) => {
    try {
      // 创建新页面
      const newPage = await createPage({
        name: value,
        projectId: projectId.value
      });

      // 添加到页面列表
      pages.value.push(newPage);

      // 跳转到新页面的设计视图
      openPageDesign(newPage._id);

      ElMessage.success('页面创建成功');
    } catch (error) {
      console.error('创建页面失败:', error);
      ElMessage.error('创建页面失败，请重试');
    }
  }).catch(() => {
    // 用户取消
  });
};

// 重命名页面
const renamePage = (page: Page) => {
  ElMessageBox.prompt('请输入新的页面名称', '重命名页面', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputValue: page.name,
    inputPattern: /\S+/,
    inputErrorMessage: '页面名称不能为空'
  }).then(async ({ value }) => {
    try {
      // 更新页面名称
      const updatedPage = await updatePage(page._id, { name: value });

      // 更新本地页面数据
      const index = pages.value.findIndex(p => p._id === page._id);
      if (index !== -1) {
        pages.value[index] = updatedPage;
      }

      ElMessage.success('页面重命名成功');
    } catch (error) {
      console.error('重命名页面失败:', error);
      ElMessage.error('重命名页面失败，请重试');
    }
  }).catch(() => {
    // 用户取消
  });
};

// 确认删除页面
const confirmDeletePage = (page: Page) => {
  ElMessageBox.confirm(
    `确定要删除页面 "${page.name}" 吗？此操作不可撤销。`,
    '删除页面',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    deletePage(page);
  }).catch(() => {
    // 用户取消
  });
};

// 删除页面
const deletePage = async (page: Page) => {
  try {
    // 调用API删除页面
    await deletePageApi(page._id);

    // 从页面列表中移除
    pages.value = pages.value.filter(p => p._id !== page._id);

    ElMessage.success('页面已删除');
  } catch (error) {
    console.error('删除页面失败:', error);
    ElMessage.error('删除页面失败，请重试');
  }
};

// 格式化日期
const formatDate = (dateString?: string) => {
  if (!dateString) return '未知';

  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// 初始化
onMounted(async () => {
  await loadProject();
});
</script>

<style scoped lang="less">
.project-detail-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;

  .project-title {
    font-size: 24px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }

  .project-actions {
    display: flex;
    gap: 8px;

    .action-button {
      display: flex;
      align-items: center;
      background-color: #8b5cf6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #7c3aed;
      }

      .icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
    }
  }
}

.pages-container {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;

  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 16px 0;
  }

  .pages-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 16px;
  }

  .page-item {
    display: flex;
    align-items: center;
    padding: 16px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: #8b5cf6;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

      .page-actions {
        opacity: 1;
      }
    }

    .page-icon {
      width: 20px;
      height: 20px;
      margin-right: 12px;
      color: #6b7280;
    }

    .page-name {
      flex: 1;
      font-size: 16px;
      font-weight: 500;
      color: #1f2937;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .page-actions {
      display: flex;
      gap: 8px;
      opacity: 0;
      transition: opacity 0.2s;

      .page-action {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 28px;
        height: 28px;
        border-radius: 4px;
        border: 1px solid #e5e7eb;
        background-color: white;
        cursor: pointer;

        &:hover {
          background-color: #f9fafb;
        }

        &.edit:hover {
          color: #3b82f6;
          border-color: #3b82f6;
        }

        &.delete:hover {
          color: #ef4444;
          border-color: #ef4444;
        }

        .action-icon {
          width: 16px;
          height: 16px;
        }
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;
    text-align: center;

    .empty-icon {
      width: 48px;
      height: 48px;
      color: #9ca3af;
      margin-bottom: 16px;
    }

    h3 {
      font-size: 18px;
      font-weight: 500;
      color: #374151;
      margin: 0 0 8px 0;
    }

    p {
      font-size: 16px;
      color: #6b7280;
      margin: 0 0 24px 0;
    }

    .new-page-button {
      display: flex;
      align-items: center;
      background-color: #8b5cf6;
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;

      &:hover {
        background-color: #7c3aed;
      }

      .icon {
        width: 16px;
        height: 16px;
        margin-right: 8px;
      }
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 0;

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(139, 92, 246, 0.3);
      border-radius: 50%;
      border-top-color: #8b5cf6;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    p {
      font-size: 16px;
      color: #6b7280;
      margin: 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  }
}

.project-info-container {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .project-info-card {
    background-color: white;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

    .info-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin: 0 0 16px 0;
      padding-bottom: 12px;
      border-bottom: 1px solid #e5e7eb;
    }

    .project-description {
      font-size: 16px;
      color: #4b5563;
      line-height: 1.5;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;

        .stat-value {
          font-size: 24px;
          font-weight: 600;
          color: #8b5cf6;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          color: #6b7280;
        }
      }
    }
  }
}
</style>
