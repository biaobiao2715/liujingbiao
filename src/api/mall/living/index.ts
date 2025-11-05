import request from '@/utils/request';

// 获取直播列表
export function VideoList(data: any) {
  return request({
    url: 'skill-server/hnOnlineVideo/list',
    method: 'get',
    params: data
  });
}


