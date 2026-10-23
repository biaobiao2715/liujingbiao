import type { HnGoodsVo, HnGoodsFiles, HnGoodsSpecificationData } from '@/api/supplier/productManagement/types';
import { SpecStatus, GoodsStatus } from '@/enums/goodsEnum';

/** 页面级表单模型（Page Form DTO） */
export interface GoodsForm {
  goodsName?: string; // 商品名称
  goodsCode?: string; // 商品编码
  goodsCategoryId?: string; // 商品类别 ID
  goodsBrandId?: string; // 商品品牌 ID
  goodsEnsureIds?: Array<string | number>; // 商品保障 ID 列表
  goodsAbilityIds?: Array<string | number>; // 商品功能 ID 列表
  goodsInfo?: string; // 商品简介
  goodsDetail?: string; // 商品详情
  goodsAlert?: number; // 库存预警值
  goodsSpecification?: string; // 商品规格
  status?: GoodsStatus; // 商品状态（'0' 下架 / '1' 上架）
  launchTime?: string; // 上架时间
  takeDownTime?: string; // 下架时间
  [key: string]: any;
}

export interface GoodsImage {
  originalName?: string;
  name: string;
  url: string;
  fileType: string;
  ossId?: string | number;
}

export interface GoodsSpec {
  goodsSpecification: string;
  goodsSpecificationValue: string;
  goodsPrice: string;
  goodsStock: string;
  goodsWeight: string;
  status: SpecStatus;
  errors?: {
    goodsWeight?: string;
    goodsSpecificationValue?: string;
    goodsPrice?: string;
    goodsStock?: string;
  };
}

/** 页面级商品详情模型（聚合了表单、图片、规格） */
export interface GoodsDetail {
  /** 表单主体数据（已经是页面结构） */
  form: GoodsForm;

  /** 商品图片 */
  images: GoodsImage[];

  /** 商品规格 */
  specs: GoodsSpec[];
}

/** 提交后端的商品请求结构（基于接口类型做轻度约束） */
export interface GoodsRequest extends Partial<HnGoodsVo> {
  goodsEnsureIds?: string; // 多选转逗号分隔
  goodsAbilityIds?: string;
  hnGoodsFilesList?: HnGoodsFiles[];
  hnGoodsSpecificationDataList?: HnGoodsSpecificationData[];
}

// 定义商品属性接口
export interface GoodsAttributesResponse {
  brandList: Array<{ id: string | number; attributeName: string; status?: number }>;
  guaranteeList: Array<{ id: string | number; attributeName: string; status?: number }>;
  functionList: Array<{ id: string | number; attributeName: string; status?: number }>;
}
