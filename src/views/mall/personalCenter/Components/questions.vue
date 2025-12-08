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
      <el-table :data="tableData" v-loading="loading" style="table-layout: fixed; width: 100%" size="small" header-cell-class-name="table-header">
        <!-- <el-table-column type="index" label="序号" width="55" align="center" /> -->
        <el-table-column prop="questionContent" label="我的提问" />
        <el-table-column prop="publishTime" label="发布时间">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.publishTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="160" align="center">
          <template #default="{ row }">
            <el-button v-hasPermi="['system:question:query']" @click="onDetail(row)" v-throttle link style="color: #108c58">查看</el-button>

            <el-button
              v-if="row.questionStatus !== '99'"
              v-hasPermi="['system:question:stopQuestion']"
              @click="onDelete(row)"
              v-throttle
              text
              style="color: #ef4d0b"
              >关闭</el-button
            >
          </template>
        </el-table-column>
      </el-table>

      <div class="flex-end pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" width="600px" destroy-on-close :close-on-click-modal="false" class="question-detail-dialog" title="我的问题">
      <div v-loading="detailLoading" class="detail-body">
        <!-- 我的问题区块 -->
        <div>
          <div class="reply-question">{{ currentQuestion?.questionContent }}</div>
          <div class="question-images" v-if="imageList.length">
            <el-image v-for="(img, i) in imageList.slice(0, 6)" :key="i" :src="img" :preview-src-list="imageList" fit="cover" class="question-img" />
          </div>
          <div class="reply-time" style="color: #3d3d3d">{{ proxy.parseTime(currentQuestion?.publishTime) }}</div>
        </div>
        <!-- 专家回复区块 -->
        <div>
          <el-divider border-style="dashed">
            <span class="reply-title">专家回复</span>
          </el-divider>
          <el-empty v-if="!replyList.length && !detailLoading" description="暂无回复" />
          <div v-else>
            <div class="reply-item" v-for="item in replyList" :key="item.id">
              <div class="reply-answer">{{ item.answerContent }}</div>
              <div class="reply-time">{{ proxy.parseTime(item.replyTime) }}</div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, getCurrentInstance, type ComponentInternalInstance, computed, nextTick } from 'vue';
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
        // 渲染后检测文本是否多行，并设置对齐样式类
        nextTick(() => {
          updateMultilineAlign();
        });
      }
    })
    .finally(() => {
      detailLoading.value = false;
    });
};

// 根据文本是否换行，切换 is-multiline 类，从而控制 align-items
const updateMultilineAlign = () => {
  const questionEls = document.querySelectorAll('.reply-question');
  const answerEls = document.querySelectorAll('.reply-answer');
  const handle = (el: Element) => {
    const block = el as HTMLElement;
    // 单行高度近似等于 line-height；若 scrollHeight 大于 clientHeight，说明出现了换行
    const isMultiline = block.scrollHeight > block.clientHeight + 1; // +1 防止像素取整误差
    block.classList.toggle('is-multiline', isMultiline);
  };
  questionEls.forEach(handle);
  answerEls.forEach(handle);
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
  width: 20px;
  height: 20px;
  margin-right: 8px;
  background-image: url('@/assets/images/mall/my-questions-icon.png');
}

.pading20 {
  padding: 20px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
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
/* .question-detail-dialog .detail-body {
  padding: 20px;
  background: linear-gradient(180deg, rgba(16, 140, 88, 0.12) 0%, rgba(16, 140, 88, 0) 100%);
  border-radius: 8px 8px 8px 8px;
  border: 1px solid;
  border-image: linear-gradient(
      180deg,
      rgba(16.000000946223736, 140.00000685453415, 88.00000235438347, 1),
      rgba(16.000000946223736, 140.00000685453415, 88.00000235438347, 0)
    )
    1 1;
} */
.question-images {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
  padding-left: 36px;
}
.question-img {
  width: 70px;
  height: 70px;
}

.reply-title {
  font-size: 16px;
  font-weight: 600;
  color: #a3a3a3;
  margin-bottom: 12px;
}
.reply-item {
  border-bottom: 1px solid #f0f0f0;
  padding: 15px;
  /* background: #ffffff; */
  /* box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.12); */
  background: #f6f7fb;
  border-radius: 4px 4px 4px 4px;
  margin-bottom: 10px;
}

.reply-time {
  height: 14px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-weight: 400;
  font-size: 12px;
  color: #a8a8a8;
  line-height: 14px;
  text-align: right;
  font-style: normal;
  text-transform: none;
}

.reply-question {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 16px;
  color: #3d3d3d;
  line-height: 18px;
  font-weight: 500;
  text-align: left;
  font-style: normal;
  text-transform: none;
  display: flex;
  align-items: center; /* 默认单行居中 */
  position: relative;
  margin-bottom: 8px;
}

.reply-question.is-multiline {
  align-items: flex-start; /* 多行时顶部对齐，避免挤压 */
}

.reply-question::before {
  content: '';
  display: block;
  width: 28px;
  height: 28px;
  background-image: url('@/assets/images/mall/question.png');

  border-radius: 4px 4px 4px 4px;
  margin-right: 8px;
  flex-shrink: 0; /* 防止文字换行时压缩图标宽度 */
  flex: 0 0 28px; /* 固定 flex 尺寸，确保正常展示 */
}

.reply-answer {
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 16px;
  color: #3d3d3d;
  line-height: 18px;
  font-weight: 400;
  text-align: left;
  font-style: normal;
  text-transform: none;
  display: flex;
  align-items: center; /* 默认单行居中 */
  position: relative;
  margin-bottom: 8px;
}

.reply-answer.is-multiline {
  align-items: flex-start; /* 多行时顶部对齐，避免挤压 */
}

.reply-answer::before {
  content: '';
  display: block;
  width: 28px;
  height: 28px;
  background-image: url('@/assets/images/mall/answer.png');

  border-radius: 4px 4px 4px 4px;
  margin-right: 8px;
  flex-shrink: 0; /* 防止文字换行时压缩图标宽度 */
  flex: 0 0 28px; /* 固定 flex 尺寸，确保正常展示 */
}
</style>
