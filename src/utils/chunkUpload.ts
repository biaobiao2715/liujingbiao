import { initUpload, completeUpload, finishUpload, getOssListByIds } from '@/api/login';
import SparkMD5 from 'spark-md5';

/** 计算文件 MD5 */
const computeHash = (file: File): Promise<string> =>
  new Promise((resolve) => {
    const reader = new FileReader();
    const spark = new SparkMD5.ArrayBuffer();

    reader.onload = (e: any) => {
      spark.append(e.target.result);
      resolve(spark.end());
    };

    reader.readAsArrayBuffer(file);
  });

/** 切片 */
const createChunks = (file: File, size: number) => {
  if (!file || size <= 0) return [];
  const chunks: Blob[] = [];
  for (let cur = 0; cur < file.size; cur += size) {
    chunks.push(file.slice(cur, cur + size));
  }
  return chunks;
};

/** 主上传流程 */
export async function uploadByChunks(file: File, onProgress?: (percent: number) => void) {
  const fileHash = await computeHash(file);

  // 初始化上传
  const initRes = await initUpload({
    fileName: file.name,
    fileSize: file.size,
    fileHash
  });
  const data = initRes.data;

  /** 情况一：文件已存在，直接返回 */
  if (data.fileExists) {
    const oss = await getOssListByIds(data.fileId);
    const info = oss.data[0];
    return { ossId: data.fileId, fileName: info?.fileName, url: info?.url };
  }

  /** 情况二：不需要分片，可直接整文件 PUT 上传 */
  if (!data.chunksInfo?.length) {
    const resp = await fetch(data.uploadUrl, { method: 'PUT', body: file });

    if (resp.ok) {
      return (await finishUpload(fileHash)).data;
    }
    return Promise.reject('上传失败');
  }

  /** 情况三：需要分片上传 */
  const chunks = createChunks(file, data.chunkSize);
  const chunksInfo = data.chunksInfo;

  for (let i = 0; i < chunksInfo.length; i++) {
    const { presignUrl } = chunksInfo[i];

    // 上传单个分片
    const uploadResp = await fetch(presignUrl, { method: 'PUT', body: chunks[i] });
    if (!uploadResp.ok) continue;

    // 通知分片完成
    const res = await completeUpload({
      uploadId: data.uploadId,
      index: i,
      fileHash,
      presignUrl
    });

    if (res.code === 200) {
      onProgress?.(Math.round(((i + 1) / chunksInfo.length) * 100));
    }
  }

  // 通知合并文件
  return finishUpload(fileHash);
}
