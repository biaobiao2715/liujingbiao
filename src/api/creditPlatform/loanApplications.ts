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
//个人信息
export function getPersonal(data: any) {
  return request({
    url: '/credit-server/loanApplications/perByUserId',
    method: 'get',
    params: data
  });
}
// 获取剩余详情
export function getRemainingDetail(id: number | string) {
  return request({
    url: `/credit-server/loanApplications/${id}`,
    method: 'get',
  });
}
export const ossUpload = (data: { file: File }) => {
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