<template>
  <div class="p-2 technical-expert-page">
    <!-- 查询区域 -->
    <div class="mb-[10px]">
      <el-card shadow="hover">
        <el-form ref="queryFormRef" :model="queryParams" :inline="true">
          <el-form-item label="专家姓名" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入专家姓名" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="专家编号" prop="code">
            <el-input v-model="queryParams.code" placeholder="请输入专家编号" clearable @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="入驻日期" prop="joinDate">
            <el-date-picker v-model="queryParams.joinDate" type="date" placeholder="请选择" value-format="YYYY-MM-DD" clearable />
          </el-form-item>
          <el-form-item label="审核状态" prop="auditStatus">
            <el-select v-model="queryParams.auditStatus" placeholder="全部" clearable style="width: 140px">
              <el-option label="全部" :value="''" />
              <el-option label="待审核" value="待审核" />
              <el-option label="审核通过" value="审核通过" />
              <el-option label="审核驳回" value="审核驳回" />
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
          <el-table-column label="专家姓名" prop="name" align="center" :show-overflow-tooltip="true" />
          <el-table-column label="专家编号" prop="code" align="center" :show-overflow-tooltip="true">
            <template #default="scope">
              <el-link type="primary">{{ scope.row.code }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="联系电话" prop="phone" align="center" :show-overflow-tooltip="true" />
          <el-table-column label="入驻时间" prop="joinTime" align="center" width="180" />
          <el-table-column label="审核状态" prop="auditStatus" align="center" />
          <el-table-column label="入库状态" prop="storageStatus" align="center" />
          <el-table-column label="操作" align="center" width="200">
            <template #default="scope">
              <el-link type="primary" @click="toggleEnabled(scope.row)">{{ scope.row.enabled ? '停用' : '启用' }}</el-link>

              <el-link type="primary" @click="handleView(scope.row)">查看</el-link>
              <el-divider direction="vertical" />
              <el-link type="primary" @click="handelCheck(scope.row)">审核</el-link>
              <el-link type="primary" @click="handleEdit(scope.row)">编辑</el-link>
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
        <p><b>姓名：</b>{{ detailData?.name }}</p>
        <p><b>编号：</b>{{ detailData?.code }}</p>
        <p><b>联系电话：</b>{{ detailData?.phone }}</p>
        <p><b>入驻时间：</b>{{ detailData?.joinTime }}</p>
        <p><b>审核状态：</b>{{ detailData?.auditStatus }}</p>
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

<script setup name="TechnicalExpert" lang="ts">
import { ComponentInternalInstance, getCurrentInstance, reactive, ref } from 'vue';

interface Expert {
  id: number;
  name: string;
  code: string;
  phone: string;
  joinTime: string; // YYYY-MM-DD HH:mm:ss
  auditStatus: '待审核' | '审核通过' | '审核驳回';
  storageStatus: '未入库' | '已入库';
  enabled: boolean;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 查询参数
const queryParams = reactive({
  name: '',
  code: '',
  joinDate: '',
  auditStatus: '',
  pageNum: 1,
  pageSize: 10
});

// 列表与分页
const list = ref<Expert[]>([]);
const total = ref(0);
const tableRef = ref();
const queryFormRef = ref();

// 详情弹窗
const detailVisible = ref(false);
const detailData = ref<Expert | null>(null);

// 模拟数据（后端联调时替换为接口）
const allData: Expert[] = [];

// 查询
const handleQuery = () => {
  // 过滤
  let data = allData.slice();
  if (queryParams.name) {
    data = data.filter((d) => d.name.includes(queryParams.name));
  }
  if (queryParams.code) {
    data = data.filter((d) => d.code.includes(queryParams.code));
  }
  if (queryParams.auditStatus) {
    data = data.filter((d) => d.auditStatus === queryParams.auditStatus);
  }
  if (queryParams.joinDate) {
    data = data.filter((d) => d.joinTime.startsWith(queryParams.joinDate));
  }

  total.value = data.length;
  const start = (queryParams.pageNum - 1) * queryParams.pageSize;
  list.value = data.slice(start, start + queryParams.pageSize);
};

// 重置
const resetQuery = () => {
  queryParams.name = '';
  queryParams.code = '';
  queryParams.joinDate = '';
  queryParams.auditStatus = '';
  queryParams.pageNum = 1;
  handleQuery();
};

// 操作
const toggleEnabled = (row: Expert) => {
  row.enabled = !row.enabled;
  proxy?.$modal.msgSuccess(row.enabled ? '已启用' : '已停用');
};

const handleView = (row: Expert) => {
  detailData.value = row;
  detailVisible.value = true;
};

const handleEdit = (row: Expert) => {
  proxy?.$modal.msgSuccess(`进入编辑：${row.name}`);
};
// 审核
const handelCheck = (row: Expert) => {
  proxy?.$modal.msgSuccess(`审核：${row.name}`);
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
