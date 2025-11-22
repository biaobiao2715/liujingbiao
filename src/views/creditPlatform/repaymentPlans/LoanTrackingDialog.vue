<template>
  <el-dialog 
    :model-value="visible" 
    width="1000px" 
    class="loan-tracking-dialog" 
    append-to-body 
    destroy-on-close 
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">贷款追踪</span>
      </div>
    </template>
    
    <div v-loading="loading" class="dialog-content">
      <!-- 步骤条 -->
      <div class="steps-container">
        <div 
          v-for="(step, index) in trackingSteps" 
          :key="index"
          class="step-item"
          :class="getStepClass(step.status)"
        >
          <!-- 步骤圆圈 -->
          <div class="step-circle">
            <span class="step-number">{{ index + 1 }}</span>
          </div>
          
          <!-- 连接线 -->
          <div 
            v-if="index < trackingSteps.length - 1" 
            class="step-line"
            :class="{ 'active': isLineActive(index) }"
          ></div>
          
          <!-- 步骤标题 -->
          <div class="step-title">{{ step.title }}</div>
        </div>
      </div>
      
      <!-- 时间信息 -->
      <div class="time-details">
        <div 
          v-for="(step, index) in trackingSteps" 
          :key="index"
          class="time-item"
        >
          <!-- 单个时间 -->
          <div v-if="step.time && !step.times" class="time-tag">
            {{ step.time }}
          </div>
          
          <!-- 多个时间 -->
          <div v-else-if="step.times && step.times.length > 0" class="time-group">
            <div 
              v-for="(time, timeIndex) in step.times" 
              :key="timeIndex" 
              class="time-tag"
            >
              {{ time }}
            </div>
          </div>
          
          <!-- 空占位 -->
          <div v-else class="time-tag empty">--</div>
        </div>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getTrackingInfo } from '@/api/creditPlatform/repaymentPlans';

interface TrackingStep {
  title: string;
  description: string;
  time?: string;
  times?: string[]; // 支持多个时间
  operator?: string;
  status: 'wait' | 'process' | 'finish' | 'error';
}

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const loading = ref(false);
const trackingData = ref<TrackingStep[]>([]);

const trackingSteps = computed(() => {
  return trackingData.value;
});

// 获取步骤样式类
const getStepClass = (status: string) => {
  return {
    'step-finished': status === 'finish',
    'step-processing': status === 'process',
    'step-waiting': status === 'wait',
    'step-error': status === 'error'
  };
};

// 判断连接线是否激活
const isLineActive = (index: number) => {
  const currentStep = trackingSteps.value[index];
  const nextStep = trackingSteps.value[index + 1];
  
  return currentStep.status === 'finish' && 
         (nextStep.status === 'finish' || nextStep.status === 'process');
};

const fetchTrackingData = async () => {
  if (!props.data?.id) return;
  
  loading.value = true;
  try {
    const res = await getTrackingInfo({ id: props.data.id });
    if (res.code === 200 && res.data) {
      trackingData.value = res.data;
    } else {
      ElMessage.error(res.msg || '获取追踪信息失败');
    }
  } catch (error) {
    console.error('获取追踪数据失败:', error);
    ElMessage.error('获取追踪信息失败');
  } finally {
    loading.value = false;
  }
};

watch([() => props.visible, () => props.data?.id], ([visible, id], [prevVisible, prevId]) => {
  if (visible && (!prevVisible || id !== prevId)) {
    fetchTrackingData();
  }
});

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
// 弹窗整体样式
.loan-tracking-dialog {
  :deep(.el-dialog) {
    border-radius: 8px;
    overflow: hidden;
  }
  
  :deep(.el-dialog__header) {
    padding: 20px 24px;
    background: #fafafa;
    border-bottom: 1px solid #e8e8e8;
  }
  
  :deep(.el-dialog__body) {
    padding: 0;
  }
  
  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    background: #fafafa;
    border-top: 1px solid #e8e8e8;
  }
}

// 弹窗标题
.dialog-header {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
    color: #262626;
  }
}

// 弹窗内容
.dialog-content {
  padding: 40px 24px;
  background: #fff;
}

// 创建统一的网格系统
.steps-container,
.time-details {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  padding: 0 15px;
  align-items: start;
}

// 步骤容器
.steps-container {
  margin-bottom: 40px;
  position: relative;
}

// 步骤项
.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  // 步骤圆圈
  .step-circle {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid #d9d9d9;
    background: #fff;
    position: relative;
    z-index: 2;
    
    .step-number {
      font-size: 14px;
      font-weight: 600;
      color: #999;
    }
  }
  
  // 连接线
  .step-line {
    position: absolute;
    top: 16px;
    left: calc(50% + 2.5px);
    width: calc(100% + 5px);
    height: 2px;
    background: #e8e8e8;
    z-index: 1;
    
    &.active {
      background: #52c41a;
    }
  }
  
  // 步骤标题
  .step-title {
    margin-top: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #666;
    text-align: center;
  }
  
  // 已完成状态
  &.step-finished {
    .step-circle {
      background: #52c41a;
      border-color: #52c41a;
      
      .step-number {
        color: #fff;
      }
    }
    
    .step-title {
      color: #52c41a;
    }
  }
  
  // 进行中状态
  &.step-processing {
    .step-circle {
      background: #1890ff;
      border-color: #1890ff;
      
      .step-number {
        color: #fff;
      }
    }
    
    .step-title {
      color: #1890ff;
    }
  }
  
  // 等待状态
  &.step-waiting {
    .step-circle {
      background: #f5f5f5;
      border-color: #d9d9d9;
      
      .step-number {
        color: #999;
      }
    }
    
    .step-title {
      color: #999;
    }
  }
  
  // 错误状态
  &.step-error {
    .step-circle {
      background: #ff4d4f;
      border-color: #ff4d4f;
      
      .step-number {
        color: #fff;
      }
    }
    
    .step-title {
      color: #ff4d4f;
    }
  }
}

// 时间详情（使用网格布局，与步骤对齐）
.time-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  min-width: 0; // 允许内容收缩
  
  .time-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    width: 100%;
  }
  
  .time-tag {
    font-size: 11px;
    color: #262626;
    background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    white-space: nowrap;
    text-align: center;
    width: auto;
    min-width: fit-content;
    box-sizing: border-box;
    line-height: 1.5;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
    font-weight: 500;
    display: inline-block;
    
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      border-color: #1890ff;
      background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
    }
    
    &.empty {
      color: #bfbfbf;
      background: #fafafa;
      border-color: #e8e8e8;
      
      &:hover {
        transform: none;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        border-color: #e8e8e8;
        background: #fafafa;
      }
    }
  }
}

// 弹窗底部
.dialog-footer {
  text-align: center;
  
  .el-button {
    min-width: 80px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dialog-content {
    padding: 20px 16px;
  }
  
  .steps-container .steps-wrapper {
    padding: 0 10px;
  }
  
  .time-details {
    padding: 0 10px;
  }
  
  .time-tag {
    min-width: 100px !important;
    font-size: 11px !important;
  }
}
</style>
