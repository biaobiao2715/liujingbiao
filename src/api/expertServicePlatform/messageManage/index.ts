/**
 * 留言管理API
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 留言查询参数接口
export interface MessageListQuery {
  pageNum: number;
  pageSize: number;
  messageContent?: string; // 留言内容
  replyStatus?: string; // 回复状态：1-已回复 0-未回复
  messageStartTime?: string; // 留言开始时间
  messageEndTime?: string; // 留言结束时间
  replyStartTime?: string; // 回复开始时间
  replyEndTime?: string; // 回复结束时间
  orderByColumn?: string; // 排序列
  isAsc?: string; // 排序的方向desc或者asc
}

// 留言列表项接口
export interface MessageItem {
  id: string | number;
  messageNo?: string; // 留言编号
  messageContent: string; // 留言内容
  messageTime: string; // 留言时间
  userName?: string; // 留言用户名
  userPhone?: string; // 用户电话
  userEmail?: string; // 用户邮箱
  replyStatus: string; // 回复状态：1-已回复 0-未回复
  replyContent?: string; // 回复内容
  replyTime?: string; // 回复时间
  replyBy?: string; // 回复人
  createTime?: string;
  updateTime?: string;
}

// 留言列表响应接口
export interface MessageListResponse {
  code: number;
  msg: string;
  rows: MessageItem[];
  total: number;
}

// 留言详情接口
export interface MessageDetail extends MessageItem {
  remark?: string; // 备注
}

// 留言详情响应接口
export interface MessageDetailResponse {
  code: number;
  msg: string;
  data: MessageDetail;
}

/**
 * 获取留言列表
 */
export function getMessageList(query: MessageListQuery): AxiosPromise<MessageListResponse> {
  return request({
    url: '/skill-server/expert/message/list',
    method: 'get',
    params: query
  });
}

/**
 * 获取留言详情
 */
export function getMessageDetail(id: string | number): AxiosPromise<MessageDetailResponse> {
  return request({
    url: `/skill-server/expert/message/${id}`,
    method: 'get'
  });
}

/**
 * 回复留言
 */
export function replyMessage(data: { id: string | number; replyContent: string }): AxiosPromise<any> {
  return request({
    url: '/skill-server/expert/message/reply',
    method: 'post',
    data: data
  });
}

/**
 * 批量删除留言
 */
export function deleteMessage(ids: (string | number)[]): AxiosPromise<any> {
  return request({
    url: `/skill-server/expert/message/${ids.join(',')}`,
    method: 'delete'
  });
}

