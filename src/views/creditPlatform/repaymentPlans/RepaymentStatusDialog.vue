<template>
  <el-dialog 
    :model-value="visible" 
    width="900px" 
    class="repayment-status-dialog" 
    append-to-body 
    destroy-on-close 
    @close="handleClose"
  >
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
        <div 
          v-for="(item, index) in repaymentList" 
          :key="index"
          class="repayment-card"
          :class="getCardClass(item.planStatus)"
        >
          <div class="card-header">
            <span class="period-label">期数：{{ item.loanPeriod }}</span>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">还款日期：</span>
              <span class="value">{{ item.repaymentDate }}</span>
            </div>
            
            <div class="info-row">
              <span class="label">还款金额：</span>
              <span class="value amount">{{ item.principalAmount }} 元</span>
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
                <el-button 
                  type="primary" 
                  size="small"
                  @click="handleReadCardNumber(item)"
                  class="read-card-btn"
                >
                  读取收款卡号
                </el-button>
              </div>
              <span v-else class="value">{{ item.repaymentCardNo || '--' }}</span>
            </div>
            <div v-if="canEditCardNumber(item) && item.cardNumberError" class="error-tip">
              {{ item.cardNumberError }}
            </div>
            
            <div class="info-row">
              <span class="label">还款状态：</span>
              <el-select 
                v-if="canEditStatus(item)"
                v-model="item.planStatus" 
                placeholder="请选择" 
                size="small"
                class="status-select"
              >
                <el-option label="待还款" :value="0" />
                <el-option label="已还款" :value="1" />
                <el-option label="已逾期" :value="2" />
              </el-select>
              <span v-else class="value" :class="getStatusClass(item.planStatus)">{{ getStatusText(item.planStatus) }}</span>
            </div>
          </div>
          
          <div v-if="canEditCardNumber(item) && item.repaymentCardNo && !item.cardNumberError" class="card-footer">
            <el-button type="primary" @click="handleConfirmRepayment(item)">
              确认收款卡号
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { getRepaymentPlan } from '@/api/creditPlatform/loanApplications';

interface RepaymentItem {
  loanPeriod: number;        // 期数
  repaymentDate: string;     // 还款日期
  principalAmount: number;   // 还款金额
  repaymentCardNo?: string;  // 还款卡号
  cardNumberError?: string;  // 卡号错误信息
  planStatus: number;        // 还款状态：0=待还款, 1=已还款, 2=已逾期
  originalStatus?: number;   // 原始状态（用于判断是否可编辑）
}

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
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
      planStatus: Number(item.planStatus),
      originalStatus: Number(item.planStatus)
    }));
  } catch (error) {
    console.error('获取还款计划失败:', error);
    ElMessage.error('获取还款计划失败');
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
 * 获取状态样式类
 * @param status - 状态值
 * @returns 样式类名
 */
const getStatusClass = (status: number | undefined) => {
  const classMap: Record<number, string> = {
    0: 'status-pending',  // 待还款
    1: 'status-paid',     // 已还款
    2: 'status-overdue'   // 已逾期
  };
  return status !== undefined ? classMap[status] || '' : '';
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

// Luhn算法校验银行卡号
const luhnCheck = (cardNumber: string): boolean => {
  if (!/^\d+$/.test(cardNumber)) {
    return false;
  }
  
  let sum = 0;
  let isEven = false;
  
  // 从右往左遍历
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i), 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// 校验银行卡号
const validateCardNumber = (item: RepaymentItem) => {
  const cardNumber = (item.repaymentCardNo || '').replace(/\s/g, ''); // 去除空格
  
  // 清空之前的错误
  item.cardNumberError = '';
  
  if (!cardNumber) {
    return;
  }
  
  // 只允许数字
  if (!/^\d+$/.test(cardNumber)) {
    item.cardNumberError = '请输入正确的卡号';
    return;
  }
  
  // 长度校验（银行卡号一般为16-19位）
  if (cardNumber.length < 16 || cardNumber.length > 19) {
    item.cardNumberError = '请输入正确的卡号';
    return;
  }
  
  // Luhn算法校验
  if (!luhnCheck(cardNumber)) {
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

// 确认收款卡号
const handleConfirmRepayment = (item: RepaymentItem) => {
  if (!item.repaymentCardNo) {
    ElMessage.warning('请先填写收款卡号');
    return;
  }
  
  if (item.cardNumberError) {
    ElMessage.warning('请输入正确的收款卡号');
    return;
  }
  
  ElMessage.success('收款卡号已确认');
};

// 提交修改信息
const handleSubmit = () => {
  // 验证是否有未填写的必填项
  const hasError = repaymentList.value.some(item => {
    if (canEditCardNumber(item) && !item.repaymentCardNo) {
      return true;
    }
    if (item.cardNumberError) {
      return true;
    }
    return false;
  });
  
  if (hasError) {
    ElMessage.warning('请完善还款信息后再提交');
    return;
  }
  
  // TODO: 调用API提交数据
  ElMessage.success('提交成功');
  emit('update:visible', false);
};

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.repayment-status-dialog {
  .dialog-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }
}

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
      &.status-pending {
        color: #e6a23c;
        font-weight: 600;
      }
      
      &.status-paid {
        color: #67c23a;
        font-weight: 600;
      }
      
      &.status-overdue {
        color: #f56c6c;
        font-weight: 600;
      }
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
