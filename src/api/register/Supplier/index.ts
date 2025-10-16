/**
 * 注册企业
 */
import request from '@/utils/request';

// 获取字典数据
export function getPurchaserTypeDict(dictType?: string) {
  return request({
    url: `/system/dict/data/type1/${dictType}`,
    method: 'get'
  });
}

// 采购商注册
export function registerPurchaser(data?: any) {
  return request({
    url: '/system/basePurchaser/register',
    method: 'post',
    data: data
  });
}
