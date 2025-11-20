
import request from '@/utils/request';

// 查询举报通道管理列表
export function getreportlist(data: any) {
  return request({
    url: '/safeguard-server/report/list',
    method: 'get',
    params: data
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
/* 新增 */
export function reportadd(data: any) {
  return request({
    url: '/safeguard-server/report/add',
    method: 'post',
    data
  });
}
/* 修改 */
export function reportedit(data: any) {
  return request({
    url: '/safeguard-server/report/edit',
    method: '',
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
/* 查询举报分析 */
export function reportcount(data: any) {
  return request({
    url: `/safeguard-server/report/count`,
    method: 'post',
    data
  });
}
