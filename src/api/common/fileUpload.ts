// 通用文件上传接口
import axios from 'axios';
import { getToken } from '@/utils/auth';

// FastGPT 配置（严格按照接口文档）
const FASTGPT_CONFIG = {
  // 接口地址（直接调用，不使用代理）
  uploadUrl: 'http://8.153.15.72:81/fastgpt/uploadFile',
  analysisUrl: 'http://8.153.15.72:81/fastgpt/fileAnalysis',
  // 默认值（可通过环境变量覆盖）
  defaultClientId: 'e5cd7e4891bf95d1d19206ce24a7b32e',
  defaultAppId: '693144b8dd48d8d992951257',
  // 默认 API Key（如果环境变量未设置，使用此值）
  defaultApiKey: 'fastgpt-g3LTJRTgr4CgOptvJpY3tStnuIF3sh8ZV2MgWOu5QT16F80GU7Y7zFCLan',
  // 文件大小限制（默认 10MB，可通过环境变量覆盖）
  maxFileSize: 10 * 1024 * 1024 // 10MB
};

// 创建一个专门用于 FastGPT 的 axios 实例（不继承默认拦截器，避免自动添加项目内部的 token）
const fastGPTAxios = axios.create({
  timeout: 60000,
  maxContentLength: Infinity,
  maxBodyLength: Infinity
});

// FastGPT 请求拦截器：只添加 FastGPT 需要的认证信息
fastGPTAxios.interceptors.request.use((config) => {
  const env = (import.meta as any)?.env || {};
  
  // 获取 FastGPT 认证信息（优先使用环境变量，否则使用默认值）
  const fastGPTApiKey = env.VITE_FASTGPT_API_KEY || env.VITE_FILE_PARSE_API_KEY || FASTGPT_CONFIG.defaultApiKey;
  const fastGPTClientId = env.VITE_FASTGPT_CLIENT_ID || env.VITE_FILE_PARSE_CLIENT_ID || FASTGPT_CONFIG.defaultClientId;
  
  if (!config.headers) {
    config.headers = {} as any;
  }
  
  // 严格按照接口文档：Authorization Bearer + clientId（注意大小写）
  // 确保 Authorization header 始终设置（核心修复）
  config.headers['Authorization'] = `Bearer ${fastGPTApiKey}`;
  config.headers['clientId'] = fastGPTClientId; // 注意：字段名是 clientId（首字母大写），不是 clientid
  
  // FormData 请求：删除 Content-Type，让浏览器自动设置 multipart/form-data（包含 boundary）
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
  }
  
  // 调试：打印认证信息和实际请求头（生产环境可移除）
  if (process.env.NODE_ENV === 'development') {
    console.log('FastGPT 请求认证信息:', {
      url: config.url,
      method: config.method,
      hasApiKey: !!fastGPTApiKey,
      apiKeyPreview: fastGPTApiKey ? fastGPTApiKey.substring(0, 8) + '...' + fastGPTApiKey.substring(fastGPTApiKey.length - 4) : '未设置',
      headers: {
        Authorization: config.headers['Authorization'] || '未设置',
        clientId: config.headers['clientId'] || '未设置'
      },
      // 打印实际发送的 header（用于验证）
      actualHeaders: {
        Authorization: config.headers['Authorization'],
        clientId: config.headers['clientId']
      }
    });
  }
  
  return config;
});

// FastGPT 响应拦截器：增强错误处理
fastGPTAxios.interceptors.response.use(
  (response) => {
    // 成功响应直接返回
    return response;
  },
  (error) => {
    // 错误处理：提供更明确的错误信息
    if (error.response) {
      const { status, data } = error.response;
      
      // 500 错误：可能是文件大小超限、服务器配置问题
      if (status === 500) {
        const errorMsg = data?.message || data?.msg || data?.error || '服务器内部错误';
        console.error('FastGPT 500 错误详情:', {
          status,
          message: errorMsg,
          data: data,
          // 提示可能的原因
          possibleCauses: [
            '文件大小超过服务器限制（建议使用小于 10MB 的文件测试）',
            '服务器端 chat bucket 不存在或无写入权限',
            '服务器端配置错误（Nginx client_max_body_size 限制）',
            'FastGPT 应用代码异常'
          ]
        });
        
        // 如果是文件上传错误，提供更明确的提示
        if (error.config?.url?.includes('uploadFile')) {
          error.message = `文件上传失败（500错误）：${errorMsg}。可能原因：1) 文件大小超过限制（建议使用小于10MB的文件）；2) 服务器配置问题。请检查文件大小或联系管理员查看服务器日志。`;
        }
      }
      
      // 403 错误：授权问题
      if (status === 403) {
        console.error('FastGPT 403 错误详情:', {
          status,
          message: data?.message || data?.msg || '未授权',
          headers: error.config?.headers
        });
        error.message = `授权失败（403错误）：请检查 API Key 是否有效，是否有文件上传权限。`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('FastGPT 请求超时或网络错误:', error.message);
      error.message = `网络错误：无法连接到 FastGPT 服务器，请检查网络连接或服务器地址是否正确。`;
    }
    
    return Promise.reject(error);
  }
);

/**
 * 文件自动解析上传接口
 * @param file 文件对象
 * @returns Promise
 */
export function uploadFileForParse(file: File, data?: any) {
  const env = (import.meta as any)?.env || {};
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bucketName', env.VITE_FILE_PARSE_BUCKET || 'chat'); // 后端必填
  // 可选 data 透传（如 { appId }），后端要求 JSON 字符串
  if (data !== undefined) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    formData.append('data', payload);
  } else if (env.VITE_FILE_PARSE_APPID) {
    formData.append('data', JSON.stringify({ appId: env.VITE_FILE_PARSE_APPID }));
  }

  // 获取认证信息（优先使用环境变量，否则使用项目统一的认证方式）
  const token = env.VITE_FILE_PARSE_TOKEN || getToken();
  const clientId = env.VITE_FILE_PARSE_CLIENTID || import.meta.env.VITE_APP_CLIENT_ID;
  
  const headers: any = {};
  
  // 添加认证信息（格式：Bearer + Token）
  if (token) {
    // 如果环境变量中的 token 已经包含 Bearer，直接使用；否则添加 Bearer 前缀
    headers['Authorization'] = token.startsWith('Bearer ') ? token : 'Bearer ' + token;
  }
  if (clientId) {
    headers['clientid'] = clientId;
  }
  
  // 注意：不设置 Content-Type，让浏览器自动设置 multipart/form-data（包含 boundary）

  // 走代理，避免浏览器跨域/不支持 OCR 的限制（在 vite.config.ts 配置 /file-parse -> 8.153.15.72:3001）
  return axios({
    url: '/file-parse/api/common/file/upload',
    method: 'post',
    headers,
    data: formData
  });
}

/**
 * FastGPT 文件上传接口（直接调用，不使用代理）
 * @param file 文件对象
 * @param appId 应用ID（可选）
 * @param options 可选配置（如 maxFileSize）
 * @returns Promise
 */
export function uploadFileToFastGPT(file: File, appId?: string, options?: { maxFileSize?: number }) {
  // 验证文件对象
  if (!file || !(file instanceof File)) {
    throw new Error('无效的文件对象');
  }
  
  // 文件大小验证（核心修复：防止文件过大导致 500 错误）
  const env = (import.meta as any)?.env || {};
  const maxFileSize = options?.maxFileSize || 
                      (env.VITE_FASTGPT_MAX_FILE_SIZE ? parseInt(env.VITE_FASTGPT_MAX_FILE_SIZE) : null) ||
                      FASTGPT_CONFIG.maxFileSize;
  
  if (file.size > maxFileSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = (maxFileSize / (1024 * 1024)).toFixed(2);
    throw new Error(`文件大小 ${sizeMB}MB 超过限制 ${maxMB}MB，请使用更小的文件或联系管理员调整服务器配置`);
  }
  
  const formData = new FormData();
  
  // 必需参数：bucketName（严格按照接口文档）
  formData.append('bucketName', 'chat');
  
  // 必需参数：file（显式传递文件名，确保后端能正确接收）
  formData.append('file', file, file.name);
  
  // 可选参数：data（JSON字符串格式）
  const finalAppId = appId || env.VITE_FILE_PARSE_APPID || FASTGPT_CONFIG.defaultAppId;
  formData.append('data', JSON.stringify({ appId: finalAppId }));
  
  // 调试：打印文件信息
  if (process.env.NODE_ENV === 'development') {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    console.log('FastGPT 文件上传信息:', {
      name: file.name,
      size: file.size,
      sizeMB: `${sizeMB}MB`,
      type: file.type,
      bucketName: 'chat',
      appId: finalAppId,
      uploadUrl: FASTGPT_CONFIG.uploadUrl,
      maxFileSize: `${(maxFileSize / (1024 * 1024)).toFixed(2)}MB`
    });
  }

  // 直接调用 FastGPT 接口（不使用代理）
  return fastGPTAxios({
    url: FASTGPT_CONFIG.uploadUrl,
    method: 'post',
    data: formData
  });
}

/**
 * FastGPT 文件解析接口（严格按照接口文档格式，直接调用，不使用代理）
 * @param previewUrl 文件预览URL（从 uploadFileToFastGPT 返回的 previewUrl）
 * @param extractPrompt 提取提示词
 * @param appId 应用ID（可选，默认使用环境变量或默认值）
 * @returns Promise
 */
export function fileAnalysis(previewUrl: string, extractPrompt: string, appId?: string) {
  const env = (import.meta as any)?.env || {};
  const defaultAppId = appId || env.VITE_FILE_PARSE_APPID || FASTGPT_CONFIG.defaultAppId;
  
  // 严格按照接口文档构造请求体（使用 variables 和 extract_prompt）
  const requestData = {
    variables: {
      file: [
        {
          type: 'file',
          url: previewUrl // 使用上传接口返回的 previewUrl
        }
      ],
      extract_prompt: extractPrompt
    },
    appId: defaultAppId,
    detail: false,
    stream: false
  };
  
  // 调试：打印请求信息
  if (process.env.NODE_ENV === 'development') {
    console.log('FastGPT 文件解析请求:', {
      previewUrl,
      appId: defaultAppId,
      analysisUrl: FASTGPT_CONFIG.analysisUrl,
      extractPromptLength: extractPrompt.length
    });
  }
  
  // 直接调用 FastGPT 接口（不使用代理），使用独立的 axios 实例确保认证信息正确
  return fastGPTAxios({
    url: FASTGPT_CONFIG.analysisUrl,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: requestData
  });
}

