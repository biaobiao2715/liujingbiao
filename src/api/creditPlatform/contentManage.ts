// 金融内容管理
import request from '@/utils/request';

// 查询金融文章列表
export function getCreditArticleList(data: any) {
  return request({
    url: '/credit-server/creditArticle/list',
    method: 'get',
    params: data
  });
}

// 获取金融文章详细信息
export function getCreditArticleDetail(id: number | string) {
  return request({
    url: `/credit-server/creditArticle/${id}`,
    method: 'get'
  });
}

// 新增金融文章
export function addCreditArticle(data: any) {
  return request({
    url: '/credit-server/creditArticle',
    method: 'post',
    data: data
  });
}

// 修改金融文章
export function updateCreditArticle(data: any) {
  return request({
    url: '/credit-server/creditArticle',
    method: 'put',
    data: data
  });
}

// 删除金融文章
export function deleteCreditArticle(data: { ids: (number | string)[] }) {
  return request({
    url: `/credit-server/creditArticle/${data.ids.join(',')}`,
    method: 'delete'
  });
}
