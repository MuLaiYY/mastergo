<template>
  <div class="new-project-container">
    <h1 class="page-title">新建项目</h1>

    <div class="project-form">
      <div class="form-group">
        <label for="projectName">项目名称</label>
        <input
          type="text"
          id="projectName"
          v-model="projectForm.name"
          placeholder="输入项目名称"
          :class="{ 'error': errors.name }"
        />
        <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
      </div>

      <div class="form-group">
        <label for="projectDescription">项目描述</label>
        <textarea
          id="projectDescription"
          v-model="projectForm.description"
          placeholder="输入项目描述（可选）"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label>项目类型</label>
        <div class="project-types">
          <div
            v-for="type in projectTypes"
            :key="type.id"
            class="project-type-card"
            :class="{ 'selected': projectForm.type === type.id }"
            @click="selectProjectType(type.id)"
          >
            <div class="icon" :style="{ color: type.color }">
              <component :is="type.icon" />
            </div>
            <div class="type-info">
              <h3>{{ type.name }}</h3>
              <p>{{ type.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="cancel-button" @click="goBack">取消</button>
        <button
          class="create-button"
          :disabled="isLoading"
          @click="createProjectHandler"
        >
          <span v-if="isLoading">创建中...</span>
          <span v-else>创建项目</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import {
  Globe as WebIcon,
  Smartphone as MobileIcon,
  Layout as DesktopIcon
} from 'lucide-vue-next';
import { createProject } from '@/api/project';
import type { CreateProjectData } from '@/api/project';

const router = useRouter();
const isLoading = ref(false);

// 项目表单数据
const projectForm = reactive<CreateProjectData>({
  name: '',
  description: '',
  type: 'web',
  color: '#8b5cf6'
});

// 表单错误
const errors = reactive({
  name: ''
});

// 项目类型
const projectTypes = [
  {
    id: 'web',
    name: '网站',
    description: '创建响应式网站、落地页或Web应用',
    icon: WebIcon,
    color: '#8b5cf6'
  },
  {
    id: 'mobile',
    name: '移动应用',
    description: '创建iOS或Android移动应用',
    icon: MobileIcon,
    color: '#ec4899'
  },
  {
    id: 'desktop',
    name: '桌面应用',
    description: '创建Windows、Mac或Linux桌面应用',
    icon: DesktopIcon,
    color: '#3b82f6'
  }
];

// 选择项目类型
const selectProjectType = (typeId: string) => {
  projectForm.type = typeId;

  // 设置对应的颜色
  const selectedType = projectTypes.find(type => type.id === typeId);
  if (selectedType) {
    projectForm.color = selectedType.color;
  }
};

// 验证表单
const validateForm = () => {
  let isValid = true;

  // 重置错误
  errors.name = '';

  // 验证项目名称
  if (!projectForm.name.trim()) {
    errors.name = '请输入项目名称';
    isValid = false;
  } else if (projectForm.name.length > 50) {
    errors.name = '项目名称不能超过50个字符';
    isValid = false;
  }

  return isValid;
};

// 创建项目
const createProjectHandler = async () => {
  if (!validateForm()) return;

  isLoading.value = true;

  try {
    // 调用API创建项目
    await createProject({
      name: projectForm.name,
      description: projectForm.description,
      type: projectForm.type,
      color: projectForm.color
    });

    // 创建成功后跳转到项目页面
    ElMessage.success('项目创建成功');
    router.push('/projects');
  } catch (error) {
    console.error('创建项目失败:', error);
    ElMessage.error('创建项目失败，请重试');
  } finally {
    isLoading.value = false;
  }
};

// 返回上一页
const goBack = () => {
  router.back();
};
</script>

<style scoped lang="less">
.new-project-container {
  padding: 2rem;
  max-width: 800px;
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

.page-title {
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  font-weight: 700;
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

.project-form {
  position: relative;
  padding: 1.5rem;
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
}

.form-group {
  margin-bottom: 1.5rem;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: rgba(76, 29, 149, 0.9);
    font-size: 0.95rem;
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 16px;
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

    &.error {
      border-color: rgba(239, 68, 68, 0.5);
      box-shadow:
        0 0 0 3px rgba(239, 68, 68, 0.1),
        0 4px 12px -2px rgba(239, 68, 68, 0.08);
    }
  }

  textarea {
    min-height: 80px;
    resize: vertical;
    line-height: 1.6;
  }

  .error-message {
    color: rgba(239, 68, 68, 0.9);
    font-size: 0.875rem;
    margin-top: 0.5rem;
    display: block;
  }
}

.project-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1rem;

  .project-type-card {
    background: rgba(255, 255, 255, 0.3);
    border: 1px solid rgba(139, 92, 246, 0.08);
    border-radius: 16px;
    padding: 1.25rem;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.4);
      border-color: rgba(139, 92, 246, 0.15);
      transform: translateY(-2px);
      box-shadow:
        0 8px 16px -4px rgba(139, 92, 246, 0.08),
        0 0 0 1px rgba(139, 92, 246, 0.05);
    }

    &.selected {
      background: rgba(139, 92, 246, 0.05);
      border-color: rgba(139, 92, 246, 0.3);
      box-shadow:
        0 8px 16px -4px rgba(139, 92, 246, 0.12),
        0 0 0 1px rgba(139, 92, 246, 0.1);

      .icon {
        transform: scale(1.1);
      }

      h3 {
        background: linear-gradient(135deg, rgba(139, 92, 246, 1), rgba(236, 72, 153, 1));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
    }

    .icon {
      width: 2rem;
      height: 2rem;
      transition: transform 0.3s ease;
    }

    .type-info {
      flex: 1;

      h3 {
        font-size: 1rem;
        font-weight: 600;
        margin: 0 0 0.25rem;
        color: rgba(76, 29, 149, 0.9);
        transition: all 0.3s ease;
      }

      p {
        font-size: 0.85rem;
        color: rgba(107, 114, 128, 0.8);
        margin: 0;
        line-height: 1.5;
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 92, 246, 0.1);

  button {
    padding: 0.75rem 1.5rem;
    border-radius: 14px;
    font-weight: 600;
    font-size: 0.95rem;
    cursor: pointer;
    transition: all 0.3s ease;

    &.cancel-button {
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

    &.create-button {
      background: linear-gradient(135deg,
        rgba(139, 92, 246, 0.9),
        rgba(236, 72, 153, 0.9)
      );
      color: white;
      border: none;
      box-shadow:
        0 4px 12px -2px rgba(139, 92, 246, 0.3),
        0 0 0 1px rgba(139, 92, 246, 0.1);

      &:hover:not(:disabled) {
        transform: translateY(-1px);
        box-shadow:
          0 8px 16px -4px rgba(139, 92, 246, 0.4),
          0 0 0 1px rgba(139, 92, 246, 0.15);
        background: linear-gradient(135deg,
          rgba(139, 92, 246, 1),
          rgba(236, 72, 153, 1)
        );
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  }
}

@media (max-width: 768px) {
  .new-project-container {
    padding: 1.5rem;
  }

  .page-title {
    font-size: 1.8rem;
  }

  .project-form {
    padding: 1.5rem;
  }

  .project-types {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
    gap: 0.75rem;

    button {
      width: 100%;
    }
  }
}
</style>
