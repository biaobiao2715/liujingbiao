<!--
  标题: enterprise/index.vue
  功能: 企业管理首页
  说明: 用于企业管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="企业编码" prop="enterpriseNumber">
        <el-input v-model="queryParams.enterpriseNumber" placeholder="请输入企业编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="企业名称" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入企业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="licenseNumber">
        <el-input v-model="queryParams.licenseNumber" placeholder="请输入统一社会信用代码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审核状态" prop="reviewStatus">
        <el-select v-model="queryParams.reviewStatus" placeholder="审核状态" filterable clearable>
          <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="审核时间" prop="reviewTime">
        <el-date-picker
          v-model="queryParams.reviewTime"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item> -->

      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="companyName" min-width="160" :show-overflow-tooltip="true" />
      <el-table-column label="企业编码" align="center" prop="enterpriseNumber" width="210" style="color: #0000ff">
        <template #default="scope">
          <!-- 跳转改为弹窗查看 -->
          <el-link type="primary" :underline="false" @click="handleEdit(scope.row, 'view')">
            {{ scope.row.enterpriseNumber }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="统一社会信用代码" align="center" prop="licenseNumber" width="210" :show-overflow-tooltip="true"> </el-table-column>

      <el-table-column label="资质等级" align="center" prop="credentialLevel" width="100">
        <template v-slot="scope">
          <dict-tag :options="plat_qualification_grade" :value="scope.row.credentialLevel" />
        </template>
      </el-table-column>
      <el-table-column label="信用等级" align="center" prop="creditLevel" width="100">
        <template v-slot="scope">
          <dict-tag :options="plat_credit_rating" :value="scope.row.creditLevel" />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="reviewStatus" width="100">
        <template v-slot="scope">
          <dict-tag :options="review_status" :value="scope.row.reviewStatus" />
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" prop="createTime" min-width="180">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="审核时间" align="center" prop="reviewTime" min-width="180">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.reviewTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="auditPerson" width="140" :show-overflow-tooltip="true"> </el-table-column>

      <el-table-column fixed="right" label="操作" align="center" width="180" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-throttle
            v-hasPermi="['system:baseEnterpriseInfo:query']"
            v-if="scope.row.reviewStatus !== '0'"
            type="primary"
            @click="handleEdit(scope.row, 'view')"
            >查看</el-button
          >
          <el-button
            v-throttle
            v-hasPermi="['system:baseEnterpriseInfo:audit']"
            v-if="scope.row.reviewStatus === '0'"
            type="primary"
            @click="handleEdit(scope.row, 'audit')"
            >审核</el-button
          >
          <!-- <el-button
            v-throttle
            v-hasPermi="['system:baseEnterpriseInfo:edit']"
            v-if="scope.row.reviewStatus === '1'"
            type="primary"
            @click="handleEdit(scope.row, 'edit')"
            >编辑</el-button
          > -->
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
      <editDetails :id="selectID" :type="selectType" @refresh="refreshData" @cancel="cancelDlg" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { baseEnterpriseInfoList } from '@/api/platform/enterprise/index';
import editDetails from './EditDetails.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: '',
  reviewTime: [] as string[] | [],
  reviewStatus: '',
  licenseNumber: '',
  companyName: '',
  enterpriseNumber: '',
  enterpriseType: '1'
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
  const { reviewTime, ...rest } = queryParams.value as any;
  const [reviewStartTime, reviewEndTime] = Array.isArray(reviewTime) ? reviewTime : [];
  const params = { ...rest, ...(reviewStartTime && reviewEndTime ? { reviewStartTime, reviewEndTime } : {}) };

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
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  selectID.value = row.id;
  selectType.value = type;
  isReadonly.value = type === 'view';
  dlgTitle.value = type === 'audit' ? '企业审核' : type === 'edit' ? '企业编辑' : '企业详情';
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
  padding: 24px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
