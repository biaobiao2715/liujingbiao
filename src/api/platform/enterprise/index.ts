/**
 * 企业接口
 */

import request from '@/utils/request';
// 企业列表
export function queryPageListByNoTenant(query?: any) {
  return request({
    url: '/baseEnterpriseInfo/queryPageListByNoTenant',
    method: 'get',
    params: query
  });
}
