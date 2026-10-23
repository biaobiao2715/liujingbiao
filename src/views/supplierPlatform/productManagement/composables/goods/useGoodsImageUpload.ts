import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import type { GoodsImage } from './useGoodsImages';

interface UseGoodsImageUploadOptions {
  fileType?: string[]; // 支持的文件类型
  maxSize?: number; // 文件最大大小，单位MB
  maxCount?: number; // 最大文件数量
  onSuccess: (file: GoodsImage) => void; // 上传成功的回调
}

export function useGoodsImageUpload(options: UseGoodsImageUploadOptions) {
  // Destructuring and setting default values
  const { fileType = ['png', 'jpg', 'jpeg', 'bmp'], maxSize = 5, maxCount = 5, onSuccess } = options;

  /* ==========================
   * State
   ========================== */
  const picOpen = ref(false); // 图片预览对话框
  const cropOpen = ref(false); // 图片裁剪对话框
  const dialogImageUrl = ref(''); // 预览图片 URL
  const uploadBusy = ref(false); // 上传是否繁忙
  const rawFile = ref<File | null>(null); // 存储原始文件

  /* ==========================
   * File Handling
   ========================== */

  // 文件上传前的校验
  const beforeUpload = (file: File) => {
    if (uploadBusy.value) return false; // 防止同时上传多个文件

    // 校验文件扩展名
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !fileType.includes(ext)) {
      ElMessage.error(`仅支持 ${fileType.join('/')} 格式`);
      return false;
    }

    // 校验文件大小
    if (file.size / 1024 / 1024 > maxSize) {
      ElMessage.error(`图片不能超过 ${maxSize}MB`);
      return false;
    }

    // 设置上传状态
    uploadBusy.value = true;
    rawFile.value = file;
    console.log('beforeUpload', file);
    cropOpen.value = true; // 打开裁剪对话框

    return false; // 阻止默认上传行为
  };

  // 图片裁剪成功后的处理
  const onCropSuccess = (res: any) => {
    onSuccess({
      name: res.fileName || '商品主图', // 默认文件名
      url: res.url,
      path: res.url, // 直接使用 URL 作为路径
      fileType: '0', // 默认文件类型
      ossId: res.ossId
    });

    reset(); // 重置上传状态
  };

  // 上传文件超出数量的处理
  const handleExceed = () => {
    ElMessage.error(`上传文件数量不能超过 ${maxCount} 个!`);
  };

  // 预览图片
  const preview = (url: string) => {
    dialogImageUrl.value = url;
    picOpen.value = true;
  };

  // 重置上传状态
  const reset = () => {
    uploadBusy.value = false;
    cropOpen.value = false;
    rawFile.value = null; // 清空原始文件
  };

  /* ==========================
   * Expose
   ========================== */
  return {
    // State
    picOpen,
    cropOpen,
    dialogImageUrl,
    rawFile,

    // Actions
    beforeUpload,
    onCropSuccess,
    handleExceed,
    preview,
    reset
  };
}
