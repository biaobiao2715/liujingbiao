/**
 * 商品接口
 */

import request from '@/utils/request';
// 查询商品信息列表
export function goodsList(query?: any) {
  console.log(query);
  return request({
    url: '/grain-sales/goods/list',
    method: 'get',
    params: query
  });
}

// 获取商品信息详细信息
export function goodsId(id?: string) {
  return request({
    url: `/grain-sales/goods/${id}`,
    method: 'get'
  });
}

// 导出商品信息列表
export function goodsExport(data?: any) {
  return request({
    url: '/grain-sales/goods/export',
    method: 'post',
    data: data
  });
}
