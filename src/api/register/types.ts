/*
 * @Author: 李刘超
 * @Date: 2025-10-16 13:38:57
 * @LastEditTime: 2025-10-16 13:38:57
 * @LastEditors: 李刘超
 * @FilePath: /api/register/types.ts
 */

// 上传文件类型
export type FileType = '0' | '1' | '2' | '3' | '4' | '99';

// 图片上传结果接口
export interface UplodaImageResult {
  /**
   * 图片ossId
   */
  ossId: string;
  /**
   * 图片文件名
   */
  fileName: string;
  /**
   * 图片url
   */
  url: string;
}
