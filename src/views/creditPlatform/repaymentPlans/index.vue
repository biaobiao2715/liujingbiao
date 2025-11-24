<!--
  标题: creditPlatform/loanApplications/index.vue
  功能: 贷款申请管理（接口数据）
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
      <el-form-item label-width="0">
        <el-button :loading="loading" type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="申请人" prop="realName" align="center" width="120" />
      <el-table-column label="产品名称" prop="productName" min-width="160" align="center" :show-overflow-tooltip="true" />
      <el-table-column label="产品类型" prop="productType" align="center" width="120" />
      <el-table-column label="适用对象" prop="lenderTyp" align="center" width="120">
        <template #default="scope">
          <dict-tag :options="applicable_object" :value="scope.row.lenderTyp" />
        </template>
      </el-table-column>
      <el-table-column label="贷款金额(元)" prop="loanAmount" align="center" width="140" />
      <el-table-column label="贷款期限" prop="loanTerm" align="center" width="100" />
      <el-table-column label="贷款审批通过时间" prop="approvalTime" min-width="180" align="center" />
      <el-table-column label="贷款状态" prop="loanStatus" align="center" width="120" />
      <el-table-column label="操作" align="center" width="340" fixed="right">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button size="small" type="primary" plain @click="handleComplete(scope.row)">完结借贷</el-button>
            <el-button size="small" type="primary" plain @click="handleDetail(scope.row)">详情</el-button>
            <el-button size="small" type="success" plain @click="handleRepayment(scope.row)">还款情况</el-button>
            <el-button size="small" type="warning" plain @click="handleTracking(scope.row)">追踪</el-button>
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
    <RepaymentDetailDialog v-model:visible="detailDialogVisible" :data="detailData" />
    <RepaymentBuyerDetailDialog v-model:visible="buyerDetailDialogVisible" :data="detailData" />
    <LoanTrackingDialog v-model:visible="trackingDialogVisible" :data="detailData" />
    <RepaymentStatusDialog v-model:visible="repaymentStatusDialogVisible" :data="detailData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getloanApplicationsList } from '@/api/creditPlatform/repaymentPlans';
import RepaymentDetailDialog from './RepaymentDetailDialog.vue';
import RepaymentBuyerDetailDialog from './RepaymentBuyerDetailDialog.vue';
import LoanTrackingDialog from './LoanTrackingDialog.vue';
import RepaymentStatusDialog from './RepaymentStatusDialog.vue';

interface RepaymentPlan {
  id: number | string;
  realName: string;
  productName: string;
  productType?: string;
  lenderTyp: string;
  loanAmount?: string | number;
  loanTerm?: string | number;
  approvalTime?: string;
  loanStatus?: string;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { applicable_object, prod_credit_type } = toRefs<any>(proxy?.useDict('applicable_object', 'prod_credit_type'));

const mockData: RepaymentPlan[] = [
  {
    id: 1,
    realName: '张三',
    productName: '农户信贷产品A',
    productType: '1',
    lenderTyp: '1', // 对应个人/农户
    loanAmount: 100000,
    loanTerm: 12,
    approvalTime: '2025-01-01 10:00:00',
    loanStatus: '还款中'
  },
  {
    id: 2,
    realName: '李四',
    productName: '采购商信贷产品B',
    productType: '1',
    lenderTyp: '0', // 对应采购商
    loanAmount: 50000,
    loanTerm: 6,
    approvalTime: '2025-01-10 09:30:00',
    loanStatus: '已结清'
  },
  {
    id: 3,
    realName: '测试种子公司',
    productName: '企业信贷产品C',
    productType: '2',
    lenderTyp: '2', // 对应企业
    loanAmount: 300000,
    loanTerm: 24,
    approvalTime: '2025-02-05 15:20:00',
    loanStatus: '逾期'
  }
];

const queryFormRef = ref();
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  realName: '',
  productType: '',
  applicableObject: ''
});

const tableData = ref<RepaymentPlan[]>([]);
const total = ref(0);
const loading = ref(false);
const detailDialogVisible = ref(false);
const buyerDetailDialogVisible = ref(false);
const trackingDialogVisible = ref(false);
const repaymentStatusDialogVisible = ref(false);
const detailData = ref<RepaymentPlan | null>(null);

const getList = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams.value
    };
    const res = await getloanApplicationsList(params);
    if (res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
    } else {
      ElMessage.error(res.msg || '获取列表失败');
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取列表失败:', error);
    ElMessage.error('获取列表失败');
    tableData.value = [];
    total.value = 0;
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

const handleRepayment = (row: RepaymentPlan) => {
  detailData.value = row;
  repaymentStatusDialogVisible.value = true;
};

const getApplicableLabel = (value: string | number | undefined) => {
  if (value === undefined || value === null) return '';
  const list = applicable_object?.value || [];
  const match = list.find((item: any) => String(item.value) === String(value));
  return match?.label || '';
};

const handleDetail = (row: RepaymentPlan) => {
  detailData.value = row;
  const applicableValue = row.lenderTyp;
  const label = getApplicableLabel(applicableValue).toLowerCase();
  const rawValue = String(applicableValue || '').toLowerCase();

  // 判断是否为个人类型（采购商、农户等）
  const isPersonal =
    label.includes('采购') ||
    label.includes('农户') ||
    rawValue.includes('purchaser') ||
    rawValue.includes('farmer') ||
    applicableValue === '0' ||
    applicableValue === '1'; // 0=采购商, 1=农户

  // 先隐藏另一个弹窗，避免同时打开
  detailDialogVisible.value = false;
  buyerDetailDialogVisible.value = false;

  if (isPersonal) {
    buyerDetailDialogVisible.value = true;
  } else {
    detailDialogVisible.value = true;
  }
};

const handleTracking = (row: RepaymentPlan) => {
  detailData.value = row;
  trackingDialogVisible.value = true;
};

const handleComplete = (row: RepaymentPlan) => {
  // TODO: 调用API完结借贷
  ElMessage.success('借贷已完结（演示）');
};

const handleDelete = (row: RepaymentPlan) => {
  ElMessageBox.confirm(`确定删除 ${row.productName} 的还款记录吗？（演示数据）`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success('删除成功（演示）');
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
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .el-button {
    margin: 0;
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
