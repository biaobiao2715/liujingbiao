// 风险案例模块的公共接口
import request from '@/utils/request';

/* 查询保险产品信息列表(无租户)
 */
export function getInsuranceProductsVersionList(data: any) {
  return request({
    url: '/credit-server/insuranceProductsVersion/noTenant/list',
    method: 'get',
    params: data
  });
}

/* 查询保险产品信息列表
 */
export function getInsuranceProductsVersionListInfo(data: any) {
  return request({
    url: '/credit-server/insuranceProductsVersion/list',
    method: 'get',
    params: data
  });
}

/**
 * 获取保险产品信息详细信息(无租户)
 */
export function getInsuranceProductsVersion(id: number | string) {
  return request({
    url: `/credit-server/insuranceProductsVersion/noTenant/${id}`,
    method: 'get'
  });
}
