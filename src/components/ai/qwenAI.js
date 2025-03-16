import OpenAI from 'openai'

const example = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!-- 引入 Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>

  <!-- 动态配置 Tailwind -->
  <script>
    tailwind.config = {
      theme: {
        extend: {
          colors: {
            primary: 'var(--color-primary)', // 使用 CSS 变量
            secondary: 'var(--color-secondary)',
            //其他可能的颜色变量
          },
          borderRadius: {
            button: 'var(--border-radius-button)', // 使用 CSS 变量
          },
          //其他可能的配置
        },
      },
    };
  </script>

  <!-- 定义全局 CSS 变量 -->
  <style>
      --color-primary: red; /* 可能的初始主色 */
      --color-secondary: blue; /* 可能的初始次色 */
      --border-radius-button: 10px; /* 可能的初始按钮圆角 */
      /*其他可能的css变量*/
      /*其他可能的类*/
    }
  </style>
  <!-- 其他可能的style标签-->
  <style>
    /*可能的样式*/
  </style>
</head>
<body>
  <!-- 可能的html结构 -->
  <script>
    //可能的js代码
  </script>
</body>
</html>`


const requirement1 = `当用户需要你生成组件、或者修改组件（例如用户说"添加如下效果"、"修改样式"、"添加点击事件"等包含"添加"、"修改"、"添加效果"、"修改样式"、"添加事件"等关键词的请求）时，执行如下要求：必须使用tailwindcss，若需要增加新的样式类，则必须在类名中包含随机编码（即类的唯一标识），让类不会重名。并且html部分用三个反引号包裹，并标注为html;如果新增了类，则用三个反引号包裹，并标注为css;如果新增了js代码，则用三个反引号包裹，并标注为js。不过用户如果没让你改的话，你不要自己改，只回答用户的问题。`
//需求2：
const requirement2 = `当用户只是和你聊天，不需要你生成或者修改代码时，那就陪用户聊聊天，或者根据上下文，给用户一些建议。`
//需求3：
const requirement3 = `当用户需要你生成页面或网站时（例如用户说"生成一个网站"、"制作一个网页"、"创建一个在线教育网站"、"设计一个电商首页"等包含"网站"、"网页"、"首页"、"页面"等关键词的请求），执行如下要求：用html,css,js的方式生成完整的HTML文档结构，包涵<!DOCTYPE html>、<html>、<head>和<body>。css必须用tailwindcss，且需要用tailwind.config结合css变量来配置主题，以便用户后续修改，若需要增加新的样式类，则必须在类名中包含随机编码（即类的唯一标识），让类不会重名。全部代码用三个反引号包裹，并标注为html,所有的style标签写在<head>里，script标签写在<body>结束前。下面是一个返回示例：${example}，这只是示例代码，请根据用户的需求，生成符合要求的html代码。`




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
