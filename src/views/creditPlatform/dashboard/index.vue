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
          <el-card shadow="never" class="top-stat-card pending-card">
            <div class="top-stat-content">
              <div class="top-stat-label">贷款待审批</div>
              <div class="top-stat-value">{{ dashboardData.pendingApprovals }}件</div>
            </div>
          </el-card>
        </div>
        <div class="top-stat-card-wrapper">
          <el-card shadow="never" class="top-stat-card">
            <div class="top-stat-content">
              <div class="top-stat-label">总申请贷款</div>
              <div class="top-stat-value">{{ dashboardData.totalLoanApprovals }}件</div>
            </div>
          </el-card>
        </div>
        <div class="top-stat-card-wrapper">
          <el-card shadow="never" class="top-stat-card">
            <div class="top-stat-content">
              <div class="top-stat-label">贷款审批通过</div>
              <div class="top-stat-value">{{ dashboardData.approvedLoans }}件</div>
            </div>
          </el-card>
        </div>
        <div class="top-stat-card-wrapper">
          <el-card shadow="never" class="top-stat-card">
            <div class="top-stat-content">
              <div class="top-stat-label">贷款审批驳回</div>
              <div class="top-stat-value">{{ dashboardData.rejectedLoans }}件</div>
            </div>
          </el-card>
        </div>
        <div class="top-stat-card-wrapper">
          <el-card shadow="never" class="top-stat-card">
            <div class="top-stat-content">
              <div class="top-stat-label">贷款申请取消</div>
              <div class="top-stat-value">{{ dashboardData.cancelledApplications }}件</div>
            </div>
          </el-card>
        </div>
      </div>

      <div class="main-content">
        <div class="middle-section">
          <el-row :gutter="20">
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">总贷款金额</span>
                  <div class="data-card-icon">
                    <el-icon :size="20"><Money /></el-icon>
                  </div>
                </div>
                <div class="data-card-value">{{ formatWanInteger(dashboardData.totalApprovedAmount) }}</div>
              </div>

              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">本月应收金额</span>
                </div>
                <div class="data-card-value">{{ formatWan(dashboardData.monthlyReceivableAmount) }}</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">当前逾期金额</span>
                  <div class="data-card-icon warning-icon">
                    <el-icon :size="20"><Warning /></el-icon>
                  </div>
                </div>
                <div class="data-card-value">{{ formatWan(dashboardData.currentOverdueAmount) }}</div>
              </div>

              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">本月已收金额</span>
                </div>
                <div class="data-card-value">{{ formatWan(dashboardData.monthlyReceivedAmount) }}</div>
              </div>
            </el-col>
            <el-col :xs="24" :sm="12" :md="8" :lg="8" :xl="8">
              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">总违约率</span>
                  <div class="data-card-icon">
                    <el-icon :size="20"><TrendCharts /></el-icon>
                  </div>
                </div>
                <div class="data-card-value">{{ formatRate(dashboardData.totalDefaultRate) }}%</div>
              </div>

              <div class="data-card">
                <div class="data-card-header">
                  <span class="data-card-title">本月逾期金额</span>
                </div>
                <div class="data-card-value">{{ formatWan(dashboardData.monthlyOverdueAmount) }}</div>
              </div>
            </el-col>
          </el-row>
        </div>

        <div class="bottom-chart-section">
          <div class="chart-header">
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
      name: '总违约率',
      icon: 'rect',
      itemStyle: { color: 'transparent', borderColor: '#f56c6c', borderWidth: 2 }
    },
    {
      name: '月度',
      icon: 'rect',
      itemStyle: { color: 'transparent', borderColor: '#409eff', borderWidth: 2 }
    }
  ];
  const series = [
    {
      name: '总违约率',
      type: 'line',
      smooth: true,
      data: yearSeries,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#f56c6c' },
      lineStyle: { color: '#f56c6c' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(245, 108, 108, 0.6)' },
          { offset: 1, color: 'rgba(245, 108, 108, 0.05)' }
        ])
      }
    },
    {
      name: '月度',
      type: 'line',
      smooth: true,
      data: monthSeries,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#409eff' },
      lineStyle: { color: '#409eff' },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(64, 158, 255, 0.45)' },
          { offset: 1, color: 'rgba(64, 158, 255, 0.05)' }
        ])
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
      bottom: 40,
      top: 40,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: xAxisData,
      axisLabel: {
        color: '#606266',
        show: true,
        showMinLabel: true,
        showMaxLabel: true
      },
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
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
  flex-wrap: wrap;
}

.top-stat-card-wrapper {
  flex: 1;
  min-width: 180px;
}

.top-stat-card {
  border-radius: 12px;
  border: none;
  height: 100%;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
    transform: translateY(-4px);
  }

  :deep(.el-card__body) {
    padding: 24px 20px;
  }
}

.top-stat-content {
  text-align: center;

  .top-stat-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 12px;
  }

  .top-stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
  }
}

.pending-card .top-stat-value {
  color: #f56c6c; // 待审批标红
}

.main-content {
  width: 100%;
}

.middle-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.data-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &:hover {
    background: #fff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.data-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .data-card-title {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }

  .data-card-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: #f5f7fa;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #409eff;
    flex-shrink: 0;

    &.warning-icon {
      background: rgba(245, 108, 108, 0.1);
      color: #f56c6c;
    }
  }
}

.data-card-value {
  font-size: 32px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  word-break: break-word;
}

.bottom-chart-section {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
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
