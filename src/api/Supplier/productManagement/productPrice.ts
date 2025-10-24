/**
 * 商品价格修改历史记录
 */

import request from '@/utils/request';

// 查询商品价格修改历史记录列表
export function getGoodsPriceHistoryList(data: any) {
  return request({
    url: '/grain-sales/goodsPriceHistory/list',
    method: 'get',
    params: data
  });
}

/**
 * 导出商品价格修改历史记录
 */
export function exportGoodsPriceHistory(data: any) {
  return request({
    url: '/grain-sales/goodsPriceHistory/export',
    method: 'post',
    responseType: 'blob',
    data
  });
}

/**
 * 获取商品价格修改历史记录详情
 */
export function getGoodsPriceHistoryDetail(id: number) {
  return request({
    url: `/grain-sales/goodsPriceHistory/${id}`,
    method: 'get'
  });
}

/**
 * 新增商品价格修改历史记录
 */
export function addGoodsPriceHistory(data: any) {
  return request({
    url: '/grain-sales/goodsPriceHistory',
    method: 'post',
    data
  });
}

/** 修改商品价格波动历史 */
export function updateGoodsPriceHistory(data: any) {
  return request({
    url: '/grain-sales/goodsPriceHistory',
    method: 'put',
    data
  });
}

/** 删除商品价格波动历史 */
export function deleteGoodsPriceHistory(ids: string) {
  return request({
    url: `/grain-sales/goodsPriceHistory/${ids}`,
    method: 'delete'
  });
}
