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
  tableList?: any[]; // 添加这一行
  fileList?: any[]; // 添加这一行
}

// 定义联系人接口，包含可选的errors属性
export interface Contact {
  contactType: string | number;
  name: string;
  idCard: string;
  phone: string;
  errors?: {
    name?: string;
    idCard?: string;
    phone?: string;
  };
}
