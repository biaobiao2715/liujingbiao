<!--
        标题: addressManagement.vue
        功能: 我的提问
        说明: 新增/修改/删除/设为默认地址，分页展示
        当前版本: 2.0
        开发信息: Created by 刘景彪 2025-10-27, Refactor 2025-10-29
    -->
<template>
  <div class="address-page">
    <div class="menu-title">我的提问</div>
    <div class="pading20">
      <!-- 问题统计与红色回复数 -->
      <div class="summary-alert">已提问{{ total }}条</div>
      <!-- 表格 -->
      <el-table :data="tableData" v-loading="loading" style="width: 100%" border size="small" header-cell-class-name="table-header">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="questionContent" label="我的提问" align="center" />
        <el-table-column prop="publishTime" label="发布时间" align="center">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.publishTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center">
          <template #default="{ row }">
            <div class="ops">
              <el-button
                v-if="row.questionStatus !== '99'"
                v-hasPermi="['system:question:stopQuestion']"
                @click="onDelete(row)"
                v-throttle
                text
                style="color: #ef4d0b"
                >关闭</el-button
              >
              <el-button
                v-if="row.hasQuote == '0'"
                v-hasPermi="['system:question:query']"
                @click="onDetail(row)"
                v-throttle
                text
                style="color: #108c58"
                >查看</el-button
              >
              <span v-if="getReplyCount(row) > 0" class="reply-badge">{{ getReplyCount(row) > 99 ? '99+' : getReplyCount(row) }}</span>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div class="flex-end pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" width="80%" destroy-on-close :close-on-click-modal="false" class="question-detail-dialog" title="详情">
      <div v-loading="detailLoading" class="detail-body">
        <!-- 我的问题 -->
        <div class="section">
          <el-divider content-position="left"><div class="section-title">我的问题</div></el-divider>
          <div class="question-item">
            <div class="q-time">{{ currentQuestion?.publishTime }}</div>
            <div class="q-title">{{ currentQuestion?.questionTitle }}</div>
            <div class="q-content">{{ currentQuestion?.questionContent }}</div>
            <div class="q-images" v-if="imageList.length">
              <el-image v-for="(img, i) in imageList.slice(0, 6)" :key="i" :src="img" :preview-src-list="imageList" fit="cover" class="q-img" />
            </div>
          </div>
        </div>

        <!-- 专家回复倒序展示 -->
        <div class="section">
          <el-divider content-position="left"><div class="section-title">专家回复</div></el-divider>
          <el-empty v-if="!replyList.length && !detailLoading" description="暂无回复" />
          <div v-else>
            <div class="reply-item" v-for="item in replyListSorted" :key="item.id">
              <div class="meta">
                <span class="meta-date">{{ item.replyTime }}</span>
                <span class="meta-user">{{ item.expertType === '1' ? '技术专家' : item.expertType === '2' ? '法务专家' : '专家' }}</span>
              </div>
              <div class="content">{{ item.answerContent }}</div>
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
  listStyle,
  questionList,
  questionStop,
  questionDetail,
  HnQuestionVo,
  HnAnswerVo,
  HnCommonRelevanceFilesVo,
  RemoteFile
} from '@/api/mall/personalCenter/questions';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const tableData = ref<listStyle[]>([]);
const total = ref(0);
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});
const detailVisible = ref(false);
const detailLoading = ref(false);
const currentQuestion = ref<HnQuestionVo | null>(null);
const replyList = ref<HnAnswerVo[]>([]);
const imageList = ref<string[]>([]);

// 专家回复倒序
const replyListSorted = computed(() => {
  return [...replyList.value].sort((a, b) => ((b.replyTime || '') > (a.replyTime || '') ? 1 : -1));
});

// 生命周期
onMounted(() => {
  getList();
});

// 获取列表
const getList = async () => {
  loading.value = true;
  try {
    const res: any = await questionList(queryParams);
    if (res?.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

// 查看详情
const onDetail = (row: any) => {
  detailLoading.value = true;
  questionDetail(row.id)
    .then((res: any) => {
      if (res?.code === 200) {
        currentQuestion.value = res.data || null;
        replyList.value = res.data?.hnAnswerVoList || [];
        // 图片附件最多6张
        imageList.value = [];
        if (res.data?.hnCommonRelevanceFilesVos?.length) {
          res.data.hnCommonRelevanceFilesVos.forEach((file: HnCommonRelevanceFilesVo) => {
            if (file.fileType === '0' && file.remoteOssVos?.length) {
              file.remoteOssVos.forEach((img: RemoteFile) => {
                if (img.url) imageList.value.push(img.url);
              });
            }
          });
        }
        detailVisible.value = true;
      }
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

// 关闭问题
const onDelete = async (row: listStyle) => {
  await ElMessageBox.confirm('确定关闭该提问吗？', '提示', { type: 'warning' });
  const res: any = await questionStop(row.id);
  if (res?.code === 200) {
    ElMessage.success('关闭成功');
    getList();
  }
};

// 获取每条问题的回复数
function getReplyCount(row: any) {
  return Array.isArray(row.hnAnswerVoList) ? row.hnAnswerVoList.length : row.replyCount || 0;
}
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
}
.reply-count {
  margin-bottom: 10px;
  font-size: 16px;
}
.count-red {
  color: #e53935;
  font-weight: bold;
  font-size: 18px;
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
  margin: 15px 0;
  height: 36px;
  line-height: 36px;
  background: rgba(255, 123, 0, 0.1);
  border-radius: 4px 4px 4px 4px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #ff7b00;
  text-align: center;
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

/* 操作按钮间距和样式 */
.ops {
  display: flex;
  align-items: center;
  gap: 8px;
}
.btn-red {
  color: #e53935 !important;
  font-weight: bold;
  text-decoration: none !important;
}
.btn-red:hover {
  color: #b71c1c !important;
  background: none !important;
}
.btn-blue {
  color: #1976d2 !important;
  font-weight: bold;
  text-decoration: none !important;
}
.btn-blue:hover {
  color: #0d47a1 !important;
  background: none !important;
}
/* 红色圆角回复数 */
.reply-badge {
  display: inline-block;
  min-width: 22px;
  height: 22px;
  line-height: 22px;
  background: #e53935;
  color: #fff;
  border-radius: 50%;
  font-size: 14px;
  font-weight: bold;
  text-align: center;
  margin-left: 4px;
  vertical-align: middle;
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
