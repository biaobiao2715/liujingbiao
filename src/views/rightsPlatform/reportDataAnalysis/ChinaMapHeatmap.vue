<template>
  <div ref="mapContainer" class="china-map-heatmap"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
// @ts-ignore - JSON 文件导入在 Vite 中支持，但 TypeScript 可能需要类型声明
import chinaGeoJson from './chinaMap.json';

interface MapDataItem {
  name: string;
  value: number;
  yesterdaySales?: number;
  status0Count?: number;
  status1Count?: number;
  status2Count?: number;
  status3Count?: number;
  status4Count?: number;
  statusCount?: number;
}

interface Props {
  data?: MapDataItem[];
  title?: string;
  min?: number;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  title: '举报数据分布图',
  min: 0,
  max: 100
});

const mapContainer = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;

// 加载中国地图数据
const loadChinaMap = () => {
  if (!chartInstance) return;

  try {
    // 使用本地 JSON 文件
    const geoJson = chinaGeoJson as any;

    // 注册地图
    echarts.registerMap('china', geoJson);

    // 调试：打印地图中的省份名称（仅开发时使用）
    // @ts-ignore - import.meta.env.DEV 在 Vite 中可用
    if (import.meta.env.DEV) {
      const features = geoJson.features || [];
      const regionNames = features.map((f: any) => f.properties?.name || f.properties?.NAME_CHN || f.properties?.name_ch);
      console.log('地图中的省份名称:', regionNames);
    }

    // 初始化图表
    updateChart();
  } catch (error) {
    console.error('加载地图数据失败:', error);
  }
};

// 初始化图表
const initChart = () => {
  if (!mapContainer.value) return;

  chartInstance = echarts.init(mapContainer.value);

  // 初始化后立即调整大小
  nextTick(() => {
    chartInstance?.resize();
    // 加载地图数据
    loadChinaMap();
  });
};

// 更新图表
const updateChart = () => {
  if (!chartInstance) return;

  const mapData = props.data.length > 0 ? props.data : [];

  // 确保 min 和 max 有值，如果没有传入则从数据中计算
  let minValue = props.min;
  let maxValue = props.max;

  if (mapData.length > 0) {
    const values = mapData.map((item) => item.value).filter((v) => v != null && !isNaN(v));
    if (values.length > 0) {
      minValue = props.min !== undefined ? props.min : Math.min(...values);
      maxValue = props.max !== undefined ? props.max : Math.max(...values);
    }
  }

  // 如果还是没有值，使用默认值
  if (minValue === undefined || maxValue === undefined) {
    minValue = 40;
    maxValue = 80;
  }

  // 调试：打印数据
  // @ts-ignore - import.meta.env.DEV 在 Vite 中可用
  if (import.meta.env.DEV) {
    console.log('地图数据:', mapData);
    console.log('视觉映射范围:', { min: minValue, max: maxValue });
    console.log('数据条数:', mapData.length);
  }

  const option = {
    title: {
      text: props.title,
      left: 'center',
      top: 10,
      textStyle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#303133'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.data && params.data.value !== undefined) {
          const data = params.data;
          // 如果有举报状态数据，显示详细状态信息
          if (data.status0Count !== undefined || data.status1Count !== undefined || 
              data.status2Count !== undefined || data.status3Count !== undefined || 
              data.status4Count !== undefined) {
            let tooltipContent = `<div style="font-weight: bold; margin-bottom: 4px;">${params.name}</div>`;
            
            // 按照固定顺序显示五种状态
            const statusList = [
              { label: '待处理', value: data.status0Count, color: '#409eff' },
              { label: '处理中', value: data.status1Count, color: '#e6a23c' },
              { label: '已驳回', value: data.status2Count, color: '#f56c6c' },
              { label: '已撤回', value: data.status4Count, color: '#909399' },
              { label: '已结案', value: data.status3Count, color: '#67c23a' }
            ];
            
            statusList.forEach((status) => {
              const count = Number(status.value || 0);
              tooltipContent += `<div style="margin: 2px 0;">
                <span style="display: inline-block; width: 10px; height: 10px; background-color: ${status.color}; border-radius: 2px; margin-right: 6px; vertical-align: middle;"></span>
                ${status.label}: <strong>${count}</strong>
              </div>`;
            });
            
            // 显示合计
            const total = Number(data.statusCount || 0);
            tooltipContent += `<div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #eee;">
              <strong>合计: ${total}</strong>
            </div>`;
            
            return tooltipContent;
          }
          // 兼容原有格式（价格数据）
          let tooltipContent = `${params.name}<br/>价格: ${params.data.value} 元/kg`;
          if (params.data.yesterdaySales !== undefined && params.data.yesterdaySales !== null) {
            tooltipContent += `<br/>销量: ${params.data.yesterdaySales}`;
          }
          return tooltipContent;
        }
        return `${params.name}<br/>暂无数据`;
      }
    },
    toolbox: {
      show: true,
      orient: 'vertical',
      left: 'right',
      top: 'center',
      feature: {
        dataView: { readOnly: false },
        restore: {},
        saveAsImage: {}
      }
    },
    visualMap: {
      min: minValue,
      max: maxValue,
      left: 20,
      bottom: 60,
      text: ['高', '低'],
      realtime: false,
      calculable: true,
      inRange: {
        color: ['#e0f3ff', '#409eff', '#1d39c4']
      },
      itemWidth: 20,
      itemHeight: 140,
      textStyle: {
        color: '#333'
      }
    },
    series: [
      {
        name: '举报数据',
        type: 'map',
        map: 'china',
        roam: false,
        zoom: 1.2,
        label: {
          show: true,
          fontSize: 10, // 【修改6】标签字体略小，避免放大后重叠
          color: '#333',
          fontWeight: 'normal',
          // 使用富文本样式，避免重叠
          rich: {
            small: {
              fontSize: 9,
              color: '#333',
              padding: [2, 2]
            },
            normal: {
              fontSize: 11,
              color: '#333'
            },
            large: {
              fontSize: 12,
              fontWeight: 'bold',
              color: '#333'
            }
          },
          // 根据区域大小调整标签
          formatter: (params: any) => {
            const name = params.name;
            // 对于特别小的区域，使用更小的字体或隐藏
            const tinyRegions = ['澳门', '香港'];
            const smallRegions = ['北京', '天津', '上海', '台湾', '海南'];

            if (tinyRegions.includes(name)) {
              // 特别小的区域使用极小字体
              return `{small|${name}}`;
            } else if (smallRegions.includes(name)) {
              // 小区域使用小字体
              return `{small|${name}}`;
            }
            // 对于大区域，使用正常字体
            return name;
          },
          // 调整标签位置
          offset: [0, 0],
          // 标签位置：优先显示在区域内部，如果空间不足则显示在外部
          position: function (params: any) {
            const name = params.name;
            // 对于特别小的区域，标签显示在外部
            const tinyRegions = ['澳门', '香港', '北京', '天津', '上海'];
            if (tinyRegions.includes(name)) {
              return 'right';
            }
            // 默认显示在内部
            return 'inside';
          },
          // 标签距离边界的距离
          distance: 5,
          // 标签对齐方式
          align: 'center',
          verticalAlign: 'middle'
        },
        // 标签布局配置，避免重叠
        labelLayout: {
          hideOverlap: true, // 隐藏重叠的标签
          moveOverlap: 'shiftX', // 移动重叠的标签
          draggable: false // 不允许拖拽标签
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold'
          },
          itemStyle: {
            borderWidth: 2,
            borderColor: '#333'
          }
        },
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 1
        },
        data: mapData.map((item: any) => {
          const result: any = {
            name: item.name || '',
            value: Number(item.value || 0)
          };
          // 保留所有状态数据
          if (item.status0Count !== undefined) result.status0Count = Number(item.status0Count);
          if (item.status1Count !== undefined) result.status1Count = Number(item.status1Count);
          if (item.status2Count !== undefined) result.status2Count = Number(item.status2Count);
          if (item.status3Count !== undefined) result.status3Count = Number(item.status3Count);
          if (item.status4Count !== undefined) result.status4Count = Number(item.status4Count);
          if (item.statusCount !== undefined) result.statusCount = Number(item.statusCount);
          return result;
        }),
        // 名称映射，确保数据名称与地图名称匹配
        nameMap: {
          // 处理可能的名称差异
          '北京市': '北京',
          '天津市': '天津',
          '河北省': '河北',
          '山西省': '山西',
          '内蒙古自治区': '内蒙古',
          '辽宁省': '辽宁',
          '吉林省': '吉林',
          '黑龙江省': '黑龙江',
          '上海市': '上海',
          '江苏省': '江苏',
          '浙江省': '浙江',
          '安徽省': '安徽',
          '福建省': '福建',
          '江西省': '江西',
          '山东省': '山东',
          '河南省': '河南',
          '湖北省': '湖北',
          '湖南省': '湖南',
          '广东省': '广东',
          '广西壮族自治区': '广西',
          '海南省': '海南',
          '重庆市': '重庆',
          '四川省': '四川',
          '贵州省': '贵州',
          '云南省': '云南',
          '西藏自治区': '西藏',
          '陕西省': '陕西',
          '甘肃省': '甘肃',
          '青海省': '青海',
          '宁夏回族自治区': '宁夏',
          '新疆维吾尔自治区': '新疆'
        }
      }
    ]
  };

  chartInstance.setOption(option, true);

  // 再次延迟调整，确保图表正确渲染
  setTimeout(() => {
    chartInstance?.resize();
  }, 100);
};

// 窗口大小变化时调整图表
const resizeChart = () => {
  chartInstance?.resize();
};

// 监听数据变化
const watchData = () => {
  if (chartInstance) {
    updateChart();
  }
};

// 监听 props.data 变化，自动更新图表
watch(() => props.data, () => {
  if (chartInstance) {
    updateChart();
  }
}, { deep: true });

// 监听 props.min 和 props.max 变化
watch([() => props.min, () => props.max], () => {
  if (chartInstance) {
    updateChart();
  }
});

onMounted(() => {
  nextTick(() => {
    // 初始化图表（图表内部会调用 loadChinaMap）
    initChart();

    // 使用 ResizeObserver 监听容器大小变化
    if (mapContainer.value) {
      resizeObserver = new ResizeObserver(() => {
        chartInstance?.resize();
      });
      resizeObserver.observe(mapContainer.value);
    }
  });
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});

// 暴露方法供父组件调用
defineExpose({
  updateChart: watchData
});
</script>

<style scoped lang="scss">
.china-map-heatmap {
  width: 100%; // 【修改7】原120%（可能溢出），改为100%适配父容器
  height: 800px; // 【修改8】固定高度（比原600px更高，支撑更大地图）
  margin: 0 auto; // 【修改9】确保容器本身在页面水平居中
}
</style>
