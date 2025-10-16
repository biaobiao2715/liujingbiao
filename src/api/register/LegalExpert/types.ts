// 资料清单接口

import { FileType } from '../types';

export interface Folder {
  /**
   * 资料类型
   * 0：头像
   * 1：营业执照
   * 2：毕业证书
   * 3：学位证书
   * 4：律师证书
   * 99：其他
   */
  fileType: FileType;
  /**
   * 图片ossId
   */
  ossId: string;
  /**
   * 备注
   */
  remark: string;
}

// 法务专家数据传输接口
export interface LegalExpert {
  createDept: number;
  createBy: number;
  createTime: string;
  updateBy: number;
  updateTime: string;
  params: Record<string, any>;
  id: number;
  expertName: string;
  sex: string;
  practiceInstitution: string;
  practiceCertificateType: string;
  practiceCertificateNumber: string;
  legalPracticeQualification: string;
  issuingAuthority: string;
  issueDate: string;
  idCard: string;
  phoneNumber: string;
  technicalQualification: string;
  professionalSummary: string;
  password: string;
  userId: number;
  reviewStatus: string;
  reviewRemark: string;
  remark: string;
  folder: Folder[];
}

export interface LegalExpertRegisterResult {}
