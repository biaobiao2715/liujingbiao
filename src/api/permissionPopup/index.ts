// 商城首页
import request from '@/utils/request';

// 商城首页商品列表
export function traceableCompany(data: any) {
  return request({
    url: 'grain-sales/traceableCompany',
    method: 'post',
    data: data
  });
}


