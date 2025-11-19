// 风险案例模块的公共接口
import request from '@/utils/request';

/* 查询保险产品版本列表
 */
export function getInsuranceProductsVersionList(data: any) {
  return request({
    url: '/credit-server/insuranceProductsVersion/list',
    method: 'get',
    params: data
  });
}

/**
 * 获取保险产品版本详情
 */
export function getInsuranceProductsVersion(id: number | string) {
  return request({
    url: `/credit-server/insuranceProductsVersion/${id}`,
    method: 'get'
  });
}
