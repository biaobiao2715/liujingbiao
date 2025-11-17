import request from '@/utils/request';

// 获取金融首页统计数据
export function getDashboardStats() {
  return request({
    url: '/credit-server/loanApplications/dashboard',
    method: 'get'
  });
}
