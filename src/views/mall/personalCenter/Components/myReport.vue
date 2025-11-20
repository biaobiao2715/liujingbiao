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
              <el-option v-for="type in reportTypeOptions" :key="type.value" :label="type.label" :value="type.label" />
            </el-select>
          </el-form-item>
          <el-form-item label="案件编号：">
            <el-input v-model="queryParams.caseCode" placeholder="" />
          </el-form-item>
        </div>
        <div v-show="isExpanded" class="form-row">
          <el-form-item label="举报商品：">
            <el-input v-model="queryParams.reportGoodsName" placeholder="请输入举报商品" />
          </el-form-item>
          <el-form-item label="创建时间：">
            <el-date-picker
              v-model="queryParams.createTime"
              type="datetime"
              value-format="YYYY-MM-DD HH:mm:ss"
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="请选择创建时间"
              style="width: 240px"
            />
          </el-form-item>
          <el-form-item label="所属状态：">
            <el-select v-model="queryParams.status" placeholder="请选择">
              <el-option v-for="status in statusOptions" :key="status.value" :label="status.label" :value="status.value" />
            </el-select>
          </el-form-item>
        </div>
        <div class="button-group">
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button type="primary" @click="resetQuery">重置</el-button>
          <el-button type="primary" @click="toggleExpand">{{ isExpanded ? '收起' : '展开' }}</el-button>
        </div>
      </el-form>
    </div>

    <!-- 列表展示区域 -->
    <el-table v-loading="loading" :data="reportListArr" style="width: 100%" border>
      <el-table-column prop="index" label="序号" width="80" type="index" />
      <el-table-column prop="reportCode" label="举报编号" min-width="180" />
      <el-table-column prop="caseCode" label="案件编号" min-width="150">
        <template #default="scope">
          {{ scope.row.caseCode || '----' }}
        </template>
      </el-table-column>
      <el-table-column prop="reportTypeId" label="举报类别" min-width="120">
        <template #default="scope">
          {{ getReportTypeText(scope.row.reportTypeId) }}
        </template>
      </el-table-column>
      <el-table-column prop="reportGoodsName" label="举报商品" min-width="120" />
      <el-table-column prop="createTime" label="创建时间" min-width="180" />
      <el-table-column prop="status" label="所属状态" min-width="100">
        <template #default="scope">
          {{ getStatusText(scope.row.status) }}
        </template>
      </el-table-column>
      <el-table-column prop="operation" label="操作" min-width="150" fixed="right">
        <template #default="scope">
          <el-button v-if="['0', '1'].includes(scope.row.status)" type="text" style="color: #409eff" @click="handleWithdraw(scope.row)">
            撤回
          </el-button>
          <el-button v-else-if="['2', '4'].includes(scope.row.status)" type="text" style="color: #409eff" @click="handleReSubmit(scope.row)">
            重新提交
          </el-button>
          <el-button type="text" style="color: #409eff" @click="handleView(scope.row)"> 查看 </el-button>
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
import { ref, toRefs, onMounted, getCurrentInstance, computed, type ComponentInternalInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { reportList, reportBack, resubmitReportList, type Report, type ReportQueryParams } from '@/api/mall/personalCenter/myReport';
import Pagination from '@/components/Pagination/index.vue';
import { ElMessage } from 'element-plus';
// 引入编辑举报弹窗组件
import ReportEdit from './myReportChildren/reportEdit.vue';
import ReportView from './myReportChildren/reportView.vue';

// Vue 上下文

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

// 查询参数
const queryParams = ref<ReportQueryParams>({
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
    console.log('调用接口，查询参数：', queryParams.value);
    const res = await reportList(queryParams.value);
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
  position: absolute;
  right: 0;
  bottom: 20px;
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
</style>
