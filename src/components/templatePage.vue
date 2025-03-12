<template>
  <div class="template-page">
    <div class="content-wrapper">
      <h2 class="title">页面模板</h2>

      <!-- 平台选择 -->
      <div class="platform-selector">
        <h3 class="section-title">选择平台类型</h3>
        <div class="platform-buttons">
          <button
            v-for="platform in platforms"
            :key="platform.id"
            class="platform-btn"
            :class="{ 'active': selectedPlatform === platform.id }"
            @click="selectPlatform(platform.id)"
          >
            <i :class="platform.icon" class="icon"></i>
            <span>{{ platform.name }}</span>
          </button>
        </div>
      </div>

      <!-- 页面模板选择 -->
      <div v-if="selectedPlatform" class="template-selector">
        <h3 class="section-title">选择页面模板</h3>
        <div class="template-grid">
          <div
            v-for="template in getTemplatesByPlatform"
            :key="template.id"
            class="template-card"
            :class="{ 'active': selectedTemplate === template.id }"
            @click="selectTemplate(template)"
          >
            <div class="template-preview">
              <div class="preview-content">
                <i class="fas fa-file-code preview-icon"></i>
                <span class="preview-type">{{ template.name }}</span>
              </div>
            </div>
            <div class="template-info">
              <h4 class="template-name">{{ template.name }}</h4>
              <p class="template-desc">{{ template.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div v-if="selectedTemplate" class="action-buttons">
        <button class="apply-btn" @click="applyTemplate">
          <i class="fas fa-check icon"></i>
          <span>应用模板</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

// 定义平台类型
interface Platform {
  id: string
  name: string
  icon: string
  available: boolean
}

// 定义模板类型
interface Template {
  id: string
  platformId: string
  name: string
  description: string
  preview?: string
  get code(): string
}

// 读取在线教育网站的模板代码
const onlineEducationCode = ref({
  firstPage: '',
  secondPage: '',
  thirdPage: ''
})

// 加载模板文件
const loadTemplateFiles = async () => {
  try {
    const [firstPage, secondPage, thirdPage] = await Promise.all([
      fetch('/onlineEducationCode/firstPage.html').then(res => res.text()),
      fetch('/onlineEducationCode/secondPage.html').then(res => res.text()),
      fetch('/onlineEducationCode/thirdPage.html').then(res => res.text())
    ])

    onlineEducationCode.value = {
      firstPage,
      secondPage,
      thirdPage
    }

    console.log('模板文件加载成功')
  } catch (error) {
    console.error('加载模板文件失败:', error)
    ElMessage.error('模板文件加载失败，请刷新页面重试')
  }
}

// 定义平台列表
const platforms = ref<Platform[]>([
  {
    id: 'education',
    name: '在线教育网站',
    icon: 'fas fa-graduation-cap',
    available: true
  },
  {
    id: 'ecommerce',
    name: '电商网站',
    icon: 'fas fa-shopping-cart',
    available: false
  },
  {
    id: 'blog',
    name: '博客网站',
    icon: 'fas fa-blog',
    available: false
  }
])

// 定义模板列表
const templates = ref<Template[]>([
  {
    id: 'education-home',
    platformId: 'education',
    name: '首页',
    description: '展示课程概览、热门课程和讲师信息',
    preview: '/preview-education-home.png',
    get code() {
      return onlineEducationCode.value.firstPage
    }
  },
  {
    id: 'education-courses',
    platformId: 'education',
    name: '课程列表页',
    description: '展示所有课程，支持筛选和搜索',
    preview: '/preview-education-courses.png',
    get code() {
      return onlineEducationCode.value.secondPage
    }
  },
  {
    id: 'education-detail',
    platformId: 'education',
    name: '课程详情页',
    description: '展示课程详细信息和购买选项',
    preview: '/preview-education-detail.png',
    get code() {
      return onlineEducationCode.value.thirdPage
    }
  }
])

// 选中的平台和模板
const selectedPlatform = ref<string>('')
const selectedTemplate = ref<string>('')

// 根据选中的平台筛选模板
const getTemplatesByPlatform = computed(() => {
  return templates.value.filter(t => t.platformId === selectedPlatform.value)
})

// 选择平台
const selectPlatform = (platformId: string) => {
  const platform = platforms.value.find(p => p.id === platformId)
  if (!platform?.available) {
    ElMessage.warning('该平台模板暂未开放，敬请期待！')
    return
  }
  selectedPlatform.value = platformId
  selectedTemplate.value = ''
}

// 选择模板
const selectTemplate = (template: Template) => {
  selectedTemplate.value = template.id
}

// 定义 props 和 emit
const props = defineProps<{
  page?: any
}>()

const emit = defineEmits<{
  'update:content': [content: string]
}>()

// 应用模板
const applyTemplate = () => {
  const template = templates.value.find(t => t.id === selectedTemplate.value)
  if (template) {
    emit('update:content', template.code)
    ElMessage.success('模板应用成功！')
  }
}

// 在组件挂载时加载模板文件
onMounted(() => {
  loadTemplateFiles()
})
</script>

<style scoped lang="less">
.template-page {
  height: 100%;
  padding: 1.5rem;
  overflow-y: auto;
  background: var(--bg-primary);
  position: relative;

  &::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg,
      rgba(139, 92, 246, 0.05) 0%,
      rgba(236, 72, 153, 0.05) 50%,
      rgba(59, 130, 246, 0.05) 100%
    );
    pointer-events: none;
  }

  .content-wrapper {
    position: relative;
    z-index: 1;
  }

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 0;
      width: 3rem;
      height: 0.25rem;
      background: linear-gradient(90deg, var(--primary-color), var(--accent-color));
      border-radius: 1rem;
    }
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 1rem;
    color: var(--text-secondary);
  }

  .platform-selector {
    margin-bottom: 2rem;

    .platform-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
  }

  .platform-btn {
    display: flex;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-light);
    background-color: var(--bg-card);
    color: var(--text-secondary);
    font-weight: 500;
    transition: all var(--transition-normal);
    backdrop-filter: blur(8px);

    .icon {
      margin-right: 0.5rem;
    }

    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    &.active {
      background: var(--primary-gradient);
      color: white;
      border-color: transparent;
      box-shadow: var(--shadow-md);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }

  .template-selector {
    margin-bottom: 2rem;
  }

  .template-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
    padding: 0.5rem;
  }

  .template-card {
    border: 1px solid var(--border-light);
    border-radius: var(--radius-lg);
    overflow: hidden;
    cursor: pointer;
    transition: all var(--transition-normal);
    background: var(--bg-card);
    backdrop-filter: blur(8px);

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
      border-color: var(--primary-light);
    }

    &.active {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }

    .template-preview {
      height: 140px;
      background: linear-gradient(135deg,
        rgba(139, 92, 246, 0.1),
        rgba(236, 72, 153, 0.1)
      );
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        width: 200%;
        height: 200%;
        background: linear-gradient(
          45deg,
          transparent 0%,
          rgba(255, 255, 255, 0.1) 50%,
          transparent 100%
        );
        animation: shine 3s infinite linear;
      }

      .preview-content {
        text-align: center;
        color: var(--primary-color);
        z-index: 1;

        .preview-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          opacity: 0.8;
        }

        .preview-type {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
      }
    }

    .template-info {
      padding: 1.25rem;
      background: var(--bg-card);

      .template-name {
        font-weight: 600;
        margin-bottom: 0.5rem;
        color: var(--text-primary);
      }

      .template-desc {
        font-size: 0.875rem;
        color: var(--text-muted);
        line-height: 1.5;
      }
    }
  }

  .action-buttons {
    margin-top: 2rem;
    display: flex;
    justify-content: center;

    .apply-btn {
      display: flex;
      align-items: center;
      padding: 0.875rem 2.5rem;
      border-radius: var(--radius-lg);
      background: var(--primary-gradient);
      color: white;
      font-weight: 500;
      transition: all var(--transition-normal);
      border: none;
      box-shadow: var(--shadow-md);

      .icon {
        margin-right: 0.5rem;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-lg);
      }

      &:active {
        transform: translateY(0);
      }
    }
  }
}

@keyframes shine {
  0% {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  100% {
    transform: translate(-50%, -50%) rotate(360deg);
  }
}
</style>


