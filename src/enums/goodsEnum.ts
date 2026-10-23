// enums/goods.enum.ts
// 商品状态
export enum GoodsStatus {
  OnSale = '1', // 上架
  OffSale = '0' // 下架
}

export enum OperateMode {
  Add = 'add', // 新增
  Edit = 'edit', // 编辑
  Copy = 'copy' // 复制
}

// 商品规格状态
export enum SpecStatus {
  Enabled = 1, // 启用
  Disabled = 0 // 禁用
}
