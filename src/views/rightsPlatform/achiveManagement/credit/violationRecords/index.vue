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
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="供应商/企业名称" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入供应商或企业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="案件编号" prop="caseNumber">
        <el-input v-model="queryParams.caseNumber" placeholder="请输入案件编号" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="案件类型" prop="caseType">
        <el-select v-model="queryParams.caseType" placeholder="案件类型" filterable clearable>
          <el-option v-for="dict in case_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="供应商/企业名称" align="center" prop="companyName" min-width="100" :show-overflow-tooltip="true" />
      <el-table-column label="案件编号" align="center" prop="enterpriseNumber" width="210"></el-table-column>
      <el-table-column label="案件类型" align="center" prop="caseType">
        <template v-slot="scope">
          <dict-tag :options="case_type" :value="scope.row.caseType" />
        </template>
      </el-table-column>
      <el-table-column label="处理状态" align="center" prop="handleStatus">
        <template v-slot="scope">
          <dict-tag :options="plat_credit_rating" :value="scope.row.handleStatus" />
        </template>
      </el-table-column>
      <el-table-column label="处理时间" align="center" prop="handleTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.handleTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="本次扣分" align="center" prop="score" min-width="160">
        <template #default="scope">
          <span>{{ scope.row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-throttle
            v-hasPermi="['system:business:queryByTenant']"
            v-if="scope.row.reviewStatus !== '0'"
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

    <el-dialog
      class="dialog-preview"
      :title="dlgTitle"
      v-model="dlgPreviewVisible"
      :before-close="cancelDlg"
      :close-on-click-modal="isReadonly"
      :destroy-on-close="true"
      append-to-body
      width="80%"
    >
      <Detail :id="selectID" @cancel="cancelDlg" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { baseEnterpriseInfoList } from '@/api/rightsPlatform/achiveManagement/credit/violationRecords/index';
import Detail from './Detail.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { case_type, plat_credit_rating } = toRefs<any>(proxy?.useDict('case_type', 'plat_credit_rating'));
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  caseNumber: '',
  caseType: '',
  companyName: ''
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

  baseEnterpriseInfoList(params).then((res) => {
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

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getList();
});

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.supplier-management {
  padding: 24px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
