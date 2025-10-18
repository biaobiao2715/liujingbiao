/*
 * @Author: 李刘超
 * @Date: 2025-10-17 14:47:56
 * @LastEditTime: 2025-10-17 14:47:56
 * @LastEditors: 李刘超
 * @Description: 法务专家列表类型
 * @FilePath: /grain_sales_web/src/api/platform/legalExpert/types.ts
 */
import { IPublicRequest } from '@/api/types';

interface HnBaseRegisterFolderVoList {
  /**
   * 文件夹ID
   */
  folderId: number;
  /**
   * 文件夹名称
   */
  folderName: string;
}

export interface LegalExpertList {
  /**
   * 法务专家ID
   */
  id: number;
  /**
   * 法务专家姓名
   */
  expertName: string;
  /**
   * 性别
   */
  sex: string;
  /**
   * 执业机构
   */
  practiceInstitution: string;
  /**
   * 执业证书类型
   */
  practiceCertificateType: string;
  /**
   * 执业证书编号
   */
  practiceCertificateNumber: string;
  /**
   * 法律执业资格
   */
  legalPracticeQualification: string;
  /**
   * 发证机关
   */
  issuingAuthority: string;
  /**
   * 执业证书有效期
   */
  issueDate: string;
  /**
   * 身份证号
   */
  idCard: string;
  /**
   * 手机号
   */
  phoneNumber: string;
  /**
   * 技术资格
   */
  technicalQualification: string;
  /**
   * 专业总结
   */
  professionalSummary: string;
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
   * 0：待审核
   * 1：审核通过
   * 2：分配账号
   * 3：分配权限
   * 4：入驻成功
   * 99：入驻失败
   */
  reviewStatus: '0' | '1' | '2' | '3' | '4' | '99' | '';
  /**
   * 审核备注
   */
  reviewRemark: string;
  /**
   * 创建时间
   */
  createdAt: string;
  /**
   * 更新时间
   */
  updatedAt: string;
  /**
   * 备注
   */
  remark: string;
  /**
   * 法务专家编号
   */
  expertNumber: string;
  /**
   * 存储状态
   * 0：未入库
   * 1：已入库
   */
  storageStatus: '0' | '1' | '';
  /**
   * 启停状态
   * 0：停用
   * 1：启用
   */
  startStopStatus: '0' | '1' | '';
  /**
   * 审核时间
   */
  reviewTime: string;
  /**
   * 审核人ID
   */
  reviewBy: number;
  /**
   * 入驻时间
   */
  registrationTime: string;
  /**
   * 资料清单
   */

  hnBaseRegisterFolderVoList: HnBaseRegisterFolderVoList[];
}

export interface LegalExpertListRequest extends IPublicRequest {
  /**
   * 法务专家姓名
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
   * 法务专家编号
   */
  expertNumber?: string;
}
