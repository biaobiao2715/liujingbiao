/**
 * 商品价格修改历史记录
 */

import request from '@/utils/request';

// 获取销售订单列表  查询订单
export function getorderList(query: any) {
  return request({
    url: '/grain-sales/order/list',
    method: 'get',
    params: query
  });
}
// 获取订单信息详细信息
export function getorderdetail(id?: string) {
  return request({
    url: `/grain-sales/order/${id}`,
    method: 'get'
  });
}
/* 取消订单 */
export function cancelorderapi(data:any) {
  return request({
    url: `/grain-sales/order/cancelSalesOrder`,
    method: 'put',
    data:data
  });
}
/* 修改人员信息与发货 */
export function modifypersonnel(data:any) {
  return request({
    url: `/grain-sales/order`,
    method: 'put',
    data:data
  });
}