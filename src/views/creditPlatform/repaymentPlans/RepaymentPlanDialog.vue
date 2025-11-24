<template>
  <el-dialog 
    :model-value="visible" 
    width="1300px" 
    class="repayment-plan-dialog" 
    append-to-body 
    destroy-on-close
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <template #header>
      <div class="dialog-title">还款计划</div>
    </template>

    <div v-loading="loading" class="dialog-content">
      <div class="plan-grid">
        <div v-for="(plan, index) in repaymentPlans" :key="index" class="plan-card">
          <div class="card-content">
            <div class="form-row">
              <span class="label">还款期数：</span>
              <span class="value">{{ plan.period }}期</span>
            </div>
            <div class="form-row">
              <span class="label">还款日期：</span>
              <span class="value">{{ plan.repaymentDate }}</span>
            </div>
            <div class="form-row">
              <span class="label">还款金额：</span>
              <span class="value amount">{{ plan.repaymentAmount }} 元</span>
            </div>
            <div class="form-row">
              <span class="label">还款卡号：</span>
              <span class="value">{{ plan.cardNumber || '--' }}</span>
            </div>
            <div class="form-row">
              <span class="label">还款状态：</span>
              <el-tag :type="getStatusType(plan.status)" size="small">{{ plan.statusText }}</el-tag>
            </div>
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
import { computed, ref, watch } from 'vue';

interface RepaymentPlan {
  period: number;
  repaymentDate: string;
  repaymentAmount: string;
  cardNumber?: string;
  status: string;
  statusText: string;
}

const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();

const emit = defineEmits<{
  (event: 'update:visible', payload: boolean): void;
}>();

const loading = ref(false);

// 模拟还款计划数据
const mockRepaymentPlans: RepaymentPlan[] = [
  {
    period: 1,
    repaymentDate: '2025-1-1',
    repaymentAmount: '92992.2',
    cardNumber: '291931093390',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 2,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    cardNumber: '291931093390',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 3,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    cardNumber: '291931093390',
    status: 'pending',
    statusText: '待还款'
  },
  {
    period: 4,
    repaymentDate: '2025-1-1',
    repaymentAmount: '92992.2',
    cardNumber: '291931093390',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 5,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    cardNumber: '291931093390',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 6,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    cardNumber: '291931093390',
    status: 'pending',
    statusText: '待还款'
  }
];

const repaymentPlans = computed(() => {
  return mockRepaymentPlans;
});

const getStatusType = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    default:
      return 'info';
  }
};

const fetchRepaymentPlan = async () => {
  if (!props.data?.id) return;
  
  loading.value = true;
  try {
    // 这里应该调用真实的API获取还款计划
    // const res = await getRepaymentPlan(props.data.id);
    // repaymentPlans.value = res.data;
  } catch (error) {
    console.error('获取还款计划失败:', error);
  } finally {
    loading.value = false;
  }
};

watch([() => props.visible, () => props.data?.id], ([visible, id], [prevVisible, prevId]) => {
  if (visible && (!prevVisible || id !== prevId)) {
    fetchRepaymentPlan();
  }
});

const handleClose = () => {
  emit('update:visible', false);
};
</script>

<style scoped lang="scss">
.repayment-plan-dialog {
  .dialog-title {
    font-size: 18px;
    font-weight: 600;
  }
}

.dialog-content {
  padding: 0;
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
  background: #fff;
  width: calc(33.333% - 11px);
  min-width: 280px;
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
    
    &.amount {
      color: #e6a23c;
      font-weight: 600;
    }
  }
}

.dialog-footer {
  text-align: right;
}

// 响应式设计
@media (max-width: 1200px) {
  .plan-card {
    width: calc(50% - 8px);
  }
}

@media (max-width: 768px) {
  .plan-card {
    width: 100%;
  }
}
</style>
