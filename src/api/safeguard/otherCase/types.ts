export interface OtherCaseVO {
  /**
   * id
   */
  id: string | number;

  /**
   * 链接地址
   */
  linkAddress: string;

  /**
   * 其他渠道案件名称
   */
  caseName: string;

}

export interface OtherCaseForm extends BaseEntity {
  /**
   * id
   */
  id?: string | number;

  /**
   * 链接地址
   */
  linkAddress?: string;

  /**
   * 其他渠道案件名称
   */
  caseName?: string;

}

export interface OtherCaseQuery extends PageQuery {

  /**
   * 链接地址
   */
  linkAddress?: string;

  /**
   * 其他渠道案件名称
   */
  caseName?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}



