/**
 * 前端直连 FastGPT（流式）
 * ⚠️ 仅用于开发 / Demo
 */
export async function askFastGPTStream(
  question: string,
  options: {
    appId: string;
    chatId?: string;
    onMessage: (chunk: string) => void;
    onDone?: () => void;
    onError?: (err: any) => void;
  }
) {
  const { appId, chatId, onMessage, onDone, onError } = options;

  try {
    const res = await fetch('https://cloud.fastgpt.cn/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer fastgpt-j7SSVJAIdFbZWDv41SpbCZFvN7QaXyPO8ePabkjhgvv5LrkN6dO2jsqyKvO80sEjR',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        appId,
        chatId: chatId || 'default-chat',
        stream: true,
        detail: true,
        variables: {
          cTime: new Date().toISOString()
        },
        messages: [
          {
            role: 'user',
            content: question
          }
        ]
      })
    });

    if (!res.ok || !res.body) {
      const text = await res.text();
      throw new Error(text);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');

    let done = false;

    while (!done) {
        
      const result = await reader.read();
      done = result.done;

      if (result.value) {
        const chunk = decoder.decode(result.value, {
          stream: true
        });

        /**
         * FastGPT 返回的是纯文本流
         * 直接 append 即可
         */
        onMessage(chunk);
      }
    }

    onDone?.();
  } catch (err) {
    console.error('FastGPT stream error:', err);
    onError?.(err);
  }
}
