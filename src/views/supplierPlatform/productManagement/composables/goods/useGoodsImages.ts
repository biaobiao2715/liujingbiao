import { ref } from 'vue';

export interface GoodsImage {
  name: string;
  url: string;
  path: string;
  fileType: string;
  ossId?: string | number;
}

export function useGoodsImages() {
  /* =========================
   * state
   * ========================= */
  const images = ref<GoodsImage[]>([]);

  /* =========================
   * actions
   * ========================= */
  // 设置图片列表，避免不必要的数组复制
  const setImages = (list: GoodsImage[] = []) => {
    images.value.length = 0; // 清空当前图片列表
    images.value.push(...list); // 直接修改原数组
  };

  // 添加图片
  const addImage = (image: GoodsImage) => {
    images.value.push(image);
  };

  // 删除指定图片
  const removeImage = (index: number) => {
    if (index >= 0 && index < images.value.length) {
      images.value.splice(index, 1);
    }
  };

  // 清空所有图片
  const clearImages = () => {
    images.value.length = 0; // 直接清空数组
  };

  /* =========================
   * adapters（可选）
   * ========================= */
  // 将OSS列表适配为商品图片列表
  const adaptFromOssList = (ossList: any[] = []): GoodsImage[] => {
    return ossList.map((f) => ({
      name: f.originalName || '商品主图',
      url: f.url,
      path: f.url,
      fileType: '0', // 你可以将 '0' 替换为动态值，如果文件类型变化的话
      ossId: f.ossId
    }));
  };

  /* =========================
   * expose
   * ========================= */
  return {
    state: {
      images
    },

    actions: {
      setImages,
      addImage,
      removeImage,
      clearImages,
      adaptFromOssList
    }
  };
}
