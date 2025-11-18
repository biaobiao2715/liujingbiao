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