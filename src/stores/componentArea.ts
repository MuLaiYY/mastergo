import { ref } from 'vue'
import { defineStore } from 'pinia'
import { Navigation, BookOpen, MessageSquare, FootprintsIcon, SparklesIcon, LayoutGrid, FileQuestion } from 'lucide-vue-next'

// 定义组件类型
export const componentTypes = {
  navbar: {
    name: '导航组件',
    icon: Navigation,
  },
  card: {
    name: '卡片组件',
    icon: BookOpen,
  },
  footer: {
    name: '页脚组件',
    icon: FootprintsIcon,
  },
  hero: {
    name: '横幅组件',
    icon: SparklesIcon,
  },
  accordion: {
    name: '手风琴组件',
    icon: FileQuestion,
  }
}

// 定义平台类型
export const platformTypes = {
  onlineEducation: {
    name: '在线教育',
    description: '适用于在线教育、培训平台的组件'
  },
  ecommerce: {
    name: '电子商务',
    description: '适用于电商网站的组件'
  },
  blog: {
    name: '个人博客',
    description: '适用于博客、资讯网站的组件'
  }
}

export const useComponentAreaStore = defineStore('componentArea', () => {
  const components = ref([
   {type:'navbar',

    platform:'onlineEducation',
    name:'导航栏',

    icon: Navigation,
    template:{
      html:`<nav class="bg-white shadow-md px-6 py-4">
  <div class="container mx-auto flex justify-between items-center">
    <!-- Logo -->
    <div class="flex items-center">
      <img src="/placeholder.svg?height=40&width=40" alt="Logo" class="h-10 w-10 mr-3">
      <span class="text-xl font-bold text-blue-600">学习平台</span>
    </div>

    <!-- Navigation Links -->
    <div class="hidden md:flex space-x-8">
      <a href="#" class="text-gray-700 hover:text-blue-600 transition">首页</a>
      <a href="#" class="text-gray-700 hover:text-blue-600 transition">课程</a>
      <a href="#" class="text-gray-700 hover:text-blue-600 transition">关于我们</a>
      <a href="#" class="text-gray-700 hover:text-blue-600 transition">联系我们</a>
    </div>

    <!-- Search Bar -->
    <div class="hidden md:block relative">
      <input type="text" placeholder="搜索课程..." class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 absolute left-3 top-2.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>

    <!-- User Profile -->
    <div class="flex items-center">
      <div class="relative">
        <button class="flex items-center focus:outline-none">
          <img src="/placeholder.svg?height=32&width=32" alt="用户头像" class="h-8 w-8 rounded-full mr-2">
          <span class="hidden md:inline text-gray-700">张明</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Menu Button -->
    <button class="md:hidden focus:outline-none">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>
</nav>`,
      js:``
    }
   },
    {
      type:'card',
      name:'课程卡片',
      platform:'onlineEducation',
      icon: BookOpen,
      template:
        {
          html:`<div class="bg-white rounded-xl shadow-md overflow-hidden max-w-md mx-auto transition-transform hover:scale-105">
  <div class="relative">
    <img src="/placeholder.svg?height=200&width=400" alt="Course thumbnail" class="w-full h-48 object-cover">
    <div class="absolute top-4 right-4 bg-yellow-400 text-xs font-semibold px-2 py-1 rounded-full">POPULAR</div>
  </div>

  <div class="p-6">
    <div class="flex items-center mb-2">
      <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Web Development</span>
      <div class="ml-auto flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
        </svg>
        <span class="text-sm text-gray-600 ml-1">4.8</span>
      </div>
    </div>

    <h3 class="text-xl font-bold text-gray-900 mb-2">Complete JavaScript Course 2023</h3>
    <p class="text-gray-600 text-sm mb-4">Master JavaScript with the most comprehensive course. Projects, challenges, and theory for modern JS development.</p>

    <div class="flex items-center mb-4">
      <img src="/placeholder.svg?height=32&width=32" alt="Instructor" class="h-8 w-8 rounded-full mr-2">
      <div>
        <p class="text-sm font-medium text-gray-900">Sarah Johnson</p>
        <p class="text-xs text-gray-500">Senior Developer</p>
      </div>
    </div>

    <div class="flex items-center justify-between text-sm text-gray-600 mb-4">
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>24 hours</span>
      </div>
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <span>42 lessons</span>
      </div>
      <div class="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <span>1,240 students</span>
      </div>
    </div>

    <div class="flex justify-between items-center">
      <div>
        <span class="text-2xl font-bold text-gray-900">$49.99</span>
        <span class="text-sm text-gray-500 line-through ml-2">$99.99</span>
      </div>
      <button class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition">Learn More</button>
    </div>
  </div>
</div>`,
          js:``
        }
    },
    {
      type:'card',
      name:'课时卡片',
      platform:'onlineEducation',
      icon: BookOpen,
      template:{
        html:`<div class="bg-white border rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
  <div class="flex items-center">
    <!-- Status indicator -->
    <div class="mr-4">
      <!-- Completed lesson -->
      <div class="bg-green-100 text-green-800 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <!-- In progress lesson (uncomment to use) -->
      <!--
      <div class="bg-yellow-100 text-yellow-800 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      -->

      <!-- Locked lesson (uncomment to use) -->
      <!--
      <div class="bg-gray-100 text-gray-500 rounded-full p-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      -->
    </div>

    <!-- Lesson content -->
    <div class="flex-1">
      <h4 class="text-lg font-medium text-gray-900">JavaScript变量介绍</h4>
      <p class="text-sm text-gray-600 mt-1">学习var、let和const声明及它们之间的区别。</p>

      <div class="flex items-center mt-2 text-sm text-gray-500">
        <div class="flex items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>15分钟</span>
        </div>
        <div class="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>1个资源</span>
        </div>
      </div>
    </div>

    <!-- Action button -->
    <button class="ml-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition">
      继续学习
    </button>
  </div>
</div>`,
js:``
      }
    },
    {type:'card',
    name:'课程评论',
    platform:'onlineEducation',
    icon: MessageSquare,
    template:{

      html:`<div class="bg-white rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
  <h3 class="text-xl font-bold text-gray-900 mb-6">讨论区 (24)</h3>

  <!-- Comment form -->
  <div class="flex mb-6">
    <img src="/placeholder.svg?height=40&width=40" alt="您的头像" class="h-10 w-10 rounded-full mr-4">
    <div class="flex-1">
      <textarea
        class="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        rows="3"
        placeholder="添加您的评论..."></textarea>
      <button class="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition">
        发表评论
      </button>
    </div>
  </div>

  <!-- Comment list -->
  <div class="space-y-6">
    <!-- Comment 1 -->
    <div class="border-b pb-6">
      <div class="flex items-start">
        <img src="/placeholder.svg?height=40&width=40" alt="用户头像" class="h-10 w-10 rounded-full mr-4">
        <div class="flex-1">
          <div class="flex items-center mb-1">
            <h4 class="font-medium text-gray-900">王小明</h4>
            <span class="ml-2 text-xs text-gray-500">2天前</span>
          </div>
          <p class="text-gray-700">这节课非常有帮助！我终于理解了JavaScript中闭包的工作原理。例子非常清晰明了。</p>

          <div class="flex items-center mt-3 space-x-4 text-sm">
            <button class="flex items-center text-gray-500 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>点赞 (12)</span>
            </button>
            <button class="flex items-center text-gray-500 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>回复</span>
            </button>
          </div>

          <!-- Nested reply -->
          <div class="mt-4 ml-6 pl-4 border-l-2 border-gray-200">
            <div class="flex items-start">
              <img src="/placeholder.svg?height=32&width=32" alt="讲师头像" class="h-8 w-8 rounded-full mr-3">
              <div>
                <div class="flex items-center mb-1">
                  <h4 class="font-medium text-gray-900">李老师</h4>
                  <span class="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">讲师</span>
                  <span class="ml-2 text-xs text-gray-500">1天前</span>
                </div>
                <p class="text-gray-700">谢谢您的反馈，小明！很高兴这些例子能帮助您理解这个概念。</p>

                <div class="flex items-center mt-2 space-x-4 text-sm">
                  <button class="flex items-center text-gray-500 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>点赞 (3)</span>
                  </button>
                  <button class="flex items-center text-gray-500 hover:text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>回复</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comment 2 -->
    <div>
      <div class="flex items-start">
        <img src="/placeholder.svg?height=40&width=40" alt="用户头像" class="h-10 w-10 rounded-full mr-4">
        <div>
          <div class="flex items-center mb-1">
            <h4 class="font-medium text-gray-900">陈小红</h4>
            <span class="ml-2 text-xs text-gray-500">5小时前</span>
          </div>
          <p class="text-gray-700">我在18:45的练习中遇到了问题。当我尝试运行代码时，出现了"Uncaught TypeError: Cannot read property 'value' of undefined"错误。有人能帮忙吗？</p>

          <div class="flex items-center mt-3 space-x-4 text-sm">
            <button class="flex items-center text-gray-500 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
              <span>点赞 (2)</span>
            </button>
            <button class="flex items-center text-gray-500 hover:text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>回复</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Load more comments button -->
  <button class="w-full mt-6 py-2 text-blue-600 font-medium border border-blue-600 rounded-lg hover:bg-blue-50 transition">
    加载更多评论
  </button>
</div>`,
js:``
    }
    },
    {type:'footer',
    name:'页脚',
    platform:'onlineEducation',
    icon: FootprintsIcon,
    template:{
      html:`<footer class="bg-gray-800 text-white pt-12 pb-8">
  <div class="container mx-auto px-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <!-- Company Info -->
      <div>
        <div class="flex items-center mb-4">
          <img src="/placeholder.svg?height=40&width=40" alt="Logo" class="h-10 w-10 mr-3">
          <span class="text-xl font-bold text-white">学习平台</span>
        </div>
        <p class="text-gray-400 mb-4">通过优质教育和易于获取的学习资源，赋能全球学习者。</p>
        <div class="flex space-x-4">
          <a href="#" class="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/>
            </svg>
          </a>
          <a href="#" class="text-gray-400 hover:text-white transition">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h3 class="text-lg font-semibold mb-4">快速链接</h3>
        <ul class="space-y-2">
          <li><a href="#" class="text-gray-400 hover:text-white transition">首页</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">课程</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">关于我们</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">联系我们</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">博客</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">常见问题</a></li>
        </ul>
      </div>

      <!-- Course Categories -->
      <div>
        <h3 class="text-lg font-semibold mb-4">课程分类</h3>
        <ul class="space-y-2">
          <li><a href="#" class="text-gray-400 hover:text-white transition">网页开发</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">数据科学</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">移动开发</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">UI/UX设计</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">商业</a></li>
          <li><a href="#" class="text-gray-400 hover:text-white transition">市场营销</a></li>
        </ul>
      </div>

      <!-- Newsletter -->
      <div>
        <h3 class="text-lg font-semibold mb-4">订阅我们的通讯</h3>
        <p class="text-gray-400 mb-4">及时了解我们最新的课程和教育内容。</p>
        <form class="flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            placeholder="您的电子邮箱"
            class="px-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="订阅电子邮件">
          <button
            type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition">
            订阅
          </button>
        </form>
      </div>
    </div>

    <div class="border-t border-gray-700 mt-10 pt-6">
      <div class="flex flex-col md:flex-row justify-between items-center">
        <p class="text-gray-400 text-sm">© 2023 学习平台. 保留所有权利.</p>
        <div class="flex space-x-6 mt-4 md:mt-0">
          <a href="#" class="text-gray-400 hover:text-white text-sm transition">隐私政策</a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition">服务条款</a>
          <a href="#" class="text-gray-400 hover:text-white text-sm transition">Cookie政策</a>
        </div>
      </div>
    </div>
  </div>
</footer>`,
js:``
    }

    },
    {
      type:'hero',
      name:'横幅区域',
      platform:'onlineEducation',
      icon: SparklesIcon,
      template:{html:`<section class="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
  <div class="container mx-auto px-4 py-16 md:py-24">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <div class="space-y-6">
        <h1 class="text-3xl md:text-5xl font-bold leading-tight">开启您的学习之旅，掌握未来技能</h1>
        <p class="text-lg md:text-xl text-blue-100">我们提供超过1000门精选课程，帮助您提升职业技能，实现个人成长。</p>
        <div class="flex flex-col sm:flex-row gap-4">
          <a href="#courses" class="bg-white text-blue-700 hover:bg-blue-50 font-medium px-6 py-3 rounded-lg text-center transition duration-200">
            浏览课程
          </a>
          <a href="#demo" class="bg-transparent hover:bg-blue-700 border border-white font-medium px-6 py-3 rounded-lg text-center transition duration-200">
            免费试听
          </a>
        </div>
        <div class="flex items-center gap-4 pt-4">
          <div class="flex -space-x-2">
            <img src="/placeholder.svg?height=40&width=40" alt="学员头像" class="h-10 w-10 rounded-full border-2 border-white">
            <img src="/placeholder.svg?height=40&width=40" alt="学员头像" class="h-10 w-10 rounded-full border-2 border-white">
            <img src="/placeholder.svg?height=40&width=40" alt="学员头像" class="h-10 w-10 rounded-full border-2 border-white">
            <img src="/placeholder.svg?height=40&width=40" alt="学员头像" class="h-10 w-10 rounded-full border-2 border-white">
          </div>
          <p class="text-sm">已有<span class="font-bold">25,000+</span>学员加入我们</p>
        </div>
      </div>
      <div class="relative">
        <div class="absolute -top-6 -left-6 w-24 h-24 bg-yellow-400 rounded-full opacity-50 blur-xl"></div>
        <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-pink-400 rounded-full opacity-50 blur-xl"></div>
        <div class="relative bg-white p-2 rounded-xl shadow-2xl">
          <img
            src="/placeholder.svg?height=400&width=600"
            alt="在线学习"
            class="w-full h-auto rounded-lg"
          >
          <div class="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg">
            <div class="flex items-center gap-3">
              <div class="bg-blue-100 p-2 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-bold text-gray-900">专业认证课程</h3>
                <p class="text-sm text-gray-600">完成课程后获得行业认可的证书</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>`,
js:``
    }
    },
    {
      type:'card',
      name:'课程评价',
      platform:'onlineEducation',
      icon: MessageSquare,
      template:{
        html:`<div class="bg-white rounded-xl shadow-md p-6 max-w-md mx-auto">
  <div class="flex justify-center mb-4">
    <div class="flex text-yellow-400">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  </div>

  <div class="relative mb-6">
    <svg class="absolute top-0 left-0 transform -translate-x-6 -translate-y-8 h-16 w-16 text-gray-100" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7.39762 10.3C7.39762 11.0733 7.14888 11.7 6.6514 12.18C6.15392 12.6333 5.52552 12.86 4.7662 12.86C3.84023 12.86 3.05008 12.5533 2.39576 11.94C1.76482 11.3266 1.44928 10.4467 1.44928 9.29999C1.44928 8.07332 1.8654 6.87332 2.69764 5.69999C3.52988 4.49999 4.79357 3.54666 6.48869 2.83999L7.39762 4.25999C6.32369 4.73999 5.49577 5.27332 4.91391 5.85999C4.33205 6.44666 4.04011 7.12666 4.04011 7.89999C4.04011 8.27999 4.13285 8.63332 4.31833 8.95999C4.50381 9.28666 4.81687 9.56666 5.25752 9.79999C5.82606 9.99999 6.35377 10.1 6.84066 10.1C7.39762 10.1 7.39762 10.1 7.39762 10.3ZM14.6242 10.3C14.6242 11.0733 14.3755 11.7 13.878 12.18C13.3805 12.6333 12.7521 12.86 11.9928 12.86C11.0668 12.86 10.2767 12.5533 9.62233 11.94C8.99139 11.3266 8.67585 10.4467 8.67585 9.29999C8.67585 8.07332 9.09197 6.87332 9.92421 5.69999C10.7564 4.49999 12.0201 3.54666 13.7153 2.83999L14.6242 4.25999C13.5503 4.73999 12.7224 5.27332 12.1405 5.85999C11.5587 6.44666 11.2667 7.12666 11.2667 7.89999C11.2667 8.27999 11.3595 8.63332 11.545 8.95999C11.7304 9.28666 12.0435 9.56666 12.4841 9.79999C13.0527 9.99999 13.5804 10.1 14.0673 10.1C14.6242 10.1 14.6242 10.1 14.6242 10.3Z" fill="currentColor"/>
    </svg>

    <p class="text-gray-700 text-center">这门课程彻底改变了我的职业生涯！老师讲解非常清晰，课程内容既有深度又实用。完成课程后，我成功找到了梦想中的工作，薪资提高了30%。强烈推荐给所有想要提升技能的人！</p>
  </div>

  <div class="flex flex-col items-center">
    <img src="/placeholder.svg?height=64&width=64" alt="学员头像" class="h-16 w-16 rounded-full mb-2">
    <div class="text-center">
      <h4 class="font-semibold text-gray-900">张伟</h4>
      <p class="text-sm text-gray-500">前端开发工程师 | 北京</p>
      <p class="text-xs text-blue-600 mt-1">完成了《高级JavaScript开发》课程</p>
    </div>
  </div>
</div>`,
js:``
    }},
    {
      type:'accordion',
      name:'常见问题',
      platform:'onlineEducation',
      icon: FileQuestion,
      template:{
      html:`<div class="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
  <div class="p-6">
    <h2 class="text-2xl font-bold text-gray-900 mb-6">常见问题</h2>

    <!-- FAQ Item 1 -->
    <div class="mb-4 border-b pb-4">
      <button class="flex justify-between items-center w-full text-left font-medium text-gray-900 focus:outline-none" onclick="toggleFaq('faq1')">
        <span>如何开始我的第一门课程？</span>
        <svg id="faq1-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="faq1-content" class="mt-2 hidden">
        <p class="text-gray-600">
          开始您的第一门课程非常简单！只需在我们的网站上注册账号，浏览课程目录，选择您感兴趣的课程，然后点击"加入课程"按钮。付款成功后，您将立即获得课程访问权限，可以开始您的学习之旅。
        </p>
      </div>
    </div>

    <!-- FAQ Item 2 -->
    <div class="mb-4 border-b pb-4">
      <button class="flex justify-between items-center w-full text-left font-medium text-gray-900 focus:outline-none" onclick="toggleFaq('faq2')">
        <span>课程完成后我会获得证书吗？</span>
        <svg id="faq2-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="faq2-content" class="mt-2 hidden">
        <p class="text-gray-600">
          是的，完成课程并通过所有必要的测验和作业后，您将获得完成证书。我们的证书在行业内广受认可，可以添加到您的简历和LinkedIn个人资料中，以展示您的技能和知识。
        </p>
      </div>
    </div>

    <!-- FAQ Item 3 -->
    <div class="mb-4 border-b pb-4">
      <button class="flex justify-between items-center w-full text-left font-medium text-gray-900 focus:outline-none" onclick="toggleFaq('faq3')">
        <span>我可以在移动设备上学习课程吗？</span>
        <svg id="faq3-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="faq3-content" class="mt-2 hidden">
        <p class="text-gray-600">
          当然可以！我们的平台完全支持移动学习。您可以通过我们的移动应用程序或移动网页浏览器访问所有课程内容。视频、测验和互动练习都已针对移动设备进行了优化，让您可以随时随地学习。
        </p>
      </div>
    </div>

    <!-- FAQ Item 4 -->
    <div class="mb-4 border-b pb-4">
      <button class="flex justify-between items-center w-full text-left font-medium text-gray-900 focus:outline-none" onclick="toggleFaq('faq4')">
        <span>如果我对课程不满意，可以退款吗？</span>
        <svg id="faq4-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="faq4-content" class="mt-2 hidden">
        <p class="text-gray-600">
          是的，我们提供30天无条件退款保证。如果您在购买课程后30天内对课程不满意，可以联系我们的客服团队申请全额退款，无需任何理由。我们希望您对学习体验完全满意。
        </p>
      </div>
    </div>

    <!-- FAQ Item 5 -->
    <div class="mb-4">
      <button class="flex justify-between items-center w-full text-left font-medium text-gray-900 focus:outline-none" onclick="toggleFaq('faq5')">
        <span>我可以与讲师直接互动吗？</span>
        <svg id="faq5-icon" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div id="faq5-content" class="mt-2 hidden">
        <p class="text-gray-600">
          是的，我们的平台支持学员与讲师的直接互动。您可以在课程讨论区提问，参加直播问答环节，或通过私信联系讲师。我们的讲师通常会在48小时内回复您的问题，确保您获得所需的支持和指导。
        </p>
      </div>
    </div>
  </div>
</div>
`,
      js:`
  function toggleFaq(id) {
    const content = document.getElementById(id + '-content');
    const icon = document.getElementById(id + '-icon');

    if (content.classList.contains('hidden')) {
      content.classList.remove('hidden');
      icon.classList.add('rotate-180');
    } else {
      content.classList.add('hidden');
      icon.classList.remove('rotate-180');
    }
  }
`
    },
    }
  ])

  // 添加获取分类组件的方法
  const getComponentsByType = (type: string) => {
    return components.value.filter(component => component.type === type)
  }

  // 添加获取特定平台组件的方法
  const getComponentsByPlatform = (platform: string) => {
    return components.value.filter(component => component.platform === platform)
  }

  return {
    components,
    getComponentsByType,
    getComponentsByPlatform
  }
})
