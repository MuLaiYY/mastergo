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
  padding: 32px;
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #1f2937;
}

.project-form {
  background-color: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: 8px;
    color: #374151;
  }

  input, textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;

    &:focus {
      outline: none;
      border-color: #8b5cf6;
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }

    &.error {
      border-color: #ef4444;
    }
  }

  .error-message {
    color: #ef4444;
    font-size: 12px;
    margin-top: 4px;
    display: block;
  }
}

.project-types {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;

  .project-type-card {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    transition: all 0.2s ease;

    &:hover {
      border-color: #8b5cf6;
      background-color: #f9fafb;
    }

    &.selected {
      border-color: #8b5cf6;
      background-color: rgba(139, 92, 246, 0.05);
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2);
    }

    .icon {
      color: #8b5cf6;
      margin-right: 12px;

      svg {
        width: 24px;
        height: 24px;
      }
    }

    .type-info {
      h3 {
        font-size: 16px;
        font-weight: 500;
        margin: 0 0 4px 0;
        color: #1f2937;
      }

      p {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;

  button {
    padding: 10px 16px;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;

    &.cancel-button {
      background-color: white;
      border: 1px solid #d1d5db;
      color: #6b7280;

      &:hover {
        background-color: #f9fafb;
      }
    }

    &.create-button {
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
  }
}
</style>
