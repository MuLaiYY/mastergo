import { defineStore } from 'pinia';
import { authApi } from '@/api';

interface UserState {
  user: {
    _id: string;
    username: string;
    email: string;
    role: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
}

// 辅助函数：验证 token 是否有效
const isValidToken = (token: string | null): boolean => {
  return token !== null && token !== undefined && token !== 'undefined' && token !== '';
};

// 从 localStorage 获取 token 并验证
const getStoredToken = (): string | null => {
  const token = localStorage.getItem('token');
  return isValidToken(token) ? token : null;
};

export const useUserStore = defineStore('mastergo-user', {
  state: (): UserState => {
    const token = getStoredToken();
    return {
      user: null,
      token: token,
      isAuthenticated: isValidToken(token)
    };
  },

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isLoggedIn: (state) => state.isAuthenticated
  },

  actions: {
    async login(email: string, password: string) {
      try {
        console.log('开始登录请求');
        const response = await authApi.login({ email, password });
        console.log('登录响应:', response);
        this.setUserData(response);
        return response;
      } catch (error) {
        console.error('登录错误:', error);
        throw error;
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        console.log('开始注册请求');
        const response = await authApi.register({ username, email, password });
        console.log('注册响应:', response);
        this.setUserData(response);
        return response;
      } catch (error) {
        console.error('注册错误:', error);
        throw error;
      }
    },

    async resetPassword(email: string, password: string) {
      try {
        const response = await authApi.resetPassword({ email, password });
        return response;
      } catch (error) {
        throw error;
      }
    },

    setUserData(data: { user: any; token: string }) {
      console.log('设置用户数据:', data);
      this.user = data.user;

      // 只有在 token 有效时才设置
      if (isValidToken(data.token)) {
        console.log('设置有效 token:', data.token);
        this.token = data.token;
        this.isAuthenticated = true;
        localStorage.setItem('token', data.token);
        console.log('localStorage 中的 token:', localStorage.getItem('token'));
      } else {
        console.warn('尝试设置无效的 token:', data.token);
        this.logout(); // 如果 token 无效，执行登出操作
      }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      localStorage.removeItem('token');
    },

    // 清除所有用户相关的存储
    clearAllStorage() {
      // 清除 localStorage 中的所有用户相关数据
      localStorage.removeItem('token');
      localStorage.removeItem('mastergo-user-storage');

      // 清除可能存在的旧存储
      localStorage.removeItem('user');

      // 重置状态
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;

      console.log('已清除所有用户存储数据');
    },

    async checkAuth() {
      const token = getStoredToken();

      if (!token) {
        this.logout();
        return false;
      }

      try {
        const isValid = await authApi.verifyToken(token);
        if (!isValid) {
          this.logout();
          return false;
        }
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    }
  },

  persist: {
    key: 'mastergo-user-storage'
  }
});
