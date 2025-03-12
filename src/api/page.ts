import http from './http';
import { API_URL } from './config';

// 页面接口
export interface Page {
  _id: string;
  name: string;
  htmlContent?: string;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

// 创建页面数据接口
export interface CreatePageData {
  name: string;
  htmlContent?: string;
  projectId: string;
}

// 更新页面数据接口
export interface UpdatePageData {
  name?: string;
  htmlContent?: string;
}

// 新增接口：保存页面HTML内容
export interface SavePageHtmlData {
  pageId: string;
  htmlContent: string;
}

/**
 * 获取项目的所有页面
 * @param projectId 项目ID
 * @returns 页面列表
 */
export const getProjectPages = async (projectId: string): Promise<Page[]> => {
  try {
    const response = await http.get(`${API_URL}/projects/${projectId}/pages`);
    return response.data.data;
  } catch (error) {
    console.error('获取项目页面失败:', error);
    throw error;
  }
};

/**
 * 获取页面详情
 * @param pageId 页面ID
 * @returns 页面详情
 */
export const getPageById = async (pageId: string): Promise<Page> => {
  try {
    const response = await http.get(`${API_URL}/pages/${pageId}`);
    return response.data.data;
  } catch (error) {
    console.error('获取页面详情失败:', error);
    throw error;
  }
};

/**
 * 创建新页面
 * @param pageData 页面数据
 * @returns 创建的页面
 */
export const createPage = async (pageData: CreatePageData): Promise<Page> => {
  try {
    const response = await http.post(`${API_URL}/projects/${pageData.projectId}/pages`, pageData);
    return response.data.data;
  } catch (error) {
    console.error('创建页面失败:', error);
    throw error;
  }
};

/**
 * 更新页面
 * @param pageId 页面ID
 * @param pageData 更新的页面数据
 * @returns 更新后的页面
 */
export const updatePage = async (pageId: string, pageData: UpdatePageData): Promise<Page> => {
  try {
    const response = await http.put(`${API_URL}/pages/${pageId}/content`, pageData);

    if (response.data && response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '更新页面失败');
    }
  } catch (error) {
    console.error('更新页面失败:', error);
    throw error;
  }
};

/**
 * 删除页面
 * @param pageId 页面ID
 * @returns 删除结果
 */
export const deletePage = async (pageId: string): Promise<any> => {
  try {
    const response = await http.delete(`${API_URL}/pages/${pageId}`);
    return response.data;
  } catch (error) {
    console.error('删除页面失败:', error);
    throw error;
  }
};

// 新增函数：保存页面HTML内容
export const savePageHtml = async (data: SavePageHtmlData): Promise<Page> => {
  try {
    const response = await http.post(`${API_URL}/pages/${data.pageId}/html`, {
      htmlContent: data.htmlContent
    });

    // 适配 Koa 后端的响应格式
    if (response.data && response.data.status === 'success') {
      return response.data.data;
    } else {
      throw new Error(response.data.message || '保存HTML内容失败');
    }
  } catch (error) {
    console.error('保存页面HTML内容失败:', error);
    throw error;
  }
};

// 新增函数：获取页面HTML预览链接
export const getPagePreviewUrl = (pageId: string): string => {
  return `${API_URL}/pages/${pageId}/preview`;
};

// 获取页面关联的AI聊天记录
export const getPageAiConversation = async (pageId: string): Promise<any> => {
  try {
    const response = await http.get(`${API_URL}/ai/pages/${pageId}/conversation`);
    return response.data.data;
  } catch (error) {
    console.error('获取页面AI聊天记录失败:', error);
    throw error;
  }
};

// 向页面的AI会话发送消息
export const sendAiMessage = async (conversationId: string, message: string, userMsgOnly: boolean = false): Promise<any> => {
  try {
    const response = await http.post(`${API_URL}/ai/conversations/${conversationId}/messages`, {
      content: message,
      userMsgOnly
    });
    return response.data.data;
  } catch (error) {
    console.error('发送AI消息失败:', error);
    throw error;
  }
};

// 保存AI回复到后端
export const saveAiResponseToApi = async (
  conversationId: string,
  content: string,
  type: string,
  newElement: any = null
): Promise<any> => {
  try {
    const response = await http.post(`${API_URL}/ai/conversations/${conversationId}/ai-response`, {
      content,
      type,
      metadata: {
        newElement
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('保存AI回复失败:', error);
    throw error;
  }
};

/**
 * 获取项目首页
 * @param projectId 项目ID
 * @returns 项目首页
 */
export const getProjectHomePage = async (projectId: string): Promise<Page> => {
  try {
    const response = await http.get(`${API_URL}/projects/${projectId}/homepage`);
    return response.data.data;
  } catch (error) {
    console.error('获取项目首页失败:', error);
    throw error;
  }
};
