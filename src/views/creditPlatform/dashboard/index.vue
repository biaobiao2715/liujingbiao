<!--
  标题: index.vue
  功能: 金融后台首页
  说明: 金融后台首页，展示信贷平台的各项统计数据和趋势分析。
  当前版本: 2.0
  开发信息: Created by 门世超 2025-10-20, Refactored 2025-11-22
-->
<template>
  <div class="credit-dashboard">
    <div class="dashboard-content">
      <div class="top-stats-row">
        <div class="top-stat-card-wrapper">
          <div class="top-stat-card card-blue">
            <div class="top-stat-icon">
              <img :src="icon110" alt="贷款待审批" />
            </div>
            <div class="top-stat-info">
              <div class="top-stat-label">贷款待审批 (件)</div>
              <div class="top-stat-value value-blue">{{ dashboardData.pendingApprovals }}</div>
            </div>
            <div class="top-stat-decoration">
              <img :src="icon115" alt="" />
            </div>
          </div>
        </div>
        <div class="top-stat-card-wrapper">
          <div class="top-stat-card card-purple">
            <div class="top-stat-icon">
              <img :src="icon111" alt="总申请贷款" />
            </div>
            <div class="top-stat-info">
              <div class="top-stat-label">总申请贷款 (件)</div>
              <div class="top-stat-value value-purple">{{ dashboardData.totalLoanApprovals }}</div>
            </div>
            <div class="top-stat-decoration">
              <img :src="icon116" alt="" />
            </div>
          </div>
        </div>
        <div class="top-stat-card-wrapper">
          <div class="top-stat-card card-cyan">
            <div class="top-stat-icon">
              <img :src="icon112" alt="贷款审批通过" />
            </div>
            <div class="top-stat-info">
              <div class="top-stat-label">贷款审批通过 (件)</div>
              <div class="top-stat-value value-cyan">{{ dashboardData.approvedLoans }}</div>
            </div>
            <div class="top-stat-decoration">
              <img :src="icon117" alt="" />
            </div>
          </div>
        </div>
        <div class="top-stat-card-wrapper">
          <div class="top-stat-card card-red">
            <div class="top-stat-icon">
              <img :src="icon113" alt="贷款审批驳回" />
            </div>
            <div class="top-stat-info">
              <div class="top-stat-label">贷款审批驳回 (件)</div>
              <div class="top-stat-value value-red">{{ dashboardData.rejectedLoans }}</div>
            </div>
            <div class="top-stat-decoration">
              <img :src="icon118" alt="" />
            </div>
          </div>
        </div>
        <div class="top-stat-card-wrapper">
          <div class="top-stat-card card-orange">
            <div class="top-stat-icon">
              <img :src="icon114" alt="贷款申请取消" />
            </div>
            <div class="top-stat-info">
              <div class="top-stat-label">贷款申请取消 (件)</div>
              <div class="top-stat-value value-orange">{{ dashboardData.cancelledApplications }}</div>
            </div>
            <div class="top-stat-decoration">
              <img :src="icon119" alt="" />
            </div>
          </div>
        </div>
      </div>

      <div class="main-content">
        <div class="bottom-chart-section">
          <div class="chart-stats-row">
            <div class="chart-stat-item">
              <div class="chart-stat-value">{{ formatWanInteger(dashboardData.totalApprovedAmount) }}</div>
              <div class="chart-stat-label">总贷款金额</div>
            </div>
            <div class="chart-stat-item">
              <div class="chart-stat-value">{{ formatWan(dashboardData.currentOverdueAmount) }}</div>
              <div class="chart-stat-label">当前逾期金额</div>
            </div>
            <div class="chart-stat-item">
              <div class="chart-stat-value">{{ formatRate(dashboardData.totalDefaultRate) }}%</div>
              <div class="chart-stat-label">总违约率</div>
            </div>
            <div class="chart-stat-item">
              <div class="chart-stat-value">{{ formatWan(dashboardData.monthlyReceivableAmount) }}</div>
              <div class="chart-stat-label">本月应收金额</div>
            </div>
            <div class="chart-stat-item">
              <div class="chart-stat-value">{{ formatWan(dashboardData.monthlyReceivedAmount) }}</div>
              <div class="chart-stat-label">本月已收金额</div>
            </div>
            <div class="chart-stat-item">
              <div class="chart-stat-value">{{ formatWan(dashboardData.monthlyOverdueAmount) }}</div>
              <div class="chart-stat-label">本月逾期金额</div>
            </div>
          </div>

          <div class="chart-title-row">
            <div class="chart-title">近6个月违约率趋势</div>
            <div class="chart-tabs">
              <el-button v-for="tab in chartTabs" :key="tab.value" size="small" disabled plain>
                {{ tab.label }}
              </el-button>
            </div>
          </div>
          
          <div ref="defaultRateChart" class="chart-container"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, getCurrentInstance, toRefs, type ComponentInternalInstance } from 'vue';
import * as echarts from 'echarts';
import { Money, Warning, TrendCharts } from '@element-plus/icons-vue';
import { getDashboardStats, getDashboardLineChart } from '@/api/creditPlatform/dashboard';

// 导入图片
import icon110 from '@/assets/images/finance/切图 110.png';
import icon111 from '@/assets/images/finance/切图 111.png';
import icon112 from '@/assets/images/finance/切图 112.png';
import icon113 from '@/assets/images/finance/切图 113.png';
import icon114 from '@/assets/images/finance/切图 114.png';
import icon115 from '@/assets/images/finance/切图 115.png';
import icon116 from '@/assets/images/finance/切图 116.png';
import icon117 from '@/assets/images/finance/切图 117.png';
import icon118 from '@/assets/images/finance/切图 118.png';
import icon119 from '@/assets/images/finance/切图 119.png';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_year_month } = toRefs<any>(proxy?.useDict('sys_year_month'));

interface DashboardData {
  pendingApprovals: number;
  totalLoanApprovals: number;
  approvedLoans: number;
  rejectedLoans: number;
  cancelledApplications: number;
  totalApprovedAmount: number;
  currentOverdueAmount: number;
  totalDefaultRate: number;
  monthlyReceivableAmount: number;
  monthlyReceivedAmount: number;
  monthlyOverdueAmount: number;
}

const dashboardData = ref<DashboardData>({
  pendingApprovals: 0,
  totalLoanApprovals: 0,
  approvedLoans: 0,
  rejectedLoans: 0,
  cancelledApplications: 0,
  totalApprovedAmount: 0,
  currentOverdueAmount: 0,
  totalDefaultRate: 0,
  monthlyReceivableAmount: 0,
  monthlyReceivedAmount: 0,
  monthlyOverdueAmount: 0
});

// 从字典获取年度月度选项（仅用于显示按钮文本）
const chartTabs = ref<Array<{ label: string; value: string }>>([]);

const defaultRateChart = ref<HTMLElement>();

// 金额统一展示为"万"单位（后端返回的是元，需要除以10000转换为万，保留两位小数，四舍五入）
const formatWan = (amount: number) => {
  if (amount === null || amount === undefined) return '--';
  const num = Number(amount);
  if (isNaN(num)) return '--';
  // 将元转换为万（除以10000），保留两位小数，四舍五入
  const wanAmount = (num / 10000).toFixed(2);
  return `${wanAmount}万`;
};

// 总贷款金额格式化（后端返回的已经是万，不需要除以10000，保留两位小数，直接加单位万）
const formatWanInteger = (amount: number) => {
  if (amount === null || amount === undefined) return '--';
  const num = Number(amount);
  if (isNaN(num)) return '--';
  // 后端返回的已经是万，保留两位小数，四舍五入
  const wanAmount = num.toFixed(2);
  return `${wanAmount}万`;
};

// 违约率格式化（保留两位小数，四舍五入）
const formatRate = (rate: number) => {
  if (rate === null || rate === undefined) return '--';
  const num = Number(rate);
  if (isNaN(num)) return '--';
  // 保留两位小数，四舍五入
  return num.toFixed(2);
};

const chartData = ref<{ yearData: any; monthData: any }>({
  yearData: null,
  monthData: null
});
let chartInstance: echarts.ECharts | null = null;

const initDefaultRateChart = () => {
  if (!defaultRateChart.value) return;
  if (chartInstance) {
    chartInstance.dispose();
  }
  chartInstance = echarts.init(defaultRateChart.value);

  updateChart();

  window.addEventListener('resize', () => {
    chartInstance?.resize();
  });
};

const updateChart = () => {
  if (!chartInstance) return;

  // 处理年度数据（总违约率，红色线）
  let yearXAxisData: string[] = [];
  let yearSeries: number[] = [];

  // 从字典获取年度月度选项（仅用于显示按钮文本）
  const yearMonthOptions = sys_year_month.value || [];
  if (chartData.value.yearData) {
    const yearData = chartData.value.yearData;
    if (yearData?.xAxis && yearData?.yAxis) {
      yearXAxisData = yearData.xAxis || [];
      const yAxisRaw = yearData.yAxis || [];
      if (Array.isArray(yAxisRaw[0])) {
        yearSeries = (yAxisRaw[0] || []).map((v: any) => Number(v) || 0);
      } else {
        yearSeries = yAxisRaw.map((v: any) => Number(v) || 0);
      }
    } else if (Array.isArray(yearData)) {
      yearXAxisData = yearData.map((item: any) => item.time || item.month || item.date || '');
      yearSeries = yearData.map((item: any) => {
        const rate = item.totalDefaultRate ?? item.totalRate ?? item.defaultRate ?? item.rate ?? item.value ?? 0;
        return Number(rate) || 0;
      });
    }
  }

  // 处理月度数据（本月违约率，蓝色线）
  let monthXAxisData: string[] = [];
  let monthSeries: number[] = [];

  if (chartData.value.monthData) {
    const monthData = chartData.value.monthData;
    if (monthData?.xAxis && monthData?.yAxis) {
      monthXAxisData = monthData.xAxis || [];
      const yAxisRaw = monthData.yAxis || [];
      if (Array.isArray(yAxisRaw[0])) {
        monthSeries = (yAxisRaw[0] || []).map((v: any) => Number(v) || 0);
      } else {
        monthSeries = yAxisRaw.map((v: any) => Number(v) || 0);
      }
    } else if (Array.isArray(monthData)) {
      monthXAxisData = monthData.map((item: any) => item.time || item.month || item.date || '');
      monthSeries = monthData.map((item: any) => {
        const rate = item.monthDefaultRate ?? item.currentDefaultRate ?? item.currentRate ?? item.monthRate ?? item.subRate ?? 0;
        return Number(rate) || 0;
      });
    }
  }

  // 使用年度数据的 X 轴（如果年度数据为空，使用月度数据的 X 轴）
  const xAxisData = yearXAxisData.length > 0 ? yearXAxisData : monthXAxisData;

  // 如果数据为空，不渲染图表
  if (xAxisData.length === 0 && yearSeries.length === 0 && monthSeries.length === 0) {
    return;
  }

  const legendData = [
    {
      name: '月度',
      icon: 'rect',
      itemStyle: { color: '#108C58' }
    },
    {
      name: '总违约率',
      icon: 'rect',
      itemStyle: { color: '#FF7F00' }
    }
  ];
  const series = [
    {
      name: '月度',
      type: 'bar',
      stack: 'total',
      data: monthSeries,
      barWidth: '40%',
      itemStyle: { 
        color: '#108C58',
        borderRadius: [0, 0, 4, 4]
      },
      emphasis: {
        itemStyle: {
          color: '#0d7a4d'
        }
      }
    },
    {
      name: '总违约率',
      type: 'bar',
      stack: 'total',
      data: yearSeries,
      barWidth: '40%',
      itemStyle: { 
        color: '#FF7F00',
        borderRadius: [4, 4, 0, 0]
      },
      emphasis: {
        itemStyle: {
          color: '#e67200'
        }
      }
    }
  ];

  // 动态 Y 轴上限，默认 1%
  const maxVal = Math.max(...(yearSeries.length ? yearSeries : [0]), ...(monthSeries.length ? monthSeries : [0]));
  const yMax = maxVal > 0 ? Math.ceil(maxVal * 1.2 * 100) / 100 : 1;

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e4e7ed',
      textStyle: {
        color: '#303133'
      },
      axisPointer: {
        type: 'cross',
        label: {
          show: true,
          backgroundColor: '#303133',
          color: '#fff',
          precision: 'auto'
        },
        crossStyle: {
          color: '#909399'
        },
        lineStyle: {
          type: 'dashed',
          width: 1,
          color: '#909399'
        }
      }
    },
    legend: {
      data: legendData,
      textStyle: {
        color: '#303133'
      },
      top: 10,
      left: 'center',
      itemGap: 20,
      itemWidth: 24,
      itemHeight: 14
    },
    grid: {
      left: 40,
      right: 30,
      bottom: 60,
      top: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: xAxisData,
      axisLabel: {
        color: '#606266',
        show: true,
        interval: 0,
        showMinLabel: true,
        showMaxLabel: true
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      axisTick: {
        show: true,
        alignWithLabel: true
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: yMax,
      splitNumber: 5,
      show: true,
      axisLabel: {
        formatter: '{value}%',
        color: '#606266',
        show: true,
        showMinLabel: true,
        showMaxLabel: true
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#dcdfe6',
          width: 1
        }
      },
      axisTick: {
        show: true,
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#e4e7ed',
          type: 'dashed'
        }
      }
    },
    series
  };
  chartInstance.setOption(option);
};

// 获取顶部统计数据
const fetchDashboardData = async () => {
  try {
    const res = await getDashboardStats();
    let data = null;

    if (res && res.code === 200) {
      data = res.data;
    }

    if (data) {
      dashboardData.value = {
        pendingApprovals: data.pendingCount || 0,
        totalLoanApprovals: data.totalApplications || 0,
        approvedLoans: data.approvedCount || 0,
        rejectedLoans: data.rejectedCount || 0,
        cancelledApplications: data.canceledCount || 0,
        totalApprovedAmount: data.totalLoanAmount || 0,
        currentOverdueAmount: data.currentOverdueAmount || 0,
        totalDefaultRate: Number(data.defaultRate || 0),
        monthlyReceivableAmount: data.currentMonthDueAmount || 0,
        monthlyReceivedAmount: data.currentMonthPaidAmount || 0,
        monthlyOverdueAmount: data.currentMonthOverdueAmount || 0
      };
    }
  } catch (error) {
    console.error('获取首页统计数据失败', error);
  }
};

// 获取折线图数据（同时获取年度和月度数据）
const fetchChartData = async () => {
  try {
    // 同时调用年度和月度接口
    const [yearRes, monthRes] = await Promise.all([
      getDashboardLineChart({ dateType: '2' }), // 年度
      getDashboardLineChart({ dateType: '1' }) // 月度
    ]);

    // 处理年度数据
    let yearData = null;
    if (yearRes && yearRes.code === 200) {
      if (yearRes.data?.xAxis && yearRes.data?.yAxis) {
        yearData = { xAxis: yearRes.data.xAxis, yAxis: yearRes.data.yAxis };
      } else if (Array.isArray(yearRes.data)) {
        yearData = yearRes.data;
      }
    }

    // 处理月度数据
    let monthData = null;
    if (monthRes && monthRes.code === 200) {
      if (monthRes.data?.xAxis && monthRes.data?.yAxis) {
        monthData = { xAxis: monthRes.data.xAxis, yAxis: monthRes.data.yAxis };
      } else if (Array.isArray(monthRes.data)) {
        monthData = monthRes.data;
      }
    }

    // 更新图表数据
    chartData.value = {
      yearData,
      monthData
    };

    nextTick(() => {
      updateChart();
    });
  } catch (error) {
    console.error('获取折线图数据失败', error);
  }
};

onMounted(() => {
  // 初始化字典选项（仅用于显示按钮文本）
  if (sys_year_month.value && sys_year_month.value.length > 0) {
    chartTabs.value = sys_year_month.value.map((item: any) => ({
      label: item.label,
      value: item.value
    }));
  } else {
    // 如果字典未加载，使用默认值
    chartTabs.value = [
      { label: '月度', value: '1' },
      { label: '年度', value: '2' }
    ];
  }

  fetchDashboardData();
  nextTick(() => {
    initDefaultRateChart();
    fetchChartData();
  });
});
</script>

<style scoped lang="scss">
.credit-dashboard {
  padding: 24px;
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.dashboard-content {
  max-width: 1920px;
  margin: 0 auto;
}

.top-stats-row {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.top-stat-card-wrapper {
  flex: 1;
  min-width: 0;
  height: 156px;

  @media (max-width: 1200px) {
    height: 140px;
  }

  @media (max-width: 768px) {
    height: 120px;
  }

  @media (max-width: 480px) {
    height: 100px;
  }
}

.top-stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s;
  height: 100%;
  position: relative;
  overflow: hidden;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.top-stat-icon {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  @media (max-width: 1200px) {
    width: 40px;
    height: 40px;
  }

  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.top-stat-info {
  flex: 1;
  min-width: 0;
  z-index: 1;

  .top-stat-label {
    font-size: 16px;
    color: #3D1D3D;
    margin-bottom: 8px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
    font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;

    @media (max-width: 1200px) {
      font-size: 14px;
      margin-bottom: 6px;
    }

    @media (max-width: 768px) {
      font-size: 12px;
      margin-bottom: 4px;
    }
  }

  .top-stat-value {
    font-size: 28px;
    font-weight: 600;
    font-family: 'Bungee-Regular', 'Arial', sans-serif;
    color: #303133;

    @media (max-width: 1200px) {
      font-size: 24px;
    }

    @media (max-width: 768px) {
      font-size: 20px;
    }
  }
}

.top-stat-card .top-stat-value.value-blue {
  color: #7392F4;
}

.top-stat-card .top-stat-value.value-purple {
  color: #E07BFD;
}

.top-stat-card .top-stat-value.value-cyan {
  color: #48BFF8;
}

.top-stat-card .top-stat-value.value-red {
  color: #FF4E4E;
}

.top-stat-card .top-stat-value.value-orange {
  color: #FDA878;
}

.top-stat-decoration {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 260px;
  height: auto;
  pointer-events: none;
  z-index: 0;

  @media (max-width: 1200px) {
    width: 200px;
  }

  @media (max-width: 768px) {
    width: 150px;
  }

  @media (max-width: 480px) {
    width: 120px;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

.main-content {
  width: 100%;
}

.bottom-chart-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.chart-stats-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
  background: rgba(16, 140, 88, 0.05);
  border-radius: 8px;
  padding: 24px 32px;
  margin-bottom: 24px;
}

.chart-stat-item {
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.chart-stat-label {
  font-size: 14px;
  color: #202020;
  margin-top: 8px;
  font-weight: 400;
  font-family: 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.chart-stat-value {
  font-size: 20px;
  font-weight: 700;
  color: #108C58;
  font-family: 'HarmonyOS Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;

  .chart-title {
    font-size: 18px;
    font-weight: 600;
    color: #303133;
  }

  .chart-tabs {
    display: flex;
    gap: 8px;
  }
}

.chart-container {
  width: 100%;
  height: 400px;
}

@media (max-width: 992px) {
  .top-stats-row {
    .el-col {
      margin-bottom: 16px;
    }
  }

  .middle-section {
    padding: 20px;
  }

  .data-card {
    padding: 16px;
  }

  .data-card-value {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .credit-dashboard {
    padding: 12px;
  }

  .top-stat-card {
    :deep(.el-card__body) {
      padding: 16px;
    }
  }

  .top-stat-value {
    font-size: 24px;
  }

  .middle-section,
  .bottom-chart-section {
    padding: 16px;
  }

  .data-card {
    padding: 14px;
    margin-bottom: 12px;
  }

  .data-card-value {
    font-size: 24px;
  }

  .chart-container {
    height: 300px;
  }

  .chart-header {
    .chart-title {
      font-size: 16px;
    }
  }
}

@media (max-width: 576px) {
  .data-card-value {
    font-size: 20px;
  }

  .chart-container {
    height: 250px;
  }

  .chart-tabs {
    flex-wrap: wrap;
  }
}
</style>
