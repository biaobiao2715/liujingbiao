/**
 * 知识库文章接口
 * 模块说明：
 * - 列表查询、详情、增改、删除、批量状态修改（启用/禁用）
 * - 时间范围参数采用 params.beginTime / params.endTime（YYYY-MM-DD）
 * - 状态枚举：articleStatus => 0草稿 1待审核 2已发布(启用) 3已下架(禁用) 4审核不通过 99已关闭
 * - 类型枚举：articleType => 1种子技术类 2农资农具技术类 99其他
 */
import request from '@/utils/request';

/**
 * 列表查询参数
 * - pageNum 当前页数
 * - pageSize 分页大小
 * - articleType 文章类型：1 种子技术类 2 农资农具技术类 99 其他
 * - articleTitle 文章标题(模糊匹配)
 * - articleStatus 启用状态：2 启用(已发布) 3 禁用(已下架)
 * - params.beginTime/params.endTime 发布时间范围(YYYY-MM-DD)
 */
export interface ArticleQuery {
  pageNum?: number;
  pageSize?: number;
  articleType?: string | number;
  articleTitle?: string;
  articleStatus?: string | number; // 2启用(已发布) 3禁用(已下架)
  params?: {
    beginTime?: string; // 发布时间-开始
    endTime?: string; // 发布时间-结束
  };
  [k: string]: any;
}

/**
 * 文章实体
 * - articleStatus：0草稿 1待审核 2已发布 3已下架 4审核不通过 99已关闭
 * - contentType：1原创 2转载 3翻译
 * - articleType：1种子技术类 2农资农具技术类 99其他
 * - publishTime/expiryTime：字符串日期，格式由后端约定
 */
export interface ArticleDTO {
  id?: number | string;
  articleNo?: string;
  articleTitle?: string;
  articleType?: string | number; // 1 2 99
  contentType?: string | number; // 1原创 2转载 3翻译
  articleCover?: string;
  articleSummary?: string;
  articleContent?: string;
  articleStatus?: string | number; // 0草稿 1待审核 2已发布 3已下架 4审核不通过 99已关闭
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
 * 批量修改状态入参
 * - ids 文章id列表
 * - articleStatus 目标状态：2 启用 3 禁用
 */
export interface ChangeStatusPayload {
  ids: Array<number | string>;
  articleStatus: string | number; // 2 启用, 3 禁用
}

/**
 * 查询文章列表
 * GET skill-server/article/list
 * @param params ArticleQuery 查询参数（含分页与时间范围）
 */
export function listArticles(params: ArticleQuery) {
  return request({
    url: 'skill-server/article/list',
    method: 'get',
    params
  });
}

/**
 * 获取文章详情
 * GET skill-server/article/{id}
 * @param id number|string 文章id
 */
export function getArticle(id: number | string) {
  return request({
    url: `skill-server/article/${id}`,
    method: 'get'
  });
}

/**
 * 新增文章
 * POST skill-server/article
 * @param data ArticleDTO 文章数据
 */
export function addArticle(data: ArticleDTO) {
  return request({
    url: 'skill-server/article',
    method: 'post',
    data
  });
}

/**
 * 更新文章
 * PUT skill-server/article/{id}
 * @param data ArticleDTO 文章数据（需包含 id）
 */
export function updateArticle(data: ArticleDTO) {
  return request({
    url: `skill-server/article`,
    method: 'put',
    data
  });
}

/**
 * 删除文章（支持批量）
 * DELETE skill-server/article/{id,id2,...}
 * @param ids number|string|Array<number|string> 单个id或id数组
 */
export function delArticle(ids: Array<number | string> | number | string) {
  const idStr = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `skill-server/article/${idStr}`,
    method: 'delete'
  });
}

/**
 * 批量修改文章状态（启用/禁用）
 * PUT skill-server/article/status
 * @param data { ids: number[]; articleStatus: 2|3 }
 */
export function changeArticleStatus(data: ChangeStatusPayload) {
  return request({
    url: 'skill-server/article/status',
    method: 'put',
    data
  });
}

/**
 * 图片上传方法
 * @param data - 包含文件的对象，需包含 `file` 属性
 * @returns 图片上传结果的 Promise
 */
export const ossUploadImage = (data: { file: File }) => {
  const formData = new FormData();
  formData.append('file', data.file);

  return request({
    url: '/resource/oss/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
