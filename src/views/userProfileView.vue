<template>
  <div class="user-profile-container">
    <!-- Particles.js 背景 -->
    <div id="particles-js" ref="particlesContainer" class="particles-container"></div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <div class="profile-content-wrapper">
      <div class="user-profile-header">
        <h1>个 人 中 心</h1>
        <p>查看和管理您的个人信息</p>
      </div>

      <div class="user-profile-content">
        <div class="user-profile-card">
          <div class="card-header">
            <h2>基本信息</h2>
            <button class="gradient-button-small" @click="navigateToEdit">修改信息</button>
          </div>

          <div class="info-section" v-if="userData">
            <div class="info-item">
              <div class="label">用户名</div>
              <div class="value">{{ userData.username }}</div>
            </div>
            <div class="info-item">
              <div class="label">邮箱</div>
              <div class="value">{{ userData.email }}</div>
            </div>
            <div class="info-item">
              <div class="label">角色</div>
              <div class="value">{{ formatRole(userData.role) }}</div>
            </div>
            <div class="info-item">
              <div class="label">注册时间</div>
              <div class="value">{{ formatDate(userData.createdAt) }}</div>
            </div>
          </div>

          <div class="card-header">
            <h2>个人资料</h2>
          </div>

          <div class="info-section" v-if="userData && userData.personalInfo">
            <div class="info-item">
              <div class="label">年龄</div>
              <div class="value">{{ userData.personalInfo.age || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="label">性别</div>
              <div class="value">{{ userData.personalInfo.gender || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="label">职业</div>
              <div class="value">{{ userData.personalInfo.occupation || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="label">行业</div>
              <div class="value">{{ userData.personalInfo.industry || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="label">经验水平</div>
              <div class="value">{{ userData.personalInfo.experience || '未设置' }}</div>
            </div>
            <div class="info-item">
              <div class="label">设计偏好</div>
              <div class="value">
                <span
                  v-for="style in userData.personalInfo.preferredStyles"
                  :key="style"
                  class="tag"
                >
                  {{ style }}
                </span>
                <span v-if="!userData.personalInfo.preferredStyles || userData.personalInfo.preferredStyles.length === 0">未设置</span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">喜欢的颜色</div>
              <div class="value">
                <span
                  v-for="color in userData.personalInfo.favoriteColors"
                  :key="color"
                  class="tag"
                >
                  {{ color }}
                </span>
                <span v-if="!userData.personalInfo.favoriteColors || userData.personalInfo.favoriteColors.length === 0">未设置</span>
              </div>
            </div>
            <div class="info-item">
              <div class="label">兴趣爱好</div>
              <div class="value">
                <span
                  v-for="interest in userData.personalInfo.interests"
                  :key="interest"
                  class="tag"
                >
                  {{ interest }}
                </span>
                <span v-if="!userData.personalInfo.interests || userData.personalInfo.interests.length === 0">未设置</span>
              </div>
            </div>
            <div class="info-item full-width">
              <div class="label">设计偏好描述</div>
              <div class="value">
                {{ userData.personalInfo.designPreferences || '未设置' }}
              </div>
            </div>
            <div class="info-item full-width">
              <div class="label">个人简介</div>
              <div class="value">
                {{ userData.personalInfo.bio || '未设置' }}
              </div>
            </div>
          </div>

          <div class="empty-profile" v-else>
            <div class="empty-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <p>您尚未完善个人资料信息</p>
            <button class="gradient-button" @click="navigateToEdit">去完善</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getCurrentUser } from '@/api/user';
import type { UserData } from '@/api/user';

const router = useRouter();
const userData = ref<UserData | undefined>(undefined);
const loading = ref(false);
const particlesContainer = ref(null);

// 格式化角色名称
const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    'user': '普通用户',
    'admin': '管理员'
  };
  return roleMap[role] || role;
};

// 格式化日期
const formatDate = (dateStr: string) => {
  if (!dateStr) return '未知';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// 初始化particles.js
const initParticles = () => {
  if (particlesContainer.value && window.particlesJS) {
    window.particlesJS('particles-js', {
      particles: {
        number: {
          value: 60,
          density: {
            enable: true,
            value_area: 900
          }
        },
        color: {
          value: ["#c084fc", "#e879f9", "#818cf8", "#38bdf8"]
        },
        shape: {
          type: "circle",
          stroke: {
            width: 0,
            color: "#000000"
          },
        },
        opacity: {
          value: 0.4,
          random: true,
          anim: {
            enable: true,
            speed: 0.8,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 1.5,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#a78bfa",
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.8,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "bubble"
          },
          onclick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          bubble: {
            distance: 150,
            size: 5,
            duration: 2,
            opacity: 0.8,
            speed: 3
          },
          push: {
            particles_nb: 3
          }
        }
      },
      retina_detect: true
    });
  }
};

// 获取用户数据
const fetchUserData = async () => {
  loading.value = true;
  try {
    const data = await getCurrentUser();
    userData.value = data;
    console.log('个人中心获取到的用户数据:', data);
  } catch (error) {
    console.error('获取用户数据失败:', error);
    ElMessage.error('获取用户数据失败，请重试');
  } finally {
    loading.value = false;
  }
};

// 跳转到编辑页面
const navigateToEdit = () => {
  router.push('/profile/setup');
};

onMounted(() => {
  fetchUserData();
  initParticles();
});
</script>

<style scoped lang="less">
.user-profile-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f5f3ff, #ede9fe);
  position: relative;
  overflow: hidden;
}

// Particles.js 容器
.particles-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

// 背景装饰
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  pointer-events: none;

  .bg-shape {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);
    opacity: 0.2;

    &.shape-1 {
      top: -10%;
      right: -5%;
      width: 40vw;
      height: 40vw;
      background: linear-gradient(135deg, #c084fc, #818cf8);
      animation: float 20s ease-in-out infinite alternate;
    }

    &.shape-2 {
      bottom: -15%;
      left: -10%;
      width: 35vw;
      height: 35vw;
      background: linear-gradient(135deg, #e879f9, #c084fc);
      animation: float 25s ease-in-out infinite alternate-reverse;
    }

    &.shape-3 {
      top: 40%;
      right: 25%;
      width: 20vw;
      height: 20vw;
      background: linear-gradient(135deg, #818cf8, #38bdf8);
      animation: float 18s ease-in-out infinite alternate;
    }
  }
}

.profile-content-wrapper {
  max-width: 1000px;
  width: 100%;
  z-index: 2;
  position: relative;
}

.user-profile-header {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;

  h1 {
    font-size: 3rem;
    font-weight: 800;
    color: #4c1d95;
    margin-bottom: 0.5rem;
    letter-spacing: -0.03em;
    line-height: 1.2;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.5);

    &::after {
      content: '';
      position: absolute;
      bottom: -0.5rem;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 4px;
      background: linear-gradient(90deg, #8b5cf6, #c084fc);
      border-radius: 2px;
    }
  }

  p {
    color: #6d28d9;
    font-size: 1.2rem;
    opacity: 0.8;
  }
}

.user-profile-content {
  display: flex;
  justify-content: center;
}

.user-profile-card {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.5);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(139, 92, 246, 0.15),
              0 0 0 1px rgba(255, 255, 255, 0.8) inset;
  padding: 2rem;
  position: relative;
  transition: all 0.3s ease;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #8b5cf6, #c084fc);
    border-radius: 3px;
  }

  h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #6d28d9;
    margin: 0;
  }
}

.gradient-button-small {
  background: linear-gradient(135deg, #8b5cf6, #c084fc);
  border: none;
  color: white;
  padding: 8px 16px;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(139, 92, 246, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }
}

.edit-button {
  display: none; /* 隐藏旧按钮样式 */
}

.info-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.info-item {
  flex: 0 0 calc(50% - 1.5rem);
  margin-bottom: 0.5rem;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(139, 92, 246, 0.1);
  }

  &.full-width {
    flex: 0 0 100%;
  }

  .label {
    font-size: 0.85rem;
    color: #8b5cf6;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .value {
    font-size: 1.1rem;
    color: #4c1d95;
    word-break: break-word;
    line-height: 1.6;
  }
}

.tag {
  display: inline-block;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(192, 132, 252, 0.2));
  color: #6d28d9;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(139, 92, 246, 0.2);
}

// Element Plus组件样式自定义
:deep(.el-form-item__label) {
  font-weight: 500;
  color: #6d28d9;
}

:deep(.el-input__wrapper),
:deep(.el-textarea__inner),
:deep(.el-input-number__decrease),
:deep(.el-input-number__increase),
:deep(.el-select__wrapper) {
  background-color: rgba(255, 255, 255, 0.6);
  border-color: rgba(139, 92, 246, 0.3);
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-textarea__inner:hover),
:deep(.el-select__wrapper:hover) {
  border-color: rgba(139, 92, 246, 0.5);
}

:deep(.el-input__wrapper:focus-within),
:deep(.el-textarea__inner:focus-within),
:deep(.el-select__wrapper:focus-within) {
  border-color: #8b5cf6;
  box-shadow: 0 0 0 1px rgba(139, 92, 246, 0.2);
}

// 选择框样式优化
:deep(.el-select-dropdown__item) {
  color: #4c1d95;

  &.selected {
    color: #8b5cf6;
    font-weight: 600;
    background-color: rgba(139, 92, 246, 0.1);
  }

  &.hover {
    background-color: rgba(139, 92, 246, 0.05);
  }
}

// 多选标签样式
:deep(.el-select__tags-text) {
  color: #6d28d9;
}

:deep(.el-select__tags .el-tag) {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(192, 132, 252, 0.2));
  border-color: rgba(139, 92, 246, 0.3);
  color: #6d28d9;
  border-radius: 12px;
}

// 选择框下拉菜单样式
:deep(.el-select-dropdown) {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.15);

  &__item {
    &.selected {
      background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(192, 132, 252, 0.1));

      &::after {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 3px;
        background: linear-gradient(135deg, #8b5cf6, #c084fc);
        border-radius: 0 2px 2px 0;
      }
    }
  }
}

.empty-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 3rem 2rem;
  gap: 1.5rem;

  .empty-icon {
    color: #8b5cf6;
    opacity: 0.5;
    animation: pulse 3s ease-in-out infinite;
  }

  p {
    color: #6d28d9;
    font-size: 1.2rem;
  }
}

.gradient-button {
  background: linear-gradient(135deg, #8b5cf6, #c084fc);
  border: none;
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 10px rgba(139, 92, 246, 0.2);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(139, 92, 246, 0.3);
  }
}

@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(3%, 3%);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
}

@media (max-width: 768px) {
  .user-profile-container {
    padding: 1rem;
  }

  .user-profile-header h1 {
    font-size: 2.2rem;
  }

  .user-profile-card {
    padding: 1.5rem;
  }

  .info-item {
    flex: 0 0 100%;
  }

  .card-header h2 {
    font-size: 1.3rem;
  }
}
</style>
