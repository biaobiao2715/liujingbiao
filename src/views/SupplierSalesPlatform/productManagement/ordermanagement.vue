<!-- 
标题：			ordermanagement.vue
功能：			订单管理页面
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-27
修改人信息：张峰     2025-10-27
修改内容：订单管理
 -->
<template>
  <div class="supplier-management">
    <!-- 搜索条件 -->
    <el-form ref="queryFormRef" :model="queryParams" inline :label-width="100">
      <el-form-item label="销售订单号">
        <el-input v-model="queryParams.orderSn" placeholder="请输入销售订单号" clearable />
      </el-form-item>
      <el-form-item label="订单状态">
        <el-select v-model="queryParams.orderStatus" filterable clearable placeholder="请选择订单状态">
          <el-option v-for="item in productBrandList" :key="item.id" :label="item.attributeName" :value="item.id" />
        </el-select>
      </el-form-item>
      <el-form-item label="商品名称">
        <el-input v-model="queryParams.goodsName" placeholder="请输入商品名称" clearable />
      </el-form-item>
      <el-form-item label="收货人名字">
        <el-input v-model="queryParams.receiverName" placeholder="请输入收货人名字" clearable />
      </el-form-item>
      <el-form-item label="收货人电话">
        <el-input v-model="queryParams.receiverPhone" placeholder="请输入收货人电话" clearable />
      </el-form-item>
      <!-- 价格调整日期 -->
      <el-form-item label="下单时间">
        <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator=" - "
          start-placeholder="开始日期" end-placeholder="结束日期" @change="handleSelectDate" />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleQuery">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 状态 Tabs -->
    <div class="order-tabs mb-[10px]">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部" name="all"></el-tab-pane>
        <el-tab-pane label="待发货" name="pending"></el-tab-pane>
        <el-tab-pane label="已发货" name="shipped"></el-tab-pane>
        <el-tab-pane label="已完成" name="finished"></el-tab-pane>
        <el-tab-pane label="已取消" name="cancelled"></el-tab-pane>
      </el-tabs>
    </div>
    <!-- <div class="mb-12">
      <el-button v-throttle type="primary" @click="handleExport" :disabled="selectedRows.length === 0">导出</el-button>
    </div> -->
    <!-- 表格展示 -->
    <el-table :data="tableData" border v-loading="loading" style="width: 100%">
      <!-- <el-table-column type="selection" width="55" align="center" /> -->
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="销售订单号" align="center" prop="orderSn" width="210" style="color: #0000ff" />
      <el-table-column label="商品名称" align="center" prop="goodsName" :show-overflow-tooltip="true" />
      <el-table-column label="数量" align="center" prop="goodsQuantity" width="210"> </el-table-column>
      <el-table-column label="配送方式" align="center" prop="goodsCategoryName" width="210"> </el-table-column>
      <el-table-column label="下单时间" align="center" prop="goodsOldPrice" width="210"> </el-table-column>
      <el-table-column label="收货人姓名" align="center" prop="receiverName" width="210"> </el-table-column>
      <el-table-column label="收货人电话" align="center" prop="receiverPhone" width="210"> </el-table-column>
      <el-table-column label="收货地址" align="center" prop="adjustBy" width="210"> </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus" width="210"> </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <div style="display: flex; justify-content: space-evenly; align-items: center">
            <el-link type="primary">查看</el-link>
            <el-link type="primary">发货</el-link>
            <el-link type="primary">取消订单</el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
        :total="total" @pagination="getTableData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios'; 
// 确保引入 axios
import {
  getorderpageList,
} from '@/api/supplier/productManagement/ordermanagement';
import { getProductAttributesList } from '@/api/platform/mallConfiguration/productAttributeLabel';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { goods_specification } = toRefs<any>(proxy?.useDict('goods_specification'));

const productBrandList = ref([]); // 商品品牌列表

const tableData = ref([]); // 表格数据

const total = ref(0); // 总条数

const loading = ref(false); // 加载中

const queryFormRef = ref(); // 查询表单ref

const dateRange = ref<string[]>([]); // 价格调整日期范围

const selectedRows = ref([]); // 选中的表格数据

// 当前选中的 Tab
const activeTab = ref('all');

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  receiverPhone: '', //收货人电话
  orderSn: '', //销售订单号
  orderStatus: '', //订单状态
  goodsName: '', //商品名称
  receiverName: '', // 收货人名字
  endTime: '', // 下单结束时间
  startTime: '',// 下单开始时间
});

onMounted(() => {
  getTableData();
  getProductBrandList();
});

// 处理日期选择事件
const handleSelectDate = (val: string[]) => {
  queryParams.value.startTime = val?.[0] || '';
  queryParams.value.endTime = val?.[1] || '';
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getTableData();
};

/** 重置按钮操作 */
const handleReset = () => {
  queryParams.value = {
    pageNum: 1,
    pageSize: 10,
    receiverPhone: '', //收货人电话
    orderSn: '', //销售订单号
    orderStatus: '', //订单状态
    goodsName: '', //商品名称
    receiverName: '', // 收货人名字
    endTime: '', // 下单结束时间
    startTime: '',// 下单开始时间
  };
  dateRange.value = [];
  getTableData();
};
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;

  // 设置查询参数中的状态字段
  switch (tabName) {
    case 'pending':
      queryParams.value.orderStatus = '1';
      break;
    case 'shipped':
      queryParams.value.orderStatus = '2';
      break;
    case 'finished':
      queryParams.value.orderStatus = '3';
      break;
    case 'cancelled':
      queryParams.value.orderStatus = '99';
      break;
    default:
      queryParams.value.orderStatus = '1'; // 全部
  }

  queryParams.value.pageNum = 1;
  getTableData();
};

// 导出按钮操作
// const handleExport = async () => {
//   if (selectedRows.value.length === 0) {
//     ElMessage.error('请先选择要导出的数据');
//     return;
//   }
//   loading.value = true;
//   const ids = selectedRows.value.map((row) => row.id);
//   try {
//     const res: any = await exportGoodsPriceHistory({ ids: ids.join() });
//     if (res) {
//       // 创建 Blob 对象
//       const blob = new Blob([res], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
//       const link = document.createElement('a');
//       link.href = URL.createObjectURL(blob);
//       link.download = '商品价格调整历史.xlsx';
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       URL.revokeObjectURL(link.href); // 释放 URL 对象
//     } else {
//       ElMessage.error('导出失败，未返回有效数据');
//     }
//   } catch (error) {
//     console.error('导出失败:', error);
//     ElMessage.error('导出失败，请稍后重试');
//   } finally {
//     loading.value = false;
//   }
// };

// 获取销售订单列表
const getTableData = () => {
  loading.value = true;
  try {
    getorderpageList(queryParams.value).then((res) => {
      if (res.code === 200) {
        tableData.value = res.rows;
        total.value = res.total;
      }
    });
  } catch (error) {
    console.error('查询商品价格历史列表失败:', error);
  } finally {
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }
};

//  获取商品品牌列表
const getProductBrandList = async () => {
  loading.value = true;
  try {
    const res = await getProductAttributesList({
      attributeType: 0,
      pageNum: 1,
      pageSize: 9999
    });
    if (res.code === 200) {
      productBrandList.value = res.rows || [];
    }
  } finally {
    loading.value = false;
  }
};

// 查询按钮事件
const onQuery = () => {
  console.log('查询表单数据:', queryParams.value);
  getTableData();
};

// // 处理表格复选框选择事件
// const handleSelectionChange = (rows) => {
//   selectedRows.value = rows;
// };

onMounted(() => {
  getTableData();
});

// 每次页面激活时执行（从缓存中恢复）
onActivated(() => {
  getTableData();
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

.order-tabs {
  margin: 12px 0 20px 0;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
  }
}
</style>