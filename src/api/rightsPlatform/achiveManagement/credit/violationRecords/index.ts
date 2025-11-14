/**
 * 企业接口
 */

import request from '@/utils/request';
// 查询企业信息列表(关联租户)
export function baseEnterpriseInfoList(query?: any) {
  console.log(query);
  return request({
    url: '/system/baseEnterpriseInfo/list',
    method: 'get',
    params: query
  });
}

// 获取企业信息详细信息
export function baseEnterpriseInfoId(id?: string) {
  return request({
    url: `/system/baseEnterpriseInfo/${id}`,
    method: 'get'
  });
}
// 获取企业信息详细信息(无租户)
export function baseEnterpriseInfoNoTenantListId(query?: any) {
  return request({
    url: '/system/baseEnterpriseInfo/getInfoByNoTenant/{id}',
    method: 'get',
    params: query
  });
}

// 导出企业信息列表
export function baseEnterpriseInfoExport(data?: any) {
  return request({
    url: '/system/baseEnterpriseInfo/export',
    method: 'post',
    data: data
  });
}

// 新增企业信息
export function baseEnterpriseInfoAdd(data?: any) {
  return request({
    url: '/system/baseEnterpriseInfo',
    method: 'post',
    data: data
  });
}

/**
 * 修改企业信息
 * @param data
 */
export const baseEnterpriseInfoUpdate = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo',
    method: 'put',
    data: data
  });
};

/**
 * 企业信息注册
 * @param data
 */
export const enterpriseRegister = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/enterpriseRegister',
    method: 'put',
    data: data
  });
};

/**
 * 企业信息修改（平台）
 * @param data
 */
export const enterpriseEdit = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/enterpriseEdit',
    method: 'put',
    data: data
  });
};

/**
 * 企业信息审核（平台）
 * @param data
 */
export const enterpriseReview = (data: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/enterpriseReview',
    method: 'put',
    data: data
  });
};

/**
 * 删除企业信息
 * @param data
 */
export const baseEnterpriseInfoDelete = (id: any) => {
  return request({
    url: '/system/baseEnterpriseInfo/' + id,
    method: 'delete'
  });
};

// 定义表单数据类型
export interface OssInfo {
  ossId?: number;
  fileName?: string;
  originalName?: string;
  url?: string;
  contentType?: string;
  size?: number;
}

export interface Attachment {
  id?: number;
  name?: string;
  fileType?: number | string;
  ossId?: number;
  remark?: string;
  // 可能存在的分拣标识字段（用于区分举报/申诉）
  scene?: any;
  stage?: any;
  bizType?: any;
  folderType?: any;
  category?: any;
  type?: any;
  fileBizType?: any;
  belongTo?: any;
  sourceType?: any;
  ossInfo?: OssInfo;
  [k: string]: any;
}

/**
 * 举报通道管理历史记录视图对象 hn_report_history
 */
export interface HnReportHistoryVo {
  hnCaseId?: number;
  hnReportId?: number;
  id?: number;
  rejectReason?: string;
  reportDescription?: string;
  reportTypeId?: number;
  status?: string;
  [property: string]: any;
}

/**
 * HnReportVo -> 用于详情展示
 */
export interface FormData {
  id?: number;
  // 案件/举报
  caseCode?: string;
  reportCode?: string;
  reportDescription?: string;
  reportGoodsCode?: string;
  reportGoodsName?: string;
  reportPersonId?: number;
  reportPersonName?: string;
  reportTypeId?: number;
  status?: string;

  // 审计/时间
  createBy?: number;
  createDept?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;

  // 案件类型与处理
  hnCaseId?: number;
  appealReason?: string; // 驳回申诉原因
  rejectReason?: string; // 驳回原因
  dealResult?: string; // 平台反馈处理结果
  userType?: string;

  // 历史记录
  hnReportHistoryList?: HnReportHistoryVo[];

  // 附件兼容字段（用于前端分拣图片/视频）
  folders?: Attachment[];
  reportFolders?: Attachment[];
  appealFolders?: Attachment[];
  reportAttachList?: Attachment[];
  appealAttachList?: Attachment[];
  reportFiles?: Attachment[];
  appealFiles?: Attachment[];
  reportMaterials?: Attachment[];
  appealMaterials?: Attachment[];
  reportList?: Attachment[];
  appealList?: Attachment[];
  reportEvidence?: Attachment[];
  appealEvidence?: Attachment[];

  // 新增：图片直返列表兼容（仅图片）
  sysOssLists?: RemoteFile[];
  reportSysOssLists?: RemoteFile[];
  appealSysOssLists?: RemoteFile[];
}

// sysOssLists 返回项
export interface RemoteFile {
  ossId?: number;
  name?: string;
  url?: string;
  originalName?: string;
  fileSuffix?: string;
  ext1?: string;
}
