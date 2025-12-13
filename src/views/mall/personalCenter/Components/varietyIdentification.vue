<!--
  标题: Purchaser.vue
  功能: 品种识别
  说明: 用于查看我的品种识别订单。
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-11-18
-->
<template>
  <div class="orders">
    <!-- 页面标题 -->
    <div class="menu-title">品种识别记录</div>
    <div class="pading20">
      <!-- 搜索条件 -->
      <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
        <el-form-item label="识别时间" prop="identifyTime" label-width="auto">
          <el-date-picker
            v-model="queryParams.identifyTime"
            type="datetimerange"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
            range-separator=" - "
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
        </el-form-item>
        <el-form-item label="品种类型" prop="varietyType" label-width="auto">
          <el-select v-model="queryParams.varietyType" placeholder="请选择品种类型" filterable clearable>
            <el-option v-for="(dict, index) in varietyTypeOptions" :key="index" :label="dict.varietyType" :value="dict.varietyType" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button v-throttle icon="Search" type="primary" @click="handleSearch">查询</el-button>
          <el-button v-throttle icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 操作按钮 -->
      <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
          <el-button v-throttle icon="Plus" type="primary" @click="handleAdd">新增品种识别</el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button v-throttle @click="handleExport"> 导出 </el-button>
        </el-col>
      </el-row>

      <!-- 表格展示 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column label="识别开始时间" align="center" prop="identifyBeginTime" min-width="160">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.identifyBeginTime) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="识别结束时间" align="center" prop="identifyEndTime" min-width="160">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.identifyEndTime) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="图片文件名" align="center" prop="fileName" min-width="160">
          <template #default="scope">
            <span style="color: #108c58" v-on:click="handlePictureCardPreview(scope.row)">{{ scope.row.fileName || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="品种名称" align="center" prop="varietyName" min-width="100" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ scope.row.varietyName || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="品种类型" align="center" prop="varietyType" width="210" style="color: #0000ff">
          <template #default="scope">
            <dict-text :options="review_status" :value="scope.row.varietyType ?? ''" />
          </template>
        </el-table-column>
        <el-table-column label="特征描述" align="center" prop="featureDescription" width="210" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ scope.row.featureDescription || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="种植技术指导" align="center" prop="plantingTechniquesGuidance" width="210" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ scope.row.plantingTechniquesGuidance || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="注意事项" align="center" prop="precautions" width="210" :show-overflow-tooltip="true">
          <template #default="scope">
            {{ scope.row.precautions || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="置信度评分" align="center" prop="confidenceLevel" width="210" fixed="right" :show-overflow-tooltip="true">
          <template #default="scope">
            <span style="color: #108c58">{{ scope.row.confidenceLevel || '-' }}</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex-end pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>
    </div>

    <el-dialog
      :title="dlgTitle"
      v-model="dlgPreviewVisible"
      :before-close="cancelDlg"
      :close-on-click-modal="isReadonly"
      :destroy-on-close="true"
      append-to-body
      width="80%"
    >
      <varietyIdentificationForm :id="selectID" :type="selectType" @refresh="refreshData" @cancel="cancelDlg" />
    </el-dialog>

    <!-- 图片预览 -->
    <el-dialog
      title="预览"
      v-model="picOpen"
      :before-close="picPreBeforeClose"
      class="pic-dialog"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      append-to-body
    >
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, toRefs, onMounted, onActivated, type ComponentInternalInstance } from 'vue';
import { varietyRecognizeList, varietyRecognizeGroupType } from '@/api/mall/personalCenter/varietyIdentification';
import varietyIdentificationForm from './varietyIdentificationForm.vue';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { review_status } = toRefs<any>(proxy?.useDict('review_status'));
// 搜索表单数据
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  varietyType: '',
  identifyTime: [] as string[] | []
});

// 表格数据
const tableData = ref([]);
const total = ref(0);
const loading = ref(true);
const queryFormRef = ref();
// 对话框相关状态
const dlgPreviewVisible = ref(false);
const dlgTitle = ref('');
const isReadonly = ref(false);
const selectID = ref<string | number>('');
const selectType = ref<'view' | 'add'>('view');
// 品种识别类别
const varietyTypeOptions = ref([]);
// 图片预览
const picOpen = ref(false);
const dialogImageUrl = ref('');

/** 查询企业列表 */
const getList = () => {
  loading.value = true;
  const { identifyTime, ...rest } = queryParams.value as any;
  const [identifyBeginTime, identifyEndTime] = Array.isArray(identifyTime) ? identifyTime : [];
  const params = { ...rest, ...(identifyBeginTime && identifyEndTime ? { identifyBeginTime, identifyEndTime } : {}) };

  varietyRecognizeList(params).then((res) => {
    tableData.value = res.rows;
    total.value = res.total;
    loading.value = false;
  });

  // 查询品种识别类别
  varietyRecognizeGroupType().then((res) => {
    varietyTypeOptions.value = res.data;
  });
};

// 查询按钮事件
const handleSearch = () => {
  queryParams.value.pageNum = 1;
  getList();
};
/** 重置按钮操作 */
const handleReset = () => {
  queryFormRef.value?.resetFields();
  handleSearch();
};

// 新增：打开表单对话框
const handleAdd = () => {
  selectID.value = '';
  selectType.value = 'add';
  isReadonly.value = false;
  dlgTitle.value = '新增品种识别';
  dlgPreviewVisible.value = true;
};

// 导出
const handleExport = () => {
  if (tableData.value.length === 0) {
    ElMessage.warning('请先查询数据');
    return;
  }
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const fileName = `品种识别管理_${year}-${month}-${day}.excel`;
  // 解构查询参数
  const { pageNum, pageSize, ...daochu } = queryParams.value;

  // 构造导出参数
  const params = { ...daochu }; // 导出当前查询条件下的全部商品

  // 调用下载方法
  proxy.download('/safeguard-server/varietyRecognize/export', params, fileName);
};
// 关闭对话框
const cancelDlg = () => {
  dlgPreviewVisible.value = false;
};

// 子组件刷新回调
const refreshData = () => {
  dlgPreviewVisible.value = false;
  getList();
};

// 预览关闭
const picPreBeforeClose = () => {
  dialogImageUrl.value = '';
  picOpen.value = false;
};
// 预览
const handlePictureCardPreview = (file: any) => {
  // console.log('预览图片', file);
  // dialogImageUrl.value = file.skeletonURL;
  // picOpen.value = true;
};

onMounted(() => {
  getList();
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
  width: 29px;
  height: 29px;
  margin-right: 3px;
  background-image: url('@/assets/images/mall/variety-identification-icon.png');
}
.pading20 {
  padding: 20px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}
</style>
