// 通用文件上传接口
import axios from 'axios';

/**
 * 文件自动解析上传接口
 * @param file 文件对象
 * @returns Promise
 */
export function uploadFileForParse(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  // return axios.post('http://8.153.15.72:3001/api/common/file/upload', formData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data'
  //   }
  // });
    return axios({
    url: 'http://8.153.15.72:3001/api/common/file/upload',
    method: 'post',
        headers: {
      'Content-Type': 'multipart/form-data'
    },
    data: formData
  });
}


  

