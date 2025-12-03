import request from '@/utils/request';

// 查询案件类型列表
export const fetchCaseTypeList = (params: any) =>
  request({
    url: '/safeguard-server/case/list',
    method: 'get',
    params
  });

// 查询案件类型下拉选项
export const fetchCaseTypeOptions = (params?: any) =>
  request({
    url: '/safeguard-server/case/caseList',
    method: 'get',
    params
  });

// 启用/禁用案件类型
export const enableAndDisabledCaseType = (id: string, status: string) =>
  request({
    url: `/safeguard-server/case/enableAndDisabled/${id}`,
    method: 'get',
    params: { status }
  });

// 新增案件类型
export const createCaseType = (data: any) =>
  request({
    url: '/safeguard-server/case',
    method: 'post',
    data
  });

// 案件类型详情
export const getCaseTypeDetail = (id: string) =>
  request({
    url: `/safeguard-server/case/${id}`,
    method: 'get'
  });

// 更新案件类型
export const updateCaseType = (data: any) =>
  request({
    url: '/safeguard-server/case',
    method: 'put',
    data
  });
