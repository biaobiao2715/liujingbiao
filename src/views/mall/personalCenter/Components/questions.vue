<!--
        标题: addressManagement.vue
        功能: 我的提问
        说明: 新增/修改/删除/设为默认地址，分页展示
        当前版本: 2.0
        开发信息: Created by 刘景彪 2025-10-27, Refactor 2025-10-29
    -->
<template>
  <div class="address-page">
    <div class="title">我的提问</div>
    <el-divider />

    <!-- 已保存地址：替换原先的 div.table-title 为告警提示 -->
    <el-alert class="summary-alert" :center="true" type="warning" :closable="false" :title="`已提问${total}条`" />
    <!-- 表格：加边框与紧凑尺寸 -->
    <el-table :data="tableData" v-loading="loading" style="width: 100%" border size="small" header-cell-class-name="table-header">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column prop="receiverName" label="我的提问" align="center" />
      <el-table-column prop="receiverPhone" label="发布时间" align="center" />
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <div class="ops">
            <el-button link type="danger" @click="onDelete(row)">关闭</el-button>
            <el-button link type="primary" @click="onEdit(row)">查看</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 新增：详情弹窗 -->
    <el-dialog v-model="detailVisible" width="80%" destroy-on-close :close-on-click-modal="false" class="question-detail-dialog" title="详情">
      <div v-loading="detailLoading" class="detail-body">
        <!-- 我的问题 -->
        <div class="section">
          <el-divider content-position="left"><div class="section-title">我的问题</div></el-divider>
          <div class="question-item">
            <div class="q-time">{{ currentQuestion?.createTime }}</div>
            <div class="q-content">{{ currentQuestion?.content }}</div>
            <div class="q-images" v-if="currentQuestion?.images?.length">
              <el-image
                v-for="(img, i) in currentQuestion!.images"
                :key="i"
                :src="img"
                :preview-src-list="currentQuestion!.images"
                fit="cover"
                class="q-img"
              />
            </div>
          </div>
        </div>

        <!-- 专家回复 -->
        <div class="section">
          <el-divider content-position="left"><div class="section-title">专家回复</div></el-divider>
          <el-empty v-if="!replyList.length && !detailLoading" description="暂无回复" />
          <div v-else>
            <div class="reply-item" v-for="item in replyList" :key="item.id">
              <div class="meta">
                <span class="meta-date">{{ item.createTime }}</span>
                <span class="meta-user">{{ item.expertName || '系统' }}</span>
              </div>
              <div class="content">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, type ComponentInternalInstance, computed } from 'vue';
import {
  Address,
  userAddressList,
  userAddressAdd,
  userAddressUpdate,
  userAddressDelete,
  userAddressSetDefault
} from '@/api/mall/personalCenter/addressManagement';

// 新增：详情相关类型与状态
interface QuestionDetail {
  id: number | string;
  content: string;
  createTime: string;
  images?: string[];
}
interface ReplyItem {
  id: number | string;
  content: string;
  createTime: string;
  expertName?: string;
}
// 列表 & 分页
const loading = ref(false);
const tableData = ref<Address[]>([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});
const detailVisible = ref(false);
const detailLoading = ref(false);
const currentQuestion = ref<QuestionDetail | null>(null);
const replyList = ref<ReplyItem[]>([]);
// 生命周期
onMounted(() => {
  getList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const res: any = await userAddressList({ pageNum: queryParams.pageNum, pageSize: queryParams.pageSize });
    if (res?.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
      const def = tableData.value.find((x) => x.isDefault === '1');
    }
  } finally {
    loading.value = false;
  }
};

// 替换：查看 => 打开详情弹窗并加载回复列表
const onEdit = (row: any) => {
  currentQuestion.value = {
    id: row.id,
    // 这里用列表里的字段回显；按你的真实字段替换
    content: row.receiverName, // 问题内容
    createTime: row.receiverPhone, // 发布时间（占位）
    images: row.images || row.attachments || [] // 图片数组
  };
  detailVisible.value = true;
};

const onDelete = async (row: Address) => {
  await ElMessageBox.confirm('确定关闭该提问吗？', '提示', { type: 'warning' });
  // const res: any = await questionClose(row.id);
  // if (res?.code === 200) {
  //   ElMessage.success('关闭成功');
  //   // 若删除的是默认，清空默认标记
  //   getList();
  // }
};
</script>

<style scoped>
.address-page {
  padding: 20px;
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
}
/* 表单容器增加描边与圆角，间距更紧凑 */
.address-form {
  background: #fff;
  padding: 12px 16px 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
}
.address-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

/* 顶部提示样式 */
.summary-alert {
  margin: 12px 0;
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 4px;
}

/* 表格标题背景与单元格内边距优化 */
:deep(.table-header) {
  background: #fafafa !important;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
:deep(.el-table--small .cell) {
  padding: 8px 12px;
}

/* 操作按钮间距 */
.ops :deep(.el-button + .el-button) {
  margin-left: 12px;
}

.flex-center.pagination {
  margin-top: 16px;
  justify-content: end;
  display: flex;
}

/* 新增：详情弹窗样式 */
.question-detail-dialog .section {
  margin-bottom: 16px;
}
.section-title {
  font-weight: 600;
  font-size: 16px;
}
.question-item .q-time {
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}
.question-item .q-images {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.question-item .q-img {
  width: 64px;
  height: 64px;
  border-radius: 4px;
  overflow: hidden;
}
.reply-item {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
}
.reply-item .meta {
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
  display: flex;
  gap: 12px;
}
</style>
