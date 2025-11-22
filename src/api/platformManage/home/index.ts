import request from '@/utils/request';

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

