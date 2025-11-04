<!-- 
标题：			ordermanagement.vue
功能：			订单管理页面
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-10-31
修改人信息：张峰     2025-10-31
修改内容：订单管理发货弹窗
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
          <el-option label="全部" value="" />
          <el-option v-for="dict in order_status" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          start-placeholder="开始日期" end-placeholder="结束日期" />
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
      <el-table-column label="销售订单号" align="center" prop="orderSn" width="180" :show-overflow-tooltip="true">
        <template #default="scope">
          <el-link type="primary" @click="handleView(scope.row)">{{ scope.row.orderSn }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="商品名称" align="center" prop="goodsName" :show-overflow-tooltip="true" min-width="120">
        <template #default="scope">
          <span>{{ scope.row.goodsName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品数量" align="center" prop="goodsQuantity" width="100">
        <template #default="scope">
          <span>{{ scope.row.goodsQuantity || 0 }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品价格" align="center" prop="goodsPrice" width="120">
        <template #default="scope">
          <span class="amount-text">¥{{ scope.row.goodsPrice || '0.00' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="配送方式" align="center" prop="deliveryOptions" width="120">
        <template #default="scope">
          <span>{{ getDeliveryMethodText(scope.row.deliveryOptions) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="下单时间" align="center" prop="createTime" width="160">
        <template #default="scope">
          <span>{{ scope.row.createTime }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货人" align="center" prop="receiverName" width="100">
        <template #default="scope">
          <span>{{ scope.row.receiverName || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货电话" align="center" prop="receiverPhone" width="130">
        <template #default="scope">
          <span>{{ scope.row.receiverPhone || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收货地址" align="center" prop="fullReceiverAddress" width="200" :show-overflow-tooltip="true">
        <template #default="scope">
          <span>{{ getFullAddress(scope.row) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="订单状态" align="center" prop="orderStatus" width="100">
        <template #default="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template #default="scope">
          <div style="display: flex; justify-content: space-evenly; align-items: center">
            <el-link type="primary" @click="handleView(scope.row)" v-hasPermi="['system:goods:query']">查看</el-link>
            <el-link type="primary" @click="handleShip(scope.row)" v-hasPermi="['grain:hnSalesOrder:edit']"
              v-if="scope.row.orderStatus === '1'">
              发货
            </el-link>
            <el-link type="danger" @click="handleCancel(scope.row)" v-hasPermi="['grain:hnSalesOrder:cancelSalesOrder']"
              v-if="scope.row.orderStatus === '1'">
              取消订单
            </el-link>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-dialog title="操作确认" v-model="dialogVisible" width="30%">
      <span>取消后无法恢复，是否确认取消订单</span>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="cancelloading" @click="cancelorder">确 定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 发货 -->
    <el-dialog v-model="shipmentVisible" title="订单发货" width="600px">
      <span style="display:inline-block;padding-bottom: 10px; color: #abaeb5; font-weight: 700;">商品信息</span>
      <el-table :data="[rowdata]" border style="width: 100%">
        <el-table-column prop="goodsName" label="商品名称" width="200" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ row.goodsName || '-' }}
          </template>
        </el-table-column>

        <el-table-column prop="goodsPrice" label="单价" width="220">
          <template #default="{ row }">
            {{ row.goodsPrice ? Number(row.goodsPrice).toFixed(2) : '0.00' }}
          </template>
        </el-table-column>

        <el-table-column prop="goodsQuantity" label="数量" align="center">
          <template #default="{ row }">
            {{ row.goodsQuantity || 0 }}
          </template>
        </el-table-column>

        <!--  小计：数量 × 单价 -->
        <el-table-column label="小计" align="center">
          <template #default="{ row }">
            {{ ((Number(row.goodsPrice) || 0) * (Number(row.goodsQuantity) || 0)).toFixed(2) }}
          </template>
        </el-table-column>
      </el-table>
      <span
        style="display:inline-block;padding-bottom: 10px;padding-top: 5px; color: #abaeb5; font-weight: 800;">配送信息</span>
      <el-form :model="shipmentForm" ref="shipmentFormFormRef" :rules="shipmentRules" label-width="100px">
        <el-form-item label="配送方式：" prop="deliveryOptions">
          <el-select v-model="shipmentForm.deliveryOptions" placeholder="请选择配送方式" @change="handleDeliveryOptionChange">
            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="收货人姓名：" prop="receiverName">
          <el-input v-model="rowdata.receiverName" maxlength="11" disabled></el-input>
        </el-form-item>

        <el-form-item label="收货人电话：" prop="receiverPhone">
          <el-input v-model="rowdata.receiverPhone" maxlength="11" disabled></el-input>
        </el-form-item>

        <el-form-item label="收货地址：" prop="areaCodes">
          <span style="color: #abaeb5;">{{ getFullAddress(rowdata) }}</span>
        </el-form-item>
      </el-form>
      <template v-if="logisticsVisible">
        <span
          style="display:inline-block;padding-bottom: 10px;padding-top: 5px; color: #abaeb5; font-weight: 700;">物流信息</span>
        <el-form :model="logisticsForm" :rules="logisticsRules" ref="logisticsFormFormRef" label-width="100px">
          <el-form-item label="快递公司：" prop="deliveryCompany">
            <el-input v-model="logisticsForm.deliveryCompany" placeholder="请输入快递公司" maxlength="20"></el-input>
          </el-form-item>

          <el-form-item label="物流单号：" prop="deliverySn">
            <el-input v-model="logisticsForm.deliverySn" placeholder="请输入物流单号" maxlength="20"></el-input>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button @click="shipmentVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipmentloading" @click="shipmentInfo">保存</el-button>
      </template>
    </el-dialog>
    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination v-show="total > 0" :page="queryParams.pageNum" :limit="queryParams.pageSize" :total="total"
        @pagination="getTableData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, getCurrentInstance } from 'vue';
import { toRefs } from '@vueuse/core';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import router from '@/router';
// 确保引入 axios
import { getorderList, cancelorderapi, modifypersonnel } from '@/api/supplier/productManagement/ordermanagement';
// import { getProductAttributesList } from '@/api/platform/mallConfiguration/productAttributeLabel';


const getProductAttributesList = async (params: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        rows: []
      });
    }, 500);
  });
};

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { order_status } = toRefs<any>((proxy as any)?.useDict('order_status'));

const productBrandList = ref([]); // 商品品牌列表

const tableData = ref([]); // 表格数据

const dialogVisible = ref(false) //取消订单确认框

const total = ref(0); // 总条数

const loading = ref(false); // 加载中

const queryFormRef = ref(); // 查询表单ref

const dateRange = ref<[DateModelType, DateModelType]>(['', '']); // 价格调整日期范围

const selectedRows = ref([]); // 选中的表格数据

// 当前选中的 Tab
const activeTab = ref('all');

const cancelobj = ref() //取消订单row

const cancelloading = ref(false) //取消loading

const shipmentVisible = ref(false) //发货弹窗
const shipmentloading = ref(false) //发货确认loading
const logisticsVisible = ref(false) //是否展示物流信息
const shipmentFormFormRef = ref(null)
const logisticsFormFormRef = ref(null)
/* 发货的row */
const rowdata = ref()
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  receiverPhone: '', //收货人电话
  orderSn: '', //销售订单号
  orderStatus: '', //订单状态
  goodsName: '', //商品名称
  receiverName: '', // 收货人名字
});
/* 发货配送信息 */
const shipmentForm = ref({
  deliveryOptions: '', //配送方式
})
/* 物流信息 */
const logisticsForm = ref({
  deliveryCompany: '',//快递公司
  deliverySn: '',//物流单号
})
const options = ref([
  {
    value: '1',
    label: '同城自提',
  },
  {
    value: '2',
    label: '快递',
  },
])
onMounted(() => {
  getTableData();
  getProductBrandList();
});
// 监听配送方式变化
const handleDeliveryOptionChange = (value) => {
  console.log('配送方式', value);

  if (value === '1') {
    // 如果选择的是同城自提，隐藏物流信息
    logisticsForm.value.deliveryCompany = '';
    logisticsForm.value.deliverySn = '';
    logisticsVisible.value = false; // 隐藏物流信息
  } else if (value === '2') {
    // 如果选择的是快递，显示物流信息
    logisticsForm.value.deliveryCompany = '';
    logisticsForm.value.deliverySn = '';
    logisticsVisible.value = true; // 显示物流信息
  }
};
// 处理日期选择事件
// const handleSelectDate = (val: string[]) => {
//   queryParams.value.beginCreateTime = val?.[0] || '';
//   queryParams.value.endCreateTime = val?.[1] || '';
// };
/* 发货表单校验 */
const shipmentRules = {
  deliveryOptions: [
    { required: true, message: '请选择配送方式', trigger: 'change' },
  ],
}
/* 发货物流校验 */
const logisticsRules = {
  deliveryCompany: [{ required: true, message: '请输入快递公司', trigger: 'blur' }],
  deliverySn: [
    { required: true, message: '请输入物流单号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const patterns = {
          '圆通快递': /^YT\d{13}$/,
          '中通快递': /^7353\d{10}$/,
          '申通快递': /^77203\d{10}$/,
          '韵达快递': /^(43415\d{10}|31250\d{10})$/,
          '极兔快递': /^JT\d{13}$/,
          '京东快递': /^JD[A-Za-z]{1,2}\d{12}$/,
          '德邦快递': /^DPK\d{12}$/,
          '德邦物流': /^DPL\d{12}$/,
          '顺丰快递': /^SF\d{13}$/,
          'EMS': /^(E\d{10}CS|\d{13})$/,
          '跨越速运': /^KYE\d{7}$/,
        };

        const company = logisticsForm.value.deliveryCompany;
        if (patterns[company] && !patterns[company].test(value)) {
          callback(new Error('物流单号格式不正确'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],

}
/** 搜索按钮操作 */
const handleQuery = () => {
  // queryParams.value.pageNum = 1;
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
  };
  dateRange.value = ['', ''];
  getTableData();
};
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;

  // 设置查询参数中的状态字段 - 根据字典键值
  switch (tabName) {
    case 'pending':
      queryParams.value.orderStatus = '1'; // 待发货
      break;
    case 'shipped':
      queryParams.value.orderStatus = '2'; // 已发货
      break;
    case 'finished':
      queryParams.value.orderStatus = '3'; // 已完成
      break;
    case 'cancelled':
      queryParams.value.orderStatus = '99'; // 已取消
      break;
    default:
      queryParams.value.orderStatus = ''; // 全部
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
const getTableData = async () => {
  console.log('dateRange.value',dateRange.value);
  
  loading.value = true;
  console.log('订单列表数据:');
  try {
    const res: any = await getorderList(proxy?.addDateRange(queryParams.value, dateRange.value,'CreateTime'));
    if (res.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
      console.log('订单列表数据:', tableData.value);
    } else {
      ElMessage.error(res.msg || '获取订单列表失败');
    }
  } catch (error) {
    console.error('查询订单列表失败:', error);
    ElMessage.error('查询订单列表失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

//  获取商品品牌列表
const getProductBrandList = async () => {
  loading.value = true;
  try {
    const res: any = await getProductAttributesList({
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

/** 获取完整收货地址 */
const getFullAddress = (row: any) => {
  const parts = [
    row.receiverProvince,
    row.receiverCity,
    row.receiverRegion,
    row.receiverDetailAddress
  ].filter(Boolean);
  return parts.join('') || '-';
};


/** 获取配送方式文本 */
const getDeliveryMethodText = (deliveryOptions: string | number) => {
  const methodMap: Record<string, string> = {
    '1': '同城自提',
    '2': '快递'
  };
  return methodMap[String(deliveryOptions)] || '-';
};

/** 查看订单详情 */
const handleView = (row: any) => {
  console.log('查看订单:', row);
  // 这里可以跳转到订单详情页面
  router.push({ path: '/company/sales/company/goods/ordermanagementdetail', query: { id: row.id } });
};

/** 发货操作 */
const handleShip = (row: any) => {
  console.log('发货订单:', row);
  /* 保存row */
  rowdata.value = row
  // 这里可以打开发货对话框或跳转到发货页面
  shipmentVisible.value = true
  /* 重置配送方式 */
  shipmentForm.value.deliveryOptions = ''
};

/** 取消订单 */
const handleCancel = (row: any) => {
  console.log('取消订单:', row);
  cancelobj.value = row
  dialogVisible.value = true
};
/* 确定取消 */
const cancelorder = async () => {
  console.log('cancelobj.value', cancelobj.value);
  cancelloading.value = true
  let params = {
    goodsSpecificationId: Number(cancelobj.value.goodsSpecificationId),
    goodsQuantity: Number(cancelobj.value.goodsQuantity),
    id: Number(cancelobj.value.id),
    orderStatus: "99"
  }
  try {
    await cancelorderapi(params)
    getTableData()
    ElMessage.success('取消成功')
  } catch (error) {
    ElMessage.error(error)
  } finally {
    cancelloading.value = false
    dialogVisible.value = false
  }
}
// // 处理表格复选框选择事件
// const handleSelectionChange = (rows) => {
//   selectedRows.value = rows;
// };
/* 发货信息修改 */
const shipmentInfo = async () => {
  try {
    // 先校验配送方式
    const shipmentValid = await shipmentFormFormRef.value.validate();
    if (!shipmentValid) return;
    if (shipmentForm.value.deliveryOptions === '2') {
      const valid = await logisticsFormFormRef.value.validate(); // 校验物流信息
      if (!valid) return; // 校验不通过，终止操作
    }
    shipmentloading.value = true
    let params = {
      id: rowdata.value.id,
      orderStatus: "2",
      deliveryOptions: shipmentForm.value.deliveryOptions,
    }
    // 如果选择的是快递，追加物流信息
    if (shipmentForm.value.deliveryOptions === '2') {
      params['deliveryCompany'] = logisticsForm.value.deliveryCompany.trim();
      params['deliverySn'] = logisticsForm.value.deliverySn.trim();
    }

    await modifypersonnel(params);
    shipmentVisible.value = false
    getTableData(); //更新列表
    ElMessage.success('发货成功');
  } catch (error) {
    ElMessage.error(error)
  } finally {
    shipmentloading.value = false
  }
}
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

// 金额样式
.amount-text {
  color: #f56c6c;
  font-weight: 600;
  font-size: 14px;
}

// 表格样式优化
:deep(.el-table) {
  .el-table__header {
    th {
      background-color: #f5f7fa;
      color: #606266;
      font-weight: 600;
    }
  }

  .el-table__row {
    &:hover {
      background-color: #f5f7fa;
    }
  }
}

// 状态标签样式
:deep(.el-tag) {
  font-weight: 500;
  border: none;
}
</style>
