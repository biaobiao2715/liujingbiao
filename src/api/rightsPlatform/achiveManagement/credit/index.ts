import request from '@/utils/request';

// 查询信用列表
export function getCreditRatingList(query: any) {
  return request({
    url: '/safeguard-server/creditRating/enterInfoList',
    method: 'get',
    params: query
  });
}
