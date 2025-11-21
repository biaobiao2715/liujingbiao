import request from '@/utils/request';

// 查询法律文书模版列表
export const fetchLegalDocumentList = (params: any) =>
  request({
    url: '/safeguard-server/legalDocument/list',
    method: 'get',
    params
  });

// 查询创建的法律文书模版数据
export const fetchCreateLegalDocumentList = () =>
  request({
    url: '/safeguard-server/legalDocument/documentList',
    method: 'get'
  });

// 删除法律文书模版
export const deleteLegalDocument = (id: string) =>
  request({
    url: `/safeguard-server/legalDocument/${id}`,
    method: 'delete'
  });

// 更新法律文书模版版本
export const updateLegalDocument = (data: any) =>
  request({
    url: '/safeguard-server/legalDocument',
    method: 'put',
    data
  });

// 新增法律文书模版
export const createLegalDocument = (data: any) =>
  request({
    url: '/safeguard-server/legalDocument',
    method: 'post',
    data
  });

// 法律文书详情
export const getLegalDocumentDetail = (id: string) =>
  request({
    url: `/safeguard-server/legalDocument/${id}`,
    method: 'get'
  });
