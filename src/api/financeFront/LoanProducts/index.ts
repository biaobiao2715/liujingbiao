// 金融的公共接口
import request from '@/utils/request';

/* 查询金融文章列表
 */
export function getCreditArticleList(data: any) {
  return request({
    url: '/credit-server/creditArticle/list',
    method: 'get',
    params: data
  });
}

// 查询金融产品信息列表（无租户）
export function getCreditProductsVersionNoTenantList(data?: any) {
  return request({
    url: '/credit-server/creditProductsVersion/noTenant/list',
    method: 'get',
    params: data
  });
}

// 查询金融产品信息列表
export function getCreditProductsVersionNoTenantListInfo(data?: any) {
  return request({
    url: '/credit-server/creditProductsVersion/list',
    method: 'get',
    params: data
  });
}
/**
 * 获取金融文章详情
 */
export function getCreditArticle(id: number | string) {
  return request({
    url: `/credit-server/creditArticle/${id}`,
    method: 'get'
  });
}

/**
 * 获取金融产品信息详细信息(无租户)
 */
export function getCreditProductsVersionDetailNoTenant(id: number | string) {
  return request({
    url: `/credit-server/creditProductsVersion/noTenant/${id}`,
    method: 'get'
  });
}

// 获取企业信息
export function getBaseEnterpriseInfo() {
  return request({
    url: `/credit-server/loanApplications/baseEnterpriseInfo`,
    method: 'get'
  });
}

// 获取个人信息
export function getBasePurchaser() {
  return request({
    url: `/credit-server/loanApplications/basePurchaser`,
    method: 'get'
  });
}

// 个人贷款申请
export function applyPersonalLoan(data: any) {
  return request({
    url: '/credit-server/loanApplications/loanApplications/personal',
    method: 'post',
    data
  });
}
// 企业贷款申请
export function applyEnterpriseLoan(data: any) {
  return request({
    url: '/credit-server/loanApplications/loanApplications/enterprise',
    method: 'post',
    data
  });
}

// 获取贷款申请详细信息

export function getLoanApplicationsId(id: number | string) {
  return request({
    url: `/credit-server/loanApplications/${id}`,
    method: 'get'
  });
}
/**
 * 图片上传方法
 * @param data - 包含文件的对象，需包含 `file` 属性
 * @returns 图片上传结果的 Promise
 */
export const ossUploadImage = (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);

  return request({
    url: '/resource/oss/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/*
 * 获取贷款申请权限列表
 */
export function getLoanApplicationsPermissionList(data: any) {
  return request({
    url: '/credit-server/loanApplications/permissionList',
    method: 'get',
    params: data
  });
}
