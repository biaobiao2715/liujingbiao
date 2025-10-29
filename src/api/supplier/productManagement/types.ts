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
// 定义类目的接口
export interface Category {
  id: string; // 类目ID
  categoryName: string; // 类目名称
  parentId: string | null; // 上级类目ID，null表示一级类目
  orderNum: number | null; // 排序
  createTime: string; // 创建时间
  children?: Category[]; // 子类目
}
