import { GoodsForm, GoodsSpec, GoodsImage } from '@/views/supplierPlatform/productManagement/composables/goods/type';
import { useInputFilter } from '@/views/supplierPlatform/productManagement/composables/goods/useInputFilter';
import { GoodsStatus } from '@/enums/goodsEnum';
const { getNowStr } = useInputFilter();

function baseGoodsForm(raw: any): GoodsForm {
  return {
    goodsName: raw.goodsName ?? '',
    goodsCategoryId: raw.goodsCategoryId || '',
    goodsBrandId: raw.goodsBrandId || '',
    goodsEnsureIds: raw.goodsEnsureIds?.split(',') || [],
    goodsAbilityIds: raw.goodsAbilityIds?.split(',') || [],
    goodsInfo: raw.goodsInfo || '',
    goodsDetail: raw.goodsDetail || '',
    goodsAlert: raw.goodsAlert || 0,
    goodsSpecification: raw.goodsSpecification || '',
    status: raw.status || GoodsStatus.OnSale,
    launchTime: getNowStr(),
    takeDownTime: getNowStr()
  };
}

export function mapGoodsDetail(raw: any): GoodsForm {
  return {
    ...baseGoodsForm(raw),
    goodsCode: raw.goodsCode || ''
  };
}

export function mapGoodsCopy(raw: any): GoodsForm {
  return {
    ...baseGoodsForm(raw),
    goodsCode: ''
  };
}

export function mapGoodsAdd(): GoodsForm {
  return {
    goodsName: '',
    goodsCode: '', // 商品编码
    goodsCategoryId: '',
    goodsBrandId: '',
    goodsEnsureIds: [], // 商品保障 ID 列表
    goodsAbilityIds: [], // 商品功能 ID 列表
    goodsInfo: '', // 商品简介
    goodsDetail: '', // 商品详情
    goodsAlert: 0, // 库存预警值
    goodsSpecification: '', // 商品规格
    status: GoodsStatus.OnSale, // 商品状态（'0' 下架 / '1' 上架）
    launchTime: getNowStr(), // 上架时间
    takeDownTime: getNowStr() // 下架时间
  };
}

export function mapGoodsSpecFromApi(list: any[]): GoodsSpec[] {
  return (list || []).map((item) => ({
    goodsSpecification: item.goodsSpecification ?? '',
    goodsSpecificationValue: item.goodsSpecificationValue ?? '',
    goodsPrice: String(item.goodsPrice ?? ''),
    goodsStock: String(item.goodsStock ?? ''),
    goodsWeight: String(item.goodsWeight ?? ''),
    status: item.status ?? GoodsStatus.OnSale
  }));
}

export function mapGoodsSpecToApi(list: GoodsSpec[]) {
  return list.map((item) => ({
    goodsSpecification: item.goodsSpecification,
    goodsSpecificationValue: item.goodsSpecificationValue,
    goodsPrice: Number(item.goodsPrice),
    goodsStock: Number(item.goodsStock),
    goodsWeight: Number(item.goodsWeight),
    status: item.status
  }));
}

export function mapGoodsMainImg(list: GoodsImage[]) {
  if (!list || list.length === 0) {
    return [];
  }
  return list.map((item: GoodsImage) => ({
    name: item.originalName || '商品主图',
    path: item.url,
    url: item.url,
    fileType: '0',
    ossId: item.ossId
  }));
}

export function mapGoodsSubmit(form: GoodsForm, specs: GoodsSpec[], files: GoodsImage[]) {
  return {
    ...form,
    goodsEnsureIds: form.goodsEnsureIds.join(','),
    goodsAbilityIds: form.goodsAbilityIds.join(','),
    hnGoodsSpecificationDataList: mapGoodsSpecToApi(specs),
    remoteFileList: mapGoodsMainImg(files)
  };
}
