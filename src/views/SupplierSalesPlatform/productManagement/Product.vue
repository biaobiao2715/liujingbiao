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
      <!-- 商品编码搜索框 -->
      <el-form-item label="商品编码" prop="goodsCode">
        <el-input v-model="queryParams.goodsCode" placeholder="请输入商品编码" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- 商品名称搜索框 -->
      <el-form-item label="商品名称" prop="goodsName">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- 商品状态下拉框 -->
      <el-form-item label="商品状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="审核状态" filterable clearable>
          <el-option label="全部" value="1" />
          <el-option label="已上架" value="2" />
          <el-option label="已下架" value="3" />
        </el-select>
      </el-form-item>
      <!-- 价格调整日期选择器 -->
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
      <!-- 查询和重置按钮 -->
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleAdd">新增商品</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleDelete">删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleShelf">上架</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleUnshelf">下架</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="handleExport">导出</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle type="primary" @click="onPriceHistory">查询价格调整历史</el-button>
      </el-col>
      <right-toolbar :show-search="showSearch" @query-table="getList"></right-toolbar>
    </el-row>

    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%" @selection-change="handleSelectionChange">
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
      <el-table-column label="销售价" align="center" prop="companyName" />
      <el-table-column label="商品类目" align="center" prop="goodsCategoryId" :show-overflow-tooltip="true"> </el-table-column>
      <el-table-column label="预警下限" align="center" prop="goodsAlert"> </el-table-column>
      <el-table-column label="提醒" align="center" prop="licenseNumber"> </el-table-column>
      <el-table-column label="商品状态" align="center" prop="status">
        <template v-slot="scope">
          <span>{{ getStatusText(scope.row.status) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <!-- 详情按钮 -->
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleDetails(scope.row)">详情</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleDetails(scope.row)">价格设定</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEC(scope.row)">复制商品</el-button>
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handleEdits(scope.row, 'view')">设置预警</el-button>
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
import { ref, getCurrentInstance, toRefs, onMounted } from 'vue';
import router from '@/router';
import { goodsList , goodsDelete, updateGoodsStatus } from '@/api/Supplier/productManagement/product';


const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 使用字典数据
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
  goodsCode: ''
});

// 表格数据
const tableData = ref([]);
// 总记录数
const total = ref(0);
// 加载状态
const loading = ref(true);
// 表单引用
const queryFormRef = ref();
// 日期范围
const dateRange = ref(['', '']);
// 是否显示搜索
const showSearch = ref(true);
const selectedIds = ref([]);// 选中的行ID数组
const selectedRows = ref([]);// 选中的行数据数组

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  goodsList(queryParams.value).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });
};

/** 查询按钮事件 */
const handleSearch = () => {
  console.log('查询表单数据:', queryParams.value);
  getList();
};

/** 查询价格调整历史 */
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
  selectedRows.value = selection;
};

// 删除按钮事件
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
        selectedRows.value = [];
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

// 上架按钮事件
const handleShelf = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要上架的商品');
    return;
  }
  
  // 检查选中的商品是否都是下架状态（上架操作只能对下架状态的商品进行）
  // 状态 '0' 表示上架，'1' 表示下架，所以上架操作需要检查状态不是 '0'
  const invalidRows = selectedRows.value.filter(row => row.status === '0');
  if (invalidRows.length > 0) {
    ElMessage.warning(`选中的商品中包含已上架的商品，无法重复上架`);
    return;
  }
  
  ElMessageBox.confirm(`确定要将选中的${selectedIds.value.length}个商品上架吗？`, '上架确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量上架 - 逐个调用API，传入单个对象
    const shelfPromises = selectedIds.value.map(id => 
      updateGoodsStatus({ id: id, status: '0' }) // 0表示上架
    );
    
    Promise.all(shelfPromises).then(results => {
      const successCount = results.filter(res => res.code === 200).length;
      if (successCount > 0) {
        ElMessage.success(`成功上架${successCount}个商品`);
        getList();
        // 清空选中状态
        selectedIds.value = [];
        selectedRows.value = [];
      }
      if (successCount < selectedIds.value.length) {
        ElMessage.warning(`部分上架失败，共上架${successCount}/${selectedIds.value.length}个商品`);
      }
    }).catch(error => {
      console.error('上架操作失败:', error);
      ElMessage.error('上架操作失败');
    });
  }).catch(() => {
    ElMessage.info('上架操作已取消');
  });
};

// 下架按钮事件
const handleUnshelf = () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请先选择要下架的商品');
    return;
  }
  
  // 检查选中的商品是否都是上架状态（下架操作只能对上架状态的商品进行）
  // 状态 '0' 表示上架，'1' 表示下架，所以下架操作需要检查状态是 '0'
  const invalidRows = selectedRows.value.filter(row => row.status !== '0');
  if (invalidRows.length > 0) {
    ElMessage.warning(`选中的商品中包含已下架的商品，无法重复下架`);
    return;
  }
  
  ElMessageBox.confirm(`确定要将选中的${selectedIds.value.length}个商品下架吗？`, '下架确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量下架 - 逐个调用API，传入单个对象
    console.log('下架操作，选中的商品IDs:', selectedIds.value);
    console.log('下架操作，选中的商品数据:', selectedRows.value);
    const unshelfPromises = selectedIds.value.map(id => {
      console.log(`下架商品ID: ${id}, 状态: 1`);
      return updateGoodsStatus({ id: id, status: '1' }); // 1表示下架
    });
    
    Promise.all(unshelfPromises).then(results => {
      const successCount = results.filter(res => res.code === 200).length;
      if (successCount > 0) {
        ElMessage.success(`成功下架${successCount}个商品`);
        getList();
        // 清空选中状态
        selectedIds.value = [];
        selectedRows.value = [];
      }
      if (successCount < selectedIds.value.length) {
        ElMessage.warning(`部分下架失败，共下架${successCount}/${selectedIds.value.length}个商品`);
      }
    }).catch(error => {
      console.error('下架操作失败:', error);
      ElMessage.error('下架操作失败');
    });
  }).catch(() => {
    ElMessage.info('下架操作已取消');
  });
};

//表格状态字典映射
const getStatusText = (status) => {
  const statusMap = {
    '0': '上架',
    '1': '下架',
  };
  return statusMap[status] || '';
};

const handleAdd = () => {
  router.push({ path: '/supplier/sales/product/edit' });
};

/** 查看详情 */
const handleDetails = (row: any) => {
  router.push({ path: '/supplier/sales/product/details', query: { id: row.id } });
};

/** 编辑商品 */
const handleEdits = (row: any, type: 'view' | 'edit' | 'audit') => {
  const path = '/supplier/sales/product/edit';
  router.push({
    path: path,
    query: {
      id: row.id,
      type
    }
  });
};

const handleEC = (row: any) => {
  const path = '/supplier/sales/product/edit';
  router.push({
    path: path,
    query: {
      copyid: row.id
    }
  });
};

const handleEdit = (row: any) => {
  router.push({
    path: '/supplier/sales/product/edit',
    query: {
      id: row.id
    }
  });
};

//导出按钮事件
const handleExport = () => {
  proxy?.download(
    '/grain-sales/goods/export', // 导出接口地址
    {
      ...queryParams.value // 传递查询参数
    },
    `goods_${new Date().getTime()}.xlsx` // 文件名格式
  );
};

const isPendingReview = (row) => {
  return row.reviewStatus == 0;
};

/** 判断是否已审核 */
const isReviewProcessed = (row) => {
  return !(row.reviewStatus == 0);
};

// 页面加载时获取列表数据
onMounted(() => {
  getList();
});

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
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
