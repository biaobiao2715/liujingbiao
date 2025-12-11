<!--
  标题: enterprise/index.vue
  功能: 黑名单列表管理
  说明: 用于黑名单列表管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-13
-->
<template>
  <div class="p-2">
    <!-- <el-form ref="queryFormRef" :model="queryParams" label-width="120px" :inline="true">
      <el-form-item label="推送时间" prop="pushTime">
        <el-date-picker
          v-model="queryParams.pushTime"
          type="datetime"
          placeholder="选择日期与时间"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          :editable="false"
          :disabled-date="disableNonCurrentMonth"
          clearable
        />
      </el-form-item>
      <el-form-item label="间隔时间月" prop="creditLevel">
        <el-select v-model="queryParams.creditLevel" placeholder="审核状态" filterable clearable>
          <el-option v-for="dict in timeData" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleQuery">设置</el-button>
      </el-form-item>
    </el-form> -->

    <el-table v-loading="loading" :data="tableList" style="table-layout: fixed">
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column label="黑名单" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="信用等级" prop="creditLevel" align="center">
        <template #default="{ row }">
          <dict-tag :options="plat_credit_rating" :value="row.creditLevel ?? ''" />
        </template>
      </el-table-column>
      <el-table-column label="信用积分" prop="sore" />
      <el-table-column label="案件已结案数量" prop="caseCount" />
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
  </div>
</template>

<script setup name="Dict" lang="ts">
import { getBlackList } from '@/api/rightsPlatform/achiveManagement/credit/blacklist';

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
  pushTime: '',
  creditLevel: ''
});

const timeData = ref([
  { label: '1个月', value: '1' },
  { label: '3个月', value: '3' },
  { label: '6个月', value: '6' },
  { label: '12个月', value: '12' }
]);

/** 查询字典类型列表 */
const getList = () => {
  loading.value = true;
  getBlackList(queryParams.value).then((res) => {
    tableList.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
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

// 仅允许选择当前月份的日期
const disableNonCurrentMonth = (date: Date) => {
  const now = new Date();
  return date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth();
};

onMounted(() => {
  getList();
});
</script>
<style scoped lang="scss">
.p-2 {
  min-height: calc(100vh - 120px);
  padding: 24px;
}
</style>
