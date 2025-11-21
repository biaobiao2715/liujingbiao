<!--
  标题: enterprise/index.vue
  功能: 信用等级积分管理
  说明: 用于信用等级积分管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-13
-->
<template>
  <div class="p-2">
    <el-form ref="queryFormRef" :model="queryParams" label-width="120px" :inline="true">
      <el-form-item label="信用等级" prop="creditRatingId">
        <el-select v-model="queryParams.creditRatingId" placeholder="审核状态" filterable clearable>
          <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleQuery">搜索</el-button>
        <el-button v-throttle @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="tableList" style="table-layout: fixed">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="信用等级" align="center" prop="creditRatingId">
        <template #default="{ row }">
          <dict-text :options="plat_credit_rating" :value="row.creditRatingId ?? ''" />
        </template>
      </el-table-column>
      <el-table-column label="信用积分" align="center" prop="creditMinPoints">
        <template #default="{ row }"> {{ row.creditMinPoints }} - {{ row.creditMaxPoints }} </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle v-hasPermi="['safeguard:creditRating:edit']" type="primary" @click="openSetDialog(scope.row)">设置</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />

    <!-- 设置信用等级积分弹窗 -->
    <el-dialog v-model="dialog.visible" title="设置信用等级积分" width="560px" @closed="resetForm">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" class="score-form">
        <el-form-item label="信用等级：" prop="creditRatingId">
          <el-select v-model="form.creditRatingId" placeholder="请选择信用等级" disabled filterable clearable>
            <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="信用积分范围：" prop="range">
          <div class="range-wrapper">
            <el-input v-model.number="form.creditMinPoints" type="number" min="0" max="100" placeholder="请输入最低信用积分" style="width: 180px" />
            <span class="split">-</span>
            <el-input v-model.number="form.creditMaxPoints" type="number" min="0" max="100" placeholder="请输入最高信用积分" style="width: 180px" />
          </div>
          <!-- 删除自定义错误展示，使用内置校验提示 -->
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialog.visible = false">取 消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="dialog.loading">确 认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dict" lang="ts">
import { getCreditRatingPointsList, getCreditRating, updateCreditRating } from '@/api/rightsPlatform/achiveManagement/credit/creditRatingPoints';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { plat_credit_rating } = toRefs<any>(proxy?.useDict('plat_credit_rating'));

const tableList = ref([]);
const loading = ref(true);
const total = ref(0);
const queryFormRef = ref<ElFormInstance>();

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  creditRatingId: ''
});

// 弹窗状态
const dialog = reactive({
  visible: false,
  loading: false
});

const formRef = ref<ElFormInstance>();
const form = ref({
  creditRatingId: '' as string | number,
  creditMinPoints: null as number | null,
  creditMaxPoints: null as number | null
});

/** 查询字典类型列表 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await getCreditRatingPointsList(queryParams.value);
    tableList.value = res.rows;
    total.value = res.total;
  } catch (e) {
    ElMessage.error('列表加载失败');
  } finally {
    loading.value = false;
  }
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

// 打开弹窗
const openSetDialog = async (row: any) => {
  const res = await getCreditRating(row.id);
  form.value = res.data;
  setTimeout(() => formRef.value?.clearValidate(), 100);
  dialog.visible = true;
};
// 合并校验逻辑
const rules = {
  range: [
    {
      validator: (_: any, __: any, cb: any) => {
        const { creditMinPoints, creditMaxPoints } = form.value;
        const isEmpty = (v: any) => v === '' || v === null || v === undefined;
        if (isEmpty(creditMinPoints) && isEmpty(creditMaxPoints)) return cb(new Error('请填写信用积分范围'));
        if (isEmpty(creditMinPoints)) return cb(new Error('请填写最低信用积分'));
        if (isEmpty(creditMaxPoints)) return cb(new Error('请填写最高信用积分'));
        const nMin = Number(creditMinPoints);
        const nMax = Number(creditMaxPoints);
        if (!Number.isInteger(nMin) || !Number.isInteger(nMax)) return cb(new Error('积分需为整数'));
        if (nMin < 0 || nMax < 0) return cb(new Error('积分不能小于0'));
        if (nMin > 100 || nMax > 100) return cb(new Error('积分不能大于100'));
        if (nMin > nMax) return cb(new Error('最低值不可大于最高值'));
        cb();
      },
      trigger: ['change', 'blur']
    }
  ]
};

// 提交
async function handleSubmit() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    dialog.loading = true;
    try {
      await updateCreditRating({ ...form.value });
      ElMessage.success('设置成功');
      handleQuery();
      dialog.visible = false;
    } catch {
      ElMessage.error('设置失败');
    } finally {
      dialog.loading = false;
    }
  });
}

// 重置
function resetForm() {
  formRef.value?.resetFields();
  formRef.value?.clearValidate();
  dialog.loading = false;
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.p-2 {
  padding: 24px;
}
.range-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
