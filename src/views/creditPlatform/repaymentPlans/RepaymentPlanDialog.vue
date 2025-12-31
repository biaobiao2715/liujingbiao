<!--
  标题: creditPlatform/repaymentPlans/RepaymentPlanDialog.vue
  功能: 还款计划
  说明: 还款计划
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->
<template>
  <el-dialog
    :model-value="visible"
    width="50%"
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
              <span class="label">还款期数</span>
              <span class="value">{{ plan.period }}期</span>
            </div>
            <div class="form-row">
              <span class="label">还款日期</span>
              <span class="value">{{ plan.repaymentDate }}</span>
            </div>
            <div class="form-row">
              <span class="label">还款金额</span>
              <span class="value">{{ plan.repaymentAmount }} 元</span>
            </div>
            <div class="form-row">
              <span class="label">还款卡号</span>
              <span class="value">{{ plan.cardNumber || '--' }}</span>
            </div>
            <div class="form-row">
              <span class="label">还款状态</span>
              <span class="status-text" :style="{ color: getStatusColor(plan.status) }">
                {{ plan.statusText }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button class="primary-close-btn" @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'paid':
      return '#108C58'; // 已还款
    case 'overdue':
      return '#FF0000'; // 已逾期
    case 'pending':
    default:
      return '#FF7B00'; // 待还款
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
  background: url('@/assets/images/huankuanPlanBg.png') no-repeat right center;
  background-size: cover;
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
    text-align: right;
  }
}

.dialog-footer {
  text-align: right;
}

.status-text {
  font-weight: 600;
  flex: 1;
  text-align: right;
}

.primary-close-btn {
  background-color: #108c58;
  color: #fff;
  border-color: #108c58;

  &:hover,
  &:focus {
    background-color: #0d7348;
    border-color: #0d7348;
    color: #fff;
  }
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
