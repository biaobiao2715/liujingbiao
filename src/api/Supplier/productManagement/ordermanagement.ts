/**
 * 商品价格修改历史记录
 */

import request from '@/utils/request';

// 分页查询销售订单列表
export function getorderpageList(data: any) {
  return request({
    url: '/grain-sales/order/page',
    method: 'get',
    params: data
  });
}

