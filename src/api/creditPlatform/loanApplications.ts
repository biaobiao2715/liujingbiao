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
