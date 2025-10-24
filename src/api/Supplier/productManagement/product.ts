/**
 * 商品接口
 */

import request from '@/utils/request';
// 查询商品信息列表
export function goodsList(query?: any) {
  console.log(query);
  return request({
    url: '/grain-sales/goods/list',
    method: 'get',
    params: query
  });
}

// 修改商品价格信息  
export function updateGoodsPrice(data?: any) {
  return request({
    url: '/grain-sales/goods/price',
    method: 'put',
    data: data
  });
}

// 获取商品信息详细信息
export function goodsId(id?: string) {
  return request({
    url: `/grain-sales/goods/${id}`,
    method: 'get'
  });
}

// 导出商品信息列表
export function goodsExport(data?: any) {
  return request({
    url: '/grain-sales/goods/export',
    method: 'post',
    data: data
  });
}

// 新增商品信息
export function goodsAdd(data?: any) {
  return request({
    url: '/grain-sales/goods',
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
    url: '/grain-sales/goods',
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
    url: '/grain-sales/goods/price',
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
    url: '/grain-sales/goods/' + id,
    method: 'delete'
  });
};

/**
 * 商品上架下架
 * @param data - 商品状态更新对象，格式: {goodsIds: string[], status: string}
 */
export const updateGoodsStatus = (data: {goodsIds: string[], status: string}) => {
  return request({
    url: '/grain-sales/goods/onAndShelves',
    method: 'put',
    data: data
  });
};


// 图片上传方法

/**
 * 图片上传方法
 * @param data - 包含文件的对象，需包含 `file` 属性
 * @returns 图片上传结果的 Promise
 */
export const ossUploadImage = (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);

  return request({
    url: '/resource/oss/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
