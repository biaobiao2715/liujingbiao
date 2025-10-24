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
          <el-button v-throttle v-if="isReviewProcessed(scope.row)" type="primary" @click="handlePriceSetting(scope.row)">价格设定</el-button>
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

    <!-- 价格设定弹窗 -->
    <el-dialog
      v-model="priceDialogVisible"
      title="价格修改"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="price-dialog-content">
        <!-- 商品基本信息 -->
        <div class="product-basic-info">
          <div class="info-row">
            <div class="info-item">
              <span class="label">商品名称：</span>
              <span class="value">{{ currentProduct.goodsName || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">商品编码：</span>
              <span class="value">{{ currentProduct.goodsCode || '--' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">商品品牌：</span>
              <span class="value">{{ currentProduct.brand || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">商品状态：</span>
              <span class="value">{{ getStatusText(currentProduct.status) }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">上架时间：</span>
              <span class="value">{{ proxy?.parseTime(currentProduct.createTime) || '--' }}</span>
            </div>
            <div class="info-item">
              <span class="label">产品保障：</span>
              <span class="value">{{ currentProduct.warranty || '--' }}</span>
            </div>
          </div>
        </div>

        <!-- 商品信息表格 -->
        <div class="product-info-section">
          <div class="section-title">
            <el-icon><Grid /></el-icon>
            <span>商品信息</span>
          </div>
          <el-table :data="productSpecs" border style="width: 100%">
            <el-table-column prop="goodsName" label="商品名称" width="200">
              <template #default="scope">
                <div class="spec-name">{{ scope.row.goodsName }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="goodsCode" label="商品编码" width="180">
              <template #default="scope">
                <div class="spec-code">{{ scope.row.goodsCode }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="销售价" width="120">
              <template #default="scope">
                <el-input
                  v-model="scope.row.price"
                  type="number"
                  :min="0"
                  step="0.01"
                  placeholder="请输入价格"
                  class="price-input"
                >
                  <template #suffix>¥</template>
                </el-input>
              </template>
            </el-table-column>
            <el-table-column prop="specification" label="商品规格" width="120">
              <template #default="scope">
                <div class="spec-info">{{ scope.row.specification }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="inventory" label="可用库存" width="120">
              <template #default="scope">
                <div class="spec-info">{{ scope.row.inventory }}</div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="closePriceDialog">取消</el-button>
          <el-button type="primary" @click="savePriceChanges" :loading="priceSaving">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted } from 'vue';
import router from '@/router';
import { goodsList , goodsDelete, updateGoodsStatus, goodsId, updateGoodsPrice } from '@/api/Supplier/productManagement/product';


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

// 价格设定弹窗相关
const priceDialogVisible = ref(false);
const currentProduct = ref<any>({});
const productSpecs = ref<any[]>([]);
const priceSaving = ref(false);

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
  // 如果没有选择商品，则处理全部商品
  let targetIds = selectedIds.value;
  let targetRows = selectedRows.value;
  
  if (targetIds.length === 0) {
    // 获取当前页面的所有商品ID
    targetIds = tableData.value.map(item => item.id);
    targetRows = tableData.value;
    ElMessage.info('未选择商品，将对当前页面全部商品进行上架操作');
  }
  
  // 检查目标商品是否都是下架状态（上架操作只能对下架状态的商品进行）
  // 状态 '0' 表示上架，'1' 表示下架，所以上架操作需要检查状态不是 '0'
  const invalidRows = targetRows.filter(row => row.status === '0');
  if (invalidRows.length > 0) {
    ElMessage.warning(`目标商品中包含已上架的商品，无法重复上架`);
    return;
  }
  
  ElMessageBox.confirm(`确定要将${targetIds.length}个商品上架吗？`, '上架确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量上架 - 使用正确的数据格式
    const shelfData = {
      goodsIds: targetIds, // 商品ID数组
      status: '0' // 0表示上架
    };
    
    console.log('上架数据:', shelfData);
    
    updateGoodsStatus(shelfData).then(response => {
      if (response.code === 200) {
        ElMessage.success(`成功上架${targetIds.length}个商品`);
        getList();
        // 清空选中状态
        selectedIds.value = [];
        selectedRows.value = [];
      } else {
        ElMessage.error(response.msg || '上架操作失败');
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
  // 如果没有选择商品，则处理全部商品
  let targetIds = selectedIds.value;
  let targetRows = selectedRows.value;
  
  if (targetIds.length === 0) {
    // 获取当前页面的所有商品ID
    targetIds = tableData.value.map(item => item.id);
    targetRows = tableData.value;
    ElMessage.info('未选择商品，将对当前页面全部商品进行下架操作');
  }
  
  // 检查目标商品是否都是上架状态（下架操作只能对上架状态的商品进行）
  // 状态 '0' 表示上架，'1' 表示下架，所以下架操作需要检查状态是 '0'
  const invalidRows = targetRows.filter(row => row.status !== '0');
  if (invalidRows.length > 0) {
    ElMessage.warning(`目标商品中包含已下架的商品，无法重复下架`);
    return;
  }
  
  ElMessageBox.confirm(`确定要将${targetIds.length}个商品下架吗？`, '下架确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // 批量下架 - 使用正确的数据格式
    const unshelfData = {
      goodsIds: targetIds, // 商品ID数组
      status: '1' // 1表示下架
    };
    
    console.log('下架数据:', unshelfData);
    
    updateGoodsStatus(unshelfData).then(response => {
      if (response.code === 200) {
        ElMessage.success(`成功下架${targetIds.length}个商品`);
        getList();
        // 清空选中状态
        selectedIds.value = [];
        selectedRows.value = [];
      } else {
        ElMessage.error(response.msg || '下架操作失败');
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

/** 价格设定 */
const handlePriceSetting = async (row: any) => {
  try {
    // 显示加载状态
    const loadingInstance = ElLoading.service({
      lock: true,
      text: '正在加载商品详情...',
      background: 'rgba(0, 0, 0, 0.7)'
    });

    // 调用商品详情接口获取完整数据
    const response = await goodsId(row.id);
    
    if (response && response.code === 200) {
      const productData = response.data;
      
      // 设置商品基本信息
      currentProduct.value = {
        id: productData.id || row.id, // 商品ID
        goodsId: productData.goodsId || productData.id || row.id, // 商品ID
        goodsName: productData.goodsName || row.goodsName,
        goodsCode: productData.goodsCode || row.goodsCode,
        brand: productData.brand || productData.companyName || '--',
        status: productData.status || row.status,
        createTime: productData.createTime || row.createTime,
        warranty: productData.warranty || productData.guarantee || '--',
        mainImage: productData.mainImage || productData.image || ''
      };
      
      // 设置商品规格数据
      if (productData.specs && productData.specs.length > 0) {
        // 如果API返回了规格数据
        productSpecs.value = productData.specs.map((spec: any) => ({
          id: spec.id || spec.specId, // 规格ID
          goodsName: productData.goodsName,
          goodsCode: productData.goodsCode,
          price: spec.price || spec.goodsPrice || '0.00',
          specification: spec.specification || spec.spec || '--',
          inventory: spec.inventory || spec.stock || '0'
        }));
      } else if (productData.hnGoodsSpecificationDataList && productData.hnGoodsSpecificationDataList.length > 0) {
        // 如果API返回了规格数据列表
        productSpecs.value = productData.hnGoodsSpecificationDataList.map((spec: any) => ({
          id: spec.id, // 规格ID
          goodsName: productData.goodsName,
          goodsCode: productData.goodsCode,
          price: spec.goodsPrice || '0.00',
          specification: spec.specification || '--',
          inventory: spec.inventory || '0'
        }));
      } else {
        // 如果没有规格数据，使用默认数据
        productSpecs.value = [
          {
            id: 1, // 默认规格ID
            goodsName: productData.goodsName,
            goodsCode: productData.goodsCode,
            price: productData.price || '0.00',
            specification: '默认规格',
            inventory: productData.inventory || '0'
          }
        ];
      }
      
      priceDialogVisible.value = true;
    } else {
      ElMessage.error('获取商品详情失败');
    }
  } catch (error) {
    console.error('获取商品详情失败:', error);
    ElMessage.error('获取商品详情失败，请重试');
  } finally {
    // 关闭加载状态
    setTimeout(() => {
      ElLoading.service().close();
    }, 500);
  }
};

/** 关闭价格设定弹窗 */
const closePriceDialog = () => {
  priceDialogVisible.value = false;
  currentProduct.value = {};
  productSpecs.value = [];
};

/** 保存价格修改 */
const savePriceChanges = async () => {
  try {
    priceSaving.value = true;
    
    // 准备保存的数据，使用正确的格式
    const saveData = {
      hnGoodsSpecificationDataList: productSpecs.value.map(spec => ({
        id: spec.id, // 规格ID
        goodsId: currentProduct.value.id || currentProduct.value.goodsId, // 商品ID
        goodsPrice: parseFloat(spec.price) || 0 // 商品价格
      }))
    };
    
    console.log('保存价格数据:', saveData);
    
    // 调用保存价格接口
    const response = await updateGoodsPrice(saveData);
    
    if (response && response.code === 200) {
      ElMessage.success('价格修改成功');
      closePriceDialog();
      // 刷新列表
      getList();
    } else {
      ElMessage.error(response?.msg || '价格修改失败');
    }
  } catch (error) {
    console.error('保存价格失败:', error);
    ElMessage.error('价格修改失败，请重试');
  } finally {
    priceSaving.value = false;
  }
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

// 价格设定弹窗样式
.price-dialog-content {
  .product-basic-info {
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f8f9fa;
    border-radius: 8px;
    
    .info-row {
      display: flex;
      margin-bottom: 12px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .info-item {
      flex: 1;
      display: flex;
      align-items: center;
      
      .label {
        font-weight: 500;
        color: #606266;
        margin-right: 8px;
        min-width: 80px;
      }
      
      .value {
        color: #303133;
        flex: 1;
      }
    }
  }
  
  .product-info-section {
    .section-title {
      display: flex;
      align-items: center;
      margin-bottom: 16px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;
      
      .el-icon {
        margin-right: 8px;
        color: #409eff;
      }
    }
    
    .spec-name, .spec-code, .spec-info {
      padding: 8px 12px;
      background-color: #f5f7fa;
      border-radius: 4px;
      font-size: 14px;
      color: #606266;
    }
    
    .price-input {
      width: 100%;
      
      :deep(.el-input__inner) {
        text-align: right;
        padding-right: 20px;
      }
    }
  }
}

.dialog-footer {
  text-align: center;
  
  .el-button {
    margin: 0 8px;
  }
}
</style>
