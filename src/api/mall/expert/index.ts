// 专家相关
import request from '@/utils/request';

// 技术专家列表（无租户）
export function technologyExpertList(data: any) {
  return request({
    url: 'system/baseTechExpertInfo/listNoTenant',
    method: 'get',
    params: data
  });
}

// 法律专家列表（无租户）
export function legalExpertList(data: any) {
  return request({
    url: 'system/baseLegalExpertInfo/listNoTenant',
    method: 'get',
    params: data
  });
}

// 获取技术专家详细信息（无租户）
export function technologyExpertDetail(id: string) {
  return request({
    url: `system/baseTechExpertInfo/noTenant/${id}`,
    method: 'get'
  });
}

// 获取法律专家详细信息（无租户）
export function legalExpertDetail(id: string) {
  return request({
    url: `system/baseLegalExpertInfo/noTenant/${id}`,
    method: 'get'
  });
}

// 查询留言问题列表
export function questionList(data: any) {
  return request({
    url: 'skill-server/question/list',
    method: 'get',
    params: data
  });
}

// 新增留言问题
export function addQuestion(data: any) {
  return request({
    url: 'skill-server/question',
    method: 'post',
    data: data
  });
}

// 获取留言问题详细信息
export function getQuestionDetail(id: string) {
  return request({
    url: `skill-server/question/${id}`,
    method: 'get'
  });
}

// 关闭留言
export function stopQuestion(id: string) {
  return request({
    url: `skill-server/question/stopQuestion/${id}`,
    method: 'delete'
  });
}
