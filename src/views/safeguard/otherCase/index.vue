<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div v-show="showSearch" class="mb-[10px]">
        <el-card shadow="hover" style="background: none; border: none">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true" :label-width="130">
            <el-form-item label="其他渠道案件名称" prop="caseName">
              <el-input v-model="queryParams.caseName" placeholder="请输入其他渠道案件名称" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item label="创建时间" prop="createTime">
              <el-date-picker v-model="queryParams.createTime" type="datetime" placeholder="选择创建时间" value-format="YYYY-MM-DD HH:mm:ss" />
            </el-form-item>
            <el-form-item label="创建人" prop="createByName">
              <el-input v-model="queryParams.createByName" placeholder="请输入创建人" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
              <el-button type="primary" icon="Refresh" @click="resetQuery">重置</el-button>
            </el-form-item>
            <br />
            <el-form-item>
              <el-button class="no-hover-effect" type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['safeguard:otherCase:add']"
                >新增</el-button
              >
              <el-button
                class="no-hover-effect"
                type="danger"
                plain
                icon="Delete"
                :disabled="multiple"
                @click="handleDelete()"
                v-hasPermi="['safeguard:otherCase:remove']"
              >
                删除
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
    </transition>

    <el-card shadow="never" style="background: none; border: none; margin-top: -40px">
      <el-table v-loading="loading" border :data="otherCaseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column label="其他渠道案件名称" align="center" prop="caseName" />
        <el-table-column label="链接地址" align="center" prop="linkAddress" />
        <el-table-column label="创建时间" align="center" prop="createTime" />
        <el-table-column label="创建人" align="center" prop="createByName" />
        <el-table-column label="操作" align="center" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" @click="handleUpdate(scope.row)" v-hasPermi="['safeguard:otherCase:edit']">编辑</el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" @click="handleDelete(scope.row)" v-hasPermi="['safeguard:otherCase:remove']">删除</el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total > 0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改其他渠道案件对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="otherCaseFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="案件名称" prop="caseName">
          <el-input v-model="form.caseName" placeholder="请输入案件名称" />
        </el-form-item>
        <el-form-item label="链接地址" prop="linkAddress">
          <el-input v-model="form.linkAddress" placeholder="请输入链接地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OtherCase" lang="ts">
import { ElMessageBox } from 'element-plus';
import { listOtherCase, getOtherCase, delOtherCase, addOtherCase, updateOtherCase } from '@/api/safeguard/otherCase';
import { OtherCaseVO, OtherCaseQuery, OtherCaseForm } from '@/api/safeguard/otherCase/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const otherCaseList = ref<OtherCaseVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const otherCaseFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: OtherCaseForm = {
  id: undefined,
  linkAddress: undefined,
  caseName: undefined
};
const data = reactive<PageData<OtherCaseForm, OtherCaseQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    linkAddress: undefined,
    caseName: undefined,
    params: {}
  },
  rules: {
    id: [{ required: true, message: 'id不能为空', trigger: 'blur' }],
    caseName: [
      { required: true, message: '案件名称不能为空', trigger: 'blur' },
      { min: 1, max: 25, message: '长度应在 1-25个字符内', trigger: 'blur' }
    ],
    linkAddress: [
      { required: true, message: '链接地址不能为空', trigger: 'blur' },
      { min: 1, max: 125, message: '长度应在 1-125 个字符内', trigger: 'blur' }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询其他渠道案件列表 */
const getList = async () => {
  loading.value = true;
  const res = await listOtherCase(queryParams.value);
  otherCaseList.value = res.rows;
  total.value = res.total;
  loading.value = false;
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  form.value = { ...initFormData };
  otherCaseFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: OtherCaseVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '新增渠道案件';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: OtherCaseVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  const res = await getOtherCase(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = '编辑渠道案件';
};

/** 提交按钮 */
const submitForm = () => {
  otherCaseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateOtherCase(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addOtherCase(form.value).finally(() => (buttonLoading.value = false));
      }
      proxy?.$modal.msgSuccess('操作成功');
      dialog.visible = false;
      await getList();
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: OtherCaseVO) => {
  const _ids = row?.id || ids.value;
  await ElMessageBox.confirm('是否确认删除？', '操作确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).finally(() => (loading.value = false));
  await delOtherCase(_ids);
  proxy?.$modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download(
    'system/otherCase/export',
    {
      ...queryParams.value
    },
    `otherCase_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
// 禁用新增和删除按钮的hover变色效果
.no-hover-effect {
  &:hover {
    // 保持正常状态的颜色，不变成绿色或其他颜色
    background-color: inherit !important;
    border-color: inherit !important;
    color: inherit !important;
  }

  // plain primary按钮：hover时保持原色（不变成绿色）
  &.is-plain.el-button--primary:hover {
    background-color: var(--el-color-primary-light-9) !important;
    border-color: var(--el-color-primary-light-5) !important;
    color: var(--el-color-primary) !important;
  }

  // plain danger按钮：hover时保持原色（不变成绿色）
  &.is-plain.el-button--danger:hover {
    background-color: var(--el-color-danger-light-9) !important;
    border-color: var(--el-color-danger-light-5) !important;
    color: var(--el-color-danger) !important;
  }
}
</style>
