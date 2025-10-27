<!--
        标题: Purchaser.vue
        功能: 我的最近订单
        说明: 用于查看我最近购买的订单。
        当前版本: 1.0
        开发信息: Created by 刘景彪 2025-10-27
    -->
<template>
  <div class="orders">
    <h2>我的最近订单</h2>
    <div class="line"></div>

    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="全部" name="0"></el-tab-pane>
      <el-tab-pane v-for="value in goods_status" :label="value.label" :name="value.value"></el-tab-pane>
    </el-tabs>

    <el-table :data="filteredOrders" style="width: 100%">
      <el-table-column prop="productName" label="商品信息" width="200" :show-overflow-tooltip="true">
        <template v-slot="scope">
          <div style="display: flex">
            <img class="table-img" :src="scope.row.imagePathMain" />
            <span style="margin-left: 10px">{{ scope.row.headline }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="price" label="商品价格" width="100">
        <template #default="{ row }"> {{ row.price }}元 </template>
      </el-table-column>
      <el-table-column prop="status" label="订单状态" width="100">
        <template v-slot="scope">
          <dict-tag :options="goods_status" :value="scope.row.reviewStatus" />
        </template>
      </el-table-column>
      <el-table-column prop="phone" label="商家联系电话" width="150"></el-table-column>
      <el-table-column prop="orderNumber" label="销售订单号" width="200"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button v-if="row.status === '待发货'" type="danger" size="small" @click="cancelOrder(row.id)"> 取消订单 </el-button>
          <el-button v-if="row.status === '已发货'" type="primary" size="small" @click="confirmReceipt(row.id)"> 签收 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, computed } from 'vue';
import type { TabsPaneContext } from 'element-plus';
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
const { goods_status } = toRefs<any>(proxy?.useDict('goods_status'));
const activeName = ref('first');
const orders: Order[] = [
  { id: 1, productName: '商品1', price: 200, status: '待发货', phone: '15629373858', orderNumber: 'SA202509121100000005' },
  { id: 2, productName: '商品2', price: 200, status: '已发货', phone: '15629373851', orderNumber: 'SA202509121100000004' },
  { id: 3, productName: '商品3', price: 200, status: '已取消', phone: '15629373852', orderNumber: 'SA202509121100000003' },
  { id: 4, productName: '商品4', price: 200, status: '已完成', phone: '15629373853', orderNumber: 'SA202509121100000002' }
];

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event);
};

const filteredOrders = computed(() => {
  // 可根据需求添加过滤逻辑
  return orders;
});

const cancelOrder = (orderId: number) => {
  console.log(`取消订单: ${orderId}`);
  // 添加取消订单的逻辑
};

const confirmReceipt = (orderId: number) => {
  console.log(`签收订单: ${orderId}`);
  // 添加签收订单的逻辑
};
</script>

<style scoped>
.orders {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
}

.line {
  height: 1px;
  background-color: #f0f0f0;
  margin-bottom: 20px;
}

.table-img {
  width: 60px;
  height: 60px;
}
</style>
