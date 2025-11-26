import { initChunkUpload, uploadChunk, mergeChunkUpload } from '@/api/login';

export const uploadByChunks = async (file: File, onProgress: (p: number) => void) => {
  const chunkSize = 5 * 1024 * 1024; // 5MB
  const chunks: Blob[] = [];
  let cur = 0;

  // 1. 切片
  while (cur < file.size) {
    chunks.push(file.slice(cur, cur + chunkSize));
    cur += chunkSize;
  }

  // ---------------------------
  // 2. 调用初始化接口
  // ---------------------------
  const timeoutConfig = { timeout: 0 };

  const initRes = await initChunkUpload(
    {
      fileName: file.name,
      contentType: file.type
    },
    timeoutConfig
  );

  // 后端返回的 uploadId
  const uploadId = initRes.data.uploadId;

  // ---------------------------
  // 3. 逐片上传
  // ---------------------------
  let uploadedBytes = 0; // 已上传的总字节数
  const totalBytes = file.size;

  const partList: any[] = [];
  for (let index = 0; index < chunks.length; index++) {
    const chunk = chunks[index];

    const formData = new FormData();
    formData.append('file', chunks[index]);
    const res = await uploadChunk(
      { uploadId, partNumber: (index + 1).toString() },
      formData,
      {
        timeout: 0,
        onUploadProgress: (e: ProgressEvent) => {
          // 当前分片已上传多少字节
          const currentChunkUploaded = e.loaded;

          // 当前总上传 = 已完成分片的字节 + 当前片上传的字节
          const totalUploaded = uploadedBytes + currentChunkUploaded;

          const percent = Number(((totalUploaded / totalBytes) * 100).toFixed(2));

          onProgress(percent);
        }
      }
    );

    // 当前分片上传完成，累计字节
    uploadedBytes += chunk.size;
    partList.push(res.data);
  }
  // ---------------------------
  // 4. 告诉后端合并分片
  // ---------------------------
  const mergeRes = await mergeChunkUpload(
    {
      uploadId,
      parts: partList
    },
    timeoutConfig
  );

  return mergeRes.data;
};
