// 企业注册页面
import request from '@/utils/request';

// 企业申请
export function traceableCompany(data: any) {
  return request({
    url: 'traceable/traceableCompany',
    method: 'post',
    data: data
  });
}

//企业修改
export function updateTraceableCompany(data: any) {
  return request({
    url: 'traceable/traceableCompany',
    method: 'put',
    data: data
  });
}
