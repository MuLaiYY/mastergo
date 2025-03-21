import { defineStore } from 'pinia';
import { authApi } from '@/api';
import type { UserData } from '@/api/user';

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

        if (response && response.token) {
          // 调整为符合期望格式的数据结构
          this.setUserData({
            user: {
              _id: response._id,
              username: response.username,
              email: response.email,
              role: response.role
            },
            token: response.token
          });
        } else {
          console.error('登录响应缺少必要数据:', response);
        }

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

        if (response && response.token) {
          // 调整为符合期望格式的数据结构
          this.setUserData({
            user: {
              _id: response._id,
              username: response.username,
              email: response.email,
              role: response.role
            },
            token: response.token
          });
        } else {
          console.error('注册响应缺少必要数据:', response);
        }

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
        console.log('没有找到token，用户未登录');
        this.logout();
        return false;
      }

      try {
        console.log('开始验证token');
        const isValid = await authApi.verifyToken(token);

        if (!isValid) {
          console.log('token验证失败，执行登出');
          this.logout();
          return false;
        }

        // 如果token有效但用户数据为空，尝试获取用户信息
        if (!this.user) {
          try {
            // 这里可以添加获取用户信息的API调用
            // const userData = await authApi.getUserInfo();
            // this.user = userData;

            // 由于没有现成的getUserInfo API，我们至少设置认证状态
            this.isAuthenticated = true;
          } catch (userError) {
            console.error('获取用户信息失败:', userError);
            // 即使获取用户信息失败，只要token有效，我们仍然认为用户已登录
          }
        }

        console.log('token验证成功，用户已登录');
        return true;
      } catch (error) {
        console.error('验证token时出错:', error);
        this.logout();
        return false;
      }
    }
  },

  persist: {
    key: 'mastergo-user-storage'
  }
});
