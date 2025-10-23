export interface DictDataQuery extends PageQuery {
  dictName: string;
  dictType: string;
  dictLabel: string;
}

// 定义表单数据类型
export interface FormData {
  companyName: string;
  signUpCapital: string;
  licenseNumber: string;
  signUpAddress: string;
  signUpTime: string;
  businessScope: string;
  legalPerson: string;
  officeAddress: string;
  loginUserName: string;
  phoneNumber: string;
  smsCode: string;
  password: string;
  confirmPassword: string;
  areaCodes: any;
  districtCode: string;
  cityCode: string;
  provinceCode: string;
  district: string;
  city: string;
  province: string;
}

// 定义联系人接口，包含可选的errors属性
export interface Contact {
  contactUserType: string | number;
  contactUserName: string;
  contactIdCard: string;
  contactPhone: string;
  errors?: {
    contactUserName?: string;
    contactIdCard?: string;
    contactPhone?: string;
  };
}
