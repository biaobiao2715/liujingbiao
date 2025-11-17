<!-- 产品管理-信贷列表页 -->
<template>
  <div class="product-credit-manage">
    <!-- 搜索条件 -->
    <el-form
      v-show="showSearch"
      ref="queryFormRef"
      :model="queryParams"
      inline
      :label-width="100"
      class="search-form"
    >
      <el-form-item label="产品名称" prop="productName">
        <el-input
          v-model="queryParams.productName"
          placeholder="请输入产品名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="产品类型" prop="productType">
        <el-select
          v-model="queryParams.productType"
          placeholder="全部"
          clearable
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in prod_credit_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态" prop="productStatus">
        <el-select
          v-model="queryParams.productStatus"
          placeholder="全部"
          clearable
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="dict in product_status"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="适用对象" prop="applicableObject">
        <el-select
          v-model="queryParams.applicableObject"
          placeholder="全部"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="dict in applicable_object"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label-width="0">
        <el-button v-throttle type="primary" icon="Search" @click="handleQuery">查询</el-button>
        <el-button v-throttle icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作栏 -->
    <el-row :gutter="12" class="operation-bar">
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:creditProductsVersion:add']" type="primary" icon="Plus" @click="handleAdd">
          新增
        </el-button>
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table
      :data="tableData"
      border
      v-loading="loading"
      style="width: 100%"
      :default-sort="{ prop: 'createTime', order: 'descending' }"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="产品名称" align="center" prop="productName" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="产品简介" align="center" prop="productIntro" min-width="150" :show-overflow-tooltip="true" />
      <el-table-column label="适用对象" align="center" prop="applicableObject" width="150">
        <template #default="scope">
          <dict-tag :options="applicable_object" :value="typeof scope.row.applicableObject === 'string' ? scope.row.applicableObject.split(',') : scope.row.applicableObject" />
        </template>
      </el-table-column>
      <el-table-column label="产品类型" align="center" prop="productType" width="120">
        <template #default="scope">
          <dict-tag :options="prod_credit_type" :value="scope.row.productType" />
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="productStatus" width="100">
        <template #default="scope">
          <dict-tag :options="product_status" :value="scope.row.productStatus" />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" prop="createTime" min-width="160" sortable="custom" :sort-orders="['descending', 'ascending']">
        <template #default="scope">
          <span>{{ scope.row.createTime || '--' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="320" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button v-throttle v-hasPermi="['system:creditProductsVersion:query']" type="primary" @click="handleView(scope.row)">详情</el-button>
          <el-button v-throttle v-hasPermi="['system:creditProductsVersion:edit']" v-if="canEdit(scope.row)" type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-throttle v-hasPermi="['system:creditProductsVersion:edit']" v-if="canPublish(scope.row)" type="primary" @click="handlePublish(scope.row)">上架</el-button>
          <el-button v-throttle v-hasPermi="['system:creditProductsVersion:edit']" v-if="canOffline(scope.row)" type="primary" @click="handleOffline(scope.row)">下架</el-button>
          <el-button v-throttle v-hasPermi="['system:creditProductsVersion:remove']" v-if="canDelete(scope.row)" type="primary" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <pagination
        v-show="total > 0"
        :page="queryParams.pageNum"
        :limit="queryParams.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @update:page="handlePageChange"
        @update:limit="handlePageSizeChange"
        @pagination="getList"
      />
    </div>

    <!-- 新增/编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.type === 'add' ? '新增产品' : dialog.type === 'edit' ? '编辑产品' : '产品详情'"
      :width="dialog.type === 'view' ? '70%' : '60%'"
      destroy-on-close
      :close-on-click-modal="false"
    >
      <Suspense>
        <template #default>
          <component
            :is="dialog.type === 'view' ? ProductCreditDetail : ProductCreditFormDialog"
            :id="dialog.id"
            :type="dialog.type"
            @success="onDialogSuccess"
            @cancel="dialog.visible = false"
          />
        </template>
        <template #fallback>
          <el-skeleton :rows="6" animated />
        </template>
      </Suspense>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, getCurrentInstance, toRefs, defineAsyncComponent, Suspense, computed } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import { creditProductList, editCreditProduct, deleteCreditProduct } from '@/api/creditPlatform/productCreditManage';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
const isAdmin = computed(() => {
  const roles = userStore.roles || [];
  return roles.includes('admin') || roles.includes('Admin') || roles.includes('ADMIN') || roles.includes('superadmin');
});
// 判断是否为金融机构账号
const isFinancialInstitution = computed(() => {
  const roles = userStore.roles || [];
  return roles.some(role => 
    role === 'financial_institution' || 
    role === 'financial' || 
    role?.toLowerCase().includes('financial')
  );
});

const ProductCreditFormDialog = defineAsyncComponent(() => import('./ProductCreditFormDialog.vue'));
const ProductCreditDetail = defineAsyncComponent(() => import('./ProductCreditDetail.vue'));

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { prod_credit_type, applicable_object, product_status } = toRefs<any>(proxy?.useDict('prod_credit_type', 'applicable_object', 'product_status'));

interface CreditProduct {
  id?: number;
  productName?: string;
  productType?: string;
  applicableObject?: string;
  productStatus?: string;
  createTime?: string;
  [key: string]: any;
}

const showSearch = ref(true);
const loading = ref(false);
const queryFormRef = ref<FormInstance>();

const dialog = ref({
  visible: false,
  type: 'add' as 'add' | 'edit' | 'view',
  id: null as string | number | null
});







const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  productName: '',
  productType: '',
  productStatus: '',
  applicableObject: [] as string[],
  orderByColumn: 'createTime',
  isAsc: 'desc'
});

const tableData = ref<CreditProduct[]>([]);
const total = ref(0);

const handleSelectionChange = () => {
  // 预留选择功能
};

/** 获取列表 */
const getList = () => {
  loading.value = true;
  console.log('查询参数:', queryParams);
  creditProductList(queryParams).then((res) => {
    console.log('返回数据:', res);
    tableData.value = res.rows || [];
    total.value = res.total || 0;
    // 调试：打印产品状态以便排查
    if (res.rows && res.rows.length > 0) {
      console.log('产品状态示例:', res.rows[0].productStatus);
      console.log('当前用户角色:', userStore.roles);
      console.log('是否为管理员:', isAdmin.value);
      console.log('是否为金融机构:', isFinancialInstitution.value);
    }
    loading.value = false;
  }).catch((err) => {
    console.error('获取列表失败:', err);
    loading.value = false;
  });
};

// 搜索与重置
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields?.();
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.productName = '';
  queryParams.productType = '';
  queryParams.productStatus = '';
  queryParams.applicableObject = [];
  queryParams.orderByColumn = 'createTime';
  queryParams.isAsc = 'desc';
  handleQuery();
};

const handleSortChange = ({ prop, order }: { prop: string; order: string | null }) => {
  if (order) {
    queryParams.orderByColumn = prop;
    queryParams.isAsc = order === 'ascending' ? 'asc' : 'desc';
  } else {
    queryParams.orderByColumn = 'createTime';
    queryParams.isAsc = 'desc';
  }
  handleQuery();
};

// 判断是否可以上架
// 待上架(5)和下架(3/disabled)状态的产品可以进行上架操作
// 金融机构账号不可以进行上架操作，只可以进行下架操作
// 管理员可以进行上下架操作
const canPublish = (row: CreditProduct) => {
  const status = row.productStatus;
  // 只有待上架或下架状态的产品才能上架
  const canStatusPublish = status === '5' || status === 'pending' || status === 'waiting' || 
                          status === '3' || status === 'disabled' || status === 'draft';
  if (!canStatusPublish) return false;
  
  // 金融机构账号不能上架
  if (isFinancialInstitution.value) return false;
  
  // 管理员可以上架
  return isAdmin.value;
};

// 判断是否可以下架
// 上架状态的产品可以进行下架操作
// 金融机构账号和管理员都可以下架
const canOffline = (row: CreditProduct) => {
  const status = row.productStatus;
  // 只有上架状态的产品才能下架
  return status === '2' || status === 'enabled' || status === '1';
};

// 判断是否可以编辑
// 当状态为"下架、待上架"时可修改
const canEdit = (row: CreditProduct) => {
  const status = row.productStatus;
  return status === '3' || status === 'disabled' || status === '5' || status === 'pending' || status === 'waiting';
};

const canDelete = (row: CreditProduct) => {
  const status = row.productStatus;
  return status !== '2' && status !== 'enabled' && status !== '1';
};

const handleAdd = () => {
  dialog.value = { visible: true, type: 'add', id: null };
};

const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

const handleEdit = (row: CreditProduct) => {
  dialog.value = { visible: true, type: 'edit', id: row.id || null };
};

const handleView = (row: CreditProduct) => {
  dialog.value = { visible: true, type: 'view', id: row.id || null };
};

const handlePublish = (row: CreditProduct) => {
  ElMessageBox.confirm(`确认要上架「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const data = { ...row, productStatus: '2', optType: '2' };
      const response = await editCreditProduct(data);
      if (response && response.code === 200) {
        ElMessage.success('上架成功');
        getList();
      } else {
        ElMessage.error(response?.msg || '上架失败');
      }
    } catch (error) {
      ElMessage.error('上架失败，请稍后重试');
    }
  }).catch(() => {});
};

const handleOffline = (row: CreditProduct) => {
  ElMessageBox.confirm(`确认要下架「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const data = { ...row, productStatus: '3', optType: '2' };
      const response = await editCreditProduct(data);
      if (response && response.code === 200) {
        ElMessage.success('下架成功');
        getList();
      } else {
        ElMessage.error(response?.msg || '下架失败');
      }
    } catch (error) {
      ElMessage.error('下架失败，请稍后重试');
    }
  }).catch(() => {});
};

const handleDelete = (row: CreditProduct) => {
  ElMessageBox.confirm(`确认要删除「${row.productName}」吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const response = await deleteCreditProduct(row.id as number | string);
      if (response && response.code === 200) {
        ElMessage.success('删除成功');
        getList();
      } else {
        ElMessage.error(response?.msg || '删除失败');
      }
    } catch (error) {
      ElMessage.error('删除失败，请稍后重试');
    }
  }).catch(() => {});
};

const handlePageChange = (page: number) => {
  queryParams.pageNum = page;
  getList();
};

const handlePageSizeChange = (size: number) => {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  getList();
};

// 初始化
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.product-credit-manage {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #f7f8fa;
  min-height: calc(100vh - 120px);
}

.search-form {
  background: #fff;
  padding: 20px 24px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);

  .el-form-item {
    min-width: 260px;
    margin-bottom: 12px;
  }

  .el-form-item:last-child {
    margin-left: 0;
    min-width: auto;
    flex-shrink: 0;
  }
}

.operation-bar {
  background: #fff;
  padding: 12px 16px;
  border-radius: 8px;
  align-items: center;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);

  .el-button {
    width: 100%;
  }
}

.el-table {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);
}



.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 8px rgba(31, 45, 61, 0.08);
}
</style>
