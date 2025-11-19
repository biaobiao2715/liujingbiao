<template>
  <div class="credit-dashboard">
    <div class="dashboard-content">
      <div class="top-stats-row">
        <div class="top-stat-card-wrapper">
          <el-card shadow="never" class="top-stat-card">
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
                  <div class="data-card-value">{{ formatAmount(dashboardData.totalApprovedAmount) }}</div>
                </div>

                <div class="data-card">
                  <div class="data-card-header">
                    <span class="data-card-title">本月应收金额</span>
                  </div>
                  <div class="data-card-value">{{ formatAmount(dashboardData.monthlyReceivableAmount) }}</div>
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
                  <div class="data-card-value">{{ formatAmount(dashboardData.currentOverdueAmount) }}</div>
                </div>

                <div class="data-card">
                  <div class="data-card-header">
                    <span class="data-card-title">本月已收金额</span>
                  </div>
                  <div class="data-card-value">{{ formatAmount(dashboardData.monthlyReceivedAmount) }}</div>
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
                  <div class="data-card-value">{{ dashboardData.totalDefaultRate }}%</div>
                </div>

                <div class="data-card">
                  <div class="data-card-header">
                    <span class="data-card-title">本月逾期金额</span>
                  </div>
                  <div class="data-card-value">{{ formatAmount(dashboardData.monthlyOverdueAmount) }}</div>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="bottom-chart-section">
            <div class="chart-header">
              <div class="chart-title">近6个月违约率趋势</div>
              <div class="chart-tabs">
                <el-button
                  v-for="tab in chartTabs"
                  :key="tab.value"
                  :type="activeTab === tab.value ? 'primary' : 'default'"
                  size="small"
                  @click="activeTab = tab.value"
                >
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
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { Money, Warning, TrendCharts } from '@element-plus/icons-vue';
import { getDashboardStats } from '@/api/creditPlatform/dashboard';

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

const chartTabs = [
  { label: '月度', value: 'month' },
  { label: '年度', value: 'year' },
  { label: '自定义', value: 'custom' }
];
const activeTab = ref('month');

const defaultRateChart = ref<HTMLElement>();

const formatAmount = (amount: number) => {
  if (amount >= 100000000) {
    return (amount / 100000000).toFixed(2) + '亿';
  } else if (amount >= 10000) {
    return (amount / 10000).toLocaleString() + '万';
  }
  return amount.toLocaleString();
};

const chartData = ref<any[]>([]);

const initDefaultRateChart = () => {
  if (!defaultRateChart.value) return;
  const chart = echarts.init(defaultRateChart.value);
  
  const months = chartData.value.map(item => item.month.substring(5));
  const cumulativeRates = chartData.value.map(item => item.cumulativeDefaultRate || 0);
  const monthlyRates = chartData.value.map(item => item.defaultRate || 0);
  
  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross'
      }
    },
    legend: {
      data: ['总违约率', '本月违约率'],
      textStyle: {
        color: '#fff'
      },
      top: 10
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: months,
      axisLabel: {
        color: '#fff'
      },
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: '{value}%',
        color: '#fff'
      },
      axisLine: {
        lineStyle: {
          color: '#fff'
        }
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    series: [
      {
        name: '总违约率',
        type: 'line',
        smooth: true,
        data: cumulativeRates,
        itemStyle: {
          color: '#f56c6c'
        },
        lineStyle: {
          color: '#f56c6c'
        }
      },
      {
        name: '本月违约率',
        type: 'line',
        smooth: true,
        data: monthlyRates,
        itemStyle: {
          color: '#409eff'
        },
        lineStyle: {
          color: '#409eff'
        }
      }
    ]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => {
    chart.resize();
  });
};

const fetchDashboardData = async () => {
  try {
    const res = await getDashboardStats();
    let data = null;
    
    if (res && res.code === 200) {
      data = Array.isArray(res.data) ? res.data[0] : res.data;
    } else if (Array.isArray(res)) {
      data = res[0];
    } else if (res && typeof res === 'object') {
      data = res;
    }
    
    if (data) {
      dashboardData.value = {
        pendingApprovals: data.pendingApprovals || 0,
        totalLoanApprovals: data.totalLoanApprovals || 0,
        approvedLoans: data.approvedLoans || 0,
        rejectedLoans: data.rejectedLoans || 0,
        cancelledApplications: data.cancelledApplications || 0,
        totalApprovedAmount: data.totalApprovedAmount || 0,
        currentOverdueAmount: data.currentOverdueAmount || 0,
        totalDefaultRate: data.totalDefaultRate || 0,
        monthlyReceivableAmount: data.monthlyReceivableAmount || 0,
        monthlyReceivedAmount: data.monthlyReceivedAmount || 0,
        monthlyOverdueAmount: data.monthlyOverdueAmount || 0
      };
      chartData.value = data.lastSixMonthsDefaultRates || [];
      nextTick(() => {
        initDefaultRateChart();
      });
    }
  } catch (error) {}
};

onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped lang="scss">
.credit-dashboard {
  padding: 24px;
  background-color: #f0f2f5;
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

.main-content {
  width: 100%;
}

.middle-section {
  background: #0f1b2d;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 12px 30px rgba(8, 12, 28, 0.55);
}

.data-card {
  background: rgba(19, 30, 49, 0.95);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s;

  &:hover {
    background: rgba(19, 30, 49, 1);
    transform: translateY(-2px);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.25);
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
    color: rgba(255, 255, 255, 0.85);
    font-weight: 500;
  }

  .data-card-icon {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;

    &.warning-icon {
      background: rgba(245, 108, 108, 0.3);
      color: #f56c6c;
    }
  }
}

.data-card-value {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8px;
  word-break: break-word;
}

.bottom-chart-section {
  background: #0f1b2d;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 12px 30px rgba(8, 12, 28, 0.55);
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
    color: #fff;
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
