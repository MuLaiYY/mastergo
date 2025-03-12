<template>
  <div class="login-container">
    <div class="login-card-wrapper">
      <!-- 卡片容器 -->
      <div class="login-card">
        <!-- 顶部装饰 -->
        <div class="top-decoration"></div>

        <!-- 标题和切换 -->
        <div class="card-header">
          <h1>{{ isLogin ? '欢迎回来' : '创建账户' }}</h1>
          <button
            @click="toggleMode"
            class="toggle-btn"
          >
            {{ isLogin ? '注册账户' : '返回登录' }}
          </button>
        </div>

        <!-- 表单区域 -->
        <div class="card-body">
          <!-- 开发工具按钮 -->
          <div v-if="isDev" class="dev-tools">
            <button @click="clearStorage" class="dev-btn">
              清除存储数据
            </button>
          </div>
          <transition name="fade" mode="out-in">
            <!-- 登录表单 -->
            <form v-if="isLogin" @submit.prevent="handleLogin" key="login" class="form">
              <div class="form-group">
                <label for="email">邮箱</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <mail-icon />
                  </div>
                  <input
                    id="email"
                    v-model="loginForm.email"
                    type="email"
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <p v-if="loginErrors.email" class="error-message">{{ loginErrors.email }}</p>
              </div>

              <div class="form-group">
                <label for="password">密码</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <lock-icon />
                  </div>
                  <input
                    id="password"
                    v-model="loginForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="password-toggle"
                  >
                    <eye-icon v-if="showPassword" />
                    <eye-off-icon v-else />
                  </button>
                </div>
                <p v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</p>
              </div>

              <div class="form-options">
                <div class="remember-me">
                  <input
                    id="remember-me"
                    v-model="loginForm.rememberMe"
                    type="checkbox"
                  />
                  <label for="remember-me">记住我</label>
                </div>

                <div class="forgot-password">
                  <a href="#" @click.prevent="showResetPassword = true">忘记密码?</a>
                </div>
              </div>

              <button
                type="submit"
                class="submit-btn"
                :disabled="loading"
              >
                <loader-icon v-if="loading" class="spinner" />
                {{ loading ? '登录中...' : '登录' }}
              </button>

              <!-- 社交登录 -->
              <div class="social-login">
                <div class="divider">
                  <span>或通过以下方式登录</span>
                </div>

                <div class="social-buttons">
                  <button type="button" class="social-btn">
                    <github-icon />
                  </button>
                  <button type="button" class="social-btn">
                    <twitter-icon />
                  </button>
                  <button type="button" class="social-btn">
                    <facebook-icon />
                  </button>
                </div>
              </div>
            </form>

            <!-- 注册表单 -->
            <form v-else @submit.prevent="handleRegister" key="register" class="form">
              <div class="form-group">
                <label for="username">用户名</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <user-icon />
                  </div>
                  <input
                    id="username"
                    v-model="registerForm.username"
                    type="text"
                    required
                    placeholder="用户名"
                  />
                </div>
                <p v-if="registerErrors.username" class="error-message">{{ registerErrors.username }}</p>
              </div>

              <div class="form-group">
                <label for="reg-email">邮箱</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <mail-icon />
                  </div>
                  <input
                    id="reg-email"
                    v-model="registerForm.email"
                    type="email"
                    required
                    placeholder="your@email.com"
                  />
                </div>
                <p v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</p>
              </div>

              <div class="form-group">
                <label for="reg-password">密码</label>
                <div class="input-wrapper">
                  <div class="input-icon">
                    <lock-icon />
                  </div>
                  <input
                    id="reg-password"
                    v-model="registerForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    required
                    placeholder="至少8个字符"
                  />
                  <button
                    type="button"
                    @click="showPassword = !showPassword"
                    class="password-toggle"
                  >
                    <eye-icon v-if="showPassword" />
                    <eye-off-icon v-else />
                  </button>
                </div>
                <p class="password-hint">密码必须包含至少8个字符</p>
                <p v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</p>
              </div>

              <div class="terms-checkbox">
                <input
                  id="terms"
                  v-model="registerForm.agreeTerms"
                  type="checkbox"
                  required
                />
                <label for="terms">
                  我同意 <a href="#">服务条款</a> 和 <a href="#">隐私政策</a>
                </label>
              </div>

              <button
                type="submit"
                class="submit-btn"
                :disabled="loading"
              >
                <loader-icon v-if="loading" class="spinner" />
                {{ loading ? '注册中...' : '创建账户' }}
              </button>
            </form>
          </transition>

          <!-- 密码重置表单 -->
          <div v-if="showResetPassword" class="reset-password-overlay">
            <div class="reset-password-modal">
              <div class="modal-header">
                <h2>重置密码</h2>
                <button type="button" class="close-btn" @click="showResetPassword = false">
                  &times;
                </button>
              </div>

              <form @submit.prevent="handleResetPassword" class="form">
                <div class="form-group">
                  <label for="reset-email">邮箱</label>
                  <div class="input-wrapper">
                    <div class="input-icon">
                      <mail-icon />
                    </div>
                    <input
                      id="reset-email"
                      v-model="resetPasswordForm.email"
                      type="email"
                      required
                      placeholder="your@email.com"
                    />
                  </div>
                  <p v-if="resetPasswordErrors.email" class="error-message">{{ resetPasswordErrors.email }}</p>
                </div>

                <div class="form-group">
                  <label for="reset-password">新密码</label>
                  <div class="input-wrapper">
                    <div class="input-icon">
                      <lock-icon />
                    </div>
                    <input
                      id="reset-password"
                      v-model="resetPasswordForm.password"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      placeholder="至少8个字符"
                    />
                    <button
                      type="button"
                      @click="showPassword = !showPassword"
                      class="password-toggle"
                    >
                      <eye-icon v-if="showPassword" />
                      <eye-off-icon v-else />
                    </button>
                  </div>
                  <p v-if="resetPasswordErrors.password" class="error-message">{{ resetPasswordErrors.password }}</p>
                </div>

                <div class="form-group">
                  <label for="confirm-password">确认密码</label>
                  <div class="input-wrapper">
                    <div class="input-icon">
                      <lock-icon />
                    </div>
                    <input
                      id="confirm-password"
                      v-model="resetPasswordForm.confirmPassword"
                      :type="showPassword ? 'text' : 'password'"
                      required
                      placeholder="确认新密码"
                    />
                  </div>
                  <p v-if="resetPasswordErrors.confirmPassword" class="error-message">{{ resetPasswordErrors.confirmPassword }}</p>
                </div>

                <button
                  type="submit"
                  class="submit-btn"
                  :disabled="loading"
                >
                  <loader-icon v-if="loading" class="spinner" />
                  {{ loading ? '处理中...' : '重置密码' }}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部信息 -->

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/stores/user';
import {
  Mail as MailIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Loader as LoaderIcon,
  Github as GithubIcon,
  Twitter as TwitterIcon,
  Facebook as FacebookIcon,
  User as UserIcon
} from 'lucide-vue-next';

// 路由和状态管理
const router = useRouter();
const userStore = useUserStore();

// 状态
const isLogin = ref(true);
const showPassword = ref(false);
const loading = ref(false);
const showResetPassword = ref(false);
const isDev = ref(import.meta.env.DEV);

// 表单数据
const loginForm = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  agreeTerms: false
});

// 密码重置表单
const resetPasswordForm = reactive({
  email: '',
  password: '',
  confirmPassword: ''
});

// 错误信息
const loginErrors = reactive({
  email: '',
  password: '',
  general: ''
});

const registerErrors = reactive({
  username: '',
  email: '',
  password: '',
  general: ''
});

const resetPasswordErrors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  general: ''
});

// 切换登录/注册模式
const toggleMode = () => {
  isLogin.value = !isLogin.value;
  // 清除错误信息
  clearErrors();
};

// 清除错误信息
const clearErrors = () => {
  loginErrors.email = '';
  loginErrors.password = '';
  loginErrors.general = '';

  registerErrors.username = '';
  registerErrors.email = '';
  registerErrors.password = '';
  registerErrors.general = '';

  resetPasswordErrors.email = '';
  resetPasswordErrors.password = '';
  resetPasswordErrors.confirmPassword = '';
  resetPasswordErrors.general = '';
};

// 验证登录表单
const validateLoginForm = () => {
  let isValid = true;
  clearErrors();

  if (!loginForm.email) {
    loginErrors.email = '请输入邮箱';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
    loginErrors.email = '请输入有效的邮箱地址';
    isValid = false;
  }

  if (!loginForm.password) {
    loginErrors.password = '请输入密码';
    isValid = false;
  }

  return isValid;
};

// 验证注册表单
const validateRegisterForm = () => {
  let isValid = true;
  clearErrors();

  if (!registerForm.username) {
    registerErrors.username = '请输入用户名';
    isValid = false;
  } else if (registerForm.username.length < 3) {
    registerErrors.username = '用户名至少需要3个字符';
    isValid = false;
  }

  if (!registerForm.email) {
    registerErrors.email = '请输入邮箱';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email)) {
    registerErrors.email = '请输入有效的邮箱地址';
    isValid = false;
  }

  if (!registerForm.password) {
    registerErrors.password = '请输入密码';
    isValid = false;
  } else if (registerForm.password.length < 8) {
    registerErrors.password = '密码至少需要8个字符';
    isValid = false;
  }

  if (!registerForm.agreeTerms) {
    ElMessage.warning('请同意服务条款和隐私政策');
    isValid = false;
  }

  return isValid;
};

// 验证密码重置表单
const validateResetPasswordForm = () => {
  let isValid = true;

  resetPasswordErrors.email = '';
  resetPasswordErrors.password = '';
  resetPasswordErrors.confirmPassword = '';
  resetPasswordErrors.general = '';

  if (!resetPasswordForm.email) {
    resetPasswordErrors.email = '请输入邮箱';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resetPasswordForm.email)) {
    resetPasswordErrors.email = '请输入有效的邮箱地址';
    isValid = false;
  }

  if (!resetPasswordForm.password) {
    resetPasswordErrors.password = '请输入新密码';
    isValid = false;
  } else if (resetPasswordForm.password.length < 8) {
    resetPasswordErrors.password = '密码至少需要8个字符';
    isValid = false;
  }

  if (!resetPasswordForm.confirmPassword) {
    resetPasswordErrors.confirmPassword = '请确认新密码';
    isValid = false;
  } else if (resetPasswordForm.password !== resetPasswordForm.confirmPassword) {
    resetPasswordErrors.confirmPassword = '两次输入的密码不一致';
    isValid = false;
  }

  return isValid;
};

// 处理登录
const handleLogin = async () => {
  if (!validateLoginForm()) return;

  loading.value = true;

  try {
    await userStore.login(loginForm.email, loginForm.password);
    ElMessage.success('登录成功');

    // 如果选择了"记住我"，可以在这里处理

    // 获取重定向URL（如果有）
    const redirectPath = router.currentRoute.value.query.redirect as string || '/';

    // 登录成功后跳转到重定向页面或首页
    router.push(redirectPath);
  } catch (error: any) {
    console.error('登录失败:', error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        loginErrors.general = data.message || '邮箱或密码错误';
        ElMessage.error(data.message || '邮箱或密码错误');
      } else if (status === 404) {
        loginErrors.general = data.message || '账号未注册，请先注册';
        ElMessage.error(data.message || '账号未注册，请先注册');
        // 可以选择自动切换到注册页面
        setTimeout(() => {
          isLogin.value = false;
        }, 1500);
      } else if (status === 400) {
        loginErrors.general = data.message || '登录请求参数错误';
        ElMessage.error(data.message || '登录请求参数错误');
      } else {
        ElMessage.error('登录失败，请稍后再试');
      }
    } else {
      ElMessage.error('网络错误，请检查您的网络连接');
    }
  } finally {
    loading.value = false;
  }
};

// 处理注册
const handleRegister = async () => {
  if (!validateRegisterForm()) return;

  loading.value = true;

  try {
    await userStore.register(
      registerForm.username,
      registerForm.email,
      registerForm.password
    );

    ElMessage.success('注册成功');

    // 获取重定向URL（如果有）
    const redirectPath = router.currentRoute.value.query.redirect as string || '/';

    // 注册成功后跳转到重定向页面或首页
    router.push(redirectPath);
  } catch (error: any) {
    console.error('注册失败:', error);

    if (error.response) {
      const { status, data } = error.response;
      console.log('注册错误响应:', data); // 打印完整的错误响应

      if (status === 400) {
        // 处理不同类型的验证错误
        if (data.message && data.message.includes('email')) {
          registerErrors.email = '该邮箱已被注册';
          ElMessage.error('该邮箱已被注册');
        } else if (data.message && data.message.includes('username')) {
          registerErrors.username = '该用户名已被使用';
          ElMessage.error('该用户名已被使用');
        } else {
          registerErrors.general = data.message || '注册失败，请检查您的输入';
          ElMessage.error(data.message || '注册失败，请检查您的输入');
        }
      } else {
        registerErrors.general = data.message || '注册失败，请稍后再试';
        ElMessage.error(data.message || '注册失败，请稍后再试');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      registerErrors.general = '网络错误，请检查您的网络连接';
      ElMessage.error('网络错误，请检查您的网络连接');
    } else {
      // 请求配置出错
      registerErrors.general = '请求配置错误';
      ElMessage.error('请求配置错误');
    }
  } finally {
    loading.value = false;
  }
};

// 处理密码重置
const handleResetPassword = async () => {
  if (!validateResetPasswordForm()) return;

  loading.value = true;

  try {
    await userStore.resetPassword(resetPasswordForm.email, resetPasswordForm.password);

    ElMessage.success('密码重置成功，请使用新密码登录');
    showResetPassword.value = false;

    // 清空表单
    resetPasswordForm.email = '';
    resetPasswordForm.password = '';
    resetPasswordForm.confirmPassword = '';

  } catch (error: any) {
    console.error('密码重置失败:', error);

    if (error.response) {
      const { status, data } = error.response;

      if (status === 404) {
        resetPasswordErrors.email = '该邮箱未注册';
        ElMessage.error('该邮箱未注册');
      } else {
        resetPasswordErrors.general = data.message || '密码重置失败，请稍后再试';
        ElMessage.error(data.message || '密码重置失败，请稍后再试');
      }
    } else {
      resetPasswordErrors.general = '网络错误，请检查您的网络连接';
      ElMessage.error('网络错误，请检查您的网络连接');
    }
  } finally {
    loading.value = false;
  }
};

// 开发工具方法 - 清除存储
const clearStorage = () => {
  userStore.clearAllStorage();
  ElMessage.success('已清除所有用户存储数据');
};
</script>

<style lang="less">
// 登录容器
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-primary);
  position: relative;
  overflow: hidden;
}

// 背景装饰
.login-container::before {
  content: '';
  position: absolute;
  top: -10%;
  right: -5%;
  width: 40vw;
  height: 40vw;
  background: linear-gradient(135deg, var(--primary-light), var(--blue-light));
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.2;
  animation: float 30s ease-in-out infinite alternate;
  z-index: 0;
}

.login-container::after {
  content: '';
  position: absolute;
  bottom: -15%;
  left: -10%;
  width: 35vw;
  height: 35vw;
  background: linear-gradient(135deg, var(--accent-light), var(--primary-light));
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.2;
  animation: float 35s ease-in-out infinite alternate-reverse;
  z-index: 0;
}

.login-card-wrapper {
  max-width: 450px;
  width: 100%;
  position: relative;
  z-index: 1;
}

// 卡片样式
.login-card {
  background-color: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  position: relative;
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-lg);
    transform: translateY(-2px);
  }

  .top-decoration {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: var(--primary-gradient);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-light);

    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .toggle-btn {
      background: none;
      border: none;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--primary-color);
      cursor: pointer;
      transition: all var(--transition-fast);
      padding: 0.5rem 1rem;
      border-radius: var(--radius-md);

      &:hover {
        background-color: rgba(139, 92, 246, 0.1);
        transform: translateY(-2px);
      }
    }
  }

  .card-body {
    padding: 1.5rem;
  }
}

// 表单样式
.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .form-group {
    margin-bottom: 1rem;

    label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;

      .input-icon {
        position: absolute;
        left: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: var(--neutral-400);
        display: flex;
        align-items: center;
        justify-content: center;

        svg {
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      input {
        width: 100%;
        padding: 0.75rem 0.75rem 0.75rem 2.5rem;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        color: var(--text-primary);
        background-color: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(5px);
        transition: all var(--transition-normal);

        &:focus {
          outline: none;
          border-color: var(--border-focus);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.2);
          transform: translateY(-1px);
        }

        &::placeholder {
          color: var(--text-muted);
        }
      }

      .password-toggle {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--neutral-400);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--primary-color);
        }

        svg {
          width: 1.25rem;
          height: 1.25rem;
        }
      }
    }

    .password-hint {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 0.5rem;
    }

    .error-message {
      font-size: 0.75rem;
      color: var(--accent-dark);
      margin-top: 0.5rem;
    }
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;

    .remember-me {
      display: flex;
      align-items: center;

      input[type="checkbox"] {
        width: 1rem;
        height: 1rem;
        border: 1px solid var(--border-light);
        border-radius: 3px;
        margin-right: 0.5rem;
        accent-color: var(--primary-color);
      }

      label {
        font-size: 0.875rem;
        color: var(--text-primary);
      }
    }

    .forgot-password {
      a {
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--primary-color);
        text-decoration: none;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }
      }
    }
  }

  .terms-checkbox {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1rem;

    input[type="checkbox"] {
      width: 1rem;
      height: 1rem;
      border: 1px solid var(--border-light);
      border-radius: 3px;
      margin-right: 0.5rem;
      margin-top: 0.25rem;
      accent-color: var(--primary-color);
    }

    label {
      font-size: 0.875rem;
      color: var(--text-primary);

      a {
        font-weight: 500;
        color: var(--primary-color);
        text-decoration: none;
        transition: all var(--transition-fast);

        &:hover {
          color: var(--primary-dark);
          text-decoration: underline;
        }
      }
    }
  }

  .submit-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--primary-gradient);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-normal);
    box-shadow: var(--shadow-sm);

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 15px rgba(139, 92, 246, 0.3);
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .spinner {
      animation: spin 1s linear infinite;
      margin-right: 0.5rem;
      width: 1rem;
      height: 1rem;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  }

  .social-login {
    margin-top: 1.5rem;

    .divider {
      position: relative;
      text-align: center;
      margin-bottom: 1.5rem;

      &:before {
        content: '';
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        height: 1px;
        background-color: var(--border-light);
      }

      span {
        position: relative;
        display: inline-block;
        padding: 0 0.5rem;
        background-color: var(--bg-card);
        font-size: 0.875rem;
        color: var(--text-muted);
      }
    }

    .social-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;

      .social-btn {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0.625rem;
        background-color: rgba(255, 255, 255, 0.5);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-normal);
        color: var(--text-primary);

        &:hover {
          background-color: rgba(255, 255, 255, 0.7);
          transform: translateY(-2px);
          box-shadow: var(--shadow-sm);
        }

        svg {
          width: 1.25rem;
          height: 1.25rem;
        }
      }
    }
  }
}

// 底部文本
.footer-text {
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-muted);
  margin-top: 1rem;
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

// 密码重置模态框
.reset-password-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.reset-password-modal {
  background-color: var(--bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  width: 90%;
  max-width: 450px;
  padding: 1.5rem;
  position: relative;
  border: 1px solid var(--border-light);
  animation: modalFadeIn 0.3s ease;

  @keyframes modalFadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;

    h2 {
      font-size: 1.5rem;
      color: var(--text-primary);
      margin: 0;
      background: var(--primary-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-muted);
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: all var(--transition-fast);

      &:hover {
        color: var(--text-primary);
        transform: rotate(90deg);
      }
    }
  }
}

// 开发工具样式
.dev-tools {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-md);
  border: 1px dashed var(--border-medium);
}

.dev-btn {
  padding: 0.25rem 0.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--accent-dark);
    transform: translateY(-1px);
  }
}

// 动画关键帧
@keyframes float {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(3%, 3%);
  }
}
</style>

