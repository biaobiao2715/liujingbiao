// 风险案例模块的公共接口
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
/**
 * 获取金融文章详情
 */
export function getCreditArticle(id: number | string) {
  return request({
    url: `/credit-server/creditArticle/${id}`,
    method: 'get'
  });
}

// 获取企业贷款信息
export function getEnterpriseLoanInfo(id: number | string) {
  return request({
    url: `/credit-server/loanApplications/entByUserId`,
    method: 'get'
  });
}

// 获取个人贷款信息
export function getPersonalLoanInfo(id: number | string) {
  return request({
    url: `/credit-server/loanApplications/perByUserId/${id}`,
    method: 'get'
  });
}
