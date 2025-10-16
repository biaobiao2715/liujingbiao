/*
 * @Author: 李刘超
 * @Date: 2025-10-15 16:49:49
 * @LastEditTime: 2025-10-15 16:49:49
 * @LastEditors: 李刘超
 * @FilePath: api/register/TechnicalExpert/index.ts
 */

import request from '@/utils/request';
import { UolodaImageResult } from '@/api/register/LegalExpert/types';
import { TechnicalExpert, TechnicalExpertRegisterResult } from './types';
import { AxiosPromise } from 'axios';

// 法务专家注册信息

export function technicalExpertInfoRegister(data: TechnicalExpert): AxiosPromise<TechnicalExpertRegisterResult> {
  const params = {
    ...data
  };
  return request({
    url: '/system/baseTechExpertInfo/register',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
