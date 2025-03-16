# MasterGo 前端应用

这是MasterGo项目的前端应用，基于Vue 3、Vite和TypeScript构建。提供直观的页面设计与预览功能，支持代码编辑和实时预览。

## 功能特性

- 项目管理：创建、查看、编辑和删除项目
- 页面设计：使用CodeMirror编辑器编写HTML代码
- 实时预览：在编辑器中实时预览HTML内容
- 组件库：提供可拖拽的组件库，快速构建页面
- 元素交互：支持对页面元素进行选择、删除、属性编辑、旋转和缩放等操作
- 元素拖拽：支持页面内元素的拖拽重排
- AI助手：集成AI功能，辅助页面设计
- 响应式布局：适配不同屏幕尺寸

## 技术栈

- Vue 3 (Composition API)
- TypeScript
- Vite
- Pinia (状态管理)
- Vue Router
- CodeMirror (代码编辑器)
- Element Plus (UI组件库)
- Lucide Icons
- Sortable.js (拖拽排序)
- Less (CSS预处理器)

## 项目结构

```
front/
├── public/                 # 静态资源
│   ├── api/                # API接口
│   │   ├── auth.ts         # 认证相关API
│   │   ├── config.ts       # API配置
│   │   ├── http.ts         # HTTP客户端
│   │   ├── page.ts         # 页面相关API
│   │   ├── project.ts      # 项目相关API
│   │   └── user.ts         # 用户相关API
│   ├── assets/             # 资源文件
│   ├── components/         # 组件
│   │   ├── ai/             # AI相关组件
│   │   ├── componentArea/  # 组件区域
│   │   ├── iframePage/     # iframe页面预览
│   │   └── codeMirrorEditor.vue # 代码编辑器
│   ├── router/             # 路由配置
│   ├── stores/             # Pinia状态管理
│   ├── views/              # 页面视图
│   │   ├── homeView.vue           # 首页
│   │   ├── leftSideBar.vue        # 左侧边栏
│   │   ├── loginView.vue          # 登录页
│   │   ├── newProjectView.vue     # 新建项目
│   │   ├── pageDesignView.vue     # 页面设计
│   │   ├── pagePreviewView.vue    # 页面预览
│   │   ├── projectDetailView.vue  # 项目详情
│   │   └── projectsView.vue       # 项目列表
│   ├── App.vue             # 根组件
│   ├── main.ts             # 入口文件
│   └── vite-env.d.ts       # Vite环境声明
├── .eslintrc.js            # ESLint配置
├── .gitignore              # Git忽略文件
├── index.html              # HTML入口
├── package.json            # 项目依赖
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite配置
└── README.md               # 项目说明
```

## 安装与运行

### 前提条件

- Node.js (v16+)
- pnpm (推荐)

### 安装步骤

1. 克隆仓库
```sh
git clone <仓库地址>
cd mastergo/front
```

2. 安装依赖
```sh
pnpm install
```

3. 启动开发服务器
```sh
pnpm dev
```

4. 构建生产版本
```sh
pnpm build
```

## 主要功能说明

### 页面模板功能
- **平台选择**：
  - 支持多种平台类型（在线教育、电商、博客等）
  - 平台类型可以动态扩展
  - 直观的平台选择界面
- **模板管理**：
  - 每个平台提供多个预设模板
  - 模板包含完整的页面结构和样式
  - 支持模板预览和实时应用
- **代码组织**：
  - 模板代码独立存储，便于维护
  - 支持动态加载，优化性能
  - 完整的 HTML、CSS、JavaScript 结构
- **用户交互**：
  - 可视化模板选择界面
  - 实时预览功能
  - 一键应用选中模板
  - 支持模板代码编辑和自定义

### 页面设计功能

MasterGo提供了强大的页面设计功能，包括：

- **代码编辑器**：使用CodeMirror实现的HTML编辑器，支持语法高亮和自动补全
- **实时预览**：编辑代码时可以实时预览效果
- **组件拖拽**：提供可视化组件库，支持拖拽添加组件
- **属性编辑**：可以直接编辑组件的属性和样式

### 预览功能

- **即时预览**：在编辑器中点击"更新预览"按钮，可以在iframe中查看效果
- **新窗口预览**：点击"预览"按钮，可以在新窗口中查看完整页面效果
- **保存功能**：点击"保存"按钮，将内容保存到数据库

### 页面元素交互功能

MasterGo提供了丰富的页面元素交互功能，通过右键菜单实现：

- **元素选择**：开启全局元素选择模式，可以高亮并选择页面中的任意元素
- **元素删除**：右键选中元素后，可以直接删除该元素
- **属性编辑**：右键选中元素后，可以编辑元素的各种CSS属性，如宽度、高度、内边距、背景色、边框等
- **元素旋转**：支持通过拖拽控制点旋转选中的元素
- **元素缩放**：支持通过拖拽四个角的控制点调整元素大小
- **元素拖拽**：开启全局元素拖拽模式，可以自由调整页面中元素的位置和顺序
- **代码导出**：支持将当前页面的HTML代码导出为文件
- **AI修改**：支持使用AI助手修改选中的元素

### 项目管理

- **项目列表**：查看所有项目
- **项目详情**：查看项目的详细信息和页面列表
- **新建项目**：创建新的项目
- **页面管理**：在项目中创建、编辑和删除页面

## 最新功能更新

### 元素树（DOM结构）可视化
- 新增DOM元素树结构可视化功能：
  - 以树形结构展示iframe中的所有DOM元素
  - 支持父级元素的折叠和展开
  - 显示元素的标签名称，便于快速识别页面结构
  - 支持选中元素高亮显示功能，与浏览器开发者工具类似
  - 点击树中的元素节点，对应的实际DOM元素会高亮显示
  - 高亮元素自动滚动到视图中心，提升操作便捷性
  - 采用层级缩进和连接线视觉效果，清晰展示元素嵌套关系
  - 元素选择状态持久化，便于查看复杂结构

### AI自动生成页面并渲染
- 新增了AI自动生成完整网站页面的功能
- 优化了AI提示，使其能更准确地识别用户是否想要生成一个完整的网站页面
- 实现了自动检测生成页面类型，并将生成的页面代码自动插入iframe中渲染
- 添加了手动渲染按钮，用户可以点击按钮手动渲染AI生成的页面
- 改进了AI生成页面的同步机制，确保iframe预览、代码编辑器和页面内容保持一致
- 优化了代码生成和渲染流程，支持完整的HTML、CSS和JavaScript代码集成

### 登录拦截优化
- 增强了登录拦截机制，确保未登录用户无法访问需要权限的页面
- 优化了token验证流程，提高了安全性
- 改进了401错误处理，自动清除无效的登录状态并重定向到登录页面
- 添加了登录后自动重定向到原始请求页面的功能

### HTML内容编辑与预览
- 优化了HTML内容的编辑和预览功能
- 支持在不保存的情况下预览最新编辑的内容
- 改进了iframe预览和新窗口预览的实现

### 元素交互增强
- 添加了元素选择、删除、属性编辑、旋转和缩放功能
- 实现了基于Sortable.js的元素拖拽功能
- 添加了右键菜单，提供丰富的元素操作选项
- 支持元素属性的实时编辑和预览

### 代码编辑器增强
- 改进了CodeMirror编辑器的集成
- 添加了实时预览功能
- 优化了编辑器的性能和用户体验
- 新增智能代码格式化功能：
  - HTML部分代码自动左对齐，提高可读性
  - `<style>` 和 `<script>` 标签内的代码保持原有缩进格式
  - 实时格式化，编辑时自动应用
  - 保持光标位置，避免编辑体验中断
  - 支持完整的HTML文档结构

### 用户界面优化
- 改进了整体布局和导航
- 优化了移动端适配
- 添加了更多交互反馈

### 代码集成与渲染优化
- 优化了HTML、CSS和JavaScript代码的集成方式
- 统一使用srcdoc属性更新iframe内容，提高了渲染性能和稳定性
- 新增了buildFullHtmlDocument工具函数，用于构建完整的HTML文档
- 改进了AI生成页面时的代码处理流程，确保CSS和JavaScript代码正确集成
- 添加了智能文档结构检测，避免重复的HTML文档嵌套
- 优化了CSS和JS代码的插入逻辑，确保代码正确放置在文档中的适当位置

### 预览功能优化
- 统一了预览更新逻辑，避免了重复代码
- 优化了代码编辑器和页面设计器之间的内容同步
- 改进了实时预览的性能和可靠性
- 添加了完整的错误处理和用户反馈

## 最近更新

### 模板页面功能优化
- 新增页面模板选择功能：
  - 支持多平台类型选择（在线教育、电商、博客等）
  - 每个平台提供多个预设模板
  - 模板支持实时预览
  - 可一键应用选中的模板
- 优化模板代码加载机制：
  - 采用动态加载方式，减少初始加载时间
  - 模板代码存储在独立文件中，便于维护和更新
  - 支持异步加载多个模板文件
- 改进代码编辑器格式化：
  - HTML 标签部分自动左对齐
  - 保持 style 和 script 标签内的代码原有格式
  - 实时格式化，保持编辑流畅性
  - 优化光标位置处理，提升编辑体验

### 工具函数优化
- 简化了 `htmlUtils.js` 工具函数，移除了未使用的函数
- 保留并优化了核心的 `buildFullHtmlDocument` 函数
- 改进了文档注释，使其更清晰明确
- 减少了代码冗余，提高了可维护性

### HTML文档处理优化
- 优化了 `buildFullHtmlDocument` 工具函数，增加了智能文档结构检测
- 自动识别AI生成的HTML是否已包含完整文档结构
- 根据文档结构智能处理CSS和JavaScript的插入位置
- 避免重复嵌套HTML结构，提高代码可读性
- 简化了页面渲染逻辑，统一使用工具函数处理文档生成

### 代码集成与渲染优化
- 优化了HTML、CSS和JavaScript代码的集成方式
- 统一使用srcdoc属性更新iframe内容，提高了渲染性能和稳定性
- 新增了buildFullHtmlDocument工具函数，用于构建完整的HTML文档
- 改进了AI生成页面时的代码处理流程，确保CSS和JavaScript代码正确集成
- 添加了智能文档结构检测，避免重复的HTML文档嵌套
- 优化了CSS和JS代码的插入逻辑，确保代码正确放置在文档中的适当位置

### 3月14日更新
## 元素树组件功能

### DOM树可视化功能

元素树组件(`elementTree.vue`)提供了以下关键功能：

#### 基础功能
- **DOM结构可视化**：以树形结构展示iframe中的DOM元素
- **节点过滤**：自动过滤script标签、空文本节点和注释节点，保持树结构清晰
- **可折叠节点**：父节点可以展开/折叠，方便浏览复杂结构
- **节点标识**：清晰显示每个节点的标签名称

#### 交互功能
- **节点选择**：点击节点可选中，再次点击可取消选择
- **自动展开**：选中节点时自动展开所有父节点
- **DOM元素高亮**：选中节点时，对应的DOM元素会被高亮显示
- **背景点击取消选择**：点击组件背景可取消当前选择

#### 高级功能
- **双向数据绑定**：
  - 在元素树中选择节点会更新selectedElement
  - 外部更新selectedElement会自动在树中选中对应节点
- **智能滚动优化**：
  - 选中节点时自动滚动到对应DOM元素，但不锁定用户滚动
  - 选中DOM元素时自动展开树节点并滚动到可见位置
  - 使用一次性平滑滚动，不干扰用户后续的滚动操作
- **文本节点处理**：特殊处理文本节点的高亮显示
- **资源释放**：组件销毁时自动清理高亮效果和事件监听器

#### 视觉设计
- **美观的UI**：渐变背景、平滑过渡动画和精心设计的视觉层次
- **响应式设计**：适应不同大小的容器
- **自定义滚动条**：美化的滚动条设计

#### 技术特性
- **类型安全**：完整的TypeScript类型定义
- **性能优化**：使用ResizeObserver监听大小变化
- **无滚动锁定**：优化的滚动实现，确保用户可以自由滚动 

### 3月15日更新
## 元素树组件功能

### DOM树可视化功能

元素树组件(`elementTree.vue`)提供了以下关键功能：

#### 基础功能
- **DOM结构可视化**：以树形结构展示iframe中的DOM元素
- **节点过滤**：自动过滤script标签、空文本节点和注释节点，保持树结构清晰
- **可折叠节点**：父节点可以展开/折叠，方便浏览复杂结构
- **节点标识**：清晰显示每个节点的标签名称

#### 交互功能
- **节点选择**：点击节点可选中，再次点击可取消选择
- **自动展开**：选中节点时自动展开所有父节点
- **DOM元素高亮**：选中节点时，对应的DOM元素会被高亮显示
- **背景点击取消选择**：点击组件背景可取消当前选择
- **右键菜单操作**：支持对节点进行右键操作，包括：
  - **复制节点**：复制选中节点并在DOM中创建副本，同时在元素树中更新显示
  - **删除节点**：删除选中节点，同时从iframe中移除对应的DOM元素

#### 高级功能
- **双向数据绑定**：
  - 在元素树中选择节点会更新selectedElement
  - 外部更新selectedElement会自动在树中选中对应节点
- **智能滚动优化**：
  - 选中节点时自动滚动到对应DOM元素，但不锁定用户滚动
  - 选中DOM元素时自动展开树节点并滚动到可见位置
  - 使用一次性平滑滚动，不干扰用户后续的滚动操作
- **文本节点处理**：特殊处理文本节点的高亮显示
- **资源释放**：组件销毁时自动清理高亮效果和事件监听器
- **DOM结构同步**：
  - **无感知节点删除**：当iframe中的DOM元素被删除时，元素树中对应节点自动被移除，无需重建整个树
  - **无感知节点复制**：右键复制节点时，新节点直接添加到树中，保持树的展开状态
  - **自动选中状态维护**：当选中的节点被删除时，自动清除选中状态
  - **双向操作同步**：删除节点树中的节点同时删除DOM元素，删除DOM元素同时更新节点树

#### 视觉设计
- **美观的UI**：渐变背景、平滑过渡动画和精心设计的视觉层次
- **响应式设计**：适应不同大小的容器
- **自定义滚动条**：美化的滚动条设计
- **上下文菜单**：精美的右键菜单设计，支持各种节点操作

#### 技术特性
- **类型安全**：完整的TypeScript类型定义
- **性能优化**：使用ResizeObserver监听大小变化
- **无滚动锁定**：优化的滚动实现，确保用户可以自由滚动
- **实时DOM监听**：使用MutationObserver监听DOM变化，确保元素树与实际DOM同步 

## 开发指南

### 添加新组件

1. 在`src/components/`目录下创建新的组件文件
2. 在需要使用的地方导入并使用该组件

### 添加新页面

1. 在`src/views/`目录下创建新的页面文件
2. 在`src/router/index.ts`中添加对应的路由配置

### 扩展元素交互功能

1. 在`iframePage.vue`中添加新的交互功能
2. 在右键菜单中添加对应的选项
3. 实现相应的处理函数

## 许可证

[MIT](LICENSE)

## 重要问题记录

### 首页到项目页面的消息传递问题 (2024-03-xx)

#### 问题描述
从首页发送消息创建新项目时，虽然 AI 回复被正确存储在数据库中，但用户消息没有显示在项目页面上。刷新后只能看到 AI 的回复，用户的原始消息丢失。这是因为消息在不同的会话上下文中被处理。

#### 问题原因
1. 时序问题：在设置正确的页面上下文（pageId）之前就保存了消息
2. 会话上下文不一致：首页和项目页面使用了不同的 pageId，导致消息分散在不同的会话中

#### 解决方案
在 `homeView.vue` 中修改消息发送和页面跳转的顺序：

```javascript
// 正确的执行顺序
const project = await createProject({...});
const homePage = await getProjectHomePage(project._id);

// 1. 先设置页面ID，建立正确的聊天上下文
aiChatStore.setCurrentPageId(homePage._id);

// 2. 再设置初始消息，确保消息与页面关联
aiChatStore.setInitialMessage(currentInput);

// 3. 最后才进行页面跳转
await router.push({
  name: 'page-design',
  params: {
    projectId: project._id,
    pageId: homePage._id
  }
});
```

#### 关键点
- 必须先设置 pageId，再设置消息，最后才跳转
- 确保所有消息都在同一个会话上下文中
- 通过正确的初始化顺序保证数据一致性

#### 验证方法
1. 从首页发送消息创建项目
2. 检查跳转后的项目页面是否显示完整对话
3. 确认刷新页面后对话记录完整保留
