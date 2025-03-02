export const useCozeChat = () => {
  //  Coze 应用的 Bot ID
  const botId = '7471540694629449739'

  //  Coze API 访问令牌（例如 PAT 令牌）
  const accessToken = 'pat_ayFjnhkzMmgHJBnHkyCtLOvLetphcVqLeb2g7WeEQEsGd3fljg5nKDxRS5ktQ14H'

  const initCozeChat = () => {
    //引入AI Bot
    // 动态创建 script 标签来引入 CozeWebSDK
    const script = document.createElement('script')
    script.src =
      'https://lf-cdn.coze.cn/obj/unpkg/flow-platform/chat-app-sdk/1.2.0-beta.3/libs/cn/index.js'
    script.onload = () => {
      // 当脚本加载完成后，初始化 CozeWebSDK
      new window.CozeWebSDK.WebChatClient({
        config: {
          bot_id: botId,
        },
        componentProps: {
          title: '智能助手小濑',
        },
        auth: {
          type: 'token',
          token: accessToken,
          onRefreshToken: function () {
            return accessToken
          },
        },
      })
    }
    document.body.appendChild(script)
  }

  return {
    initCozeChat,
  }
}
