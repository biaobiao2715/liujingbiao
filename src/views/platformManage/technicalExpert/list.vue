<!-- 
标题: technicalExpertList.vue
功能: 技术专家列表
说明: 用于展示所有技术专家的信息，包括姓名、编号、入驻日期、审核状态等。
开发信息: Create by 李刘超 2025-10-17 16:57:26
当前版本: 1.0
-->

<template>
  <div class="p-2 technical-expert-page">
    <!-- 查询区域 -->
    <div class="mb-[10px]">
      <el-card shadow="hover">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="专家姓名" prop="name">
            <el-input v-model="queryParams.expertName" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="专家编号" prop="expertNumber">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="入驻日期" prop="registrationTime">
            <el-date-picker v-model="queryParams.registrationTime" type="date" placeholder="请选择"
              value-format="YYYY-MM-DD" clearable />
          </el-form-item>
          <el-form-item label="审核状态" prop="reviewStatus">
            <el-select v-model="queryParams.reviewStatus" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" :value="''" />
              <el-option v-for="dict in reviewStatusDict" :key="dict.value" :label="dict.label" :value="dict.value" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button v-throttle  type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button v-throttle  icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 表格 -->
        <el-table v-loading="loading" :data="list" border style="width: 100%" :header-cell-style="{ fontWeight: 500 }">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="专家姓名" prop="expertName" align="center" :show-overflow-tooltip="true" />
          <el-table-column label="专家编号" prop="expertNumber" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
              <el-link type="primary">{{ scope.row.expertNumber }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="联系电话" prop="contactPhone" align="center" :show-overflow-tooltip="true" />
          <el-table-column label="入驻时间" prop="registrationTime" align="center" width="180">
            <template #default="scope">
              {{ scope.row.registrationTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="审核状态" prop="reviewStatus" align="center">
            <template #default="scope">
              {{ getDictLabel(reviewStatusDict, scope.row.reviewStatus) || '未知' }}
            </template>
          </el-table-column>
          <el-table-column label="入库状态" prop="storageStatus" align="center">
            <template #default="scope">
              {{ scope.row.storageStatus === '0' ? '未入库' : '已入库' }}
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="200">
            <template #default="scope">
              <el-link type="primary" v-if="scope.row.reviewStatus === '1'" @click="open(scope.row)">{{
                scope.row.startStopStatus === '0' ? '停用' : '启用'
              }}</el-link>

              <el-link style="margin-left: 10px" type="primary" v-if="scope.row.reviewStatus === '1'"
                @click="handleEdit(scope.row, 'view')">查看</el-link>
              <el-link style="margin-left: 10px" type="primary" v-if="scope.row.reviewStatus === '0'"
                @click="handleEdit(scope.row, 'audit')">审核</el-link>
            </template>
          </el-table-column>
        </el-table>

        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
          :total="total" @pagination="handleQuery" />
      </el-card>
    </div>
    <el-dialog v-model="dialogVisible" width="30%">
      <template #header>
        <span>{{ dialogMessage.startStopStatus === '1' ? '启用' : '停用' }}</span>
      </template>
      <div>{{ dialogMessage.startStopStatus === '1' ? '请确认是否启用该专家信息?' : '请确认是否停用该专家信息？' }}</div>
      <template #footer>
        <el-button v-throttle  @click="close">取消</el-button>
        <el-button v-throttle  type="primary" @click="toggleEnabled(dialogMessage)" :loading="loadingStatus"> 确定 </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TechnicalExpert" lang="ts">
import { getTechnicalExpertList, techUpdateOrSaveData } from '@/api/platform/technicalExpert';
import { TechnicalExpertListRequest, TechnicalExpertList } from '@/api/platform/technicalExpert/types';
import { ComponentInternalInstance, getCurrentInstance, reactive, ref } from 'vue';
import { useDict } from '@/utils/dict';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

//获取字典数据
const { review_status: reviewStatusDict } = useDict('review_status');


// 根据字典值获取标签
const getDictLabel = (dict: any[], value: string) => {
  if (!dict || !value) return '';
  const item = dict.find(item => item.value === value);
  return item ? item.label : '';
};

// 查询参数
const queryParams = reactive<TechnicalExpertListRequest>({
  expertName: '',
  registrationTime: '',
  reviewStatus: '',
  pageNum: 1,
  pageSize: 10
});
const dialogVisible = ref(false);

// 列表与分页
const list = ref<TechnicalExpertList[]>([]);
const total = ref(0);
const queryFormRef = ref();
const loading = ref(false);

const getList = () => {
  loading.value = true;
  getTechnicalExpertList(queryParams)
    .then((res) => {
      if (res.code === 200) {
        list.value = res.rows || [];
        total.value = res.total || 0;
      }
    })
    .finally(() => {
      loading.value = false;
    });
};

// 查询
const handleQuery = () => {
  getList();
};

// 重置
const resetQuery = () => {
  queryParams.expertName = '';
  queryParams.registrationTime = '';
  queryParams.reviewStatus = '';
  queryParams.pageNum = 1;
  handleQuery();
};
const dialogMessage = ref<TechnicalExpertList>({} as TechnicalExpertList);
const loadingStatus = ref(false);
// 弹窗点击确定
const toggleEnabled = async (message: TechnicalExpertList) => {
  if (loadingStatus.value || !message.id) return;
  loadingStatus.value = true;
  // 停用：0 -> 1
  // 启用：1 -> 0
  // 是否启用
  const isEnabled = message.startStopStatus === '1';
  const res = await techUpdateOrSaveData({
    optType: isEnabled ? '5' : '4',
    hnBaseTechExpertInfoBo: {
      id: message.id
    }
  }).finally(() => {
    loadingStatus.value = false;
    close();
  });
  if (res.code === 200) {
    message.startStopStatus = isEnabled ? '0' : '1';
    proxy?.$modal.msgSuccess(isEnabled ? '已启用' : '已停用');
  }
};
const open = (row: TechnicalExpertList) => {
  dialogMessage.value = row;
  dialogVisible.value = true;
};
const close = () => {
  dialogVisible.value = false;
};

const router = useRouter();
const handleEdit = (row: any, type: 'view' | 'edit' | 'audit') => {
  router.push({
    path: '/platform/technical/audit/details',
    query: {
      id: row.id,
      type
    }
  });
};
// 初始化
handleQuery();
</script>

<style scoped lang="scss">
.technical-expert-page {
  .table-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
