/**
 * 注册采购商
 */
import request from '@/utils/request';

// 获取采购类型字典
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

// 检查手机号是否唯一
export function checkPhoneUnique(phoneNumber?: string) {
  return request({
    url: `/system/user/check-unique/${phoneNumber}`,
    method: 'get'
  });
}
