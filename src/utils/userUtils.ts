import { getCurrentUser } from '@/api/user';
import type { UserData } from '@/api/user';

/**
 * 检查用户是否已填写个人资料
 * @returns Promise<boolean> 是否已填写个人资料
 */
export const hasCompletedProfile = async (): Promise<boolean> => {
  try {
    const userData = await getCurrentUser();

    // 检查userData和personalInfo是否存在
    if (!userData || !userData.personalInfo) {
      console.log('用户数据或个人资料不存在:', userData);
      return false;
    }

    // 检查必要字段是否已填写（这里可以根据需要调整必填字段）
    const { occupation, industry, preferredStyles, favoriteColors } = userData.personalInfo;

    // 至少填写了职业和行业，以及至少一个设计风格和一个颜色偏好
    const isCompleted = !!(
      occupation &&
      industry &&
      preferredStyles &&
      Array.isArray(preferredStyles) &&
      preferredStyles.length > 0 &&
      favoriteColors &&
      Array.isArray(favoriteColors) &&
      favoriteColors.length > 0
    );

    console.log('个人资料完整性检查结果:', isCompleted);
    return isCompleted;
  } catch (error) {
    console.error('检查用户资料失败:', error);
    return false;
  }
};

/**
 * 检查并根据需要重定向到个人资料设置页面
 * @returns Promise<boolean> 是否需要重定向（true=已重定向，false=不需要重定向）
 */
export const checkAndRedirectToProfileSetup = async (router: any): Promise<boolean> => {
  try {
    // 确保用户已登录
    const token = localStorage.getItem('token');
    if (!token) {
      console.log('用户未登录，不进行个人资料检查');
      return false;
    }

    const hasProfile = await hasCompletedProfile();
    if (!hasProfile) {
      // 用户没有填写完整的个人资料，重定向到资料设置页面
      console.log('用户资料不完整，重定向到个人资料设置页面');
      router.push('/profile/setup');
      return true;
    }

    console.log('用户资料已完整，无需重定向');
    return false;
  } catch (error) {
    console.error('检查用户资料失败:', error);
    return false;
  }
};
