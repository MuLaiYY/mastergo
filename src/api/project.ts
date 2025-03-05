import http from './http';

export interface Project {
  _id: string;
  name: string;
  description?: string;
  owner: string;
  content?: object;
  thumbnail?: string;
  isPublic?: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  type?: string; // 项目类型
  color?: string; // 项目颜色
}

export interface CreateProjectData {
  name: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  type?: string; // 项目类型：web, mobile, desktop
  color?: string; // 项目颜色
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  isPublic?: boolean;
  tags?: string[];
  type?: string;
  color?: string;
}

const API_URL = import.meta.env.VITE_API_URL || '';

// 获取所有项目
export const getAllProjects = async (): Promise<Project[]> => {
  try {
    const response = await http.get(`${API_URL}/projects`);
    return response.data.data;
  } catch (error) {
    console.error('获取项目列表失败:', error);
    throw error;
  }
};

// 获取单个项目
export const getProjectById = async (id: string): Promise<Project> => {
  try {
    const response = await http.get(`${API_URL}/projects/${id}`);
    return response.data.data;
  } catch (error) {
    console.error(`获取项目 ${id} 失败:`, error);
    throw error;
  }
};

// 创建项目
export const createProject = async (projectData: CreateProjectData): Promise<Project> => {
  try {
    const response = await http.post(`${API_URL}/projects`, projectData);
    return response.data.data;
  } catch (error) {
    console.error('创建项目失败:', error);
    throw error;
  }
};

// 更新项目
export const updateProject = async (id: string, projectData: UpdateProjectData): Promise<Project> => {
  try {
    const response = await http.put(`${API_URL}/projects/${id}`, projectData);
    return response.data.data;
  } catch (error) {
    console.error(`更新项目 ${id} 失败:`, error);
    throw error;
  }
};

// 删除项目
export const deleteProject = async (id: string): Promise<void> => {
  try {
    await http.delete(`${API_URL}/projects/${id}`);
  } catch (error) {
    console.error(`删除项目 ${id} 失败:`, error);
    throw error;
  }
};
