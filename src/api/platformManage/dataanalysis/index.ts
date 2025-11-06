import request from '@/utils/request';

// 专家指导数据分页信息
export function getqueryExpertStaticData(query: any) {
  return request({
    url: 'skill-server/question/queryExpertStaticData',
    method: 'get',
    params: query
  });
}
/* 专家指导静态数据总量 */
export function getexpertTotalStaticData() {
  return request({
    url: 'skill-server/question/expertTotalStaticData',
    method: 'get',
  });
}