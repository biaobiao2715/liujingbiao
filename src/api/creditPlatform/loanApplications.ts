// 贷款申请管理
import request from '@/utils/request';

// 查询贷款申请列表
export function getloanApplicationsList(data: any) {
  return request({
    url: '/credit-server/loanApplications/list',
    method: 'get',
    params: data
  });
}
//企业信息
export function getEnterprise(data: any) {
  return request({
    url: '/credit-server/loanApplications/entByUserId',
    method: 'get',
    params: data
  });
}
//个人信息（路径参数传递用户ID）
export function getPersonal(id: string | number) {
  return request({
    url: `/credit-server/loanApplications/perByUserId/${id}`,
    method: 'get'
  });
}
// 获取剩余详情
export function getRemainingDetail(id: number | string) {
  return request({
    url: `/credit-server/loanApplications/${id}`,
    method: 'get',
  });
}
//查看产品详情
export function getProduct(id: number | string) {
  return request({
    url: `/credit-server/creditProductsVersion/noTenant/${id}`,
    method: 'get',
  });
}
//审核
export function auditLoanApplication(data: any) {
  return request({
    url: '/credit-server/loanApplications',
    method: 'post',
    data: data
  });
}
//文件上传
export function uploadFile(data: any) {
  return request({
    url: 'resource/oss/upload',
    method: 'post',
    data: data
  });
}