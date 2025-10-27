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
          <el-option label="全部" value="全部" />
          <el-option v-for="dict in goods_status" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <!-- 发布时间选择器 -->
      <el-form-item label="发布时间">
        <el-date-picker
          v-model="dateRange"
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
      <el-table-column label="销售价" align="center" prop="salesPrice" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getSalesPrice(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品类目" align="center" prop="goodsCategoryId" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getCategoryName(scope.row.goodsCategoryId) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="预警下限" align="center" prop="goodsAlert"> </el-table-column>
      <el-table-column label="提醒" align="center" prop="remind"> </el-table-column>
      <el-table-column label="商品状态" align="center" prop="status">
        <template v-slot="scope">
          <dict-tag :options="goods_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="发布时间" align="center" prop="createTime" min-width="160">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="500">
        <template #default="scope">
          <!-- 详情按钮 -->
          <el-button v-throttle type="primary" @click="handleDetails(scope.row)">详情</el-button>
          <el-button v-throttle type="primary" @click="handlePriceSetting(scope.row)">价格设定</el-button>
          <el-button v-throttle type="primary" @click="handleEdit(scope.row)">编辑</el-button>
          <el-button v-throttle type="primary" @click="handleEC(scope.row)">复制商品</el-button>
          <el-button v-throttle type="primary" @click="handleEdits(scope.row, 'view')">设置预警</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 价格设定弹窗 -->
    <el-dialog v-model="priceDialogVisible" title="价格修改" width="1000px" :close-on-click-modal="false" :close-on-press-escape="false">
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
             <div class="info-item">
              <span class="label">产品保障：</span>
              <span class="value">{{ currentProduct.warranty || '--' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">商品品牌：</span>
              <span class="value">{{ currentProduct.brand || '--' }}</span>
            </div>
             <div class="info-item">
              <span class="label">商品主图：</span>
              <el-image v-if="currentProduct.mainImage" :src="currentProduct.mainImage" style="width: 60px; height: 60px" fit="cover" :preview-src-list="[currentProduct.mainImage]" />
              <span v-else class="value">--</span>
            </div>
            <div class="info-item">
              <span class="label">创建时间：</span>
              <span class="value">{{ proxy?.parseTime(currentProduct.createTime) || '--' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">商品状态：</span>
              <span class="value"><dict-tag :options="goods_status" :value="currentProduct.status" /></span>
            </div>
            <div class="info-item">
              <span class="label">上架时间：</span>
              <span class="value">{{ proxy?.parseTime(currentProduct.onlineTime) || '--' }}</span>
            </div>
            <div class="info-item"></div>
          </div>
        </div>

        <!-- 商品信息表格 -->
        <div class="product-info-section">
          <div class="section-title">
            <el-icon><Grid /></el-icon>
            <span>商品信息</span>
          </div>
          <el-table :data="productSpecs" border style="width: 100%">
            <el-table-column prop="goodsName" label="商品名称" min-width="180">
              <template #default="scope">
                <div class="spec-name">{{ scope.row.goodsName }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="goodsCode" label="商品编码" min-width="200">
              <template #default="scope">
                <div class="spec-code">{{ scope.row.goodsCode }}</div>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="销售价" width="150">
              <template #default="scope">
                <el-input v-model="scope.row.price" type="number" :min="0" step="0.01" placeholder="请输入价格" class="price-input">
                  <template #suffix>¥</template>
                </el-input>
              </template>
            </el-table-column>
            <el-table-column prop="specification" label="商品规格" min-width="150">
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
import { goodsList, goodsDelete, updateGoodsStatus, goodsId, updateGoodsPrice } from '@/api/Supplier/productManagement/product';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory'; //商品类目

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 使用字典数据
const { goods_status } = toRefs<any>(proxy?.useDict('goods_status'));

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  status: '',
  startTime: '',
  endTime: '',
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
const selectedIds = ref([]); // 选中的行ID数组
const selectedRows = ref([]); // 选中的行数据数组

// 价格设定弹窗相关
const priceDialogVisible = ref(false);
const currentProduct = ref<any>({});
const productSpecs = ref<any[]>([]);
const priceSaving = ref(false);

// 商品类目相关
const categoryList = ref<any[]>([]);
const categoryMap = ref<Record<string, string>>({});

/** 获取商品类目列表 */
const getCategoryList = async () => {
  try {
    const response = await getProductCategoryList();
    if (response && response.code === 200) {
      categoryList.value = response.data || response.rows || [];
      // 构建类目ID到名称的映射
      categoryMap.value = {};
      categoryList.value.forEach((category) => {
        categoryMap.value[category.id] = category.categoryName || category.name;
      });
      console.log('商品类目列表:', categoryList.value);
      console.log('类目映射:', categoryMap.value);
    }
  } catch (error) {
    console.error('获取商品类目失败:', error);
  }
};

/** 查询企业列表 */
const getList = async () => {
  loading.value = true;
  try {
    const response = await goodsList(queryParams.value);
    tableData.value = response.rows || [];
    total.value = response.total || 0;
  } catch (error) {
    ElMessage.error('获取商品列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 查询按钮事件 */
const handleSearch = () => {
  queryParams.value.startTime = dateRange.value[0];
  queryParams.value.endTime = dateRange.value[1];
  if (queryParams.value.status === '全部') {
    queryParams.value.status = '';
  }
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
  dateRange.value = ['', ''];
  queryParams.value.startTime = '';
  queryParams.value.endTime = '';
  handleQuery();
};

// 表格选择变化事件
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map((item) => item.id);
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
  })
    .then(() => {
      // 批量删除 - 逐个调用删除接口
      const deletePromises = selectedIds.value.map((id) => goodsDelete(id));

      Promise.all(deletePromises)
        .then((results) => {
          const successCount = results.filter((res) => res.code === 200).length;
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
        })
        .catch((error) => {
          ElMessage.error('删除操作失败');
        });
    })
    .catch(() => {
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
    targetIds = tableData.value.map((item) => item.id);
    targetRows = tableData.value;
    ElMessage.info('未选择商品，将对当前页面全部商品进行上架操作');
  }

  // 检查目标商品是否都是下架状态（上架操作只能对下架状态的商品进行）
  // 状态 '0' 表示下架，'1' 表示上架，所以上架操作需要检查状态是 '0'
  const invalidRows = targetRows.filter((row) => row.status === '1');
  if (invalidRows.length > 0) {
    ElMessage.warning(`目标商品中包含已上架的商品，无法重复上架`);
    return;
  }

  ElMessageBox.confirm(`确定要将${targetIds.length}个商品上架吗？`, '上架确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 批量上架 - 使用正确的数据格式
      const shelfData = {
        goodsIds: targetIds, // 商品ID数组
        status: '1' // 1表示上架
      };

      console.log('上架数据:', shelfData);

      updateGoodsStatus(shelfData)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success(`成功上架${targetIds.length}个商品`);
            getList();
            // 清空选中状态
            selectedIds.value = [];
            selectedRows.value = [];
          } else {
            ElMessage.error(response.msg || '上架操作失败');
          }
        })
        .catch((error) => {
          console.error('上架操作失败:', error);
          ElMessage.error('上架操作失败');
        });
    })
    .catch(() => {
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
    targetIds = tableData.value.map((item) => item.id);
    targetRows = tableData.value;
    ElMessage.info('未选择商品，将对当前页面全部商品进行下架操作');
  }

  // 检查目标商品是否都是上架状态（下架操作只能对上架状态的商品进行）
  // 状态 '0' 表示下架，'1' 表示上架，所以下架操作需要检查状态是 '1'
  const invalidRows = targetRows.filter((row) => row.status !== '1');
  if (invalidRows.length > 0) {
    ElMessage.warning(`目标商品中包含已下架的商品，无法重复下架`);
    return;
  }

  ElMessageBox.confirm(`确定要将${targetIds.length}个商品下架吗？`, '下架确认', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      // 批量下架 - 使用正确的数据格式
      const unshelfData = {
        goodsIds: targetIds, // 商品ID数组
        status: '0' // 0表示下架
      };

      console.log('下架数据:', unshelfData);

      updateGoodsStatus(unshelfData)
        .then((response) => {
          if (response.code === 200) {
            ElMessage.success(`成功下架${targetIds.length}个商品`);
            getList();
            // 清空选中状态
            selectedIds.value = [];
            selectedRows.value = [];
          } else {
            ElMessage.error(response.msg || '下架操作失败');
          }
        })
        .catch((error) => {
          console.error('下架操作失败:', error);
          ElMessage.error('下架操作失败');
        });
    })
    .catch(() => {
      ElMessage.info('下架操作已取消');
    });
};

// 获取类目名称
const getCategoryName = (categoryId) => {
  if (!categoryId) return '--';
  return categoryMap.value[categoryId] || '未知类目';
};

// 获取销售价（拼接所有规格的价格）
const getSalesPrice = (row) => {
  if (!row.hnGoodsSpecificationDataList || row.hnGoodsSpecificationDataList.length === 0) {
    return '--';
  }

  // 提取所有规格的价格并用"-"拼接
  const prices = row.hnGoodsSpecificationDataList.map((spec) => spec.goodsPrice || 0).filter((price) => price > 0);

  if (prices.length === 0) {
    return '--';
  }

  return prices.join('-');
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
        id: productData.id,
        goodsName: productData.goodsName,
        goodsCode: productData.goodsCode,
        brand: productData.goodsBrandName || '--',
        status: productData.status,
        createTime: productData.createTime,
        onlineTime: productData.launchTime,
        warranty: productData.goodssEnsureName?.join('、') || '--',
        mainImage: productData.sysOssLists?.[0]?.url || ''
      };

      // 设置商品规格数据
      if (productData.hnGoodsSpecificationDataList && productData.hnGoodsSpecificationDataList.length > 0) {
        productSpecs.value = productData.hnGoodsSpecificationDataList.map((spec: any) => ({
          id: spec.id,
          goodsName: productData.goodsName,
          goodsCode: productData.goodsCode,
          price: spec.goodsPrice || '0.00',
          specification: spec.specification || '--',
          inventory: spec.inventory || '0'
        }));
      } else {
        productSpecs.value = [{
          id: 1,
          goodsName: productData.goodsName,
          goodsCode: productData.goodsCode,
          price: '0.00',
          specification: '默认规格',
          inventory: '0'
        }];
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
      id: currentProduct.value.id || currentProduct.value.goodsId, // 商品ID（最外层）
      hnGoodsSpecificationDataList: productSpecs.value.map((spec) => ({
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
  // 构建导出参数
  const exportParams: any = {
    ...queryParams.value // 传递查询参数
  };

  // 如果有选中的商品，传入选中的ID
  if (selectedIds.value.length > 0) {
    exportParams.ids = selectedIds.value.join(','); // 多个ID用逗号拼接
    ElMessage.info(`将导出选中的${selectedIds.value.length}个商品`);
  } else {
    ElMessage.info('将导出当前查询条件下的所有商品');
  }

  console.log('导出参数:', exportParams);

  proxy?.download(
    '/grain-sales/goods/export', // 导出接口地址
    exportParams,
    `goods_${new Date().getTime()}.xlsx` // 文件名格式
  );
};

const isPendingReview = (row) => {
  return row.reviewStatus == 0;
};

// 页面加载时获取列表数据
onMounted(async () => {
  // 先获取商品类目列表
  await getCategoryList();
  // 再获取商品列表
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

    .spec-name,
    .spec-code,
    .spec-info {
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
