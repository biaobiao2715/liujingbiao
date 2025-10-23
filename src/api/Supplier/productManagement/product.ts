/**
 * 商品接口
 */

import request from '@/utils/request';
// 查询商品信息列表
export function goodsList(query?: any) {
  console.log(query);
  return request({
    url: '/system/goods/list',
    method: 'get',
    params: query
  });
}

// 获取商品信息详细信息
export function goodsId(id?: string) {
  return request({
    url: `/system/goods/${id}`,
    method: 'get'
  });
}

// 导出商品信息列表
export function goodsExport(data?: any) {
  return request({
    url: '/system/goods/export',
    method: 'post',
    data: data
  });
}

// 新增商品信息
export function goodsAdd(data?: any) {
  return request({
    url: '/system/goods',
    method: 'post',
    data: data
  });
}
/**
 * 修改商品信息
 * @param data
 */
export const goodsUpdate = (data: any) => {
  return request({
    url: '/system/goods',
    method: 'put',
    data: data
  });
};

/**
 * 修改商品价格信息
 * @param data
 */
export const goodsUpdatePrice = (data: any) => {
  return request({
    url: '/system/goods/price',
    method: 'put',
    data: data
  });
};

/**
 * 删除商品信息
 * @param data
 */
export const goodsDelete = (id: any) => {
  return request({
    url: '/system/goods/' + id,
    method: 'delete'
  });
};

// 图片上传方法

/**
 * 图片上传方法
 * @param data - 包含文件的对象
 * @returns 图片上传结果的 Promise
 */
export const ossUploadImage = (data) => {
  return request({
    url: '/oss/upload',
    method: 'post',
    data: data,
    headers: {
      isToken: false,
      'Content-Type': 'multipart/form-data'
    }
  });
};
