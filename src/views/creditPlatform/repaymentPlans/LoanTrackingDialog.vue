<!--
  标题: creditPlatform/repaymentPlans/LoanTrackingDialog.vue
  功能: 贷款追踪
  说明: 贷款追踪
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

<template>
  <el-dialog :model-value="visible" width="600px" class="loan-tracking-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">贷款追踪</span>
      </div>
    </template>

    <div v-loading="loading" class="dialog-content">
      <div class="timeline-container">
        <div v-for="(step, index) in trackingData" :key="index" class="timeline-item">
          <!-- 左侧时间线 -->
          <div class="timeline-left">
            <div class="timeline-icon" :class="{ active: step.status === 'finish' || step.status === 'process' }"></div>
            <div v-if="index < trackingData.length - 1" class="timeline-line" :class="{ active: step.status === 'finish' }"></div>
          </div>
          <!-- 右侧卡片 -->
          <div class="timeline-card">
            <!-- 左侧图标 -->
            <img :src="getStepIcon(index)" class="card-left-icon" :class="{ 'repayment-icon': index === 4, 'completion-icon': index === 5 }" alt="" />
            <div class="card-content">
              <div class="card-title">{{ step.title }}</div>
              <!-- 单个时间 -->
              <div v-if="step.time && !step.times" class="card-time">{{ getTimeLabel(index) }}{{ step.time }}</div>
              <!-- 多个时间（还款） -->
              <template v-if="step.times && step.times.length > 0">
                <div v-for="(time, timeIndex) in repaymentExpanded ? step.times : step.times.slice(0, 6)" :key="timeIndex" class="card-time">
                  <template v-if="typeof time === 'string'">{{ time }}</template>
                  <template v-else>{{ time.period }}还款时间：{{ time.date }}</template>
                </div>
                <div v-if="step.times.length > 6" class="expand-btn" @click="repaymentExpanded = !repaymentExpanded">
                  {{ repaymentExpanded ? '收起' : `更多(${step.times.length - 6})` }}
                </div>
              </template>
            </div>
            <!-- 右下角图标 -->
            <img :src="getStepRightIcon(index)" class="card-right-icon" alt="" />
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { getTrackingInfo } from '@/api/creditPlatform/repaymentPlans';

// 导入图标
import daikuan1 from '@/assets/icons/svg/daikuan1.svg';
import daikuan2 from '@/assets/icons/svg/daikuan2.svg';
import daikuan3 from '@/assets/icons/svg/daikuan3.svg';
import daikuan4 from '@/assets/icons/svg/daikuan4.svg';
import daikuan5 from '@/assets/icons/svg/daikuan5.svg';
import daikuan6 from '@/assets/icons/svg/daikuan6.svg';
import daikuanR1 from '@/assets/icons/svg/daikuanR1.svg';
import daikuanR2 from '@/assets/icons/svg/daikuanR2.svg';
import daikuanR3 from '@/assets/icons/svg/daikuanR3.svg';
import daikuanR4 from '@/assets/icons/svg/daikuanR4.svg';
import daikuanR5 from '@/assets/icons/svg/daikuanR5.svg';
import daikuanR6 from '@/assets/icons/svg/daikuanR6.svg';

interface RepaymentDateItem {
  period: string;
  date: string;
}

interface TrackingStep {
  title: string;
  time?: string;
  times?: RepaymentDateItem[];
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
const repaymentExpanded = ref(false);

// 步骤图标映射
const stepIcons = [daikuan1, daikuan2, daikuan3, daikuan4, daikuan5, daikuan6];
const stepRightIcons = [daikuanR1, daikuanR2, daikuanR3, daikuanR4, daikuanR5, daikuanR6];

const getStepIcon = (index: number) => stepIcons[index] || daikuan1;
const getStepRightIcon = (index: number) => stepRightIcons[index] || daikuanR1;

// 时间标签
const timeLabels = ['申请时间：', '通过时间：', '签订时间：', '放款时间：', '', '结束时间：'];
const getTimeLabel = (index: number) => timeLabels[index] || '';

const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (!str || str === '--' || str === 'null') return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(str)) {
    return str.split(' ')[0];
  }
  try {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {}
  return str;
};

const parseRepaymentPeriodAndDates = (periodAndDates: Array<Record<string, any>> | null | undefined): RepaymentDateItem[] => {
  if (!periodAndDates || !Array.isArray(periodAndDates)) return [];
  const periodMap: Record<number, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十' };
  const items: RepaymentDateItem[] = periodAndDates
    .map((item, index) => {
      const periodNum = Number(item?.planStatusList ?? index + 1);
      const dateStr = formatDateTime(item?.repaymentDateList);
      if (!dateStr) return null;
      return { period: periodMap[periodNum] || String(periodNum) + '期', date: dateStr };
    })
    .filter(Boolean) as RepaymentDateItem[];
  return items;
};

const convertToTrackingSteps = (data: any): TrackingStep[] => {
  const steps: TrackingStep[] = [];
  steps.push({ title: '申请', time: formatDateTime(data.createTime), status: data.createTime ? 'finish' : 'wait' });
  steps.push({ title: '审批', time: formatDateTime(data.reviewedAt), status: data.reviewedAt ? 'finish' : 'wait' });
  steps.push({ title: '合同签订', time: formatDateTime(data.contractSigningDate), status: data.contractSigningDate ? 'finish' : 'wait' });
  steps.push({ title: '放贷', time: formatDateTime(data.loanDate), status: data.loanDate ? 'finish' : 'wait' });

  const repaymentDates = parseRepaymentPeriodAndDates(data.repaymentPeriodAndDates) || parseRepaymentPeriodAndDates(data.repaymentPeriodAndDatesList);
  const hasRepaymentDates = repaymentDates.length > 0;
  steps.push({
    title: '还款',
    ...(hasRepaymentDates ? { times: repaymentDates } : {}),
    status: hasRepaymentDates ? (data.completionDate ? 'finish' : 'process') : 'wait'
  });

  steps.push({ title: '完结', time: formatDateTime(data.completionDate), status: data.completionDate ? 'finish' : 'wait' });
  return steps;
};

const fetchTrackingData = async () => {
  if (!props.data?.id) return;
  loading.value = true;
  try {
    const res = await getTrackingInfo(props.data.id);
    if (res) {
      trackingData.value = convertToTrackingSteps(res);
    }
  } catch (error) {
    console.error('获取追踪数据失败:', error);
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

.dialog-content {
  padding: 24px;
  background: #fff;
  max-height: 70vh;
  overflow-y: auto;
}

.timeline-container {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  position: relative;

  .timeline-left {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-right: 16px;
    width: 40px;
    position: relative;

    .timeline-icon {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #e8e8e8;
      flex-shrink: 0;
      z-index: 1;
      margin-top: 34px;

      &.active {
        border-color: #108c58;
      }
    }

    .timeline-line {
      width: 2px;
      flex: 1;
      background: #e8e8e8;
      margin-bottom: -34px;

      &.active {
        background: #108c58;
      }
    }
  }

  .timeline-right {
    flex: 1;
    margin-bottom: 16px;
  }

  .timeline-card {
    flex: 1;
    position: relative;
    border-radius: 8px;
    min-height: 90px;
    padding: 16px;
    margin-bottom: 16px;
    background: linear-gradient(180deg, #f3fff9 0%, rgba(189, 228, 210, 0.44) 100%);
    border: 2px solid;
    border-image: linear-gradient(180deg, #f3fff9, rgba(189, 228, 210, 0.44)) 1;
    border-radius: 4px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

    .card-left-icon {
      position: absolute;
      left: -30px;
      top: 50%;
      transform: translateY(-50%);
      width: 80px;
      height: 80px;
      z-index: 2;

      &.repayment-icon {
        top: 10px;
        transform: none;
      }

      &.completion-icon {
        top: -10px;
        left: -40px;
        transform: none;
      }
    }

    .card-content {
      margin-left: 40px;

      .card-title {
        font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
        font-size: 16px;
        font-weight: 600;
        color: #108c58;
        margin-bottom: 8px;
      }

      .card-time {
        font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
        font-size: 14px;
        color: #333333;
        line-height: 1.8;
      }

      .expand-btn {
        color: #108c58;
        font-size: 14px;
        cursor: pointer;
        margin-top: 8px;

        &:hover {
          text-decoration: underline;
        }
      }
    }

    .card-right-icon {
      position: absolute;
      right: 16px;
      bottom: 16px;
      width: 32px;
      height: 32px;
      opacity: 0.5;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;

  .el-button {
    min-width: 80px;
    background-color: #108c58;
    border-color: #108c58;

    &:hover,
    &:focus {
      background-color: #0d7348;
      border-color: #0d7348;
    }
  }
}
</style>
