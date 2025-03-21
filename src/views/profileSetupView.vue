<template>
  <div class="profile-setup-container">
    <!-- Particles.js 背景 -->
    <div id="particles-js" ref="particlesContainer" class="particles-container"></div>

    <!-- 背景装饰 -->
    <div class="background-decoration">
      <div class="bg-shape shape-1"></div>
      <div class="bg-shape shape-2"></div>
      <div class="bg-shape shape-3"></div>
    </div>

    <div class="profile-content">
      <div class="profile-header">
        <h1>个人资料设置</h1>
        <p>完善您的个人资料，帮助我们为您提供更加个性化的服务体验</p>
      </div>

      <div class="profile-form-card">
        <div class="form-section-title">基本信息</div>

        <form @submit.prevent="submitForm" class="custom-form">
          <!-- 年龄输入 -->
          <div class="form-group">
            <label for="age">年龄</label>
            <input
              type="number"
              id="age"
              v-model="userForm.age"
              class="custom-input number-input"
              min="1"
              max="120"
            >
            <div class="form-error" v-if="formErrors.age">{{ formErrors.age }}</div>
          </div>

          <!-- 性别选择 -->
          <div class="form-group">
            <label for="gender">性别</label>
            <div class="custom-dropdown" :class="{'active': dropdownOpen.gender}" ref="genderDropdown">
              <div class="selected-option" @click="toggleDropdown('gender')">
                {{ userForm.gender || '请选择' }}
                <span class="dropdown-arrow"></span>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.gender">
                <div
                  v-for="option in genderOptions"
                  :key="option"
                  class="dropdown-option"
                  :class="{'selected': userForm.gender === option}"
                  @click="selectOption('gender', option)"
                >
                  {{ option }}
                </div>
              </div>
            </div>
            <div class="form-error" v-if="formErrors.gender">{{ formErrors.gender }}</div>
          </div>

          <!-- 职业输入 -->
          <div class="form-group">
            <label for="occupation">职业</label>
            <input
              type="text"
              id="occupation"
              v-model="userForm.occupation"
              class="custom-input"
              placeholder="例如：UI设计师、产品经理"
            >
          </div>

          <!-- 行业输入 -->
          <div class="form-group">
            <label for="industry">行业</label>
            <input
              type="text"
              id="industry"
              v-model="userForm.industry"
              class="custom-input"
              placeholder="例如：互联网、教育、医疗"
            >
          </div>

          <!-- 经验水平选择 -->
          <div class="form-group">
            <label for="experience">设计经验水平</label>
            <div class="custom-dropdown" :class="{'active': dropdownOpen.experience}" ref="experienceDropdown">
              <div class="selected-option" @click="toggleDropdown('experience')">
                {{ userForm.experience || '请选择' }}
                <span class="dropdown-arrow"></span>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.experience">
                <div
                  v-for="option in experienceOptions"
                  :key="option"
                  class="dropdown-option"
                  :class="{'selected': userForm.experience === option}"
                  @click="selectOption('experience', option)"
                >
                  {{ option }}
                </div>
              </div>
            </div>
          </div>

          <div class="form-section-title">个性化偏好</div>

          <!-- 设计风格偏好多选 -->
          <div class="form-group full-width">
            <label>设计风格偏好</label>
            <div class="custom-dropdown multi-select" :class="{'active': dropdownOpen.styles}" ref="stylesDropdown">
              <div class="selected-option" @click="toggleDropdown('styles')">
                <div class="selected-tags">
                  <span v-if="userForm.preferredStyles.length === 0">请选择设计风格</span>
                  <div v-else class="selected-tag" v-for="style in userForm.preferredStyles" :key="style">
                    {{ style }}
                  </div>
                </div>
                <span class="dropdown-arrow"></span>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.styles">
                <div
                  v-for="style in designStyles"
                  :key="style"
                  class="dropdown-option multi-option"
                  :class="{'selected': userForm.preferredStyles.includes(style)}"
                  @click="toggleMultiSelection(style, 'preferredStyles')"
                >
                  <span class="checkbox-icon"></span>
                  {{ style }}
                </div>
              </div>
            </div>
          </div>

          <!-- 喜欢的颜色多选 -->
          <div class="form-group full-width">
            <label>喜欢的颜色</label>
            <div class="custom-dropdown multi-select" :class="{'active': dropdownOpen.colors}" ref="colorsDropdown">
              <div class="selected-option" @click="toggleDropdown('colors')">
                <div class="selected-tags">
                  <span v-if="userForm.favoriteColors.length === 0">请选择喜欢的颜色</span>
                  <div v-else class="selected-tag" v-for="color in userForm.favoriteColors" :key="color">
                    {{ color }}
                  </div>
                </div>
                <span class="dropdown-arrow"></span>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.colors">
                <div
                  v-for="color in colorOptions"
                  :key="color"
                  class="dropdown-option multi-option"
                  :class="{'selected': userForm.favoriteColors.includes(color)}"
                  @click="toggleMultiSelection(color, 'favoriteColors')"
                >
                  <span class="checkbox-icon"></span>
                  {{ color }}
                </div>
              </div>
            </div>
          </div>

          <!-- 兴趣爱好多选 -->
          <div class="form-group full-width">
            <label>兴趣爱好</label>
            <div class="custom-dropdown multi-select" :class="{'active': dropdownOpen.interests}" ref="interestsDropdown">
              <div class="selected-option" @click="toggleDropdown('interests')">
                <div class="selected-tags">
                  <span v-if="userForm.interests.length === 0">请选择兴趣爱好</span>
                  <div v-else class="selected-tag" v-for="interest in userForm.interests" :key="interest">
                    {{ interest }}
                  </div>
                </div>
                <span class="dropdown-arrow"></span>
              </div>
              <div class="dropdown-options" v-show="dropdownOpen.interests">
                <div
                  v-for="interest in interestOptions"
                  :key="interest"
                  class="dropdown-option multi-option"
                  :class="{'selected': userForm.interests.includes(interest)}"
                  @click="toggleMultiSelection(interest, 'interests')"
                >
                  <span class="checkbox-icon"></span>
                  {{ interest }}
                </div>
              </div>
            </div>
          </div>

          <!-- 设计偏好描述 -->
          <div class="form-group full-width">
            <label for="designPreferences">设计偏好描述</label>
            <textarea
              id="designPreferences"
              v-model="userForm.designPreferences"
              class="custom-textarea"
              placeholder="描述您喜欢的设计风格、元素和灵感来源..."
              rows="4"
            ></textarea>
          </div>

          <!-- 个人简介 -->
          <div class="form-group full-width">
            <label for="bio">个人简介</label>
            <textarea
              id="bio"
              v-model="userForm.bio"
              class="custom-textarea"
              placeholder="简单介绍一下您自己..."
              rows="4"
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" class="skip-button" @click="skipForNow">暂时跳过</button>
            <button type="submit" class="submit-button">保存信息</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { getUserProfile, updateUserProfile } from '@/api/user';

const router = useRouter();
const particlesContainer = ref(null);

// 表单数据
const userForm = reactive({
  age: '' as string | number,
  gender: '',
  occupation: '',
  industry: '',
  experience: '',
  preferredStyles: [] as string[],
  favoriteColors: [] as string[],
  interests: [] as string[],
  designPreferences: '',
  bio: ''
});

// 表单验证错误
const formErrors = reactive({
  age: '',
  gender: ''
});

// 选项数据
const genderOptions = ['男', '女', '其他', '不愿透露'];
const experienceOptions = ['初学者', '中级', '高级', '专家'];
const designStyles = [
  '极简主义', '现代', '复古', '自然', '科技感',
  '手绘风格', '扁平化设计', '材质设计', '3D', '新拟物设计'
];

const colorOptions = [
  '蓝色', '绿色', '红色', '紫色', '橙色',
  '黄色', '粉色', '灰色', '黑色', '白色'
];

const interestOptions = [
  '摄影', '绘画', '音乐', '旅行', '电影',
  '阅读', '游戏', '运动', '烹饪', '手工艺'
];

// 下拉菜单状态
const dropdownOpen = reactive({
  gender: false,
  experience: false,
  styles: false,
  colors: false,
  interests: false
});

// 下拉菜单引用
const genderDropdown = ref<HTMLElement | null>(null);
const experienceDropdown = ref<HTMLElement | null>(null);
const stylesDropdown = ref<HTMLElement | null>(null);
const colorsDropdown = ref<HTMLElement | null>(null);
const interestsDropdown = ref<HTMLElement | null>(null);

// 切换下拉菜单
const toggleDropdown = (field: 'gender' | 'experience' | 'styles' | 'colors' | 'interests') => {
  // 关闭所有其他下拉菜单
  Object.keys(dropdownOpen).forEach(key => {
    if (key !== field) {
      dropdownOpen[key as keyof typeof dropdownOpen] = false;
    }
  });

  // 切换当前下拉菜单
  dropdownOpen[field] = !dropdownOpen[field];
};

// 选择选项
const selectOption = (field: 'gender' | 'experience', value: string) => {
  userForm[field] = value;
  dropdownOpen[field] = false;
};

// 切换多选项目
const toggleMultiSelection = (value: string, field: 'preferredStyles' | 'favoriteColors' | 'interests') => {
  const index = userForm[field].indexOf(value);
  if (index === -1) {
    userForm[field].push(value);
  } else {
    userForm[field].splice(index, 1);
  }
};

// 点击外部关闭下拉菜单
const closeDropdowns = (event: MouseEvent) => {
  const target = event.target as HTMLElement;

  if (genderDropdown.value && !genderDropdown.value.contains(target)) {
    dropdownOpen.gender = false;
  }

  if (experienceDropdown.value && !experienceDropdown.value.contains(target)) {
    dropdownOpen.experience = false;
  }

  if (stylesDropdown.value && !stylesDropdown.value.contains(target)) {
    dropdownOpen.styles = false;
  }

  if (colorsDropdown.value && !colorsDropdown.value.contains(target)) {
    dropdownOpen.colors = false;
  }

  if (interestsDropdown.value && !interestsDropdown.value.contains(target)) {
    dropdownOpen.interests = false;
  }
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

// 验证表单
const validateForm = () => {
  let isValid = true;
  formErrors.age = '';
  formErrors.gender = '';

  if (userForm.age) {
    const ageNum = Number(userForm.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      formErrors.age = '请输入有效的年龄（1-120）';
      isValid = false;
    }
  }

  return isValid;
};

// 获取用户资料
const fetchUserProfile = async () => {
  try {
    const data = await getUserProfile();
    if (data && data.personalInfo) {
      const info = data.personalInfo;

      // 填充表单数据
      userForm.age = info.age || '';
      userForm.gender = info.gender || '';
      userForm.occupation = info.occupation || '';
      userForm.industry = info.industry || '';
      userForm.experience = info.experience || '';
      userForm.preferredStyles = info.preferredStyles || [];
      userForm.favoriteColors = info.favoriteColors || [];
      userForm.interests = info.interests || [];
      userForm.designPreferences = info.designPreferences || '';
      userForm.bio = info.bio || '';
    }
  } catch (error) {
    console.error('获取用户资料失败:', error);
    ElMessage.error('获取用户资料失败');
  }
};

// 提交表单
const submitForm = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    // 创建请求数据对象
    const requestData = {
      personalInfo: {
        age: userForm.age ? Number(userForm.age) : undefined,
        gender: userForm.gender,
        occupation: userForm.occupation,
        industry: userForm.industry,
        experience: userForm.experience,
        preferredStyles: userForm.preferredStyles,
        favoriteColors: userForm.favoriteColors,
        interests: userForm.interests,
        designPreferences: userForm.designPreferences,
        bio: userForm.bio
      }
    };

    console.log('提交个人资料:', JSON.stringify(requestData));

    const result = await updateUserProfile(requestData);
    console.log('更新结果:', result);

    ElMessage.success('个人资料已更新');
    router.push('/profile');
  } catch (error: any) {
    console.error('更新资料失败:', error);

    // 提供更具体的错误信息
    let errorMessage = '更新资料失败，请重试';
    if (error.response) {
      const { status, data } = error.response;

      if (status === 400) {
        errorMessage = `表单数据验证失败: ${data?.message || '请检查输入字段'}`;
      } else if (status === 401) {
        errorMessage = '登录已过期，请重新登录';
        // 重定向到登录页
        setTimeout(() => router.push('/login'), 1500);
      } else if (status === 404) {
        errorMessage = '用户不存在';
      } else if (status === 500) {
        errorMessage = '服务器错误，请稍后再试';
      }
    }

    ElMessage.error(errorMessage);
  }
};

// 跳过设置
const skipForNow = () => {
  router.push('/');
};

onMounted(() => {
  fetchUserProfile();
  initParticles();
  document.addEventListener('click', closeDropdowns);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdowns);
});
</script>

<style scoped lang="less">
.profile-setup-container {
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

.profile-content {
  max-width: 800px;
  width: 100%;
  z-index: 2;
  position: relative;
}

.profile-header {
  margin-bottom: 2rem;
  text-align: center;
  position: relative;

  h1 {
    font-size: 2.5rem;
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
    font-size: 1.1rem;
    opacity: 0.8;
    max-width: 600px;
    margin: 0 auto;
  }
}

.profile-form-card {
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

.form-section-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #6d28d9;
  margin: 1.5rem 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #8b5cf6, #c084fc);
    border-radius: 3px;
  }

  &:first-child {
    margin-top: 0;
  }
}

.custom-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.form-group {
  flex: 0 0 calc(50% - 0.75rem);
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;

  &.full-width {
    flex: 0 0 100%;
  }

  label {
    font-size: 0.9rem;
    color: #6d28d9;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }
}

.custom-input {
  height: 50px;
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background-color: rgba(255, 255, 255, 0.6);
  padding: 0 1rem;
  font-size: 1rem;
  color: #4c1d95;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }

  &.number-input {
    padding-right: 0.5rem;
  }
}

.custom-dropdown {
  position: relative;
  width: 100%;

  .selected-option {
    height: 50px;
    border-radius: 12px;
    border: 1px solid rgba(139, 92, 246, 0.3);
    background-color: rgba(255, 255, 255, 0.6);
    padding: 0 1rem;
    font-size: 1rem;
    color: #4c1d95;
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);

    .dropdown-arrow {
      display: block;
      width: 12px;
      height: 12px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%238b5cf6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: center;
      background-size: contain;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }
  }

  &.active {
    .selected-option {
      border-color: #8b5cf6;
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);

      .dropdown-arrow {
        transform: rotate(180deg);
      }
    }
  }

  .dropdown-options {
    position: absolute;
    top: calc(100% + 5px);
    left: 0;
    width: 100%;
    max-height: 200px;
    overflow-y: auto;
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(139, 92, 246, 0.1);
    z-index: 10;
    padding: 8px 0;
    animation: fadeIn 0.2s ease;

    .dropdown-option {
      padding: 10px 16px;
      font-size: 0.95rem;
      color: #4c1d95;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background-color: rgba(139, 92, 246, 0.1);
      }

      &.selected {
        background: linear-gradient(90deg, rgba(139, 92, 246, 0.2), rgba(192, 132, 252, 0.1));
        color: #6d28d9;
        font-weight: 500;
      }

      &.multi-option {
        display: flex;
        align-items: center;

        .checkbox-icon {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          border: 1px solid rgba(139, 92, 246, 0.4);
          margin-right: 10px;
          position: relative;
          transition: all 0.2s ease;

          &:after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background-color: white;
            opacity: 0;
            transition: opacity 0.2s ease;
          }
        }

        &.selected .checkbox-icon {
          background-color: #8b5cf6;
          border-color: #8b5cf6;

          &:after {
            opacity: 1;
          }
        }
      }
    }
  }

  &.multi-select {
    .selected-option {
      height: auto;
      min-height: 50px;
      padding: 0.5rem 1rem;
    }

    .selected-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      flex: 1;

      .selected-tag {
        background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(192, 132, 252, 0.2));
        border-radius: 20px;
        padding: 0.25rem 0.75rem;
        font-size: 0.85rem;
        color: #6d28d9;
        display: inline-block;
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.custom-textarea {
  min-height: 120px;
  border-radius: 12px;
  border: 1px solid rgba(139, 92, 246, 0.3);
  background-color: rgba(255, 255, 255, 0.6);
  padding: 1rem;
  font-size: 1rem;
  color: #4c1d95;
  transition: all 0.3s ease;
  resize: vertical;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.03);

  &:focus {
    outline: none;
    border-color: #8b5cf6;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
  }
}

.custom-checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.custom-checkbox-item {
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(139, 92, 246, 0.2);
  border-radius: 30px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background-color: rgba(139, 92, 246, 0.05);
    border-color: rgba(139, 92, 246, 0.3);
  }

  &.checked {
    background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(192, 132, 252, 0.2));
    border-color: rgba(139, 92, 246, 0.4);

    .checkbox-icon {
      background-color: #8b5cf6;
      border-color: #8b5cf6;

      &:after {
        opacity: 1;
      }
    }
  }

  .checkbox-icon {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid rgba(139, 92, 246, 0.4);
    margin-right: 8px;
    position: relative;
    transition: all 0.2s ease;

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: white;
      opacity: 0;
      transition: opacity 0.2s ease;
    }
  }

  .checkbox-label {
    color: #4c1d95;
    font-size: 0.9rem;
  }
}

.form-error {
  color: #ef4444;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  margin-top: 2rem;
  gap: 1rem;
}

.skip-button {
  background-color: transparent;
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #6d28d9;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: rgba(139, 92, 246, 0.05);
    border-color: rgba(139, 92, 246, 0.4);
  }
}

.submit-button {
  background: linear-gradient(135deg, #8b5cf6, #c084fc);
  border: none;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 500;
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

@media (max-width: 768px) {
  .profile-setup-container {
    padding: 1rem;
  }

  .profile-header h1 {
    font-size: 2rem;
  }

  .profile-form-card {
    padding: 1.5rem;
  }

  .form-group {
    flex: 0 0 100%;
  }

  .form-actions {
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
}
</style>
