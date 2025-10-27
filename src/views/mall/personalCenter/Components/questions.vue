<!--
        标题: Purchaser.vue
        功能: 我的提问
        说明: 用于查看我发布的提问。
        当前版本: 1.0
        开发信息: Created by 刘景彪 2025-10-27
    -->
<template>
  <div class="orders">
    <h2>我的提问</h2>
    <div class="line"></div>

    <el-table :data="filteredOrders" border style="width: 100%">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column prop="price" label="我的提问" width="100"></el-table-column>
      <el-table-column prop="phone" label="发布时间" width="150">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.reviewTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="orderNumber" label="销售订单号" width="200"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="{ row }">
          <el-button v-if="row.status === '待发货'" type="danger" size="small" @click="cancelOrder(row.id)"> 关闭 </el-button>
          <el-button type="primary" size="small" @click="confirmReceipt(row.id)"> 查看 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, computed } from 'vue';
import type { TabsPaneContext } from 'element-plus';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
interface Order {
  id: number;
  productName: string;
  price: number;
  status: string;
  phone: string;
  orderNumber: string;
}

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
</style>
