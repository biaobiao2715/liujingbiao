<!--
  标题: creditPlatform/repaymentPlans/LoanTrackingDialog.vue
  功能: 贷款追踪
  说明: 贷款追踪
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

<template>
  <el-dialog :model-value="visible" width="50%" class="loan-tracking-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">贷款追踪</span>
      </div>
    </template>

    <div v-loading="loading" class="dialog-content">
      <!-- 步骤条 -->
      <div class="steps-container">
        <div v-for="(step, index) in trackingData" :key="index" class="step-item" :class="getStepClass(step.status)">
          <!-- 步骤圆圈 -->
          <div class="step-circle">
            <span class="step-number">{{ index + 1 }}</span>
          </div>

          <!-- 连接线 -->
          <div v-if="index < trackingData.length - 1" class="step-line" :class="{ 'active': isLineActive(index) }"></div>

          <!-- 步骤标题 -->
          <div class="step-title">{{ step.title }}</div>
        </div>
      </div>

      <!-- 时间信息 -->
      <div class="time-details">
        <div v-for="(step, index) in trackingData" :key="index" class="time-item">
          <!-- 单个时间 -->
          <div v-if="step.time && !step.times" class="time-tag">
            {{ step.time }}
          </div>

          <!-- 多个时间 -->
          <div
            v-else-if="step.times && step.times.length > 0"
            class="time-group"
            :class="{ 'expanded': repaymentExpanded[index] && step.times.length > DEFAULT_REPAYMENT_DISPLAY_COUNT }"
          >
            <template v-if="step.times.length <= DEFAULT_REPAYMENT_DISPLAY_COUNT">
              <div v-for="(time, timeIndex) in step.times" :key="timeIndex" class="time-tag">
                <template v-if="typeof time === 'string'">
                  {{ time }}
                </template>
                <template v-else>
                  <span class="period-text">{{ time.period }}</span
                  >{{ time.date }}
                </template>
              </div>
            </template>
            <template v-else>
              <!-- 显示前N个日期或全部日期 -->
              <div
                v-for="(time, timeIndex) in repaymentExpanded[index] ? step.times : step.times.slice(0, DEFAULT_REPAYMENT_DISPLAY_COUNT)"
                :key="timeIndex"
                class="time-tag"
              >
                <template v-if="typeof time === 'string'">
                  {{ time }}
                </template>
                <template v-else>
                  <span class="period-text">{{ time.period }}</span
                  >{{ time.date }}
                </template>
              </div>
              <!-- 展开/收起按钮 -->
              <el-button type="primary" link size="small" @click="toggleRepaymentExpand(index)" class="expand-btn">
                {{ repaymentExpanded[index] ? '收起' : `展开全部(${step.times.length})` }}
                <el-icon style="margin-left: 4px">
                  <ArrowDown v-if="!repaymentExpanded[index]" />
                  <ArrowUp v-else />
                </el-icon>
              </el-button>
            </template>
          </div>

          <!-- 空占位 -->
          <div v-else class="time-tag empty">--</div>
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
import { ArrowDown, ArrowUp } from '@element-plus/icons-vue';
import { getTrackingInfo } from '@/api/creditPlatform/repaymentPlans';

/**
 * 还款日期项数据结构
 */
interface RepaymentDateItem {
  period: string; // 期数文本，如"第一期"、"第二期"
  date: string; // 日期字符串
}

/**
 * 追踪步骤数据结构
 */
interface TrackingStep {
  title: string; // 步骤标题
  time?: string; // 单个时间点
  times?: string[] | RepaymentDateItem[]; // 多个时间点（用于一个步骤有多个时间记录）
  status: 'wait' | 'process' | 'finish' | 'error'; // 步骤状态：等待/进行中/完成/错误
}

// 组件属性
const props = defineProps<{
  visible: boolean; // 弹窗显示状态
  data: Record<string, any> | null; // 贷款申请数据
}>();

// 组件事件
const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void; // 更新弹窗显示状态
}>();

// 加载状态
const loading = ref(false);

// 追踪步骤数据
const trackingData = ref<TrackingStep[]>([]);

// 还款日期展开状态
const repaymentExpanded = ref<Record<number, boolean>>({});

// 默认显示的还款日期数量
const DEFAULT_REPAYMENT_DISPLAY_COUNT = 5;

/**
 * 获取步骤样式类
 */
const getStepClass = (status: string) => {
  return {
    'step-finished': status === 'finish', // 已完成
    'step-processing': status === 'process', // 进行中
    'step-waiting': status === 'wait', // 等待中
    'step-error': status === 'error' // 错误
  };
};

/**
 * 判断连接线是否激活
 */
const isLineActive = (index: number) => {
  const currentStep = trackingData.value[index];
  const nextStep = trackingData.value[index + 1];

  // 当前步骤已完成，且下一步骤已完成或进行中时，连接线激活
  return currentStep.status === 'finish' && (nextStep.status === 'finish' || nextStep.status === 'process');
};

/**
 * 获取追踪数据
 */
const fetchTrackingData = async () => {
  if (!props.data?.id) return;

  loading.value = true;
  try {
    const res = await getTrackingInfo(props.data.id);
    if (res) {
      // 将原始数据转换为追踪步骤格式
      trackingData.value = convertToTrackingSteps(res);
    } else {
    }
  } catch (error) {
    console.error('获取追踪数据失败:', error);
  } finally {
    loading.value = false;
  }
};

/**
 * 将日期时间字符串格式化为 YYYY-MM-DD 格式
 */
const formatDateOnly = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';

  const str = String(dateStr).trim();
  if (!str || str === '--' || str === 'null') return '';

  // 如果已经是 YYYY-MM-DD 格式，直接返回
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // 如果是 YYYY-MM-DD HH:mm:ss 格式，提取日期部分
  const dateMatch = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (dateMatch) {
    return dateMatch[1];
  }

  // 尝试解析日期对象
  try {
    const date = new Date(str);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  } catch (e) {
    // 解析失败，返回原字符串
  }

  return str;
};

/**
 * 解析还款日期列表
 */
const parseRepaymentPeriodAndDates = (periodAndDates: Array<Record<string, any>> | null | undefined): RepaymentDateItem[] => {
  if (!periodAndDates || !Array.isArray(periodAndDates)) return [];

  const items: RepaymentDateItem[] = periodAndDates
    .map((item, index) => {
      const periodNum = Number(item?.planStatusList ?? index + 1);
      const dateStr = formatDateOnly(item?.repaymentDateList);
      if (!dateStr) return null;
      return {
        period: `第${periodNum}期`,
        date: dateStr
      };
    })
    .filter(Boolean) as RepaymentDateItem[];

  // 按期数排序
  items.sort((a, b) => {
    const numA = parseInt(a.period.match(/(\d+)/)?.[1] || '0');
    const numB = parseInt(b.period.match(/(\d+)/)?.[1] || '0');
    return numA - numB;
  });

  return items;
};

/**
 * 支持逗号分隔或分号分隔的期数格式，返回包含期数和日期的还款日期项数组
 */
const parseLegacyRepaymentDateList = (repaymentDateList: string | null | undefined): RepaymentDateItem[] => {
  if (!repaymentDateList) return [];

  const dateStr = String(repaymentDateList).trim();
  if (!dateStr || dateStr === '--' || dateStr === 'null') return [];

  // 判断格式：如果包含"第X期:"，则是期数格式（分号分隔）
  if (dateStr.includes('期:')) {
    // 解析期数格式：第24期:2048-11-28 00:00:00;第23期:2046-12-28 00:00:00;
    const items: RepaymentDateItem[] = [];
    const parts = dateStr.split(';');

    parts.forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed) return;

      // 提取期数和日期部分
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex !== -1) {
        const periodPart = trimmed.substring(0, colonIndex).trim();
        const datePart = trimmed.substring(colonIndex + 1).trim();

        if (datePart && datePart !== '--' && datePart !== 'null') {
          // 提取期数数字
          const periodMatch = periodPart.match(/(\d+)/);
          const periodNum = periodMatch ? parseInt(periodMatch[1]) : 0;

          // 格式化日期，只显示年月日
          const formattedDate = formatDateOnly(datePart);

          items.push({
            period: `第${periodNum}期`,
            date: formattedDate
          });
        }
      }
    });

    // 按期数从小到大排序（从第一期开始）
    items.sort((a, b) => {
      const numA = parseInt(a.period.match(/(\d+)/)?.[1] || '0');
      const numB = parseInt(b.period.match(/(\d+)/)?.[1] || '0');
      return numA - numB;
    });

    return items;
  } else {
    // 逗号分隔格式：2023-10-01,2023-11-01,2023-12-01
    const dates = dateStr
      .split(',')
      .map((date) => date.trim())
      .filter((date) => date && date !== '--' && date !== 'null');

    // 按日期排序（从早到晚）
    dates.sort((a, b) => {
      return new Date(a).getTime() - new Date(b).getTime();
    });

    // 转换为带期数的格式，并格式化日期
    return dates.map((date, index) => ({
      period: `第${index + 1}期`,
      date: formatDateOnly(date)
    }));
  }
};

/**
 * 将原始数据转换为追踪步骤格式
 */
const convertToTrackingSteps = (data: any): TrackingStep[] => {
  const steps: TrackingStep[] = [];

  // 1. 申请提交
  steps.push({
    title: '申请',
    time: formatDateOnly(data.createTime),
    status: data.createTime ? 'finish' : 'wait'
  });

  // 2. 审核中
  steps.push({
    title: '审批',
    time: formatDateOnly(data.reviewedAt),
    status: data.reviewedAt ? 'finish' : 'wait'
  });

  // 3. 合同签署
  steps.push({
    title: '合同签订',
    time: formatDateOnly(data.contractSigningDate),
    status: data.contractSigningDate ? 'finish' : 'wait'
  });

  // 4. 放款
  steps.push({
    title: '放贷',
    time: formatDateOnly(data.loanDate),
    status: data.loanDate ? 'finish' : 'wait'
  });

  // 5. 还款中
  const repaymentDates =
    parseRepaymentPeriodAndDates(data.repaymentPeriodAndDates) ||
    parseRepaymentPeriodAndDates(data.repaymentPeriodAndDatesList) || // 兼容可能的命名
    parseLegacyRepaymentDateList(data.repaymentDateList);
  const hasRepaymentDates = repaymentDates.length > 0;
  steps.push({
    title: '还款',
    ...(hasRepaymentDates ? { times: repaymentDates } : {}),
    status: hasRepaymentDates ? (data.completionDate ? 'finish' : 'process') : 'wait'
  });

  // 6. 结清
  steps.push({
    title: '完结',
    time: formatDateOnly(data.completionDate),
    status: data.completionDate ? 'finish' : 'wait'
  });

  return steps;
};

/**
 * 监听弹窗显示状态和数据 ID 变化
 */
watch([() => props.visible, () => props.data?.id], ([visible, id], [prevVisible, prevId]) => {
  if (visible && (!prevVisible || id !== prevId)) {
    fetchTrackingData();
  }
});

/**
 * 切换还款日期展开/收起状态
 */
const toggleRepaymentExpand = (index: number) => {
  repaymentExpanded.value[index] = !repaymentExpanded.value[index];
};

/**
 * 关闭弹窗
 */
const handleClose = () => {
  emit('update:visible', false);
  // 重置展开状态
  repaymentExpanded.value = {};
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
  overflow: visible;

  // 确保还款列有足够宽度
  > :nth-child(5) {
    min-width: 0;
    overflow: visible;
  }
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
  width: 100%;
  overflow: visible;

  .time-group {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 4px 0;
    overflow: visible;

    // 当展开时，添加滚动容器
    &.expanded {
      max-height: 300px;
      overflow-y: auto;
      overflow-x: visible;
      padding-right: 8px;

      // 自定义滚动条样式
      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f5f5f5;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: #d9d9d9;
        border-radius: 3px;

        &:hover {
          background: #bfbfbf;
        }
      }
    }
  }

  .expand-btn {
    margin-top: 2px;
    font-size: 12px;
    padding: 4px 8px;
    color: #1890ff;
    white-space: nowrap;

    &:hover {
      color: #40a9ff;
    }

    .el-icon {
      transition: transform 0.3s ease;
    }
  }

  .time-tag {
    font-size: 11px;
    color: #262626;
    background: linear-gradient(135deg, #ffffff 0%, #f5f7fa 100%);
    padding: 5px 10px;
    border-radius: 4px;
    border: 1px solid #e0e0e0;
    white-space: nowrap;
    text-align: left;
    width: auto;
    min-width: fit-content;
    max-width: none;
    box-sizing: border-box;
    line-height: 1.4;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
    font-weight: 500;
    display: inline-block;
    overflow: visible;
    word-wrap: normal;
    word-break: keep-all;

    // 期数文本样式
    .period-text {
      color: #1890ff;
      font-weight: 600;
      margin-right: 4px;
    }

    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      border-color: #1890ff;
      background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%);
    }

    &.empty {
      color: #bfbfbf;
      background: #fafafa;
      border-color: #e8e8e8;

      &:hover {
        transform: none;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        border-color: #e8e8e8;
        background: #fafafa;
      }
    }
  }
}

// 弹窗底部
.dialog-footer {
  display: flex;
  justify-content: flex-end;

  .el-button {
    min-width: 80px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .dialog-content {
    padding: 20px 16px;
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
