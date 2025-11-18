// 风险案例模块的公共接口
import request from '@/utils/request';

/* 查询金融文章列表
 */
export function getCreditArticleList(data: any) {
  return request({
    url: '/credit-server/creditArticle/list',
    method: 'get',
    params: data
  });
}

/**
 * 获取金融文章详情
 */
export function getCreditArticle(id: number | string) {
  return request({
    url: `/credit-server/creditArticle/${id}`,
    method: 'get'
  });
}
