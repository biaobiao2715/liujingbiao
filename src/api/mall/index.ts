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
