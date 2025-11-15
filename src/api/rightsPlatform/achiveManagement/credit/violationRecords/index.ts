import request from '@/utils/request';

// 查询举报立案列表
export function getReportCaseFilingList(query: any) {
  return request({
    url: '/safeguard-server/reportCaseFiling/list',
    method: 'get',
    params: query
  });
}

// 获取举报立案详细信息
export function getReportCaseFilingDetail(id: number | string) {
  return request({
    url: `/safeguard-server/reportCaseFiling/${id}`,
    method: 'get'
  });
}

// ========== 接口类型（对齐后端文档） ==========
export interface RemoteOssVo {
  createBy?: number;
  createTime?: string;
  ext1?: string;
  fileName?: string;
  fileSuffix?: string;
  originalName?: string;
  ossId?: number;
  service?: string;
  url?: string;
  [property: string]: any;
}

export interface HnProtectionFiles {
  createBy?: number;
  createDept?: number;
  createTime?: string;
  delFlag?: string;
  fileName?: string;
  fileSize?: string | number;
  fileType?: string; // 0 图片 1 视频 2 文档 99 其他
  foreignId?: number;
  foreignType?: string;
  id?: number;
  originalName?: string;
  ossId?: number;
  ossInfo?: RemoteOssVo;
  params?: MapObject;
  remark?: string;
  tenantId?: string;
  updateBy?: number;
  updateTime?: string;
  versionNo?: string;
  [property: string]: any;
}

export interface MapObject {
  key?: { [key: string]: any };
  [property: string]: any;
}

export interface HnCaseProperty {
  createBy?: number;
  createDept?: number;
  createTime?: string;
  delFlag?: string;
  hnCaseId?: number;
  id?: number;
  params?: MapObject;
  propertyName?: string;
  tenantId?: string;
  updateBy?: number;
  updateTime?: string;
  [property: string]: any;
}

export interface HnCaseVo {
  basisName?: string;
  caseScore?: number;
  caseTypeCode?: string;
  caseTypeId?: number;
  createBy?: number;
  createByName?: string;
  currentVersion?: string;
  documentName?: string;
  id?: number;
  legalBasisList?: HnProtectionFiles[];
  legalDocumentId?: number;
  legalDocumentList?: HnProtectionFiles[];
  newBasisFile?: HnProtectionFiles;
  newDocumentFile?: HnProtectionFiles;
  propertyList?: HnCaseProperty[];
  status?: string;
  [property: string]: any;
}

export interface HnReportHistoryVo {
  appealFiles?: HnProtectionFiles[];
  hnCaseId?: number;
  hnReportId?: number;
  id?: number;
  rejectReason?: string;
  reportDescription?: string;
  reportTypeId?: number;
  status?: string;
  [property: string]: any;
}

export interface MapDate {
  key?: string;
  [property: string]: any;
}

export interface HnReportCaseFilingVo {
  appealReason?: string;
  caseCode?: string;
  caseScore?: number;
  caseType?: string;
  closeCaseTime?: string;
  contactName?: string;
  contactPhone?: string;
  createBy?: number;
  createByName?: string;
  createDept?: number;
  createTime?: string;
  creditLevel?: string;
  dealResult?: string;
  delFlag?: string;
  handleBack?: string;
  historyAppealList?: HnReportHistoryVo[];
  hnCase?: HnCaseVo;
  hnCaseId?: number;
  hnReportId?: number;
  id?: number;
  newAppealFile?: HnReportHistoryVo;
  rejectBack?: string;
  rejectReason?: string;
  reportCode?: string;
  reportDescription?: string;
  reporterName?: string;
  reportFiles?: HnProtectionFiles[];
  reportId?: number;
  reportPersonId?: number;
  reportType?: number;
  sore?: number;
  status?: string; // 1-处理中 2-已驳回 3-已结案
  statusAndDate?: MapDate[];
  tenantId?: string;
  updateBy?: number;
  updateTime?: string;
  [property: string]: any;
}

// 响应封装
export interface Response<T = any> {
  code?: number;
  data?: T;
  msg?: string;
  [property: string]: any;
}

// 兼容原有导出名
export type FormData = HnReportCaseFilingVo;

export type FileViewItem = { url: string; ossId?: string; originalName?: string; name?: string; sizeText?: string };
