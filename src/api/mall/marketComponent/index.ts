import request from '@/utils/request';
import axios from 'axios';
import { getToken } from '@/utils/auth';

//今日行情列表数据
export function todayTrendList(data: any) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/list',
    method: 'get',
    params: data
  });
}
// 查询价格走势图
export function priceActionList(data: any) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/priceAction',
    method: 'get',
    params: data
  });
}
//右侧价格说明
export function priceExplanationList(data: any) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/rightExplain',
    method: 'get',
    params: data
  });
}
//热地图数据
export function heatmapList(data: any) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/hotMap',
    method: 'get',
    params: data
  });
}
//价格走势热门推荐
export function hotRecommendationList(data: any) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/marketAnalysisDailyHotRecommendation',
    method: 'get',
    params: data
  });
}
//价格专项报告
export function priceSpecialReportList(data: any) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/hnPriceSpecialReport',
    method: 'get',
    params: data
  });
}
//价格预测与分析图表数据
export function pricePredictionList(data: any) {
  return request({
    url: '/grain-sales/marketAnalysisDaily/pricePredictionAnalysis',
    method: 'get',
    params: data
  });
}

// FastGPT 配置
const FASTGPT_CONFIG = {
  analysisUrl: 'http://8.153.15.72:81/fastgpt/fileAnalysis',
  defaultClientId: 'e5cd7e4891bf95d1d19206ce24a7b32e',
  defaultApiKey: 'fastgpt-g3LTJRTgr4CgOptvJpY3tStnuIF3sh8ZV2MgWOu5QT16F80GU7Y7zFCLan'
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
  
  // 严格按照接口文档：Authorization Bearer + clientId
  config.headers['Authorization'] = `Bearer ${fastGPTApiKey}`;
  config.headers['clientId'] = fastGPTClientId;
  
  return config;
});

//价格预测分析（直连 FastGPT 服务端，使用独立的 axios 实例避免跨域问题）
export function fileAnalysis(data: any) {
  return fastGPTAxios({
    url: FASTGPT_CONFIG.analysisUrl,
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    data: data
  });
}