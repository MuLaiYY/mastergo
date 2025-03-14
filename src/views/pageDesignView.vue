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
            :class="{ 'active': activeTab === 'template' }"
            @click="activeTab = 'template'"
          >
            <layout-template-icon class="tab-icon" />
            <span>模板</span>
          </button>
          <button
            class="tab-button"
            :class="{ 'active': activeTab === 'elementTree' }"
            @click="activeTab = 'elementTree'"
          >
            <trees-icon class="tab-icon" />
            <span>节点树</span>
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
  MessageSquare as MessageSquareIcon,
  LayoutTemplate as LayoutTemplateIcon,

  Trees as TreesIcon
} from 'lucide-vue-next';

// 导入API接口
import { getPageById, updatePage, savePageHtml } from '@/api/page';
import type { Page, UpdatePageData } from '@/api/page';

// 导入AI聊天Store
import { useAiChatStore } from '@/stores';

// 导入四个核心组件
import IframePage from '@/components/iframePage/iframePage.vue';
import CodeMirrorEditor from '@/components/codeMirrorEditor.vue';
import ChatBox from '@/components/ai/chatBox.vue';
import ComponentArea from '@/components/componentArea/componentArea.vue';
import TemplatePage from '@/components/templatePage.vue';
import ElementTree from '@/components/elementTree.vue';
// 路由和页面ID
const route = useRoute();
const router = useRouter();
const projectId = computed(() => route.params.projectId as string);
const pageId = computed(() => route.params.pageId as string);

// 初始化存储
const aiChatStore = useAiChatStore();

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
    // 强制重置页面内容，避免显示缓存数据
    if (page.value) {
      page.value.htmlContent = '';
    }

    // 从数据库获取最新数据
    const pageData = await getPageById(pageId.value);

    console.log('加载页面数据成功:', {
      pageId: pageId.value,
      htmlContent: pageData.htmlContent
    });

    // 更新页面数据
    page.value = pageData;

    // 设置当前页面ID到AI聊天Store
    aiChatStore.setCurrentPageId(pageId.value);

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
    // 更新页面内容，只保留对当前页面的更新
    page.value.htmlContent = content;


  }
};

// 保存页面
const savePage = async () => {
  if (!page.value || !page.value.htmlContent) return;

  isSaving.value = true;
  try {
    // 确保使用最新的内容
    const currentContent = page.value.htmlContent;

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
  const content = page.value?.htmlContent || '';

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
    case 'template':
      return TemplatePage;
    case 'elementTree':
      return ElementTree;
    default:
      return CodeMirrorEditor;
  }
};

// 重新加载当前页面
const reloadPage = async () => {
  try {
    const pageData = await getPageById(pageId.value);
    page.value = pageData;
    console.log('页面已重新加载:', pageData);
  } catch (error) {
    console.error('重新加载页面失败:', error);
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
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.03) 0%,
    rgba(236, 72, 153, 0.03) 50%,
    rgba(139, 92, 246, 0.03) 100%
  );
}

.design-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(139, 92, 246, 0.1);
  box-shadow: 0 4px 20px -2px rgba(139, 92, 246, 0.08);

  .header-left {
    display: flex;
    align-items: center;
    gap: 1.25rem;

    .back-button {
      display: flex;
      align-items: center;
      background: rgba(139, 92, 246, 0.1);
      border: 1px solid rgba(139, 92, 246, 0.2);
      border-radius: 10px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      color: rgba(76, 29, 149, 0.9);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: rgba(139, 92, 246, 0.15);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.2);
      }

      .icon {
        width: 1.125rem;
        height: 1.125rem;
        margin-right: 0.5rem;
        transition: transform 0.3s ease;
      }

      &:hover .icon {
        transform: translateX(-2px);
      }
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      background: linear-gradient(135deg, #8b5cf6, #ec4899);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0;
      position: relative;

      &::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 40%;
        height: 2px;
        background: linear-gradient(90deg, rgba(139, 92, 246, 0.5), rgba(236, 72, 153, 0.2));
        border-radius: 2px;
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 0.75rem;

    button {
      display: flex;
      align-items: center;
      border-radius: 10px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;

      .icon {
        width: 1.125rem;
        height: 1.125rem;
        margin-right: 0.5rem;
        transition: transform 0.3s ease;
      }

      &.save-button {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));
        border: none;
        color: white;
        box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.3);

        &:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px -2px rgba(139, 92, 246, 0.4);
          background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(236, 72, 153, 1));
        }

        &:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        &:hover .icon {
          transform: translateY(-1px);
        }
      }

      &.preview-button {
        background: rgba(139, 92, 246, 0.1);
        border: 1px solid rgba(139, 92, 246, 0.2);
        color: rgba(76, 29, 149, 0.9);

        &:hover {
          background: rgba(139, 92, 246, 0.15);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px -2px rgba(139, 92, 246, 0.2);
        }

        &:hover .icon {
          transform: scale(1.1);
        }
      }
    }
  }
}

.design-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.5);

  .preview-area {
    flex: 4;
    overflow: hidden;
    border-right: 1px solid rgba(139, 92, 246, 0.1);
    background: white;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border-right: 1px solid rgba(139, 92, 246, 0.1);
      pointer-events: none;
      background: linear-gradient(135deg,
        rgba(139, 92, 246, 0.02) 0%,
        rgba(236, 72, 153, 0.02) 50%,
        rgba(139, 92, 246, 0.02) 100%
      );
    }
  }

  .edit-area {
    flex: 2;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);

    .editor-tabs {
      display: flex;
      padding: 0.75rem 1rem;
      background: rgba(249, 250, 251, 0.8);
      border-bottom: 1px solid rgba(139, 92, 246, 0.1);

      .tab-button {
        display: flex;
        align-items: center;
        padding: 0.5rem 1rem;
        border: none;
        background: transparent;
        font-size: 0.9rem;
        color: rgba(107, 114, 128, 0.8);
        cursor: pointer;
        border-radius: 8px;
        margin-right: 0.5rem;
        transition: all 0.3s ease;

        &:hover {
          background: rgba(139, 92, 246, 0.08);
          color: rgba(139, 92, 246, 0.9);
        }

        &.active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
          color: rgba(139, 92, 246, 1);
          font-weight: 500;
        }

        .tab-icon {
          width: 1.125rem;
          height: 1.125rem;
          margin-right: 0.5rem;
          transition: transform 0.3s ease;
        }

        &:hover .tab-icon {
          transform: scale(1.1);
        }
      }
    }

    .editor-content {
      flex: 1;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.6);
      backdrop-filter: blur(12px);
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
      border-bottom: 1px solid rgba(139, 92, 246, 0.1);
    }
  }
}
</style>
