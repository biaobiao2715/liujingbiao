import request from '@/utils/request';

/**
 * 我的举报接口
 */

/**
 * 获取举报列表（分页查询）
 * @param query 查询参数
 */
export function reportList(params?: any) {
  return request({
    url: 'safeguard-server/report/list',
    method: 'get',
    params: params
  });
}

/**
 * 撤回举报
 * @param id 举报ID
 */
export function reportBack(data: any) {
  return request({
    url: 'safeguard-server/report/back',
    method: 'post',
    data: data
  });
}

/**
 * 举报材料详情
 * @param data 举报材料具体数据
 */
export function resubmitReportList(id: any) {
  return request({
    url: `/safeguard-server/report/${id}`,
    method: 'get'
  });
}

/**
 * 重新提交举报的上传材料全部数据
 * @param id 提交举报材料数据
 */
export function resubmitReportAll(data: any) {
  return request({
    url: '/safeguard-server/report/edit',
    method: 'put',
    data: data
  });
}

/**
 * 查看举报详情
 * @param id 举报ID
 */
export function reportDetail(id: any) {
  return request({
    url: 'rights-platform/report/' + id,
    method: 'get'
  });
}

/**
 * 撤回举报
 * @param id 举报ID
 */
export function withdrawReport(id: any) {
  return request({
    url: 'rights-platform/report/withdraw/' + id,
    method: 'put'
  });
}

/**
 * 重新提交举报
 * @param data 举报数据
 */
export function resubmitReport(data: any) {
  return request({
    url: 'rights-platform/report/resubmit',
    method: 'post',
    data: data
  });
}

/**
 * 提交举报
 * @param data 举报数据
 */
export function submitReport(data: any) {
  return request({
    url: 'rights-platform/report/submit',
    method: 'post',
    data: data
  });
}

// -------------------- 类型定义 --------------------

/**
 * 举报查询参数
 */
export interface ReportQueryParams {
  pageNum?: number;
  pageSize?: number;
  reportCode?: string;
  reportType?: string;
  caseCode?: string;
  reportGoods?: string;
  createTime?: string | null;
  status?: string;
}

/**
 * 举报信息
 */
export interface Report {
  id?: number;
  reportCode?: string;
  caseCode?: string;
  reportType?: string;
  reportGoods?: string;
  createTime?: string;
  status?: string;
  reviewStatus?: string;
  reviewRemark?: string;
  reportTarget?: string;
  reportDesc?: string;
  reportMaterials?: ReportMaterial[];
  [property: string]: any;
}

/**
 * 举报材料
 */
export interface ReportMaterial {
  id?: number;
  name?: string;
  url?: string;
  fileType?: string;
  ossId?: number;
  [property: string]: any;
}
