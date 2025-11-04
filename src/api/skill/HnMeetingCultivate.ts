import request from '@/utils/request';

// 查询培训会议管理列表
export function getHnMeetingCultivateList(query: any) {
  return request({
    url: '/skill-server/HnMeetingCultivate/list',
    method: 'get',
    params: query
  });
}
/* 详情 */
export function getHnMeetingCultivatedetail(query: any) {
  return request({
    url: `/skill-server/HnMeetingCultivate/queryDetail`,
    method: 'get',
    params: query,
  });
}
/*  新增 */
export function AddHnMeetingCultivate(data: any) {
  return request({
    url: '/skill-server/HnMeetingCultivate',
    method: 'post',
    data
  });
}
/* 修改 */
export function EditHnMeetingCultivate(data: any) {
  return request({
    url: '/skill-server/HnMeetingCultivate',
    method: 'put',
    data
  });
}
/* 查询技术专家信息列表(无租户) */
export function getcultivateExpertList(query: any) {
  return request({
    url: 'system/baseTechExpertInfo/list',
    method: 'get',
    params: query
  });
}
/* 查询法务专家基础信息列表(无租户) */
export function getbaseLegalExpertInfoList(query: any) {
  return request({
    url: 'system/baseLegalExpertInfo/listNoTenant',
    method: 'get',
    params: query
  });
}
/* 单个和批量删除 */
export function deleteHnMeetingCultivate(ids: any) {
   const idsString = ids.join(',');
  return request({
    url: `/skill-server/HnMeetingCultivate/${idsString}`,
    method: 'delete',
  });
}
/* 取消会议 */
export function cancelHnMeetingCultivate(params: any) {
   const idsString = params.ids.join(',');
  return request({
    url: `/skill-server/HnMeetingCultivate/${idsString}/${params.cancelReason}`,
    method: 'delete',
  });
}
/* 报名人员信息 */
export function getactivityEnrollList(query: any) {
  return request({
    url: 'skill-server/activityEnroll/list',
    method: 'get',
    params: query
  });
}