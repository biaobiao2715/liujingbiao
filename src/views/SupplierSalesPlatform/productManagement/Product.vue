<!--
  标题: enterprise/index.vue
  功能: 商品管理
  说明: 用于商品管理，包括查询、添加、编辑、删除等操作
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="商品编码" prop="enterpriseNumber">
        <el-input v-model="queryParams.enterpriseNumber" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称" prop="companyName">
        <el-input v-model="queryParams.companyName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品状态" prop="reviewStatus">
        <el-select v-model="queryParams.reviewStatus" placeholder="审核状态" filterable clearable>
          <el-option label="全部" value="1" />
          <el-option label="已上架" value="2" />
          <el-option label="已下架" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="价格调整日期">
        <el-date-picker
          v-model="queryParams.reviewTime"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator=" - "
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleAdd">新增商品</el-button>
        <el-button v-throttle type="primary" @click="handleSearch">删除</el-button>
        <el-button v-throttle type="primary" @click="handleSearch">上架</el-button>
        <el-button v-throttle type="primary" @click="handleSearch">下架</el-button>
        <el-button v-throttle type="primary" @click="handleSearch">导出</el-button>
        <el-button v-throttle type="primary" @click="handleSearch">价格设定</el-button>
        <el-button v-throttle type="primary" @click="onPriceHistory">查询价格调整历史</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="商品名称" align="center" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="商品编码" align="center" prop="enterpriseNumber" width="210" style="color: #0000ff">
        <template #default="scope">
          <!-- <span @click="handleEdit(scope.row, 'view')" style="color: #0000ff">{{ scope.row.enterpriseNumber }}</span> -->
          <router-link :to="'/supplier/sales/product/details/?id=' + scope.row.id + '&type=view'" class="link-type">
            <span>{{ scope.row.enterpriseNumber }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="销售价" align="center" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="商品类目" align="center" prop="licenseNumber" width="210"> </el-table-column>
      <el-table-column label="预警下限" align="center" prop="licenseNumber" width="210"> </el-table-column>
      <el-table-column label="提醒" align="center" prop="licenseNumber" width="210"> </el-table-column>
      <el-table-column label="商品状态" align="center" prop="reviewStatus">
        <template v-slot="scope">
          <dict-tag :options="review_status" :value="scope.row.reviewStatus" />
        </template>
      </el-table-column>

      <!-- <el-table-column label="资质等级" align="center" prop="credentialLevel">
        <template v-slot="scope">
          <dict-tag :options="plat_qualification_grade" :value="scope.row.credentialLevel" />
        </template>
      </el-table-column>
      <el-table-column label="信用等级" align="center" prop="creditLevel">
        <template v-slot="scope">
          <dict-tag :options="plat_credit_rating" :value="scope.row.creditLevel" />
        </template>
      </el-table-column> -->

      <el-table-column label="发布时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <!-- <el-table-column label="审核时间" align="center" prop="reviewTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.reviewTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="审核人" align="center" prop="reviewBy"> </el-table-column> -->

      <el-table-column label="操作" align="center" width="360" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'view')">详情</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'edit')">编辑</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'view')">复制商品</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row, 'view')">设置预警</el-button>
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
import { on } from 'events';

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
// 查询价格调整历史
const onPriceHistory = () => {
  // router.push({ path: '/supplier/sales/product/price-history' });
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

const handleAdd = () => {
  router.push({ path: '/supplier/sales/product/edit' });
};

// 编辑按钮事件
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  const path = type === 'view' ? '/supplier/sales/product/details' : '/supplier/sales/product/edit';
  router.push({
    path: path,
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
