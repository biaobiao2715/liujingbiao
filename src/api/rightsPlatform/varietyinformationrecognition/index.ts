
import request from '@/utils/request';

// 品种信息识别列表
export function getPinlist(data: any) {
  return request({
    url: '/safeguard-server/varietyRecognize/list',
    method: 'get',
    params: data
  });
}
/* 导出 */
export function reportExport(data: any) {
  return request({
    url: '/safeguard-server/varietyRecognize/export',
    method: 'post',
    data
  });
}
/* 获取品种信息识别详细信息 */
export function getreportDetail(id: any) {
  return request({
    url: `/safeguard-server/varietyRecognize/${id}`,
    method: 'get'
  });
}
/* 新增品种信息识别 */
export function reportAdela(data: any) {
  return request({
    url: `/safeguard-server/varietyRecognize`,
    method: 'post',
    data
  });
}
/* 修改品种信息识别 */
export function magiAppeal(data: any) {
  return request({
    url: `/safeguard-server/varietyRecognize`,
    method: 'put',
    data
  });
}
/* 删除品种信息 */
export function reportDetail(id: any) {
  return request({
    url: `/safeguard-server/varietyRecognize/${id}`,
    method: 'delete'
  });
}
/* 查询品种信息 */
export function reportGroupType() {
  return request({
    url: `/safeguard-server/varietyRecognize/groupType`,
    method: 'get',
   
  });
}

