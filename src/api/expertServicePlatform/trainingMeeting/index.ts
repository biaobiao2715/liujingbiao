/**
 * 知识库文章接口
 * 模块说明：
 * - 列表查询、详情、增改、删除、批量状态修改（启用/禁用）
 * - 时间范围参数采用 params.beginTime / params.endTime（YYYY-MM-DD）
 * - 状态枚举：cultivateExpertStatus => 0草稿 1待审核 2已发布(启用) 3已下架(禁用) 4审核不通过 99已关闭
 * - 类型枚举：cultivateExpertType => 1种子技术类 2农资农具技术类 99其他
 */
import request from '@/utils/request';

/**
 * 列表查询参数
 * - pageNum 当前页数
 * - pageSize 分页大小
 * - cultivateExpertType 文章类型：1 种子技术类 2 农资农具技术类 99 其他
 * - cultivateExpertTitle 文章标题(模糊匹配)
 * - cultivateExpertStatus 启用状态：2 启用(已发布) 3 禁用(已下架)
 * - params.beginTime/params.endTime 发布时间范围(YYYY-MM-DD)
 */
export interface cultivateExpertQuery {
  pageNum?: number;
  pageSize?: number;
  cultivateExpertType?: string | number;
  cultivateExpertTitle?: string;
  cultivateExpertStatus?: string | number; // 2启用(已发布) 3禁用(已下架)
  params?: {
    beginTime?: string; // 发布时间-开始
    endTime?: string; // 发布时间-结束
  };
  [k: string]: any;
}

/**
 * 文章实体
 * - cultivateExpertStatus：0草稿 1待审核 2已发布 3已下架 4审核不通过 99已关闭
 * - contentType：1原创 2转载 3翻译
 * - cultivateExpertType：1种子技术类 2农资农具技术类 99其他
 * - publishTime/expiryTime：字符串日期，格式由后端约定
 */
export interface cultivateExpertDTO {
  id?: number | string;
  cultivateExpertNo?: string;
  cultivateExpertTitle?: string;
  cultivateExpertType?: string | number; // 1 2 99
  contentType?: string | number; // 1原创 2转载 3翻译
  cultivateExpertCover?: string;
  cultivateExpertSummary?: string;
  cultivateExpertContent?: string;
  cultivateExpertStatus?: string | number; // 0草稿 1待审核 2已发布 3已下架 4审核不通过 99已关闭
  authorId?: number | string;
  authorName?: string;
  authorAvatar?: string;
  publishTime?: string;
  expiryTime?: string;
  sortOrder?: number;
  createDept?: number | string;
  createBy?: number | string;
  createTime?: string;
  updateBy?: number | string;
  updateTime?: string;
  params?: Record<string, any>;
}

/**
 * 查询文章列表
 * GET skill-server/cultivateExpert/list
 * @param params cultivateExpertQuery 查询参数（含分页与时间范围）
 */
export function listcultivateExperts(params: cultivateExpertQuery) {
  return request({
    url: 'skill-server/cultivateExpert/list',
    method: 'get',
    params
  });
}

/**
 * 获取文章详情
 * GET skill-server/cultivateExpert/{id}
 * @param id number|string 文章id
 */
export function getcultivateExpert(id: number | string) {
  return request({
    url: `skill-server/cultivateExpert/${id}`,
    method: 'get'
  });
}

/**
 * 新增文章
 * POST skill-server/cultivateExpert
 * @param data cultivateExpertDTO 文章数据
 */
export function addcultivateExpert(data: cultivateExpertDTO) {
  return request({
    url: 'skill-server/cultivateExpert',
    method: 'post',
    data
  });
}

/**
 * 更新文章
 * PUT skill-server/cultivateExpert/{id}
 * @param data cultivateExpertDTO 文章数据（需包含 id）
 */
export function updatecultivateExpert(data: cultivateExpertDTO) {
  return request({
    url: `skill-server/cultivateExpert`,
    method: 'put',
    data
  });
}

/**
 * 删除文章（支持批量）
 * DELETE skill-server/cultivateExpert/{id,id2,...}
 * @param ids number|string|Array<number|string> 单个id或id数组
 */
export function delcultivateExpert(ids: Array<number | string> | number | string) {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `skill-server/cultivateExpert/${idStr}`,
    method: 'delete'
  });
}
