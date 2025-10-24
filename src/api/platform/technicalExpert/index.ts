/*
 * @Author: 李刘超
 * @Date: 2025-10-17 13:39:20
 * @LastEditTime: 2025-10-17 13:39:20
 * @Description: 技术专家列表
 * @LastEditors: 李刘超
 * @FilePath: /grain_sales_web/src/api/platform/technicalExpert/index.ts
 */

import request from '@/utils/request';
import { TechnicalExpertList, TechnicalExpertListRequest } from './types';
import { IPublicResult } from '@/api/types';
import { AxiosPromise } from 'axios';

export const getTechnicalExpertList = (query?: TechnicalExpertListRequest): Promise<IPublicResult<TechnicalExpertList>> => {
  return request({
    url: '/system/baseTechExpertInfo/list',
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
  hnBaseTechExpertInfoBo?: {  // 修复：将 hnBaseLegalExpertInfoBo 改为 hnBaseTechExpertInfoBo
    expertName?: string;
    sex?: '0' | '1';
    birthDate?: string;
    graduationSchool?: string;
    major?: string;
    startStopStatus?: '0' | '1';
    id?: number;
    reviewStatus?: '0' | '1' | '2' | '3' | '4' | '99';
  };
}

// 技术专家注册、审核、修改、启停
export const techUpdateOrSaveData = (data: TechUpdateOrSaveDataRequest): AxiosPromise<boolean> => {
  return request({
    url: '/system/baseTechExpertInfo/techUpdateOrSaveData',
    method: 'post',
    data
  });
};

// 查询技术专家详细信息
export const getTechnicalExpertDetail = (id: string): AxiosPromise<TechnicalExpertList> => {
  console.log(id, '1111');
  return request({
    url: `/system/baseTechExpertInfo/${id}`,
    method: 'get'
  });
};
