import axios from 'axios';
import { API_URL } from './config';

// 完整的API URL
const FULL_API_URL = 'http://localhost:3000/api';

// API响应类型
export interface ApiResponse<T> {
  status: string;
  message?: string;
  data: T;
}

// 类型定义
export interface PersonalInfo {
  age?: number;
  gender?: string;
  occupation?: string;
  industry?: string;
  experience?: string;
  interests?: string[];
  preferredStyles?: string[];
  favoriteColors?: string[];
  designPreferences?: string;
  bio?: string;
}

export interface UserData {
  _id: string;
  username: string;
  email: string;
  role: string;
  personalInfo?: PersonalInfo;
  createdAt: string;
  updatedAt: string;
  token?: string; // 添加token字段以兼容登录和注册响应
}

/**
 * 获取当前用户信息
 * @returns Promise<UserData>
 */
export const getCurrentUser = async (): Promise<UserData | undefined> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('未找到登录令牌');
      return undefined;
    }

    console.log('开始请求用户信息, token:', token.substring(0, 10) + '...');

    // 使用完整的API URL
    const response = await axios.get<ApiResponse<UserData>>(`${FULL_API_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('用户信息请求成功, 响应:', response.data);

    // 验证响应数据结构
    if (!response.data || !response.data.data) {
      console.error('API响应格式不正确:', response.data);
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    console.error('获取用户信息失败:', error);

    // 检查是否是认证错误
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      console.warn('认证失败，可能需要重新登录');
      localStorage.removeItem('token');
    }

    return undefined;
  }
};

/**
 * 获取用户个人资料
 * 与getCurrentUser函数功能相同，为保持兼容性单独实现
 * @returns Promise<UserData>
 */
export const getUserProfile = async (): Promise<UserData | undefined> => {
  return await getCurrentUser();
};

/**
 * 更新当前用户的个人信息
 * @param data 包含个人信息的数据对象
 * @returns Promise<UserData>
 */
export const updateUserProfile = async (data: { personalInfo: PersonalInfo }): Promise<UserData | undefined> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('未找到登录令牌');
      throw new Error('未登录');
    }

    console.log('开始更新用户信息, 请求数据:', JSON.stringify(data));

    // 检查personalInfo字段的存在和类型
    if (!data.personalInfo) {
      console.error('personalInfo字段不存在');
      throw new Error('个人信息数据格式错误');
    }

    // 检查experience字段是否符合后端模型中定义的枚举值
    const { experience } = data.personalInfo;
    if (experience && !['初学者', '中级', '高级', '专家'].includes(experience)) {
      console.warn('经验值不在后端允许的范围内，可能会导致验证错误:', experience);
    }

    // 使用完整的API URL
    const response = await axios.put<ApiResponse<UserData>>(
      `${FULL_API_URL}/users/me/profile`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('更新用户信息成功, 响应:', response.data);

    // 验证响应数据结构
    if (!response.data || !response.data.data) {
      console.error('API响应格式不正确:', response.data);
      return undefined;
    }

    return response.data.data;
  } catch (error) {
    console.error('更新个人信息失败:', error);

    // 详细记录错误信息
    if (axios.isAxiosError(error) && error.response) {
      console.error('错误状态码:', error.response.status);
      console.error('错误响应数据:', error.response.data);
    }

    // 检查是否是认证错误
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      console.warn('认证失败，可能需要重新登录');
      localStorage.removeItem('token');
    }

    throw error;
  }
};
