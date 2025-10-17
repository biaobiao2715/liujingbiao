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

export const getTechnicalExpertList = (query?: TechnicalExpertListRequest): Promise<IPublicResult<TechnicalExpertList>> => {
  return request({
    url: '/system/baseTechExpertInfo/list',
    method: 'get',
    params: query
  });
};
