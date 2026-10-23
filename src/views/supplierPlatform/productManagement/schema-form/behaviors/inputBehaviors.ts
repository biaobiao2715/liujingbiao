// 输入行为（数字 / 金额）
// behaviors/inputBehaviors.ts
export const inputBehaviors = {
  integer: {
    placeholder: '请输入整数',
    parser: (v: string) => v.replace(/\D/g, '')
  },
  price: {
    placeholder: '请输入金额（最多两位小数）',
    parser: (v: string) => v.replace(/[^\d.]/g, '').replace(/^(\d+)(\.\d{0,2}).*$/, '$1$2')
  }
};
