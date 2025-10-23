/*
 * @Author: 李刘超
 * @Date: 2025-10-17 14:47:03
 * @LastEditTime: 2025-10-17 14:47:03
 * @LastEditors: 李刘超
 * @Description: 法务专家列表
 * @FilePath: /grain_sales_web/src/api/platform/legalExpert/index.ts
 */
import request from '@/utils/request';
import { LegalExpertList, LegalExpertListRequest } from './types';
import { IPublicResult } from '@/api/types';
import { AxiosPromise } from 'axios';

export const reviewStatusMap = {
  '0': '待审核',
  '1': '审核通过',
  '2': '分配账号',
  '3': '分配权限',
  '4': '入驻成功',
  '99': '入驻失败'
};

export const getLegalExpertList = (query?: LegalExpertListRequest): Promise<IPublicResult<LegalExpertList>> => {
  return request({
    url: '/system/baseLegalExpertInfo/list',
    method: 'get',
    params: query
  });
};

interface TechUpdateOrSaveDataRequest {
  /**
   * 操作类型（审核状态）
   * 0：待审核
   * 1：审核通过
   * 2：分配账号
   * 3：分配权限
   * 4：入驻成功
   * 99：入驻失败
   */
  optType: '0' | '1' | '2' | '3' | '4' | '99';
  hnBaseLegalExpertInfoBo?: {
    expertName?: string;
    sex?: string;
    birthDate?: string;
    graduationSchool?: string;
    major?: string;
    startStopStatus?: '0' | '1';
    id?: number;
    reviewStatus?: '0' | '1' | '2' | '3' | '4' | '99';
  };
}
// 法务专家注册、审核、修改、启停
export const legalUpdateOrSaveData = (data: TechUpdateOrSaveDataRequest): AxiosPromise<boolean> => {
  return request({
    url: '/system/baseLegalExpertInfo/legalUpdateOrSaveData',
    method: 'post',
    data
  });
};

// 查询法务专家详细信息
export const getLegalExpertDetail = (id: string): AxiosPromise<LegalExpertList> => {
  return request({
    url: `/system/baseLegalExpertInfo/${id}`,
    method: 'get'
  });
};
