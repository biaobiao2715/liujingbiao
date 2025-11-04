/**
 * 维权白皮书管理API
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 白皮书查询参数接口
export interface WhitePaperListQuery {
  pageNum: number;
  pageSize: number;
  paperTitle?: string; // 白皮书标题
  paperStatus?: string; // 状态: 0停用 1启用
  beginTime?: string; // 开始时间
  endTime?: string; // 结束时间
  orderByColumn?: string; // 排序列
  isAsc?: string; // 排序的方向desc或者asc
}

// 白皮书列表项接口
export interface WhitePaperItem {
  id: string | number;
  tenantId?: string;
  paperNo?: string;
  paperTitle: string; // 白皮书标题
  paperType?: string; // 白皮书类型
  paperStatus: string; // 状态: 0停用 1启用
  currentVersion: string; // 当前版本
  remark?: string; // 备注
  sortOrder?: number;
  createDept?: number;
  createBy?: number;
  createTime?: string; // 创建时间
  updateBy?: number;
  updateTime?: string;
  viewCount?: number; // 浏览量
  downloadCount?: number; // 下载量
  historyVersionsList?: any[]; // 历史版本列表
}

// 白皮书列表响应接口
export interface WhitePaperListResponse {
  code: number;
  msg: string;
  rows: WhitePaperItem[];
  total: number;
}

// 白皮书详情接口
export interface WhitePaperDetail extends WhitePaperItem {
  content?: string; // 内容
  attachment?: string; // 附件
  ossVoList?: Array<{
    ossId: number;
    fileName?: string;
    originalName?: string;
    fileSuffix?: string;
    fileSize?: string;
    url?: string;
    version?: string;
  }>;
}

// 白皮书详情响应接口
export interface WhitePaperDetailResponse {
  code: number;
  msg: string;
  data: WhitePaperDetail;
}

/**
 * 获取白皮书列表
 */
export function getWhitePaperList(query: WhitePaperListQuery): AxiosPromise<WhitePaperListResponse> {
  return request({
    url: '/skill-server/skill/whitePaper/list',
    method: 'get',
    params: query
  });
}

/**
 * 获取白皮书详情
 */
export function getWhitePaperDetail(id: string | number): AxiosPromise<WhitePaperDetailResponse> {
  return request({
    url: `/skill-server/skill/whitePaper/${id}`,
    method: 'get'
  });
}

/**
 * 新增白皮书
 */
export function addWhitePaper(data: any): AxiosPromise<any> {
  return request({
    url: '/skill-server/skill/whitePaper',
    method: 'post',
    data: data
  });
}

/**
 * 编辑白皮书
 */
export function editWhitePaper(data: any): AxiosPromise<any> {
  return request({
    url: '/skill-server/skill/whitePaper',
    method: 'put',
    data: data
  });
}

/**
 * 删除白皮书
 */
export function deleteWhitePaper(ids: (string | number)[]): AxiosPromise<any> {
  return request({
    url: `/skill-server/skill/whitePaper/${ids.join(',')}`,
    method: 'delete'
  });
}

/**
 * 启用白皮书
 */
export function enableWhitePaper(ids: (string | number)[]): AxiosPromise<any> {
  return request({
    url: `/skill-server/skill/whitePaper/enable/${ids.join(',')}`,
    method: 'put'
  });
}

/**
 * 禁用白皮书
 */
export function disableWhitePaper(ids: (string | number)[]): AxiosPromise<any> {
  return request({
    url: `/skill-server/skill/whitePaper/disable/${ids.join(',')}`,
    method: 'put'
  });
}

/**
 * 更新白皮书版本
 */
export function updateWhitePaperVersion(data: { id: string | number; version: string }): AxiosPromise<any> {
  return request({
    url: '/skill-server/skill/whitePaper/version',
    method: 'put',
    data: data
  });
}

