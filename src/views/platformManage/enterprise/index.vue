<template>
  <div class="p-2">
    <el-form ref="queryFormRef" :model="queryParams" :inline="true" v-if="showSearch">
      <el-form-item label="企业编码" prop="dictName">
        <el-input v-model="queryParams.dictName" placeholder="请输入字典名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="企业名称" prop="dictType">
        <el-input v-model="queryParams.dictType" placeholder="请输入字典类型" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="统一社会信用代码" prop="dictType" label-width="140px">
        <el-input v-model="queryParams.dictType" placeholder="请输入统一社会信用代码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="审核状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="审核状态" clearable>
          <el-option v-for="dict in plat_enterprise_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <!-- <el-form-item label="创建时间" style="width: 308px">
              <el-date-picker
                v-model="dateRange"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
              ></el-date-picker>
            </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <right-toolbar v-model:show-search="showSearch" @query-table="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" border :data="typeList">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="dictId" />
      <el-table-column label="企业编码" align="center" prop="dictName" />
      <el-table-column label="统一社会信用代码" align="center" prop="dictName"> </el-table-column>

      <el-table-column label="资质等级" align="center" prop="auditStatus">
        <template v-slot="scope">
          <dict-tag :options="plat_enterprise_status" :value="scope.row.auditStatus" />
        </template>
      </el-table-column>
      <el-table-column label="信用等级" align="center" prop="auditStatus">
        <template v-slot="scope">
          <dict-tag :options="plat_enterprise_status" :value="scope.row.auditStatus" />
        </template>
      </el-table-column>
      <el-table-column label="审核状态" align="center" prop="auditStatus">
        <template v-slot="scope">
          <dict-tag :options="plat_enterprise_status" :value="scope.row.auditStatus" />
        </template>
      </el-table-column>

      <el-table-column label="申请时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="审核时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip v-if="scope.row.auditStatus == 1" content="审核" placement="top">
            <el-button link type="primary" @click="handleRevise(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.auditStatus !== 1" content="查看" placement="top">
            <el-button link type="primary" @click="handleDetail(scope.row)"></el-button>
          </el-tooltip>
          <el-tooltip v-if="scope.row.auditStatus !== 1" content="编辑" placement="top">
            <el-button link type="primary" @click="handupdate(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    <!-- 详情 -->
    <el-dialog class="dialog-preview" :title="dialog.title" v-model="dialog.visible" width="80%">
      <editDetails :selID="dialog.id" @refresh="refreshData" @cancel="cancelDlg" />
    </el-dialog>
  </div>
</template>

<script setup name="Dict" lang="ts">
import { listType, getType, delType, addType, updateType, refreshCache } from '@/api/system/dict/type';
// 假设这些变量已在 script setup 中定义
import editDetails from '@/views/platformManage/enterprise/editDetails.vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { plat_enterprise_status } = toRefs<any>(proxy?.useDict('plat_enterprise_status'));

const typeList = ref([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<number | string>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
// 对话框
const dialog = reactive({
  title: '',
  visible: false,
  id: ''
});

const initFormData = {
  dictId: undefined,
  dictName: '',
  dictType: '',
  remark: '',
  status: ''
};
const data = reactive({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    status: '',
    dictName: '',
    dictType: ''
  },
  rules: {
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询字典类型列表 */
const getList = () => {
  loading.value = true;
  listType(proxy?.addDateRange(queryParams.value, dateRange.value)).then((res) => {
    typeList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};
/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};
/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
};
/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};
const handleRevise = (row: any) => {
  dialog.title = '审核';
  dialog.visible = true;
  dialog.id = row.dictId;
};
const handleDetail = (row: any) => {
  dialog.title = '详情';
  dialog.visible = true;
  dialog.id = row.dictId;
};
const handupdate = (row: any) => {
  dialog.title = '修改';
  dialog.visible = true;
  dialog.id = row.dictId;
};

// 弹框关闭并重新获取列表数据
const refreshData = () => {
  dialog.visible = false;
  getList();
};
// 弹框取消按钮
const cancelDlg = () => {
  dialog.visible = false;
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
::v-deep .el-dialog__header {
  background-color: rgba(45, 108, 245, 0.1);
  height: 48px;
  line-height: 18px;

  font-weight: bold;
  font-size: 16px;
  color: #171719;
  padding: 15px 20px;
}
::v-deep .el-dialog .el-dialog__body {
  padding: 40px 60px;
  margin-bottom: 150px;
}

::v-deep .dialog-preview .el-dialog .el-dialog__body {
  /* padding: 40px 60px; */
  margin-bottom: 150px;
  background: #f6f6f8;
}
</style>
