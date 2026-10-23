import type { Ref } from 'vue';
import type { GoodsSpecRow } from './useGoodsSpecTable';

export interface GoodsSpecRowErrors {
  goodsSpecificationValue?: string;
  goodsPrice?: string;
  goodsStock?: string;
  goodsWeight?: string;
}

export interface ValidateResult {
  ok: boolean;
  message?: string;
  rowErrors?: GoodsSpecRowErrors[];
}

export const useGoodsSpecValidate = (rows: Ref<GoodsSpecRow[]>) => {
  /** 校验单行 */
  const validateRow = (row: GoodsSpecRow): GoodsSpecRowErrors => {
    const errors: GoodsSpecRowErrors = {};

    if (!row.goodsSpecificationValue?.trim()) {
      errors.goodsSpecificationValue = '请输入单位规格';
    }

    if (!row.goodsWeight) {
      errors.goodsWeight = '请输入商品重量';
    }

    if (!row.goodsPrice) {
      errors.goodsPrice = '请输入销售价';
    } else if (isNaN(Number(row.goodsPrice)) || Number(row.goodsPrice) <= 0) {
      errors.goodsPrice = '销售价必须为大于 0 的数字';
    }

    if (row.goodsStock === '' || row.goodsStock === null) {
      errors.goodsStock = '请输入可用库存';
    } else if (!Number.isInteger(Number(row.goodsStock)) || Number(row.goodsStock) < 0) {
      errors.goodsStock = '可用库存必须为非负整数';
    }

    return errors;
  };

  /** 校验整表 */
  const validateAll = (): ValidateResult => {
    const rowErrors = rows.value.map(validateRow);

    const hasRowError = rowErrors.some((err) => Object.keys(err).length > 0);
    if (hasRowError) {
      return {
        ok: false,
        rowErrors,
        message: '请检查并修正规格中的错误'
      };
    }

    const hasEnabled = rows.value.some((r) => r.status === 1);
    if (!hasEnabled) {
      return {
        ok: false,
        message: '必须启用至少一个规格'
      };
    }

    return { ok: true };
  };

  return {
    validateRow,
    validateAll
  };
};
