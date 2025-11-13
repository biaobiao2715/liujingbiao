// 产品管理-保险
import request from '@/utils/request';

// 保险产品列表
export function insuranceProductList(data: any) {
  return request({
    url: 'credit-platform/product/insurance/list',
    method: 'get',
    params: data
  });
}

// 保险产品详情
export function insuranceProductDetail(id: number | string) {
  return request({
    url: `credit-platform/product/insurance/${id}`,
    method: 'get'
  });
}

// 新增保险产品
export function addInsuranceProduct(data: any) {
  return request({
    url: 'credit-platform/product/insurance',
    method: 'post',
    data: data
  });
}

// 编辑保险产品
export function editInsuranceProduct(data: any) {
  return request({
    url: 'credit-platform/product/insurance',
    method: 'put',
    data: data
  });
}

// 删除保险产品
export function deleteInsuranceProduct(id: number | string) {
  return request({
    url: `credit-platform/product/insurance/${id}`,
    method: 'delete'
  });
}
