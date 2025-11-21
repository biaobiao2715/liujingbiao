import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { OtherCaseVO, OtherCaseForm, OtherCaseQuery } from '@/api/safeguard-server/otherCase/types';

/**
 * 查询其他渠道案件列表
 * @param query
 * @returns {*}
 */

export const listOtherCase = (query?: OtherCaseQuery): AxiosPromise<OtherCaseVO[]> => {
  return request({
    url: '/safeguard-server/otherCase/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询其他渠道案件详细
 * @param id
 */
export const getOtherCase = (id: string | number): AxiosPromise<OtherCaseVO> => {
  return request({
    url: '/safeguard-server/otherCase/' + id,
    method: 'get'
  });
};

/**
 * 新增其他渠道案件
 * @param data
 */
export const addOtherCase = (data: OtherCaseForm) => {
  return request({
    url: '/safeguard-server/otherCase',
    method: 'post',
    data: data
  });
};

/**
 * 修改其他渠道案件
 * @param data
 */
export const updateOtherCase = (data: OtherCaseForm) => {
  return request({
    url: '/safeguard-server/otherCase',
    method: 'put',
    data: data
  });
};

/**
 * 删除其他渠道案件
 * @param id
 */
export const delOtherCase = (id: string | number | Array<string | number>) => {
  return request({
    url: '/safeguard-server/otherCase/' + id,
    method: 'delete'
  });
};
