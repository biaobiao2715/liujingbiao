export interface TechnicalExpert {
  createDept?: number;
  createBy?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
  params: Record<string, any>;
  id: number;
  /**
   * 专家姓名
   */
  expertName: string;
  /**
   * 性别
   */
  sex: string;
  /**
   * 出生年月
   */
  birthDate: string;
  /**
   * 毕业学校
   */
  graduationSchool: string;
  /**
   * 专业
   */
  major: string;
  /**
   * 学历
   */
  education: string;
  /**
   * 入学日期
   */
  enrollmentDate: string;
  /**
   * 毕业日期
   */
  graduationDate: string;
  /**
   * 学位
   */
  degree: string;
  /**
   * 毕业证书编号
   */
  graduationCertNo: string;
  /**
   * 专业技术资格名称
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
   * 专家介绍
   */
  expertInfo: string;
  /**
   * 手机号
   */
  phoneNumber: string;
  password: string;
  userId: number;
  reviewStatus: string;
  reviewRemark: string;
  remark: string;

  userName: string;
  smsCode: string;
  confirmPassword: string;

  folder: {
    createDept?: number;
    createBy?: number;
    createTime?: string;
    updateBy?: number;
    updateTime?: string;
    params?: Record<string, any>;
    id?: number;
    registerForeignId?: number;
    fileType?: string;
    ossId?: string;
    remark?: string;
  }[];
}

export interface TechnicalExpertRegisterResult {}
