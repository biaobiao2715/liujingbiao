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
import { ElMessage } from 'element-plus';
import { getRepaymentPlan } from '@/api/creditPlatform/loanApplications';

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
const repaymentPlans = ref<RepaymentPlan[]>([]);

const getStatusType = (status: string) => {
  switch (status) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'overdue':
      return 'danger';
    default:
      return 'info';
  }
};

// 将planStatus转换为组件需要的status
const getStatusFromPlanStatus = (planStatus: number | string) => {
  const status = Number(planStatus);
  switch (status) {
    case 1:
      return 'paid'; // 已还款
    case 2:
      return 'overdue'; // 已逾期
    case 0:
    default:
      return 'pending'; // 待还款
  }
};

// 获取状态文本
const getStatusText = (planStatus: number | string) => {
  const status = Number(planStatus);
  switch (status) {
    case 1:
      return '已还款';
    case 2:
      return '已逾期';
    case 0:
    default:
      return '待还款';
  }
};

const fetchRepaymentPlan = async () => {
  if (!props.data?.id) return;

  loading.value = true;
  try {
    const res = await getRepaymentPlan(props.data.id);
    if (res && Array.isArray(res)) {
      // 将接口返回的数据转换为组件需要的格式
      repaymentPlans.value = res.map((item: any, index: number) => ({
        period: item.loanPeriod || index + 1,
        repaymentDate: item.repaymentDate || '--',
        repaymentAmount: item.totalAmount || '0',
        cardNumber: item.repaymentCardNo || '--',
        status: getStatusFromPlanStatus(item.planStatus),
        statusText: getStatusText(item.planStatus)
      }));
    } else {
      repaymentPlans.value = [];
    }
  } catch (error) {
    console.error('获取还款计划失败:', error);
    ElMessage.error('获取还款计划失败');
    repaymentPlans.value = [];
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
