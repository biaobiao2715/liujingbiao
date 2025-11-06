/**
 * 留言管理API
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 留言问题查询参数接口（根据API文档）
export interface MessageListQuery {
  pageNum: number;
  pageSize: number;
  // 基础字段
  createDept?: number; // 创建部门
  createBy?: number; // 创建者
  createTime?: string; // 创建时间
  updateBy?: number; // 更新者
  updateTime?: string; // 更新时间
  params?: {
    key?: {
      key?: any;
    };
  };
  // 问题相关字段
  id?: number; // 问题id
  questionNo?: string; // 问题编号
  userId?: number; // 提问用户id
  expertType?: string; // 专家类型：1技术专家 2法务专家（需要数据字典）
  expertId?: number; // 专家用户id
  questionTitle?: string; // 问题标题
  questionContent?: string; // 问题内容
  questionType?: string; // 问题类型：技术咨询 2法务咨询（需要数据字典）
  priorityLevel?: string; // 优先级：1低 2中 3高（需要数据字典）
  questionStatus?: string; // 问题状态：0待回答 1已回答 99已关闭（需要数据字典）
  isAnonymous?: string; // 是否匿名：0否 1是（需要数据字典）
  isPublic?: string; // 是否公开：0私密 1公开（需要数据字典）
  publishTime?: string; // 发布时间
  satisfactionScore?: number; // 满意度评分(1-5分)
  latestAnswerTime?: string; // 最新回答时间
  expireTime?: string; // 过期时间
  closeTime?: string; // 关闭时间
  closeUserId?: number; // 关闭用户id
  closeUserType?: string; // 关闭用户类型：1:技术专家 2:法务专家（需要数据字典）
  // 时间范围查询
  messageStartTime?: string; // 留言开始时间
  messageEndTime?: string; // 留言结束时间
  replyStartTime?: string; // 回复开始时间
  replyEndTime?: string; // 回复结束时间
  // 排序
  orderByColumn?: string; // 排序列
  isAsc?: string; // 排序的方向desc或者asc
  // 兼容旧字段
  messageContent?: string; // 留言内容（兼容旧接口）
  replyStatus?: string; // 回复状态（兼容旧接口）
}

// 问题附件接口
export interface QuestionImage {
  ossId?: number; // oss主键
  name?: string; // 文件名称
  url?: string; // 文件地址
  originalName?: string; // 原名
  fileSuffix?: string; // 文件后缀名
  ext1?: string; // 扩展字段
}

// 留言问题列表项接口（根据API文档返回字段）
export interface MessageItem {
  id?: number; // 问题id
  questionNo?: string; // 问题编号
  userId?: number; // 提问用户id
  expertType?: string; // 专家类型：1技术专家 2法务专家（需要数据字典）
  expertId?: number; // 专家用户id
  questionTitle?: string; // 问题标题
  questionContent?: string; // 问题内容
  questionType?: string; // 问题类型：技术咨询 2法务咨询（需要数据字典）
  priorityLevel?: string; // 优先级：1低 2中 3高（需要数据字典）
  questionStatus?: string; // 问题状态：0待回答 1已回答 99已关闭（需要数据字典）
  isAnonymous?: string; // 是否匿名：0否 1是（需要数据字典）
  isPublic?: string; // 是否公开：0私密 1公开（需要数据字典）
  publishTime?: string; // 发布时间
  satisfactionScore?: number; // 满意度评分(1-5分)
  latestAnswerTime?: string; // 最新回答时间
  expireTime?: string; // 过期时间
  closeTime?: string; // 关闭时间
  closeUserId?: number; // 关闭用户id
  closeUserType?: string; // 关闭用户类型：1:技术专家 2:法务专家（需要数据字典）
  questionImage?: QuestionImage[]; // 问题附件
  hnCommonRelevanceFilesVos?: any[]; // 问题附件（另一种格式）
  hnAnswerVoList?: any[]; // 问题集合（回复列表）
  replyCount?: number; // 回复次数
  // 兼容旧字段
  messageContent?: string; // 留言内容（兼容旧字段，映射questionContent）
  messageTime?: string; // 留言时间（兼容旧字段，映射publishTime）
  replyTime?: string; // 回复时间（兼容旧字段，映射latestAnswerTime）
  replyStatus?: string; // 回复状态（兼容旧字段，根据questionStatus或是否有回复判断）
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
 * 获取留言问题列表（查询留言问题列表）
 * API路径：GET /skill-server/question/list
 */
export function getMessageList(query: MessageListQuery): AxiosPromise<MessageListResponse> {
  return request({
    url: '/skill-server/question/list',
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

