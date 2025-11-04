/**
 * 普法活动管理API
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 普法活动查询参数接口
export interface ActivityListQuery {
  pageNum: number;
  pageSize: number;
  activityTitle?: string; // 活动标题
  activityStatus?: string; // 状态
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

// 普法活动项接口（列表项）- 与后端返回字段保持一致
export interface ActivityItem {
  id?: number; // 活动id
  tenantId?: string; // 租户编号
  activityNo?: string; // 活动编号
  activityTitle?: string; // 活动标题
  activityType?: string; // 活动类型
  activitySummary?: string; // 活动简介
  activityContent?: string; // 活动详情
  activityAddress?: string; // 活动地址
  activityContact?: string; // 活动联系人
  activityContactPhone?: string; // 活动联系人电话
  startTime?: string; // 开始时间
  endTime?: string; // 结束时间
  publishTime?: string; // 发布时间
  cancelReason?: string; // 取消原因
  activityStatus?: string; // 活动状态 (0:草稿, 1:待开始, 2:进行中, 3:已结束, 99:已取消)
  sortOrder?: number; // 排序
  createDept?: number; // 创建部门
  createBy?: number; // 创建者
  createTime?: string; // 创建时间
  updateBy?: number; // 更新者
  updateTime?: string; // 更新时间
  enrollCount?: number; // 报名人数
  publishUser?: string; // 发布人
  avatar?: number; // 发布人头像
  enrollList?: Array<any>; // 报名人员列表
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
    url: `/skill-server/law/activity/detail/${id}`,
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
 * @param ids 活动ID数组（array[integer]类型，通过Path参数传递）
 * API: DELETE /law/activity/remove/{ids}
 * 示例: DELETE /law/activity/remove/1,2,3
 */
export function deleteActivity(ids: (string | number)[]): AxiosPromise<any> {
  // 确保ids是数组，并且转换为字符串数组（用于URL拼接）
  const idsArray = Array.isArray(ids) ? ids : [ids];
  // 将ID数组转为逗号分隔的字符串，作为Path参数
  const idsString = idsArray.map(id => String(id)).join(',');
  
  return request({
    url: `/skill-server/law/activity/remove/${idsString}`,
    method: 'delete'
  });
}

/**
 * 取消普法活动
 * @param id 活动ID（integer类型，通过Path参数传递）
 * @param cancelReason 取消原因（必填，通过Query参数传递）
 * API: PUT /law/activity/cancel/{id}?cancelReason=xxx
 */
export function cancelActivity(id: string | number, cancelReason: string): AxiosPromise<any> {
  // 确保id是字符串或数字
  const activityId = String(id);
  
  return request({
    url: `/skill-server/law/activity/cancel/${activityId}`,
    method: 'put',
    params: {
      cancelReason: cancelReason.trim()
    }
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

