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
    <div class="title">我的订单</div>
    <el-divider />

    <!--
      使用 v-model 与查询参数 orderStatus 绑定，去除额外状态变量
      点击 Tab 时触发 getList 拉取对应状态的数据
    -->
    <el-tabs v-model="queryParams.orderStatus" class="demo-tabs" @tab-change="onTabChange">
      <el-tab-pane label="全部" name="0" key="0"></el-tab-pane>
      <el-tab-pane v-for="value in order_status" :key="value.value" :label="value.label" :name="value.value"></el-tab-pane>
    </el-tabs>

    <el-table :data="tabList" style="width: 100%">
      <el-table-column prop="goodsName" label="商品信息" width="200" :show-overflow-tooltip="true">
        <template v-slot="scope">
          <div style="display: flex">
            <!-- 图片增加兜底，避免空值报错 -->
            <img class="table-img" :src="scope.row.orderItems[0]?.goodsPic || ''" />
            <span style="margin-left: 10px">{{ scope.row.orderItems[0]?.goodsName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="goodsPrice" label="商品价格" align="center">
        <template #default="{ row }"> {{ row.orderItems?.goodsPrice }}元 </template>
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
// 引入 Vue 能力/类型，增强类型安全
import { ref, toRefs, onMounted, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { orderConfirm, orderCancel, orderList } from '@/api/mall/personalCenter/orders';

// 订单条目与订单结构类型，匹配后端返回结构
interface OrderItem {
  goodsPic: string;
  goodsName: string;
  goodsPrice: number | string;
}
interface Order {
  id: number;
  orderItems: OrderItem;
  orderStatus: string;
  enterprisePhone: string;
  orderSn: string;
}

// Vue 上下文
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据（RuoYi: useDict 返回响应式对象）
const { order_status } = toRefs<any>(proxy?.useDict('order_status'));

// 列表数据与加载状态
const tabList = ref<Order[]>([]);
const total = ref(0);
const loading = ref(false); // 表格/页面加载状态

// 查询参数（订单状态: 0全部，1待发货，2待收货，3已完成，4已取消）
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  orderStatus: '0'
});

const onTabChange = (name: string | number) => {
  queryParams.value.pageNum = 1;
  queryParams.value.orderStatus = String(name);
  if (String(name) === '0') {
    // 当 orderStatus 为 '0' 时不传递该字段
    delete queryParams.value.orderStatus;
  }
  getList();
};

// 拉取列表
const getList = async () => {
  loading.value = true;
  proxy?.$modal.loading('正在加载，请稍候...');
  try {
    const res = await orderList(queryParams.value);
    if (res.code === 200) {
      // 成功赋值，兜底空值
      tabList.value = res.rows || [];
      total.value = res.total || 0;
    }
  } catch (error) {
    // 可根据需要增加错误提示
  } finally {
    proxy?.$modal.closeLoading();
    loading.value = false;
  }
};

// 取消订单
const cancelOrder = async (orderId: number) => {
  try {
    await ElMessageBox.confirm('确定取消订单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    proxy?.$modal.loading('正在加载，请稍候...');
    const res = await orderCancel(orderId);
    if (res.code === 200) {
      ElMessage.success('取消订单成功');
      getList();
    }
  } catch {
    // 用户取消或请求失败
  } finally {
    proxy?.$modal.closeLoading();
  }
};

// 确认收货
const confirmReceipt = async (orderId: number) => {
  try {
    await ElMessageBox.confirm('确定签收订单？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });
    proxy?.$modal.loading('正在加载，请稍候...');
    const res = await orderConfirm(orderId);
    if (res.code === 200) {
      ElMessage.success('签收订单成功');
      getList();
    }
  } catch {
    // 用户取消或请求失败
  } finally {
    proxy?.$modal.closeLoading();
  }
};

// 首次进入/挂载拉取数据
onMounted(() => {
  onTabChange('0');
});
</script>

<style scoped>
/* 页面布局样式 */
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
