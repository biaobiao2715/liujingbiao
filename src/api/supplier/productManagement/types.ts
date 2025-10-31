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

// 定义类目的接口
export interface Category {
  id: string; // 类目ID
  categoryName: string; // 类目名称
  parentId: string | null; // 上级类目ID，null表示一级类目
  orderNum: number | null; // 排序
  createTime: string; // 创建时间
  children?: Category[]; // 子类目
}

// 定义商品属性接口
export interface GoodsAttributesResponse {
  brandList: Array<{ id: string | number; attributeName: string; status?: number }>;
  guaranteeList: Array<{ id: string | number; attributeName: string; status?: number }>;
  functionList: Array<{ id: string | number; attributeName: string; status?: number }>;
}

// 定义商品详情数据类型
export interface HnGoodsFiles {
  id?: number;
  goodsId?: number;
  fileType?: string;
  ossId?: number;
  ossInfo?: {
    ossId?: number;
    fileName?: string;
    originalName?: string;
    url?: string;
  };
  [property: string]: any;
}
// 定义商品规格数据类型
export interface HnGoodsSpecificationData {
  id?: number;
  goodsId?: number;
  goodsSpecification?: string;
  goodsSpecificationValue?: string;
  goodsPrice?: number;
  goodsStock?: number;
  [property: string]: any;
}
// 定义商品详情数据类型
export interface HnGoodsVo {
  id?: number;
  goodsName?: string;
  goodsCode?: string;
  goodsEnsureId?: number;
  goodsEnsureName?: string;
  goodsBrandId?: number | string;
  goodsBrandName?: string;
  createTime?: string;
  launchTime?: string;
  takeDownTime?: string;
  status?: string;
  goodsAlert?: number | string;
  goodsCategoryId?: number | string;
  goodsCategoryName?: string;
  goodsDetail?: string;
  goodsInfo?: string;
  goodsSpecification?: string;
  goodsSpecificationName?: string;
  hnGoodsFilesList?: HnGoodsFiles[];
  hnGoodsSpecificationDataList?: HnGoodsSpecificationData[];
  [property: string]: any;
}
