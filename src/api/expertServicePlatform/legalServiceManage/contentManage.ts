/**
 * 普法内容管理API
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 普法内容查询参数接口
export interface ContentListQuery {
  pageNum: number;
  pageSize: number;
  contentType?: string; // 内容类型:1法律法规2政策解读3案例分析4司法判决
  contentSummary?: string; // 内容简介
  contentStatus?: string; // 内容状态:0草稿1待审核2已发布3已下架4审核不通过99已关闭
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
  orderByColumn?: string; // 排序列
  isAsc?: string; // 排序的方向desc或者asc
  contentTitle?: string; // 普法内容标题（后端可能期望contentTitle而不是title）
}

// 普法内容响应接口
export interface ContentListResponse {
  code: number;
  msg: string;
  rows: ContentItem[];
  total: number;
}

// 普法内容项接口（列表项）
export interface ContentItem {
  id: number;
  contentNo?: string;
  contentTitle: string;
  contentType: string;
  contentLevel?: string;
  contentSummary?: string;
  contentStatus: string;
  publishTime?: string;
  viewCount?: number;
  downloadCount?: number;
  createTime?: string;
  updateTime?: string;
}

// 普法内容详情响应接口
export interface ContentDetailResponse {
  code: number;
  msg: string;
  data: ContentDetail;
}

// 普法内容详情接口
export interface ContentDetail {
  id: number;
  contentNo: string;
  contentTitle: string;
  contentType: string;
  contentLevel: string;
  contentSummary: string;
  contentContent: string;
  contentStatus: string;
  publishTime?: string;
  lawKeywords?: string;
  relatedLaws?: string;
  viewCount?: number;
  downloadCount?: number;
  authorId?: number;
  authorName?: string;
  createTime?: string;
  updateTime?: string;
  sysOssLists?: Array<{
    ossId: number;
    fileName?: string;
    originalName?: string;
    fileSuffix?: string;
    size?: number;
    url?: string;
  }>;
}

/**
 * 获取普法内容列表
 */
export function getContentList(query: ContentListQuery): AxiosPromise<ContentListResponse> {
  return request({
    url: '/skill-server/law/content/list',
    method: 'get',
    params: query
  });
}

/**
 * 获取普法内容详情
 */
export function getContentDetail(id: number): AxiosPromise<ContentDetailResponse> {
  return request({
    url: `/skill-server/law/content/detail/${id}`,
    method: 'get'
  });
}

/**
 * 新增普法内容
 */
export function addContent(data: Partial<ContentItem>): AxiosPromise<any> {
  return request({
    url: '/skill-server/law/content/add',
    method: 'post',
    data: data
  });
}

// /**
//  * 更新普法内容（通用更新接口，已弃用，使用editContent代替）
//  */
// export function updateContent(data: Partial<ContentItem>): AxiosPromise<any> {
//   return request({
//     url: '/skill-server/law/content/edit',
//     method: 'put',
//     data: data
//   });
// }

/**
 * 编辑普法内容（专用编辑接口）
 */
export function editContent(data: any): AxiosPromise<any> {
  return request({
    url: '/skill-server/law/content/edit',
    method: 'put',
    data: data
  });
}

/**
 * 删除普法内容
 */
export function deleteContent(ids: number[]): AxiosPromise<any> {
  return request({
    url: `/skill-server/law/content/remove/${ids.join(',')}`,
    method: 'delete'
  });
}

/**
 * 更新普法内容状态
 * @param data - 包含 ids（必需）、contentStatus（必需）以及其他占位字段（contentTitle、contentType、contentSummary）
 */
export function updateContentStatus(data: { 
  ids: number[]; 
  contentStatus: string;
  contentTitle?: string;
  contentType?: string;
  contentSummary?: string;
}): AxiosPromise<any> {
  return request({
    url: '/skill-server/law/content/status',
    method: 'put',
    data: data
  });
}

