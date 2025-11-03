/**
 * 普法活动管理API
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 普法活动查询参数接口
export interface ActivityListQuery {
  pageNum: number;
  pageSize: number;
  title?: string; // 活动标题
  status?: string; // 状态
  activityType?: string; // 活动类型
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
  orderByColumn?: string; // 排序列
  isAsc?: string; // 排序的方向desc或者asc
}

// 普法活动响应接口
export interface ActivityListResponse {
  code: number;
  msg: string;
  rows: ActivityItem[];
  total: number;
}

// 普法活动项接口（列表项）
export interface ActivityItem {
  id: number;
  title: string; // 活动标题
  activityType: string; // 活动类型
  startTime: string; // 开始时间
  endTime: string; // 结束时间
  address: string; // 活动地址
  contactPerson: string; // 联系人
  contactInfo: string; // 联系方式
  registrationCount?: number; // 报名人数
  publishTime?: string; // 发布时间
  viewCount?: number; // 浏览量
  status: string; // 状态
  createTime?: string;
  updateTime?: string;
}

// 普法活动详情响应接口
export interface ActivityDetailResponse {
  code: number;
  msg: string;
  data: ActivityDetail;
}

// 普法活动详情接口
export interface ActivityDetail extends ActivityItem {
  activityContent?: string; // 活动内容
  activityDescription?: string; // 活动描述
  maxParticipants?: number; // 最大参与人数
  organizerId?: number; // 组织者ID
  organizerName?: string; // 组织者名称
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
 * 获取普法活动列表
 */
export function getActivityList(query: ActivityListQuery): AxiosPromise<ActivityListResponse> {
  return request({
    url: '/skill-server/law/activity/list',
    method: 'get',
    params: query
  });
}

/**
 * 获取普法活动详情
 */
export function getActivityDetail(id: string | number): AxiosPromise<ActivityDetailResponse> {
  return request({
    url: `/skill-server/law/activity/${id}`,
    method: 'get'
  });
}

/**
 * 新增普法活动
 */
export function addActivity(data: Partial<ActivityItem>): AxiosPromise<any> {
  return request({
    url: '/skill-server/law/activity/add',
    method: 'post',
    data: data
  });
}

/**
 * 编辑普法活动
 */
export function editActivity(data: any): AxiosPromise<any> {
  return request({
    url: '/skill-server/law/activity/edit',
    method: 'put',
    data: data
  });
}

/**
 * 删除普法活动
 */
export function deleteActivity(ids: (string | number)[]): AxiosPromise<any> {
  return request({
    url: `/skill-server/law/activity/${ids.join(',')}`,
    method: 'delete'
  });
}

/**
 * 取消普法活动
 */
export function cancelActivity(id: string | number): AxiosPromise<any> {
  return request({
    url: `/skill-server/law/activity/cancel/${id}`,
    method: 'put'
  });
}

/**
 * 更新普法活动状态
 */
export function updateActivityStatus(data: { 
  ids: number[]; 
  status: string;
}): AxiosPromise<any> {
  return request({
    url: '/skill-server/law/activity/status',
    method: 'put',
    data: data
  });
}

