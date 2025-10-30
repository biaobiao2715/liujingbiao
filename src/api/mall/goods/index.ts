// 商城首页
import request from '@/utils/request';

// 商城首页商品列表
export function goodsList(data: any) {
  return request({
    url: 'grain-sales/mall/list',
    method: 'get',
    params: data
  });
}

// 商品详情
export function goodsDetail(id: number) {
  return request({
    url: `grain-sales/mall/${id}`,
    method: 'get'
  });
}

// 取消订单并发送消息给用户
export function sendCancelOrder(orderId: number) {
  return request({
    url: `grain-sales/mall/sendCancelOrder/${orderId}`,
    method: 'get'
  });
}

// 商品销售统计
export function productSalesStatistics() {
  return request({
    url: `grain-sales/mall/productSalesStatistics/`,
    method: 'get'
  });
}

// 商品价格对比
export function comparePrices(data: any) {
  return request({
    url: `grain-sales/mall/comparePrices`,
    method: 'get',
    params: data
  });
}
