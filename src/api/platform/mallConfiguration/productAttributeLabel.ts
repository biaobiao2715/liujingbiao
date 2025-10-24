import request from '@/utils/request';

// 商品属性列表 保障+功能+品牌：
export function getProductAttributesList(data: any) {
  return request({
    url: '/grain-sales/goodsAttributes/list',
    method: 'get',
    params: data
  });
}
// 商品属性所有数据 保障+功能+品牌：
export function goodsAttributesAllList(data: Record<string, any> = {}) {
  return request({
    url: '/grain-sales/goodsAttributes/allList',
    method: 'get',
    params: data
  });
}

// 商品属性详情
export function getProductAttributeDetail(id: number) {
  return request({
    url: `/grain-sales/goodsAttributes/${id}`,
    method: 'get'
  });
}

// 删除商品属性
export function deleteProductAttribute(ids: number[]) {
  return request({
    url: `/grain-sales/goodsAttributes/${ids.join(',')}`,
    method: 'delete'
  });
}

// 修改商品属性
export function updateProductAttribute(data: any) {
  return request({
    url: `/grain-sales/goodsAttributes`,
    method: 'put',
    data: data
  });
}

// 创建商品属性
export function createProductAttribute(data: any) {
  return request({
    url: '/grain-sales/goodsAttributes',
    method: 'post',
    data: data
  });
}
