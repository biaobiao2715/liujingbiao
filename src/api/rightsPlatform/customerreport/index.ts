import request from '@/utils/request';

// 查询举报通道管理列表
export function getreportlist(data: any) {
  return request({
    url: '/safeguard-server/report/list',
    method: 'post',
    data
  });
}
/* 撤回 */
export function reportback(data: any) {
  return request({
    url: '/safeguard-server/report/back',
    method: 'post',
    data
  });
}
export function getreportdetail(id: any) {
  return request({
    url: `/safeguard-server/report/${id}`,
    method: 'get'
  });
}
/* 供应商申诉 */
export function reportappeal(data: any) {
  return request({
    url: `/safeguard-server/report/appeal`,
    method: 'post',
    data
  });
}
