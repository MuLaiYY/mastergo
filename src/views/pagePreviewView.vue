<template>
  <!-- 只有在加载失败或没有内容时才显示这个界面 -->
  <div v-if="!isLoading && (!page || (!page.htmlContent && !page.content))" class="page-preview-container">
    <div class="preview-header">
      <button class="back-button" @click="router.back()">
        <span>返回编辑</span>
      </button>
      <h1 class="page-title">{{ page?.name || '页面预览' }}</h1>
    </div>

    <div class="preview-content">
      <div class="empty-state">
        <p>此页面尚未添加HTML内容</p>
        <button class="back-button" @click="router.back()">返回编辑</button>
      </div>
    </div>
  </div>

  <!-- 加载中状态 -->
  <div v-else-if="isLoading" class="loading-container">
    <div class="spinner"></div>
    <p>加载页面中...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

// 导入API接口
import { getPageById } from '@/api/page';
import type { Page } from '@/api/page';

// 路由和页面ID
const route = useRoute();
const router = useRouter();
const pageId = computed(() => route.params.pageId as string);

// 页面数据
const page = ref<Page | null>(null);
const isLoading = ref(true);

// 加载页面数据
const loadPage = async () => {
  try {
    const pageData = await getPageById(pageId.value);
    page.value = pageData;

    console.log('获取到页面数据:', pageData);

    // 如果没有 htmlContent，使用 content 作为 HTML 内容
    const htmlContent = pageData.htmlContent || pageData.content;

    if (htmlContent) {
      console.log('使用HTML内容:', htmlContent.substring(0, 100) + '...');

      // 直接将HTML内容写入文档
      document.open();
      document.write(htmlContent);
      document.close();

      // 设置页面标题
      document.title = `预览: ${pageData.name}`;
    } else {
      console.log('页面没有HTML内容');
      // 如果没有内容，显示错误信息
      isLoading.value = false;
    }
  } catch (error) {
    console.error('加载页面失败:', error);
    isLoading.value = false;
    ElMessage.error('加载页面失败，请重试');
  }
};

// 初始化
onMounted(async () => {
  await loadPage();
});
</script>

<style scoped lang="less">
.page-preview-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background-color: white;

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
    margin-right: 16px;
    transition: all 0.2s;

    &:hover {
      background-color: #f9fafb;
    }
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #1f2937;
    margin: 0;
  }
}

.preview-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  p {
    font-size: 16px;
    color: #6b7280;
    margin-bottom: 16px;
  }

  .back-button {
    background-color: #8b5cf6;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;

    &:hover {
      background-color: #7c3aed;
    }
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;

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
</style>
