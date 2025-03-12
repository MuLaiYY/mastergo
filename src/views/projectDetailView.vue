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

    <!-- 自定义对话框组件 -->
    <div v-if="showDialog" class="dream-dialog-overlay" @click="closeDialog">
      <div class="dream-dialog" @click.stop>
        <div class="dream-dialog-header">
          <h3>{{ dialogTitle }}</h3>
          <button class="close-button" @click="closeDialog">×</button>
        </div>
        <div class="dream-dialog-content">
          <input
            v-if="dialogType === 'input'"
            v-model="dialogInput"
            :placeholder="dialogPlaceholder"
            class="dream-input"
            @keyup.enter="confirmDialog"
          />
          <p v-else class="dialog-message">{{ dialogMessage }}</p>
        </div>
        <div class="dream-dialog-footer">
          <button class="dream-button cancel" @click="closeDialog">取消</button>
          <button
            class="dream-button confirm"
            :class="{ 'danger': dialogType === 'confirm' }"
            @click="confirmDialog"
          >
            {{ dialogType === 'confirm' ? '删除' : '确定' }}
          </button>
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

// 对话框状态管理
const showDialog = ref(false);
const dialogType = ref<'input' | 'confirm'>('input');
const dialogTitle = ref('');
const dialogMessage = ref('');
const dialogInput = ref('');
const dialogPlaceholder = ref('');
const dialogCallback = ref<(value?: string) => void>(() => {});

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

// 打开对话框
const openDialog = (options: {
  type: 'input' | 'confirm';
  title: string;
  message?: string;
  placeholder?: string;
  initialValue?: string;
  callback: (value?: string) => void;
}) => {
  dialogType.value = options.type;
  dialogTitle.value = options.title;
  dialogMessage.value = options.message || '';
  dialogPlaceholder.value = options.placeholder || '';
  dialogInput.value = options.initialValue || '';
  dialogCallback.value = options.callback;
  showDialog.value = true;
};

// 关闭对话框
const closeDialog = () => {
  showDialog.value = false;
  dialogInput.value = '';
};

// 确认对话框
const confirmDialog = () => {
  if (dialogType.value === 'input' && !dialogInput.value.trim()) {
    return;
  }
  dialogCallback.value(dialogInput.value);
  closeDialog();
};

// 修改原有的方法，使用新的对话框
const addNewPage = () => {
  openDialog({
    type: 'input',
    title: '新建页面',
    placeholder: '请输入页面名称',
    callback: async (value) => {
      if (!value) return;
      try {
        const newPage = await createPage({
          name: value,
          projectId: projectId.value
        });
        pages.value.push(newPage);
        openPageDesign(newPage._id);
        ElMessage.success('页面创建成功');
      } catch (error) {
        console.error('创建页面失败:', error);
        ElMessage.error('创建页面失败，请重试');
      }
    }
  });
};

const renamePage = (page: Page) => {
  openDialog({
    type: 'input',
    title: '重命名页面',
    placeholder: '请输入新的页面名称',
    initialValue: page.name,
    callback: async (value) => {
      if (!value) return;
      try {
        const updatedPage = await updatePage(page._id, { name: value });
        const index = pages.value.findIndex(p => p._id === page._id);
        if (index !== -1) {
          pages.value[index] = updatedPage;
        }
        ElMessage.success('页面重命名成功');
      } catch (error) {
        console.error('重命名页面失败:', error);
        ElMessage.error('重命名页面失败，请重试');
      }
    }
  });
};

const confirmDeletePage = (page: Page) => {
  openDialog({
    type: 'confirm',
    title: '删除页面',
    message: `确定要删除页面 "${page.name}" 吗？此操作不可撤销。`,
    callback: () => deletePage(page)
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

<style lang="less" scoped>
.project-detail-container {
  padding: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  color: rgba(76, 29, 149, 0.85);
  font-family: 'Inter', system-ui, sans-serif;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;

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

// 项目标题和操作按钮
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding: 0;
  position: relative;

  .project-title {
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

  .project-actions {
    display: flex;
    gap: 1rem;

    .action-button {
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
}

// 页面列表容器
.pages-container {
  position: relative;
  padding: 2rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  box-shadow:
    0 4px 24px -2px rgba(139, 92, 246, 0.08),
    0 0 0 1px rgba(139, 92, 246, 0.03);

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

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    background:
      linear-gradient(135deg, rgba(139, 92, 246, 0.05), transparent),
      linear-gradient(45deg, rgba(236, 72, 153, 0.05), transparent);
    z-index: -1;
  }

  .section-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: rgba(76, 29, 149, 0.9);
    margin: 0 0 2rem;
    padding-left: 1rem;
    position: relative;
    display: flex;
    align-items: center;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      width: 4px;
      height: 1.25rem;
      background: linear-gradient(to bottom, #8b5cf6, #ec4899);
      border-radius: 2px;
    }
  }

  .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 0;
    color: rgba(107, 114, 128, 0.7);

    .spinner {
      width: 3rem;
      height: 3rem;
      border: 3px solid rgba(139, 92, 246, 0.1);
      border-top-color: rgba(139, 92, 246, 0.8);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 1.5rem;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3.5rem 0;
    color: rgba(107, 114, 128, 0.7);

    .empty-icon {
      width: 3.5rem;
      height: 3.5rem;
      margin-bottom: 1.25rem;
      color: rgba(139, 92, 246, 0.5);
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

    .new-page-button {
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

  .pages-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.25rem;

    .page-item {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      padding: 1.25rem;
      border: 1px solid rgba(139, 92, 246, 0.08);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      transition: all 0.3s ease;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 0;
        background: linear-gradient(to bottom,
          rgba(139, 92, 246, 0.5),
          rgba(236, 72, 153, 0.5)
        );
        transition: height 0.3s ease;
        opacity: 0.6;
      }

      &:hover {
        background: rgba(255, 255, 255, 0.4);
        border-color: rgba(139, 92, 246, 0.15);
        box-shadow:
          0 8px 16px -4px rgba(139, 92, 246, 0.08),
          0 0 0 1px rgba(139, 92, 246, 0.05);
        transform: translateY(-2px);
      }

      .page-icon {
        width: 1.5rem;
        height: 1.5rem;
        margin-right: 1rem;
        color: rgba(139, 92, 246, 0.8);
        transition: transform 0.3s ease;
      }

      &:hover .page-icon {
        transform: scale(1.1);
        color: rgba(139, 92, 246, 1);
      }

      .page-name {
        font-size: 1rem;
        font-weight: 500;
        color: rgba(76, 29, 149, 0.85);
        flex-grow: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.3s ease;
      }

      &:hover .page-name {
        color: rgba(76, 29, 149, 1);
      }

      .page-actions {
        display: flex;
        gap: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s ease;

        .page-action {
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;

          .action-icon {
            width: 1rem;
            height: 1rem;
          }

          &.edit {
            color: rgba(59, 130, 246, 0.8);
            &:hover {
              color: rgba(59, 130, 246, 1);
              background: rgba(59, 130, 246, 0.1);
            }
          }

          &.delete {
            color: rgba(236, 72, 153, 0.8);
            &:hover {
              color: rgba(236, 72, 153, 1);
              background: rgba(236, 72, 153, 0.1);
            }
          }
        }
      }

      &:hover .page-actions {
        opacity: 1;
      }
    }
  }
}

// 项目信息容器
.project-info-container {
  position: relative;
  padding: 2rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  box-shadow:
    0 4px 24px -2px rgba(139, 92, 246, 0.08),
    0 0 0 1px rgba(139, 92, 246, 0.03);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(236, 72, 153, 0.3),
      rgba(139, 92, 246, 0.3),
      rgba(236, 72, 153, 0.1)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    opacity: 0.5;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 24px;
    background:
      linear-gradient(135deg, rgba(236, 72, 153, 0.05), transparent),
      linear-gradient(45deg, rgba(139, 92, 246, 0.05), transparent);
    z-index: -1;
  }

  .project-info-card {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    padding: 1.75rem;
    border: 1px solid rgba(139, 92, 246, 0.08);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    height: 100%;

    &:hover {
      background: rgba(255, 255, 255, 0.4);
      border-color: rgba(139, 92, 246, 0.15);
      box-shadow:
        0 8px 16px -4px rgba(139, 92, 246, 0.08),
        0 0 0 1px rgba(139, 92, 246, 0.05);
    }

    .info-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: rgba(76, 29, 149, 0.9);
      margin: 0 0 1.5rem;
      padding-left: 1rem;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 4px;
        height: 1.25rem;
        background: linear-gradient(to bottom, #8b5cf6, #ec4899);
        border-radius: 2px;
      }
    }

    .project-description {
      font-size: 1rem;
      line-height: 1.7;
      color: rgba(76, 29, 149, 0.75);
      padding: 1rem;
      background: rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      border: 1px solid rgba(139, 92, 246, 0.08);
      backdrop-filter: blur(4px);
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 1.25rem 1rem;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 12px;
        border: 1px solid rgba(139, 92, 246, 0.08);
        backdrop-filter: blur(4px);
        transition: all 0.3s ease;

        &:hover {
          background: rgba(255, 255, 255, 0.4);
          border-color: rgba(139, 92, 246, 0.15);
          box-shadow:
            0 8px 16px -4px rgba(139, 92, 246, 0.08),
            0 0 0 1px rgba(139, 92, 246, 0.05);
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: linear-gradient(135deg,
            rgba(139, 92, 246, 0.9),
            rgba(236, 72, 153, 0.9)
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 500;
          color: rgba(107, 114, 128, 0.8);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
      }
    }
  }
}

// 自定义对话框样式
.dream-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(76, 29, 149, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.dream-dialog {
  width: 90%;
  max-width: 480px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  box-shadow:
    0 8px 32px -4px rgba(139, 92, 246, 0.15),
    0 0 0 1px rgba(139, 92, 246, 0.05);
  overflow: hidden;
  animation: slideUp 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 24px;
    padding: 1px;
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.3),
      rgba(236, 72, 153, 0.3)
    );
    -webkit-mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }
}

.dream-dialog-header {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;

  h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.9),
      rgba(236, 72, 153, 0.9)
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .close-button {
    width: 2rem;
    height: 2rem;
    border: none;
    background: transparent;
    color: rgba(139, 92, 246, 0.5);
    font-size: 1.5rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.3s ease;

    &:hover {
      color: rgba(139, 92, 246, 0.8);
      background: rgba(139, 92, 246, 0.1);
      transform: rotate(90deg);
    }
  }
}

.dream-dialog-content {
  padding: 1.5rem;

  .dream-input {
    width: 100%;
    padding: 1rem 1.25rem;
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 16px;
    font-size: 0.95rem;
    color: rgba(76, 29, 149, 0.9);
    background: rgba(255, 255, 255, 0.5);
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

  .dialog-message {
    margin: 0;
    color: rgba(76, 29, 149, 0.85);
    font-size: 0.95rem;
    line-height: 1.6;
  }
}

.dream-dialog-footer {
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid rgba(139, 92, 246, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.dream-button {
  padding: 0.875rem 1.75rem;
  border-radius: 14px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &.cancel {
    background: rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(139, 92, 246, 0.15);
    color: rgba(76, 29, 149, 0.8);

    &:hover {
      border-color: rgba(139, 92, 246, 0.3);
      transform: translateY(-1px);
      box-shadow:
        0 4px 12px -2px rgba(139, 92, 246, 0.1),
        0 0 0 1px rgba(139, 92, 246, 0.1);
    }
  }

  &.confirm {
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.9),
      rgba(236, 72, 153, 0.9)
    );
    color: white;
    border: none;
    box-shadow:
      0 4px 12px -2px rgba(139, 92, 246, 0.3),
      0 0 0 1px rgba(139, 92, 246, 0.1);

    &:hover {
      transform: translateY(-1px);
      box-shadow:
        0 8px 16px -4px rgba(139, 92, 246, 0.4),
        0 0 0 1px rgba(139, 92, 246, 0.15);
      background: linear-gradient(135deg,
        rgba(139, 92, 246, 1),
        rgba(236, 72, 153, 1)
      );
    }

    &.danger {
      background: linear-gradient(135deg,
        rgba(236, 72, 153, 0.9),
        rgba(239, 68, 68, 0.9)
      );
      box-shadow:
        0 4px 12px -2px rgba(236, 72, 153, 0.3),
        0 0 0 1px rgba(236, 72, 153, 0.1);

      &:hover {
        box-shadow:
          0 8px 16px -4px rgba(236, 72, 153, 0.4),
          0 0 0 1px rgba(236, 72, 153, 0.15);
        background: linear-gradient(135deg,
          rgba(236, 72, 153, 1),
          rgba(239, 68, 68, 1)
        );
      }
    }
  }
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式调整
@media (max-width: 768px) {
  .project-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.5rem;

    .project-title {
      font-size: 1.8rem;
    }
  }

  .project-info-container {
    grid-template-columns: 1fr;
  }

  .pages-list {
    grid-template-columns: 1fr !important;
  }
}
</style>
