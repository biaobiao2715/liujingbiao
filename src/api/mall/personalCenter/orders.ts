import request from '@/utils/request';
/**
 * 订单商品接口
 */

export function orderList(query?: any) {
  console.log(query);
  return request({
    url: 'grain-sales/order/page',
    method: 'get',
    params: query
  });
}

/**
 * 取消订单
 * @param id
 */
export function orderCancel(id: any) {
  return request({
    url: 'grain-sales/order/cancel/' + id,
    method: 'put'
  });
}

/**
 * 确认订单
 * @param id
 */
export function orderConfirm(id: any) {
  return request({
    url: 'grain-sales/order/confirm/' + id,
    method: 'put'
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

// 推送未回答问题提示信息
// skill-server/question/pushNoAnswerQuestionMessage
export function pushNoAnswerQuestionMessage() {
  return request({
    url: 'skill-server/question/pushNoAnswerQuestionMessage',
    method: 'get'
  });
}

// 新增举报通道管理
export function addReportChannel(data: any) {
  return request({
    url: '/safeguard-server/report/add',
    method: 'post',
    data
  });
}

// -------------------- 类型定义 --------------------
/** 订单条目类型 */
interface OrderItem {
  goodsPic: string;
  goodsName: string;
  goodsPrice: number | string;
}
/** 订单类型 */
export interface Order {
  id: number;
  orderItems: OrderItem[];
  orderStatus: string;
  enterprisePhone: string;
  orderSn: string;
}
