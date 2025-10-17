/*
 * @Author: 李刘超
 * @Date: 2025-10-16 13:37:43
 * @LastEditTime: 2025-10-16 13:37:43
 * @LastEditors: 李刘超
 * @FilePath: /api/register/index.ts
 */

import { AxiosPromise } from 'axios';
import request from '@/utils/request';
import { UplodaImageResult } from './types';

// 图片上传方法

/**
 * 图片上传方法
 * @param data - 包含文件的对象
 * @returns 图片上传结果的 Promise
 */
export function uploadImage(data: { file: File }): AxiosPromise<UplodaImageResult> {
  const formData = new FormData();
  formData.append('file', data.file);
  return request({
    url: '/resource/oss/registerUpload',
    method: 'post',
    data: formData,
    headers: {
      isToken: false,
      'Content-Type': 'multipart/form-data'
    }
  });
}

/**
 * ocr图片上传方法
 * @param data - 包含文件的对象
 * @returns 图片上传结果的 Promise
 */
export function ocrUploadImage(data: { file: File }): AxiosPromise<UplodaImageResult> {
  const formData = new FormData();
  formData.append('file', data.file);
  return request({
    url: '/resource/ocr/biz-license',
    method: 'post',
    data: formData,
    headers: {
      isToken: false,
      'Content-Type': 'multipart/form-data'
    }
  });
}
