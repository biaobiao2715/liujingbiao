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

export const getLegalExpertList = (query?: LegalExpertListRequest): Promise<IPublicResult<LegalExpertList>> => {
  return request({
    url: '/system/baseLegalExpertInfo/list',
    method: 'get',
    params: query
  });
};
