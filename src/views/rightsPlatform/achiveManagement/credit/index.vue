<!--
  标题: enterprise/index.vue
  功能: 信用列表管理
  说明: 用于信用列表管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-13
-->
<template>
  <div class="p-2">
    <el-form ref="queryFormRef" :model="queryParams" label-width="120px" :inline="true">
      <el-form-item label="供应商/企业" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入供应商/企业名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="信用等级" prop="creditLevel">
        <el-select v-model="queryParams.creditLevel" placeholder="审核状态" filterable clearable>
          <el-option v-for="dict in plat_credit_rating" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" border :data="tableList" style="table-layout: fixed">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="名称" align="center" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="信用等级" align="center" prop="creditLevel">
        <template #default="{ row }">
          <dict-text :options="plat_credit_rating" :value="row.creditLevel ?? ''" />
        </template>
      </el-table-column>
      <el-table-column label="信用积分" align="center" prop="sore" />
      <!-- <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column> -->
    </el-table>

    <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
  </div>
</template>

<script setup name="Dict" lang="ts">
import { getCreditRatingList } from '@/api/rightsPlatform/achiveManagement/credit';

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
  creditLevel: ''
});

/** 查询字典类型列表 */
const getList = () => {
  loading.value = true;
  getCreditRatingList(queryParams.value).then((res) => {
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
