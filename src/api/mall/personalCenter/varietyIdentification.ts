import request from '@/utils/request';
/**
 * 品种识别商品接口
 */

export function varietyRecognizeList(query?: any) {
  console.log(query);
  return request({
    url: 'safeguard-server/varietyRecognize/list',
    method: 'get',
    params: query
  });
}

// 查询品种信息识别类别
export function varietyRecognizeGroupType() {
  return request({
    url: 'safeguard-server/varietyRecognize/groupType',
    method: 'get'
  });
}

/** 品种识别商品详情

 * @param id
 */
export function varietyRecognizeCancel(id: any) {
  return request({
    url: 'safeguard-server/varietyRecognize/cancel/' + id,
    method: 'put'
  });
}

// 新增品种信息识别
export function varietyRecognizeAdd(data: any) {
  return request({
    url: 'safeguard-server/varietyRecognize',
    method: 'post',
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

// 品种识别商品识别
export async function varietyRecognizeIdentify(data: any) {
  const maxRetries = 2;
  const timeout = 60000; // 60s 超时
  let attempt = 0;
  let lastError: any = null;

  while (attempt <= maxRetries) {
    try {
      return await request({
        url: '/safeguard-server/varietyRecognize/identify',
        method: 'post',
        data,
        timeout
      });
    } catch (err) {
      lastError = err;
      // 仅对超时或网络错误进行重试
      const isTimeout = (err as any)?.code === 'ECONNABORTED';
      const isNetworkError = (err as any)?.message?.includes('Network Error');
      if (!(isTimeout || isNetworkError) || attempt === maxRetries) {
        throw err;
      }
      attempt++;
    }
  }
  throw lastError;
}
