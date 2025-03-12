// 为 particlesJS 添加类型声明
interface Window {
  particlesJS: (
    elementId: string,
    options: any
  ) => void;
}

declare module 'particles.js';
