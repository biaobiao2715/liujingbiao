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
      <el-form-item label="审核时间" prop="reviewTime">
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
      </el-form-item>

      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="companyName" min-width="100" :show-overflow-tooltip="true" />
      <el-table-column label="企业编码" align="center" prop="enterpriseNumber" width="210" style="color: #0000ff">
        <template #default="scope">
          <!-- 跳转改为弹窗查看 -->
          <el-link type="primary" :underline="false" @click="handleEdit(scope.row, 'view')">
            {{ scope.row.enterpriseNumber }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="统一社会信用代码" align="center" prop="licenseNumber" width="210" :show-overflow-tooltip="true"> </el-table-column>

      <el-table-column label="资质等级" align="center" prop="credentialLevel">
        <template v-slot="scope">
          <dict-tag :options="plat_qualification_grade" :value="scope.row.credentialLevel" />
        </template>
      </el-table-column>
      <el-table-column label="信用等级" align="center" prop="creditLevel">
        <template v-slot="scope">
          <dict-tag :options="plat_credit_rating" :value="scope.row.creditLevel" />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="reviewStatus">
        <template v-slot="scope">
          <dict-tag :options="review_status" :value="scope.row.reviewStatus" />
        </template>
      </el-table-column>
      <el-table-column label="申请时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="审核时间" align="center" prop="reviewTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.reviewTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="auditPerson"> </el-table-column>

      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button
            v-throttle
            v-hasPermi="['system:baseEnterpriseInfo:audit']"
            v-if="scope.row.reviewStatus === '0'"
            type="primary"
            @click="handleEdit(scope.row, 'audit')"
            >审核</el-button
          >
          <el-button
            v-throttle
            v-hasPermi="['system:baseEnterpriseInfo:query']"
            v-if="scope.row.reviewStatus !== '0'"
            type="primary"
            @click="handleEdit(scope.row, 'view')"
            >查看</el-button
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
      :title="detailsDlgTitle"
      v-model="dlgDetailsVisible"
      :before-close="cancelDetailsDlg"
      :close-on-click-modal="isReadonly"
      :destroy-on-close="true"
      append-to-body
      width="80%"
    >
      <editDetails :id="selectID" :type="selectType" @refresh="refreshData" @cancel="cancelDetailsDlg" />
    </el-dialog>

    <el-dialog
      class="dialog-preview"
      :title="editDlgTitle"
      v-model="dlgEditVisible"
      :before-close="cancelEditDlg"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      append-to-body
      width="60%"
    >
      <el-form :model="formData" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="资质等级">
              <el-select v-model="formData.credentialLevel" placeholder="请选择资质等级" filterable clearable :disabled="!disabledIf">
                <el-option v-for="dict in plat_qualification_grade" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="信用等级">
              <el-select v-model="formData.creditLevel" placeholder="请选择信用等级" filterable clearable :disabled="!disabledIf">
                <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="cancelEditDlg">取 消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="submitEdit">保 存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { baseEnterpriseInfoList, enterpriseEdit } from '@/api/platform/enterprise/index';
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
const dlgDetailsVisible = ref(false);
const detailsDlgTitle = ref('');
const dlgEditVisible = ref(false);
const editDlgTitle = ref('企业编辑');
const isReadonly = ref(false);
const selectID = ref<string | number>('');
const selectType = ref<'view' | 'edit' | 'audit'>('view');

// 编辑表单
const formData = ref<{ credentialLevel: string | undefined | null; creditLevel: string | undefined | null }>({
  credentialLevel: '',
  creditLevel: ''
});
const disabledIf = ref(false);
const submitLoading = ref(false);

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
  if (type === 'edit') {
    // 打开编辑弹窗，仅修改资质等级与信用等级
    editDlgTitle.value = '企业编辑';
    formData.value.credentialLevel = row.credentialLevel ?? '';
    formData.value.creditLevel = row.creditLevel ?? '';
    disabledIf.value = true; // 允许编辑（模板里用 !disabledIf 控制禁用）
    dlgEditVisible.value = true;
    return;
  }
  // 其余类型走详情/审核弹窗
  selectType.value = type;
  isReadonly.value = type === 'view';
  detailsDlgTitle.value = type === 'audit' ? '企业审核' : '企业详情';
  dlgDetailsVisible.value = true;
};

// 关闭对话框
const cancelDetailsDlg = () => {
  dlgDetailsVisible.value = false;
};

const cancelEditDlg = () => {
  dlgEditVisible.value = false;
};

// 子组件刷新回调
const refreshData = () => {
  dlgDetailsVisible.value = false;
  getList();
};

// 提交编辑
const submitEdit = async () => {
  try {
    submitLoading.value = true;
    const payload = {
      id: selectID.value,
      credentialLevel: formData.value.credentialLevel,
      creditLevel: formData.value.creditLevel
    } as any;
    await enterpriseEdit(payload);
    proxy?.$modal?.msgSuccess?.('修改成功');
    dlgEditVisible.value = false;
    getList();
  } catch (e) {
    proxy?.$modal?.msgError?.('修改失败');
  } finally {
    submitLoading.value = false;
  }
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
