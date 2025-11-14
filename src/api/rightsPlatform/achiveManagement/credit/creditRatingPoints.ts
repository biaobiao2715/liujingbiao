import request from '@/utils/request';

// 查询信用等级管理列表
export function getCreditRatingPointsList(query: any) {
  return request({
    url: '/safeguard-server/creditRating/list',
    method: 'get',
    params: query
  });
}

// 获取信用等级管理详细信息
export function getCreditRating(id: string) {
  return request({
    url: '/safeguard-server/creditRating/' + id,
    method: 'get'
  });
}

// 修改信用等级管理
export function updateCreditRating(data: any) {
  return request({
    url: '/safeguard-server/creditRating',
    method: 'put',
    data: data
  });
}
