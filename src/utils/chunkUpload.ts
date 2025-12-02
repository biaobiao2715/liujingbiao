import { initUpload, completeUpload, finishUpload, getOssListByIds } from '@/api/login';
import SparkMD5 from 'spark-md5';

const UPLOAD_ID = generateUploadId();

function generateUploadId() {
  return crypto?.randomUUID?.() || generateUUIDFallback(); // 浏览器原生支持
}

function generateUUIDFallback() {
  // 简单 UUID 生成（RFC4122 v4 格式）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** 计算文件 MD5 */
async function computeHash(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    const spark = new SparkMD5.ArrayBuffer();

    reader.onload = (e: any) => {
      spark.append(e.target.result);
      resolve(spark.end());
    };

    reader.readAsArrayBuffer(file);
  });
}

/** 将文件切片 */
function createChunks(file: File, size: number) {
  const chunks: Blob[] = [];
  let cur = 0;

  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + size));
    cur += size;
  }

  return chunks;
}

/** 主上传流程 */
export async function uploadByChunks(file: File, onProgress?: (percent: number) => void) {
  // (1) 计算 MD5
  const fileHash = await computeHash(file);

  // (2) 初始化上传，获得 uploadId
  const initRes = await initUpload({
    uploadId: UPLOAD_ID,
    fileName: file.name,
    fileSize: file.size,
    fileHash
  });
  if (initRes.data.fileExists) {
    const oss = await getOssListByIds(initRes.data.fileId);
    return { ossId: initRes.data.fileId, fileName: oss.data[0]?.fileName, url: oss.data[0]?.url };
  }

  if (!initRes.data.chunkSize) return; // 不需要分片

  const chunksInfo = initRes.data.chunksInfo || [];

  const chunks = createChunks(file, initRes.data.chunkSize);

  // 调用minio的接口
  for (let i = 0; i < chunksInfo.length; i++) {
    const chunkInfo = chunksInfo[i];
    const chunk = chunks[i];

    // 第一步：上传该 chunk
    const uploadResponse = await fetch(chunkInfo.presignUrl, {
      method: 'PUT',
      body: chunk
    });
    console.log('上传完成:', uploadResponse);

    if (uploadResponse.ok) {
      // 第二步：单片上传成功后立即告诉服务端
      const res = await completeUpload({
        uploadId: initRes.data.uploadId,
        index: i,
        fileHash,
        presignUrl: chunkInfo.presignUrl
      });

      if (res.code === 200) {
        onProgress?.(Math.round((i / chunksInfo.length) * 100));
      }
    }
  }

  // (4) 所有分片上传完 -> 通知后端合并
  const mergeRes = await finishUpload(fileHash);

  return mergeRes;
}
