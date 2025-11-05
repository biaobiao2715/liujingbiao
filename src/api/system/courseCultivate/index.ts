import request from '@/utils/request';

// 查询培训课程管理列表
export function getCourseCultivateList(query: any) {
  return request({
    url: '/skill-server/courseCultivate/list',
    method: 'get',
    params: query
  });
}
/* 培训课程启用or停用 */
export function updateStatus(data: any) {
  return request({
    url: '/skill-server/courseCultivate/updateStatus',
    method: 'put',
    data
  });
}
/* 获取详情 */
export function getcourseCultivatequeryDetail(query: any) {
  return request({
    url: '/skill-server/courseCultivate/queryDetail',
    method: 'get',
    params: query
  });
}
/* 新增 */
export function courseCultivateadd(data: any) {
  return request({
    url: '/skill-server/courseCultivate/add',
    method: 'post',
    data:data,
  });
}
/* 编辑 */
export function courseCultivateupdate(data: any) {
  return request({
    url: '/skill-server/courseCultivate/update',
    method: 'put',
    data:data,
  });
}