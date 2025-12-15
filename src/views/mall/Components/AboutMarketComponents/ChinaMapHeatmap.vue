<!--
  标题: ChinaMapHeatmap
  功能: 热力图图表
  说明: 热力图图表
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-12-13
-->

<template>
  <div ref="mapContainer" class="china-map-heatmap"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';

interface MapDataItem {
  name: string;
  value: number;
  yesterdaySales?: number;
}

interface Props {
  data?: MapDataItem[];
  title?: string;
  min?: number;
  max?: number;
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  title: '区域价格差异热力图',
  min: 0,
  max: 100
});

const mapContainer = ref<HTMLElement | null>(null);
let chartInstance: ECharts | null = null;
let resizeObserver: ResizeObserver | null = null;
let chinaMapReady = false;
let loadChinaMapPromise: Promise<void> | null = null;

// 通过 script 动态加载 china.js（UMD 版依赖全局 this/window）
const loadChinaMapScript = () => {
  if (loadChinaMapPromise) return loadChinaMapPromise;

  loadChinaMapPromise = new Promise<void>((resolve, reject) => {
    // 如果已注册直接返回
    if (echarts.getMap('china')) {
      chinaMapReady = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.async = true;
    // 通过 import.meta.url 生成静态资源路径，适配打包
    script.src = new URL('./china.js', import.meta.url).href;

    // china.js 依赖全局 echarts
    (window as any).echarts = echarts;

    script.onload = () => {
      chinaMapReady = !!echarts.getMap('china');
      resolve();
    };
    script.onerror = (err) => {
      chinaMapReady = false;
      reject(err);
    };

    document.body.appendChild(script);
  });

  return loadChinaMapPromise;
};

// 确保中国地图已注册。china.js 依赖全局 echarts，因此先挂到 window 后按需动态导入。
const ensureChinaMapRegistered = async () => {
  if (chinaMapReady && echarts.getMap('china')) return;

  // 如果未注册，加载 china.js 脚本
  if (!echarts.getMap('china')) {
    await loadChinaMapScript();
  }

  chinaMapReady = !!echarts.getMap('china');
};

// 初始化图表
const initChart = () => {
  if (!mapContainer.value) return;

  chartInstance = echarts.init(mapContainer.value);

  // 初始化后立即调整大小
  nextTick(async () => {
    chartInstance?.resize();
    await ensureChinaMapRegistered();
    if (echarts.getMap('china')) {
      updateChart();
    } else {
      console.warn('中国地图数据未注册，请检查 china.js 是否正确加载');
    }
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

  // 如果 minValue 和 maxValue 相等（所有数据值相同），给它们一个范围以避免全黄
  if (minValue === maxValue) {
    const baseValue = minValue;
    // 如果值为0，使用固定范围
    if (baseValue === 0) {
      minValue = 0;
      maxValue = 100;
    } else {
      // 否则使用百分比范围（±10%）
      const range = Math.max(baseValue * 0.1, 1); // 至少1的差值
      minValue = Math.max(0, baseValue - range);
      maxValue = baseValue + range;
    }
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
          // 将价格格式化为两位小数
          const formattedPrice = Number(params.data.value).toFixed(2);
          let tooltipContent = `${params.name}<br/>价格: ${formattedPrice} 元/kg`;
          // 如果有销量数据，添加销量信息
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
      left: 20, // 右侧固定距离
      bottom: 60, // 底部固定距离
      text: ['High', 'Low'],
      realtime: false,
      calculable: true,
      inRange: {
        color: ['lightskyblue', 'yellow', 'orangered']
      },
      // 确保视觉映射正确应用
      itemWidth: 20,
      itemHeight: 140,
      textStyle: {
        color: '#333'
      }
    },
    series: [
      {
        name: '价格',
        type: 'map',
        map: 'china',
        roam: false, // 禁止缩放和拖动
        zoom: 1.0, // 初始缩放比例（略缩小）
        layoutCenter: ['50%', '52%'], // 上移地图位置
        layoutSize: '90%', // 缩小整体占比
        left: '6%',
        right: '6%',
        top: '3%', // 减少上侧留白
        bottom: '8%',
        aspectScale: 0.7,
        label: {
          show: true,
          fontSize: 10,
          color: '#333',
          fontWeight: 'normal',
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
            const tinyRegions = ['澳门', '香港'];
            const smallRegions = ['北京', '天津', '上海', '台湾', '海南'];

            if (tinyRegions.includes(name)) {
              return `{small|${name}}`;
            } else if (smallRegions.includes(name)) {
              return `{small|${name}}`;
            }
            return name;
          },
          // 调整标签位置
          offset: [0, 0],
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
        data: mapData,
        // 名称映射
        nameMap: {
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

onMounted(() => {
  nextTick(() => {
    // 初始化图表
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
  width: 100%;
  height: 100%;
  min-height: 520px; // 收缩默认高度
  margin: 0 auto;
}
</style>
