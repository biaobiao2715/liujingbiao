<!--
  标题: enterprise/index.vue
  功能: 黑名单列表管理
  说明: 用于黑名单列表管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-13
-->
<template>
  <div class="p-2">
    <el-form ref="queryFormRef" :model="queryParams" label-width="120px" :inline="true">
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
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleQuery">搜索</el-button>
        <el-button v-throttle @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="tableList" style="table-layout: fixed">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="黑名单" align="center" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="信用等级" align="center" prop="creditLevel">
        <template #default="{ row }">
          <dict-text :options="plat_credit_rating" :value="row.creditLevel ?? ''" />
        </template>
      </el-table-column>
      <el-table-column label="信用积分" align="center" prop="sore" />
      <el-table-column label="推送时间" align="center" prop="sore" />
      <el-table-column label="案件已结案数量" align="center" prop="caseCount" />
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
  companyName: '',
  creditLevel: '',
  pushTime: ''
});

// 仅允许选择当前月份的日期
const disableNonCurrentMonth = (date: Date) => {
  const now = new Date();
  return date.getFullYear() !== now.getFullYear() || date.getMonth() !== now.getMonth();
};

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

onMounted(() => {
  getList();
});
</script>
<style scoped lang="scss">
.p-2 {
  padding: 24px;
}
</style>
