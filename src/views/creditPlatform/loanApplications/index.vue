<!--
  标题: creditPlatform/loanApplications/index.vue
  功能: 信贷申请列表
  说明: 展示信贷申请列表
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->
<template>
  <div class="loan-applications">
    <el-form ref="queryFormRef" :model="queryParams" inline class="search-form">
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

    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="申请人" prop="realName" align="center" width="120" class-name="nowrap-column" :show-overflow-tooltip="true" />
      <el-table-column label="产品名称" prop="productName" min-width="180" align="center" :show-overflow-tooltip="true" />
      <el-table-column label="产品类型" prop="productType" align="center" width="120" class-name="tag-column-nowrap" :show-overflow-tooltip="true">
        <template #default="scope">
          <div class="tag-wrapper">
            <dict-tag :options="prod_credit_type" :value="formatDictValue(scope.row.productType)" />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="适用对象" prop="applicableObject" min-width="180" class-name="tag-column-nowrap" :show-overflow-tooltip="true">
        <template #default="scope">
          <div class="tag-wrapper">
            <dict-tag
              :options="applicable_object"
              :value="
                formatDictValue(typeof scope.row.applicableObject === 'string' ? scope.row.applicableObject.split(',') : scope.row.applicableObject)
              "
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" prop="createTime" min-width="180" align="center" />
      <el-table-column label="申请状态" prop="applyStatus" align="center" width="140">
        <template #default="scope">
          <span :style="{ color: getStatusColor(scope.row.applyStatus) }" class="status-text">
            <span class="status-dot" :style="{ backgroundColor: getStatusColor(scope.row.applyStatus) }"></span>
            {{ getStatusLabel(scope.row.applyStatus) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="260" fixed="right">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button
              size="small"
              type="primary"
              text
              style="color: #108c58; font-size: 14px"
              :disabled="!canAudit(scope.row.applyStatus)"
              @click="handleDetail(scope.row, 'approval')"
            >
              审批
            </el-button>
            <el-button size="small" type="primary" text style="color: #108c58; font-size: 14px" @click="handleDetail(scope.row, 'detail')"
              >详情</el-button
            >
            <el-button
              size="small"
              type="success"
              text
              style="color: #108c58; font-size: 14px"
              :disabled="!isApproved(scope.row.applyStatus)"
              @click="openRepaymentPlan(scope.row)"
              >还款计划</el-button
            >
            <el-button size="small" type="danger" text style="color: #108c58; font-size: 14px" @click="handleDelete(scope.row)">删除</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination">
      <pagination
        v-show="total > 0"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:page="handlePageChange"
        @update:limit="handlePageSizeChange"
        @pagination="getList"
      />
    </div>
    <LoanApplicationDetailDialog v-model:visible="detailDialogVisible" :data="detailData" :mode="detailDialogMode" @refresh="getList" />
    <LoanApplicationBuyerDetailDialog v-model:visible="buyerDetailDialogVisible" :data="detailData" :mode="detailDialogMode" @refresh="getList" />
    <RepaymentPlanDialog v-model:visible="repaymentDialogVisible" :data="repaymentData" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, getCurrentInstance, toRefs, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import LoanApplicationDetailDialog from './LoanApplicationDetailDialog.vue';
import LoanApplicationBuyerDetailDialog from './LoanApplicationBuyerDetailDialog.vue';
import RepaymentPlanDialog from './RepaymentPlanDialog.vue';
import { getloanApplicationsList, deleteLoanApplication } from '@/api/creditPlatform/loanApplications';

interface LoanApplication {
  id: number | string;
  realName: string;
  productName: string;
  productType: string;
  applicableObject?: string;
  lenderTyp?: string;
  lenderType?: string;
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

/**
 * 格式化字典值，去除重复项
 */
const formatDictValue = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  if (Array.isArray(value)) {
    // 数组去重
    const uniqueValues = Array.from(new Set(value.map((item) => String(item).trim()).filter((item) => item !== '')));
    return uniqueValues.length > 0 ? uniqueValues : undefined;
  }
  if (typeof value === 'string') {
    // 字符串分割后去重
    const arr = value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
    const uniqueValues = Array.from(new Set(arr));
    return uniqueValues.length > 0 ? uniqueValues : undefined;
  }
  // 单个值直接返回
  return [String(value)];
};

/**
 * 获取字典标签文本（用于 tooltip）
 */
const getDictLabels = (options: any[], values: string[] | undefined): string => {
  if (!values || !Array.isArray(values) || values.length === 0) return '';
  if (!options || !Array.isArray(options)) return '';

  const labels: string[] = [];
  const uniqueValues = Array.from(new Set(values.map((v) => String(v).trim())));

  uniqueValues.forEach((val) => {
    const option = options.find((opt: any) => String(opt.value) === val);
    if (option && option.label) {
      labels.push(option.label);
    }
  });

  return labels.join('、');
};

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
    }
  } catch (error) {
    console.error('获取贷款申请列表失败:', error);
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

const handleDetail = (row: LoanApplication, mode: 'detail' | 'approval' = 'detail') => {
  detailData.value = row;
  detailDialogMode.value = mode;

  // 根据 lenderType 判断：0=采购商(个人)，1=企业，2=供应商(企业)
  const lenderType = row.lenderType ?? row.lenderTyp;
  const isPersonal = String(lenderType) === '0';

  // 先隐藏另一个弹窗，避免同时打开
  detailDialogVisible.value = false;
  buyerDetailDialogVisible.value = false;

  if (isPersonal) {
    // 采购商 - 个人
    buyerDetailDialogVisible.value = true;
  } else {
    // 企业或供应商 - 企业
    detailDialogVisible.value = true;
  }
};

/**
 * 获取状态标签文本
 */
const getStatusLabel = (status: string | number | undefined): string => {
  if (status === undefined || status === null) return '';
  const dictList = application_status?.value || [];
  const match = dictList.find((item: any) => String(item.value) === String(status));
  return match ? match.label : '';
};

/**
 * 根据状态标签获取对应的颜色
 */
const getStatusColor = (status: string | number | undefined): string => {
  const label = getStatusLabel(status);
  if (label.includes('驳回') || label.includes('退回')) {
    return '#F23255';
  } else if (label.includes('通过')) {
    return '#108C58';
  } else if (label.includes('待审核')) {
    return '#FF7B00';
  } else if (label.includes('取消')) {
    return '#BBBDBF';
  }
  return '';
};

const canAudit = (status: string | number | undefined) => {
  if (status === undefined || status === null) return false;
  return pendingStatusValues.value.includes(String(status));
};

// 判断是否审核通过
const isApproved = (status: string | number | undefined) => {
  if (status === undefined || status === null) return false;
  const dictList = application_status?.value || [];
  const match = dictList.find((item: any) => String(item.value) === String(status));
  if (!match) return false;
  const label = (match.label || '').toString();
  // 判断是否为审核通过状态（包含"通过"、"已通过"等）
  return label.includes('通过') || label.includes('已审核');
};

const openRepaymentPlan = (row: LoanApplication) => {
  // 传递id给弹窗，弹窗内部会调用接口获取数据
  repaymentData.value = {
    id: row.id
  };
  repaymentDialogVisible.value = true;
};

const handleDelete = (row: LoanApplication) => {
  ElMessageBox.confirm(`确定删除 ${row.productName} 的申请记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        loading.value = true;
        const res = await deleteLoanApplication(row.id);
        if (res.code === 200) {
          ElMessage.success('删除成功');
          getList();
        } else {
        }
      } catch (error) {
        console.error('删除失败:', error);
      } finally {
        loading.value = false;
      }
    })
    .catch(() => {});
};

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.loan-applications {
  min-height: calc(100vh - 120px);
  padding: 24px;
}

.search-form {
  margin-bottom: 16px;

  .el-form-item {
    min-width: 220px;
    margin-bottom: 12px;
  }
}

.operation-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;

  .el-button {
    margin: 0;
    flex-shrink: 0;
    padding: 5px 10px;
    font-size: 14px;

    &:disabled {
      color: #c0c4cc !important;
    }
  }
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

.status-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  vertical-align: middle;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
  vertical-align: middle;
}

:deep(.nowrap-column .cell) {
  white-space: nowrap;
}

:deep(.tag-column-nowrap .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  .tag-wrapper {
    display: inline-block;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
    cursor: pointer;

    > div {
      display: inline-flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 4px;
      white-space: nowrap;
      overflow: hidden;
      max-width: 100%;

      :deep(.el-tag) {
        flex-shrink: 0;
        margin: 0;
        white-space: nowrap;
      }

      :deep(.el-tag + .el-tag) {
        margin-left: 4px;
      }

      :deep(span) {
        white-space: nowrap;
      }
    }
  }
}

:deep(.el-table) {
  .el-table__header {
    background-color: #fafafa;

    th {
      background-color: #fafafa !important;
      color: #606266;
      font-weight: 600;
    }
  }

  .el-table__body {
    tr {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}
</style>
