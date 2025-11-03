import request from '@/utils/request';
/**
 * 问题接口
 */

export function questionList(query?: any) {
  console.log(query);
  return request({
    url: 'skill-server/question/list',
    method: 'get',
    params: query
  });
}

/**
 * 问题详情
 * @param id
 */
export function questionDetail(id: any) {
  return request({
    url: 'skill-server/question/' + id,
    method: 'get'
  });
}

/**
 * 问题停用
 * @param id
 */
export function questionStop(id: any) {
  return request({
    url: 'skill-server/question/stopQuestion/' + id,
    method: 'delete'
  });
}

export interface listStyle {
  id?: number;
  questionNo?: string;
  userId?: number;
  expertType?: string;
  expertId?: number;
  questionTitle?: string;
  questionContent?: string;
  questionType?: string;
  priorityLevel?: string;
  questionStatus?: string;
  isAnonymous?: string;
  isPublic?: string;
  publishTime?: string;
  satisfactionScore?: number;
  latestAnswerTime?: string;
  expireTime?: string;
  closeTime?: string;
  closeUserId?: number;
  closeUserType?: string;
  questionImage?: RemoteFile[];
  messageStartTime?: string;
  messageEndTime?: string;
  replyStartTime?: string;
  replyEndTime?: string;
  pageSize?: number;
  pageNum?: number;
  orderByColumn?: string;
  isAsc?: string;

  // 其他动态参数
  params?: Record<string, any>;
}

/**
 * RHnQuestionVo
 */
export interface HnQuestionVo {
  closeTime?: string;
  closeUserId?: number;
  closeUserType?: string;
  expertId?: number;
  expertType?: string;
  expireTime?: string;
  hnAnswerVoList?: HnAnswerVo[];
  hnCommonRelevanceFilesVos?: HnCommonRelevanceFilesVo[];
  id?: number;
  isAnonymous?: string;
  isPublic?: string;
  latestAnswerTime?: string;
  priorityLevel?: string;
  publishTime?: string;
  questionContent?: string;
  questionNo?: string;
  questionStatus?: string;
  questionTitle?: string;
  questionType?: string;
  satisfactionScore?: number;
  userId?: number;
  [property: string]: any;
}

/**
 * 留言回答视图对象 hn_answer
 */
export interface HnAnswerVo {
  answerContent?: string;
  answerType?: string;
  answerUserId?: number;
  expertType?: string;
  id?: number;
  parentAnswerId?: number;
  questionId?: number;
  replyTime?: string;
  [property: string]: any;
}

/**
 * 公共关联附件视图对象 hn_common_relevance_files
 */
export interface HnCommonRelevanceFilesVo {
  fileType?: string;
  foreignId?: number;
  foreignType?: string;
  id?: number;
  ossId?: number;
  remark?: string;
  remoteOssVos?: RemoteFile[];
  versionNo?: string;
  [property: string]: any;
}

/**
 * 文件信息
 */
export interface RemoteFile {
  ext1?: string;
  fileSuffix?: string;
  name?: string;
  originalName?: string;
  ossId?: number;
  url?: string;
  [property: string]: any;
}
