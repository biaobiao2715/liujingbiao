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
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="商品编码" prop="goodsCode">
        <el-input v-model="queryParams.goodsCode" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="商品状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="审核状态" filterable clearable>
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
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleAdd">新增商品</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleSearch">上架</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleSearch">下架</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleExport">导出</el-button>
      </el-col>

      <!-- <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleSearch">价格设定</el-button>
      </el-col> -->

      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="onPriceHistory">查询价格调整历史</el-button>
      </el-col>
      <right-toolbar :show-search="showSearch" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange" >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="商品名称" align="center" prop="goodsName" :show-overflow-tooltip="true" />
      <el-table-column label="商品编码" align="center" prop="goodsCode" width="220" style="color: #0000ff">
        <template #default="scope">
          <router-link :to="'/supplier/sales/product/details/?id=' + scope.row.id + '&type=view'" class="link-type">
            <span>{{ scope.row.goodsCode }}</span>
          </router-link>
        </template>
      </el-table-column>
      <el-table-column label="销售价" align="center" prop="companyName" :show-overflow-tooltip="true" />
      <el-table-column label="商品类目" align="center" prop="goodsCategoryId" width="210"> </el-table-column>
      <el-table-column label="预警下限" align="center" prop="goodsAlert" width="210"> </el-table-column>
      <el-table-column label="提醒" align="center" prop="licenseNumber" width="210"> </el-table-column>
      <el-table-column label="商品状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :options="review_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="360" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleDetails(scope.row)">详情</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleDetails(scope.row)">价格设定</el-button>
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
import { goodsList , goodsDelete } from '@/api/Supplier/productManagement/product';


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
  goodsCategoryId: '',
  goodsName: '',
  goodsCode: '',
  enterpriseType: '1'
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
const dateRange = ref(['', '']);
const showSearch = ref(true);
const selectedIds = ref([]);// 选中的行ID数组

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  goodsList(queryParams.value).then((res) => {
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
  router.push({ path: '/company/sales/company/goods/productPrice' });
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

// 表格选择变化事件
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id);
};

// 删除按钮事件 - 修改为支持批量删除
const handleDelete = () => {
  // 批量删除 - 使用选中的行
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要删除的商品');
    return;
  }
  
  ElMessageBox.confirm(`确定要删除选中的${selectedIds.value.length}个商品吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量删除 - 逐个调用删除接口
    const deletePromises = selectedIds.value.map(id => goodsDelete(id));
    
    Promise.all(deletePromises).then(results => {
      const successCount = results.filter(res => res.code === 200).length;
      if (successCount > 0) {
        ElMessage.success(`成功删除${successCount}个商品`);
        getList();
        // 清空选中状态
        selectedIds.value = [];
      }
      if (successCount < selectedIds.value.length) {
        ElMessage.warning(`部分删除失败，共删除${successCount}/${selectedIds.value.length}个商品`);
      }
    }).catch(error => {
      ElMessage.error('删除操作失败');
    });
  }).catch(() => {
    ElMessage.info('删除操作已取消');
  });
};

const handleAdd = () => {
  router.push({ path: '/supplier/sales/product/edit' });
};

const handleDetails = (row: any) => {
  router.push({ path: '/supplier/sales/product/details', query: { id: row.id } });
};
// 编辑按钮事件
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  const path = '/supplier/sales/product/edit';
  router.push({
    path: path,
    query: {
      id: row.id,
      type
    }
  });
};


//导出按钮事件
const handleExport = () => {
  proxy?.download(
    '/grain-sales/goods/export',  // 导出接口地址
    {
      ...queryParams.value        // 传递查询参数
    },
    `goods_${new Date().getTime()}.xlsx`  // 文件名格式
  );
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
