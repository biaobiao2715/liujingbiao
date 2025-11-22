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
      <!-- 还款卡片列表 -->
      <div class="repayment-cards">
        <div 
          v-for="(item, index) in repaymentList" 
          :key="index"
          class="repayment-card"
          :class="getCardClass(item.status)"
        >
          <div class="card-header">
            <span class="period-label">期数：{{ item.period }}</span>
          </div>
          
          <div class="card-body">
            <div class="info-row">
              <span class="label">还款日期：</span>
              <span class="value">{{ item.repaymentDate }}</span>
            </div>
            
            <div class="info-row">
              <span class="label">还款金额：</span>
              <span class="value amount">{{ item.amount }} 元</span>
            </div>
            
            <div class="info-row">
              <span class="label">还款卡号：</span>
              <el-input 
                v-if="canEditCardNumber(item)"
                v-model="item.cardNumber" 
                placeholder="请输入收款卡号" 
                size="small"
                class="card-number-input"
                maxlength="19"
                show-word-limit
                @input="validateCardNumber(item)"
              />
              <span v-else class="value">{{ item.cardNumber || '--' }}</span>
            </div>
            <div v-if="canEditCardNumber(item) && item.cardNumberError" class="error-tip">
              {{ item.cardNumberError }}
            </div>
            
            <div class="info-row">
              <span class="label">还款状态：</span>
              <el-select 
                v-model="item.status" 
                placeholder="请选择" 
                size="small"
                class="status-select"
              >
                <el-option label="已还款" value="已还款" />
                <el-option label="未还款" value="未还款" />
                <el-option label="待还款" value="待还款" />
              </el-select>
            </div>
          </div>
          
          <div v-if="canEditCardNumber(item) && item.cardNumber && !item.cardNumberError" class="card-footer">
            <el-button type="primary" @click="handleConfirmRepayment(item)">
              确认收款卡号
            </el-button>
          </div>
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
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';

interface RepaymentItem {
  period: number;
  repaymentDate: string;
  amount: number;
  cardNumber?: string;
  cardNumberError?: string;
  status: string;
}

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const loading = ref(false);

// 获取当前年月（格式：2025-1）
const getCurrentYearMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}`;
};

// 判断是否是当月或历史月份
const isCurrentOrPastMonth = (dateStr: string) => {
  const [year, month] = dateStr.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return true;
  if (year === currentYear && month <= currentMonth) return true;
  return false;
};

// 模拟还款数据
const mockRepaymentList: RepaymentItem[] = [
  {
    period: 1,
    repaymentDate: '2025-1-1',
    amount: 9000,
    cardNumber: '555555555555',
    status: '已还款'
  },
  {
    period: 2,
    repaymentDate: '2025-2-1',
    amount: 9000,
    cardNumber: '',
    status: '未还款' // 当月或历史未还款
  },
  {
    period: 3,
    repaymentDate: '2025-3-1',
    amount: 9000,
    cardNumber: '',
    status: '待还款' // 未到还款月
  },
  {
    period: 4,
    repaymentDate: '2025-4-1',
    amount: 9000,
    cardNumber: '',
    status: '待还款' // 未到还款月
  }
];

const repaymentList = ref<RepaymentItem[]>(mockRepaymentList);

// 获取卡片样式类
const getCardClass = (status: string) => {
  return {
    'card-paid': status === '已还款',
    'card-pending': status === '待还款',
    'card-unpaid': status === '未还款'
  };
};

// 判断是否可以编辑还款卡号
// 规则：当月有应还款的和历史有未还款的，可以进行编辑填写
const canEditCardNumber = (item: RepaymentItem) => {
  // 如果是当月或历史月份，且状态为未还款，可以编辑
  if (isCurrentOrPastMonth(item.repaymentDate) && item.status === '未还款') {
    return true;
  }
  return false;
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
  const cardNumber = (item.cardNumber || '').replace(/\s/g, ''); // 去除空格
  
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

// 确认收款卡号
const handleConfirmRepayment = (item: RepaymentItem) => {
  if (!item.cardNumber) {
    ElMessage.warning('请先填写收款卡号');
    return;
  }
  
  if (item.cardNumberError) {
    ElMessage.warning('请输入正确的收款卡号');
    return;
  }
  
  ElMessage.success('收款卡号已确认');
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
    }
    
    .status-select {
      width: 110px;
    }
    
    .card-number-input {
      flex: 1;
      max-width: 180px;
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

// 弹窗底部
.dialog-footer {
  text-align: right;
}
</style>
