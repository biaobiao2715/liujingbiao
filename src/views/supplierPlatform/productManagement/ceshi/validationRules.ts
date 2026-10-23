import type { FormItemRule } from 'element-plus';

export const requiredRule = (message: string): FormItemRule => ({
  required: true,
  message,
  trigger: 'blur'
});

export const positiveIntegerRule = (message: string): FormItemRule => ({
  validator: (_, value, callback) => {
    if (!/^[1-9]\d*$/.test(String(value ?? ''))) {
      callback(new Error(message));
    } else {
      callback();
    }
  },
  trigger: 'blur'
});

export const chineseLengthRule = (max: number, message: string): FormItemRule => ({
  validator: (_, value, callback) => {
    const zh = value?.match(/[\u4e00-\u9fa5]/g) || [];
    zh.length > max ? callback(new Error(message)) : callback();
  },
  trigger: 'blur'
});
// 的实际到货时间不能早于计划到货时间
