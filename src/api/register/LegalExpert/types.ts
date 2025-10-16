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
  folder: {
    createDept: number;
    createBy: number;
    createTime: string;
    updateBy: number;
    updateTime: string;
    params: Record<string, any>;
    id: number;
    registerForeignId: number;
    fileType: string;
    ossId: number;
    remark: string;
  }[];
}

export interface UolodaImageResult {
  ossId: number;
  fileType: string;
  remark: string;
}
export interface LegalExpertRegisterResult {}
