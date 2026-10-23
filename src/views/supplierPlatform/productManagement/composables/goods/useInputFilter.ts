type DigitOptions = {
  maxLen?: number;
};

type InputTarget<T> = {
  [K in keyof T]: T[K];
};

export const useInputFilter = () => {
  /** 工具函数 */
  const getNowStr = () => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? `0${n}` : n);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  /** 仅保留数字 */
  const filterDigits = (val: string, opts?: DigitOptions) => {
    let s = (val ?? '').replace(/\D/g, '');
    if (opts?.maxLen) s = s.slice(0, opts.maxLen);
    return s;
  };

  /** 输入数字（整型） */
  const onInputDigits = <T extends Record<string, any>>(val: string, target: T, key: keyof T, opts?: DigitOptions) => {
    target[key] = filterDigits(val, opts) as T[keyof T];
  };

  /** 键盘级拦截（数字） */
  const onKeypressDigits = (e: KeyboardEvent) => {
    const allowKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'];

    if (!/[0-9]/.test(e.key) && !allowKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  /** 金额输入（最多两位小数） */
  const onInputPrice = <T extends Record<string, any>>(val: string, target: T, key: keyof T) => {
    let s = val
      .replace(/[^\d.]/g, '')
      .replace(/^0+(\d)/, '$1')
      .replace(/\.{2,}/g, '.')
      .replace('.', '$#$')
      .replace(/\./g, '')
      .replace('$#$', '.');

    if (s.includes('.')) {
      s = s.replace(/^(\d+)\.(\d{0,2}).*$/, '$1.$2');
    }

    target[key] = s as T[keyof T];
  };

  return {
    filterDigits,
    onInputDigits,
    onKeypressDigits,
    onInputPrice,
    getNowStr
  };
};
