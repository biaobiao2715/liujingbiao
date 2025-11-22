import request from '@/utils/request';

// 获取金融首页统计数据（顶部信息）
export function getDashboardStats() {
  return request({
    url: '/credit-server/loanApplications/listPageTop',
    method: 'get'
  });
}

// 获取金融首页折线图数据
export function getDashboardLineChart(params?: Record<string, any>) {
  return request({
    url: '/credit-server/loanApplications/listPageLineChart',
    method: 'get',
    params
  });
}
