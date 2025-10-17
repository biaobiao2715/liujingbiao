/*
 * @Author: 李刘超
 * @Date: 2025-10-17 13:40:12
 * @LastEditTime: 2025-10-17 13:40:12
 * @LastEditors: 李刘超
 * @FilePath: /grain_sales_web/src/api/platform/technicalExpert/types.ts
 */

import { IPublicRequest } from '@/api/types';

// 技术专家列表
export interface TechnicalExpertList {
  /**
   * 技术专家ID
   */
  id: number;
  /**
   * 技术专家姓名
   */
  expertName: string;
  /**
   * 性别
   */
  sex: string;
  /**
   * 出生日期
   */
  birthDate: string;
  /**
   * 毕业学校
   */
  graduationSchool: number;
  /**
   * 专业
   */
  major: string;
  /**
   * 入学日期
   */
  enrollmentDate: string;
  /**
   * 毕业日期
   */
  graduationDate: string;
  /**
   * 学历
   */
  education: string;
  /**
   * 学位
   */
  degree: string;
  /**
   * 毕业证书编号
   */
  graduationCertNo: string;
  /**
   * 技术资格
   */
  technicalQualification: string;
  /**
   * 联系电话
   */
  contactPhone: string;
  /**
   * 身份证号
   */
  idCard: string;
  /**
   * 技术专家介绍
   */
  expertInfo: string;
  /**
   * 手机号
   */
  phoneNumber: string;
  /**
   * 密码
   */
  password: string;
  /**
   * 用户ID
   */
  userId: number;
  /**
   * 审核状态
   */
  reviewStatus: string;
  /**
   * 审核备注
   */
  reviewRemark: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 技术专家编号
   */
  expertNumber: string;
  /**
   * 存储状态
   * 0：未入库
   * 1：已入库
   */
  storageStatus: '0' | '1';
  /**
   * 启停状态
   */
  startStopStatus: string;
  /**
   * 审核时间
   */
  reviewTime: string;
  /**
   * 入驻时间
   */
  registrationTime: string;
}

export interface TechnicalExpertListRequest extends IPublicRequest {
  /**
   * 技术专家姓名
   */
  expertName?: string;
  /**
   * 入驻时间
   */
  registrationTime?: string;
  /**
   * 审核状态
   * 0：待审核
   * 1：审核通过
   * 2：分配账号
   * 3：分配权限
   * 4：入驻成功
   * 99：入驻失败
   */
  reviewStatus?: '0' | '1' | '2' | '3' | '4' | '99' | '';
  /**
   * 技术专家编号
   */
  expertNumber?: string;
}
