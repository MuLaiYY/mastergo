import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const http: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
http.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      // 设置请求头的Authorization字段
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: AxiosResponse) => {
    // 如果响应成功，直接返回数据
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response;
      const responseData = error.response.data as any;

      // 根据状态码处理不同的错误
      switch (status) {
        case 400:
          ElMessage.error(responseData.message || '请求参数错误');
          break;
        case 401:
          ElMessage.error('登录已过期，请重新登录');
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          ElMessage.error('没有权限访问该资源');
          break;
        case 404:
          ElMessage.error('请求的资源不存在');
          break;
        case 500:
          ElMessage.error('服务器内部错误');
          break;
        default:
          ElMessage.error('未知错误');
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      ElMessage.error('网络错误，请检查您的网络连接');
    } else {
      // 请求配置出错
      ElMessage.error('请求配置错误');
    }

    return Promise.reject(error);
  }
);

export default http;
