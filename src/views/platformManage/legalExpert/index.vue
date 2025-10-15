<template>
  <div class="p-2 legal-expert-page">
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
              <el-option label="审核通过" value="审核通过" />
              <el-option label="审核中" value="审核中" />
              <el-option label="审核驳回" value="审核驳回" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>

    <!-- 列表区域 -->
    <el-card shadow="hover">
      <template #header>
        <div class="table-header">
          <span>已选择 {{ ids.length }} 项</span>
          <el-link type="primary" @click="clearSelection">清空</el-link>
        </div>
      </template>
      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        :data="expertList.slice((queryParams.pageNum - 1) * queryParams.pageSize, queryParams.pageNum * queryParams.pageSize)"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="45" align="center" />
        <el-table-column label="序号" width="60" align="center">
          <template #default="scope">
            <span>{{ (queryParams.pageNum - 1) * queryParams.pageSize + scope.$index + 1 }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="专家姓名" min-width="100" align="center" />
        <el-table-column label="专家编号" min-width="140" align="center">
          <template #default="scope">
            <el-link type="primary" @click="handleView(scope.row)">{{ scope.row.code }}</el-link>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="专家类型" min-width="100" align="center" />
        <el-table-column prop="phone" label="联系电话" min-width="130" align="center" />
        <el-table-column prop="joinTime" label="入驻时间" min-width="160" align="center" />
        <el-table-column label="审核状态" min-width="120" align="center">
          <template #default="scope">
            <el-tag :type="auditTagType(scope.row.auditStatus)" disable-transitions>{{ scope.row.auditStatus }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入库状态" min-width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.storageStatus === '已入库' ? 'success' : 'info'" disable-transitions>
              {{ scope.row.storageStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="scope">
            <el-link type="primary" @click="toggleEnabled(scope.row)">{{ scope.row.enabled ? '停用' : '启用' }}</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" @click="handleView(scope.row)">查看</el-link>
            <el-divider direction="vertical" />
            <el-link type="primary" @click="handleReupload(scope.row)">重传</el-link>
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
        <p><b>姓名：</b>{{ detailData?.name }}</p>
        <p><b>编号：</b>{{ detailData?.code }}</p>
        <p><b>类型：</b>{{ detailData?.type }}</p>
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

<script setup name="LegalExpert" lang="ts">
import { ComponentInternalInstance, getCurrentInstance, reactive, ref } from 'vue';

interface Expert {
  id: number;
  name: string;
  code: string;
  type: string;
  phone: string;
  joinTime: string; // YYYY-MM-DD HH:mm:ss
  auditStatus: '审核通过' | '审核中' | '审核驳回';
  storageStatus: '未入库' | '已入库';
  enabled: boolean;
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 占位数据（可与后端接口对接替换）
const sourceData = ref<Expert[]>([
  {
    id: 1,
    name: '张三',
    code: 'ZS202509300001',
    type: '法务',
    phone: '15620657660',
    joinTime: '2025-06-17 16:10:56',
    auditStatus: '审核通过',
    storageStatus: '未入库',
    enabled: true
  },
  {
    id: 2,
    name: '李四',
    code: 'ZS202509300002',
    type: '技术',
    phone: '15620657691',
    joinTime: '2025-06-16 16:10:56',
    auditStatus: '审核驳回',
    storageStatus: '已入库',
    enabled: false
  },
  {
    id: 3,
    name: '王二',
    code: 'ZS202509300003',
    type: '法务',
    phone: '15620657692',
    joinTime: '2025-06-16 16:10:56',
    auditStatus: '审核驳回',
    storageStatus: '未入库',
    enabled: true
  },
  {
    id: 4,
    name: '王五',
    code: 'ZS202509300004',
    type: '法务',
    phone: '15620657691',
    joinTime: '2025-06-16 16:10:56',
    auditStatus: '审核已驳回' as any,
    storageStatus: '未入库',
    enabled: true
  },
  {
    id: 5,
    name: '陈强',
    code: 'ZS202509300005',
    type: '法务',
    phone: '13484546765',
    joinTime: '2025-06-16 16:10:56',
    auditStatus: '审核通过',
    storageStatus: '已入库',
    enabled: true
  },
  {
    id: 6,
    name: '洪杰',
    code: 'ZS202509300006',
    type: '技术',
    phone: '13794565340',
    joinTime: '2025-06-17 16:10:56',
    auditStatus: '审核通过',
    storageStatus: '已入库',
    enabled: false
  },
  {
    id: 7,
    name: '李明',
    code: 'ZS202509300007',
    type: '法务',
    phone: '13484546760',
    joinTime: '2025-06-16 16:10:56',
    auditStatus: '审核通过',
    storageStatus: '未入库',
    enabled: true
  },
  {
    id: 8,
    name: '陈阳',
    code: 'ZS202509300008',
    type: '法务',
    phone: '13943246660',
    joinTime: '2025-06-16 16:10:56',
    auditStatus: '审核驳回',
    storageStatus: '未入库',
    enabled: true
  },
  {
    id: 9,
    name: '祝娟',
    code: 'ZS202509300009',
    type: '技术',
    phone: '13209674545',
    joinTime: '2025-06-16 16:10:56',
    auditStatus: '审核通过',
    storageStatus: '未入库',
    enabled: false
  },
  {
    id: 10,
    name: '王明',
    code: 'ZS202509300010',
    type: '法务',
    phone: '13987433460',
    joinTime: '2025-06-17 16:10:56',
    auditStatus: '审核通过',
    storageStatus: '已入库',
    enabled: true
  }
]);

const expertList = ref<Expert[]>([]);
const loading = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const tableRef = ref<ElTableInstance>();

const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  name: '',
  code: '',
  joinDate: '' as string | '',
  auditStatus: ''
});

const ids = ref<Array<number | string>>([]);
const detailVisible = ref(false);
const detailData = ref<Expert | null>(null);

const auditTagType = (status: string) => {
  switch (status) {
    case '审核通过':
      return 'success';
    case '审核中':
      return 'warning';
    case '审核驳回':
    case '审核已驳回':
      return 'danger';
    default:
      return 'info';
  }
};

// 查询列表（本地过滤模拟）
const getList = () => {
  loading.value = true;
  const { name, code, joinDate, auditStatus } = queryParams.value;
  const filtered = sourceData.value.filter((item) => {
    const matchName = name ? item.name.includes(name) : true;
    const matchCode = code ? item.code.includes(code) : true;
    const matchAudit = auditStatus ? item.auditStatus === auditStatus : true;
    // 仅按开始日期筛选：入驻日期 >= 选择的开始日期
    const matchDate = joinDate ? item.joinTime.slice(0, 10) >= joinDate : true;
    return matchName && matchCode && matchAudit && matchDate;
  });
  expertList.value = filtered;
  total.value = filtered.length;
  loading.value = false;
};

// 搜索
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

// 重置
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  queryParams.value.auditStatus = '';
  queryParams.value.joinDate = '';
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
const toggleEnabled = (row: Expert) => {
  row.enabled = !row.enabled;
  proxy?.$modal.msgSuccess(row.enabled ? '已启用' : '已停用');
};

const handleView = (row: Expert) => {
  detailData.value = row;
  detailVisible.value = true;
};

const handleReupload = (row: Expert) => {
  proxy?.$modal.msgSuccess(`已触发重传`);
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
