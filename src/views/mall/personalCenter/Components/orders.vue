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

      <!-- 举报商品弹窗 -->
      <el-dialog v-model="reportDialogVisible" title="我要举报" width="600px" :close-on-click-modal="false">
        <el-form :model="reportForm" :rules="reportRules" ref="reportFormRef" label-width="120px">
          <!-- 举报类别 -->
          <el-form-item label="举报类别" prop="type">
            <el-select v-model="reportForm.type" placeholder="请选择">
              <el-option v-for="dict in report_type_id" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>

          <!-- 被举报方 -->
          <el-form-item label="被举报方" prop="target">
            <el-input v-model="reportForm.target" placeholder="带出被举报方信息" />
          </el-form-item>

          <!-- 举报商品 -->
          <el-form-item label="举报商品" prop="goods">
            <el-input v-model="reportForm.goods" placeholder="带出举报商品信息" />
          </el-form-item>

          <!-- 举报材料上传 -->
          <el-form-item label="举报材料" prop="materials" class="uploadcss">
            <el-upload
              :file-list="hnGoodsFilesList"
              :limit="9"
              ref="refShop"
              list-type="picture-card"
              action="#"
              :before-upload="handleBeforeUpload"
              :http-request="uploadFile"
              :on-remove="handleDelete"
              :on-exceed="handleExceed"
              :on-change="onUploadChange"
            >
              <el-icon class="avatar-uploader-icon"><Plus /></el-icon>
            </el-upload>
            <div>1.支持jpg、jpeg、png三种图片格式，最多上传六张图片，每张图片大小不超过10MB</div>
            <div>2.支持MP4、mov、avi三种视频格式，最多上传三个视频，每个视频限制大小200MB</div>
          </el-form-item>

          <!-- 举报描述 -->
          <el-form-item label="举报描述" prop="desc" required>
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
import { ref, reactive, toRefs, onMounted, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { orderConfirm, orderCancel, orderList, ossUploadImage, Order } from '@/api/mall/personalCenter/orders';
import { ElMessage, ElMessageBox } from 'element-plus';

// -------------------- 响应式数据 --------------------
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { order_status, report_type_id } = toRefs<any>(proxy?.useDict('order_status')); // 订单状态字典

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
const reportFormRef = ref();

// 表单模型，增加一个 materials 字段用于配合校验（与上传列表联动）
const reportForm = reactive({
  type: '',
  target: '',
  goods: '',
  desc: '',
  materials: []
});
const hnGoodsFilesList = ref<any[]>([]); // 上传的文件列表
const refShop = ref<any>(null); // 上传组件实例
let timer: NodeJS.Timeout | null = null; // 防抖定时器
// 自定义校验：至少上传一份材料
const validateMaterials = (_rule: any, _value: any, callback: (err?: Error) => void) => {
  if (!hnGoodsFilesList.value || hnGoodsFilesList.value.length === 0) {
    callback(new Error('请至少上传一份举报材料'));
  } else {
    callback();
  }
};

const reportRules = {
  type: [{ required: true, message: '请选择举报类别', trigger: 'change' }],
  target: [
    { required: true, message: '请输入被举报方', trigger: 'blur' },
    { min: 2, max: 50, message: '长度为 2-50 个字符', trigger: 'blur' }
  ],
  goods: [{ required: true, message: '请输入举报商品', trigger: 'blur' }],
  desc: [
    { required: true, message: '请输入举报描述', trigger: 'blur' },
    { min: 1, max: 200, message: '描述最多 200 字', trigger: 'blur' }
  ],
  materials: [{ validator: validateMaterials, trigger: 'change' }]
};
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
  // currentReportRow.value = row;
  reportForm.type = '';
  reportForm.target = row.enterpriseName || '';
  reportForm.goods = row.orderItems[0]?.goodsName || '';
  reportForm.materials = [];
  reportForm.desc = '';
  hnGoodsFilesList.value = [];
  reportDialogVisible.value = true;
};

/**
 * 提交举报
 */
const submitReport = () => {
  reportForm.materials = hnGoodsFilesList.value;
  reportFormRef.value
    ?.validate()
    .then(() => {
      // 校验通过，提交举报逻辑
      console.log('举报内容:', reportForm);
      ElMessage.success('举报已提交');
      reportDialogVisible.value = false;
    })
    .catch(() => {
      // 校验不通过，不提交举报
      ElMessage.error('请填写完整举报信息');
    });
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
const handleBeforeUpload = (file: File) => {
  const isImage = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
  const isVideo = ['video/mp4', 'video/quicktime', 'video/x-msvideo'].includes(file.type); // mp4/mov/avi

  if (!isImage && !isVideo) {
    ElMessage.error('仅支持图片(jpg/jpeg/png)或视频(mp4/mov/avi)');
    return false;
  }
  if (isImage && file.size / 1024 / 1024 > 10) {
    ElMessage.error('单张图片大小不能超过 10MB');
    return false;
  }
  if (isVideo && file.size / 1024 / 1024 > 200) {
    ElMessage.error('单个视频大小不能超过 200MB');
    return false;
  }

  // 按类型分别限制数量：图片 <= 6，视频 <= 3
  const imgCount = hnGoodsFilesList.value.filter((f) => (f.raw?.type || f.type || '').startsWith('image/')).length;
  const videoCount = hnGoodsFilesList.value.filter((f) => (f.raw?.type || f.type || '').startsWith('video/')).length;

  if (isImage && imgCount >= 6) {
    ElMessage.error('最多上传 6 张图片');
    return false;
  }
  if (isVideo && videoCount >= 3) {
    ElMessage.error('最多上传 3 个视频');
    return false;
  }
  return true;
};

// 当文件列表变化时，让表单重新校验“举报材料”
const onUploadChange = () => {
  reportFormRef.value?.validateField('materials');
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
  background: #108c58;
  border-radius: 4px 4px 4px 4px;
  margin-right: 12px;
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
