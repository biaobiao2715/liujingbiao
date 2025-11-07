/**
 * 根据传入的数字（单位为 KB）动态判断并赋值单位
 * @param size 数字大小，单位为 KB
 * @returns 格式化后的字符串，带单位
 */
const formatFileSize = (size: number): string => {
  if (size < 1024) {
    return `${size.toFixed(2)} KB`; // 小于 1024 KB，单位为 KB
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} MB`; // 小于 1024 MB，单位为 MB
  } else {
    return `${(size / 1024 / 1024).toFixed(2)} GB`; // 大于等于 1024 MB，单位为 GB
  }
};
export { formatFileSize };
