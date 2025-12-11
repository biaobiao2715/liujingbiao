<!--
  标题: enterprise/index.vue
  功能: 违规记录管理
  说明: 用于违规记录管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-13
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="供应商/企业名称" prop="reporterName" label-width="auto">
        <el-input v-model="queryParams.reporterName" placeholder="请输入供应商或企业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="案件编号" prop="caseCode" label-width="auto">
        <el-input v-model="queryParams.caseCode" placeholder="请输入案件编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="案件类型" prop="caseTypeId" label-width="auto">
        <el-select v-model="queryParams.caseTypeId" placeholder="请选择案件类型" filterable clearable>
          <el-option v-for="dict in case_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle v-hasPermi="['safeguard:reportCaseFiling:list']" icon="Search" type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle v-hasPermi="['safeguard:reportCaseFiling:list']" icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column label="供应商/企业名称" prop="reporterName" min-width="100" :show-overflow-tooltip="true" />
      <el-table-column label="案件编号" prop="caseCode" width="210" />
      <el-table-column label="案件类型" prop="caseTypeId">
        <template v-slot="scope">
          <dict-text :options="case_type" :value="scope.row.caseTypeId || ''" />
        </template>
      </el-table-column>
      <el-table-column label="处理状态" prop="status" align="center">
        <!-- <template v-slot="scope">
          <dict-text :options="case_status" :value="scope.row.status || ''" />
        </template> -->

        <template #default="scope">
          <div class="flex-center-center">
            <div v-if="scope.row.status != null" class="normal" :class="{ 'green': scope.row.status == 3 }"></div>
            <span v-if="scope.row.status == 3" class="green-color">已结案</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="处理时间" prop="updateTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.updateTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="本次扣分" prop="caseScore" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.caseScore }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="160" class-name="flex-center">
        <template #default="scope">
          <el-button
            v-throttle
            v-hasPermi="['safeguard:reportCaseFiling:query']"
            v-if="scope.row.status !== '0'"
            link
            type="primary"
            @click="handleEdit(scope.row)"
            >查看</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <el-dialog :title="dlgTitle" v-model="dlgPreviewVisible" :before-close="cancelDlg" :destroy-on-close="true" width="80%">
      <Detail :id="selectID" @cancel="cancelDlg" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { getReportCaseFilingList } from '@/api/rightsPlatform/achiveManagement/credit/violationRecords/index';
import Detail from './Detail.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { case_status, case_type } = toRefs<any>(proxy?.useDict('case_status', 'case_type'));
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: 3,
  caseCode: '',
  caseTypeId: '',
  reporterName: ''
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
// 对话框相关状态
const dlgPreviewVisible = ref(false);
const dlgTitle = ref('');
const isReadonly = ref(false);
const selectID = ref<string | number>('');
const selectType = ref<'view' | 'edit' | 'audit'>('view');

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  const params = { ...queryParams.value };

  getReportCaseFilingList(params).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

// 查询按钮事件
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const handleReset = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

// 打开对话框：审核/查看/编辑
const handleEdit = (row: any) => {
  selectID.value = row.id;
  selectType.value = 'view';
  isReadonly.value = true;
  dlgTitle.value = '违规记录详情';
  dlgPreviewVisible.value = true;
};

// 关闭对话框
const cancelDlg = () => {
  dlgPreviewVisible.value = false;
};

// 子组件刷新回调
const refreshData = () => {
  dlgPreviewVisible.value = false;
  getList();
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.supplier-management {
  min-height: calc(100vh - 120px);
  padding: 24px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
