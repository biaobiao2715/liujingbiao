<template>
  <el-dialog :model-value="visible" width="50%" class="repayment-status-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">还款情况</span>
      </div>
    </template>

    <div v-loading="loading" class="dialog-content">
      <!-- 顶部操作按钮 -->
      <div class="top-actions">
        <el-button type="primary" @click="handleSubmit">提交修改信息</el-button>
        <el-button @click="handleClose">返回</el-button>
      </div>

      <!-- 还款卡片列表 -->
      <div class="repayment-cards">
        <div v-for="(item, index) in repaymentList" :key="index" class="repayment-card" :class="getCardClass(item.planStatus)">
          <div class="card-header">
            <span class="period-label">期数：{{ item.loanPeriod }}</span>
          </div>

          <div class="card-body">
            <div class="info-row">
              <span class="label">还款日期：</span>
              <span class="value">{{ formatDateOnly(item.repaymentDate) }}</span>
            </div>

            <div class="info-row">
              <span class="label">还款金额：</span>
              <span class="value amount">{{ item.totalAmount }} 元</span>
            </div>

            <div class="info-row">
              <span class="label">还款卡号：</span>
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
                <!-- @input="validateCardNumber(item)" -->
                <el-button type="primary" size="small" @click="handleReadCardNumber(item)" class="read-card-btn"> 读取收款卡号 </el-button>
              </div>
              <span v-else class="value">{{ item.repaymentCardNo || '--' }}</span>
            </div>
            <div v-if="canEditCardNumber(item) && item.cardNumberError" class="error-tip">
              {{ item.cardNumberError }}
            </div>

            <div class="info-row">
              <span class="label">还款状态：</span>
              <el-select v-if="canEditStatus(item)" v-model="item.planStatus" placeholder="请选择" size="small" class="status-select">
                <el-option label="待还款" :value="0" />
                <el-option label="已还款" :value="1" />
                <el-option label="已逾期" :value="2" />
              </el-select>
              <span v-else class="value" :style="{ color: getStatusColor(item.planStatus), fontWeight: 600 }">
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
import { ref, computed, watch } from 'vue';
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
  [key: string]: any; // 其余字段保持与后端一致
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
 * 获取当前年月
 * @returns 当前年月（格式：2025-1）
 */
const getCurrentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
};

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
 * 判断是否是当月或历史月份
 * @param dateStr - 日期字符串（格式：YYYY-MM-DD）
 * @returns 是否是当月或历史月份
 */
const isCurrentOrPastMonth = (dateStr: string) => {
  const [year, month] = dateStr.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return true;
  if (year === currentYear && month <= currentMonth) return true;
  return false;
};

/**
 * 判断还款日期是否已到
 * @param dateStr - 还款日期（格式：YYYY-MM-DD HH:mm:ss）
 * @returns 还款日期是否已到或已过
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
    // 保存原始状态，并确保 planStatus 是数字类型
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
 * 获取还款状态文本
 * @param status - 状态值：0=待还款, 1=已还款, 2=已逾期
 * @returns 状态文本
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
 * 获取状态颜色
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

// 获取卡片样式类
const getCardClass = (status: number) => {
  return {
    'card-paid': status === 1, // 已还款
    'card-pending': status === 0, // 待还款
    'card-unpaid': status === 2 // 已逾期
  };
};

/**
 * 判断是否可以编辑还款卡号
 * 规则：
 * 1. 已还款(status=1) - 不可编辑
 * 2. 已逾期(status=2) - 可以编辑
 * 3. 待还款(status=0) - 只有还款日期已到的可以编辑
 * @param item - 还款项目
 * @returns 是否可以编辑
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
 * 规则与还款卡号相同，但使用原始状态判断
 * 这样在用户修改状态时，下拉框不会立即消失
 * @param item - 还款项目
 * @returns 是否可以编辑
 */
const canEditStatus = (item: RepaymentItem) => {
  return canEditCardNumber(item);
};

// 校验银行卡号（简化：只校验12-19位数字）
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
 * 调用 updateRepaymentPlan 接口提交还款卡号和还款状态
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
  padding: 20px;
  min-height: 400px;
}

.top-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;

  .el-button {
    min-width: 120px;
  }
}

// 还款卡片
.repayment-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 20px;
}

.repayment-card {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 20px;
  background: #fff;
}

.card-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;

  .period-label {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }
}

.card-body {
  .info-row {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    line-height: 32px;

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
      font-size: 14px;
      color: #303133;
      flex: 1;

      &.amount {
        color: #f56c6c;
        font-weight: 600;
      }

      // 还款状态样式
    }

    .status-select {
      width: 110px;
    }

    .card-number-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }

    .card-number-input {
      flex: 1;
      max-width: 180px;
    }

    .read-card-btn {
      white-space: nowrap;
    }
  }
}

.error-tip {
  font-size: 12px;
  color: #f56c6c;
  margin-top: -8px;
  margin-bottom: 8px;
  padding-left: 85px;
}

.card-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
  text-align: center;

  .el-button {
    width: 100%;
  }
}
</style>
