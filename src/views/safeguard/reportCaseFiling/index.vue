<!--
    标题: index.vue
    功能: 举报案件立案管理
    说明: 举报案件立案列表页
    当前版本: 1.0
    开发信息: Created by 2025-11-21
-->
<template>
  <div class="report-case-filing-container">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline>
      <!-- 举报编号 -->
      <el-form-item label="举报编号" prop="reportCode">
        <el-input v-model="queryParams.reportCode" placeholder="请输入举报编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 案件编号 -->
      <el-form-item label="案件编号" prop="caseCode">
        <el-input v-model="queryParams.caseCode" placeholder="请输入案例编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 创建时间 -->
      <el-form-item label="创建时间" prop="createTime">
        <el-date-picker v-model="queryParams.createTime" type="datetime" placeholder="选择创建时间" value-format="YYYY-MM-DD HH:mm:ss" clearable />
      </el-form-item>

      <!-- 举报人 -->
      <el-form-item label="举报人" prop="createByName">
        <el-input v-model="queryParams.createByName" placeholder="请输入举报人姓名" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 被举报人 -->
      <el-form-item label="被举报人" prop="reportPersonName">
        <el-input v-model="queryParams.reportPersonName" placeholder="请输入被举报人" clearable @keyup.enter="handleQuery" />
      </el-form-item>

      <!-- 所属状态 -->
      <el-form-item label="所属状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="请选择" clearable>
          <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
        </el-select>
      </el-form-item>

      <!-- 查询和重置按钮 -->
      <el-form-item class="search-actions">
        <el-button class="search-btn" v-throttle type="primary" :icon="Search" @click="handleQuery">查询</el-button>
        <el-button class="reset-btn" v-throttle plain :icon="RefreshLeft" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" v-loading="loading">
      <!-- 序号 -->
      <el-table-column type="index" width="80" label="序号" align="center" :show-overflow-tooltip="true" />

      <!-- 举报编号 -->
      <el-table-column label="举报编号" align="center" prop="reportCode" min-width="150" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.reportCode || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 案件编号 -->
      <el-table-column label="案件编号" align="center" prop="caseCode" min-width="150" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.caseCode || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 举报类型 -->
      <el-table-column label="举报类型" align="center" prop="reportTypeId" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <dict-text :options="report_type_id" :value="scope.row.reportTypeId || ''" />
        </template>
      </el-table-column>

      <!-- 举报人 -->
      <el-table-column label="举报人" align="center" prop="createByName" min-width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.createByName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 被举报人 -->
      <el-table-column label="被举报人" align="center" prop="reporterName" min-width="150" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.reporterName || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column label="创建时间" align="center" prop="createTime" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ scope.row.createTime || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 所属状态 -->
      <el-table-column label="所属状态" align="center" prop="status" width="120" :show-overflow-tooltip="true">
        <template #default="scope">
          <div class="status-cell-wrapper">
            <span :class="['status-text', getStatusClass(scope.row.status)]">{{ getStatusName(scope.row.status) }}</span>
          </div>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <el-table-column label="操作" fixed="right" width="240">
        <template #default="scope">
          <div class="operation-buttons-wrapper">
            <div class="operation-buttons">
              <!-- 待处理状态：只显示处理按钮 -->
              <template v-if="scope.row.status === '0'">
                <el-button v-throttle link class="operation-link-button" @click="handleProcess(scope.row)">处理</el-button>
              </template>
              <!-- 处理中状态 -->
              <template v-else-if="scope.row.status === '1'">
                <!-- 处理按钮 - 处理中状态且noUrge为0时显示 -->
                <el-button
                  v-if="scope.row.noUrge === '0' || scope.row.noUrge === '2'"
                  v-throttle
                  link
                  class="operation-link-button"
                  @click="handleProcess(scope.row)"
                  >处理</el-button
                >
                <!-- 查看按钮 - 处理中状态且noUrge为1时显示 -->
                <el-button v-if="scope.row.noUrge === '1'" v-throttle link class="operation-link-button" @click="handleView(scope.row)"
                  >查看</el-button
                >
                <!-- 处理按钮 - 处理中状态且noUrge为1时显示（置灰、不可点击） -->
                <el-button v-if="scope.row.noUrge === '1'" v-throttle link class="operation-link-button no-click" disabled>处理</el-button>
                <!-- 催促按钮 - 处理中状态且且noUrge为1时显示 -->
                <el-button v-if="scope.row.noUrge === '1'" v-throttle link class="operation-link-button" @click="handleUrge(scope.row)"
                  >催促</el-button
                >
              </template>
              <!-- 其他状态：只显示查看按钮 -->
              <template v-else>
                <el-button v-throttle link class="operation-link-button" @click="handleView(scope.row)">查看</el-button>
              </template>
            </div>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <Pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        v-model:total="total"
        @pagination="getList"
      />
    </div>

    <!-- 查看/处理弹窗 -->
    <el-dialog class="dialog-preview" :title="dlgTitle" v-model="dlgPreviewVisible" :before-close="cancelDlg" :destroy-on-close="true" width="50%">
      <Detail
        v-if="dlgPreviewVisible"
        :id="selectID"
        :status="selectStatus"
        :type="selectType"
        :appeal-time="selectAppealTime"
        @cancel="cancelDlg"
        @success="refreshData"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, toRefs, type ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Document, Search, RefreshLeft } from '@element-plus/icons-vue';
import Pagination from '@/components/Pagination/index.vue';
// import { reportList } from '@/api/mall/personalCenter/myReport';

import { getReportChannelList, urgeReportCaseFiling } from '@/api/safeguard/reportCaseFiling';
import Detail from './components/Detail.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { report_type_id } = toRefs<any>(proxy?.useDict('report_type_id'));

// 搜索表单引用
const queryFormRef = ref();

// 加载状态
const loading = ref(false);

// 表格数据
const tableData = ref<any[]>([]);

// 总条数
const total = ref(0);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  reportCode: '', // 举报编号
  caseCode: '', // 案件编号
  createTime: '', // 创建时间
  createByName: '', // 举报人
  reporterName: '', // 被举报人
  status: '' // 所属状态
});

// 状态选项
const statusOptions = [
  { value: '0', label: '待处理' },
  { value: '1', label: '处理中' },
  { value: '2', label: '已驳回' },
  { value: '3', label: '已结案' },
  { value: '4', label: '已撤回' }
];

// 获取状态名称
const getStatusName = (status: string | undefined | null) => {
  if (status === undefined || status === null || status === '') return '-';
  const option = statusOptions.find((item) => item.value === String(status));
  return option?.label || '-';
};

// 获取状态标签类型
const getStatusTagType = (status: string | undefined | null) => {
  const statusMap: Record<string, string | undefined> = {
    '0': 'info', // 待处理
    '1': 'warning', // 处理中
    '2': 'danger', // 已驳回
    '3': 'success', // 已结案
    '4': undefined // 已撤回无需类型
  };
  return statusMap[String(status)];
};

// 获取状态对应的 CSS 类名
const getStatusClass = (status: string | undefined | null) => {
  const statusMap: Record<string, string> = {
    '0': 'status-pending', // 待处理
    '1': 'status-processing', // 处理中
    '2': 'status-rejected', // 已驳回
    '3': 'status-closed', // 已结案
    '4': 'status-withdrawn' // 已撤回
  };
  return statusMap[String(status)] || 'status-default';
};

// 获取列表数据
const getList = async () => {
  loading.value = true;
  try {
    const res = await getReportChannelList(queryParams);
    if (res && res.code === 200) {
      tableData.value = res.rows || res.data || [];
      total.value = res.total || 0;
    } else {
      ElMessage.error(res?.msg || '获取列表失败');
      tableData.value = [];
      total.value = 0;
    }
  } catch (error: any) {
    console.error('获取举报立案列表失败:', error);
    ElMessage.error(error?.msg || error?.message || '获取列表失败');
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 查询
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

// 重置
const handleReset = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.reportCode = '';
  queryParams.caseCode = '';
  queryParams.createTime = '';
  queryParams.createByName = ''; // 举报人
  queryParams.reporterName = '';
  queryParams.status = '';
  handleQuery();
};

// 对话框相关状态
const dlgPreviewVisible = ref(false);
const dlgTitle = ref('');
const selectID = ref<string | number>('');
const selectType = ref<'view' | 'process'>('view');
const selectStatus = ref<string>(''); // 当前选中行的状态
const selectAppealTime = ref<string>('');

// 打开对话框：查看/处理
const handleView = (row: any) => {
  selectID.value = row.id;
  selectType.value = 'view';
  selectStatus.value = row.status || '';
  selectAppealTime.value = row.appealTime || '';
  dlgTitle.value = '查看举报立案详情';
  dlgPreviewVisible.value = true;
};

// 打开对话框：处理
const handleProcess = (row: any) => {
  selectID.value = row.id;
  selectType.value = 'process';
  selectStatus.value = row.status || '';
  selectAppealTime.value = row.appealTime || '';
  dlgTitle.value = '处理举报立案';
  dlgPreviewVisible.value = true;
};

// 关闭对话框
const cancelDlg = () => {
  dlgPreviewVisible.value = false;
  selectID.value = '';
  selectType.value = 'view';
  selectStatus.value = '';
  selectAppealTime.value = '';
};

// 子组件刷新回调
const refreshData = () => {
  dlgPreviewVisible.value = false;
  getList();
};

// 催促
const handleUrge = async (row: any) => {
  try {
    await urgeReportCaseFiling({ id: row.id, reportPersonId: row.reportPersonId });
    ElMessage.success('催促成功');
    getList();
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('催促失败了:', error);
    }
  }
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.report-case-filing-container {
  height: calc(100vh - 120px);
  padding: 20px;

  .search-actions {
    margin-left: auto;
  }

  .search-btn,
  .reset-btn {
    margin-left: 10px;
    width: 88px;
    border-radius: 4px;
  }

  .reset-btn {
    background-color: #fafafa;
    border-color: #d9d9d9;
    color: #595959;

    &:hover {
      background-color: #f0f0f0;
      border-color: #d9d9d9;
      color: #595959;
    }
  }

  .operation-buttons-wrapper {
    position: relative;
    width: 100%;
  }

  .status-cell-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
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

  .status-default {
    color: #909399;

    &::before {
      background-color: #909399;
    }
  }

  .status-icon {
    position: absolute;
    top: 0;
    right: -10px;
    font-size: 24px;
    color: #409eff;
    z-index: 10;
    background: #fff;
    border-radius: 50%;
    padding: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .operation-icon {
    position: absolute;
    top: -8px;
    right: -8px;
    font-size: 18px;
    color: #409eff;
    z-index: 10;
    background: #fff;
    border-radius: 50%;
    padding: 2px;
  }

  .operation-buttons {
    display: flex;
    gap: 8px;
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .operation-link-button {
    color: #108c58 !important;
    background-color: transparent !important;
    border: none !important;
    padding: 0 8px !important;
    border-radius: 4px !important;

    &:hover,
    &:focus {
      color: #108c58 !important;
      background-color: transparent !important;
    }

    &.is-disabled {
      color: #a0c896 !important;
    }

    &.no-click {
      cursor: not-allowed;
      color: #108c58 !important;
    }
  }

  .pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
