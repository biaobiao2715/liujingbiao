export interface RemoteEnterpriseContactsVo {
  id?: number; // integer <int64>
  enterpriseId?: number; // integer <int64>
  contactUserType?: string; // 联系人类型（0：自然人 1：法人）
  contactUserName?: string; // 联系人姓名
  contactPhone?: string; // 联系电话
  contactIdCard?: string; // 联系人身份证号码
}

export interface RemoteRegisterFolderVo {
  id?: number; // integer <int64>
  registerForeignId?: number; // integer <int64>
  fileType?: string; // 附件类型（0：头像 1：营业执照 2：毕业证书 3：学位证书 4：律师证书 99：其他）
  ossId?: number; // integer <int64>
  remark?: string; // 备注
  ossInfo?: RemoteOssVo; // OSS对象存储信息
  createTime?: string; // 创建时间
  auditPerson?: string; // 审核人
  province?: string; // 省
  provinceCode?: string; // 省编码
  city?: string; // 市
  cityCode?: string; // 市编码
  district?: string; // 区
  districtCode?: string; // 区编码
}

export interface RemoteOssVo {
  ossId?: number; // integer <int64>
  name?: string; // 文件名称
  url?: string; // 文件地址
  originalName?: string; // 原名
  fileSuffix?: string; // 文件后缀名
  ext1?: string; // 扩展字段
  createTime?: string; // 创建时间
}

export interface HnGoodsSpecificationData {
  id?: number; // integer <int64>
  goodsId?: number; // integer <int64>
  goodsSpecification?: string; // 商品规格
  goodsSpecificationValue?: string; // 商品规格值
  goodsPrice?: number; // 商品价格
  goodsStock?: number; // 商品库存
  status?: string; // 状态（0：禁用 1：启用）
  delFlag?: string; // 删除标志（0代表存在 1代表删除）
}

export interface hnGoodsFilesList {
  id?: number; // integer <int64> id
  goodsId?: number; // integer <int64> 商品id
  fileType?: string; // 附件类型（0：主图 99：其他）
  ossId?: number; // integer <int64> OSS对象存储主键
  delFlag?: string; // 删除标志（0代表存在 1代表删除）
  createDept?: number; // integer <int64> 创建部门
  createBy?: number; // integer <int64> 创建者
  createTime?: string; // 创建时间
  updateBy?: number; // integer <int64> 更新者
  updateTime?: string; // 更新时间
  params?: Record<string, any>; // 请求参数
  key?: Record<string, any>; // 可选字段 key
  tenantId?: string; // 租户编号
}

export interface SysOssLists {
  ossId?: number; // integer <int64>
  name?: string; // 文件名称
  url?: string; // 文件地址
  originalName?: string; // 原名
  fileSuffix?: string; // 文件后缀名
  ext1?: string; // 扩展字段
  createTime?: string; // 创建时间
}

export interface HnGoodsPriceHistory {
  id?: number; // integer <int64>
  goodsId?: number; // integer <int64>
  goodsSpecificationId?: number; // integer <int64>
  goodsSpecification?: string; // 商品规格
  goodsSpecificationValue?: string; // 商品规格值
  goodsOldPrice?: number; // 商品调整前价格
  goodsNewPrice?: number; // 商品调整后价格
}

export interface HnBaseEnterpriseInfo {
  id?: number; // integer <int64>
  enterpriseNumber?: string; // 企业编号（唯一标识）
  enterpriseType?: string; // 企业类型（0：供应商 1：企业）
  companyName?: string; // 企业名称
  licenseNumber?: string; // 统一社会信用代码
  signUpTime?: string; // 注册时间
  legalPerson?: string; // 法定代表人
  officeAddress?: string; // 办公地址
  signUpAddress?: string; // 注册地址
  signUpCapital?: string; // 注册资本
  businessScope?: string; // 经营范围
  companyIntro?: string; // 企业简介
  companyDomain?: string; // 企业域名
  loginUserName?: string; // 账号人姓名
  phoneNumber?: string; // 账号人手机号码
  password?: string; // 登录密码
  credentialLevel?: string; // 资质等级（0：一级认证 1：二级认证 2：三级认证）
  creditLevel?: string; // 信用等级（0：优秀 1：良好 2：一般 3：一般以下 99：较差）
  userId?: number; // integer <int64>
  remark?: string; // 备注
  reviewStatus?: string; // 审核状态(0：待审核 1：审核通过 2：分配账号 3：分配权限 4：入驻成功 99：入驻失败)
  reviewRemark?: string; // 审核备注
  reviewTime?: string; // 审核时间
  reviewBy?: number; // integer <int64>
  contacts?: RemoteEnterpriseContactsVo[]; // 联系人
  folders?: RemoteRegisterFolderVo[]; // 资料清单
  createTime?: string; // 创建时间
  auditPerson?: string; // 审核人
  province?: string; // 省
  provinceCode?: string; // 省编码
  city?: string; // 市
  cityCode?: string; // 市编码
  district?: string; // 区
  districtCode?: string; // 区编码
}

export interface Goods {
  id?: number; // integer <int64>
  tenantId?: string; // 租户编号
  enterpriseId?: number; // integer <int64>
  goodsCode?: string; // 商品编码(自动生成，唯一)
  goodsName?: string; // 商品名称
  goodsCategoryId?: number; // integer <int64>
  goodsCategoryName?: string; // 商品类目名称
  goodsBrandId?: number; // integer <int64>
  goodsBrandName?: string; // 商品品牌名称
  goodsAbilityName?: string[]; // 商品功能
  goodsAbilityIds?: string[]; // 商品功能id集合
  goodssEnsureName?: string[]; // 商品保障
  goodsEnsureIds?: string[]; // 商品保障id集合
  goodsSpecification?: string; // 商品规格（0：件(计数) 1：只(计数) 2：KG(计重)）等 根据字典表设置
  goodsSpecificationName?: string; // 商品规格名称
  goodsInfo?: string; // 商品介绍
  goodsDetail?: string; // 商品详情
  hnBaseEnterpriseInfo?: HnBaseEnterpriseInfo; // 企业
  goodsSales?: number; // 商品销量
  hnGoodsSpecificationDataList?: HnGoodsSpecificationData[]; // 商品规格详情
  createDept?: number; // integer <int64>
  createBy?: number; // integer <int64>
  createTime?: string; // 创建时间
  updateBy?: number; // integer <int64>
  updateTime?: string; // 更新时间
  params?: Record<string, any>; // 请求参数
  hnGoodsFilesList?: HnGoodsFiles[]; // 图片
  priceHistories?: HnGoodsPriceHistory[]; // 价格调整历史
  sysOssLists?: SysOssLists[]; // 图片详情
}
