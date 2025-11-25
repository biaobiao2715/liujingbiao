import request, { download } from '@/utils/request';

/**
 * 根据商品一级类目获取销量统计图
 */
export function getFirstLevelCategorySales(params?: Record<string, any>) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/firstLevelCategorySales',
    method: 'get',
    params
  });
}

/**
 * 根据商品一级类目获取销售额统计图
 */
export function getFirstLevelCategorySalesAmountTotal(params?: Record<string, any>) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/firstLevelCategorySalesAmountTotal',
    method: 'get',
    params
  });
}

/**
 * 获取订单履约率统计信息
 */
export function getOrdersComplianceRateInfo(params?: Record<string, any>) {
  return request({
    url: '/grain-sales/order/getOrdersComplianceRateInfo',
    method: 'get',
    params
  });
}

/**
 * 导出一级类目销量统计
 */
export function exportFirstLevelCategorySales(params?: Record<string, any>) {
  return download('/grain-sales/marketAnalysisDaily/firstLevelCategorySalesExport', params, '一级类目销量统计.xlsx');
}

/**
 * 导出一级类目销售额统计
 */
export function exportSalesAmountTotal(params?: Record<string, any>) {
  return download('/grain-sales/marketAnalysisDaily/salesAmountTotalExport', params, '一级类目销售额统计.xlsx');
}

/**
 * 导出订单履约率统计
 */
export function exportOrdersComplianceRate(params?: Record<string, any>) {
  return download('/grain-sales/order/exportOrdersComplianceRateInfo', params, '履约率统计.xlsx', 'get');
}

export interface CategorySalesQuery {
  createDept?: number;
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  id?: number;
  analysisYear?: number;
  analysisMonth?: number;
  analysisDay?: number;
  analysisDate?: string;
  goodsCategoryId?: number | string;
  goodsCategoryName?: string;
  provinceCode?: string;
  provinceName?: string;
  cityCode?: string;
  cityName?: string;
  regionCode?: string;
  regionName?: string;
  goodsPriceAvg?: string;
  yesterdaySales?: number;
  yesterdayTotalSales?: string;
  priceUpDown?: string;
  trend?: '0' | '1' | '2';
  priceActionDays?: '1' | '2' | '3';
  pricePredictionTimeframe?: '1' | '2' | '3' | '4';
  homeDaysType?: '1' | '2' | '3' | '4';
}

