<!--
  标题: 平台管理首页 - 销售额统计图组件
  功能: 展示平台管理首页的销售额统计图，支持按类目和时间范围筛选数据，并提供导出功能。
  说明: 该组件使用 ECharts 绘制柱状图，支持日、周、月、年四种时间范围的切换，并可根据一级商品类目进行数据筛选。
  当前版本: 2.0
  开发信息: Created by 门世超 2025-10-20, Refactored 2025-11-22
-->
<template>
  <el-card class="chart-card" shadow="hover" v-loading="loading">
    <div class="card-header">
      <div class="axis-wrapper">
        <div class="axis-title">销售额(万元)</div>
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
      </div>
      <el-button type="primary" plain size="small" @click="handleExport">导出</el-button>
    </div>
    <div class="chart-body">
      <div ref="chartRef" class="chart-container"></div>
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
  </el-card>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { getFirstLevelCategorySalesAmountTotal, exportSalesAmountTotal } from '@/api/platformManage/home';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';

type TimeRange = '1' | '2' | '3' | '4';

// 时间范围选项
const timeRanges: { label: string; value: TimeRange }[] = [
  { label: '日', value: '1' },
  { label: '周', value: '2' },
  { label: '月', value: '3' },
  { label: '年', value: '4' }
];

const categoryOptions = ref<Array<{ label: string; value: string; goodsCategoryId: number | string }>>([]); // 一级商品类目选项
const category = ref<string>(''); // 当前选中的类目
const timeRange = ref<TimeRange>('1'); // 当前选中的时间范围
const categoryLoading = ref(false); // 一级商品类目加载状态
const loading = ref(false); // 图表数据加载状态
const chartRef = ref<HTMLDivElement | null>(null); // 图表容器引用
let chart: echarts.ECharts | null = null; // ECharts 实例
const isMounted = ref(false); // 组件是否已挂载
const { proxy } = getCurrentInstance() as any;  // 获取组件实例以访问全局属性

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
const updateChart = (data: { label: string; value: number }[]) => {
  if (!chart) return;
  chart.setOption(
    {
      grid: { top: 40, left: 40, right: 20, bottom: 40 },
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: data.map((item) => item.label),
        axisLine: { lineStyle: { color: '#8c8c8c' } },
        axisLabel: { color: '#666' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#eee' } },
        axisLabel: { color: '#666' }
      },
      color: ['#4a90e2'],
      series: [
        {
          name: '销售额(万元)',
          type: 'bar',
          barWidth: 24,
          itemStyle: { borderRadius: [6, 6, 0, 0] },
          data: data.map((item) => item.value)
        }
      ]
    },
    true
  );
};

// 构建通用请求参数
const buildCommonParams = () => {
  const cat = categoryOption.value;
  if (!cat || !cat.goodsCategoryId) {
    return { homeDaysType: timeRange.value };
  }
  return {
    goodsCategoryId: cat.goodsCategoryId,
    homeDaysType: timeRange.value
  };
};

// 获取图表数据
const fetchData = async () => {
  if (!chart) return;
  loading.value = true;
  try {
    const response: any = await getFirstLevelCategorySalesAmountTotal(buildCommonParams());

    // 优先处理 xAxis 和 yAxis 格式的数据
    if (response?.data?.xAxis && response?.data?.yAxis) {
      const xAxis = Array.isArray(response.data.xAxis) ? response.data.xAxis : [];
      const yAxis = Array.isArray(response.data.yAxis) ? response.data.yAxis : [];
      const result = xAxis.map((label: string, index: number) => ({
        label: String(label || ''),
        value: Number(yAxis[index]) || 0
      }));
      updateChart(result);
    } else {
      // 兼容其他数据格式
      const list = unwrapList(response?.data);
      const result = list.map((item: any) => ({
        label: item.analysisDate || '',
        value: Number(item.yesterdayTotalSales || item.salesAmount || 0)
      }));
      updateChart(result);
    }
  } catch (error) {
    console.error('获取销售额统计图失败', error);
    ElMessage.error('获取销售额统计图失败，请稍后重试');
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

    categoryOptions.value = firstLevelCategories.map((item: any, index: number) => ({
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
  const params = buildCommonParams();
  exportSalesAmountTotal(params);
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

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.axis-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.axis-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
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
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.time-tabs {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
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
</style>
