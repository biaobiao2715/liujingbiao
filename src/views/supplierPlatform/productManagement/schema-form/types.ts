// Schema 类型定义
// types.ts
export type FieldMode = 'edit' | 'readonly' | 'display';

export interface FieldSchema {
  field: string;
  label: string;

  component?: string;

  /** 字段级模式 */
  mode?: FieldMode | ((model: any) => FieldMode);

  /** 显示隐藏 */
  visible?: (model: any) => boolean;

  /** 输入语义 */
  inputType?: 'text' | 'integer' | 'price';

  /** 校验规则 */
  rules?: any[];

  /** 组件私有配置 */
  componentProps?: Record<string, any>;

  /** 详情态渲染 */
  render?: (value: any, model: any) => any;

  /** 只读格式化 */
  formatter?: (value: any, model: any) => string;
}
