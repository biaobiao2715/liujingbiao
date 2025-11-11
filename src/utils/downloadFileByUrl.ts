/**
 * 下载文件到本地
 * @param url 文件的 URL
 * @param filename 下载后的文件名
 */
export function downloadFileByUrl(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // 确保即使是 PDF 文件也会被下载
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
