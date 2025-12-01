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
    <el-form ref="queryFormRef" :model="queryParams" inline label-position="left">
      <el-form-item label="文章类别" prop="articleType" label-width="auto">
        <el-select v-model="queryParams.articleType" placeholder="请选择" clearable filterable>
          <el-option v-for="dict in article_type" :key="dict.value" :label="dict.label" :value="dict.value" />
        </el-select>
      </el-form-item>
      <el-form-item label="文章标题" prop="articleTitle" label-width="auto">
        <el-input v-model="queryParams.articleTitle" placeholder="请输入标题" clearable @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="启用状态" prop="articleStatus" label-width="auto">
        <el-select v-model="queryParams.articleStatus" placeholder="请选择" clearable>
          <el-option label="启用" value="2" />
          <el-option label="禁用" value="3" />
        </el-select>
      </el-form-item>
      <el-form-item label="发布时间" prop="publishTime" label-width="auto">
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
        <el-button v-throttle v-hasPermi="['system:article:list']" icon="Search" type="primary" @click="handleSearch">查询</el-button>
        <el-button v-throttle v-hasPermi="['system:article:list']" icon="Refresh" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 操作按钮 -->
    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:add']" icon="Plus" type="primary" @click="handleAdd">新增文章</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:enableAndDisabled']" @click="handleEnableBatch" :disabled="noSelection || loading"
          >启用</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:enableAndDisabled']" @click="handleDisableBatch" :disabled="noSelection || loading"
          >禁用</el-button
        >
      </el-col>
      <el-col :span="1.5">
        <el-button v-throttle v-hasPermi="['system:article:remove']" color="#F23255" @click="handleDeleteBatch" :disabled="noSelection || loading"
          >删除</el-button
        >
      </el-col>
    </el-row>

    <!-- 表格 -->
    <el-table :data="tableData" border v-loading="loading" style="table-layout: fixed; width: 100%" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <el-table-column type="index" label="序号" width="55" />
      <el-table-column label="发布时间" prop="publishTime">
        <template #default="scope">
          <span>{{ proxy.parseTime(scope.row.publishTime) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="文章标题" prop="articleTitle" :show-overflow-tooltip="true" />
      <el-table-column label="文章类别" prop="articleType">
        <template #default="scope">
          <dict-text :options="article_type" :value="scope.row.articleType ?? ''" />
        </template>
      </el-table-column>
      <el-table-column label="启用状态" prop="articleStatus">
        <!-- <template #default="scope">
          <span>{{ getEnableStatusText(scope.row.articleStatus) }}</span>
        </template> -->
        <template #default="scope">
          <div class="flex-center-center">
            <div
              v-if="scope.row.articleStatus != null"
              class="normal"
              :class="{
                green: scope.row.articleStatus == 2,
                reviewRejected: scope.row.articleStatus == 3
              }"
            ></div>
            <span v-if="scope.row.articleStatus == 3" class="reviewRejected-color">禁用</span>
            <span v-if="scope.row.articleStatus == 2" class="green-color">启用</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="浏览量" prop="viewCount">
        <template #default="scope">
          {{ scope.row.viewCount ?? scope.row.views ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="收藏量" prop="favoriteCount">
        <template #default="scope">
          {{ scope.row.favoriteCount ?? scope.row.favorites ?? 0 }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right" class-name="op-col flex-center">
        <template #default="scope">
          <template v-for="(btn, idx) in getRowActions(scope.row)" :key="btn.key">
            <template v-if="idx < 2">
              <el-button v-throttle link type="primary" v-hasPermi="btn.permi" @click="btn.onClick(scope.row)">{{ btn.label }}</el-button>
            </template>
          </template>
          <template v-if="getRowActions(scope.row).length > 3">
            <el-dropdown>
              <span class="el-dropdown-link">
                <el-button v-throttle link type="primary">更多</el-button>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="btn in getRowActions(scope.row).slice(2)" :key="btn.key" @click="btn.onClick(scope.row)">
                    <span class="op-more-item" v-throttle v-hasPermi="btn.permi">{{ btn.label }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
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
      :title="dialog.type === 'add' ? '新增文章' : dialog.type === 'edit' ? '编辑文章' : '查看文章'"
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
const queryFormRef = ref();

// 选中
const selectedIds = ref<(string | number)[]>([]);
const selectedRows = ref<any[]>([]);

// 是否无选中项（用于禁用批量按钮）
const noSelection = computed(() => selectedIds.value.length === 0);

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
  // 仅允许对当前为禁用状态的数据执行批量启用
  const invalid = selectedRows.value.some((row) => String(row.articleStatus) !== '3');
  if (invalid) {
    // ElMessage.warning('选中数据存在非“禁用”状态，不能执行批量启用');
    ElMessage.warning('只能启用已禁用的数据，请重新选择。');
    return;
  }
  await changeStatusConfirm(selectedIds.value, '2', `确定启用选中的 ${selectedIds.value.length} 条禁用数据吗？`);
};
const handleDisableBatch = async () => {
  if (!ensureSelected()) return;
  // 仅允许对当前为启用状态的数据执行批量禁用
  const invalid = selectedRows.value.some((row) => String(row.articleStatus) !== '2');
  if (invalid) {
    // ElMessage.warning('选中数据存在非“启用”状态，不能执行批量禁用');
    ElMessage.warning('只能禁用已启用的数据，请重新选择。');
    return;
  }
  await changeStatusConfirm(selectedIds.value, '3', `确定禁用选中的 ${selectedIds.value.length} 条启用数据吗？`);
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

// 行内操作按钮配置（前三个直接显示，剩余收“更多”）
const getRowActions = (row: any) => {
  const actions = [
    { key: 'edit', label: '编辑', permi: ['system:article:edit'], type: 'primary', onClick: (r: any) => handleEdit(r) },
    // 根据行状态动态插入“启用/禁用”
    String(row.articleStatus) === '3'
      ? { key: 'enable', label: '启用', permi: ['system:article:enableAndDisabled'], type: 'primary', onClick: (r: any) => handleEnable(r) }
      : { key: 'disable', label: '禁用', permi: ['system:article:enableAndDisabled'], type: 'primary', onClick: (r: any) => handleDisable(r) },
    { key: 'view', label: '查看', permi: ['system:article:query'], type: 'primary', onClick: (r: any) => handleView(r) },
    { key: 'delete', label: '删除', permi: ['system:article:remove'], type: 'danger', onClick: (r: any) => handleDeleteOne(r) }
  ];
  return actions;
};
</script>

<style scoped lang="scss">
.kb-management {
  height: calc(100vh - 120px);
  padding: 24px;

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

/* 操作列样式优化：垂直居中 + 14px 字号 */
.kb-management :deep(.op-col .cell) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}
.el-dropdown-link {
  margin-left: 12px;
}

.op-more-item {
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  color: #108c58;
}
</style>
