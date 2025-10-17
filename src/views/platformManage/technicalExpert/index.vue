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
            <el-date-picker v-model="queryParams.registrationTime" type="date" placeholder="请选择" value-format="YYYY-MM-DD" clearable />
          </el-form-item>
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="queryParams.reviewStatus" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" :value="''" />
              <el-option label="待审核" value="0" />
              <el-option label="审核通过" value="1" />
              <el-option label="分配账号" value="2" />
              <el-option label="分配权限" value="3" />
              <el-option label="入驻成功" value="4" />
              <el-option label="入驻失败" value="99" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>

        <!-- 表格 -->
        <el-table ref="tableRef" :data="list" border style="width: 100%" :header-cell-style="{ fontWeight: 500 }">
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
              {{ reviewStatusMap[scope.row.reviewStatus] || '未知' }}
            </template>
          </el-table-column>
          <el-table-column label="入库状态" prop="storageStatus" align="center">
            <template #default="scope">
              {{ scope.row.storageStatus === '0' ? '未入库' : '已入库' }}
            </template>
          </el-table-column>

          <el-table-column label="操作" align="center" width="200">
            <template #default="scope">
              <el-link type="primary" v-if="scope.row.reviewStatus === '1'" @click="toggleEnabled(scope.row)">{{
                scope.row.startStopStatus === '0' ? '停用' : '启用'
              }}</el-link>

              <el-link style="margin-left: 10px" type="primary" v-if="scope.row.reviewStatus === '1'" @click="handleView(scope.row)">查看</el-link>
              <el-link type="primary" v-if="scope.row.reviewStatus === '0'" @click="handelCheck(scope.row)">审核</el-link>
            </template>
          </el-table-column>
        </el-table>

        <pagination
          v-show="total > 0"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          @pagination="handleQuery"
        />
      </el-card>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="专家详情" width="500px">
      <div>
        <p><b>姓名：</b>{{ detailData?.expertName }}</p>
        <p><b>专家编号：</b>{{ detailData?.expertNumber }}</p>
        <p><b>联系电话：</b>{{ detailData?.contactPhone }}</p>
        <p><b>入驻时间：</b>{{ detailData?.contactPhone }}</p>
        <p><b>审核状态：</b>{{ reviewStatusMap[detailData?.reviewStatus] || '未知' }}</p>
        <p><b>入库状态：</b>{{ detailData?.storageStatus === '0' ? '未入库' : '已入库' }}</p>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="detailVisible = false">确 定</el-button>
          <el-button @click="detailVisible = false">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="TechnicalExpert" lang="ts">
import { getTechnicalExpertList } from '@/api/platform/technicalExpert';
import { TechnicalExpertListRequest, TechnicalExpertList } from '@/api/platform/technicalExpert/types';
import { ComponentInternalInstance, getCurrentInstance, reactive, ref } from 'vue';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 查询参数
const queryParams = reactive<TechnicalExpertListRequest>({
  expertName: '',
  registrationTime: '',
  reviewStatus: '',
  pageNum: 1,
  pageSize: 10
});

// 列表与分页
const list = ref<TechnicalExpertList[]>([]);
const total = ref(0);
const tableRef = ref();
const queryFormRef = ref();

// 详情弹窗
const detailVisible = ref(false);
const detailData = ref<TechnicalExpertList | null>(null);

const reviewStatusMap = {
  '0': '待审核',
  '1': '审核通过',
  '2': '分配账号',
  '3': '分配权限',
  '4': '入驻成功',
  '99': '入驻失败'
};
const getList = () => {
  getTechnicalExpertList(queryParams).then((res) => {
    if (res.code === 200) {
      list.value = res.rows || [];
      total.value = res.total || 0;
    }
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

// 操作
const toggleEnabled = (row: TechnicalExpertList) => {
  row.startStopStatus = row.startStopStatus === '0' ? '1' : '0';
  proxy?.$modal.msgSuccess(row.startStopStatus === '0' ? '已启用' : '已停用');
};

const handleView = (row: TechnicalExpertList) => {
  detailData.value = row;
  detailVisible.value = true;
};

const handleEdit = (row: TechnicalExpertList) => {
  proxy?.$modal.msgSuccess(`进入编辑：${row.expertName}`);
};
// 审核
const handelCheck = (row: TechnicalExpertList) => {
  proxy?.$modal.msgSuccess(`审核：${row.expertName}`);
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
