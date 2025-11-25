import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { LoginData, LoginResult, VerifyCodeResult, TenantInfo } from './types';
import { UserInfo } from '@/api/system/user/types';

// pc端固定客户端授权id
const clientId = import.meta.env.VITE_APP_CLIENT_ID;

/**
 *
 * 登录方法
 */
export function login(data: LoginData): AxiosPromise<LoginResult> {
  const params = {
    ...data,
    clientId: data.clientId || clientId,
    grantType: data.grantType || 'password'
  };
  return request({
    url: '/auth/login',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    method: 'post',
    data: params
  });
}

// 注册方法
export function register(data: any) {
  const params = {
    ...data,
    clientId: clientId,
    grantType: 'password'
  };
  return request({
    url: '/auth/register',
    headers: {
      isToken: false,
      isEncrypt: true,
      repeatSubmit: false
    },
    method: 'post',
    data: params
  });
}

/**
 * 注销
 */
export function logout() {
  if (import.meta.env.VITE_APP_SSE === 'true') {
    request({
      url: '/resource/sse/close',
      method: 'get'
    });
  }
  return request({
    url: '/auth/logout',
    method: 'post'
  });
}

/**
 * 获取验证码
 */
export function getCodeImg(): AxiosPromise<VerifyCodeResult> {
  return request({
    url: '/auth/code',
    headers: {
      isToken: false
    },
    method: 'get',
    timeout: 20000
  });
}

/**
 * 第三方登录
 */
export function callback(data: LoginData): AxiosPromise<any> {
  const LoginData = {
    ...data,
    clientId: clientId,
    grantType: 'social'
  };
  return request({
    url: '/auth/social/callback',
    method: 'post',
    data: LoginData
  });
}

// 获取用户详细信息
export function getInfo(): AxiosPromise<UserInfo> {
  return request({
    url: '/system/user/getInfo',
    method: 'get'
  });
}

// 获取租户列表
export function getTenantList(isToken: boolean): AxiosPromise<TenantInfo> {
  return request({
    url: '/auth/tenant/list',
    headers: {
      isToken: isToken
    },
    method: 'get'
  });
}

// 忘记密码
export function forgotPwd(data: any) {
  return request({
    url: '/system/user/forgotPwd',
    // headers: {
    //   isToken: false,
    //   isEncrypt: true,
    //   repeatSubmit: false
    // },
    method: 'put',
    data: data
  });
}

/**
 * 校验账号状态
501 代表用户表里面已经存在数据，直接登录
502 代表技术专家信息
503 代表法务专家信息
504 代表企业或供应商信息
 */

export function isAccountExist(phoneNumber: string): AxiosPromise<boolean> {
  return request({
    url: `/system/user/isAccount?phoneNumber=${phoneNumber}`,
    method: 'get'
  });
}

/**
 * 针对采购商和供应商分别推送匹配的供给需求和采购需求
 */
export function getRecommendDemand(data?: any) {
  return request({
    url: '/grain-sales/recommendDemand/getRecommendDemand',
    method: 'get',
    params: data || {}
  });
}

// --==---==-分片上传相关的接口--=-=-=-=
//  初始化分片上传
export function initChunkUpload(data: any) {
  return request({
    url: '/resource/oss/init',
    method: 'post',
    params: data
  });
}

// 上传单个分片
export function uploadChunk(params, data: FormData, config = {}) {
  return request({
    url: '/resource/oss/part',
    method: 'post',
    params,
    data,
    headers: {
      ignoreFrequencyLimit: true,
      'Content-Type': 'multipart/form-data'
    },
    ...config
  });
}

//合并分片，完成整个文件上传
export function mergeChunkUpload(data: any) {
  return request({
    url: '/resource/oss/merge',
    method: 'post',
    data
  });
}

// 销售平台的跳转到溯源平台
export function thirdPartyLogin(data: any) {
  return request({
    url: '/auth/thirdParty/login',
    method: 'post',
    headers: {
      Authorization: ''
    },
    data
  });
}
