<!--
  标题: creditPlatform/repaymentPlans/index.vue
  功能: 显示已审批通过的贷款申请，管理还款情况、追踪和完结
  说明: 展示贷后管理列表
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
-->
<template>
  <div class="loan-applications">
    <el-form ref="queryFormRef" :model="queryParams" inline class="search-form">
      <el-form-item label="申请人" prop="realName" aline="left">
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

    <el-table :data="tableData" v-loading="loading">
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="申请人" prop="realName" align="center" width="120" />
      <el-table-column label="产品名称" prop="productName" min-width="160" align="center" :show-overflow-tooltip="true" />
      <el-table-column label="产品类型" prop="productType" align="center" width="120">
        <template #default="scope">
          <dict-tag :options="prod_credit_type" :value="scope.row.productType" />
        </template>
      </el-table-column>
      <el-table-column label="适用对象" prop="applicableObject" min-width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-tag
            :options="applicable_object"
            :value="typeof scope.row.applicableObject === 'string' ? scope.row.applicableObject.split(',') : scope.row.applicableObject"
          />
        </template>
      </el-table-column>
      <el-table-column label="贷款金额(万元)" prop="loanAmount" align="center" width="140" />
      <el-table-column label="贷款期限" prop="loanTerm" align="center" width="100" />
      <el-table-column label="贷款审批通过时间" prop="reviewedAt" min-width="180" align="center" />
      <el-table-column label="还款状态" prop="planStatus" align="center" width="140">
        <template #default="scope">
          <span class="status-text" :style="{ color: getPlanStatusColor(scope.row.planStatus) }">
            <span class="status-dot" :style="{ backgroundColor: getPlanStatusColor(scope.row.planStatus) }"></span>
            {{ getPlanStatusLabel(scope.row.planStatus) }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="340" fixed="right" class-name="op-col">
        <template #default="scope">
          <div class="operation-buttons">
            <!-- 根据当前期次状态显示不同的提示按钮 -->
            <el-button
              v-if="scope.row.planStatus === '2'"
              size="small"
              text
              style="color: #108c58; font-size: 14px"
              @click="handleNotification(scope.row, 'completed')"
            >
              完结通知
            </el-button>
            <el-button
              v-if="scope.row.planStatus !== '2' && scope.row.currentPeriodStatus === '0'"
              style="color: #108c58; font-size: 14px"
              size="small"
              text
              @click="handleNotification(scope.row, 'pending')"
            >
              还款提醒
            </el-button>
            <el-button
              v-if="scope.row.planStatus !== '2' && scope.row.currentPeriodStatus === '2'"
              size="small"
              text
              style="color: #108c58; font-size: 14px"
              @click="handleNotification(scope.row, 'overdue')"
            >
              逾期提示
            </el-button>
            <el-button size="small" type="success" text style="color: #108c58; font-size: 14px" @click="handleRepayment(scope.row)">
              还款情况
            </el-button>
            <el-button size="small" type="primary" text style="color: #108c58; font-size: 14px" @click="handleDetail(scope.row)"> 详情 </el-button>
            <el-button size="small" text style="color: #108c58; font-size: 14px" @click="handleTracking(scope.row)"> 追踪 </el-button>
            <el-button size="small" text style="color: #108c58; font-size: 14px" @click="handleDelete(scope.row)"> 删除 </el-button>
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
    <RepaymentDetailDialog v-model:visible="detailDialogVisible" :data="detailData" />
    <RepaymentBuyerDetailDialog v-model:visible="buyerDetailDialogVisible" :data="detailData" />
    <LoanTrackingDialog v-model:visible="trackingDialogVisible" :data="detailData" />
    <RepaymentStatusDialog v-model:visible="repaymentStatusDialogVisible" :data="detailData" @refresh="handleRefresh" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { getloanApplicationsList, deleteRepaymentRecord, messageRecord, getRemainingDetail } from '@/api/creditPlatform/repaymentPlans';
import RepaymentDetailDialog from './RepaymentDetailDialog.vue';
import RepaymentBuyerDetailDialog from './RepaymentBuyerDetailDialog.vue';
import LoanTrackingDialog from './LoanTrackingDialog.vue';
import RepaymentStatusDialog from './RepaymentStatusDialog.vue';

/**
 * 还款计划数据结构
 */
interface RepaymentPlan {
  id: number | string; // 申请ID
  realName: string; // 申请人姓名
  productName: string; // 产品名称
  productType?: string; // 产品类型
  applicableObject?: string; // 适用对象
  lenderType?: string; // 适用对象类型: 0=采购商(个人), 1=企业, 2=供应商(企业)
  lenderTyp?: string; // 适用对象(兼容字段)
  loanAmount?: string | number; // 贷款金额
  loanTerm?: string | number; // 贷款期限
  reviewedAt?: string; // 贷款审批通过时间
  planStatus?: string; // 还款状态: 0=待还款, 1=还款中, 2=已还清, 3=已逾期
  currentPeriodStatus?: string; // 当前期次状态: 0=待还款, 1=已还款, 2=已逾期
}

// 获取字典数据
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { applicable_object, prod_credit_type, repayment_status } = toRefs<any>(
  proxy?.useDict('applicable_object', 'prod_credit_type', 'repayment_status')
);

// 查询表单引用
const queryFormRef = ref();

// 查询参数
const queryParams = ref({
  pageNum: 1, // 当前页码
  pageSize: 10, // 每页条数
  realName: '', // 申请人姓名
  productType: '', // 产品类型
  applicableObject: '' // 适用对象
});

/**
 * 0=待还款(#FF7B00)，1=还款中(#00BF33)，2=已还清(#0B79EF)，3=已逾期(#FF0000)
 */
const getPlanStatusColor = (status: string | number | undefined) => {
  if (status === undefined || status === null) return '';
  const code = String(status);
  switch (code) {
    case '0':
      return '#FF7B00'; // 待还款
    case '1':
      return '#00BF33'; // 还款中
    case '2':
      return '#0B79EF'; // 已还清
    case '3':
      return '#FF0000'; // 已逾期
    default:
      return '';
  }
};

/**
 * 获取还款状态标签
 */
const getPlanStatusLabel = (status: string | number | undefined) => {
  if (status === undefined || status === null) return '--';
  const dictList = repayment_status?.value || [];
  const match = dictList.find((item: any) => String(item.value) === String(status));
  return match?.label || '--';
};

// 表格数据和状态
const tableData = ref<RepaymentPlan[]>([]); // 表格数据
const total = ref(0); // 总条数
const loading = ref(false); // 加载状态

// 弹窗显示状态
const detailDialogVisible = ref(false); // 企业详情弹窗
const buyerDetailDialogVisible = ref(false); // 个人详情弹窗
const trackingDialogVisible = ref(false); // 追踪弹窗
const repaymentStatusDialogVisible = ref(false); // 还款情况弹窗
const detailData = ref<RepaymentPlan | null>(null); // 当前选中的数据

/**
 * 获取还款管理列表数据
 */
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
      tableData.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error('获取列表失败:', error);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

/**
 * 查询按钮 - 重置到第一页并查询
 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/**
 * 重置按钮 - 清空查询条件并重新查询
 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  getList();
};

/**
 * 分页 - 页码变化处理
 */
const handlePageChange = (page: number) => {
  queryParams.value.pageNum = page;
  getList();
};

/**
 * 分页 - 每页条数变化处理
 */
const handlePageSizeChange = (size: number) => {
  queryParams.value.pageSize = size;
  queryParams.value.pageNum = 1;
  getList();
};

/**
 * 还款情况按钮 - 打开还款情况弹窗
 */
const handleRepayment = (row: RepaymentPlan) => {
  detailData.value = row;
  repaymentStatusDialogVisible.value = true;
};

/**
 * 详情按钮
 */
const handleDetail = (row: RepaymentPlan) => {
  detailData.value = row;

  // 根据 lenderType、applicableObject 或 lenderTyp 判断：0=采购商(个人)，1=企业，2=供应商(企业)
  const lenderType = row.lenderType ?? row.applicableObject ?? row.lenderTyp;
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
 * 追踪按钮 - 打开追踪弹窗
 */
const handleTracking = (row: RepaymentPlan) => {
  detailData.value = row;
  trackingDialogVisible.value = true;
};

const handleNotification = async (row: RepaymentPlan, type?: 'pending' | 'completed' | 'overdue') => {
  let actualType: 'pending' | 'completed' | 'overdue' = type || 'pending';
  let messageType = '0';

  // 首先判断 planStatus 是否是 2
  if (row.planStatus === '2') {
    // planStatus = 2 → messageType = 3（完结通知）
    actualType = 'completed';
    messageType = '3';
  } else {
    // planStatus 不是 2，根据 currentPeriodStatus 判断
    if (row.currentPeriodStatus === '0') {
      // currentPeriodStatus = 0 → messageType = 1（还款提醒）
      actualType = 'pending';
      messageType = '1';
    } else if (row.currentPeriodStatus === '2') {
      // currentPeriodStatus = 2 → messageType = 2（逾期提示）
      actualType = 'overdue';
      messageType = '2';
    } else if (row.currentPeriodStatus === '1') {
      ElMessage.warning('当前期次已还款，无需发送提示');
      return;
    } else {
      // 默认情况
      actualType = 'pending';
      messageType = '1';
    }
  }

  const messages = {
    pending: '还款提醒',
    completed: '完结通知',
    overdue: '逾期提示'
  };

  ElMessageBox.confirm(`确定向 ${row.realName} 发送${messages[actualType]}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      // 1. 先调用 getRemainingDetail 获取对象数据
      const detailResponse = await getRemainingDetail(row.id);
      if (detailResponse && detailResponse.code === 200) {
        const detailData = detailResponse.data || {};

        // 2. 直接将 messageType 和 productName 添加到对象中
        const dataWithMessageType = {
          ...detailData,
          messageType: messageType,
          productName: row.productName
        };

        // 3. 调用 messageRecord 接口
        const messageResponse = await messageRecord(dataWithMessageType);
        if (messageResponse && messageResponse.code === 200) {
          ElMessage.success(`${messages[actualType]}已发送`);
        } else {
        }
      } else {
      }
    } catch (error) {
      console.error('发送通知失败:', error);
    }
  });
};

/**
 * 删除按钮
 */
const handleDelete = (row: RepaymentPlan) => {
  ElMessageBox.confirm(`确认要删除「${row.productName}」的还款记录吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        const response = await deleteRepaymentRecord(row.id);
        if (response && response.code === 200) {
          ElMessage.success('删除成功');
          getList();
        } else {
        }
      } catch (error) {}
    })
    .catch(() => {});
};

// 子弹窗刷新列表
const handleRefresh = () => {
  getList();
};

// 每次页面激活时执行
onActivated(() => {
  getList();
});

// 组件挂载时获取列表数据
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.loan-applications {
  padding: 24px;
  min-height: calc(100vh - 120px);
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
  justify-content: flex-start;
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

/* 去掉操作列左右内边距，防止内容被压缩 */
:deep(.op-col .cell) {
  padding-left: 0 !important;
  padding-right: 8px !important;
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
}

:deep(.nowrap-column .cell) {
  white-space: nowrap;
}

.status-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
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
    tr:hover > td {
      background-color: #f5f7fa !important;
    }
  }
}
// ::v-deep .el-form-item__label {
//   text-align: left !important;
// }
</style>
