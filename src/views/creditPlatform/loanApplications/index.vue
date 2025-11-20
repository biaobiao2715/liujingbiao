<!--
  标题: creditPlatform/loanApplications/index.vue
  功能: 贷款申请管理（真实接口）
-->
<template>
  <div class="loan-applications">
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="80" class="search-form">
      <el-form-item label="申请人" prop="realName">
        <el-input v-model="queryParams.realName" placeholder="请输入申请人" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="产品类型" prop="productType">
        <el-select v-model="queryParams.productType" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option v-for="dict in prod_credit_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="适用对象" prop="applicableObject">
        <el-select v-model="queryParams.applicableObject" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option v-for="dict in applicable_object" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="申请状态" prop="applyStatus">
        <el-select v-model="queryParams.applyStatus" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option v-for="dict in application_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label-width="0">
        <el-button :loading="loading" type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="申请人" prop="realName" align="center" width="120" />
      <el-table-column label="产品名称" prop="productName" min-width="160" align="center" :show-overflow-tooltip="true" />
      <el-table-column label="产品类型" prop="productType" align="center" width="120">
        <template #default="scope">
          <dict-tag :options="prod_credit_type" :value="scope.row.productType" />
        </template>
      </el-table-column>
      <el-table-column label="适用对象" prop="applicableObject" align="center" width="120">
        <template #default="scope">
          <dict-tag :options="applicable_object" :value="scope.row.applicableObject" />
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createTime" min-width="180" align="center" />
      <el-table-column label="申请状态" prop="applyStatus" align="center" width="140">
        <template #default="scope">
          <dict-tag :options="application_status" :value="scope.row.applyStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="260">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button size="small" type="primary" plain :disabled="!canAudit(scope.row.applyStatus)" @click="handleDetail(scope.row, 'approval')">
              审批
            </el-button>
            <el-button size="small" type="primary" plain @click="handleDetail(scope.row, 'detail')">详情</el-button>
            <el-button size="small" type="success" plain @click="openRepaymentPlan(scope.row)">还款计划</el-button>
            <el-button size="small" type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <el-pagination
        v-show="total > 0"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="[10, 20, 30, 50]"
        :total="total"
        :current-page="queryParams.pageNum"
        :page-size="queryParams.pageSize"
        @size-change="handlePageSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    <LoanApplicationDetailDialog v-model:visible="detailDialogVisible" :data="detailData" :mode="detailDialogMode" />
    <LoanApplicationBuyerDetailDialog v-model:visible="buyerDetailDialogVisible" :data="detailData" />
    <RepaymentPlanDialog v-model:visible="repaymentDialogVisible" :data="repaymentData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import LoanApplicationDetailDialog from './LoanApplicationDetailDialog.vue';
import LoanApplicationBuyerDetailDialog from './LoanApplicationBuyerDetailDialog.vue';
import RepaymentPlanDialog from './RepaymentPlanDialog.vue';
import { getloanApplicationsList } from '@/api/creditPlatform/loanApplications';

interface LoanApplication {
  id: number | string;
  realName: string;
  productName: string;
  productType: string;
  applicableObject: string;
  lenderId?: string | number;
  userId?: string | number;
  applyTime?: string;
  applyStatus?: string;
  loanAmount?: string | number;
  loanTerm?: string | number;
  repaymentType?: string;
  bankName?: string;
  bankCardNo?: string;
  approvalOpinion?: string;
  loanDate?: string;
  firstRepaymentDate?: string;
  contractFiles?: string[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_credit_type, applicable_object, application_status } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'application_status')
);
const pendingStatusValues = computed(() => {
  const dictList = application_status?.value || [];
  const match = dictList.filter((item: any) => {
    const label = (item.label || '').toString();
    return label.includes('待审') || label.includes('待审核');
  });
  if (match.length) {
    return match.map((item: any) => String(item.value));
  }
  // fallback, assume字典值为 '1' 或 '0'
  return ['1', '0'];
});

const queryFormRef = ref();
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  realName: '',
  productType: '',
  applicableObject: '',
  applyStatus: ''
});

const tableData = ref<LoanApplication[]>([]);
const total = ref(0);
const loading = ref(false);
const detailDialogVisible = ref(false);
const buyerDetailDialogVisible = ref(false);
const repaymentDialogVisible = ref(false);
const detailData = ref<LoanApplication | null>(null);
const repaymentData = ref<any>(null);
const detailDialogMode = ref<'detail' | 'approval'>('detail');

const getList = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams.value
    };
    const res = await getloanApplicationsList(params);
    if (res.code === 200) {
      tableData.value = res.rows || res.data || [];
      total.value = res.total || 0;
    } else {
      tableData.value = [];
      total.value = 0;
      ElMessage.error(res.msg || '获取贷款申请列表失败');
    }
  } catch (error) {
    console.error('获取贷款申请列表失败:', error);
    tableData.value = [];
    total.value = 0;
    ElMessage.error('获取贷款申请列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  getList();
};

const handlePageChange = (page: number) => {
  queryParams.value.pageNum = page;
  getList();
};

const handlePageSizeChange = (size: number) => {
  queryParams.value.pageSize = size;
  queryParams.value.pageNum = 1;
  getList();
};

const handleSelectionChange = () => {
  // 预留批量操作
};

const getApplicableLabel = (value: string | number | undefined) => {
  if (value === undefined || value === null) return '';
  const list = applicable_object?.value || [];
  const match = list.find((item: any) => String(item.value) === String(value));
  return match?.label || '';
};

const handleDetail = (row: LoanApplication, mode: 'detail' | 'approval' = 'detail') => {
  detailDialogMode.value = mode;
  detailData.value = row;
  const label = getApplicableLabel(row.applicableObject).toLowerCase();
  const rawValue = String(row.applicableObject || '').toLowerCase();
  const isPersonal = label.includes('采购') || rawValue.includes('purchaser');
  if (isPersonal) {
    buyerDetailDialogVisible.value = true;
  } else {
    detailDialogVisible.value = true;
  }
};

const canAudit = (status: string | number | undefined) => {
  if (status === undefined || status === null) return false;
  return pendingStatusValues.value.includes(String(status));
};

const openRepaymentPlan = (row: LoanApplication) => {
  repaymentData.value = {
    contractFiles: row.contractFiles || [],
    plans: Array.from({ length: 9 }, (_, index) => ({
      period: index + 1,
      repayDate: ['2025-02-01', '2025-03-01', '2025-04-01'][Math.floor(index / 3)],
      amount: 9000
    }))
  };
  repaymentDialogVisible.value = true;
};

const handleDelete = (row: LoanApplication) => {
  ElMessageBox.confirm(`确定删除 ${row.productName} 的申请记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success('删除成功（请接入真实接口）');
    })
    .catch(() => {
      ElMessage.info('已取消删除');
    });
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.loan-applications {
  padding: 24px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-form {
  background: #fff;
  padding: 20px 24px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);

  .el-form-item {
    min-width: 220px;
    margin-bottom: 12px;
  }
}

.operation-buttons {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;

  .el-button {
    margin: 0;
    padding: 4px 8px;
  }
}

.pagination {
  display: flex;
  justify-content: flex-end;
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);
}
</style>
