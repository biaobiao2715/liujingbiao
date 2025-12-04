<!--
  标题: myReport.vue
  功能: 我的举报内容列表
  说明: 用于查看我的全部举报内容。
  当前版本: 1.0
  开发信息: Created by 邓和杰 2025-11-05
-->
<template>
  <div class="orders">
    <!-- 页面标题 -->
    <div class="title">我的举报</div>

    <!-- 查询条件区域 -->
    <div class="search-container">
      <el-form :model="queryParams" label-position="left" label-width="70px">
        <div v-show="isExpanded" class="form-row">
          <el-form-item label="举报编号：">
            <el-input v-model="queryParams.reportCode" placeholder="请输入举报编号" />
          </el-form-item>
          <el-form-item label="举报类型：">
            <el-select v-model="queryParams.reportTypeId" placeholder="请选择">
              <el-option v-for="dict in report_type_id" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item label="案件编号：">
            <el-input v-model="queryParams.caseCode" placeholder="" />
          </el-form-item>
          <el-form-item label="举报商品：">
            <el-input v-model="queryParams.reportGoodsCode" placeholder="请输入举报商品" />
          </el-form-item>
        </div>
        <div v-show="isExpanded" class="form-row">
          <el-form-item label="时间范围：">
            <el-date-picker
              v-model="queryParams.createTime"
              type="datetimerange"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              range-separator="-"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              style="width: 360px"
            />
          </el-form-item>
          <el-form-item label="所属状态：">
            <el-select v-model="queryParams.status" placeholder="请选择">
              <el-option v-for="status in statusOptions" :key="status.value" :label="status.label" :value="status.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="toggle-expand-text" :class="isExpanded ? 'toggle-top' : 'toggle-bottom'" @click="toggleExpand">
          {{ isExpanded ? '收起' : '展开' }}
        </div>
        <div class="button-group">
          <el-button type="primary" :icon="Search" @click="handleQuery">查询</el-button>
          <el-button class="reset-btn" plain :icon="RefreshLeft" @click="resetQuery">重置</el-button>
        </div>
      </el-form>
    </div>

    <!-- 列表展示区域 -->
    <el-table v-loading="loading" :data="reportListArr" style="width: 100%" border>
      <el-table-column prop="index" label="序号" width="80" type="index" />
      <el-table-column prop="reportCode" label="举报编号" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="caseCode" label="案件编号" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column prop="reportTypeId" label="举报类别" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-text :options="report_type_id" :value="scope.row.reportTypeId || ''" />
        </template>
      </el-table-column>
      <el-table-column prop="reportGoodsName" label="举报商品" min-width="120" :show-overflow-tooltip="true" />
      <el-table-column prop="createTime" label="创建时间" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="status" label="所属状态" min-width="100" :show-overflow-tooltip="true">
        <template #default="scope">
          <span :class="['status-text', getStatusClass(scope.row.status)]">{{ getStatusText(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="operation" label="操作" min-width="150" fixed="right" align="left">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button link class="operation-view-btn" @click="handleView(scope.row)">查看</el-button>
            <el-button v-if="['0', '1'].includes(scope.row.status)" link class="operation-withdraw-btn" @click="handleWithdraw(scope.row)"
              >撤回</el-button
            >
            <el-button v-else-if="['2', '4'].includes(scope.row.status)" link class="operation-resubmit-btn" @click="handleReSubmit(scope.row)"
              >重新提交</el-button
            >
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 编辑举报弹窗组件 -->
    <report-edit ref="reportEditRef" v-model="reportEditVisible" @submit-success="handleEditSubmitSuccess" />

    <!-- 查看举报弹窗组件 -->
    <report-view ref="reportViewRef" v-model="reportViewVisible" :report-data="currentReportData" />

    <!-- 撤回弹窗 -->
    <el-dialog v-model="withdrawDialogVisible" title="操作确认" width="420px" :close-on-click-modal="false" @close="handleWithdrawCancel">
      <el-form ref="withdrawFormRef" :model="withdrawForm" :rules="withdrawRules" label-width="0">
        <el-form-item prop="reason">
          <el-input
            v-model="withdrawForm.reason"
            type="textarea"
            :rows="4"
            maxlength="200"
            show-word-limit
            placeholder="请输入撤回原因，最多200个字"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="handleWithdrawCancel">取消</el-button>
        <el-button type="primary" :disabled="!canSubmitWithdraw" :loading="withdrawLoading" @click="handleWithdrawConfirm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
// 引入 Vue 能力/类型，增强类型安全
import { ref, toRefs, onMounted, getCurrentInstance, computed, watch, type ComponentInternalInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { reportList, reportBack, resubmitReportList, type Report, type ReportQueryParams } from '@/api/mall/personalCenter/myReport';
import Pagination from '@/components/Pagination/index.vue';
import { ElMessage } from 'element-plus';
import { Search, RefreshLeft } from '@element-plus/icons-vue';
// 引入编辑举报弹窗组件
import ReportEdit from './myReportChildren/reportEdit.vue';
import ReportView from './myReportChildren/reportView.vue';

// Vue 上下文
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { report_type_id } = toRefs<any>(proxy?.useDict('report_type_id'));

// 状态选项数组
const statusOptions = [
  { value: '0', label: '待处理' },
  { value: '1', label: '处理中' },
  { value: '2', label: '已驳回' },
  { value: '3', label: '已结案' },
  { value: '4', label: '已撤回' }
];

// 举报类别选项数组
const reportTypeOptions = [
  { value: 1, label: '假种子销售' },
  { value: 2, label: '品种权侵权' },
  { value: 3, label: '虚假宣传' },
  { value: 4, label: '无证生产经营' },
  { value: 5, label: '其他' }
];

// 查询参数（扩展类型以支持日期范围数组）
const queryParams = ref<ReportQueryParams & { createTime?: string | string[] | null }>({
  pageNum: 1,
  pageSize: 10,
  reportCode: '', //举报编号
  reportTypeId: '',
  caseCode: '', //案件编号
  reportGoodsName: '',
  createTime: null,
  status: ''
});

// 列表数据与加载状态
const reportListArr = ref<Report[]>([]);
const total = ref(0);
const loading = ref(false); // 表格加载状态

// 控制编辑弹窗显示
const reportEditVisible = ref(false);
const reportEditRef = ref<InstanceType<typeof ReportEdit> | null>(null);

// 控制查看弹窗显示
const reportViewVisible = ref(false);
const reportViewRef = ref<InstanceType<typeof ReportView> | null>(null);

// 监听弹窗状态，确保同时只显示一个弹窗
watch(reportEditVisible, (newVal) => {
  if (newVal) {
    // 打开编辑弹窗时，关闭查看弹窗和撤回弹窗
    reportViewVisible.value = false;
    withdrawDialogVisible.value = false;
  }
});

watch(reportViewVisible, (newVal) => {
  if (newVal) {
    // 打开查看弹窗时，关闭编辑弹窗和撤回弹窗
    reportEditVisible.value = false;
    withdrawDialogVisible.value = false;
  }
});

watch(withdrawDialogVisible, (newVal) => {
  if (newVal) {
    // 打开撤回弹窗时，关闭编辑弹窗和查看弹窗
    reportEditVisible.value = false;
    reportViewVisible.value = false;
  }
});

// 当前查看/编辑的举报数据
const currentReportData = ref<Report | null>(null);

// 控制筛选区域展开/收起状态
const isExpanded = ref(true);

// 切换展开/收起
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 拉取列表
const getList = async () => {
  loading.value = true;

  try {
    // 处理日期范围：将数组转换为开始时间和结束时间
    const params: any = { ...queryParams.value };
    if (Array.isArray(params.createTime) && params.createTime.length === 2) {
      params.startTime = params.createTime[0];
      params.endTime = params.createTime[1];
      delete params.createTime;
    } else {
      delete params.createTime;
    }

    console.log('调用接口，查询参数：', params);
    const res = await reportList(params);
    console.log('接口返回结果：', res);
    // 响应拦截器已经处理了非200的情况，这里直接使用返回的数据
    // 如果接口返回成功，res 就是 res.data（因为响应拦截器返回的是 res.data）
    if (res && res.code === 200) {
      // 成功赋值，兜底空值
      reportListArr.value = res.rows || [];
      total.value = res.total || 0;
    } else {
      // 如果走到这里，说明接口返回了数据但 code 不是 200
      // 响应拦截器已经显示了错误消息，这里只清空数据
      reportListArr.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error('接口调用失败：', error);
    // 响应拦截器已经显示了错误消息，这里只处理数据
    // 如果是网络错误等，响应拦截器会显示错误消息
    reportListArr.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 首次进入/挂载拉取数据
onMounted(() => {
  getList();
});

// 处理查询
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置查询
const resetQuery = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    reportCode: '',
    reportTypeId: '',
    caseCode: '',
    reportGoodsName: '',
    createTime: null,
    status: ''
  };
  getList();
};

// 处理撤回
const withdrawDialogVisible = ref(false);
const withdrawFormRef = ref();
const withdrawForm = ref({
  reason: ''
});
const withdrawRules = {
  reason: [
    { required: true, message: '请输入撤回原因', trigger: 'blur' },
    { max: 200, message: '最多输入200个字', trigger: 'blur' }
  ]
};
const currentWithdrawRow = ref<Report | null>(null);
const withdrawLoading = ref(false);
const canSubmitWithdraw = computed(() => withdrawForm.value.reason.trim().length > 0 && !withdrawLoading.value);

const handleWithdraw = (row: Report) => {
  currentWithdrawRow.value = row;
  withdrawForm.value.reason = '';
  withdrawDialogVisible.value = true;
};

const handleWithdrawCancel = () => {
  withdrawDialogVisible.value = false;
  currentWithdrawRow.value = null;
  withdrawLoading.value = false;
  withdrawFormRef.value?.resetFields();
};

const handleWithdrawConfirm = () => {
  if (!withdrawFormRef.value) return;
  if (!currentWithdrawRow.value) return;
  withdrawFormRef.value.validate(async (valid: boolean) => {
    if (!valid || !canSubmitWithdraw.value) return;
    withdrawLoading.value = true;
    try {
      const params = {
        id: currentWithdrawRow.value.id,
        withdrawCause: withdrawForm.value.reason.trim()
      };
      await reportBack(params);
      ElMessage.success('撤回成功');
      withdrawDialogVisible.value = false;
      currentWithdrawRow.value = null;
      getList();
    } catch (error: any) {
      ElMessage.error(error.msg || error.message || '撤回失败');
    } finally {
      withdrawLoading.value = false;
    }
  });
};

// 路由相关
const router = useRouter();

// 处理重新提交
const handleReSubmit = async (row: Report) => {
  // 初始化弹窗数据
  if (reportEditRef.value) {
    await reportEditRef.value.initData({
      reportCode: row.reportCode,
      status: row.status,
      reportData: row
    });
  }
  // 显示弹窗
  reportEditVisible.value = true;
};

// 处理编辑提交成功
const handleEditSubmitSuccess = () => {
  // 重新加载数据列表
  getList();
};

// 处理查看
const handleView = async (row: Report) => {
  try {
    // 调用接口获取详细信息
    const res = await resubmitReportList(row.id);
    // 合并接口返回的数据到当前行数据
    if (res && res.data) {
      currentReportData.value = {
        ...row,
        ...res.data
      };
    } else {
      currentReportData.value = row;
    }
    // 显示查看弹窗
    reportViewVisible.value = true;
  } catch (error: any) {
    console.error('获取举报详情失败:', error);
    ElMessage.error(error.msg || error.message || '获取详情失败');
    // 即使接口失败，也显示弹窗，使用列表数据
    currentReportData.value = row;
    reportViewVisible.value = true;
  }
};

// 根据状态值获取状态文本
const getStatusText = (status: string): string => {
  const option = statusOptions.find((item) => item.value === status);
  return option ? option.label : status;
};

// 根据状态值获取状态样式类
const getStatusClass = (status: string): string => {
  const statusClassMap: Record<string, string> = {
    '0': 'status-pending', // 待处理
    '1': 'status-processing', // 处理中
    '2': 'status-rejected', // 已驳回
    '3': 'status-closed', // 已结案
    '4': 'status-withdrawn' // 已撤回
  };
  return statusClassMap[status] || '';
};

// 根据举报类型ID获取举报类型标签
const getReportTypeLabel = (reportTypeId: string | number | null | undefined): string => {
  if (reportTypeId === null || reportTypeId === undefined || reportTypeId === '') return '-';
  const option = report_type_id.value?.find((item: any) => String(item.value) === String(reportTypeId));
  return option?.label || String(reportTypeId);
};

// 根据举报类型获取举报类型文本
const getReportTypeText = (reportTypeId: string): string => {
  const option = reportTypeOptions.find((item) => item.value === reportTypeId);
  return option ? option.label : reportTypeId;
};
</script>

<style scoped>
/* 页面布局样式 */

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.search-container {
  padding: 15px;
  margin-bottom: 15px;
  position: relative;
}

.form-row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.form-row:last-child {
  margin-bottom: 0;
}

.search-container .el-form-item {
  margin-right: 30px;
  margin-bottom: 0;
  white-space: nowrap;
}

.search-container .el-input,
.search-container .el-select {
  width: 180px;
}

.button-group {
  margin-left: auto;
  display: flex;
  gap: 10px;
}

.reset-btn {
  background-color: #fafafa !important;
  border-color: #d9d9d9 !important;
  color: #595959 !important;

  &:hover {
    background-color: #f0f0f0 !important;
    border-color: #d9d9d9 !important;
    color: #595959 !important;
  }
}

.toggle-expand-text {
  color: #108c58;
  font-size: 14px;
  position: absolute;
  left: 60%;
  cursor: pointer;
  white-space: nowrap;
}

.toggle-expand-text.toggle-top {
  top: 60px;
}

.toggle-expand-text.toggle-bottom {
  bottom: 0;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
.uploadcss {
  ::v-deep .el-form-item__content {
    white-space: nowrap;
    display: inline-block;
  }
}
::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 106px;
  height: 106px;
}
::v-deep .el-upload--picture-card {
  width: 106px;
  height: 106px;
  line-height: 106px;
  float: left;
}

/* 举报类别样式 */
.report-type-text {
  font-size: 14px;
  color: #333333;
  background: none;
  border: none;
  padding: 0;
}

/* 所属状态样式 */
.status-text {
  position: relative;
  padding-left: 16px;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }
}

.status-pending {
  color: #ff7b00;

  &::before {
    background-color: #ff7b00;
  }
}

.status-processing {
  color: #00bf33;

  &::before {
    background-color: #00bf33;
  }
}

.status-rejected {
  color: #ff0000;

  &::before {
    background-color: #ff0000;
  }
}

.status-closed {
  color: #108c58;

  &::before {
    background-color: #108c58;
  }
}

.status-withdrawn {
  color: #bbbdbf;

  &::before {
    background-color: #bbbdbf;
  }
}

/* 表格表头样式 */
:deep(.el-table__header) {
  th {
    font-weight: normal !important;
    color: #3d3d3d !important;
  }
}

:deep(.el-table th) {
  font-weight: normal !important;
  color: #3d3d3d !important;
}

/* 操作列样式 */
.operation-buttons {
  text-align: left;
  display: flex;
  gap: 0;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  padding-left: 0;
}

.operation-view-btn,
.operation-withdraw-btn,
.operation-resubmit-btn {
  background-color: transparent !important;
  border: none !important;
  padding: 0 8px !important;

  &:hover,
  &:focus {
    background-color: transparent !important;
  }
}

.operation-view-btn {
  color: #108c58 !important;

  &:hover,
  &:focus {
    color: #108c58 !important;
  }
}

.operation-withdraw-btn {
  color: #108c58 !important;

  &:hover,
  &:focus {
    color: #108c58 !important;
  }
}

.operation-resubmit-btn {
  color: #108c58 !important;

  &:hover,
  &:focus {
    color: #108c58 !important;
  }
}
</style>
