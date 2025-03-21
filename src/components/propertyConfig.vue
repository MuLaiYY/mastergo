<template>
  <div class="property-config p-4">
    <div v-if="!isAllowChangeProperty" class="text-center text-gray-500 py-4">
      {{ toolTipMessage }}
    </div>
    <div v-else>
      <!-- <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-medium">当前元素: {{ selectedElement }}</h2>
      </div> -->

      <!-- 尺寸设置 -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">尺寸</h3>

        <div class="grid grid-cols-2 gap-4 mb-3">
          <!-- 宽度设置 -->
          <div>
            <label class="block text-sm mb-1">宽度</label>
            <div class="flex items-center">
              <select v-model="widthType"  @change="widthType === 'w-auto' ? updateElementClass('width') : widthValue = ''" class="border rounded px-2 py-1 mr-2 text-sm w-20">
                <option value="w-px">固定</option>
                <option value="w-percent">百分比</option>
                <option value="w-auto">自动</option>
              </select>
              <input
                v-if="widthType === 'w-percent'"
                v-model="widthValue"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm"
                @change="updateElementClass('width')"
              />
              <input
                v-if="widthType === 'w-px'"
                v-model="widthValue"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm"
                @change="updateElementClass('width')"
              />
            </div>
          </div>

          <!-- 高度设置 -->
          <div>
            <label class="block text-sm mb-1">高度</label>
            <div class="flex items-center">
              <select v-model="heightType" @change="heightType === 'h-auto' ? updateElementClass('height') : heightValue = ''" class="border rounded px-2 py-1 mr-2 text-sm w-20">
                <option value="h-px">固定</option>
                <option value="h-percent">百分比</option>
                <option value="h-auto">自动</option>
              </select>
              <input
                v-if="heightType === 'h-percent'"
                v-model="heightValue"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm"
                @change="updateElementClass('height')"
              />
              <input
                v-if="heightType === 'h-px'"
                v-model="heightValue"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm"
                @change="updateElementClass('height')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 颜色设置 -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">颜色</h3>

        <div class="grid grid-cols-2 gap-4 mb-3">
          <!-- 背景色 -->
          <div>
            <label class="block text-sm mb-1">背景色</label>
            <div class="flex items-center">
              <input
                v-model="bgColor"
                type="color"
                class="w-8 h-8 mr-2 border rounded"
                @change="updateElementClass('bgColor')"
              />
              <select
                v-model="bgOpacity"
                class="border rounded px-2 py-1 text-sm w-20"
                @change="bgOpacity === 'custom' ? null : updateElementClass('bgColor')"
              >
                <option value="">不透明</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="bgOpacity === 'custom'"
                v-model="customBgOpacity"
                type="number"
                min="0"
                max="100"
                class="border rounded px-2 py-1 w-16 text-sm ml-2"
                placeholder="0-100"
                @change="updateElementClass('bgColor')"
              />
            </div>
          </div>

          <!-- 文字颜色 -->
          <div>
            <label class="block text-sm mb-1">文字颜色</label>
            <div class="flex items-center">
              <input
                v-model="textColor"
                type="color"
                class="w-8 h-8 mr-2 border rounded"
                @change="updateElementClass('textColor')"
              />
              <select
                v-model="textOpacity"
                class="border rounded px-2 py-1 text-sm w-20"
                @change="textOpacity === 'custom' ? null : updateElementClass('textColor')"
              >
                <option value="">不透明</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="textOpacity === 'custom'"
                v-model="customTextOpacity"
                type="number"
                min="0"
                max="100"
                class="border rounded px-2 py-1 w-16 text-sm ml-2"
                placeholder="0-100"
                @change="updateElementClass('textColor')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 边距设置 -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">边距</h3>

        <div class="grid grid-cols-2 gap-4 mb-3">
          <!-- 内边距 -->
          <div>
            <label class="block text-sm mb-1">内边距</label>
            <div class="flex items-center mb-2">
              <select v-model="paddingType" class="border rounded px-2 py-1 text-sm w-24" @change="updateElementClass('padding')">
                <option value="custom">自定义</option>
                <option value="x-auto">水平居中</option>
                <option value="y-auto">垂直居中</option>
                <option value="xy-auto">水平垂直居中</option>
              </select>
            </div>
            <div v-if="paddingType === 'custom'" class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-xs block">上</span>
                <input
                  v-model="paddingY.top"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('padding')"
                />
              </div>
              <div>
                <span class="text-xs block">右</span>
                <input
                  v-model="paddingX.right"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('padding')"
                />
              </div>
              <div>
                <span class="text-xs block">下</span>
                <input
                  v-model="paddingY.bottom"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('padding')"
                />
              </div>
              <div>
                <span class="text-xs block">左</span>
                <input
                  v-model="paddingX.left"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('padding')"
                />
              </div>
            </div>
          </div>

          <!-- 外边距 -->
          <div>
            <label class="block text-sm mb-1">外边距</label>
            <div class="flex items-center mb-2">
              <select v-model="marginType" class="border rounded px-2 py-1 text-sm w-24" @change="updateElementClass('margin')">
                <option value="custom">自定义</option>
                <option value="x-auto">水平居中</option>
                <option value="y-auto">垂直居中</option>
                <option value="xy-auto">水平垂直居中</option>
              </select>
            </div>
            <div v-if="marginType === 'custom'" class="grid grid-cols-2 gap-2">
              <div>
                <span class="text-xs block">上</span>
                <input
                  v-model="marginY.top"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('margin')"
                />
              </div>
              <div>
                <span class="text-xs block">右</span>
                <input
                  v-model="marginX.right"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('margin')"
                />
              </div>
              <div>
                <span class="text-xs block">下</span>
                <input
                  v-model="marginY.bottom"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('margin')"
                />
              </div>
              <div>
                <span class="text-xs block">左</span>
                <input
                  v-model="marginX.left"
                  type="number"
                  min="0"
                  max="12"
                  class="border rounded px-2 py-1 w-12 text-sm"
                  @change="updateElementClass('margin')"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 边框和圆角 -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">边框与圆角</h3>

        <div class="grid grid-cols-2 gap-4 mb-3">
          <!-- 边框 -->
          <div>
            <label class="block text-sm mb-1">边框</label>
            <div class="flex items-center mb-2">
              <select
                v-model="borderWidth"
                class="border rounded px-2 py-1 mr-2 text-sm w-20"
                @change="borderWidth === 'custom' ? null : updateElementClass('border')"
              >
                <option value="">无边框</option>
                <option value="border">细边框</option>
                <option value="border-2">中等</option>
                <option value="border-4">粗边框</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="borderWidth === 'custom'"
                v-model="customBorderWidth"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm mr-2"
                placeholder="宽度px"
                @change="updateElementClass('customBorder')"
              />
              <input
                v-if="borderWidth"
                v-model="borderColor"
                type="color"
                class="w-8 h-8 border rounded"
                @change="updateElementClass('borderColor')"
              />
            </div>
          </div>

          <!-- 圆角 -->
          <div>
            <label class="block text-sm mb-1">圆角</label>
            <div class="flex items-center">
              <select
                v-model="borderRadius"
                class="border rounded px-2 py-1 text-sm w-full"
                @change="borderRadius === 'custom' ? null : updateElementClass('borderRadius')"
              >
                <option value="">无圆角</option>
                <option value="rounded-sm">小圆角</option>
                <option value="rounded">中等</option>
                <option value="rounded-md">较大</option>
                <option value="rounded-lg">大圆角</option>
                <option value="rounded-full">圆形</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="borderRadius === 'custom'"
                v-model="customBorderRadius"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm ml-2"
                placeholder="圆角px"
                @change="updateElementClass('customBorderRadius')"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 文字设置 -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">文字</h3>

        <div class="grid grid-cols-2 gap-4 mb-3">
          <!-- 字体大小 -->
          <div>
            <label class="block text-sm mb-1">字体大小</label>
            <div class="flex items-center">
              <select
                v-model="fontSize"
                class="border rounded px-2 py-1 text-sm w-full"
                @change="fontSize === 'custom' ? null : updateElementClass('fontSize')"
              >
                <option value="text-xs">极小</option>
                <option value="text-sm">小</option>
                <option value="text-base">中等</option>
                <option value="text-lg">大</option>
                <option value="text-xl">较大</option>
                <option value="text-2xl">特大</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="fontSize === 'custom'"
                v-model="customFontSize"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm ml-2"
                placeholder="大小px"
                @change="updateElementClass('customFontSize')"
              />
            </div>
          </div>

          <!-- 字体粗细 -->
          <div>
            <label class="block text-sm mb-1">字体粗细</label>
            <select
              v-model="fontWeight"
              class="border rounded px-2 py-1 text-sm w-full"
              @change="updateElementClass('fontWeight')"
            >
              <option value="font-light">细</option>
              <option value="font-normal">常规</option>
              <option value="font-medium">中等</option>
              <option value="font-semibold">加粗</option>
              <option value="font-bold">粗</option>
            </select>
          </div>
        </div>

        <!-- 文字对齐 -->
        <div class="mb-3">
          <label class="block text-sm mb-1">文字对齐</label>
          <select
            v-model="textAlign"
            class="border rounded px-2 py-1 text-sm w-full"
            @change="updateElementClass('textAlign')"
          >
            <option value="text-left">左对齐</option>
            <option value="text-center">居中</option>
            <option value="text-right">右对齐</option>
            <option value="text-justify">两端对齐</option>
          </select>
        </div>
      </div>

      <!-- 阴影效果 -->
      <div class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">阴影</h3>
        <div class="mb-3">
          <select
            v-model="shadow"
            class="border rounded px-2 py-1 text-sm w-full"
            @change="updateElementClass('shadow')"
          >
            <option value="">无阴影</option>
            <option value="shadow-sm">小阴影</option>
            <option value="shadow">中等</option>
            <option value="shadow-md">较大</option>
            <option value="shadow-lg">大阴影</option>
            <option value="shadow-xl">特大</option>
          </select>
        </div>
      </div>

      <!-- 布局设置 - 仅在选中的元素是div或section时显示 -->
      <div v-if="selectedElement?.tagName === 'DIV' || selectedElement?.tagName === 'SECTION'" class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">布局设置</h3>

        <!-- 布局类型 -->
        <div class="mb-3">
          <label class="block text-sm mb-1">布局类型</label>
          <select
            v-model="layoutType"
            class="border rounded px-2 py-1 text-sm w-full"
            @change="updateElementClass('layout')"
          >
            <option value="">默认</option>
            <option value="flex">Flex布局</option>
            <option value="grid">Grid布局</option>
          </select>
        </div>

        <!-- Flex布局配置 -->
        <div v-if="layoutType === 'flex'" class="space-y-3">
          <div>
            <label class="block text-sm mb-1">主轴方向</label>
            <select
              v-model="flexDirection"
              class="border rounded px-2 py-1 text-sm w-full"
              @change="updateElementClass('flexDirection')"
            >
              <option value="flex-row">水平方向</option>
              <option value="flex-col">垂直方向</option>
              <option value="flex-row-reverse">水平反向</option>
              <option value="flex-col-reverse">垂直反向</option>
            </select>
          </div>

          <div>
            <label class="block text-sm mb-1">主轴对齐</label>
            <select
              v-model="justifyContent"
              class="border rounded px-2 py-1 text-sm w-full"
              @change="updateElementClass('justifyContent')"
            >
              <option value="justify-start">左对齐</option>
              <option value="justify-center">居中</option>
              <option value="justify-end">右对齐</option>
              <option value="justify-between">两端对齐</option>
              <option value="justify-around">环绕对齐</option>
              <option value="justify-evenly">均匀对齐</option>
            </select>
          </div>

          <div>
            <label class="block text-sm mb-1">交叉轴对齐</label>
            <select
              v-model="alignItems"
              class="border rounded px-2 py-1 text-sm w-full"
              @change="updateElementClass('alignItems')"
            >
              <option value="items-start">顶部对齐</option>
              <option value="items-center">居中对齐</option>
              <option value="items-end">底部对齐</option>
              <option value="items-stretch">拉伸对齐</option>
              <option value="items-baseline">基线对齐</option>
            </select>
          </div>

          <div>
            <label class="block text-sm mb-1">换行方式</label>
            <select
              v-model="flexWrap"
              class="border rounded px-2 py-1 text-sm w-full"
              @change="updateElementClass('flexWrap')"
            >
              <option value="flex-nowrap">不换行</option>
              <option value="flex-wrap">换行</option>
              <option value="flex-wrap-reverse">反向换行</option>
            </select>
          </div>

          <!-- 添加间隙控制 -->
          <div>
            <label class="block text-sm mb-1">间隙</label>
            <div class="flex items-center">
              <select
                v-model="flexGap"
                class="border rounded px-2 py-1 text-sm w-full"
                @change="flexGap === 'custom' ? null : updateElementClass('flexGap')"
              >
                <option value="">无间隙</option>
                <option value="gap-1">小间隙</option>
                <option value="gap-2">中等间隙</option>
                <option value="gap-4">大间隙</option>
                <option value="gap-6">特大间隙</option>
                <option value="custom">自定义</option>
              </select>
              <input
                v-if="flexGap === 'custom'"
                v-model="customFlexGap"
                type="number"
                class="border rounded px-2 py-1 w-16 text-sm ml-2"
                placeholder="px"
                @change="updateElementClass('customFlexGap')"
              />
            </div>
          </div>
        </div>

        <!-- Grid布局配置 -->
        <div v-if="layoutType === 'grid'" class="space-y-3">
          <div>
            <label class="block text-sm mb-1">列数</label>
            <select
              v-model="gridCols"
              class="border rounded px-2 py-1 text-sm w-full"
              @change="updateElementClass('gridCols')"
            >
              <option value="grid-cols-1">1列</option>
              <option value="grid-cols-2">2列</option>
              <option value="grid-cols-3">3列</option>
              <option value="grid-cols-4">4列</option>
              <option value="grid-cols-5">5列</option>
              <option value="grid-cols-6">6列</option>
            </select>
          </div>

          <div>
            <label class="block text-sm mb-1">行间距</label>
            <select
              v-model="gridGap"
              class="border rounded px-2 py-1 text-sm w-full"
              @change="updateElementClass('gridGap')"
            >
              <option value="gap-0">无间距</option>
              <option value="gap-1">小间距</option>
              <option value="gap-2">中等间距</option>
              <option value="gap-4">大间距</option>
              <option value="gap-6">特大间距</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 图片设置 - 仅在选中的元素是图片时显示 -->
      <div v-if="selectedElement?.tagName === 'IMG'" class="mb-6">
        <h3 class="text-md font-medium mb-2 border-b pb-1">图片设置</h3>

        <!-- 图片地址 -->
        <div class="mb-3">
          <label class="block text-sm mb-1">图片地址</label>
          <div class="flex items-center">
            <input
              v-model="imgSrc"
              type="text"
              class="border rounded px-2 py-1 text-sm w-full"
              placeholder="请输入图片URL"
              @change="updateElementAttr('src')"
            />
          </div>
        </div>

        <!-- 图片适应方式 -->
        <div class="mb-3">
          <label class="block text-sm mb-1">适应方式</label>
          <select
            v-model="objectFit"
            class="border rounded px-2 py-1 text-sm w-full"
            @change="updateElementClass('objectFit')"
          >
            <option value="object-contain">包含</option>
            <option value="object-cover">覆盖</option>
            <option value="object-fill">填充</option>
            <option value="object-none">原始</option>
            <option value="object-scale-down">缩小</option>
          </select>
        </div>

        <!-- 图片位置 -->
        <div class="mb-3">
          <label class="block text-sm mb-1">位置</label>
          <select
            v-model="objectPosition"
            class="border rounded px-2 py-1 text-sm w-full"
            @change="updateElementClass('objectPosition')"
          >
            <option value="object-center">居中</option>
            <option value="object-top">顶部</option>
            <option value="object-bottom">底部</option>
            <option value="object-left">左侧</option>
            <option value="object-right">右侧</option>
          </select>
        </div>

        <!-- 图片滤镜 -->
        <div class="mb-3">
          <label class="block text-sm mb-1">滤镜效果</label>
          <select
            v-model="filter"
            class="border rounded px-2 py-1 text-sm w-full"
            @change="updateElementClass('filter')"
          >
            <option value="">无</option>
            <option value="filter-none">原始</option>
            <option value="grayscale">灰度</option>
            <option value="blur">模糊</option>
            <option value="brightness-75">变暗</option>
            <option value="brightness-125">变亮</option>
            <option value="contrast-75">低对比度</option>
            <option value="contrast-125">高对比度</option>
            <option value="sepia">复古</option>
          </select>
        </div>
      </div>
      <div v-if="selectedElement!==null&&allowChangeWordArr.includes(selectedElement.tagName)">
        <h3 class="text-md font-medium mb-2 border-b pb-1">文字修改</h3>
        <div class="mb-3">
          <label class="block text-sm mb-1">文字内容</label>
          <div class="flex items-center">
            <input
              v-model="elementText"
              type="text"
              class="border rounded px-2 py-1 text-sm w-full"
              placeholder="请输入文字内容"
              @change="updateElementText"
            />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { useAiChatStore } from '@/stores';
import { ElSelect } from 'element-plus';
import { storeToRefs } from 'pinia';
import { watch, ref, computed, onMounted, onBeforeUnmount } from 'vue';

const aiChatStore = useAiChatStore();
const { selectedElement } = storeToRefs(aiChatStore);
//可更改文字内容的标签
const allowChangeWordArr=['SPAN','P','H1','H2','H3','H4','H5','H6']

// 尺寸属性
//宽度类型有固定px w-auto 百分比
const widthType = ref('w-auto');
const widthValue = ref('');
//高度类型有固定px h-auto 百分比
const heightType = ref('h-auto');
const heightValue = ref('');

// 颜色属性
const bgColor = ref('#ffffff');
const bgOpacity = ref('');
const textColor = ref('#000000');
const textOpacity = ref('');

// 边距属性
const paddingX = ref<{ left: number, right: number }>({ left: 0, right: 0 });
const paddingY = ref<{ top: number, bottom: number }>({ top: 0, bottom: 0 });
const marginX = ref<{ left: number, right: number }>({ left: 0, right: 0 });
const marginY = ref<{ top: number, bottom: number }>({ top: 0, bottom: 0 });

// 边框和圆角属性
const borderWidth = ref('');
const borderColor = ref('#000000');
const borderRadius = ref('');
// 自定义边框和圆角
const customBorderWidth = ref(1);
const customBorderRadius = ref(4);

// 文字属性
const fontSize = ref('text-base');
const customFontSize = ref(16);
const fontWeight = ref('font-normal');
const textAlign = ref('text-left');

// 阴影属性
const shadow = ref('');

// 边距单位选择
const paddingUnit = ref<'px' | 'rem'>('rem');
const marginUnit = ref<'px' | 'rem'>('rem');

// 当前元素的类列表
const currentClasses = ref<string[]>([]);

// 图片相关属性
const imgSrc = ref<string|null>('');
const objectFit = ref('object-contain');
const objectPosition = ref('object-center');
const filter = ref('');

// 文字内容
const elementText = ref('');

// 布局相关属性
const layoutType = ref('');
const flexDirection = ref('flex-row');
const justifyContent = ref('justify-start');
const alignItems = ref('items-start');
const flexWrap = ref('flex-nowrap');
const gridCols = ref('grid-cols-1');
const gridGap = ref('gap-0');

// 在 script setup 部分添加新的响应式变量
const flexGap = ref('');
const customFlexGap = ref(4);

// 解析当前元素的类并设置对应的配置值
const parseElementClasses = () => {
  if (!selectedElement.value) return;

  try {
    // 首先重置所有属性到初始状态
    // 尺寸属性
    widthType.value = 'w-auto';
    widthValue.value = '';
    heightType.value = 'h-auto';
    heightValue.value = '';

    // 颜色属性
    bgColor.value = '#ffffff';
    bgOpacity.value = '';
    textColor.value = '#000000';
    textOpacity.value = '';

    // 边距属性
    paddingX.value = { left: 0, right: 0 };
    paddingY.value = { top: 0, bottom: 0 };
    marginX.value = { left: 0, right: 0 };
    marginY.value = { top: 0, bottom: 0 };
    paddingUnit.value = 'rem';
    marginUnit.value = 'rem';

    // 边框和圆角属性
    borderWidth.value = '';
    borderColor.value = '#000000';
    borderRadius.value = '';
    customBorderWidth.value = 1;
    customBorderRadius.value = 4;

    // 文字属性
    fontSize.value = 'text-base';
    customFontSize.value = 16;
    fontWeight.value = 'font-normal';
    textAlign.value = 'text-left';

    // 阴影属性
    shadow.value = '';

    // 重置图片属性
    imgSrc.value = '';
    objectFit.value = 'object-contain';
    objectPosition.value = 'object-center';
    filter.value = '';

    // 重置文字内容
    elementText.value = '';

    // 重置布局属性
    layoutType.value = '';
    flexDirection.value = 'flex-row';
    justifyContent.value = 'justify-start';
    alignItems.value = 'items-start';
    flexWrap.value = 'flex-nowrap';
    gridCols.value = 'grid-cols-1';
    gridGap.value = 'gap-0';

    // 直接使用selectedElement作为元素引用
    const element = selectedElement.value;

    // 获取元素的类列表
    currentClasses.value = element.className.split(' ');

    // 解析宽度
    const widthClass = currentClasses.value.find(cls => /^w-/.test(cls));
    if (widthClass) {
      if (widthClass === 'w-auto') {
        widthType.value = widthClass;
        widthValue.value = 'w-auto';
      } else if (widthClass.startsWith('w-') && widthClass.includes('px')) {
        widthType.value = 'w-px';
      } else if (widthClass.startsWith('w-') && widthClass.includes('%')) {
        widthType.value = 'w-percent';
      }

    }

    // 解析高度
    const heightClass = currentClasses.value.find(cls => /^h-/.test(cls));
    if (heightClass) {
      if (heightClass === 'h-full' || heightClass === 'h-auto') {
        heightType.value = heightClass;
      } else if (heightClass.startsWith('w-') && heightClass.includes('px')) {
        heightType.value = 'h-px';
      } else if (heightClass.startsWith('w-') && heightClass.includes('%')) {
        heightType.value = 'h-percent';
      }else {

      }
    }

    // 解析背景色
    const bgColorClass = currentClasses.value.find(cls => cls.startsWith('bg-[#') || cls.startsWith('bg-[rgb'));
    if (bgColorClass) {
      const colorMatch = bgColorClass.match(/bg-\[(.*?)\]/);
      if (colorMatch && colorMatch[1]) {
        bgColor.value = colorMatch[1];
      }
    }else{
      bgColor.value = '#ffffff';
    }

    // 解析背景透明度
    const bgOpacityClass = currentClasses.value.find(cls => cls.startsWith('bg-opacity-'));
    if (bgOpacityClass) {
      const opacityMatch = bgOpacityClass.match(/bg-opacity-\[([\d.]+)\]/);
      if (opacityMatch) {
        // 如果是自定义透明度值
        bgOpacity.value = 'custom';
        customBgOpacity.value = Math.round(parseFloat(opacityMatch[1]) * 100);
      } else {
        bgOpacity.value = bgOpacityClass;
      }
    } else {
      bgOpacity.value = '';
    }

    // 解析文字颜色
    const textColorClass = currentClasses.value.find(cls => cls.startsWith('text-[#') || cls.startsWith('text-[rgb'));
    if (textColorClass) {
      const colorMatch = textColorClass.match(/text-\[(.*?)\]/);
      if (colorMatch && colorMatch[1]) {
        textColor.value = colorMatch[1];
      }
    } else {
      textColor.value = '#000000';
    }

    // 解析文字透明度
    const textOpacityClass = currentClasses.value.find(cls => cls.startsWith('text-opacity-'));
    if (textOpacityClass) {
      const opacityMatch = textOpacityClass.match(/text-opacity-\[([\d.]+)\]/);
      if (opacityMatch) {
        // 如果是自定义透明度值
        textOpacity.value = 'custom';
        customTextOpacity.value = Math.round(parseFloat(opacityMatch[1]) * 100);
      } else {
        textOpacity.value = textOpacityClass;
      }
    } else {
      textOpacity.value = '';
    }

    // 检查是否有自动内边距
    if (currentClasses.value.includes('px-auto') && currentClasses.value.includes('py-auto')) {
      paddingType.value = 'xy-auto';
    } else if (currentClasses.value.includes('px-auto')) {
      paddingType.value = 'x-auto';
    } else if (currentClasses.value.includes('py-auto')) {
      paddingType.value = 'y-auto';
    } else {
      paddingType.value = 'custom';

      // 解析内边距
      const paddingClasses = currentClasses.value.filter(cls =>
        cls.startsWith('p-') || cls.startsWith('px-') || cls.startsWith('py-') ||
        cls.startsWith('pt-') || cls.startsWith('pr-') || cls.startsWith('pb-') || cls.startsWith('pl-') ||
        cls.includes('p-[') || cls.includes('px-[') || cls.includes('py-[') ||
        cls.includes('pt-[') || cls.includes('pr-[') || cls.includes('pb-[') || cls.includes('pl-['));

      paddingClasses.forEach((cls: string) => {
        // 处理带单位的类，如 p-[10px] 或 p-[1.5rem]
        if (cls.includes('[')) {
          const match = cls.match(/\[([\d.]+)(px|rem|%)\]/);
          if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2] as 'px' | 'rem' | '%';

            if (unit === 'px' || unit === 'rem') {
              paddingUnit.value = unit;
            }

            if (cls.startsWith('px-[')) {
              paddingX.value = { left: value, right: value };
            } else if (cls.startsWith('py-[')) {
              paddingY.value = { top: value, bottom: value };
            } else if (cls.startsWith('pl-[')) {
              paddingX.value.left = value;
            } else if (cls.startsWith('pr-[')) {
              paddingX.value.right = value;
            } else if (cls.startsWith('pt-[')) {
              paddingY.value.top = value;
            } else if (cls.startsWith('pb-[')) {
              paddingY.value.bottom = value;
            }
          }
        } else {
          // 处理标准类，如 p-4（这是rem单位）
          if (cls.startsWith('px-')) {
            const value = parseInt(cls.replace('px-', ''));
            paddingX.value = { left: value, right: value };
          } else if (cls.startsWith('py-')) {
            const value = parseInt(cls.replace('py-', ''));
            paddingY.value = { top: value, bottom: value };
          } else if (cls.startsWith('pl-')) {
            paddingX.value.left = parseInt(cls.replace('pl-', ''));
          } else if (cls.startsWith('pr-')) {
            paddingX.value.right = parseInt(cls.replace('pr-', ''));
          } else if (cls.startsWith('pt-')) {
            paddingY.value.top = parseInt(cls.replace('pt-', ''));
          } else if (cls.startsWith('pb-')) {
            paddingY.value.bottom = parseInt(cls.replace('pb-', ''));
          }
        }
      });
    }

    // 检查是否有自动外边距
    if (currentClasses.value.includes('mx-auto') && currentClasses.value.includes('my-auto')) {
      marginType.value = 'xy-auto';
    } else if (currentClasses.value.includes('mx-auto')) {
      marginType.value = 'x-auto';
    } else if (currentClasses.value.includes('my-auto')) {
      marginType.value = 'y-auto';
    } else {
      marginType.value = 'custom';

      // 解析外边距
      const marginClasses = currentClasses.value.filter(cls =>
        cls.startsWith('m-') || cls.startsWith('mx-') || cls.startsWith('my-') ||
        cls.startsWith('mt-') || cls.startsWith('mr-') || cls.startsWith('mb-') || cls.startsWith('ml-') ||
        cls.includes('m-[') || cls.includes('mx-[') || cls.includes('my-[') ||
        cls.includes('mt-[') || cls.includes('mr-[') || cls.includes('mb-[') || cls.includes('ml-['));

      marginClasses.forEach((cls: string) => {
        // 处理带单位的类，如 m-[10px] 或 m-[1.5rem]
        if (cls.includes('[')) {
          const match = cls.match(/\[([\d.]+)(px|rem|%)\]/);
          if (match) {
            const value = parseFloat(match[1]);
            const unit = match[2] as 'px' | 'rem' | '%';

            if (unit === 'px' || unit === 'rem') {
              marginUnit.value = unit;
            }

            if (cls.startsWith('mx-[')) {
              marginX.value = { left: value, right: value };
            } else if (cls.startsWith('my-[')) {
              marginY.value = { top: value, bottom: value };
            } else if (cls.startsWith('ml-[')) {
              marginX.value.left = value;
            } else if (cls.startsWith('mr-[')) {
              marginX.value.right = value;
            } else if (cls.startsWith('mt-[')) {
              marginY.value.top = value;
            } else if (cls.startsWith('mb-[')) {
              marginY.value.bottom = value;
            }
          }
        } else {
          // 处理标准类，如 m-4（这是rem单位）
          if (cls.startsWith('mx-')) {
            const value = parseInt(cls.replace('mx-', ''));
            marginX.value = { left: value, right: value };
          } else if (cls.startsWith('my-')) {
            const value = parseInt(cls.replace('my-', ''));
            marginY.value = { top: value, bottom: value };
          } else if (cls.startsWith('ml-')) {
            marginX.value.left = parseInt(cls.replace('ml-', ''));
          } else if (cls.startsWith('mr-')) {
            marginX.value.right = parseInt(cls.replace('mr-', ''));
          } else if (cls.startsWith('mt-')) {
            marginY.value.top = parseInt(cls.replace('mt-', ''));
          } else if (cls.startsWith('mb-')) {
            marginY.value.bottom = parseInt(cls.replace('mb-', ''));
          }
        }
      });
    }

    // 解析边框
    const borderClass = currentClasses.value.find(cls =>
      cls === 'border' || cls === 'border-2' || cls === 'border-4' || cls.startsWith('border-['));

    borderWidth.value = '';
    customBorderWidth.value = 1;

    if (borderClass) {
      if (borderClass.startsWith('border-[')) {
        // 解析自定义边框宽度，如 border-[3px]
        const match = borderClass.match(/border-\[([\d.]+)px\]/);
        if (match && match[1]) {
          borderWidth.value = 'custom';
          customBorderWidth.value = parseFloat(match[1]);
        }
      } else {
        borderWidth.value = borderClass;
      }
    }

    // 解析圆角
    const roundedClass = currentClasses.value.find(cls =>
      cls.startsWith('rounded') && !cls.includes('-t-') && !cls.includes('-b-') &&
      !cls.includes('-l-') && !cls.includes('-r-'));

    borderRadius.value = '';
    customBorderRadius.value = 4;

    if (roundedClass) {
      if (roundedClass.startsWith('rounded-[')) {
        // 解析自定义圆角，如 rounded-[10px]
        const match = roundedClass.match(/rounded-\[([\d.]+)px\]/);
        if (match && match[1]) {
          borderRadius.value = 'custom';
          customBorderRadius.value = parseFloat(match[1]);
        }
      } else {
        borderRadius.value = roundedClass;
      }
    }

    // 解析字体大小
    const fontSizeClass = currentClasses.value.find(cls =>
      cls === 'text-xs' || cls === 'text-sm' || cls === 'text-base' ||
      cls === 'text-lg' || cls === 'text-xl' || cls === 'text-2xl' ||
      cls.startsWith('text-['));

    fontSize.value = 'text-base';
    customFontSize.value = 16;

    if (fontSizeClass) {
      if (fontSizeClass.startsWith('text-[')) {
        // 解析自定义字体大小，如 text-[18px]
        const match = fontSizeClass.match(/text-\[([\d.]+)px\]/);
        if (match && match[1]) {
          fontSize.value = 'custom';
          customFontSize.value = parseFloat(match[1]);
        }
      } else {
        fontSize.value = fontSizeClass;
      }
    }

    // 解析文本对齐
    const textAlignClass = currentClasses.value.find(cls =>
      cls === 'text-left' || cls === 'text-center' || cls === 'text-right' || cls === 'text-justify');
    if (textAlignClass) {
      textAlign.value = textAlignClass;
    }

    // 解析阴影
    const shadowClass = currentClasses.value.find(cls => cls.startsWith('shadow'));
    if (shadowClass) {
      shadow.value = shadowClass;
    }

    // 解析边框颜色
    const borderColorClass = currentClasses.value.find(cls =>
      cls.startsWith('border-[#') || cls.startsWith('border-[rgb'));
    if (borderColorClass) {
      const colorMatch = borderColorClass.match(/border-\[(.*?)\]/);
      if (colorMatch && colorMatch[1]) {
        borderColor.value = colorMatch[1];
      }
    }

if(selectedElement.value.tagName==='IMG'){
  imgSrc.value=selectedElement.value.getAttribute('src')
}
    // 解析图片适应方式
    const objectFitClass = currentClasses.value.find(cls =>
      cls.startsWith('object-contain') ||
      cls.startsWith('object-cover') ||
      cls.startsWith('object-fill') ||
      cls.startsWith('object-none') ||
      cls.startsWith('object-scale-down'));
    if (objectFitClass) {
      objectFit.value = objectFitClass;
    }

    // 解析图片位置
    const objectPositionClass = currentClasses.value.find(cls =>
      cls.startsWith('object-center') ||
      cls.startsWith('object-top') ||
      cls.startsWith('object-bottom') ||
      cls.startsWith('object-left') ||
      cls.startsWith('object-right'));
    if (objectPositionClass) {
      objectPosition.value = objectPositionClass;
    }

    // 解析滤镜效果
    const filterClass = currentClasses.value.find(cls =>
      cls === 'filter-none' ||
      cls === 'grayscale' ||
      cls === 'blur' ||
      cls === 'brightness-75' ||
      cls === 'brightness-125' ||
      cls === 'contrast-75' ||
      cls === 'contrast-125' ||
      cls === 'sepia');
    if (filterClass) {
      filter.value = filterClass;
    }

    // 如果是可编辑文字的元素，获取其文本内容
    if (allowChangeWordArr.includes(element.tagName)) {
      elementText.value = element.textContent || '';
    }

    // 解析布局类型
    if (currentClasses.value.includes('flex')) {
      layoutType.value = 'flex';
      // 解析flex相关属性
      const flexDir = currentClasses.value.find(cls => cls.startsWith('flex-') &&
        (cls.includes('row') || cls.includes('col')));
      if (flexDir) flexDirection.value = flexDir;

      const justify = currentClasses.value.find(cls => cls.startsWith('justify-'));
      if (justify) justifyContent.value = justify;

      const align = currentClasses.value.find(cls => cls.startsWith('items-'));
      if (align) alignItems.value = align;

      const wrap = currentClasses.value.find(cls => cls.startsWith('flex-wrap'));
      if (wrap) flexWrap.value = wrap;

      // 解析间隙
      const gapClass = currentClasses.value.find(cls => cls.startsWith('gap-'));
      if (gapClass) {
        if (gapClass.startsWith('gap-[')) {
          const match = gapClass.match(/gap-\[(\d+)px\]/);
          if (match) {
            flexGap.value = 'custom';
            customFlexGap.value = parseInt(match[1]);
          }
        } else {
          flexGap.value = gapClass;
        }
      }
    } else if (currentClasses.value.includes('grid')) {
      layoutType.value = 'grid';
      // 解析grid相关属性
      const cols = currentClasses.value.find(cls => cls.startsWith('grid-cols-'));
      if (cols) gridCols.value = cols;

      const gap = currentClasses.value.find(cls => cls.startsWith('gap-'));
      if (gap) gridGap.value = gap;
    }

  } catch (error) {
    console.error('解析元素类时出错:', error);
  }
};

// 更新元素的类
const updateElementClass = (property: string) => {
  if (!selectedElement.value) return;

  try {
    const element = selectedElement.value;
    const classList = element.className.split(' ').filter(Boolean);

    switch (property) {
      case 'width':
        // 移除旧的宽度类
        const filteredWidthClasses = classList.filter(cls => !cls.startsWith('w-'));
        if (widthType.value === 'w-px') {
          filteredWidthClasses.push(`w-[${widthValue.value}px]`);
        } else if (widthType.value === 'w-percent') {
          filteredWidthClasses.push(`w-[${widthValue.value}%]`);
        } else if (widthType.value === 'w-auto') {
          filteredWidthClasses.push('w-auto');
        } else {
          return;
        }
        element.className = filteredWidthClasses.join(' ');
        break;

      case 'height':
        // 移除旧的高度类
        const filteredHeightClasses = classList.filter(cls => !cls.startsWith('h-'));
        if (heightType.value === 'h-px') {
          filteredHeightClasses.push(`h-[${heightValue.value}px]`);
        } else if (heightType.value === 'h-percent') {
          filteredHeightClasses.push(`h-[${heightValue.value}%]`);
        } else if (heightType.value === 'h-auto') {
          filteredHeightClasses.push('h-auto');
        } else {
          return;
        }
        element.className = filteredHeightClasses.join(' ');
        break;

      case 'bgColor':
        // 移除旧的背景色类
        const filteredBgClasses = classList.filter(cls =>
          !cls.startsWith('bg-[') && !cls.startsWith('bg-opacity'));

        // 使用直接颜色值
        filteredBgClasses.push(`bg-[${bgColor.value}]`);

        // 添加透明度类
        if (bgOpacity.value === 'custom') {
          const opacity = Math.min(100, Math.max(0, customBgOpacity.value)) / 100;
          filteredBgClasses.push(`bg-opacity-[${opacity}]`);
        }

        element.className = filteredBgClasses.join(' ');
        break;

      case 'textColor':
        // 移除旧的文字颜色类
        const filteredTextClasses = classList.filter(cls =>
          (!cls.startsWith('text-[') && !cls.startsWith('text-opacity')) ||
          cls.startsWith('text-xs') ||
          cls.startsWith('text-sm') ||
          cls.startsWith('text-base') ||
          cls.startsWith('text-lg') ||
          cls.startsWith('text-xl') ||
          cls.startsWith('text-2xl') ||
          cls.startsWith('text-left') ||
          cls.startsWith('text-center') ||
          cls.startsWith('text-right') ||
          cls.startsWith('text-justify'));

        // 使用直接颜色值
        filteredTextClasses.push(`text-[${textColor.value}]`);

        // 添加透明度类
        if (textOpacity.value === 'custom') {
          const opacity = Math.min(100, Math.max(0, customTextOpacity.value)) / 100;
          filteredTextClasses.push(`text-opacity-[${opacity}]`);
        }

        element.className = filteredTextClasses.join(' ');
        break;

      case 'padding':
        // 移除旧的内边距类
        const filteredPaddingClasses = classList.filter(cls =>
          !cls.startsWith('px-') &&
          !cls.startsWith('py-') &&
          !cls.startsWith('pt-') &&
          !cls.startsWith('pr-') &&
          !cls.startsWith('pb-') &&
          !cls.startsWith('pl-'));

        // 根据不同的自动类型添加对应的类
        if (paddingType.value === 'x-auto') {
          filteredPaddingClasses.push('px-auto');
        } else if (paddingType.value === 'y-auto') {
          filteredPaddingClasses.push('py-auto');
        } else if (paddingType.value === 'xy-auto') {
          filteredPaddingClasses.push('px-auto', 'py-auto');
        } else {
          // 自定义模式的原有逻辑
          if (paddingX.value.left === paddingX.value.right) {
            if (paddingX.value.left > 0) {
              if (paddingUnit.value === 'rem') {
                filteredPaddingClasses.push(`px-${paddingX.value.left}`);
              } else {
                filteredPaddingClasses.push(`px-[${paddingX.value.left}px]`);
              }
            }
          } else {
            if (paddingX.value.left > 0) {
              if (paddingUnit.value === 'rem') {
                filteredPaddingClasses.push(`pl-${paddingX.value.left}`);
              } else {
                filteredPaddingClasses.push(`pl-[${paddingX.value.left}px]`);
              }
            }
            if (paddingX.value.right > 0) {
              if (paddingUnit.value === 'rem') {
                filteredPaddingClasses.push(`pr-${paddingX.value.right}`);
              } else {
                filteredPaddingClasses.push(`pr-[${paddingX.value.right}px]`);
              }
            }
          }

          if (paddingY.value.top === paddingY.value.bottom) {
            if (paddingY.value.top > 0) {
              if (paddingUnit.value === 'rem') {
                filteredPaddingClasses.push(`py-${paddingY.value.top}`);
              } else {
                filteredPaddingClasses.push(`py-[${paddingY.value.top}px]`);
              }
            }
          } else {
            if (paddingY.value.top > 0) {
              if (paddingUnit.value === 'rem') {
                filteredPaddingClasses.push(`pt-${paddingY.value.top}`);
              } else {
                filteredPaddingClasses.push(`pt-[${paddingY.value.top}px]`);
              }
            }
            if (paddingY.value.bottom > 0) {
              if (paddingUnit.value === 'rem') {
                filteredPaddingClasses.push(`pb-${paddingY.value.bottom}`);
              } else {
                filteredPaddingClasses.push(`pb-[${paddingY.value.bottom}px]`);
              }
            }
          }
        }

        element.className = filteredPaddingClasses.join(' ');
        break;

      case 'margin':
        // 移除旧的外边距类
        const filteredMarginClasses = classList.filter(cls =>
          !cls.startsWith('mx-') &&
          !cls.startsWith('my-') &&
          !cls.startsWith('mt-') &&
          !cls.startsWith('mr-') &&
          !cls.startsWith('mb-') &&
          !cls.startsWith('ml-'));

        // 根据不同的自动类型添加对应的类
        if (marginType.value === 'x-auto') {
          filteredMarginClasses.push('mx-auto');
        } else if (marginType.value === 'y-auto') {
          filteredMarginClasses.push('my-auto');
        } else if (marginType.value === 'xy-auto') {
          filteredMarginClasses.push('mx-auto', 'my-auto');
        } else {
          // 自定义模式的原有逻辑
          if (marginX.value.left === marginX.value.right) {
            if (marginX.value.left > 0) {
              if (marginUnit.value === 'rem') {
                filteredMarginClasses.push(`mx-${marginX.value.left}`);
              } else {
                filteredMarginClasses.push(`mx-[${marginX.value.left}px]`);
              }
            }
          } else {
            if (marginX.value.left > 0) {
              if (marginUnit.value === 'rem') {
                filteredMarginClasses.push(`ml-${marginX.value.left}`);
              } else {
                filteredMarginClasses.push(`ml-[${marginX.value.left}px]`);
              }
            }
            if (marginX.value.right > 0) {
              if (marginUnit.value === 'rem') {
                filteredMarginClasses.push(`mr-${marginX.value.right}`);
              } else {
                filteredMarginClasses.push(`mr-[${marginX.value.right}px]`);
              }
            }
          }

          if (marginY.value.top === marginY.value.bottom) {
            if (marginY.value.top > 0) {
              if (marginUnit.value === 'rem') {
                filteredMarginClasses.push(`my-${marginY.value.top}`);
              } else {
                filteredMarginClasses.push(`my-[${marginY.value.top}px]`);
              }
            }
          } else {
            if (marginY.value.top > 0) {
              if (marginUnit.value === 'rem') {
                filteredMarginClasses.push(`mt-${marginY.value.top}`);
              } else {
                filteredMarginClasses.push(`mt-[${marginY.value.top}px]`);
              }
            }
            if (marginY.value.bottom > 0) {
              if (marginUnit.value === 'rem') {
                filteredMarginClasses.push(`mb-${marginY.value.bottom}`);
              } else {
                filteredMarginClasses.push(`mb-[${marginY.value.bottom}px]`);
              }
            }
          }
        }

        element.className = filteredMarginClasses.join(' ');
        break;

      case 'border':
        // 移除旧的边框类 - 只移除边框宽度相关类，保留颜色类
        const filteredBorderClasses = classList.filter(cls =>
          !(cls === 'border' ||
            cls === 'border-2' ||
            cls === 'border-4' ||
            cls.match(/border-\[\d+px\]/)));

        // 添加新的边框类
        if (borderWidth.value && borderWidth.value !== 'custom') {
          filteredBorderClasses.push(borderWidth.value);
        }

        element.className = filteredBorderClasses.join(' ');
        break;

      case 'customBorder':
        // 处理自定义边框宽度 - 只移除边框宽度相关类，保留颜色类
        const filteredCustomBorderClasses = classList.filter(cls =>
          !(cls === 'border' ||
            cls === 'border-2' ||
            cls === 'border-4' ||
            cls.match(/border-\[\d+px\]/)));

        // 添加自定义边框
        if (customBorderWidth.value > 0) {
          filteredCustomBorderClasses.push(`border-[${customBorderWidth.value}px]`);
        }

        element.className = filteredCustomBorderClasses.join(' ');
        break;

      case 'borderColor':
        // 只更新边框颜色，不影响边框宽度
        // 移除旧的边框颜色类
        const filteredBorderColorClasses = classList.filter(cls =>
          !(cls.startsWith('border-[#') || cls.startsWith('border-[rgb')));

        // 添加新的边框颜色类
        if (borderColor.value) {
          filteredBorderColorClasses.push(`border-[${borderColor.value}]`);
        }

        element.className = filteredBorderColorClasses.join(' ');
        break;

      case 'borderRadius':
        // 移除旧的圆角类
        const filteredRadiusClasses = classList.filter(cls => !cls.startsWith('rounded'));

        // 添加新的圆角类
        if (borderRadius.value && borderRadius.value !== 'custom') {
          filteredRadiusClasses.push(borderRadius.value);
        }

        element.className = filteredRadiusClasses.join(' ');
        break;

      case 'customBorderRadius':
        // 处理自定义圆角
        const filteredCustomRadiusClasses = classList.filter(cls => !cls.startsWith('rounded'));

        // 添加自定义圆角
        if (customBorderRadius.value > 0) {
          filteredCustomRadiusClasses.push(`rounded-[${customBorderRadius.value}px]`);
        }

        element.className = filteredCustomRadiusClasses.join(' ');
        break;

      case 'fontSize':
        // 移除旧的字体大小类
        const filteredFontSizeClasses = classList.filter(cls =>
          !cls.startsWith('text-xs') &&
          !cls.startsWith('text-sm') &&
          !cls.startsWith('text-base') &&
          !cls.startsWith('text-lg') &&
          !cls.startsWith('text-xl') &&
          !cls.startsWith('text-2xl') &&
          !cls.startsWith('text-['));

        // 添加新的字体大小类
        if (fontSize.value && fontSize.value !== 'custom') {
          filteredFontSizeClasses.push(fontSize.value);
        }

        element.className = filteredFontSizeClasses.join(' ');
        break;

      case 'customFontSize':
        // 处理自定义字体大小
        const filteredCustomFontSizeClasses = classList.filter(cls =>
          !cls.startsWith('text-xs') &&
          !cls.startsWith('text-sm') &&
          !cls.startsWith('text-base') &&
          !cls.startsWith('text-lg') &&
          !cls.startsWith('text-xl') &&
          !cls.startsWith('text-2xl') &&
          !cls.startsWith('text-['));

        // 添加自定义字体大小
        if (customFontSize.value > 0) {
          filteredCustomFontSizeClasses.push(`text-[${customFontSize.value}px]`);
        }

        element.className = filteredCustomFontSizeClasses.join(' ');
        break;

      case 'fontWeight':
        // 移除旧的字体粗细类
        const filteredFontWeightClasses = classList.filter(cls =>
          !cls.startsWith('font-'));

        // 添加新的字体粗细类
        filteredFontWeightClasses.push(fontWeight.value);

        element.className = filteredFontWeightClasses.join(' ');
        break;

      case 'textAlign':
        // 移除旧的文本对齐类
        const filteredTextAlignClasses = classList.filter(cls =>
          !cls.startsWith('text-left') &&
          !cls.startsWith('text-center') &&
          !cls.startsWith('text-right') &&
          !cls.startsWith('text-justify'));

        // 添加新的文本对齐类
        filteredTextAlignClasses.push(textAlign.value);

        element.className = filteredTextAlignClasses.join(' ');
        break;

      case 'shadow':
        // 移除旧的阴影类
        const filteredShadowClasses = classList.filter(cls => !cls.startsWith('shadow'));

        // 添加新的阴影类
        if (shadow.value) {
          filteredShadowClasses.push(shadow.value);
        }

        element.className = filteredShadowClasses.join(' ');
        break;

      case 'objectFit':
        // 移除旧的适应方式类
        const filteredObjectFitClasses = classList.filter(cls =>
          !cls.startsWith('object-contain') &&
          !cls.startsWith('object-cover') &&
          !cls.startsWith('object-fill') &&
          !cls.startsWith('object-none') &&
          !cls.startsWith('object-scale-down'));

        if (objectFit.value) {
          filteredObjectFitClasses.push(objectFit.value);
        }

        element.className = filteredObjectFitClasses.join(' ');
        break;

      case 'objectPosition':
        // 移除旧的位置类
        const filteredObjectPositionClasses = classList.filter(cls =>
          !cls.startsWith('object-center') &&
          !cls.startsWith('object-top') &&
          !cls.startsWith('object-bottom') &&
          !cls.startsWith('object-left') &&
          !cls.startsWith('object-right'));

        if (objectPosition.value) {
          filteredObjectPositionClasses.push(objectPosition.value);
        }

        element.className = filteredObjectPositionClasses.join(' ');
        break;

      case 'filter':
        // 移除旧的滤镜类
        const filteredFilterClasses = classList.filter(cls =>
          cls !== 'filter-none' &&
          cls !== 'grayscale' &&
          cls !== 'blur' &&
          cls !== 'brightness-75' &&
          cls !== 'brightness-125' &&
          cls !== 'contrast-75' &&
          cls !== 'contrast-125' &&
          cls !== 'sepia');

        if (filter.value) {
          filteredFilterClasses.push(filter.value);
        }

        element.className = filteredFilterClasses.join(' ');
        break;

      case 'layout':
        // 移除旧的布局类
        const filteredLayoutClasses = classList.filter(cls =>
          !cls.startsWith('flex') &&
          !cls.startsWith('grid') &&
          !cls.startsWith('justify-') &&
          !cls.startsWith('items-') &&
          !cls.startsWith('gap-'));

        // 添加新的布局类
        if (layoutType.value === 'flex') {
          filteredLayoutClasses.push('flex', flexDirection.value, justifyContent.value, alignItems.value, flexWrap.value);
        } else if (layoutType.value === 'grid') {
          filteredLayoutClasses.push('grid', gridCols.value, gridGap.value);
        }

        element.className = filteredLayoutClasses.join(' ');
        break;

      case 'flexDirection':
        // 更新flex方向
        const filteredFlexDirClasses = classList.filter(cls =>
          !cls.startsWith('flex-') || !(cls.includes('row') || cls.includes('col')));
        filteredFlexDirClasses.push(flexDirection.value);
        element.className = filteredFlexDirClasses.join(' ');
        break;

      case 'justifyContent':
        // 更新主轴对齐
        const filteredJustifyClasses = classList.filter(cls => !cls.startsWith('justify-'));
        filteredJustifyClasses.push(justifyContent.value);
        element.className = filteredJustifyClasses.join(' ');
        break;

      case 'alignItems':
        // 更新交叉轴对齐
        const filteredAlignClasses = classList.filter(cls => !cls.startsWith('items-'));
        filteredAlignClasses.push(alignItems.value);
        element.className = filteredAlignClasses.join(' ');
        break;

      case 'flexWrap':
        // 更新换行方式
        const filteredWrapClasses = classList.filter(cls => !cls.startsWith('flex-wrap'));
        filteredWrapClasses.push(flexWrap.value);
        element.className = filteredWrapClasses.join(' ');
        break;

      case 'gridCols':
        // 更新网格列数
        const filteredGridColsClasses = classList.filter(cls => !cls.startsWith('grid-cols-'));
        filteredGridColsClasses.push(gridCols.value);
        element.className = filteredGridColsClasses.join(' ');
        break;

      case 'gridGap':
        // 更新网格间距
        const filteredGridGapClasses = classList.filter(cls => !cls.startsWith('gap-'));
        filteredGridGapClasses.push(gridGap.value);
        element.className = filteredGridGapClasses.join(' ');
        break;

      case 'flexGap':
        // 更新间隙
        const filteredGapClasses = classList.filter(cls => !cls.startsWith('gap-'));
        if (flexGap.value) {
          filteredGapClasses.push(flexGap.value);
        }
        element.className = filteredGapClasses.join(' ');
        break;

      case 'customFlexGap':
        // 更新自定义间隙
        const filteredCustomGapClasses = classList.filter(cls => !cls.startsWith('gap-'));
        if (customFlexGap.value > 0) {
          filteredCustomGapClasses.push(`gap-[${customFlexGap.value}px]`);
        }
        element.className = filteredCustomGapClasses.join(' ');
        break;
    }

    // 更新当前类列表
    currentClasses.value = element.className.split(' ');

  } catch (error) {
    console.error('更新元素类时出错:', error);
  }
};

// 更新元素属性
const updateElementAttr = (attr: string) => {
  if (!selectedElement.value) return;

  try {
    const element = selectedElement.value;

    switch (attr) {
      case 'src':
        if (imgSrc.value) {
          element.setAttribute('src', imgSrc.value);
        }
        break;
    }
  } catch (error) {
    console.error('更新元素属性时出错:', error);
  }
};

// 更新元素文本内容
const updateElementText = () => {
  if (!selectedElement.value) return;

  try {
    const element = selectedElement.value;
    if (allowChangeWordArr.includes(element.tagName)) {
      element.textContent = elementText.value;
    }
  } catch (error) {
    console.error('更新元素文本时出错:', error);
  }
};

// 当选中元素改变时，解析其类
watch(selectedElement, (newVal) => {
  if (newVal) {
console.log(newVal.tagName)
    if(newVal.tagName === 'path'||newVal.tagName === 'svg'){
      isAllowChangeProperty.value = false
      toolTipMessage.value = toolTipMessages.noAllowChangeProperty
    }else{
      isAllowChangeProperty.value = true
      parseElementClasses();
    }

  }else{
    isAllowChangeProperty.value = false
    toolTipMessage.value = toolTipMessages.noElement
  }
});
const isAllowChangeProperty = ref(false)
const toolTipMessages = {
  noElement: '请先选择一个元素进行配置',
  noAllowChangeProperty: '当前元素暂时不允许修改属性哦',
}
const toolTipMessage = ref('')
// 挂载时初始化
onMounted(() => {
  if(!selectedElement.value){
    toolTipMessage.value = toolTipMessages.noElement
    }else if(selectedElement.value.tagName === 'path'||selectedElement.value.tagName === 'svg'){
    toolTipMessage.value = toolTipMessages.noAllowChangeProperty

  }else{
    isAllowChangeProperty.value = true
  }
  if (selectedElement.value&&isAllowChangeProperty.value) {
    parseElementClasses();
  }
});
onBeforeUnmount(()=>{

  toolTipMessage.value = toolTipMessages.noElement
  isAllowChangeProperty.value = false
})

// 在script部分添加新的响应式变量
const customBgOpacity = ref(100);
const customTextOpacity = ref(100);
const paddingType = ref('custom');
const marginType = ref('custom');
</script>

<style scoped>
.property-config {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  font-size: 14px;
  background: linear-gradient(135deg,
    rgba(139, 92, 246, 0.02) 0%,
    rgba(236, 72, 153, 0.02) 50%,
    rgba(139, 92, 246, 0.02) 100%
  );
  padding: 1rem;

  /* 滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(139, 92, 246, 0.2);
    border-radius: 3px;

    &:hover {
      background: rgba(139, 92, 246, 0.3);
    }
  }

  /* 分组标题样式 */
  h3 {
    color: rgba(76, 29, 149, 0.9);
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(139, 92, 246, 0.15);
    padding-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  /* 分组容器样式 */
  .mb-6 {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 16px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 4px 20px -4px rgba(139, 92, 246, 0.08);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(139, 92, 246, 0.3);
      box-shadow: 0 6px 24px -4px rgba(139, 92, 246, 0.12);

      h3 {
        color: rgba(139, 92, 246, 0.9);
      }
    }
  }

  /* 标签样式 */
  label {
    color: rgba(76, 29, 149, 0.7);
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  /* 输入框和选择器基础样式 */
  input, select {
    border: 1px solid rgba(139, 92, 246, 0.15);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
    font-size: 0.9rem;
    color: rgba(76, 29, 149, 0.9);
    background: rgba(255, 255, 255, 0.8);
    transition: all 0.3s ease;

    &:hover {
      border-color: rgba(139, 92, 246, 0.3);
    }

    &:focus {
      outline: none;
      border-color: rgba(139, 92, 246, 0.5);
      box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
    }
  }

  /* 数字输入框特殊样式 */
  input[type="number"] {
    width: 70px;
    text-align: center;

    &::-webkit-inner-spin-button,
    &::-webkit-outer-spin-button {
      opacity: 1;
      height: 1.5rem;
    }
  }

  /* 颜色选择器样式 */
  input[type="color"] {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0.25rem;
    border-radius: 8px;
    cursor: pointer;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: none;
      border-radius: 6px;
    }
  }

  /* 网格布局容器样式 */
  .grid {
    gap: 1rem;
  }

  /* 边距和内边距输入组样式 */
  .grid-cols-2 {
    .text-xs {
      color: rgba(76, 29, 149, 0.6);
      font-size: 0.8rem;
      margin-bottom: 0.25rem;
    }
  }

  /* 提示信息样式 */
  .text-center.text-gray-500 {
    color: rgba(139, 92, 246, 0.6);
    font-size: 0.95rem;
    padding: 2rem;
    text-align: center;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(12px);
    border-radius: 16px;
    border: 1px solid rgba(139, 92, 246, 0.15);
    box-shadow: 0 4px 20px -4px rgba(139, 92, 246, 0.08);
  }

  /* 选择器组合样式 */
  .flex.items-center {
    gap: 0.75rem;
  }
}
</style>

