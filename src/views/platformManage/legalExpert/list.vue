<!-- 
标题: legalExpertList.vue
功能: 法务专家列表
说明: 用于展示所有法务专家的信息，包括姓名、编号、入驻日期、审核状态等。
开发信息: Create by 李刘超 2025-10-17 16:57:50
当前版本: 1.0
-->

<template>
  <div class="p-2 legal-expert-page">
    <el-card shadow="hover">
      <!-- 查询区域 -->
      <div class="mb-[10px]">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="专家姓名" prop="expertName">
            <el-input v-model="queryParams.expertName" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="专家编号" prop="expertNumber">
            <el-input v-model="queryParams.expertNumber" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="入驻日期" prop="registrationTime">
            <el-date-picker v-model="queryParams.registrationTime" type="date" placeholder="请选择" value-format="YYYY-MM-DD" clearable />
          </el-form-item>
          <el-form-item label="审核状态" prop="reviewStatus">
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
      </div>
      <!-- 列表区域 -->
      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        :data="expertList.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <!-- <el-table-column type="selection" width="45" align="center" /> -->
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="expertName" label="专家名称" min-width="100" align="center" />
        <el-table-column label="专家编码" min-width="140" align="center">
          <template #default="scope">
            <el-link type="primary" @click="handleView(scope.row)">{{ scope.row.expertNumber || '--' }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="contactPhone" label="联系电话" min-width="130" align="center" />
        <el-table-column prop="registrationTime" label="入驻时间" min-width="160" align="center" />
        <el-table-column label="审核状态" min-width="120" align="center" prop="auditStatus">
          <template #default="scope">
            <span v-if="scope.row.auditStatus === '0'">待审核</span>
            <span v-else-if="scope.row.auditStatus === '1'">审核通过</span>
            <span v-else-if="scope.row.auditStatus === '2'">分配账号</span>
            <span v-else-if="scope.row.auditStatus === '3'">分配权限</span>
            <span v-else-if="scope.row.auditStatus === '4'">入驻成功</span>
            <span v-else>入驻失败</span>
          </template>
        </el-table-column>
        <el-table-column label="入库状态" min-width="100" align="center" prop="storageStatus">
          <template #default="scope">
            <span v-if="scope.row.storageStatus === '0'">待入库</span>
            <span v-else-if="scope.row.storageStatus === '1'">已入库</span>
            <span v-else>入库失败</span>
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

    <!-- 详情占位弹窗 -->
    <el-dialog v-model="detailVisible" title="专家详情" width="500px">
      <div>
        <p><b>姓名：</b>{{ detailData?.expertName }}</p>
        <p><b>编号：</b>{{ detailData?.expertNumber }}</p>
        <p><b>审核状态：</b>{{ detailData?.reviewStatus }}</p>
        <p><b>入库状态：</b>{{ detailData?.storageStatus }}</p>
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

<script setup name="LegalExpert" lang="ts">
import { ComponentInternalInstance, getCurrentInstance, reactive, ref } from 'vue';
import { LegalExpertListRequest, LegalExpertList } from '@/api/platform/legalExpert/types';
import { getLegalExpertList } from '@/api/platform/legalExpert';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const expertList = ref<LegalExpertList[]>([]);
const loading = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<ElTableInstance>();

const queryParams = ref<LegalExpertListRequest>({
  pageNum: 1,
  pageSize: 10,
  expertName: '',
  expertNumber: '',
  registrationTime: '',
  reviewStatus: ''
});

const ids = ref<Array<number | string>>([]);
const detailVisible = ref(false);
const detailData = ref<LegalExpertList | null>(null);

const getList = () => {
  loading.value = true;
  getLegalExpertList(queryParams.value).then((res) => {
    expertList.value = res?.rows || [];
    total.value = res.total || 0;
    loading.value = false;
  });
};

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.expertName = '';
  queryParams.value.expertNumber = '';
  queryParams.value.registrationTime = '';
  queryParams.value.reviewStatus = '';
  queryParams.value.pageNum = 1;
  queryParams.value.pageSize = 10;
  handleQuery();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  ids.value = selection.map((item) => item.id);
};

const clearSelection = () => {
  tableRef.value?.clearSelection();
  ids.value = [];
};

// 操作占位
const toggleEnabled = (row: LegalExpertList) => {
  row.startStopStatus = row.startStopStatus === '0' ? '1' : '0';
  proxy?.$modal.msgSuccess(row.startStopStatus === '0' ? '已停用' : '已启用');
};

const handleView = (row: LegalExpertList) => {
  detailData.value = row;
  detailVisible.value = true;
};

const handelCheck = (row: LegalExpertList) => {
  proxy?.$modal.msgSuccess(`已触发审核`);
};

// 初始化
getList();
</script>

<style scoped lang="scss">
.legal-expert-page {
  .table-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}
</style>
