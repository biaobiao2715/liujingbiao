/**
 * 注册供应商
 */
import request from '@/utils/request';

// 获取字典数据
export function getPurchaserTypeDict(dictType?: string) {
  return request({
    url: `/system/dict/data/type1/${dictType}`,
    method: 'get'
  });
}

/**
 * 供应商信息注册
 * @param data
 */
export const enterpriseRegister = (data: any) => {
  return request({
    url: '/baseEnterpriseInfo/enterpriseRegister',
    method: 'put',
    data: data
  });
};
