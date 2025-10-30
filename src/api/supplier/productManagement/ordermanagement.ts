/**
 * 商品价格修改历史记录
 */

import request from '@/utils/request';

// 获取销售订单列表  查询订单
export function getorderList(data: any) {
  return request({
    url: '/grain-sales/order/list',
    method: 'get',
    params: data
  });
}