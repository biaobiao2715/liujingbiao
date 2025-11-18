// 商城模块的公共接口
import request from '@/utils/request';

/* 添加商品到收藏夹
收藏类型 ：1：商品 2：收藏企业 3：收藏文章
*/
export function addToFavorites(data: any) {
  return request({
    url: 'skill-server/skill/favorite',
    method: 'post',
    data: data
  });
}

/**
 * 检查商品是否收藏
收藏类型 ：1：商品 2：收藏企业 3：收藏文章 4：收藏课程 5：普法内容
 */

export function checkFavorite(data: any) {
  return request({
    url: 'skill-server/skill/checkFavorite',
    method: 'get',
    params: data
  });
}
