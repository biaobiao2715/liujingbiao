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
      <el-form-item label="产品名称" prop="productName">
        <el-input v-model="queryParams.productName" placeholder="请输入产品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="适用对象" prop="lenderTyp">
        <el-select v-model="queryParams.lenderTyp" placeholder="全部" clearable>
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
      <el-table-column label="操作" align="center" width="260">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button size="small" type="primary" plain @click="handleComplete(scope.row)">完善信息</el-button>
            <el-button size="small" type="success" plain @click="handleRepayment(scope.row)">还款情况</el-button>
            <el-button size="small" type="info" plain @click="handleDetail(scope.row)">详情</el-button>
            <el-button size="small" type="warning" plain>追踪</el-button>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

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
const { applicable_object } = toRefs<any>(proxy?.useDict('applicable_object'));

const mockData: RepaymentPlan[] = [
  {
    id: 1,
    realName: '张三',
    productName: '农户信贷产品A',
    productType: '1',
    lenderTyp: 'farmer',
    loanAmount: 100000,
    loanTerm: 12,
    approvalTime: '2025-01-01 10:00:00',
    loanStatus: '还款中'
  },
  {
    id: 2,
    realName: '李四',
    productName: '农户信贷产品B',
    productType: '1',
    lenderTyp: 'farmer',
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
    lenderTyp: 'enterprise',
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
  productName: '',
  lenderTyp: ''
});

const tableData = ref<RepaymentPlan[]>([]);
const total = ref(0);
const loading = ref(false);

const applyFilter = () => {
  const { realName, productName, lenderTyp } = queryParams.value;
  let data = [...mockData];
  if (realName) {
    data = data.filter((item) => item.realName.includes(realName));
  }
  if (productName) {
    data = data.filter((item) => item.productName.includes(productName));
  }
  if (lenderTyp) {
    data = data.filter((item) => item.lenderTyp === lenderTyp);
  }
  total.value = data.length;
  // 简单分页
  const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize;
  const end = start + queryParams.value.pageSize;
  tableData.value = data.slice(start, end);
};

const getList = () => {
  loading.value = true;
  setTimeout(() => {
    applyFilter();
    loading.value = false;
  }, 300);
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

const handleComplete = (row: RepaymentPlan) => {
  ElMessage.info(`完善信息：${row.productName}`);
};

const handleRepayment = (row: RepaymentPlan) => {
  ElMessage.info(`查看还款情况：${row.productName}`);
};

const handleDetail = (row: RepaymentPlan) => {
  ElMessage.info(`查看详情：${row.productName}`);
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
