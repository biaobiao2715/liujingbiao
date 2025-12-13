<!--
  标题: 举报热点地图组件
  功能: 展示平台管理首页的举报热点地图，支持按类目和时间范围筛选数据，并提供导出功能。
  说明: 该组件使用 ECharts 绘制中国地图热力图，支持按举报类别和时间范围筛选数据。
  当前版本: 2.0
  开发信息: Created by 门世超 2025-10-20, Refactored 2025-11-22
-->
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
let zoomCheckTimer: number | null = null; // 缩放检查定时器
let updateTimer: number | null = null; // 标签更新防抖定时器
const selectedIsland = ref<string | null>(null);
// 岛屿区域：包括可能的名称变体
const islandRegions = ['海南', '广东', '台湾', '台湾省', '南海诸岛'];
// 岛屿基础样式：常显轮廓（黑色）
const islandItemStyle = {
  areaColor: '#000',
  borderColor: '#000',
  color: '#000',
  opacity: 1
};

// 当前地图缩放级别
const currentZoom = ref(1.2);
// 需要隐藏标签的区域（默认隐藏，放大地图时显示）
// 注意：地图数据中可能使用"香港特别行政区"和"澳门特别行政区"，需要同时匹配
const hiddenLabelRegions = ['香港', '澳门', '香港特别行政区', '澳门特别行政区'];

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

  // 选择事件：仅在选中目标岛屿时显示拆分小图
  chartInstance.on('selectchanged', (params: any) => {
    // params.selected 结构：{ seriesName: { [name]: boolean } }
    const selectedMap = params?.selected?.['举报数据'] || {};
    const selectedNames = Object.keys(selectedMap).filter((k) => selectedMap[k]);

    // 查找选中的岛屿（支持名称变体）
    let island: string | null = null;
    for (const selectedName of selectedNames) {
      // 检查是否匹配岛屿区域（包括变体）
      if (selectedName === '台湾' || selectedName === '台湾省') {
        island = '台湾';
        break;
      } else if (islandRegions.includes(selectedName)) {
        island = selectedName;
        break;
      }
    }

    selectedIsland.value = island;

    // 更新岛屿小图的显示状态
    const updateRegions = () => {
      const regions: any[] = [];

      // 处理所有岛屿区域（排除"台湾省"，因为它是"台湾"的变体）
      const baseIslandNames = ['海南', '广东', '台湾', '南海诸岛'];
      for (const name of baseIslandNames) {
        const isSelected = island === name || (name === '台湾' && (island === '台湾' || island === '台湾省'));
        regions.push({
          name,
          // 岛屿轮廓始终展示，只有选中时显示标签并加重
          label: { show: isSelected },
          itemStyle: { ...islandItemStyle },
          emphasis: {
            label: { show: isSelected },
            itemStyle: { ...islandItemStyle }
          },
          select: {
            label: { show: isSelected },
            itemStyle: { ...islandItemStyle }
          }
        });
      }

      // 如果地图数据中使用"台湾省"，也需要处理
      if (island === '台湾') {
        regions.push({
          name: '台湾省',
          label: { show: true },
          itemStyle: { ...islandItemStyle },
          emphasis: {
            label: { show: true },
            itemStyle: { ...islandItemStyle }
          },
          select: {
            label: { show: true },
            itemStyle: { ...islandItemStyle }
          }
        });
      } else {
        regions.push({
          name: '台湾省',
          label: { show: false },
          itemStyle: { ...islandItemStyle },
          emphasis: {
            label: { show: false },
            itemStyle: { ...islandItemStyle }
          },
          select: {
            label: { show: false },
            itemStyle: { ...islandItemStyle }
          }
        });
      }

      return regions;
    };

    chartInstance?.setOption(
      {
        series: [
          {
            regions: updateRegions()
          }
        ]
      },
      false
    ); // 不合并，直接替换
  });

  // 更新香港和澳门标签显示状态的函数（添加防抖，避免频繁更新导致晃动）
  const updateHiddenRegionLabels = (zoom: number, forceUpdate: boolean = false) => {
    // 清除之前的定时器
    if (updateTimer !== null) {
      clearTimeout(updateTimer);
    }

    // 防抖：延迟 300ms 执行更新，避免频繁更新导致晃动（放大和缩小都适用）
    updateTimer = window.setTimeout(() => {
      // 检查是否需要更新（只有当缩放级别跨越阈值 6 时才更新）
      const oldShouldShow = currentZoom.value >= 6;
      const newShouldShow = zoom >= 6;

      // 如果显示状态没有改变，且缩放级别变化不大，且不是强制更新，则不更新
      if (!forceUpdate && oldShouldShow === newShouldShow && Math.abs(zoom - currentZoom.value) < 0.8) {
        currentZoom.value = zoom; // 只更新值，不触发渲染
        updateTimer = null;
        return;
      }

      currentZoom.value = zoom;

      // 更新标签显示状态（需要同时处理简写和完整名称）
      chartInstance?.setOption(
        {
          series: [
            {
              regions: ['香港', '澳门', '香港特别行政区', '澳门特别行政区'].map((name) => ({
                name,
                label: {
                  show: newShouldShow, // 根据缩放级别动态控制
                  fontSize: newShouldShow ? 12 : 0, // 不显示时字体大小为 0
                  fontWeight: 'bold',
                  color: newShouldShow ? '#333' : 'transparent'
                },
                emphasis: {
                  label: {
                    show: true, // 悬停时始终显示
                    fontSize: 14,
                    fontWeight: 'bold',
                    color: '#333'
                  }
                }
              }))
            }
          ]
        },
        false
      ); // false 表示不合并，直接替换

      // 调试信息（开发环境）
      // @ts-ignore - import.meta.env 在 Vite 中可用
      if (import.meta.env.DEV) {
        console.log('地图缩放:', { zoom, shouldShowLabels: newShouldShow, currentZoom: currentZoom.value });
      }

      updateTimer = null;
    }, 300); // 300ms 防抖延迟（增加延迟时间，减少放大和缩小时的晃动）
  };

  // 监听地图缩放事件，根据缩放级别决定是否显示香港和澳门的标签
  chartInstance.on('georoam', (params: any) => {
    // 只处理缩放事件，忽略平移事件（平移不会改变缩放级别，不需要更新标签）
    if (params && params.zoom !== undefined && params.zoom !== null) {
      const zoom = params.zoom;

      // 只在缩放级别真正改变时才更新（避免平移事件触发更新）
      if (Math.abs(zoom - currentZoom.value) > 0.01) {
        updateHiddenRegionLabels(zoom);
      }
    }
    // 如果是平移事件（只有 dx/dy，没有 zoom），则不处理，避免不必要的更新
  });

  // 使用定时器定期检查缩放级别（作为备用方案，降低频率避免晃动）
  const checkZoomLevel = () => {
    if (!chartInstance) return;
    try {
      const option = chartInstance.getOption() as any;
      const currentZoomLevel = option?.series?.[0]?.zoom || 1.2;
      // 只有当缩放级别跨越阈值 6 时才更新，避免频繁更新
      const oldShouldShow = currentZoom.value >= 6;
      const newShouldShow = currentZoomLevel >= 6;
      // 只有当显示状态改变或缩放级别变化较大时才更新
      if (oldShouldShow !== newShouldShow || Math.abs(currentZoomLevel - currentZoom.value) > 0.8) {
        updateHiddenRegionLabels(currentZoomLevel, true); // 强制更新
      } else {
        // 只更新值，不触发渲染
        currentZoom.value = currentZoomLevel;
      }
    } catch (e) {
      // 忽略错误
    }
  };

  // 每 1500ms 检查一次缩放级别（进一步降低频率，减少晃动）
  zoomCheckTimer = window.setInterval(checkZoomLevel, 1500);

  // 初始化时也检查一次缩放级别
  nextTick(() => {
    checkZoomLevel();
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
          if (
            data.status0Count !== undefined ||
            data.status1Count !== undefined ||
            data.status2Count !== undefined ||
            data.status3Count !== undefined ||
            data.status4Count !== undefined
          ) {
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
          let tooltipContent = `${params.name}<br/>价格: ${params.data.value} 元/斤`;
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
        roam: 'scale', // 禁止拖拽，仅允许缩放
        zoom: 1.2,
        scaleLimit: {
          min: 0.8, // 最小缩放级别
          max: 10 // 最大缩放级别（增加到 10 倍，可以放大更多）
        },
        selectedMode: 'single',
        // 特殊区域（岛屿/拆分小图）：轮廓始终展示，选中时显示标签
        regions: [
          // 岛屿区域：轮廓始终展示，选中时显示标签
          // 使用基础名称列表，排除"台湾省"（因为它是"台湾"的变体）
          ...['海南', '广东', '台湾', '南海诸岛'].map((name) => {
            const isSelected =
              selectedIsland.value === name || (name === '台湾' && (selectedIsland.value === '台湾' || selectedIsland.value === '台湾省'));
            return {
              name,
              // 岛屿轮廓始终展示，选中时显示标签
              label: { show: isSelected },
              itemStyle: { ...islandItemStyle },
              emphasis: {
                label: { show: isSelected },
                itemStyle: { ...islandItemStyle }
              },
              select: {
                label: { show: isSelected },
                itemStyle: { ...islandItemStyle }
              }
            };
          }),
          // 如果地图数据中使用"台湾省"，也需要配置（默认隐藏）
          {
            name: '台湾省',
            label: { show: selectedIsland.value === '台湾' || selectedIsland.value === '台湾省' },
            itemStyle: { ...islandItemStyle },
            emphasis: {
              label: { show: selectedIsland.value === '台湾' || selectedIsland.value === '台湾省' },
              itemStyle: { ...islandItemStyle }
            },
            select: {
              label: { show: selectedIsland.value === '台湾' || selectedIsland.value === '台湾省' },
              itemStyle: { ...islandItemStyle }
            }
          },
          // 香港和澳门：默认隐藏标签，放大到 2.0 倍以上时显示，悬停时始终显示
          // 需要同时配置简写和完整名称
          ...['香港', '澳门', '香港特别行政区', '澳门特别行政区'].map((name) => ({
            name,
            label: {
              show: false, // 强制隐藏，默认不显示
              fontSize: 0, // 设置为 0 确保不显示
              color: 'transparent' // 颜色设为透明
            },
            emphasis: {
              label: {
                show: true, // 悬停时始终显示
                fontSize: 14,
                fontWeight: 'bold',
                color: '#333'
              }
            }
          }))
        ],
        label: {
          show: function (params: any) {
            const name = params.name;
            // 香港和澳门：根据当前缩放级别决定是否显示
            // 检查多种可能的名称格式
            const isHiddenRegion =
              hiddenLabelRegions.includes(name) ||
              name === '香港特别行政区' ||
              name === '澳门特别行政区' ||
              name?.includes('香港') ||
              name?.includes('澳门');
            if (isHiddenRegion) {
              // 缩放级别 >= 6 时显示，否则隐藏
              return currentZoom.value >= 6;
            }
            // 其他区域正常显示
            return true;
          },
          fontSize: 10,
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
            // 香港和澳门：根据缩放级别决定是否显示
            // 检查多种可能的名称格式
            const isHiddenRegion =
              hiddenLabelRegions.includes(name) ||
              name === '香港特别行政区' ||
              name === '澳门特别行政区' ||
              name?.includes('香港') ||
              name?.includes('澳门');
            if (isHiddenRegion) {
              // 缩放级别 >= 6 时显示标签，否则返回空字符串
              if (currentZoom.value >= 6) {
                return name;
              }
              return '';
            }
            // 对于特别小的区域，使用更小的字体
            const smallRegions = ['北京', '天津', '上海', '台湾', '海南'];
            if (smallRegions.includes(name)) {
              // 小区域使用小字体
              return `{small|${name}}`;
            }
            // 对于大区域，使用正常字体
            return name;
          },
          // 调整标签位置
          offset: function (params: any) {
            const name = params.name;
            // 香港向上偏移，澳门向下偏移（仅在显示时）
            if (name === '香港') {
              return [50, -14];
            } else if (name === '澳门') {
              return [50, 14];
            }
            return [0, 0];
          },
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
          draggable: false, // 不允许拖拽标签
          // 自定义隐藏逻辑：强制隐藏香港和澳门的标签（除非缩放足够大）
          labelLine: false
        },
        emphasis: {
          label: {
            // 悬停时显示所有标签，包括香港和澳门
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
          '新疆维吾尔自治区': '新疆',
          '香港特别行政区': '香港',
          '澳门特别行政区': '澳门'
        }
      }
    ]
  };

  chartInstance.setOption(option, true);

  // 再次延迟调整，确保图表正确渲染
  setTimeout(() => {
    chartInstance?.resize();
    // 更新后检查缩放级别，确保标签状态正确
    try {
      const option = chartInstance?.getOption() as any;
      const currentZoomLevel = option?.series?.[0]?.zoom || 1.2;
      if (currentZoomLevel !== currentZoom.value) {
        currentZoom.value = currentZoomLevel;
        const shouldShowLabels = currentZoomLevel >= 6;
        chartInstance?.setOption(
          {
            series: [
              {
                regions: ['香港', '澳门', '香港特别行政区', '澳门特别行政区'].map((name) => ({
                  name,
                  label: {
                    show: shouldShowLabels,
                    fontSize: shouldShowLabels ? 12 : 0,
                    fontWeight: 'bold',
                    color: shouldShowLabels ? '#333' : 'transparent'
                  }
                }))
              }
            ]
          },
          false
        );
      }
    } catch (e) {
      // 忽略错误
    }
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
watch(
  () => props.data,
  () => {
    if (chartInstance) {
      updateChart();
    }
  },
  { deep: true }
);

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
  // 清理缩放检查定时器
  if (zoomCheckTimer !== null) {
    clearInterval(zoomCheckTimer);
    zoomCheckTimer = null;
  }
  // 清理标签更新防抖定时器
  if (updateTimer !== null) {
    clearTimeout(updateTimer);
    updateTimer = null;
  }
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
