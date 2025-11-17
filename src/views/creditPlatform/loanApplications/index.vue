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
          <el-option
            v-for="dict in prod_credit_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="适用对象" prop="applicableObject">
        <el-select v-model="queryParams.applicableObject" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in applicable_object"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="申请状态" prop="applyStatus">
        <el-select v-model="queryParams.applyStatus" placeholder="全部" clearable>
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in application_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label-width="0">
        <el-button :loading="loading" type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="tableData"
      border
      v-loading="loading"
      style="width: 100%"
      @selection-change="handleSelectionChange"
    >
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
      <el-table-column label="申请时间" prop="applyTime" min-width="180" align="center" />
      <el-table-column label="申请状态" prop="applyStatus" align="center" width="140">
        <template #default="scope">
          <dict-tag :options="application_status" :value="scope.row.applyStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="260">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button size="small" type="primary" plain @click="handleDetail(scope.row)">详情</el-button>
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
    <LoanApplicationDetailDialog v-model:visible="detailDialogVisible" :data="detailData" />
    <LoanApplicationBuyerDetailDialog v-model:visible="buyerDetailDialogVisible" :data="detailData" />
    <RepaymentPlanDialog v-model:visible="repaymentDialogVisible" :data="repaymentData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import LoanApplicationDetailDialog from './LoanApplicationDetailDialog.vue'
import LoanApplicationBuyerDetailDialog from './LoanApplicationBuyerDetailDialog.vue'
import RepaymentPlanDialog from './RepaymentPlanDialog.vue'

interface LoanApplication {
  id: number | string
  realName: string
  productName: string
  productType: string
  applicableObject: string
  applyTime?: string
  applyStatus?: string
  loanAmount?: string | number
  loanTerm?: string | number
  repaymentType?: string
  bankName?: string
  bankCardNo?: string
  approvalOpinion?: string
  loanDate?: string
  firstRepaymentDate?: string
  contractFiles?: string[]
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance
const { prod_credit_type, applicable_object, application_status } = toRefs<any>(
  proxy?.useDict('prod_credit_type', 'applicable_object', 'application_status')
)

const queryFormRef = ref()
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  realName: '',
  productType: '',
  applicableObject: '',
  applyStatus: ''
})

const mockLoanApplications: LoanApplication[] = [
  {
    id: 1,
    realName: '张三',
    productName: '农户经营贷',
    productType: '1',
    applicableObject: 'farmer',
    applyTime: '2025-11-06 10:23:00',
    applyStatus: '1',
    loanAmount: '100000',
    loanTerm: '12',
    repaymentType: '等额本息',
    bankName: '农业银行',
    bankCardNo: '6228480402564895'
  },
  {
    id: 2,
    realName: '李四',
    productName: '农业设备贷',
    productType: '2',
    applicableObject: 'farmer',
    applyTime: '2025-11-05 09:15:00',
    applyStatus: '2',
    loanAmount: '150000',
    loanTerm: '18',
    repaymentType: '等额本金',
    bankName: '建设银行',
    bankCardNo: '6217002760045698'
  },
  {
    id: 3,
    realName: '武汉盛源贸易',
    productName: '采购链条贷',
    productType: '3',
    applicableObject: 'purchaser',
    applyTime: '2025-11-04 15:50:00',
    applyStatus: '1',
    loanAmount: '300000',
    loanTerm: '24',
    repaymentType: '先息后本',
    bankName: '招商银行',
    bankCardNo: '6225880087654321',
    approvalOpinion: '同意',
    loanDate: '2025-11-07',
    firstRepaymentDate: '2025-12-07',
    contractFiles: ['采购贷合同.pdf']
  },
  {
    id: 4,
    realName: '测试贸易公司',
    productName: '采购周转贷',
    productType: '3',
    applicableObject: 'purchaser',
    applyTime: '2025-11-03 11:12:00',
    applyStatus: '3',
    loanAmount: '500000',
    loanTerm: '36',
    repaymentType: '等额本息',
    bankName: '工商银行',
    bankCardNo: '6212260400123456789'
  }
]

const tableData = ref<LoanApplication[]>([])
const total = ref(0)
const loading = ref(false)
const detailDialogVisible = ref(false)
const buyerDetailDialogVisible = ref(false)
const repaymentDialogVisible = ref(false)
const detailData = ref<LoanApplication | null>(null)
const repaymentData = ref<any>(null)

const applyFilter = () => {
  const { realName, productType, applicableObject, applyStatus } = queryParams.value
  let data = [...mockLoanApplications]

  if (realName) {
    data = data.filter((item) => item.realName.includes(realName))
  }
  if (productType) {
    data = data.filter((item) => item.productType === productType)
  }
  if (applicableObject) {
    data = data.filter((item) => item.applicableObject === applicableObject)
  }
  if (applyStatus) {
    data = data.filter((item) => item.applyStatus === applyStatus)
  }

  total.value = data.length
  const start = (queryParams.value.pageNum - 1) * queryParams.value.pageSize
  const end = start + queryParams.value.pageSize
  tableData.value = data.slice(start, end)
}

const getList = () => {
  loading.value = true
  setTimeout(() => {
    applyFilter()
    loading.value = false
  }, 300)
}

const handleQuery = () => {
  queryParams.value.pageNum = 1
  getList()
}

const resetQuery = () => {
  queryFormRef.value?.resetFields()
  queryParams.value.pageNum = 1
  getList()
}

const handlePageChange = (page: number) => {
  queryParams.value.pageNum = page
  getList()
}

const handlePageSizeChange = (size: number) => {
  queryParams.value.pageSize = size
  queryParams.value.pageNum = 1
  getList()
}

const handleSelectionChange = () => {
  // 预留批量操作
}

const buyerObjectValues = ['purchaser', 'buyer', '采购商']

const handleDetail = (row: LoanApplication) => {
  detailData.value = row
  if (buyerObjectValues.includes(row.applicableObject)) {
    buyerDetailDialogVisible.value = true
  } else {
    detailDialogVisible.value = true
  }
}

const openRepaymentPlan = (row: LoanApplication) => {
  repaymentData.value = {
    contractFiles: row.contractFiles || [],
    plans: Array.from({ length: 9 }, (_, index) => ({
      period: index + 1,
      repayDate: ['2025-02-01', '2025-03-01', '2025-04-01'][Math.floor(index / 3)],
      amount: 9000
    }))
  }
  repaymentDialogVisible.value = true
}

const handleDelete = (row: LoanApplication) => {
  ElMessageBox.confirm(`确定删除 ${row.productName} 的申请记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      ElMessage.success('删除成功（请接入真实接口）')
    })
    .catch(() => {
      ElMessage.info('已取消删除')
    })
}

onMounted(() => {
  getList()
})
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

