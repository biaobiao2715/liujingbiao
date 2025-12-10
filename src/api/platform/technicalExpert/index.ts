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
   * 操作类型
   * 1：注册
   * 2：修改
   * 3：审核
   * 4：启用
   * 5：停用
   */
  optType: '1' | '2' | '3' | '4' | '5';
  hnBaseTechExpertInfoBo?: {
    expertName?: string;
    sex?: '0' | '1';
    birthDate?: string;
    graduationSchool?: string;
    major?: string;
    startStopStatus?: '0' | '1';
    id?: number;
    reviewRemark?: string;
    reviewStatus?: '99' | '1' | '2' | '3' | '4';
    folder?: {
      folderName?: string;
      folderType?: '0' | '1';
      folderPath?: string;
      ossBucketName?: string;
      ossObjectName?: string;
      ossUrl?: string;
    }[];
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
  return request({
    url: `/system/baseTechExpertInfo/${id}`,
    method: 'get'
  });
};
