import request from '@/utils/request';


/**
 * 获取问答列表
 */
export function getChatQuestionsList(data: any) {
  return request({
    url: '/skill-server/chatQuestions/list',
    method: 'get',
    params: data
  });
}



/**
 * 初始化问答
 */
export function initChatQuestions(chatId: string) {
  return request({
    url:  `/skill-server/chatQuestions/init?chatId=${chatId}`,
    method: 'get',
  });
}

/**
 * 问答
 */
export function chatCompletion(data: any) {
  return request({
    url: '/skill-server/chatQuestions/chatCompletion',
    method: 'post',
    data
  });
}

/**
 * 获取问答记录
 */
export function getChatQuestionDetail(data: any) {
  return request({
    url: '/skill-server/chatQuestions/getChatRecords',
    method: 'post',
    data
  });
}

/**
 * 删除问答记录
 */
export function deleteChatRecord(id: string) {
  return request({
    url: `/skill-server/chatQuestions/${id}`,
    method: 'delete',
  });
}

