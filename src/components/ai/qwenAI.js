import OpenAI from 'openai'

// 预定义示例响应
// const example1Response = JSON.stringify({
//   html: `<div class="bg-white p-8 rounded-lg shadow-sm a1b2c3-rotate-animation">
//           <div class="w-full h-48 mb-6 rounded-lg overflow-hidden a1b2c3-hover-zoom">
//           <img src="https://ai-public.mastergo.com/ai/img_res/ecf357dc7c8b41cd97524d5ee8a782b9.jpg" class="w-full h-full object-cover transition-transform duration-300 transform hover:scale-110" alt="展览特色">
//         </div>
//         <h3 class="text-xl font-bold mb-4 a1b2c3-hover-scale">国际艺术大师云集</h3>
//         <p class="text-gray-600 a1b2c3-hover-scale">汇聚来自 30 多个国家的 150 位知名艺术家，展出 300 余件当代艺术精品。</p>
//         </div>`,
//   style: `.a1b2c3-rotate-animation {
//         animation: rotateAnimation 2s ease-in-out;
//         }
//         @keyframes rotateAnimation {
//             0% {
//                 transform: rotateY(30deg);
//                 opacity: 0;
//             }
//             100% {
//                 transform: rotateY(0deg);
//                 opacity: 1;
//             }
//         }
//         .a1b2c3-hover-zoom img {
//             transition: transform 0.3s ease-in-out;
//         }
//         .a1b2c3-hover-zoom:hover img {
//             transform: scale(1.1);
//         }
//         .a1b2c3-hover-scale {
//             transition: transform 0.3s ease-in-out;
//         }
//         .a1b2c3-hover-scale:hover {
//             transform: scale(1.05);
//         }`,
//   text: '用户你好，组件已经更新完成',
// })
// const skill1 = `根据用户的需求生成或者修改对应的组件代码,若你添加了新的css类，请对这些类加上随机编码（唯一标识），让类不会重名。
//         且只需要代码，不要输出任何注释。不需要任何转义。
//         并提取出修改或生成后的组件的样式（style）和结构（html），输出包含html层和style层的JSON。
//         示例：
//         Q：<div class="bg-white p-8 rounded-lg shadow-sm">
//             <div class="w-full h-48 mb-6 rounded-lg overflow-hidden">
//             <img src="https://ai-public.mastergo.com/ai/img_res/ecf357dc7c8b41cd97524d5ee8a782b9.jpg" class="w-full h-full object-cover" alt="展览特色">
//             </div>
//             <h3 class="text-xl font-bold mb-4">国际艺术大师云集</h3>
//             <p class="text-gray-600">汇聚来自 30 多个国家的 150 位知名艺术家，展出 300 余件当代艺术精品。</p>
//             </div>
//             对这个组件进行美化，加一些动态效果，比如旋转，然后鼠标悬停在图片和文字上有放大效果。
//         A：${example1Response}`

// const example2Response = JSON.stringify({
//   text: '用户你好，很高兴认识你',
// })

// const skill2 = `当用户没有页面设计方面的要求，可以陪用户聊聊天，或者根据上下文，给用户一些建议。
//         示例1：
//         Q：牧濑你好
//         A：${example2Response}
//        `

//需求1：
const requirement1 = `当用户需要你生成或者修改组件时，用新增类或者tailwindcss的方式增加style，并必须在类名中包含随机编码（即类的唯一标识），让类不会重名。并且html部分用三个反引号包裹，并标注为html,css部分用三个反引号包裹，并标注为css`
//需求2：
const requirement2 = `当用户只是和你聊天，不需要你生成或者修改代码时，那就陪用户聊聊天，或者根据上下文，给用户一些建议。`
//需求3：
const requirement3 = `当用户需要你生成页面时，用html,css,js的方式生成页面，css必须用tailwindcss或者增加类名的方式增加style，并必须在类名中包含随机编码（即类的唯一标识），让类不会重名。并分成三个部分展示：html部分、用三个反引号包裹，并标注为html,css部分用三个反引号包裹，并标注为css，js部分用三个反引号包裹，并标注为js`
export const useQwenAI = () => {
  const apiKey = import.meta.env.VITE_QWEN_API_KEY
  const openai = new OpenAI({
    // 若没有配置环境变量，请用百炼API Key将下行替换为：apiKey: "sk-xxx",
    apiKey: apiKey,
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    dangerouslyAllowBrowser: true,
  })
  let messages = [
    {
      role: 'system',
      content: `你是动态界面交互系统的设计助手牧濑，你需要解决他们使用该系统设计页面时的问题，也可以和他们交流互动。
      要求1：${requirement1}。
      要求2：${requirement2}。
      要求3：${requirement3}。
        `,
    },
  ]
  async function getResponse(message) {
    //消息体里追加一条用户消息
    // messages.push({ role: 'user', content: message })
    try {
      const completion = await openai.chat.completions.create({
        model: 'qwen-coder-plus', //模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: [
          {
            role: 'system',
            content: `你是动态界面交互系统的设计助手牧濑，你需要解决他们使用该系统设计页面时的问题，也可以和他们交流互动。
            要求1：${requirement1}。
            要求2：${requirement2}。
            要求3：${requirement3}。
              `,
          },
          { role: 'user', content: message },
        ],
        // response_format: {
        //   type: 'json_object',
        // },
        stream: true,
        stream_options: {
          include_usage: true,
        },
      })
      // const jsonString = completion.choices[0].message.content
      return completion
    } catch (error) {
      console.error('Error fetching response:', error)
      throw error // 重新抛出异常以便上层处理
    }
  }

  return {
    getResponse,
    messages,
  }
}
