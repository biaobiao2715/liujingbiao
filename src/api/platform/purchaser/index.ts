/**
 * 采购商接口
 */

import request from '@/utils/request';
// 采购商注册
export function registerPurchaser(data?: any) {
  return request({
    url: '/basePurchaser/register',
    method: 'post'
  });
}
