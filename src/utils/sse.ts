import { getToken } from '@/utils/auth';
import { ElNotification } from 'element-plus';
import { useNoticeStore } from '@/store/modules/notice';
import { getRecommendDemand } from '@/api/login';
import { watch, ref } from 'vue';

// 事件标题映射：根据不同SSE事件使用不同的通知标题
// purchaseDemand: 采购主题 (推给供应商使用)
// supplyDemand: 供给主题 (推给采购商使用)
const eventTitleMap: Record<string, string> = {
  message: '消息',
  purchaseDemand: '采购需求通知',
  supplyDemand: '供给需求通知',
  seed_economy_notice: '消息',
  notice_status: '消息',
  tech_notice: '消息',
  report: '消息'
};

// 防抖标记
let isProcessing = false;
// 用队列缓存所有待处理的数据，避免高频触发丢数据
const pendingQueue = ref<Array<{ payload: any; event: string }>>([]);

function parsePayload(raw: any): any {
  if (raw == null) return null;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return { message: raw };
    }
  }
  return raw;
}

function extractMessage(payload: any): string {
  if (!payload) return '';
  if (typeof payload === 'string') return payload;
  return (
    payload.message ||
    payload.title ||
    // 回退：取所有可序列化基本类型字段拼接
    Object.keys(payload)
      .filter((k) => ['message', 'title'].indexOf(k) === -1)
      .map((k) => {
        const v = payload[k];
        return typeof v === 'object' ? '' : String(v);
      })
      .filter(Boolean)
      .join(' ')
  );
}

// 处理通知的函数
function handleNotification(payload: any, event: string) {
  let msg = extractMessage(payload);

  if (event === 'purchaseDemand') {
    msg = msg + (payload.categoryName ? payload.categoryName + '类型；' : '') + (payload.demandDescription || '');
  }
  if (event === 'supplyDemand') {
    msg = msg + (payload.categoryName ? payload.categoryName + '类型；' : '') + (payload.supplyDescription || '');
  }

  // 添加到通知存储
  useNoticeStore().addNotice({
    event: event,
    message: payload,
    read: false,
    time: new Date().toLocaleString()
  });
  if (event === 'message') {
    // 显示通知
    ElNotification({
      title: eventTitleMap[event] || '消息',
      message: msg,
      type: 'success',
      duration: 3000
    });
  }
}

// 初始化
export const initSSE = (url: any) => {
  console.log('Initializing SSE with URL:', '执行了么');
  if (import.meta.env.VITE_APP_SSE === 'false') {
    return;
  }

  // 重置状态
  isProcessing = false;

  url = url + '?Authorization=Bearer ' + getToken() + '&clientid=' + import.meta.env.VITE_APP_CLIENT_ID;
  // 新增采购与供给两个主题
  const { data, event, error } = useEventSource(
    url,
    ['message', 'purchaseDemand', 'supplyDemand', 'seed_economy_notice', 'tech_notice', 'report', 'notice_status'],
    {
      autoReconnect: {
        retries: 5,
        delay: 5000,
        onFailed() {
          console.log('Failed to connect after 5 retries');
        }
      }
    }
  );

  watch(error, () => {
    if (error.value) {
      console.log('SSE connection error:', error.value);
      error.value = null;
    }
  });

  // 监听数据变化
  watch(
    [data, event],
    ([newData, newEvent]) => {
      if (!newData || !newEvent) return;

      const payload = parsePayload(newData);
      if (!payload) return;

      // 推入队列
      pendingQueue.value.push({ payload, event: newEvent });

      // 如果未在处理，则启动处理流程
      if (!isProcessing) {
        processQueue();
      }

      // 清空数据
      data.value = null;
    },
    { flush: 'post' }
  );

  // 队列处理函数
  function processQueue() {
    if (pendingQueue.value.length === 0) {
      isProcessing = false;
      return;
    }
    isProcessing = true;
    const { payload, event } = pendingQueue.value.shift()!;
    try {
      handleNotification(payload, event);
    } finally {
      setTimeout(() => {
        processQueue();
      }, 100);
    }
  }

  // 初始化后仅调用一次推荐需求接口
  getRecommendDemand()
    .then((res: any) => {
      // console.log('推荐需求', res);
    })
    .catch((err: any) => {
      // console.log('推荐需求接口错误', err);
    });
};
