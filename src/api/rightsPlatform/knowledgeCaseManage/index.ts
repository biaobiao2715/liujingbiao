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
// 接口文档：DELETE /safeguard-server/knowledgeCaseContent/{ids}
// Path参数：ids (array[integer]) - 主键串
export const deleteKnowledgeCase = (ids: string | number | Array<string | number>) => {
  // 确保ids始终是数组格式
  const idsArray = Array.isArray(ids) ? ids : [ids];
  // 过滤掉无效值并转换为字符串
  const validIds = idsArray.filter(id => id !== undefined && id !== null && id !== '');
  if (validIds.length === 0) {
    throw new Error('ids参数不能为空');
  }
  // 将数组转换为逗号分隔的字符串作为路径参数
  const idPath = validIds.join(',');
  return request({
    url: `/safeguard-server/knowledgeCaseContent/${idPath}`,
    method: 'delete'
  });
};

