<template>
  <el-dialog
    v-model="visible"
    title="区域价格差异热力图"
    width="95%"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="heatmap-dialog"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">区域价格差异热力图</span>
      </div>
    </template>
    <div class="dialog-content">
      <ChinaMapHeatmap
        ref="heatmapRef"
        :data="heatmapData"
        :title="title"
        :min="minValue"
        :max="maxValue"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import ChinaMapHeatmap from './ChinaMapHeatmap.vue'

interface MapDataItem {
  name: string
  value: number
}

interface Props {
  modelValue: boolean
  data?: MapDataItem[]
  title?: string
  min?: number
  max?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  data: () => [],
  title: '区域价格差异热力图',
  min: 0,
  max: 100
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = ref(props.modelValue)
const heatmapRef = ref<InstanceType<typeof ChinaMapHeatmap> | null>(null)

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (newVal) => {
    visible.value = newVal
    if (newVal) {
      // 弹窗打开后，延迟更新图表以确保容器已渲染
      setTimeout(() => {
        heatmapRef.value?.updateChart()
      }, 300)
    }
  }
)

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit('update:modelValue', newVal)
})

// 计算属性
const heatmapData = computed(() => props.data)
const title = computed(() => props.title)
const minValue = computed(() => props.min)
const maxValue = computed(() => props.max)

// 关闭弹窗
const handleClose = () => {
  visible.value = false
  emit('close')
}
</script>

<style scoped lang="scss">
:deep(.heatmap-dialog) {
  .el-dialog {
    margin: 5vh auto;
    height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .el-dialog__header {
    padding: 20px;
    border-bottom: 1px solid #ebeef5;
    flex-shrink: 0;

    .dialog-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      .dialog-title {
        font-size: 18px;
        font-weight: bold;
        color: #303133;
      }
    }
  }

  .el-dialog__body {
    padding: 20px;
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
}

.dialog-content {
  width: 100%;
  height: 100%;
  flex: 1;
  min-height: 0;
}
</style>

