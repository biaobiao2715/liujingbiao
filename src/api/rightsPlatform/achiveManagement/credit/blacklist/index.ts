import request from '@/utils/request';

// 查询黑名单管理列表
export function getBlackList(query: any) {
  return request({
    url: '/safeguard-server/creditRating/blackList',
    method: 'get',
    params: query
  });
}
