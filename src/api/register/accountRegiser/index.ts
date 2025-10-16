/*
 * @Author: 李刘超
 * @Date: 2025-10-16 16:48:51
 * @LastEditTime: 2025-10-16 16:48:51
 * @LastEditors: 李刘超
 * @FilePath: /src/api/register/accountRegiser/index.ts
 */

import request from '@/utils/request';
import { AxiosPromise } from 'axios';

// 发送短信验证码
export function sendSmsCode(phone: string): AxiosPromise<boolean> {
  return request({
    url: '/resource/sms/code',
    method: 'get',
    params: {
      phonenumber: phone
    },
    headers: {
      isToken: false
    }
  });
}
