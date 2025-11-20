import request from '@/utils/request';

// 查询知识库案件管理列表
export const fetchKnowledgeCaseList = (params: any) =>
  request({
    url: '/safeguard-server/knowledgeCaseContent/list',
    method: 'get',
    params
  });

// 查询知识库案件管理名称（下拉）
export const fetchKnowledgeCaseNames = () =>
  request({
    url: '/safeguard-server/knowledgeCaseContent/groupName',
    method: 'get'
  });

// 导出知识库案件管理列表
export const exportKnowledgeCaseList = (data: any) =>
  request({
    url: '/safeguard-server/knowledgeCaseContent/export',
    method: 'post',
    data,
    responseType: 'blob'
  });

// 获取知识库案件详情
export const fetchKnowledgeCaseDetail = (id: string | number) =>
  request({
    url: `/safeguard-server/knowledgeCaseContent/${id}`,
    method: 'get'
  });

// 新增知识库案件
export const addKnowledgeCase = (data: any) =>
  request({
    url: '/safeguard-server/knowledgeCaseContent',
    method: 'post',
    data
  });

// 修改知识库案件
export const updateKnowledgeCase = (data: any) =>
  request({
    url: '/safeguard-server/knowledgeCaseContent',
    method: 'put',
    data
  });

// 删除知识库案件
export const deleteKnowledgeCase = (ids: string | number | Array<string | number>) => {
  const idPath = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `/safeguard-server/knowledgeCaseContent/${idPath}`,
    method: 'delete'
  });
};

