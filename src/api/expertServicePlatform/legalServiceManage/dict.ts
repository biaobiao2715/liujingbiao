/**
 * 普法管理字典API
 */
import request from '@/utils/request';

// 获取普法管理类型字典
export function getLegalPopularizeTypeDict() {
  return request({
    url: '/system/dict/data/type1/legal_popularize_type',
    method: 'get'
  });
}

// 获取普法管理状态字典
export function getLegalPopularizeStatusDict() {
  return request({
    url: '/system/dict/data/type1/legal_popularize_status',
    method: 'get'
  });
}

// 通用字典获取方法
export function getDictData(dictType: string) {
  return request({
    url: `/system/dict/data/type1/${dictType}`,
    method: 'get'
  });
}
