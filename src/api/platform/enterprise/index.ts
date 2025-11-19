/**
 * 企业接口
 */

import request from '@/utils/request';
// 查询企业信息列表(关联租户)
export function baseEnterpriseInfoList(query?: any) {
  console.log(query);
  return request({
    url: '/system/baseEnterpriseInfo/list',
    method: 'get',
    params: query
  });
}

// 获取企业信息详细信息
export function baseEnterpriseInfoId(id?: string) {
  return request({
    url: `/system/baseEnterpriseInfo/${id}`,
    method: 'get'
  });
}
// 获取企业信息详细信息(无租户)
export function baseEnterpriseInfoNoTenantListId(query?: any) {
  return request({
    url: '/system/baseEnterpriseInfo/getInfoByNoTenant/{id}',
    method: 'get',
    params: query
  });
}

// 导出企业信息列表
export function baseEnterpriseInfoExport(data?: any) {
  return request({
    url: '/system/baseEnterpriseInfo/export',
    method: 'post',
    data: data
  });
}

// 新增企业信息
export function baseEnterpriseInfoAdd(data?: any) {
  return request({
    url: '/system/baseEnterpriseInfo',
    method: 'post',
    data: data
  });
}

/**
 * 修改企业信息
 * @param data
 */
export const baseEnterpriseInfoUpdate = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo',
    method: 'put',
    data: data
  });
};

/**
 * 企业信息注册
 * @param data
 */
export const enterpriseRegister = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/enterpriseRegister',
    method: 'put',
    data: data
  });
};

/**
 * 企业信息修改（平台）
 * @param data
 */
export const enterpriseEdit = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/enterpriseEdit',
    method: 'put',
    data: data
  });
};

/**
 * 企业信息审核（平台）
 * @param data
 */
export const enterpriseReview = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/enterpriseReview',
    method: 'put',
    data: data
  });
};

/**
 * 删除企业信息
 * @param data
 */
export const baseEnterpriseInfoDelete = (id: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/' + id,
    method: 'delete'
  });
};


/**
 * 交易活跃度
 * @param data
 */
export const getTransactionInfo = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/getTransactionInfo',
    method: 'get',
    params: data
  });
};


/**
 * 违规记录
 * @param data
 */
export const getViolationInfo = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/getViolationInfo',
    method: 'get',
    params: data
  });
};
