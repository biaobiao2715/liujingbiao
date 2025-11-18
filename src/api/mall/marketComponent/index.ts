import request from '@/utils/request';
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
