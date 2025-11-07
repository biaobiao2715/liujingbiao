import request from '@/utils/request';

// 查询直播信息列表
export function gethnOnlineVideoList(query: any) {
  return request({
    url: '/skill-server/hnOnlineVideo/list',
    method: 'get',
    params: query
  });
}
/* 培训课程启用or停用 */
export function updateStatus(data: any) {
  return request({
    url: '/skill-server/hnOnlineVideo/updateStatus',
    method: 'put',
    data
  });
}
/* 获取详情 */
export function gethnOnlineVideoDetail(id: any) {
  return request({
    url: `/skill-server/hnOnlineVideo/${id}`,
    method: 'get',
  });
}
/* 新增 */
export function hnOnlineVideoadd(data: any) {
  return request({
    url: '/skill-server/hnOnlineVideo',
    method: 'post',
    data:data,
  });
}
/* 编辑 */
export function hnOnlineVideoupdate(data: any) {
  return request({
    url: '/skill-server/hnOnlineVideo',
    method: 'put',
    data:data,
  });
}
/* 删除 */
export function hnOnlineVideodelete(ids: any) {
  return request({
    url: `/skill-server/hnOnlineVideo/${ids.join(',')}`,
    method: 'delete',
  });
}