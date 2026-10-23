import type { FormItemRule } from 'element-plus';

/** 必填 */
export const requiredRule = (message = '必填项', trigger: 'blur' | 'change' = 'blur'): FormItemRule => ({
  required: true,
  message,
  trigger
});

/** 正整数 */
export const positiveIntegerRule = (message = '必须为正整数'): FormItemRule => ({
  validator: (_rule, value, callback) => {
    if (!/^[1-9]\d*$/.test(String(value ?? ''))) {
      callback(new Error(message));
    } else {
      callback();
    }
  },
  trigger: 'blur'
});

/** 中文长度限制 */
export const chineseLengthRule = (max: number, message?: string): FormItemRule => ({
  validator: (_rule, value, callback) => {
    if (!value) return callback();
    const zh = value.match(/[\u4e00-\u9fa5]/g) || [];
    if (zh.length > max) {
      callback(new Error(message ?? `最多 ${max} 个汉字`));
    } else {
      callback();
    }
  },
  trigger: 'blur'
});

/** 上传文件必填（支持外部状态） */
export const uploadRequiredRule = (getList: () => any[], message = '请至少上传一项'): FormItemRule => ({
  validator: (_rule, _value, callback) => {
    const list = getList();
    if (!list || list.length === 0) {
      callback(new Error(message));
    } else {
      callback();
    }
  },
  trigger: 'blur'
});
