import request from '@/utils/request';
/**
 * 我的需求发布接口
 */

export function hnPurchaseDemandPurchaseList(query?: any) {
  console.log(query);
  return request({
    url: 'grain-sales/hnPurchaseDemand/purchaseList',
    method: 'get',
    params: query
  });
}

/**
 * 我的需求发布详情接口
 * @param id
 */
export function hnPurchaseDemandId(id: any) {
  return request({
    url: 'grain-sales/hnPurchaseDemand/' + id,
    method: 'get'
  });
}

/**
 * 报价接口
 * @param id
 */
export function hnPurchaseQuotePost(data: any) {
  return request({
    url: 'grain-sales/hnPurchaseQuote',
    method: 'post',
    data
  });
}

/**
 * 供应商报价列表
 */

export function hnPurchaseQuoteList(query?: any) {
  console.log(query);
  return request({
    url: 'grain-sales/hnPurchaseQuote/list',
    method: 'get',
    params: query
  });
}

// 采购需求类型
export interface HnPurchaseDemandVo {
  id?: number | string;
  demandNo?: string;
  userId?: number | string;
  demandTitle?: string;
  demandCategoryId?: number | string;
  demandDescription?: string;
  quantity?: number;
  unit?: string;
  budgetAmount?: number;
  priceRange?: string;
  deliveryDate?: string;
  deliveryProvinceCode?: string;
  deliveryProvince?: string;
  deliveryCityCode?: string;
  deliveryCity?: string;
  deliveryDistrictCode?: string;
  deliveryDistrict?: string;
  deliveryAddress?: string;
  contactPerson?: string;
  contactPhone?: string;
  demandStatus?: string;
  isUrgent?: string;
  isLongTerm?: string;
  publishTime?: string;
  completeTime?: string;
  name?: string;
  categoryName?: string;
  deliveryDay?: number;
  regionPath?: any;
}
