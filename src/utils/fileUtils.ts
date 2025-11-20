/**
 * 格式化文件大小（输入：字节 B）
 * @param size 文件大小（单位：B）
 * @param decimals 保留小数位，默认 2
 */
const formatFileSize = (size: number, decimals = 2): string => {
  console.log(size);
  
  if (size === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let value = size;

  while (value >= 1024 && index < units.length - 1) {
    value = value / 1024;
    index++;
  }

  // 不让四舍五入撑大结果（如 8.999 -> 9），只截断
  const factor = Math.pow(10, decimals);
  value = Math.floor(value * factor) / factor;

  return `${value.toFixed(decimals)} ${units[index]}`;
};

export { formatFileSize };
