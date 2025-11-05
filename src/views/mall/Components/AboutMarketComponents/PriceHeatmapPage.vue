<template>
  <div class="price-heatmap-page">
    <!-- 面包屑导航 -->
    <div class="breadcrumb-container">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item @click="goBack" style="cursor: pointer">
          当前位置
        </el-breadcrumb-item>
        <el-breadcrumb-item>市场行情</el-breadcrumb-item>
        <el-breadcrumb-item>价格走势</el-breadcrumb-item>
        <el-breadcrumb-item class="active">区域价格差异热力图</el-breadcrumb-item>
      </el-breadcrumb>
    </div>

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import ChinaMapHeatmap from './ChinaMapHeatmap.vue'

interface MapDataItem {
  name: string
  value: number
}

const router = useRouter()
const heatmapRef = ref<InstanceType<typeof ChinaMapHeatmap> | null>(null)

// 热力图数据（写死，用于演示）
const heatmapData = ref<MapDataItem[]>([
  { name: '北京', value: 65.5 },
  { name: '天津', value: 58.3 },
  { name: '河北', value: 52.1 },
  { name: '山西', value: 48.7 },
  { name: '内蒙古', value: 45.2 },
  { name: '辽宁', value: 55.8 },
  { name: '吉林', value: 50.3 },
  { name: '黑龙江', value: 47.9 },
  { name: '上海', value: 68.2 },
  { name: '江苏', value: 62.4 },
  { name: '浙江', value: 60.1 },
  { name: '安徽', value: 54.6 },
  { name: '福建', value: 56.8 },
  { name: '江西', value: 51.2 },
  { name: '山东', value: 59.5 },
  { name: '河南', value: 53.4 },
  { name: '湖北', value: 57.6 },
  { name: '湖南', value: 55.3 },
  { name: '广东', value: 63.7 },
  { name: '广西', value: 49.8 },
  { name: '海南', value: 46.5 },
  { name: '重庆', value: 58.9 },
  { name: '四川', value: 56.2 },
  { name: '贵州', value: 48.3 },
  { name: '云南', value: 50.7 },
  { name: '西藏', value: 42.1 },
  { name: '陕西', value: 54.8 },
  { name: '甘肃', value: 47.2 },
  { name: '青海', value: 44.6 },
  { name: '宁夏', value: 49.1 },
  { name: '新疆', value: 46.8 }
])

const title = computed(() => '区域价格差异热力图')
const minValue = computed(() => 40)
const maxValue = computed(() => 80)

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.price-heatmap-page {
  padding: 12px;
  background-color: #fff;
  min-height: calc(100vh - 60px);

  .breadcrumb-container {
    margin-bottom: 16px;
    padding: 8px 0;
    font-size: 14px;

    :deep(.el-breadcrumb__item) {
      .el-breadcrumb__inner {
        color: #606266;

        &.is-link {
          color: #606266;
          font-weight: normal;
        }
      }

      &.active {
        .el-breadcrumb__inner {
          color: #409eff;
          font-weight: bold;
        }
      }
    }
  }

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

