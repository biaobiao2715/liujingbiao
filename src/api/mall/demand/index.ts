// 采购需求模块的公共接口
import request from '@/utils/request';
// 采购需求列表
export function demandList(data: any) {
  return request({
    url: 'grain-sales/hnPurchaseDemand/list',
    method: 'get',
    params: data
  });
}

// 采购需求池列表
export function purchaseList(data: any) {
  return request({
    url: 'grain-sales/hnPurchaseDemand/purchaseList',
    method: 'get',
    params: data
  });
}

// 新增采购需求
export function addPurchaseDemand(data: any) {
  return request({
    url: 'grain-sales/hnPurchaseDemand',
    method: 'post',
    data
  });
}

// 修改采购需求
export function updatePurchaseDemand(data: any) {
  return request({
    url: 'grain-sales/hnPurchaseDemand',
    method: 'put',
    data
  });
}

// 供需大厅热销推荐
export function hotRecommendationList(data: any) {
  return request({
    url: 'grain-sales/hnPurchaseDemand/hotRecommendationList',
    method: 'get',
    params: data
  });
}
