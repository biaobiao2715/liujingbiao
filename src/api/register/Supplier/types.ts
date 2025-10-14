export interface DictDataQuery extends PageQuery {
  dictName: string;
  dictType: string;
  dictLabel: string;
}

// 供应商注册
export interface DataFormTs {
  dictType?: string;
  dictCode: string | undefined;
  dictLabel: string;
  dictValue: string;
  cssClass: string;
  listClass: ElTagType;
  dictSort: number;
  remark: string;
}

// 供应商联系人
export interface TableItem {
  attrNameOne: string;
  attrDescribeOne: string;
  attrNameTwo: string;
  attrDescribeTwo: string;
  errors?: {
    name?: string;
    idCard?: string;
    phone?: string;
  };
}
