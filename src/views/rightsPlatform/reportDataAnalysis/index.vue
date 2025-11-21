<!-- 
标题：    index.vue
功能：    举报数据分析页面
说明：    统计各种举报类别的举报数量和趋势，生成举报热点地图和分布图
当前版本：1.0
开发信息：Created by Cursor AI 2025-01-XX
修改人信息：
修改内容：
-->
<template>
  <div class="report-data-analysis-page" v-loading="loading">
    <!-- 顶部筛选区域 -->
    <div class="filter-section">
      <div class="filter-left">
        <span class="filter-label">举报类别:</span>
        <el-select
          v-model="queryParams.reportTypeId"
          placeholder="请选择"
          clearable
          style="width: 200px"
          @change="handleReportTypeChange"
        >
          <el-option
            v-for="item in reportTypeOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <div class="filter-right">
        <el-date-picker
          v-model="mapTimeRange"
          type="datetimerange"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          style="width: 380px"
          @change="handleMapTimeChange"
        />
        <el-button @click="handleMapReset">重置</el-button>
      </div>
    </div>

    <!-- 地图区域 -->
    <div class="map-section">
      <div ref="mapContainer" class="map-container"></div>
    </div>

    <!-- 底部数据分析区域 -->
    <div class="analysis-section">
      <div class="analysis-header">
        <div class="header-left">
          <h3 class="section-title">数据分析 (个)</h3>
          <div class="category-buttons">
            <el-button
              v-for="item in reportTypeOptions"
              :key="item.value"
              :type="queryParams.reportTypeId === item.value ? 'primary' : ''"
              @click="handleCategoryClick(item.value)"
            >
              {{ item.label }}
            </el-button>
          </div>
        </div>
        <div class="header-right">
          <el-button-group>
            <el-button :type="timeFilter === 'yesterday' ? 'primary' : ''" @click="handleTimeFilter('yesterday')">
              昨日
            </el-button>
            <el-button :type="timeFilter === 'today' ? 'primary' : ''" @click="handleTimeFilter('today')">
              今日
            </el-button>
            <el-button :type="timeFilter === 'week' ? 'primary' : ''" @click="handleTimeFilter('week')">
              本周
            </el-button>
          </el-button-group>
          <el-date-picker
            v-model="chartTimeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            style="width: 380px; margin-left: 12px"
            @change="handleChartTimeChange"
          />
          <el-button style="margin-left: 12px" @click="handleChartReset">重置</el-button>
        </div>
      </div>

      <div class="analysis-content">
        <!-- 左侧柱状图 -->
        <div class="chart-section">
          <div class="chart-title">举报数据分布图</div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color" style="background: #409eff"></span>
              <span>待处理</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #e6a23c"></span>
              <span>处理中</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #f56c6c"></span>
              <span>已驳回</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #909399"></span>
              <span>已撤回</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background: #67c23a"></span>
              <span>已结案</span>
            </div>
          </div>
          <div ref="chartContainer" class="chart-container"></div>
        </div>

        <!-- 右侧详情面板 -->
        <div class="detail-panel" v-if="selectedDateData">
          <div class="panel-date">{{ selectedDateData.date }}</div>
          <div class="panel-content">
            <div class="detail-item">
              <span class="detail-label">待处理举报数量</span>
              <span class="detail-value">{{ selectedDateData.status0Count || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">处理中举报数量</span>
              <span class="detail-value">{{ selectedDateData.status1Count || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">已驳回举报数量</span>
              <span class="detail-value">{{ selectedDateData.status2Count || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">已撤回举报数量</span>
              <span class="detail-value">{{ selectedDateData.status4Count || 0 }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">已结案举报数量</span>
              <span class="detail-value">{{ selectedDateData.status3Count || 0 }}</span>
            </div>
            <div class="detail-total">
              <span class="total-label">总计:</span>
              <span class="total-value">{{ selectedDateData.total || 0 }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch, toRefs, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { getReportCountAnalysis, getReportCountByProvince } from '@/api/rightsPlatform/customerreport/index';
// @ts-ignore
import chinaGeoJson from '@/views/mall/Components/AboutMarketComponents/chinaMap.json';

// 数据定义
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { report_type_id, report_status } = toRefs<any>((proxy as any)?.useDict('report_type_id', 'report_status'));

const loading = ref(false);
const mapContainer = ref<HTMLElement | null>(null);
const chartContainer = ref<HTMLElement | null>(null);
let mapChartInstance: ECharts | null = null;
let barChartInstance: ECharts | null = null;

// 查询参数
const queryParams = reactive({
  reportTypeId: undefined as number | undefined,
  createTime: undefined as string | undefined
});

// 时间范围
const mapTimeRange = ref<[string, string] | null>(null);
const chartTimeRange = ref<[string, string] | null>(null);
const timeFilter = ref<'yesterday' | 'today' | 'week' | 'custom'>('today');

// 举报类别选项
const reportTypeOptions = ref<Array<{ label: string; value: number }>>([]);
const reportStatusOptions = ref<Array<{ label: string; value: string }>>([]);

watch(
  report_type_id,
  (val) => {
    if (val && Array.isArray(val.value)) {
      reportTypeOptions.value = val.value.map((item: any) => ({
        label: item.label,
        value: Number(item.value)
      }));
    } else {
      reportTypeOptions.value = [
        { label: '假种子销售', value: 1 },
        { label: '品种权侵权', value: 2 },
        { label: '虚假宣传', value: 3 },
        { label: '无证生产经营', value: 4 },
        { label: '其他', value: 5 }
      ];
    }
  },
  { immediate: true }
);

watch(
  report_status,
  (val) => {
    if (val && Array.isArray(val.value)) {
      reportStatusOptions.value = val.value.map((item: any) => ({
        label: item.label,
        value: String(item.value)
      }));
    } else {
      reportStatusOptions.value = [
        { label: '待处理', value: '0' },
        { label: '处理中', value: '1' },
        { label: '已驳回', value: '2' },
        { label: '已结案', value: '3' },
        { label: '已撤回', value: '4' }
      ];
    }
  },
  { immediate: true }
);

// 图表数据
const chartData = ref<any[]>([]);
const selectedDateData = ref<any>(null);

// 初始化
onMounted(async () => {
  initMapChart();
  initBarChart();
  await fetchMapData();
  await fetchChartData();
});

onUnmounted(() => {
  if (mapChartInstance) {
    mapChartInstance.dispose();
  }
  if (barChartInstance) {
    barChartInstance.dispose();
  }
});

// 初始化地图
const initMapChart = () => {
  if (!mapContainer.value) return;
  
  mapChartInstance = echarts.init(mapContainer.value);
  
  // 注册地图
  try {
    echarts.registerMap('china', chinaGeoJson as any);
  } catch (error) {
    console.error('注册地图失败:', error);
  }
  
  nextTick(() => {
    mapChartInstance?.resize();
    updateMapChart();
  });
  
  window.addEventListener('resize', () => {
    mapChartInstance?.resize();
  });
};

// 更新地图
const updateMapChart = (data: any[] = []) => {
  if (!mapChartInstance) return;
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.data) {
          const d = params.data;
          return `${params.name}<br/>
            待处理: ${d.status0Count || 0}<br/>
            处理中: ${d.status1Count || 0}<br/>
            已驳回: ${d.status2Count || 0}<br/>
            已撤回: ${d.status4Count || 0}<br/>
            已结案: ${d.status3Count || 0}`;
        }
        return `${params.name}<br/>暂无数据`;
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      left: 20,
      bottom: 60,
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#e0f3ff', '#409eff', '#1d39c4']
      }
    },
    series: [
      {
        name: '举报数据',
        type: 'map',
        map: 'china',
        roam: true,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 10
        },
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#409eff'
          }
        },
        data: data.map((item: any) => ({
          name: item.provinceName || item.name,
          value: Number(item.statusCount || 0),
          status0Count: Number(item.status0Count || 0),
          status1Count: Number(item.status1Count || 0),
          status2Count: Number(item.status2Count || 0),
          status3Count: Number(item.status3Count || 0),
          status4Count: Number(item.status4Count || 0)
        }))
      }
    ]
  };
  
  mapChartInstance.setOption(option, true);
};

// 获取地图数据
const fetchMapData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (queryParams.reportTypeId) {
      params.reportTypeId = queryParams.reportTypeId;
    }
    if (mapTimeRange.value && mapTimeRange.value.length === 2) {
      params.startTime = mapTimeRange.value[0];
      params.endTime = mapTimeRange.value[1];
    }
    
    const response: any = await getReportCountByProvince(params);
    if (response && response.code === 200 && response.data) {
      updateMapChart(response.data);
    }
  } catch (error) {
    console.error('获取地图数据失败:', error);
    ElMessage.error('获取地图数据失败');
  } finally {
    loading.value = false;
  }
};

// 初始化柱状图
const initBarChart = () => {
  if (!chartContainer.value) return;
  
  barChartInstance = echarts.init(chartContainer.value);
  
  nextTick(() => {
    barChartInstance?.resize();
    updateBarChart();
  });
  
  window.addEventListener('resize', () => {
    barChartInstance?.resize();
  });
};

// 更新柱状图
const updateBarChart = (data: any[] = []) => {
  if (!barChartInstance) return;
  
  if (data.length === 0) {
    chartData.value = [];
    barChartInstance.setOption({}, true);
    return;
  }
  
  // 处理数据
  const dates = data.map((item: any) => {
    const date = item.createTime || item.date;
    if (date) {
      const d = new Date(date);
      return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    }
    return '';
  });
  
  const status0Data = data.map((item: any) => Number(item.status0Count || 0));
  const status1Data = data.map((item: any) => Number(item.status1Count || 0));
  const status2Data = data.map((item: any) => Number(item.status2Count || 0));
  const status4Data = data.map((item: any) => Number(item.status4Count || 0));
  const status3Data = data.map((item: any) => Number(item.status3Count || 0));
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params: any) => {
        let result = `${params[0].axisValue}<br/>`;
        let total = 0;
        params.forEach((param: any) => {
          result += `${param.marker}${param.seriesName}: ${param.value}<br/>`;
          total += Number(param.value);
        });
        result += `<b>合计: ${total}</b>`;
        return result;
      }
    },
    legend: {
      show: false
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 0
      }
    },
    yAxis: {
      type: 'value',
      min: 0
    },
    series: [
      {
        name: '待处理',
        type: 'bar',
        stack: 'total',
        data: status0Data,
        itemStyle: {
          color: '#409eff'
        }
      },
      {
        name: '处理中',
        type: 'bar',
        stack: 'total',
        data: status1Data,
        itemStyle: {
          color: '#e6a23c'
        }
      },
      {
        name: '已驳回',
        type: 'bar',
        stack: 'total',
        data: status2Data,
        itemStyle: {
          color: '#f56c6c'
        }
      },
      {
        name: '已撤回',
        type: 'bar',
        stack: 'total',
        data: status4Data,
        itemStyle: {
          color: '#909399'
        }
      },
      {
        name: '已结案',
        type: 'bar',
        stack: 'total',
        data: status3Data,
        itemStyle: {
          color: '#67c23a'
        }
      }
    ]
  };
  
  barChartInstance.setOption(option, true);
  
  // 添加点击事件
  barChartInstance.off('click');
  barChartInstance.on('click', (params: any) => {
    const index = params.dataIndex;
    if (data[index]) {
      const item = data[index];
      selectedDateData.value = {
        date: item.createTime || item.date || dates[index],
        status0Count: Number(item.status0Count || 0),
        status1Count: Number(item.status1Count || 0),
        status2Count: Number(item.status2Count || 0),
        status3Count: Number(item.status3Count || 0),
        status4Count: Number(item.status4Count || 0),
        total: Number(item.status0Count || 0) + 
               Number(item.status1Count || 0) + 
               Number(item.status2Count || 0) + 
               Number(item.status3Count || 0) + 
               Number(item.status4Count || 0)
      };
    }
  });
};

// 获取柱状图数据
const fetchChartData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (queryParams.reportTypeId) {
      params.reportTypeId = queryParams.reportTypeId;
    }
    if (chartTimeRange.value && chartTimeRange.value.length === 2) {
      params.startTime = chartTimeRange.value[0];
      params.endTime = chartTimeRange.value[1];
    } else if (timeFilter.value === 'today') {
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      params.startTime = formatDateTime(start);
      params.endTime = formatDateTime(end);
    } else if (timeFilter.value === 'yesterday') {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const start = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 0, 0, 0);
      const end = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
      params.startTime = formatDateTime(start);
      params.endTime = formatDateTime(end);
    } else if (timeFilter.value === 'week') {
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(today);
      weekEnd.setHours(23, 59, 59, 999);
      params.startTime = formatDateTime(weekStart);
      params.endTime = formatDateTime(weekEnd);
    }
    
    const response: any = await getReportCountAnalysis(params);
    if (response && response.code === 200 && response.data) {
      chartData.value = response.data;
      updateBarChart(response.data);
    }
  } catch (error) {
    console.error('获取图表数据失败:', error);
    ElMessage.error('获取图表数据失败');
  } finally {
    loading.value = false;
  }
};

// 格式化日期时间
const formatDateTime = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 事件处理
const handleReportTypeChange = () => {
  fetchMapData();
  fetchChartData();
};

const handleMapTimeChange = () => {
  fetchMapData();
};

const handleMapReset = () => {
  mapTimeRange.value = null;
  fetchMapData();
};

const handleCategoryClick = (value: number) => {
  queryParams.reportTypeId = value;
  fetchChartData();
};

const handleTimeFilter = (type: 'yesterday' | 'today' | 'week') => {
  timeFilter.value = type;
  chartTimeRange.value = null;
  fetchChartData();
};

const handleChartTimeChange = () => {
  timeFilter.value = 'custom';
  fetchChartData();
};

const handleChartReset = () => {
  chartTimeRange.value = null;
  timeFilter.value = 'today';
  fetchChartData();
};
</script>

<style scoped lang="scss">
.report-data-analysis-page {
  padding: 20px;
  background: #f5f6f8;
  min-height: calc(100vh - 120px);
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 16px;
  
  .filter-left {
    display: flex;
    align-items: center;
    gap: 12px;
    
    .filter-label {
      font-size: 14px;
      color: #606266;
    }
  }
  
  .filter-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

.map-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  
  .map-container {
    width: 100%;
    height: 600px;
  }
}

.analysis-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  
  .analysis-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 20px;
      
      .section-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
      
      .category-buttons {
        display: flex;
        gap: 8px;
      }
    }
    
    .header-right {
      display: flex;
      align-items: center;
    }
  }
  
  .analysis-content {
    display: flex;
    gap: 20px;
    
    .chart-section {
      flex: 1;
      
      .chart-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 12px;
      }
      
      .chart-legend {
        display: flex;
        gap: 20px;
        margin-bottom: 16px;
        
        .legend-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #606266;
          
          .legend-color {
            width: 16px;
            height: 16px;
            border-radius: 2px;
          }
        }
      }
      
      .chart-container {
        width: 100%;
        height: 400px;
      }
    }
    
    .detail-panel {
      width: 300px;
      background: #f5f7fa;
      border-radius: 8px;
      padding: 20px;
      
      .panel-date {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
        margin-bottom: 20px;
        text-align: center;
      }
      
      .panel-content {
        .detail-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 16px;
          
          .detail-label {
            font-size: 14px;
            color: #606266;
          }
          
          .detail-value {
            font-size: 14px;
            font-weight: 600;
            color: #303133;
          }
        }
        
        .detail-total {
          display: flex;
          justify-content: space-between;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #dcdfe6;
          
          .total-label {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
          
          .total-value {
            font-size: 18px;
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }
  }
}
</style>

