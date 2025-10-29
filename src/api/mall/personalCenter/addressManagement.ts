import request from '@/utils/request';

export interface Address {
  id?: number;
  receiverName: string;
  receiverPhone: string;
  provinceCode?: string;
  province?: string;
  cityCode?: string;
  city?: string;
  regionCode?: string;
  region?: string;
  detailAddress: string;
  isDefault: '0' | '1';
  tag?: string;
  userId?: number;
  createTime?: string;
  updateTime?: string;
  regionPath?: [string?, string?, string?];
}

/**
 * 地址管理接口
 */

// 查询地址列表
export function userAddressList(query?: any) {
  console.log(query);
  return request({
    url: 'grain-sales/userAddress/page',
    method: 'get',
    params: query
  });
}

/**
 * 新增地址信息
 * @param data
 */
export const userAddressAdd = (data: Address) => {
  return request({
    url: 'grain-sales/userAddress/add',
    method: 'post',
    data
  });
};

/**
 * 更新地址信息
 * @param data
 */
export const userAddressUpdate = (data: Address) => {
  return request({
    url: 'grain-sales/userAddress/update',
    method: 'put',
    data
  });
};

/**
 * 设置默认地址
 * @param id
 */
export const userAddressSetDefault = (id: any) => {
  return request({
    url: 'grain-sales/userAddress/setDefault/' + id,
    method: 'put'
  });
};

/**
 * 删除地址信息
 * @param id
 */
export const userAddressDelete = (id: any) => {
  return request({
    url: 'grain-sales/userAddress/delete/' + id,
    method: 'delete'
  });
};
