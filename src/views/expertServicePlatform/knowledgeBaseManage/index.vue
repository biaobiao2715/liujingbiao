<!--
  标题: enterprise/index.vue
  功能: 知识库列表
  说明: 用于知识库列表查询
  当前版本: 1.0
  开发信息: Created by 刘景彪 2025-10-15
-->
<template>
  <div class="kb-management">
    <!-- 搜索条件 -->
    <el-form v-show="showSearch" ref="queryFormRef" :model="queryParams" inline :label-width="130">
      <el-form-item label="文章类别" prop="articleType">
        <el-select v-model="queryParams.articleType" placeholder="请选择" clearable filterable>
          <el-option v-for="dict in article_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="文章标题" prop="articleTitle">
        <el-input v-model="queryParams.articleTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="启用状态" prop="articleStatus">
        <el-select v-model="queryParams.articleStatus" placeholder="请选择" clearable>
          <el-option label="启用" value="2" />
          <el-option label="禁用" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime">
        <el-date-picker
          v-model="queryParams.publishTime"
          type="datetimerange"
          value-format="YYYY-MM-DD HH:mm:ss"
          format="YYYY-MM-DD HH:mm:ss"
          :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          range-separator=" - "
          start-placeholder="开始时间"
          end-placeholder="结束时间"
        />
      </el-form-item>
      <el-form-item>
        <el-button v-throttle type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:add']" type="primary" @click="handleAdd">新增知识库</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:enableAndDisabled']" type="primary" @click="handleEnableBatch">启用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:enableAndDisabled']" type="primary" @click="handleDisableBatch">禁用</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:delete']" type="primary" @click="handleDeleteBatch">删除</el-button>
      </el-col>
      <right-toolbar :show-search="showSearch" @query-table="getList" />
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" border v-loading="loading" style="table-layout: fixed; width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column label="发布时间" align="center" prop="publishTime">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.publishTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文章标题" align="center" prop="articleTitle" :show-overflow-tooltip="true" />
      <el-table-column label="文章类别" align="center" prop="articleType">
        <template #default="scope">
          <dict-text :options="article_type" :value="scope.row.articleType ?? ''" />
        </template>
      </el-table-column>
      <el-table-column label="启用状态" align="center" prop="articleStatus">
        <template #default="scope">
          <span>{{ getEnableStatusText(scope.row.articleStatus) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="浏览量" align="center" prop="viewCount">
        <template #default="scope">
          {{ scope.row.viewCount ?? scope.row.views ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="收藏量" align="center" prop="favoriteCount">
        <template #default="scope">
          {{ scope.row.favoriteCount ?? scope.row.favorites ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="200" fixed="right">
        <template #default="scope">
          <el-button v-throttle v-hasPermi="['system:article:edit']" type="primary" text @click="handleEdit(scope.row)">编辑</el-button>
          <el-button
            v-if="scope.row.articleStatus == '3'"
            v-throttle
            v-hasPermi="['system:article:enableAndDisabled']"
            type="primary"
            text
            @click="handleEnable(scope.row)"
            >启用</el-button
          >
          <el-button
            v-if="scope.row.articleStatus == '2'"
            v-throttle
            v-hasPermi="['system:article:enableAndDisabled']"
            type="primary"
            text
            @click="handleDisable(scope.row)"
            >禁用</el-button
          >
          <el-button v-throttle v-hasPermi="['system:article:query']" type="primary" text @click="handleView(scope.row)">查看</el-button>
          <el-button v-throttle v-hasPermi="['system:article:delete']" type="danger" text @click="handleDeleteOne(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="flex-end pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 方案B弹窗：父级统一控制，异步引入，销毁关闭 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.type === 'add' ? '新增知识库' : dialog.type === 'edit' ? '编辑知识库' : '查看知识库'"
      width="80%"
      destroy-on-close
      :close-on-click-modal="false"
      @close="dialog.type = ''"
    >
      <template #default>
        <component
          :is="dialog.type === 'view' ? DetailsDialog : dialog.type === 'edit' ? EditDialog : dialog.type === 'add' ? EditDialog : null"
          :id="dialog.id"
          @success="onDialogSuccess"
          @cancel="dialog.visible = false"
        />
      </template>
      <template #fallback>
        <el-skeleton :rows="6" animated />
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, getCurrentInstance, type ComponentInternalInstance, computed, defineAsyncComponent, Suspense } from 'vue';
import { useRoute } from 'vue-router';
import { listArticles, delArticle, changeArticleStatus } from '@/api/expertServicePlatform/knowledgeBaseManage/index';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { article_type } = toRefs<any>(proxy?.useDict('article_type'));
// 弹窗控制
const dialog = ref({
  visible: false,
  type: '', // 'add' | 'edit' | 'view'
  id: null
});
const EditDialog = defineAsyncComponent(() => import('./Edit.vue'));
const DetailsDialog = defineAsyncComponent(() => import('./Details.vue'));
// 搜索表单
const queryParams = ref({
  pageNum: 1,
  pageSize: 10,
  articleType: '' as string | number | '',
  articleTitle: '',
  articleStatus: '' as string | number | '',
  publishTime: [] as string[] | []
});

// 列表/分页
const tableData = ref<any[]>([]);
const total = ref(0);
const loading = ref(false);
const showSearch = ref(true);
const queryFormRef = ref();

// 选中
const selectedIds = ref<(string | number)[]>([]);
const selectedRows = ref<any[]>([]);

// 映射
const getEnableStatusText = (s: any) => {
  const map: Record<string, string> = { '2': '启用', '3': '禁用' };
  return map[String(s)] || '-';
};

// 查询列表
const getList = async () => {
  loading.value = true;
  try {
    const res = await listArticles({
      ...queryParams.value,
      publishTime: undefined,
      publishStartTime: queryParams.value.publishTime?.[0],
      publishEndTime: queryParams.value.publishTime?.[1]
    });
    tableData.value = res?.rows ?? res?.data?.list ?? [];
    total.value = res?.total ?? res?.data?.total ?? 0;
  } finally {
    loading.value = false;
  }
};

// 查询/重置
const handleSearch = () => getList();
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};
const handleReset = () => {
  queryFormRef.value?.resetFields?.();
  handleQuery();
};

// 选择变化
const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
  selectedIds.value = selection.map((s) => s.id);
};

// 批量启用/禁用/删除
const ensureSelected = () => {
  if (!selectedIds.value.length) {
    ElMessage.warning('请先选择数据');
    return false;
  }
  return true;
};

const handleEnableBatch = async () => {
  if (!ensureSelected()) return;
  await changeStatusConfirm(selectedIds.value, '2', `确定启用选中的 ${selectedIds.value.length} 条数据吗？`);
};
const handleDisableBatch = async () => {
  if (!ensureSelected()) return;
  await changeStatusConfirm(selectedIds.value, '3', `确定禁用选中的 ${selectedIds.value.length} 条数据吗？`);
};
const handleDeleteBatch = async () => {
  if (!ensureSelected()) return;
  await deleteConfirm(selectedIds.value);
};

// 单行启用/禁用/删除/查看/编辑
const handleEnable = async (row: any) => changeStatusConfirm([row.id], '2', '确定启用该文章吗？');
const handleDisable = async (row: any) => changeStatusConfirm([row.id], '3', '确定禁用该文章吗？');
const handleDeleteOne = async (row: any) => deleteConfirm([row.id]);

const changeStatusConfirm = async (ids: (string | number)[], articleStatus: string, msg: string) => {
  try {
    await ElMessageBox.confirm(msg, '提示', { type: 'warning' });
  } catch {
    return;
  }
  try {
    const res = await changeArticleStatus({ ids, articleStatus });
    if (res?.code === 200) {
      ElMessage.success('操作成功');
      selectedIds.value = [];
      selectedRows.value = [];
      getList();
    } else {
      ElMessage.error(res?.msg ?? '操作失败');
    }
  } catch (e) {
    ElMessage.error('操作失败');
  }
};

const deleteConfirm = async (ids: (string | number)[]) => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${ids.length} 条数据吗？`, '提示', { type: 'warning' });
  } catch {
    return;
  }
  try {
    const res = await delArticle(ids);
    if (res?.code === 200) {
      ElMessage.success('删除成功');
      selectedIds.value = [];
      selectedRows.value = [];
      getList();
    } else {
      ElMessage.error(res?.msg ?? '删除失败');
    }
  } catch (e) {
    ElMessage.error('删除失败');
  }
};

// 方案B弹窗控制
const openDialog = (type: 'add' | 'edit' | 'view', id?: string | number) => {
  dialog.value = { visible: true, type, id: id ?? null };
};
const handleAdd = () => openDialog('add');
const handleEdit = (row: any) => openDialog('edit', row.id);
const handleView = (row: any) => openDialog('view', row.id);

const onDialogSuccess = () => {
  dialog.value.visible = false;
  getList();
};

// 生命周期
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.kb-management {
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .mb8 {
    margin-bottom: 8px;
  }

  .flex-center {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .pagination {
    margin-top: 16px;
  }
}
</style>
