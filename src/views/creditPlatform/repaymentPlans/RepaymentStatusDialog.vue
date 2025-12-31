<!--
  标题: creditPlatform/repaymentPlans/RepaymentStatusDialog.vue
  功能: 还款情况
  说明: 还款情况
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->

<template>
  <el-dialog
    :model-value="visible"
    width="50%"
    class="repayment-status-dialog"
    append-to-body
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-title">还款情况</div>
    </template>

    <div v-loading="loading" class="dialog-content">
      <!-- 顶部操作按钮 -->
      <div class="top-actions">
        <el-button type="primary" class="primary-btn" @click="handleSubmit">提交修改信息</el-button>
        <el-button @click="handleClose">返回</el-button>
      </div>

      <!-- 还款卡片列表 -->
      <div class="plan-grid">
        <div v-for="item in repaymentList" :key="item.loanPeriod" class="plan-card">
          <div class="card-content">
            <div class="form-row">
              <span class="label">还款期数</span>
              <span class="value">{{ item.loanPeriod }}期</span>
            </div>
            <div class="form-row">
              <span class="label">还款日期</span>
              <span class="value">{{ formatDateOnly(item.repaymentDate) }}</span>
            </div>
            <div class="form-row">
              <span class="label">还款金额</span>
              <span class="value">{{ item.totalAmount }} 元</span>
            </div>
            <div class="form-row">
              <span class="label">还款卡号</span>
              <div v-if="canEditCardNumber(item)" class="card-number-wrapper">
                <el-input
                  v-model="item.repaymentCardNo"
                  placeholder="请输入收款卡号"
                  size="small"
                  class="card-number-input"
                  maxlength="19"
                  show-word-limit
                  @input="validateCardNumber(item)"
                />
                <el-button type="primary" size="small" @click="handleReadCardNumber(item)" class="read-card-btn">读取收款卡号</el-button>
              </div>
              <span v-else class="value">{{ item.repaymentCardNo || '--' }}</span>
            </div>
            <div v-if="canEditCardNumber(item) && item.cardNumberError" class="error-tip">
              {{ item.cardNumberError }}
            </div>
            <div class="form-row">
              <span class="label">还款状态</span>
              <el-select v-if="canEditStatus(item)" v-model="item.planStatus" placeholder="请选择" size="small" class="status-select">
                <el-option label="待还款" :value="0" />
                <el-option label="已还款" :value="1" />
                <el-option label="已逾期" :value="2" />
              </el-select>
              <span v-else class="status-text" :style="{ color: getStatusColor(item.planStatus) }">
                {{ getStatusText(item.planStatus) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getRepaymentPlan, updateRepaymentPlan } from '@/api/creditPlatform/loanApplications';

interface RepaymentItem {
  loanPeriod: number; // 期数
  repaymentDate: string; // 还款日期
  totalAmount: number; // 还款金额
  repaymentCardNo?: string; // 还款卡号
  cardNumberError?: string; // 卡号错误信息
  planStatus: number; // 还款状态：0=待还款, 1=已还款, 2=已逾期
  originalStatus?: number; // 原始状态（用于判断是否可编辑）
  [key: string]: any;
}

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
  (event: 'refresh'): void;
}>();

const loading = ref(false);

/**
 * 只保留日期部分（YYYY-MM-DD）
 */
const formatDateOnly = (value: string | undefined | null) => {
  if (!value) return '--';
  // 支持 'YYYY-MM-DD' 或 'YYYY-MM-DD HH:mm:ss'
  const str = String(value);
  const datePart = str.split(' ')[0];
  // 简单校验是否类似日期格式
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(datePart)) {
    return datePart;
  }
  return str;
};

/**
 * 判断还款日期是否已到
 */
const isRepaymentDateReached = (dateStr: string) => {
  const repaymentDate = new Date(dateStr);
  const now = new Date();
  return repaymentDate <= now;
};

const repaymentList = ref<RepaymentItem[]>([]);

// 获取还款计划数据
const fetchRepaymentPlan = async () => {
  if (!props.data?.id) {
    return;
  }

  loading.value = true;
  try {
    const response: any = await getRepaymentPlan(props.data.id);
    // 确保 planStatus 是数字类型
    repaymentList.value = (response || []).map((item: any) => ({
      ...item,
      repaymentCardNo: item.repaymentCardNo ?? item.collectionAccountNumber ?? '',
      planStatus: Number(item.planStatus),
      originalStatus: Number(item.planStatus),
      cardNumberError: ''
    }));
  } catch (error) {
    console.error('获取还款计划失败:', error);
  } finally {
    loading.value = false;
  }
};

// 监听弹窗显示状态，显示时获取数据
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      fetchRepaymentPlan();
    }
  },
  { immediate: true }
);

/**
 状态值：0=待还款, 1=已还款, 2=已逾期
 */
const getStatusText = (status: number | undefined) => {
  const statusMap: Record<number, string> = {
    0: '待还款',
    1: '已还款',
    2: '已逾期'
  };
  return status !== undefined ? statusMap[status] || '--' : '--';
};

/**
 * 待还款(#FF7B00)、已还款(#0B79EF)、已逾期(#FF0000)
 */
const getStatusColor = (status: number | undefined) => {
  const colorMap: Record<number, string> = {
    0: '#FF7B00',
    1: '#0B79EF',
    2: '#FF0000'
  };
  return status !== undefined ? colorMap[status] || '#606266' : '#606266';
};

/**
 * 判断是否可以编辑还款卡号
 * 1. 已还款(status=1) - 不可编辑
 * 2. 已逾期(status=2) - 可以编辑
 * 3. 待还款(status=0) - 只有还款日期已到的可以编辑
 */
const canEditCardNumber = (item: RepaymentItem) => {
  // 使用原始状态进行判断，而不是当前修改后的状态
  const status = Number(item.originalStatus ?? item.planStatus);

  // 已还款，不可编辑
  if (status === 1) {
    return false;
  }

  // 已逾期，可以编辑
  if (status === 2) {
    return true;
  }

  // 待还款，只有还款日期已到的可以编辑
  if (status === 0) {
    return isRepaymentDateReached(item.repaymentDate);
  }

  return false;
};

/**
 * 判断是否可以编辑还款状态
 */
const canEditStatus = (item: RepaymentItem) => {
  return canEditCardNumber(item);
};

// 校验银行卡号（只校验12-19位数字）
const validateCardNumber = (item: RepaymentItem) => {
  const cardNumber = (item.repaymentCardNo || '').replace(/\s/g, '');

  item.cardNumberError = '';

  if (!cardNumber) {
    return;
  }

  if (!/^\d+$/.test(cardNumber)) {
    item.cardNumberError = '请输入正确的卡号';
    return;
  }

  if (cardNumber.length < 12 || cardNumber.length > 19) {
    item.cardNumberError = '请输入正确的卡号';
    return;
  }
};

// 读取收款卡号
const handleReadCardNumber = (item: RepaymentItem) => {
  // 从贷款申请数据中读取收款卡号
  const savedCardNumber = props.data?.bankAccountNumber || props.data?.bankCardNo || props.data?.collectionAccountNumber;

  if (savedCardNumber) {
    item.repaymentCardNo = savedCardNumber;
    validateCardNumber(item);
    ElMessage.success('已读取收款卡号');
  } else {
    ElMessage.warning('未找到收款卡号信息');
  }
};

/**
 * 提交修改信息
 */
const handleSubmit = async () => {
  // 首先对所有可编辑的银行卡号进行校验
  let hasValidationError = false;
  const errorMessages: string[] = [];

  repaymentList.value.forEach((item, index) => {
    if (canEditCardNumber(item)) {
      // 检查银行卡号是否为空
      if (!item.repaymentCardNo || !item.repaymentCardNo.trim()) {
        hasValidationError = true;
        errorMessages.push(`第${item.loanPeriod}期还款卡号不能为空`);
        return;
      }

      // 重新校验银行卡号格式
      validateCardNumber(item);

      // 检查是否有校验错误
      if (item.cardNumberError) {
        hasValidationError = true;
        errorMessages.push(`第${item.loanPeriod}期${item.cardNumberError}`);
      }
    }
  });

  // 如果有校验错误，显示具体错误信息
  if (hasValidationError) {
    const errorMsg = errorMessages.length > 0 ? errorMessages.join('；') : '请完善还款信息后再提交';
    ElMessage.warning(errorMsg);
    return;
  }

  if (!props.data?.id) {
    return;
  }

  loading.value = true;
  try {
    // 准备提交数据：提交完整的还款计划数组（包含所有字段）
    const submitData = repaymentList.value.map((item) => {
      const { cardNumberError, originalStatus, ...rest } = item;
      return {
        ...rest,
        repaymentCardNo: rest.repaymentCardNo || '',
        planStatus: Number(rest.planStatus)
      };
    });

    // 调用更新接口（与RepaymentPlanDialog相同，但不传递ossId）
    const response = await updateRepaymentPlan(props.data.id, undefined, submitData);

    if (response.code === 200) {
      ElMessage.success('提交成功');
      // 重新获取数据
      await fetchRepaymentPlan();
      emit('refresh');
      emit('update:visible', false);
    } else {
    }
  } catch (error) {
    console.error('提交还款信息失败:', error);
  } finally {
    loading.value = false;
  }
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.dialog-content {
  padding: 0;
}

.top-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  padding: 0 4px;

  .el-button {
    min-width: 120px;
  }

  .primary-btn {
    background-color: #108c58;
    border-color: #108c58;

    &:hover,
    &:focus {
      background-color: #0d7348;
      border-color: #0d7348;
    }
  }
}

.plan-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  max-height: 600px;
  overflow-y: auto;
  padding: 4px;
}

.plan-card {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background: url('@/assets/images/huankuanPlanBg.png') no-repeat right center;
  background-size: cover;
  width: calc(50% - 8px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);

  .card-content {
    padding: 20px 16px;
  }
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  .label {
    font-size: 14px;
    color: #606266;
    min-width: 85px;
    font-weight: 500;
  }

  .value {
    flex: 1;
    font-size: 14px;
    color: #303133;
    text-align: right;
  }

  .card-number-wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    justify-content: flex-end;
  }

  .card-number-input {
    width: 140px;
  }

  .read-card-btn {
    white-space: nowrap;
    background-color: #108c58;
    border-color: #108c58;

    &:hover,
    &:focus {
      background-color: #0d7348;
      border-color: #0d7348;
    }
  }

  .status-select {
    width: 110px;
    margin-left: auto;
  }
}

.error-tip {
  font-size: 12px;
  color: #f56c6c;
  margin-top: -12px;
  margin-bottom: 12px;
  text-align: right;
}

.status-text {
  font-weight: 600;
  flex: 1;
  text-align: right;
}

// 响应式设计
@media (max-width: 768px) {
  .plan-card {
    width: 100%;
  }
}
</style>
