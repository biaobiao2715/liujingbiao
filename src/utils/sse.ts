import { getToken } from '@/utils/auth';
import { ElNotification } from 'element-plus';
import { useNoticeStore } from '@/store/modules/notice';
import { getRecommendDemand } from '@/api/login';
import { watch, ref } from 'vue';

// 事件标题映射
const eventTitleMap: Record<string, string> = {
  message: '消息',
  purchaseDemand: '采购需求通知',
  supplyDemand: '供给需求通知',
  seed_economy_notice: '消息',
  notice_status: '消息',
  tech_notice: '消息',
  report: '消息'
};

// 离线消息窗口标记
let isOfflinePhase = false;
let isOfflinePhaseList: string[] = [];
const OFFLINE_WINDOW = 10000; // ms，离线消息窗口
// SSE初始化（单例保护）
let eventSourceInstance: any = null;
export const closeSSE = () => {
  if (eventSourceInstance && eventSourceInstance.close) {
    eventSourceInstance.close();
  }
  eventSourceInstance = null;
};

export const initSSE = (url: any) => {
  // 每次初始化前先销毁上一次的SSE连接
  closeSSE();
  if (import.meta.env.VITE_APP_SSE === 'false') return;
  isOfflinePhase = false;
  setTimeout(() => {
    isOfflinePhase = true;
  }, OFFLINE_WINDOW);
  url = url + '?Authorization=Bearer ' + getToken() + '&clientid=' + import.meta.env.VITE_APP_CLIENT_ID;
  const { data, event, error, eventSource } = useEventSource(
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
  eventSourceInstance = eventSource || null;
  watch(error, () => {
    if (error.value) {
      console.log('SSE connection error:', error.value);
      error.value = null;
    }
  });
  watch(
    [data, event],
    ([newData, newEvent]) => {
      console.log('接受SSE received event:', newEvent, 'data:', newData);
      if (!newData || !newEvent) return;
      const payload = parsePayload(newData);
      if (!payload) return;
      handleNotification(payload, newEvent);
      data.value = null;
    },
    { flush: 'post' }
  );
  // 初始化后立即获取推荐需求
  getRecommendDemand().catch(() => {});
};

// 注册离线窗口结束后的事件白名单
// 支持传入单个事件或事件数组
export function onOfflinePhaseEnd(events: string | string[]) {
  if (Array.isArray(events)) {
    isOfflinePhaseList = events;
  } else if (typeof events === 'string') {
    isOfflinePhaseList = [events];
  } else {
    isOfflinePhaseList = [];
  }
  console.log('注册离线窗口结束后的事件白名单：', isOfflinePhaseList);
}

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
    Object.keys(payload)
      .filter((k) => k !== 'message' && k !== 'title')
      .map((k) => {
        const v = payload[k];
        return typeof v === 'object' ? '' : String(v);
      })
      .filter(Boolean)
      .join(' ')
  );
}

// 存储并（如需）弹窗通知
function handleNotification(payload: any, event: string) {
  let msg = extractMessage(payload);
  if (event === 'purchaseDemand') {
    msg += (payload.categoryName ? payload.categoryName + '类型；' : '') + (payload.demandDescription || '');
  }
  if (event === 'supplyDemand') {
    msg += (payload.categoryName ? payload.categoryName + '类型；' : '') + (payload.supplyDescription || '');
  }
  const noticeStore = useNoticeStore();
  const exists =
    noticeStore.state.notices &&
    noticeStore.state.notices.some((item: any) => item.event === event && JSON.stringify(item.message) === JSON.stringify(payload));
  if (exists) return;

  // 判断是否需要弹窗
  let shouldNotify = false;
  let notified = false;
  if (!isOfflinePhase && Array.isArray(isOfflinePhaseList) && isOfflinePhaseList.includes(event)) {
    // 离线窗口内且白名单事件
    shouldNotify = true;
    notified = true;
    console.log('离线窗口内白名单事件，直接弹窗通知：', event, msg);
  } else if (isOfflinePhase) {
    // 离线窗口结束后全部弹窗
    shouldNotify = true;
    notified = true;
  } else {
    // 离线窗口内非白名单事件
    notified = false;
  }

  noticeStore.addNotice({
    event,
    message: payload,
    read: false,
    time: new Date().toLocaleString(),
    notified
  });
  if (shouldNotify) {
    ElNotification({
      title: eventTitleMap[event] || '消息',
      message: msg,
      type: 'success',
      duration: 3000
    });
  }
}
