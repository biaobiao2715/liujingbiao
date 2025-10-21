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
        <el-select v-model="queryParams.reviewStatus" placeholder="审核状态" clearable>
          <el-option v-for="dict in review_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="入驻时间" prop="reviewTime">
        <el-date-picker v-model="queryParams.reviewTime" value-format="YYYY-MM-DD" type="date" placeholder="请选择日期"></el-date-picker>
      </el-form-item>

      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="企业名称" align="center" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="企业编码" align="center" prop="enterpriseNumber" width="210" style="color: #0000ff">
        <template #default="scope">
          <!-- <span @click="handleEdit(scope.row, 'view')" style="color: #0000ff">{{ scope.row.enterpriseNumber }}</span> -->
          <router-link :to="'/platform/enterprise/editDetails/?id=' + scope.row.id + '&type=view'" class="link-type">
            <span>{{ scope.row.enterpriseNumber }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="统一社会信用代码" align="center" prop="licenseNumber" width="210"> </el-table-column>
      <el-table-column label="审核状态" align="center" prop="reviewStatus">
        <template v-slot="scope">
          <dict-tag :options="review_status" :value="scope.row.reviewStatus" />
        </template>
      </el-table-column>
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
      <el-table-column label="审核人" align="center" prop="reviewBy"> </el-table-column>

      <el-table-column label="操作" align="center" width="160" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle v-if="isPendingReview(scope.row)" type="primary" @click="handleEdit(scope.row, 'audit')">审核</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'view')">查看</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'edit')">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router';
import { ref } from 'vue';
import { baseEnterpriseInfoList } from '@/api/platform/enterprise/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status, plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: '',
  reviewTime: '',
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
const dateRange = ref(['', '']);

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  baseEnterpriseInfoList(queryParams.value).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

// 查询按钮事件
const handleSearch = () => {
  console.log('查询表单数据:', queryParams.value);
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

// 编辑按钮事件
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  console.log('编辑:', row, type);
  // TODO: 跳转编辑页面或弹出编辑弹窗携带type参数
  router.push({
    path: '/platform/enterprise/editDetails',
    query: {
      id: row.id,
      type
    }
  });
};

const isPendingReview = (row) => {
  return row.reviewStatus == 0;
};

const isReviewProcessed = (row) => {
  return !(row.reviewStatus == 0);
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
