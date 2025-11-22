<template>
  <el-dialog :model-value="visible" width="1200px" class="repayment-plan-dialog" append-to-body destroy-on-close @close="handleClose">
    <template #header>
      <div class="dialog-title">还款计划</div>
    </template>
    <div v-loading="loading" class="repayment-plan-content">
      <div class="plan-header">
        <div class="tabs">
          <div class="tab-item active">还款计划</div>
          <div class="tab-item">查看还款计划</div>
        </div>
      </div>
      
      <div class="plan-grid">
        <div v-for="(plan, index) in repaymentPlans" :key="index" class="plan-card">
          <div class="plan-info">
            <div class="info-row">
              <span class="label">还款期数：</span>
              <span class="value">{{ plan.period }}期</span>
            </div>
            <div class="info-row">
              <span class="label">还款日期：</span>
              <span class="value">{{ plan.repaymentDate }}</span>
            </div>
            <div class="info-row">
              <span class="label">还款金额：</span>
              <span class="value amount">{{ plan.repaymentAmount }}元</span>
            </div>
            <div class="info-row">
              <span class="label">还款本金：</span>
              <span class="value">{{ plan.principal }}</span>
            </div>
            <div class="info-row">
              <span class="label">还款利息：</span>
              <span class="value">{{ plan.interest }}</span>
            </div>
            <div class="info-row">
              <span class="label">还款状态：</span>
              <span class="value status" :class="getStatusClass(plan.status)">{{ plan.statusText }}</span>
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
  principal: string;
  interest: string;
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
    principal: '291931093390',
    interest: '已还款',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 2,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    principal: '291931093390',
    interest: '已还款',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 3,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    principal: '291931093390',
    interest: '待还款',
    status: 'pending',
    statusText: '待还款'
  },
  {
    period: 4,
    repaymentDate: '2025-1-1',
    repaymentAmount: '92992.2',
    principal: '291931093390',
    interest: '已还款',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 5,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    principal: '291931093390',
    interest: '已还款',
    status: 'paid',
    statusText: '已还款'
  },
  {
    period: 6,
    repaymentDate: '2025-2-1',
    repaymentAmount: '92992.2',
    principal: '291931093390',
    interest: '待还款',
    status: 'pending',
    statusText: '待还款'
  }
];

const repaymentPlans = computed(() => {
  return mockRepaymentPlans;
});

const getStatusClass = (status: string) => {
  return {
    'status-paid': status === 'paid',
    'status-pending': status === 'pending'
  };
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
    color: #303133;
  }
}

.repayment-plan-content {
  padding: 0 8px;
}

.plan-header {
  margin-bottom: 20px;
  
  .tabs {
    display: flex;
    gap: 20px;
    
    .tab-item {
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 4px;
      color: #606266;
      
      &.active {
        background-color: #409eff;
        color: white;
      }
    }
  }
}

.plan-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.plan-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.plan-info {
  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .label {
      color: #606266;
      font-size: 14px;
      flex-shrink: 0;
    }
    
    .value {
      color: #303133;
      font-size: 14px;
      font-weight: 500;
      text-align: right;
      
      &.amount {
        color: #e6a23c;
        font-weight: 600;
      }
      
      &.status {
        &.status-paid {
          color: #67c23a;
        }
        
        &.status-pending {
          color: #f56c6c;
        }
      }
    }
  }
}

.dialog-footer {
  text-align: right;
}

// 响应式设计
@media (max-width: 1024px) {
  .plan-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .plan-grid {
    grid-template-columns: 1fr;
  }
}
</style>
