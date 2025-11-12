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
                <div>{{ scope.row.orderItems[0]?.goodsSpecificationValue }}{{ scope.row.orderItems[0]?.goodsSpecificationLabel }}</div>
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
          <template v-slot="scope">
            <dict-tag :options="order_status" :value="scope.row.orderStatus" />
          </template>
        </el-table-column>
        <!-- 商家联系电话 -->
        <el-table-column prop="enterprisePhone" label="商家联系电话" align="center"></el-table-column>
        <!-- 销售订单号 -->
        <el-table-column prop="orderSn" label="销售订单号" min-width="150" :show-overflow-tooltip="true" align="center"></el-table-column>
        <!-- 操作列 -->
        <el-table-column label="操作" min-width="150" align="center">
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
              style="color: #108c58"
              >举报商品</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <div class="flex-center pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>

      <!-- 举报商品弹窗 -->
      <el-dialog v-model="reportDialogVisible" title="我要举报" width="600px" :close-on-click-modal="false">
        <el-form :model="reportForm" label-width="120px">
          <!-- 举报类别 -->
          <el-form-item label="举报类别" required>
            <el-select v-model="reportForm.type" placeholder="请选择">
              <el-option label="假冒伪劣" value="1" />
              <el-option label="虚假宣传" value="2" />
              <el-option label="其他" value="3" />
            </el-select>
          </el-form-item>
          <!-- 被举报方 -->
          <el-form-item label="被举报方" required>
            <el-input v-model="reportForm.target" placeholder="带出被举报方信息" />
          </el-form-item>
          <!-- 举报商品 -->
          <el-form-item label="举报商品" required>
            <el-input v-model="reportForm.goods" placeholder="带出举报商品信息" />
          </el-form-item>
          <!-- 举报材料上传 -->
          <el-form-item label="举报材料" required class="uploadcss">
            <el-upload
              :file-list="hnGoodsFilesList"
              :limit="6"
              ref="refShop"
              list-type="picture-card"
              action="#"
              :before-upload="handleBeforeUpload"
              :http-request="uploadFile"
              :on-remove="handleDelete"
              :on-exceed="handleExceed"
            >
              <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div>1.支持jpg、jpeg、png三种图片格式，最多上传六张图片，每张图片大小不超过10MB</div>
            <div>2.支持MP4、mov、avi三种视频格式，最多上传三个视频，每个视频限制大小200MB</div>
          </el-form-item>
          <!-- 举报描述 -->
          <el-form-item label="举报描述" required>
            <el-input
              type="textarea"
              v-model="reportForm.desc"
              placeholder="请输入举报描述，最大长度为200个字"
              maxlength="200"
              show-word-limit
              :rows="3"
            />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="reportDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReport">提交</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
// -------------------- 引入依赖 --------------------
import { ref, toRefs, onMounted, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { orderConfirm, orderCancel, orderList, ossUploadImage, Order } from '@/api/mall/personalCenter/orders';
import { ElMessage, ElMessageBox } from 'element-plus';

// -------------------- 响应式数据 --------------------
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { order_status } = toRefs<any>(proxy?.useDict('order_status')); // 订单状态字典

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
const reportForm = ref({
  type: '',
  target: '',
  goods: '',
  materials: [],
  desc: ''
});
const hnGoodsFilesList = ref<any[]>([]);
const refShop = ref<any>(null);
const currentReportRow = ref<any>(null);
let timer: NodeJS.Timeout | null = null;

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
  currentReportRow.value = row;
  reportForm.value.type = '';
  reportForm.value.target = row.enterprisePhone || '';
  reportForm.value.goods = row.orderItems[0]?.goodsName || '';
  reportForm.value.materials = [];
  reportForm.value.desc = '';
  hnGoodsFilesList.value = [];
  reportDialogVisible.value = true;
};

/**
 * 提交举报
 */
const submitReport = () => {
  // 提交举报逻辑，可根据实际需求调用接口
  ElMessage.success('举报已提交');
  reportDialogVisible.value = false;
};

/**
 * 删除举报材料
 * @param file 文件对象
 */
const handleDelete = (file: any) => {
  const findex = hnGoodsFilesList.value.map((f: any) => f.path).indexOf(file.path);
  if (findex > -1) hnGoodsFilesList.value.splice(findex, 1);
};

/**
 * 上传举报材料
 * @param file 文件对象
 */
const uploadFile = (file: any) =>
  new Promise((resolve, reject) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => processUpload(file, resolve, reject), 500);
  });

/**
 * 处理文件上传
 */
const processUpload = (file: any, resolve: any, reject: any) => {
  const fileData = file.file;
  ossUploadImage({ file: fileData })
    .then((response) => {
      const newFile = {
        name: response.data.fileName || '举报材料',
        url: response.data.url,
        fileType: '0',
        ossId: response.data.ossId
      };
      hnGoodsFilesList.value.push(newFile);
      proxy?.$modal.closeLoading();
      resolve(newFile);
    })
    .catch((error) => {
      proxy?.$modal.closeLoading();
      ElMessage.error(error.msg || '文件上传失败，请重试');
      refShop.value.handleRemove(file);
      reject(error);
    });
};

/**
 * 超出上传数量限制
 */
const handleExceed = () => ElMessage.error(`上传文件数量不能超过6个!`);

/**
 * 上传前校验
 * @param file 文件对象
 * @returns 是否允许上传
 */
const handleBeforeUpload = (file: any) => {
  // 支持的图片和视频类型
  const imageTypes = ['jpg', 'jpeg', 'png'];
  const videoTypes = ['mp4', 'mov', 'avi'];

  // 获取文件扩展名
  let fileExtension = '';
  if (file.name.lastIndexOf('.') > -1) {
    fileExtension = file.name.slice(file.name.lastIndexOf('.') + 1).toLowerCase();
  }

  // 判断文件类型
  const isImage = imageTypes.includes(fileExtension);
  const isVideo = videoTypes.includes(fileExtension);

  if (!isImage && !isVideo) {
    ElMessage.error('文件格式不正确, 仅支持jpg/jpeg/png图片或mp4/mov/avi视频!');
    return false;
  }

  // 图片最大10MB，视频最大200MB
  const maxImageSize = 10; // MB
  const maxVideoSize = 200; // MB
  const fileSizeMB = file.size / 1024 / 1024;

  if (isImage && fileSizeMB > maxImageSize) {
    ElMessage.error(`上传图片大小不能超过 ${maxImageSize} MB!`);
    return false;
  }
  if (isVideo && fileSizeMB > maxVideoSize) {
    ElMessage.error(`上传视频大小不能超过 ${maxVideoSize} MB!`);
    return false;
  }

  proxy?.$modal.loading('正在上传文件，请稍候...');
  return true;
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
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}
.menu-title::before {
  content: '';
  display: inline-block;
  width: 26px;
  height: 26px;
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 12px;
}
.pading20 {
  padding: 20px;
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
