<template>
  <div class="page-design-container">
    <!-- 页面设计头部 -->
    <div class="design-header">
      <div class="header-left">
        <button class="back-button" @click="router.push(`/project/${projectId}`)">
          <arrow-left-icon class="icon" />
          <span>返回项目</span>
        </button>
        <h1 class="page-title">{{ page?.name || '加载中...' }}</h1>
      </div>
      <div class="header-actions">
        <button class="save-button" @click="savePage" :disabled="isSaving">
          <save-icon class="icon" />
          <span>{{ isSaving ? '保存中...' : '保存' }}</span>
        </button>
        <button class="preview-button" @click="previewPage">
          <eye-icon class="icon" />
          <span>预览</span>
        </button>
      </div>
    </div>

    <!-- 页面设计内容区域 -->
    <div class="design-content">
      <!-- 左侧预览区域 -->
      <div class="preview-area">
        <iframe-page
          :page="page"
          :key="'iframe-' + pageId"
        />
      </div>

      <!-- 右侧编辑区域 -->
      <div class="edit-area">
        <!-- 编辑器选项卡 -->
        <div class="editor-tabs">
          <button
            class="tab-button"
            :class="{ 'active': activeTab === 'chat' }"
            @click="activeTab = 'chat'"
          >
            <message-square-icon class="tab-icon" />
            <span>AI助手</span>
          </button>
          <button
            class="tab-button"
            :class="{ 'active': activeTab === 'components' }"
            @click="activeTab = 'components'"
          >
            <layout-icon class="tab-icon" />
            <span>组件</span>
          </button>

          <button
            class="tab-button"
            :class="{ 'active': activeTab === 'code' }"
            @click="activeTab = 'code'"
          >
            <code-icon class="tab-icon" />
            <span>代码</span>
          </button>
        </div>

        <!-- 编辑器内容区域 -->
        <div class="editor-content">
          <component
            :is="getActiveComponent()"
            :page="page"
            :key="activeTab + '-' + pageId"
            @update:content="updatePageContent"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  ArrowLeft as ArrowLeftIcon,
  Save as SaveIcon,
  Eye as EyeIcon,
  Code as CodeIcon,
  Layout as LayoutIcon,
  MessageSquare as MessageSquareIcon
} from 'lucide-vue-next';

// 导入API接口
import { getPageById, updatePage, savePageHtml } from '@/api/page';
import type { Page, UpdatePageData } from '@/api/page';

// 导入存储
import { useOriginalCodeStore } from '@/stores';

// 导入四个核心组件
import IframePage from '@/components/iframePage/iframePage.vue';
import CodeMirrorEditor from '@/components/codeMirrorEditor.vue';
import ChatBox from '@/components/ai/chatBox.vue';
import ComponentArea from '@/components/componentArea/componentArea.vue';

// 路由和页面ID
const route = useRoute();
const router = useRouter();
const projectId = computed(() => route.params.projectId as string);
const pageId = computed(() => route.params.pageId as string);

// 初始化存储
const originalCodeStore = useOriginalCodeStore();

// 页面数据
const page = ref<Page | null>(null);
const isLoading = ref(true);
const isSaving = ref(false);

// 编辑器选项卡
const activeTab = ref('chat');

// 加载页面数据
const loadPage = async () => {
  isLoading.value = true;
  try {
    const pageData = await getPageById(pageId.value);

    // 确保页面数据包含必要的字段
    if (!pageData.htmlContent && pageData.content) {
      pageData.htmlContent = pageData.content;
    }

    console.log('加载页面数据成功:', {
      pageId: pageId.value,
      content: pageData.content,
      htmlContent: pageData.htmlContent
    });

    page.value = pageData;

    // 确保页面内容正确加载到编辑器和iframe中
    if (page.value && !page.value.content && page.value.htmlContent) {
      page.value.content = page.value.htmlContent;
    }

    ElMessage.success('页面加载成功');
  } catch (error) {
    console.error('加载页面失败:', error);
    ElMessage.error('加载页面失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

// 更新页面内容
const updatePageContent = (content: string) => {
  if (page.value) {
    // 更新页面内容
    page.value.content = content;
    page.value.htmlContent = content;

    // 更新预览
    originalCodeStore.changeOriginalCode(content);
  }
};

// 保存页面
const savePage = async () => {
  if (!page.value) return;

  isSaving.value = true;
  try {
    // 确保使用最新的内容
    const currentContent = page.value.content;

    console.log('正在保存HTML内容:', {
      pageId: pageId.value,
      htmlContent: currentContent
    });

    // 保存 HTML 内容
    const htmlResult = await savePageHtml({
      pageId: pageId.value,
      htmlContent: currentContent
    });

    console.log('HTML内容保存成功:', htmlResult);

    // 更新本地页面数据
    page.value = htmlResult;

    // 确保 htmlContent 字段存在
    if (!page.value.htmlContent) {
      page.value.htmlContent = page.value.content;
    }

    // 同步更新 originalCode 存储
    originalCodeStore.changeOriginalCode(currentContent);

    ElMessage.success('页面保存成功');
  } catch (error: any) {
    console.error('保存页面失败:', error);
    console.error('错误详情:', error.response?.data || error.message);
    ElMessage.error('保存页面失败，请重试');
  } finally {
    isSaving.value = false;
  }
};

// 预览页面
const previewPage = () => {
  // 检查是否有内容可以预览
  const content = page.value?.content ||
                 page.value?.htmlContent ||
                 originalCodeStore.originalCode;

  if (content) {
    // 创建一个新窗口并写入内容
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(content);
      newWindow.document.title = `预览: ${page.value?.name || '未命名页面'}`;
      newWindow.document.close();
    } else {
      ElMessage.warning('无法打开预览窗口，请检查浏览器是否阻止了弹出窗口');
    }
  } else {
    ElMessage.warning('请先添加内容再预览');
  }
};

// 根据当前选项卡获取活动组件
const getActiveComponent = () => {
  switch (activeTab.value) {
    case 'code':
      return CodeMirrorEditor;
    case 'components':
      return ComponentArea;
    case 'chat':
      return ChatBox;
    default:
      return CodeMirrorEditor;
  }
};

// 初始化
onMounted(async () => {
  await loadPage();
});
</script>

<style scoped lang="less">
.page-design-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.design-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .back-button {
      display: flex;
      align-items: center;
      background-color: transparent;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 14px;
      color: #4b5563;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background-color: #f9fafb;
      }

      .icon {
        width: 16px;
        height: 16px;
        margin-right: 6px;
      }
    }

    .page-title {
      font-size: 18px;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;

    button {
      display: flex;
      align-items: center;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      .icon {
        width: 16px;
        height: 16px;
        margin-right: 6px;
      }

      &.save-button {
        background-color: #8b5cf6;
        border: 1px solid #8b5cf6;
        color: white;

        &:hover {
          background-color: #7c3aed;
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      }

      &.preview-button {
        background-color: white;
        border: 1px solid #d1d5db;
        color: #4b5563;

        &:hover {
          background-color: #f9fafb;
        }
      }
    }
  }
}

.design-content {
  flex: 1;
  display: flex;
  overflow: hidden;

  .preview-area {
    flex: 4; // 左侧占比更大
    overflow: hidden;
    border-right: 1px solid #e5e7eb;
  }

  .edit-area {
    flex: 2; // 右侧占比较小
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .editor-tabs {
      display: flex;
      padding: 8px 12px;
      border-bottom: 1px solid #e5e7eb;
      background-color: #f9fafb;

      .tab-button {
        display: flex;
        align-items: center;
        padding: 6px 12px;
        border: none;
        background-color: transparent;
        font-size: 14px;
        color: #6b7280;
        cursor: pointer;
        border-radius: 4px;
        margin-right: 4px;

        &:hover {
          background-color: #f3f4f6;
        }

        &.active {
          background-color: #ede9fe;
          color: #6d28d9;
          font-weight: 500;
        }

        .tab-icon {
          width: 16px;
          height: 16px;
          margin-right: 6px;
        }
      }
    }

    .editor-content {
      flex: 1;
      overflow: hidden;
    }
  }
}

@media (max-width: 1024px) {
  .design-content {
    flex-direction: column;

    .preview-area, .edit-area {
      flex: none;
      height: 50%;
    }

    .preview-area {
      border-right: none;
      border-bottom: 1px solid #e5e7eb;
    }
  }
}
</style>
