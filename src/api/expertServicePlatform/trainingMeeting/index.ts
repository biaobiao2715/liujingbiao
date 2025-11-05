import request from '@/utils/request';
/**
 * 查询会议记录列表
 * GET skill-server/cultivateExpert/list
 * @param params cultivateExpertQuery 查询参数（含分页与时间范围）
 */
export function listHnMeetingCultivate(params: any) {
  return request({
    url: 'skill-server/cultivateExpert/expert/list',
    // url: 'skill-server/HnMeetingCultivate/list',
    method: 'get',
    params
  });
}

/**
 * 获取文章详情
 * GET skill-server/cultivateExpert/{id}
 * @param id number|string 文章id
 */
export function getcultivateExpert(params: any) {
  return request({
    url: `skill-server/HnMeetingCultivate/queryDetail`,
    method: 'get',
    params
  });
}

// 会议专家  foreignId筛选
export function cultivateExpertList(params: any) {
  return request({
    url: 'skill-server/cultivateExpert/list',
    method: 'get',
    params
  });
}

// 会议报名人  foreignId筛选
export function activityEnrollList(params: any) {
  return request({
    url: 'skill-server/activityEnroll/list',
    method: 'get',
    params
  });
}
