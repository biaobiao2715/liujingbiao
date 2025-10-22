import type { DirectiveBinding } from 'vue';

interface ThrottleOptions {
  delay?: number;
}

declare global {
  interface HTMLElement {
    __throttleHandler__?: (e: Event) => void;
  }
}

/**
 * 节流指令，默认0.8秒钟内只允许触发一次点击事件,可手动传入延迟时间，比如v-throttle="500"
 */
export default {
  mounted(el: HTMLElement, binding: DirectiveBinding<number | ThrottleOptions>) {
    const delay = typeof binding.value === 'number' ? binding.value : binding.value?.delay || 800;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const handler = (e: Event) => {
      if (timer) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      timer = setTimeout(() => (timer = null), delay);
    };

    el.__throttleHandler__ = handler;
    el.addEventListener('click', handler, true); // 使用捕获阶段，确保优先执行
  },

  beforeUnmount(el: HTMLElement) {
    el.removeEventListener('click', el.__throttleHandler__, true);
    delete el.__throttleHandler__;
  }
};
