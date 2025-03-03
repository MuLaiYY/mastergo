import axios from 'axios';

// 设置基础URL
const API_URL = 'http://localhost:3000/api';

// 定义接口类型
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface ResetPasswordData {
  email: string;
  password: string;
}

// 后端响应格式
interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// 用户数据格式
interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  token: string;
}

/**
 * 用户登录
 * @param data 登录数据
 * @returns Promise<UserData>
 */
export const login = async (data: LoginData): Promise<UserData> => {
  try {
    console.log('API 登录请求:', data);
    const response = await axios.post(`${API_URL}/auth/login`, data);
    console.log('API 登录响应:', response.data);

    // 检查响应格式
    if (response.data && response.data.data) {
      // 后端返回的格式是 { status, message, data: { _id, username, email, role, token } }
      return response.data.data;
    } else {
      console.error('API 登录响应格式错误:', response.data);
      throw new Error('响应格式错误');
    }
  } catch (error) {
    console.error('API 登录错误:', error);
    throw error;
  }
};

/**
 * 用户注册
 * @param data 注册数据
 * @returns Promise<UserData>
 */
export const register = async (data: RegisterData): Promise<UserData> => {
  try {
    console.log('API 注册请求:', data);
    const response = await axios.post(`${API_URL}/auth/register`, data);
    console.log('API 注册响应:', response.data);

    // 检查响应格式
    if (response.data && response.data.data) {
      // 后端返回的格式是 { status, message, data: { _id, username, email, role, token } }
      return response.data.data;
    } else {
      console.error('API 注册响应格式错误:', response.data);
      throw new Error('响应格式错误');
    }
  } catch (error) {
    console.error('API 注册错误:', error);
    throw error;
  }
};

/**
 * 重置密码
 * @param data 重置密码数据
 * @returns Promise<any>
 */
export const resetPassword = async (data: ResetPasswordData): Promise<any> => {
  try {
    console.log('API 重置密码请求:', data);
    const response = await axios.post(`${API_URL}/auth/reset-password`, data);
    console.log('API 重置密码响应:', response.data);
    return response.data;
  } catch (error) {
    console.error('API 重置密码错误:', error);
    throw error;
  }
};

/**
 * 验证token是否有效
 * @param token JWT令牌
 * @returns Promise<boolean>
 */
export const verifyToken = async (token: string): Promise<boolean> => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/verify-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.status === 200;
  } catch (error) {
    return false;
  }
};
