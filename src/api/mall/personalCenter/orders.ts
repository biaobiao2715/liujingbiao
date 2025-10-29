import request from '@/utils/request';
/**
 * 订单商品接口
 */

export function orderList(query?: any) {
  console.log(query);
  return request({
    url: 'grain-sales//order/page',
    method: 'get',
    params: query
  });
}

/**
 * 取消订单
 * @param id
 */
export function orderCancel(id: any) {
  return request({
    url: 'grain-sales/order/cancel/' + id,
    method: 'put'
  });
}

/**
 * 确认订单
 * @param id
 */
export function orderConfirm(id: any) {
  return request({
    url: 'grain-sales/order/confirm/' + id,
    method: 'put'
  });
}
