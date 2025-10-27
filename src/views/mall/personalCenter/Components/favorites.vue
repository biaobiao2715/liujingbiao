<!--
        标题: Purchaser.vue
        功能: 我的收藏
        说明: 用于查看我收藏的商品和文章。
        当前版本: 1.0
        开发信息: Created by 刘景彪 2025-10-27
    -->
<template>
  <div class="orders">
    <h2>我的收藏</h2>
    <div class="line"></div>

    <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
      <el-tab-pane label="收藏商品" name="1"></el-tab-pane>
      <el-tab-pane label="收藏文章" name="2"></el-tab-pane>
    </el-tabs>

    <el-table :data="filteredOrders" border style="width: 100%"> </el-table>
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
