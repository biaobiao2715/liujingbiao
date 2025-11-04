// src/api/mall/favorite.ts
import request from '@/utils/request';

// 查询商品信息列表
export function unifiedFavoriteList(data?: any) {
  return request({
    url: 'skill-server/skill/list',
    method: 'post',
    data
  });
}

// skill-server/skill/favorite
// 新增收藏
export function skillFavoriteAdd(data?: any) {
  return request({
    url: 'skill-server/skill/favorite',
    method: 'post',
    data
  });
}

/**
 * 取消收藏商品信息
 * @param data
 */
export const favoriteDelete = (data: any) => {
  return request({
    url: 'skill-server/skill/favorite',
    method: 'post',
    data
  });
};

export type FavoriteType = '1' | '2' | '3' | '4' | '5'; // 1商品 2企业 3文章 4普法内容 5培训课程

export interface FavoriteItem {
  // 审计
  createDept?: number;
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;

  // 主体
  id?: number; // 收藏id
  userId?: number; // 用户id
  favoriteCategoryId?: number; // 收藏分类id
  enterpriseId?: number; // 企业id

  // 商品相关（接口文档里 googs* 命名保持一致）
  googsId?: number; // 商品id
  goodsCode?: string; // 商品编号
  goodsCategoryId?: number; // 商品类目id
  goodsBrandId?: number; // 商品品牌id
  goodsSpecification?: string; // 商品规格（字典）
  goodsSpecificationId?: number | string; // 规格ID字符串

  // 冗余存储在收藏表的“目标信息”
  googsName?: string; // 收藏目标名称
  googsImage?: string; // 收藏目标图片
  googsImageUrl?: string; // 收藏目标图片
  googsPrice?: number; // 收藏时价格（商品收藏）
  productGuarantee?: Array<{
    attributeName?: string;
  }>; // 商品保障（字典）

  googsStatus?: string; // 商品状态（0下架 1上架）
  favoriteType?: FavoriteType; // 1商品 2企业 3文章

  // 可选：后端如果联表返回当前价格/状态，用于降价与上下架提示
  currentPrice?: number;
  currentStatus?: string; // 0下架 1上架
  address?: string; // 发货地
  spread?: string; // 差价

  // 文章/企业等其他扩展字段（按需加）
  articleId?: number;
  articleAuthor?: string;
  articleTitle?: string;
  articleCover?: string;
}
