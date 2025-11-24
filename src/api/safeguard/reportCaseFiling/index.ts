import request from '@/utils/request';

// 催促处理
export function urgeReportCaseFiling(data: any) {
  return request({
    url: '/safeguard-server/reportCaseFiling/urge',
    method: 'put',
    data
  });
}

// 待处理-编辑
export function editReportCaseFiling(data: any) {
  return request({
    url: '/safeguard-server/reportCaseFiling/needHandle',
    method: 'put',
    data
  });
}

// 申诉处理-编辑
export function editAppealReportCaseFiling(data: any) {
  return request({
    url: '/safeguard-server/reportCaseFiling/appealHandle',
    method: 'put',
    data
  });
}

// 查询举报立案列表
export function getReportCaseFilingList(query: any) {
  return request({
    url: '/safeguard-server/reportCaseFiling/list',
    method: 'get',
    params: query
  });
}

// 获取举报立案详细信息(不包含 待处理、已撤回、已驳回 状态)
export function getReportCaseFilingDetail(id: number | string) {
  return request({
    url: `/safeguard-server/reportCaseFiling/${id}`,
    method: 'get'
  });
}

// 获取举报立案详细信息(待处理、已撤回、已驳回 状态)
export function getPendingReportCaseFilingDetail(id: number | string) {
  return request({
    url: `/safeguard-server/reportCaseFiling/pending/${id}`,
    method: 'get'
  });
}

// 查询举报通道列表
export function getReportChannelList(query: any) {
  return request({
    url: '/safeguard-server/reportCaseFiling/reportList',
    method: 'get',
    params: query
  });
}

// 详情页获取申诉文件
export function getAppealFiles(id: number | string) {
  return request({
    url: `/safeguard-server/reportCaseFiling/lookDetail/${id}`,
    method: 'get'
  });
}
