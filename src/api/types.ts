/**
 * 注册
 */
export type RegisterForm = {
  tenantId: string;
  username: string;
  password: string;
  confirmPassword?: string;
  code?: string;
  uuid?: string;
  userType?: string;
};

/**
 * 登录请求
 */
export interface LoginData {
  tenantId?: string;
  username?: string;
  password?: string;
  rememberMe?: boolean;
  socialCode?: string;
  socialState?: string;
  source?: string;
  code?: string;
  uuid?: string;
  clientId: string;
  grantType: string;
}

/**
 * 登录响应
 */
export interface LoginResult {
  access_token: string;
}

/**
 * 验证码返回
 */
export interface VerifyCodeResult {
  captchaEnabled: boolean;
  uuid?: string;
  img?: string;
}

/**
 * 租户
 */
export interface TenantVO {
  companyName: string;
  domain: any;
  tenantId: string;
}

export interface TenantInfo {
  tenantEnabled: boolean;
  voList: TenantVO[];
}

/**
 * es列表公共返回结果
 */
export interface IPublicResult<T> {
  code: number;
  msg: string;
  rows: T[];
  total: number;
}

/**
 * es列表公共请求参数
 */
export interface IPublicRequest {
  /**
   * 页码
   */
  pageNum?: number;
  /**
   * 每页数量
   */
  pageSize?: number;
  /**
   * 是否升序
   */
  isAsc?: boolean;
  /**
   * 排序字段
   */
  orderByColumn?: string;
}
