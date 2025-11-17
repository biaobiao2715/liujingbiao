// 产品管理-信贷
import request from '@/utils/request';

// 信贷产品列表
export function creditProductList(data: any) {
  return request({
    url: 'credit-server/creditProductsVersion/list',
    method: 'get',
    params: data
  });
}

// 信贷产品详情
export function creditProductDetail(id: number | string) {
  return request({
    url: `credit-server/creditProductsVersion/${id}`,
    method: 'get'
  });
}

// 新增信贷产品
export function addCreditProduct(data: any) {
  return request({
    url: 'credit-server/creditProductsVersion',
    method: 'post',
    data: data
  });
}

// 编辑信贷产品
export function editCreditProduct(data: any) {
  return request({
    url: 'credit-server/creditProductsVersion',
    method: 'put',
    data: data
  });
}

// 删除信贷产品
export function deleteCreditProduct(ids: number | string) {
  return request({
    url: `credit-server/creditProductsVersion/${ids}`,
    method: 'delete'
  });
}


