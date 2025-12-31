<!--
  标题: 平台管理首页 - 履约率统计图组件
  功能: 展示平台管理首页的履约率统计图，支持按类目和时间范围筛选数据，并提供导出功能。
  说明: 该组件使用 ECharts 绘制堆叠柱状图，支持日、周、月、年四种时间范围的切换，并可根据一级商品类目进行数据筛选。
  当前版本: 2.0
  开发信息: Created by 门世超 2025-10-20, Refactored 2025-11-22
-->
<template>
  <el-card class="chart-card bottom-card" shadow="hover">
    <div class="card-header">
      <div class="axis-title">履约率(%)</div>
      <el-button type="primary" plain size="small" @click="handleExport" class="export-btn">
        <template #icon>
          <img :src="exportIcon" alt="导出" class="btn-icon" />
        </template>
        导出
      </el-button>
    </div>
    <div class="chart-controls">
      <div class="category-switch" v-loading="categoryLoading">
        <div
          v-for="item in categoryOptions"
          :key="item.value"
          class="category-item"
          :class="{ active: category === item.value }"
          @click="changeCategory(item.value)"
        >
          {{ item.label }}
        </div>
        <div v-if="!categoryLoading && categoryOptions.length === 0" class="category-empty">暂无类目数据</div>
      </div>
      <div class="chart-legend-center">
        <div class="legend-item">
          <span class="legend-icon-bar" style="background-color: #108C58;"></span>
          <span class="legend-text">已履约率</span>
        </div>
        <div class="legend-item">
          <span class="legend-icon-bar" style="background-color: #FF7B00;"></span>
          <span class="legend-text">待履约率</span>
        </div>
      </div>
      <div class="time-tabs">
        <div
          v-for="item in timeRanges"
          :key="item.value"
          class="time-tab"
          :class="{ active: timeRange === item.value }"
          @click="changeRange(item.value)"
        >
          {{ item.label }}
        </div>
      </div>
    </div>
    <div class="chart-body" v-loading="loading">
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { getOrdersComplianceRateInfo, exportOrdersComplianceRate } from '@/api/platformManage/home';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import exportIconImg from '@/assets/images/切图 91.png';

const exportIcon = exportIconImg;

type TimeRange = '1' | '2' | '3' | '4';

const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '日', value: '1' },
  { label: '周', value: '2' },
  { label: '月', value: '3' },
  { label: '年', value: '4' }
];

const categoryOptions = ref<Array<{ label: string; value: string; goodsCategoryId: number | string }>>([]); // 一级商品类目选项
const category = ref<string>(''); // 当前选中的类目
const timeRange = ref<TimeRange>('1');// 当前选中的时间范围
const categoryLoading = ref(false);// 一级商品类目加载状态
const loading = ref(false); // 图表数据加载状态
const chartRef = ref<HTMLDivElement | null>(null); // 图表容器引用
let chart: echarts.ECharts | null = null; // ECharts 实例
const isMounted = ref(false);   // 组件是否已挂载
const { proxy } = getCurrentInstance() as any; // 获取组件实例以访问全局属性

// 计算属性：当前选中的类目对象
const categoryOption = computed(() => {
  if (categoryOptions.value.length === 0) {
    return { label: '', value: '', goodsCategoryId: '' };
  }
  return categoryOptions.value.find((item) => item.value === category.value) ?? categoryOptions.value[0];
});

// 初始化图表
const initChart = () => {
  if (chartRef.value && !chart) {
    chart = echarts.init(chartRef.value);
  }
};

// 处理窗口大小变化，调整图表尺寸
const handleResize = () => {
  chart?.resize();
};

// 解析返回数据，提取列表
const unwrapList = (payload: any) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.list)) return payload.list;
  if (Array.isArray(payload?.rows)) return payload.rows;
  if (Array.isArray(payload?.records)) return payload.records;
  return [];
};

// 更新图表数据
const updateChart = (data: { label: string; complianceRate: number; unComplianceRate: number }[]) => {
  if (!chart) return;

  // 确保数据有效
  const chartData = Array.isArray(data) && data.length > 0 ? data : [];

  // 配置图表选项
  chart.setOption(
    {
      grid: { top: 60, left: 50, right: 40, bottom: 60 },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          if (!params || !Array.isArray(params) || params.length === 0) return '';
          let result = `${params[0].name}<br/>`;
          params.forEach((param: any) => {
            result += `${param.marker}${param.seriesName}: ${param.value}%<br/>`;
          });
          return result;
        }
      },
      legend: {
        data: ['已履约率', '待履约率'],
        top: 10,
        right: 20,
        textStyle: {
          color: '#303133'
        }
      },
      xAxis: {
        type: 'category',
        data: chartData.map((item) => item.label),
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: {
          color: '#303133',
          interval: 0,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLabel: {
          color: '#303133',
          formatter: '{value}%'
        },
        max: 100
      },
      series: [
        {
          name: '已履约率',
          type: 'bar',
          stack: 'total',
          barWidth: '30%',
          itemStyle: { color: '#108C58' },
          label: {
            show: false
          },
          data: chartData.map((item) => item.complianceRate)
        },
        {
          name: '待履约率',
          type: 'bar',
          stack: 'total',
          itemStyle: { color: '#FF7B00' },
          label: {
            show: false
          },
          data: chartData.map((item) => item.unComplianceRate)
        }
      ]
    },
    true
  );
};

// 构建通用请求参数
const buildCommonParams = () => {
  const dimensionMap: Record<TimeRange, string> = {
    '1': 'day',
    '2': 'week',
    '3': 'month',
    '4': 'year'
  };
  // 映射时间范围到维度
  const dimension = dimensionMap[timeRange.value] || 'day';

  const cat = categoryOption.value; // 获取当前选中类目
  const categoryId = cat?.goodsCategoryId || ''; // 类目ID，若无则为空字符串

  // 返回请求参数对象
  return {
    categoryId: categoryId,
    dimension: dimension,
    homeDaysType: timeRange.value
  };
};

// 获取图表数据
const fetchData = async () => {
  if (!chart) return;
  loading.value = true;
  try {
    const params = buildCommonParams();
    const response: any = await getOrdersComplianceRateInfo(params);

    console.log('履约率接口返回:', response);
    console.log('response.data类型:', Array.isArray(response?.data), response?.data);
    console.log('response本身是否数组:', Array.isArray(response));

    let list: any[] = [];
    if (Array.isArray(response)) {
      list = response;
    } else if (Array.isArray(response?.data)) {
      list = response.data;
    } else if (response?.data?.xAxis && response?.data?.yAxis) {
      const xAxis = response.data.xAxis;
      const yAxis = response.data.yAxis;
      list = xAxis.map((label: string, index: number) => {
        let complianceRate = 0;
        if (yAxis[index] !== undefined && yAxis[index] !== null) {
          const rateStr = String(yAxis[index]).replace('%', '');
          complianceRate = Number(rateStr) || 0;
        }
        return {
          time: label,
          complianceRate: complianceRate
        };
      });
    } else {
      list = unwrapList(response?.data);
    }

     // 处理数据，确保履约率和未履约率均为数字
    const result = list.map((item: any) => {
      let complianceRate = 0;
      let unComplianceRate = 0;

      if (item.complianceRate !== undefined && item.complianceRate !== null) {
        const rateStr = String(item.complianceRate).replace('%', '').trim();
        const parsed = Number(rateStr);
        complianceRate = isNaN(parsed) ? 0 : parsed;
      }

      if (item.unComplianceRate !== undefined && item.unComplianceRate !== null) {
        const rateStr = String(item.unComplianceRate).replace('%', '').trim();
        const parsed = Number(rateStr);
        unComplianceRate = isNaN(parsed) ? 0 : parsed;
      }

      return {
        label: item.time || item.analysisDate || '',
        complianceRate: complianceRate,
        unComplianceRate: unComplianceRate
      };
    });


    updateChart(result);
  } catch (error) {
    console.error('获取履约率统计图失败', error);
    ElMessage.error('获取履约率统计图失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
// 获取一级商品类目列表
const fetchCategoryList = async () => {
  categoryLoading.value = true;
  try {
    const response: any = await getProductCategoryList();
    const list = response?.data || response?.rows || response?.list || response || [];

    const firstLevelCategories = list.filter((item: any) => {
      const parentId = item.parentId;
      return parentId === 0 || parentId === '0' || parentId === null || parentId === undefined || parentId === '';
    });

    // 只保留"种子"和"农资农具"两种分类
    const allowedCategories = ['种子', '农资农具'];
    const filteredCategories = firstLevelCategories.filter((item: any) => {
      const categoryName = item.categoryName || item.name || '';
      return allowedCategories.includes(categoryName);
    });

    categoryOptions.value = filteredCategories.map((item: any, index: number) => ({
      label: item.categoryName || item.name || `类目${index + 1}`,
      value: String(item.id || item.categoryId || index),
      goodsCategoryId: item.id || item.categoryId || ''
    }));

    if (categoryOptions.value.length > 0 && !category.value) {
      category.value = categoryOptions.value[0].value;
    }
  } catch (error) {
    console.error('获取商品分类列表失败:', error);
    ElMessage.error('获取商品分类列表失败，请稍后重试');
  } finally {
    categoryLoading.value = false;
  }
};

// 切换类目
const changeCategory = (value: string) => {
  if (category.value === value) return;
  category.value = value;
};

// 切换时间范围
const changeRange = (value: TimeRange) => {
  timeRange.value = value;
};

// 导出数据
const handleExport = () => {
  const dimensionMap: Record<TimeRange, string> = {
    '1': 'day',
    '2': 'week',
    '3': 'month',
    '4': 'year'
  };
  const dimension = dimensionMap[timeRange.value] || 'day';
  const cat = categoryOption.value;
  const categoryId = cat?.goodsCategoryId || '';

  const params = {
    dimension: dimension,
    categoryId: categoryId
  };
  exportOrdersComplianceRate(params);
};

// 组件挂载和卸载生命周期钩子
onMounted(async () => {
  await nextTick();
  initChart();
  window.addEventListener('resize', handleResize);
  isMounted.value = true;
  await fetchCategoryList();
  if (categoryOptions.value.length > 0) {
    fetchData();
  }
});

// 组件卸载时清理事件监听和图表实例
onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  chart?.dispose();
});

// 监听类目和时间范围变化，重新获取数据
watch([category, timeRange], () => {
  if (!isMounted.value || !category.value) return;
  fetchData();
});
</script>

<style scoped>
.chart-card {
  border-radius: 12px;
}

.bottom-card {
  margin-top: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e5e5;
}

.axis-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.chart-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.chart-legend-center {
  display: flex;
  align-items: center;
  gap: 16px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-icon-bar {
  width: 12px;
  height: 12px;
  display: inline-block;
  border-radius: 2px;
}

.legend-text {
  font-size: 14px;
  color: #303133;
}

.category-switch {
  display: inline-flex;
  border: 1px solid #e5e5e5;
  border-radius: 6px;
  overflow: hidden;
}

.category-item {
  padding: 4px 16px;
  font-size: 14px;
  color: #666;
  background: #f7f7f7;
  cursor: pointer;
  transition: all 0.2s;
}

.category-item.active {
  background: #108c58;
  color: #fff;
  font-weight: 600;
}

.category-empty {
  padding: 4px 16px;
  font-size: 14px;
  color: #999;
  background: #f7f7f7;
}

.chart-body {
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 280px;
}

.time-tabs {
  display: flex;
  gap: 8px;
}

.time-tab {
  min-width: 48px;
  text-align: center;
  padding: 4px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  cursor: pointer;
  color: #666;
  background: #fff;
  transition: all 0.2s;
}

.time-tab.active {
  background: #108c58;
  border-color: #108c58;
  color: #fff;
  font-weight: 600;
}

.btn-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.export-btn {
  color: #333333 !important;
  background-color: #F2F3F5 !important;
  border: none !important;
  
  &:hover,
  &:focus,
  &:active {
    color: #333333 !important;
    background-color: #F2F3F5 !important;
    border: none !important;
  }
}
</style>
