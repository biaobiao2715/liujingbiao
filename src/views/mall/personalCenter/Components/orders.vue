<!--
  标题: Purchaser.vue
  功能: 我的最近订单
  说明: 用于查看我最近购买的订单。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-27
-->
<template>
  <div class="orders">
    <!-- 页面标题 -->
    <div class="menu-title">我的最近订单</div>
    <div class="pading20">
      <!-- 订单状态Tabs -->
      <el-tabs v-model="queryParams.orderStatus" class="demo-tabs" @tab-change="onTabChange">
        <el-tab-pane label="全部" name="0" key="0"></el-tab-pane>
        <el-tab-pane v-for="value in order_status" :key="value.value" :label="value.label" :name="value.value"></el-tab-pane>
      </el-tabs>

      <!-- 订单列表Table -->
      <el-table v-loading="loading" :data="tabList" style="table-layout: fixed">
        <!-- 商品信息列 -->
        <el-table-column prop="goodsName" label="商品信息" min-width="200" :show-overflow-tooltip="true">
          <template v-slot="scope">
            <div style="display: flex">
              <!-- 商品图片，兜底处理 -->
              <img class="table-img" :src="scope.row.orderItems[0]?.goodsPicUrl || ''" />
              <div class="table-text">
                <div>{{ scope.row.orderItems[0]?.goodsName }}</div>
                <div>
                  {{ scope.row.orderItems[0]?.goodsSpecificationValue }}{{ scope.row.orderItems[0]?.goodsSpecificationLabel }} x
                  {{ scope.row.orderItems[0]?.goodsQuantity }}
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <!-- 商品价格列 -->
        <el-table-column prop="goodsPrice" label="商品价格" align="center">
          <template #default="{ row }">
            <span style="color: #ef4d0b">￥{{ row.orderItems[0]?.goodsPrice }}元 </span>
          </template>
        </el-table-column>
        <!-- 订单状态列 -->
        <el-table-column prop="orderStatus" label="订单状态" align="center">
          <!-- <template v-slot="scope">
            <dict-tag :options="order_status" :value="scope.row.orderStatus" />
          </template> -->

          <template #default="scope">
            <div class="flex-center-center">
              <div
                v-if="scope.row.orderStatus != null"
                class="normal"
                :class="{
                  reviewRejected: scope.row.orderStatus == 1,
                  green: scope.row.orderStatus == 2,
                  defaultText: scope.row.orderStatus == 3,
                  prohibit: scope.row.orderStatus == 99
                }"
              ></div>
              <span v-if="scope.row.orderStatus == 1" class="reviewRejected-color">待发货</span>
              <span v-if="scope.row.orderStatus == 2" class="green-color">已发货</span>
              <span v-if="scope.row.orderStatus == 3" class="defaultText-color">已完成</span>
              <span v-if="scope.row.orderStatus == 99" class="prohibit-color">已取消</span>
            </div>
          </template>
        </el-table-column>
        <!-- 商家联系电话 -->
        <el-table-column prop="enterprisePhone" label="商家联系电话" align="center"></el-table-column>
        <!-- 销售订单号 -->
        <el-table-column prop="orderSn" label="销售订单号" min-width="150" :show-overflow-tooltip="true" align="center"></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" min-width="150" align="center">
          <template #default="{ row }">
            <!-- 取消订单按钮 -->
            <el-button
              v-if="row.orderStatus == '1'"
              v-hasPermi="['grain:salesOrder:cancel']"
              @click="cancelOrder(row.id)"
              v-throttle
              text
              style="color: #ff0000"
              >取消订单</el-button
            >
            <!-- 签收按钮 -->
            <el-button
              v-if="row.orderStatus == '2'"
              v-hasPermi="['grain:salesOrder:edit']"
              @click="confirmReceipt(row.id)"
              v-throttle
              text
              style="color: #108c58"
              >签收</el-button
            >
            <!-- 举报商品按钮 -->
            <el-button
              v-if="row.orderStatus == '3'"
              v-hasPermi="['grain:salesOrder:edit']"
              @click="openReportDialog(row)"
              v-throttle
              text
              style="color: #ff7b00"
              >举报商品</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="flex-center pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>

      <!-- 我要举报弹窗（封装组件） -->
      <ReportDialog
        v-model="reportDialogVisible"
        :default-target="reportForm?.reportPersonName || ''"
        :default-goods-info="reportForm?.reportGoodsCode || ''"
        :report-person-id="reportForm?.reportPersonId || ''"
        :report-goods-code="reportForm?.goodsId || ''"
        @submit="handleReportSubmitData"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
// -------------------- 引入依赖 --------------------
import { ref, reactive, toRefs, onMounted, nextTick, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { orderConfirm, orderCancel, orderList, ossUploadImage, addReportChannel, Order } from '@/api/mall/personalCenter/orders';
import { ElMessage, ElMessageBox } from 'element-plus';
import ReportDialog from '@/views/mall/Components/AboutCompareComponents/ReportDialog.vue';

// -------------------- 响应式数据 --------------------
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { order_status, report_type_id } = toRefs<any>(proxy?.useDict('order_status', 'report_type_id')); // 订单状态字典

/** 查询参数 */
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderStatus: '0'
});

/** 列表数据与状态 */
const tabList = ref<Order[]>([]);
const total = ref(0);
const loading = ref(false);

/** 举报弹窗相关 */
const reportDialogVisible = ref(false);
// 表单模型，增加一个 materials 字段用于配合校验（与上传列表联动）
const reportForm = ref({
  reportPersonId: '',
  reportPersonName: '',
  reportGoodsCode: '',
  goodsId: ''
});

// -------------------- 方法定义 --------------------

/**
 * Tab切换事件
 * @param name 订单状态
 */
const onTabChange = (name: string | number) => {
  queryParams.value.pageNum = 1;
  queryParams.value.orderStatus = String(name);
  if (String(name) === '0') {
    // “全部”时不传递orderStatus字段
    delete queryParams.value.orderStatus;
  }
  getList();
};
const handleReportSubmitData = (_payload: any) => {};

/**
 * 获取订单列表
 */
const getList = async () => {
  loading.value = true;
  try {
    const res = await orderList(queryParams.value);
    if (res.code === 200) {
      tabList.value = res.rows || [];
      total.value = res.total || 0;
    }
  } catch (error) {
    // 可根据需要增加错误提示
  } finally {
    loading.value = false;
  }
};

/**
 * 取消订单
 * @param orderId 订单ID
 */
const cancelOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm('确定取消订单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    loading.value = true;
    const res = await orderCancel(orderId);
    if (res.code === 200) {
      ElMessage.success('取消订单成功');
      getList();
    }
  } catch {
    // 用户取消或请求失败
  } finally {
    loading.value = false;
  }
};

/**
 * 确认收货
 * @param orderId 订单ID
 */
const confirmReceipt = async (orderId: number) => {
  try {
    await ElMessageBox.confirm('确定签收订单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    loading.value = true;
    const res = await orderConfirm(orderId);
    if (res.code === 200) {
      ElMessage.success('签收订单成功');
      getList();
    }
  } catch {
    // 用户取消或请求失败
  } finally {
    loading.value = false;
  }
};

/**
 * 打开举报弹窗
 * @param row 当前订单行
 */
const openReportDialog = (row: any) => {
  reportForm.value = {
    reportPersonId: row.enterpriseId || '',
    reportPersonName: row.enterpriseName || '',
    reportGoodsCode: row.orderItems[0]?.goodsName || '',
    goodsId: row.orderItems[0]?.goodsId
  };
  reportDialogVisible.value = true;
};

// -------------------- 生命周期 --------------------
onMounted(() => {
  onTabChange('0');
});
</script>

<style scoped>
/* 页面布局样式 */
.menu-title {
  display: flex;
  align-items: center;
  height: 60px;
  padding-left: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  position: relative;
  border-bottom: 2px solid #d8d8d8;
  border-radius: 8px 8px 0 0;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}
.menu-title::before {
  content: '';
  display: inline-block;
  width: 26px;
  height: 26px;
  margin-right: 2px;
  background-image: url('@/assets/images/mall/my-orders-icon.png');
}

.pading20 {
  padding: 20px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}
.table-img {
  width: 70px;
  height: 70px;
}
.table-text {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-left: 10px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
.uploadcss {
  ::v-deep .el-form-item__content {
    white-space: nowrap;
    display: inline-block;
  }
}
::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 106px;
  height: 106px;
}
::v-deep .el-upload--picture-card {
  width: 106px;
  height: 106px;
  line-height: 106px;
  float: left;
}
</style>
