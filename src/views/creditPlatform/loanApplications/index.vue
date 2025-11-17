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
            <el-button size="small" type="success" plain @click="handleRepayment(scope.row)">还款计划</el-button>
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
import { ref, onMounted, getCurrentInstance, toRefs } from 'vue'
import type { ComponentInternalInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getloanApplicationsList } from '@/api/creditPlatform/loanApplications'

interface LoanApplication {
  id: number | string
  realName: string
  productName: string
  productType: string
  applicableObject: string
  applyTime?: string
  applyStatus?: string
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

const tableData = ref<LoanApplication[]>([])
const total = ref(0)
const loading = ref(false)

const getList = async () => {
  loading.value = true
  try {
    const response = await getloanApplicationsList(queryParams.value)
    if (response?.code === 200) {
      tableData.value = response.rows || response.data || []
      total.value = response.total || 0
    } else {
      ElMessage.error(response?.msg || '获取贷款申请列表失败')
    }
  } catch (error) {
    console.error('获取贷款申请列表失败:', error)
    ElMessage.error('获取贷款申请列表失败，请稍后重试')
  } finally {
    loading.value = false
  }
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

const handleDetail = (row: LoanApplication) => {
  ElMessage.info(`查看详情：${row.productName}`)
}

const handleRepayment = (row: LoanApplication) => {
  ElMessage.info(`查看还款计划：${row.productName}`)
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

