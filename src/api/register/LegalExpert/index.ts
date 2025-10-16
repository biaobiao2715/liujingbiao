/*
 * @Author: 李刘超
 * @Date: 2025-10-15 16:49:49
 * @LastEditTime: 2025-10-15 16:49:49
 * @LastEditors: 李刘超
 * @FilePath: api/register/LegalExpert/index.ts
 */

import request from '@/utils/request';
import { LegalExpert, LegalExpertRegisterResult } from './types';
import { UplodaImageResult } from '@/api/register/types';
import { AxiosPromise } from 'axios';

// 法务专家注册信息

export function legalExpertInfoRegister(data: LegalExpert): AxiosPromise<LegalExpertRegisterResult> {
  const params = {
    ...data
  };
  return request({
    url: '/baseLegalExpertInfo/register',
    method: 'post',
    data: params,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
