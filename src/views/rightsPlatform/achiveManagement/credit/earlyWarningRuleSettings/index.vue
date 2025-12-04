<!--
  标题: enterprise/index.vue
  功能: 设置预警规则管理
  说明: 用于设置预警规则管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-13
-->
<template>
  <div class="p-2">
    <!-- 查询条件 -->
    <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-position="left">
      <el-form-item label="预警规则" prop="ruleName" label-width="auto">
        <el-input v-model="queryParams.ruleName" placeholder="请输入预警规则名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="信用等级" prop="creditRatingId" label-width="auto">
        <el-select v-model="queryParams.creditRatingId" placeholder="请选择信用等级" clearable>
          <el-option v-for="d in plat_credit_rating" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="预警状态" prop="status" label-width="auto">
        <el-select v-model="queryParams.status" placeholder="请选择预警状态" clearable>
          <el-option v-for="d in warn_rule_status" :key="d.value" :label="d.label" :value="d.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle v-hasPermi="['safeguard:warnRule:list']" icon="Search" type="primary" @click="handleQuery">查询</el-button>
        <el-button v-throttle v-hasPermi="['safeguard:warnRule:list']" icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle icon="Plus" type="primary" @click="handleAdd" v-hasPermi="['safeguard:warnRule:add']">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          :color="multiple ? '#F2F3F5' : '#108C58'"
          :style="multiple ? 'color: #1d2129;' : 'color: #fff;'"
          @click="handleBatchStatus('0')"
          v-hasPermi="['safeguard:warnRule:enableAndDisabled']"
          >启用</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          :style="multiple ? 'color: #1d2129;' : 'color: #fff;'"
          :color="multiple ? '#F2F3F5' : '#108C58'"
          @click="handleBatchStatus('1')"
          v-hasPermi="['safeguard:warnRule:enableAndDisabled']"
          >禁用</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button
          v-throttle
          :style="multiple ? 'color: #1d2129;' : 'color: #fff;'"
          :color="multiple ? '#F2F3F5' : '#F23255'"
          @click="handleDelete()"
          v-hasPermi="['safeguard:warnRule:remove']"
          >删除</el-button
        >
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="dataList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column label="预警规则名称" prop="ruleName" />
      <el-table-column label="信用等级" prop="creditRatingId" align="center">
        <template #default="scope">
          <dict-tag :options="plat_credit_rating" :value="scope.row.creditRatingId" />
        </template>
      </el-table-column>
      <el-table-column label="预警值" prop="warnValue" />
      <el-table-column label="所属状态" prop="status" align="center">
        <template #default="scope">
          <dict-tag :options="warn_rule_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="操作" width="220">
        <template #default="scope">
          <el-button v-throttle link type="primary" @click="handleEdit(scope.row)" v-hasPermi="['safeguard:warnRule:edit']">修改</el-button>
          <el-button v-throttle link type="primary" @click="handleView(scope.row)" v-hasPermi="['safeguard:warnRule:query']">查看</el-button>
          <el-button v-throttle link type="primary" @click="toggleStatus(scope.row)" v-hasPermi="['safeguard:warnRule:enableAndDisabled']">{{
            scope.row.status == '0' ? '禁用' : '启用'
          }}</el-button>
          <!-- 行内删除按钮改为统一方法 -->
          <el-button v-throttle link type="primary" @click="handleDelete(scope.row)" v-hasPermi="['safeguard:warnRule:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 合并后的新增/编辑/查看弹窗（查看态与新增/编辑同款表单） -->
    <el-dialog v-model="dialog.visible" :title="dialogTitle" width="600px" append-to-body>
      <el-form ref="dataFormRef" :model="form" :rules="rules" label-width="120px" :disabled="dialog.mode === 'view'">
        <el-form-item label="预警规则名称" prop="ruleName">
          <el-input v-model="form.ruleName" placeholder="请输入规则名称" :maxlength="30" show-word-limit clearable />
        </el-form-item>

        <el-form-item label="信用等级" prop="creditRatingId">
          <el-select v-model="form.creditRatingId" placeholder="请选择信用等级" clearable>
            <el-option v-for="d in plat_credit_rating" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="预警值" prop="warnValue">
          <el-input-number v-model="form.warnValue" :min="0" />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态" clearable>
            <el-option v-for="d in warn_rule_status" :key="d.value" :label="d.label" :value="d.value" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="flex-center-end">
        <el-button v-throttle @click="cancel">取 消</el-button>
        <el-button v-if="dialog.mode !== 'view'" v-throttle type="primary" @click="submitForm">确 认</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="EarlyWarningRule" lang="ts">
import { ref, reactive, toRefs, onMounted, getCurrentInstance, ComponentInternalInstance, computed } from 'vue';
import {
  initForm,
  listWarnRule,
  getWarnRule,
  addWarnRule,
  updateWarnRule,
  delWarnRule,
  enableAndDisabledWarnRule,
  EarlyWarningRuleQuery,
  EarlyWarningRuleForm,
  EarlyWarningRuleVO
} from '@/api/rightsPlatform/achiveManagement/credit/earlyWarningRuleSettings';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { plat_credit_rating, warn_rule_status } = toRefs<any>(proxy?.useDict('plat_credit_rating', 'warn_rule_status'));

const loading = ref(false);
const dataList = ref<EarlyWarningRuleVO[]>([]);
const total = ref(0);
const ids = ref<(number | string)[]>([]);
const multiple = ref(true);
// 新增：保存选中行，用于状态校验
const selectedRows = ref<EarlyWarningRuleVO[]>([]);

const queryParams = reactive<EarlyWarningRuleQuery>({
  pageNum: 1,
  pageSize: 10,
  ruleName: '',
  creditRatingId: '',
  status: ''
});

const queryFormRef = ref<any>(null);
const dataFormRef = ref<any>(null);

const form = ref<EarlyWarningRuleForm>({ ...initForm });
// 表单校验：名称增加长度限制
const rules = {
  ruleName: [
    { required: true, message: '规则名称不能为空', trigger: 'blur' },
    { min: 1, max: 30, message: '长度应在 1-30 个字符内', trigger: 'blur' }
  ],
  creditRatingId: [{ required: true, message: '信用等级不能为空', trigger: 'change' }],
  warnValue: [{ required: true, message: '预警值不能为空', trigger: 'blur' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
};

const dialog = reactive<{ visible: boolean; title: string; mode: 'create' | 'edit' | 'view' }>({
  visible: false,
  title: '',
  mode: 'create'
});
const dialogTitle = computed(() => (dialog.mode === 'create' ? '新增预警规则设置' : dialog.mode === 'edit' ? '修改预警规则设置' : '预警规则详情'));

// 表格
const getList = async () => {
  loading.value = true;
  const res = await listWarnRule(queryParams);
  dataList.value = res.rows || [];
  total.value = res.total || 0;
  loading.value = false;
};

// 查询/重置
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.pageNum = 1;
  getList();
};

function normalizeCreditRatingId(id: unknown): string {
  return id == null ? '' : String(id);
}

// 新增/编辑/查看
const handleAdd = () => {
  form.value = { ...initForm };
  dialog.mode = 'create';
  setTimeout(() => dataFormRef.value?.clearValidate(), 100);
  dialog.visible = true;
};
const handleEdit = async (row: EarlyWarningRuleVO) => {
  const res = await getWarnRule(row.id!);
  const data = res?.data || row;
  form.value = {
    ...data,
    creditRatingId: normalizeCreditRatingId(data.creditRatingId)
  };
  dialog.mode = 'edit';
  dialog.visible = true;
};
const handleView = async (row: EarlyWarningRuleVO) => {
  const res = await getWarnRule(row.id!);
  const data = res?.data || row;
  form.value = {
    ...data,
    creditRatingId: normalizeCreditRatingId(data.creditRatingId)
  };
  dialog.mode = 'view';
  dialog.visible = true;
};

// 提交
const submitForm = () => {
  dataFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    form.value.id ? await updateWarnRule(form.value) : await addWarnRule(form.value);
    proxy?.$modal.msgSuccess('操作成功');
    dialog.visible = false;

    getList();
  });
};

// 选择
const handleSelectionChange = (rows: EarlyWarningRuleVO[]) => {
  ids.value = rows.map((r) => r.id!);
  selectedRows.value = rows; // 新增
  multiple.value = !rows.length;
};

// 合并后的批量状态更新（target: '0' 启用 | '1' 禁用）
const handleBatchStatus = async (target: '0' | '1') => {
  if (!ids.value.length) {
    proxy?.$modal.msgWarning('请先选择数据');
    return;
  }

  let invalid: EarlyWarningRuleVO[] = [];
  let warnMsg = '';

  if (target === '1') {
    // 禁用前校验：仅允许禁用当前为启用(0)的数据
    invalid = selectedRows.value.filter((r) => r.status !== '0');
    // 优化提示：更简洁
    warnMsg = '只能禁用已启用的数据，请重新选择。';
  } else {
    // 启用前校验：仅允许启用当前为禁用(1)的数据
    invalid = selectedRows.value.filter((r) => r.status !== '1');
    // 优化提示：更简洁
    warnMsg = '只能启用已禁用的数据，请重新选择。';
  }

  if (invalid.length) {
    proxy?.$modal.msgWarning(warnMsg);
    return;
  }

  const tip = target === '0' ? '确认启用选中数据?' : '确认禁用选中数据?';
  await proxy?.$modal.confirm(tip);
  await enableAndDisabledWarnRule({ ids: ids.value, params: { status: target } });
  proxy?.$modal.msgSuccess(target === '0' ? '已启用' : '已禁用');
  getList();
};

// 删除（单个/批量合一）
const handleDelete = async (row?: EarlyWarningRuleVO) => {
  const targetIds = row ? [row.id!] : ids.value;
  if (!targetIds?.length) {
    proxy?.$modal.msgWarning('请先选择数据');
    return;
  }
  const tip = row ? `确认删除规则 "${row.ruleName}" ?` : '确认删除选中规则?';
  await proxy?.$modal.confirm(tip);
  await delWarnRule(targetIds);
  proxy?.$modal.msgSuccess('删除成功');
  getList();
};

// 单行切换状态（根据当前状态取反）
const toggleStatus = async (row: EarlyWarningRuleVO) => {
  const next = row.status === '0' ? '1' : '0';
  const tip = next === '0' ? '确认启用该数据?' : '确认禁用该数据?';
  await proxy?.$modal.confirm(tip);
  await enableAndDisabledWarnRule({ ids: row.id!, params: { status: next } });
  proxy?.$modal.msgSuccess(next === '0' ? '已启用' : '已禁用');
  getList();
};

// 取消/关闭
const cancel = () => {
  dialog.visible = false;
  if (dialog.mode !== 'view') {
    dataFormRef.value?.resetFields();
    form.value = { ...initForm };
  }
};

onMounted(getList);

// 行内操作按钮配置（前三个直显，超出收“更多”）
const getRowActions = (row: EarlyWarningRuleVO) => {
  const actions = [
    { key: 'edit', label: '修改', permi: ['safeguard:warnRule:edit'], onClick: (r: any) => handleEdit(r) },
    { key: 'view', label: '查看', permi: ['safeguard:warnRule:query'], onClick: (r: any) => handleView(r) },
    // 根据当前状态展示启用或禁用
    String(row.status) === '0'
      ? { key: 'disable', label: '禁用', permi: ['safeguard:warnRule:enableAndDisabled'], onClick: (r: any) => toggleStatus(r) }
      : { key: 'enable', label: '启用', permi: ['safeguard:warnRule:enableAndDisabled'], onClick: (r: any) => toggleStatus(r) },
    { key: 'delete', label: '删除', permi: ['safeguard:warnRule:remove'], onClick: (r: any) => handleDelete(r) }
  ];
  return actions;
};
</script>

<style scoped lang="scss">
.p-2 {
  height: calc(100vh - 120px);
  padding: 24px;
}
.mb8 {
  margin-bottom: 8px;
}
.help-txt {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
