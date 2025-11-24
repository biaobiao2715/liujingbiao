<!--
  标题: CreditApplication.vue
  功能: 信贷申请组件
  说明: 显示信贷申请的详细内容
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-22
-->
<template>
  <div class="credit-container">
    <div class="title flex-center gap-12">
      <img src="../../../../assets/images/finance/credit-icon.png" width="24" />
      <div>信贷申请管理</div>
    </div>

    <div class="content">
      <!-- 查询表单 -->
      <div class="search-form flex-between mb-24">
        <div class="form-item flex-center">
          <span class="form-label">产品类型：</span>
          <el-select v-model="queryParams.productType" placeholder="请选择" style="width: 240px">
            <el-option v-for="product in productList" :key="product.id" :label="product.productName" :value="product.id" />
          </el-select>
        </div>

        <div class="form-item flex-center gap-12">
          <el-button type="primary" :icon="Search" @click="fetchData">查询</el-button>
          <el-button type="info" :icon="Refresh" @click="resetQueryParams">重置</el-button>
        </div>
      </div>
      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading">
        <el-table-column prop="productName" label="产品名称" />
        <el-table-column prop="applyStatus" label="申请状态">
          <template #default="scope">
            <el-tag :type="ApplyStatus[scope.row.applyStatus].type">{{ ApplyStatus[scope.row.applyStatus].label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="applicationDate" label="申请时间" />
        <el-table-column prop="productIntro" label="产品简介" />
        <!-- 操作 -->
        <el-table-column label="操作" width="100">
          <template #default="scope">
            <el-button type="primary" size="small" link @click="handleDetail(scope.row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-if="queryParams.total > 0"
        v-model:total="queryParams.total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="fetchData"
      />
    </div>
    <!-- 详情组件 -->
    <!-- <ApplyForm :id="detailId" /> -->
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Delete, Edit, Search, Share, Upload, Refresh } from '@element-plus/icons-vue';
import { getLoanPersonalCenterList } from '@/api/financeFront/LoanProducts/index';
import ApplyForm from '../AboutLoanProductsComponents/ApplyForm.vue';
import { eventBus } from '@/utils/eventBus';
const tableData = ref([]);

const productList = ref([
  {
    id: '0',
    productName: '信贷产品'
  },
  {
    id: '99',
    productName: '其他'
  }
]);

// 申请状态 （0草稿 1待审核 2审批通过 3审批驳回 99取消申请）
const ApplyStatus = {
  '0': {
    label: '草稿',
    type: 'info'
  },
  '1': {
    label: '待审核',
    type: 'primary'
  },
  '2': {
    label: '审批通过',
    type: 'success'
  },
  '3': {
    label: '审批驳回',
    type: 'danger'
  },
  '99': {
    label: '取消申请',
    type: 'info'
  }
};

const loading = ref(false);

const detailId = ref<string>('');

const queryParams = ref({
  productType: '0',
  total: 0,
  pageNum: 1,
  pageSize: 10
});

onMounted(async () => {
  await fetchData();
});

// 模拟获取数据
const fetchData = async () => {
  try {
    loading.value = true;
    const res = await getLoanPersonalCenterList(queryParams.value);
    if (res.code === 200) {
      tableData.value = res.rows || [];
    }
  } catch (error) {
    console.error('获取信贷产品列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 重置查询参数
const resetQueryParams = () => {
  queryParams.value = {
    productType: '',
    total: 0,
    pageNum: 1,
    pageSize: 10
  };
  fetchData();
};

const handleDetail = (row) => {
  console.log(row);
  detailId.value = row.id;
  eventBus.emit('showComponentByCommand', { type: 'LoanProductsComponentApplyForm', id: row.id });
};
</script>

<style scoped lang="scss">
.content {
  padding: 20px;
}
.title {
  padding: 20px;
  font-weight: 500;
  font-size: 20px;
  color: #333333;
  border-bottom: 1px solid #d8d8d8;
}
</style>
