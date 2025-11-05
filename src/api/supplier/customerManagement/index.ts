/**
 * 客户接口
 */

import request from '@/utils/request';
// 查询客户信息列表
export function customerList(data?: any) {
  return request({
    url: '/grain-sales/customerManage/list',
    method: 'post',
    data: data
  });
}

// 获取客户信息详细信息
export function customerId(id?: string) {
  return request({
    url: `/grain-sales/customerManage/${id}`,
    method: 'get'
  });
}

// 导出客户信息列表
export function customerExport(data?: any) {
  return request({
    url: '/grain-sales/customerManage/export',
    method: 'post',
    data: data
  });
}
