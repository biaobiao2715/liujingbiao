<!--
  标题: creditPlatform/repaymentPlans/index.vue
  功能: 显示已审批通过的贷款申请，管理还款情况、追踪和完结
  说明: 展示贷后管理列表
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-11-25
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

    <el-table :data="tableData" border v-loading="loading">
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
          <dict-tag :options="applicable_object" :value="scope.row.applicableObject || scope.row.lenderTyp" />
        </template>
      </el-table-column>
      <el-table-column label="贷款金额(元)" prop="loanAmount" align="center" width="140" />
      <el-table-column label="贷款期限" prop="loanTerm" align="center" width="100" />
      <el-table-column label="贷款审批通过时间" prop="reviewedAt" min-width="180" align="center" />
      <el-table-column label="还款状态" prop="planStatus" align="center" width="120">
        <template #default="scope">
          <dict-tag :options="repayment_status" :value="scope.row.planStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="340" fixed="right">
        <template #default="scope">
          <div class="operation-buttons">
            <!-- 根据当前期次状态显示不同的提示按钮 -->
            <el-button v-if="scope.row.currentPeriodStatus === '0'" size="small" type="info" text @click="handleNotification(scope.row, 'pending')">
              还款提醒
            </el-button>
            <el-button
              v-else-if="scope.row.currentPeriodStatus === '1'"
              size="small"
              type="success"
              text
              @click="handleNotification(scope.row, 'completed')"
            >
              完结通知
            </el-button>
            <el-button
              v-else-if="scope.row.currentPeriodStatus === '2'"
              size="small"
              type="danger"
              text
              @click="handleNotification(scope.row, 'overdue')"
            >
              逾期提示
            </el-button>
            <el-button size="small" type="success" text @click="handleRepayment(scope.row)">还款情况</el-button>
            <el-button size="small" type="primary" text @click="handleDetail(scope.row)">详情</el-button>
            
            <!-- 更多操作下拉菜单 -->
            <el-dropdown trigger="click" @command="(cmd) => handleMoreAction(scope.row, cmd)">
              <el-button size="small" type="info" text>
                更多<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="tracking">追踪</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
import { ref, onMounted, onActivated, getCurrentInstance, toRefs } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown } from '@element-plus/icons-vue';
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
 * 详情按钮 - 根据适用对象类型打开对应的详情弹窗
 * @param row - 当前行数据
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
 * @param row - 当前行数据
 */
const handleTracking = (row: RepaymentPlan) => {
  detailData.value = row;
  trackingDialogVisible.value = true;
};

/**
 * 通知按钮 - 根据当前期次状态发送不同的通知
 * @param row - 当前行数据
 * @param type - 通知类型: pending=还款提醒, completed=完结通知, overdue=逾期提示
 */
const handleNotification = async (row: RepaymentPlan, type: 'pending' | 'completed' | 'overdue') => {
  const messages = {
    pending: '还款提醒',
    completed: '完结通知',
    overdue: '逾期提示'
  };

  // 根据通知类型确定 messageType
  // 还款提醒 → "0", 完结通知 → "3", 逾期提示 → "2"
  const messageTypeMap: Record<string, string> = {
    pending: '0',
    completed: '3',
    overdue: '2'
  };
  const messageType = messageTypeMap[type] || '0';

  ElMessageBox.confirm(`确定向 ${row.realName} 发送${messages[type]}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      try {
        // 1. 先调用 getRemainingDetail 获取对象数据
        const detailResponse = await getRemainingDetail(row.id);
        if (detailResponse && detailResponse.code === 200) {
          const detailData = detailResponse.data || {};
          console.log(detailData);
          console.log(messageType);

          // 2. 直接将 messageType 添加到对象中
          const dataWithMessageType = {
            ...detailData,
            messageType: messageType
          };
          console.log(dataWithMessageType);

          // 3. 调用 messageRecord 接口
          const messageResponse = await messageRecord(dataWithMessageType);
          console.log(messageResponse);
          if (messageResponse && messageResponse.code === 200) {
            ElMessage.success(`${messages[type]}已发送`);
          } else {
            ElMessage.error(messageResponse?.msg || '发送失败');
          }
        } else {
          ElMessage.error(detailResponse?.msg || '获取详情失败');
        }
      } catch (error) {
        console.error('发送通知失败:', error);
        ElMessage.error('发送通知失败，请稍后重试');
      }
    })
    .catch(() => {
      ElMessage.info('已取消发送');
    });
};

/**
 * 更多操作 - 处理下拉菜单的命令
 */
const handleMoreAction = (row: RepaymentPlan, command: string) => {
  if (command === 'tracking') {
    handleTracking(row);
  } else if (command === 'delete') {
    handleDelete(row);
  }
};

/**
 * 删除按钮 - 删除还款记录
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
          ElMessage.error(response?.msg || '删除失败');
        }
      } catch (error) {
        ElMessage.error('删除失败，请稍后重试');
      }
    })
    .catch(() => {});
};

// 每次页面激活时执行（从缓存中恢复）
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
  gap: 6px;
  flex-wrap: nowrap;
  white-space: nowrap;

  .el-button {
    margin: 0;
    flex-shrink: 0;
    padding: 5px 10px;
    font-size: 12px;
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
