import request from '@/utils/request';

// 查询预警规则设置列表
export function listWarnRule(params: EarlyWarningRuleQuery) {
  return request({
    url: '/safeguard-server/warnRule/list',
    method: 'get',
    params
  });
}
// grain-sales
// 获取预警规则设置详细信息
export function getWarnRule(id: number | string) {
  return request({
    url: `/safeguard-server/warnRule/${id}`,
    method: 'get'
  });
}

// 新增预警规则设置
export function addWarnRule(data: EarlyWarningRuleForm) {
  return request({
    url: '/safeguard-server/warnRule',
    method: 'post',
    data
  });
}

// 修改预警规则设置
export function updateWarnRule(data: EarlyWarningRuleForm) {
  return request({
    url: '/safeguard-server/warnRule',
    method: 'put',
    data
  });
}

// 删除预警规则设置（支持批量）
export function delWarnRule(ids: number | string | (number | string)[]) {
  const idParam = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `/safeguard-server/warnRule/${idParam}`,
    method: 'delete'
  });
}

// 启用禁用（支持批量，接口内部按当前状态切换）
export function enableAndDisabledWarnRule({ ids, params }: { ids: number | string | (number | string)[]; params: any }) {
  const idParam = Array.isArray(ids) ? ids.join(',') : ids;
  return request({
    url: `/safeguard-server/warnRule/enableAndDisabled/${idParam}`,
    method: 'get',
    params
  });
}

// 预警规则查询参数
export interface EarlyWarningRuleQuery {
  pageNum?: number;
  pageSize?: number;
  ruleName?: string;
  creditRatingId?: number | string;
  status?: string; // 0-启用 1-禁用
}

// 预警规则表单（对齐 HnWarnRuleBoAddGroup）
export interface EarlyWarningRuleForm {
  id?: number;
  ruleName: string;
  creditRatingId: number | string;
  warnValue: number;
  status: string; // 0-启用 1-禁用
  remark?: string;
  // 可选审计字段
  createBy?: number;
  createDept?: number;
  createTime?: string;
  updateBy?: number;
  updateTime?: string;
}

// 预警规则行
export interface EarlyWarningRuleVO extends EarlyWarningRuleForm {
  createTime?: string;
}
