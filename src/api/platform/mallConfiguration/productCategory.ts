import request from '@/utils/request';

// 商品分类列表

export function getProductCategoryList(data = {}) {
  return request({
    url: '/grain-sales/goodsCategory/list',
    method: 'get',
    params: data // GET 请求使用 params
  });
}

// 商品分类详情
export function getProductCategoryDetail(id: number) {
  return request({
    url: `/grain-sales/goodsCategory/${id}`,
    method: 'get'
  });
}

// 创建商品分类
export function createProductCategory(data: any) {
  return request({
    url: '/grain-sales/goodsCategory',
    method: 'post',
    data: data
  });
}

// 更新商品分类
export function updateProductCategory(data: any) {
  return request({
    url: `/grain-sales/goodsCategory`,
    method: 'put',
    data: data
  });
}

// 删除商品分类
export function deleteProductCategory(id: string) {
  return request({
    url: `/grain-sales/goodsCategory/${id}`,
    method: 'delete'
  });
}
