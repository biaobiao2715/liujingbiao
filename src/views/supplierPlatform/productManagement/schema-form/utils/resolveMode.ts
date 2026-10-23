// 字段模式解析

// 字段 mode > 页面 mode > 默认 edit
export function resolveFieldMode(fieldMode: any, pageMode: FieldMode, model: any): FieldMode {
  if (typeof fieldMode === 'function') {
    return fieldMode(model);
  }
  return fieldMode ?? pageMode;
}
