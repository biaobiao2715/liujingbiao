<!--
        标题: Purchaser.vue
        功能: 我的问题
        说明: 用于查看我最近购买的订单。
        当前版本: 1.0
        开发信息: Created by 刘景彪 2025-10-27
    -->
<template>
  <div class="orders">
    <div class="title">我的问题</div>
    <el-divider />

    <el-table :data="tabList" style="width: 100%">
      <el-table-column prop="goodsName" label="商品信息" width="200" :show-overflow-tooltip="true">
        <template v-slot="scope">
          <div style="display: flex">
            <img class="table-img" :src="scope.row.orderItems.goodsPic" />
            <span style="margin-left: 10px">{{ scope.row.orderItems.goodsName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="goodsPrice" label="商品价格" align="center">
        <template #default="{ row }"> {{ row.orderItems.goodsPrice }}元 </template>
      </el-table-column>
      <el-table-column prop="orderStatus" label="订单状态" align="center">
        <template v-slot="scope">
          <dict-tag :options="order_status" :value="scope.row.orderStatus" />
        </template>
      </el-table-column>
      <el-table-column prop="enterprisePhone" label="商家联系电话" align="center"></el-table-column>
      <el-table-column prop="orderSn" label="销售订单号" width="250" align="center"></el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="{ row }">
          <el-button v-if="row.orderStatus == '1'" type="danger" size="small" @click="cancelOrder(row.id)"> 取消订单 </el-button>
          <el-button v-if="row.orderStatus == '2'" type="primary" size="small" @click="confirmReceipt(row.id)"> 签收 </el-button>
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
import { orderConfirm, orderCancel, orderList } from '@/api/mall/personalCenter';

interface Order {
  id: number;
  productName: string;
  price: number;
  status: string;
  phone: string;
  orderNumber: string;
}
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
// 使用字典数据
const { order_status } = toRefs<any>(proxy?.useDict('order_status'));
const tabList = ref<Order[]>([]);
const total = ref(0); // 分页数据

// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 20,
  orderStatus: '0' //订单状态(0全部，1待发货，2待收货，3已完成，4已取消)
});

const getList = async () => {
  try {
    proxy?.$modal.loading('正在加载，请稍候...');

    // 构建请求参数，当 orderStatus 为 '0' 时不传递
    const requestParams = {
      pageNum: queryParams.value.pageNum,
      pageSize: queryParams.value.pageSize,
      ...(queryParams.value.orderStatus !== '0' && {
        orderStatus: queryParams.value.orderStatus
      })
    };

    const res = await orderList(requestParams);
    if (res.code === 200) {
      console.log('订单列表:', res);
      tabList.value = res.rows;
      total.value = res.total;
    }
    proxy?.$modal.closeLoading();
  } catch (error) {
    proxy?.$modal.closeLoading();
  }
};

const cancelOrder = (orderId: number) => {
  ElMessageBox.confirm('确定取消订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      proxy?.$modal.loading('正在加载，请稍候...');
      orderCancel(orderId)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success('取消订单成功');
            getList();
          }
          proxy?.$modal.closeLoading();
        })
        .catch(() => {
          proxy?.$modal.closeLoading();
        });
    })
    .catch(() => {});
};

const confirmReceipt = (orderId: number) => {
  ElMessageBox.confirm('确定签收订单？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      proxy?.$modal.loading('正在加载，请稍候...');
      orderConfirm(orderId)
        .then((res) => {
          if (res.code === 200) {
            ElMessage.success('签收订单成功');
            getList();
          }
          proxy?.$modal.closeLoading();
        })
        .catch(() => {
          proxy?.$modal.closeLoading();
        });
    })
    .catch(() => {});
};
// 每次页面激活时执行（从缓存中恢复）
onMounted(() => {
  getList();
});
</script>

<style scoped>
.orders {
  padding: 20px;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

.table-img {
  width: 60px;
  height: 60px;
}
.pagination {
  margin-top: 24px;
  justify-content: end;
}
</style>
