import request from '@/utils/request';
/**
 * 我的供给发布接口
 */

export function hnSupplierSupplyList(query?: any) {
  console.log(query);
  return request({
    url: 'grain-sales/hnSupplierSupply/list',
    method: 'get',
    params: query
  });
}

/**
 * 我的供给发布详情接口
 * @param id
 */
export function hnSupplierSupplyId(id: any) {
  return request({
    url: 'grain-sales/hnSupplierSupply/' + id,
    method: 'get'
  });
}

// /新增供给发布
export function hnSupplierSupplyPost(data: any) {
  return request({
    url: 'grain-sales/hnSupplierSupply',
    method: 'post',
    data
  });
}

// /修改供给发布
export function hnSupplierSupplyPut(data: any) {
  return request({
    url: 'grain-sales/hnSupplierSupply',
    method: 'put',
    data
  });
}
// /删除供给发布
export function hnSupplierSupplyDelete(id: any) {
  return request({
    url: 'grain-sales/hnSupplierSupply/' + id,
    method: 'delete'
  });
}

// 供给需求类型
/**
 * HnSupplierSupplyBoAddGroup
 */
export interface Request {
  /**
   * 发布区域-市
   */
  cityCode?: string;
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建部门
   */
  createDept?: number;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 交付天数
   */
  deliveryDays?: number;
  /**
   * 交付时间
   */
  deliveryTime?: string;
  /**
   * 发布区域-区
   */
  districtCode?: string;
  /**
   * 企业id
   */
  enterpriseId?: number;
  /**
   * 报价id
   */
  id?: number;
  /**
   * 请求参数
   */
  params?: MapObjectAddGroup;
  /**
   * 发布区域-省
   */
  provinceCode?: string;
  /**
   * 库存
   */
  stock?: number;
  /**
   * 配送范围
   */
  supplierSupplyDeliveryBos?: HnSupplierSupplyDeliveryBoAddGroup[];
  /**
   * 供给类目（对应商品类目）
   */
  supplyCategoryId?: number;
  /**
   * 供给说明
   */
  supplyDescription?: string;
  /**
   * 供给价格
   */
  supplyPrice?: number;
  /**
   * 供给状态（1：已发布 99：已关闭）
   */
  supplyStatus?: string;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: string;
  [property: string]: any;
}

/**
 * 请求参数
 *
 * MapObjectAddGroup
 */
export interface MapObjectAddGroup {
  key?: { [key: string]: any };
  [property: string]: any;
}

/**
 * 供给需求配送信息业务对象 hn_supplier_supply_delivery
 *
 * HnSupplierSupplyDeliveryBoAddGroup
 */
export interface HnSupplierSupplyDeliveryBoAddGroup {
  /**
   * 创建者
   */
  createBy?: number;
  /**
   * 创建部门
   */
  createDept?: number;
  /**
   * 创建时间
   */
  createTime?: string;
  /**
   * 配送地址
   */
  deliveryAddress?: string;
  /**
   * 配送区县
   */
  deliveryArea?: string;
  /**
   * 配送区县code
   */
  deliveryAreaCode?: string;
  /**
   * 配送城市
   */
  deliveryCity?: string;
  /**
   * 配送城市code
   */
  deliveryCityCode?: string;
  /**
   * 配送省份
   */
  deliveryProvince?: string;
  /**
   * 配送省份code
   */
  deliveryProvinceCode?: string;
  /**
   * 配送大区
   */
  deliveryRegion?: string;
  /**
   * 配送大区code
   */
  deliveryRegionCode?: string;
  /**
   * 报价id
   */
  id?: number;
  /**
   * 请求参数
   */
  params?: MapObjectAddGroup;
  /**
   * 供给需求表主键id
   */
  supplyId: number;
  /**
   * 更新者
   */
  updateBy?: number;
  /**
   * 更新时间
   */
  updateTime?: string;
  [property: string]: any;
}
