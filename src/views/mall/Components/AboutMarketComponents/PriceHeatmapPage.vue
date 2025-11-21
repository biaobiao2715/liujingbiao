<template>
  <div class="price-heatmap-page">
    <!-- 热力图内容 -->
    <div class="heatmap-content">
      <ChinaMapHeatmap
        ref="heatmapRef"
        :data="heatmapData"
        :title="title"
        :min="minValue"
        :max="maxValue"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import ChinaMapHeatmap from './ChinaMapHeatmap.vue'
import { heatmapList } from '@/api/mall/marketComponent'

interface MapDataItem {
  name: string
  value: number
  yesterdaySales?: number
}

const route = useRoute()
const heatmapRef = ref<InstanceType<typeof ChinaMapHeatmap> | null>(null)

// 热力图数据
const heatmapData = ref<MapDataItem[]>([])

// 计算最小值和最大值
const minValue = computed(() => {
  if (heatmapData.value.length === 0) return 0
  return Math.min(...heatmapData.value.map(item => item.value))
})

const maxValue = computed(() => {
  if (heatmapData.value.length === 0) return 100
  return Math.max(...heatmapData.value.map(item => item.value))
})

const title = computed(() => '区域价格差异热力图')

// 获取热力图数据
const fetchHeatmapData = async (goodsCategoryId?: string) => {
  try {
    // 优先使用 sessionStorage 中的数据（从价格走势页面传递过来的）
    const storedData = sessionStorage.getItem('heatmapData')
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        if (Array.isArray(parsedData)) {
          heatmapData.value = parsedData.map((item: any) => ({
            name: item.name,
            value: item.value,
            yesterdaySales: item.yesterdaySales
          }))
          // 使用完后清除 sessionStorage
          sessionStorage.removeItem('heatmapData')
          return
        }
      } catch (e) {
        console.error('解析 sessionStorage 数据失败:', e)
      }
    }
    
    // 如果没有存储的数据，尝试从路由参数获取 goodsCategoryId 并调用接口
    const categoryId = goodsCategoryId || route.query.goodsCategoryId as string
    if (!categoryId) {
      ElMessage.warning('缺少品种参数')
      return
    }
    
    const params: any = {
      goodsCategoryId: categoryId
    }
    
    const response = await heatmapList(params)
    if (response && response.code === 200) {
      const data = response.data || []
      // 将数据转换为热力图需要的格式
      heatmapData.value = (Array.isArray(data) ? data : []).map((item: any) => {
        // 处理省份名称：去掉"省"、"市"、"自治区"等后缀
        let provinceName = item.provinceName || ''
        provinceName = provinceName.replace(/省$|市$|自治区$|特别行政区$/, '')
        
        return {
          name: provinceName,
          value: Number(item.goodsPriceAvg || 0),
          yesterdaySales: item.yesterdaySales !== undefined ? Number(item.yesterdaySales) : undefined
        }
      })
    } else {
      ElMessage.error(response?.msg || '获取热力图数据失败')
    }
  } catch (error) {
    console.error('获取热力图数据失败:', error)
    ElMessage.error('获取热力图数据失败，请稍后重试')
  }
}

// 页面加载时获取数据
onMounted(() => {
  const categoryId = route.query.goodsCategoryId as string
  fetchHeatmapData(categoryId)
})
</script>

<style scoped lang="scss">
.price-heatmap-page {
  padding: 12px;
  background-color: #fff;
  min-height: calc(100vh - 60px);

  .heatmap-content {
    width: 100%;
    height: calc(100vh - 120px);
    min-height: 700px;
    background-color: #fff;
    border-radius: 4px;
    padding: 16px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    :deep(.china-map-heatmap) {
      width: 100%;
      height: 100%;
      min-height: 700px;
    }
  }
}
</style>

