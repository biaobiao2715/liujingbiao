<!--
    标题: reportView.vue
    功能: 举报信息详情弹窗
    说明: 用于查看举报内容的基本信息。
    当前版本: 1.0
    开发信息: Created by 邓和杰 2025-11-07
-->
<template>
  <el-dialog v-model="dialogVisible" title="举报信息详情" width="60%" destroy-on-close>
    <!-- 基本信息 -->
    <div class="info-section">
      <h3 class="section-title">基本信息</h3>

      <template v-if="!isProcessingStatus">
        <el-form :label-width="100" :inline="false" class="report-form">
          <el-row>
            <el-col :span="12">
              <el-form-item label="举报编号" required>
                <el-input :value="reportData?.reportCode || ''" disabled readonly style="background-color: #f5f7fa; color: #909399" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="举报类别" required>
                <el-input
                  :value="getReportTypeText(reportData?.reportTypeId) || ''"
                  disabled
                  readonly
                  style="background-color: #f5f7fa; color: #909399"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="被举报方" required>
                <el-input :value="reportData?.reportPersonName || ''" disabled readonly style="background-color: #f5f7fa; color: #909399" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="举报商品" required>
                <el-input :value="reportData?.reportGoodsName || ''" disabled readonly style="background-color: #f5f7fa; color: #909399" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="举报描述" required>
                <el-input
                  :value="reportData?.reportDescription || ''"
                  type="textarea"
                  :rows="4"
                  disabled
                  readonly
                  style="background-color: #f5f7fa; color: #909399"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </template>

      <template v-else>
        <div class="basic-info-text">
          <div class="info-text-row">
            <div class="info-text-item">
              <span class="label">举报类型：</span>
              <span class="value">{{ getReportTypeText(reportData?.reportTypeId) || '--' }}</span>
            </div>
            <div class="info-text-item">
              <span class="label">举报编号：</span>
              <span class="value">{{ reportData?.reportCode || '--' }}</span>
            </div>
          </div>
          <div class="info-text-row">
            <div class="info-text-item">
              <span class="label">举报时间：</span>
              <span class="value">{{ reportData?.createTime || '--' }}</span>
            </div>
            <div class="info-text-item">
              <span class="label">案件编号：</span>
              <span class="value">{{ reportData?.caseCode || '--' }}</span>
            </div>
          </div>
          <div class="info-text-row">
            <div class="info-text-item full-width">
              <span class="label">举报描述：</span>
              <span class="value description">{{ reportData?.reportDescription || '--' }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- 举报材料 -->
    <div v-if="shouldShowMaterials" class="info-section">
      <h3 class="section-title">*举报材料</h3>

      <!-- 图片区域 -->
      <div class="material-section">
        <label class="material-label">图片：</label>
        <div class="image-list">
          <div v-for="(image, index) in imagesDisplay" :key="index" class="image-item">
            <el-image
              :src="image || 'https://element-plus.org/images/component-demo.svg'"
              fit="cover"
              class="preview-image"
              :preview-src-list="imagesDisplay"
              :initial-index="index"
            />
          </div>
        </div>
      </div>

      <!-- 视频区域 -->
      <div class="material-section">
        <label class="material-label">视频：</label>
        <div class="video-list">
          <div v-for="(video, index) in videosDisplay" :key="index" class="video-item">
            <div class="video-placeholder">
              <div class="video-content">{{ '视频' }}</div>
              <div class="video-size">{{ formatFileSize(video.fileSize || video.size || 0) }}</div>
              <div class="download-area">
                <el-button type="primary" size="small" class="download-btn" @click="handleDownloadVideo(video)">下载视频</el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 所属状态 -->
    <div class="status-section">
      <h3 class="section-title">所属状态: {{ currentScenario?.title }}</h3>

      <div class="status-timeline">
        <template v-for="stage in statusStages" :key="stage.id">
          <div v-if="stage.show" :class="{ 'timeline-item': true, 'active-connection': stage.active }">
            <div class="timeline-node" :class="{ 'active': stage.active }">
              <span class="icon-wrapper">✓</span>
            </div>

            <div class="timeline-content">
              <div class="stage-name">{{ stage.name }}</div>
              <div class="stage-time" v-if="stage.time">{{ stage.time }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- 案件类型（仅在处理中或处理中撤回显示） -->
    <div v-if="shouldShowCaseType" class="info-section">
      <h3 class="section-title">
        案件类型:
        <el-icon class="info-icon" :size="16">
          <QuestionFilled />
        </el-icon>
      </h3>
      <el-table :data="caseTypeData" border style="width: 100%">
        <el-table-column label="案例类型编号" align="center" min-width="200">
          <template #default="scope">
            {{ scope.row.caseTypeCode || '--' }}
          </template>
        </el-table-column>
        <el-table-column label="案例类型名称" align="center" min-width="150">
          <template #default="scope">
            {{ getCaseTypeName(scope.row.caseTypeId) }}
          </template>
        </el-table-column>
        <el-table-column label="执法依据" align="center" min-width="150">
          <template #default="scope">
            <el-link
              v-if="scope.row.newBasisFile?.ossInfo?.originalName"
              type="primary"
              :underline="false"
              @click="handleDownloadCaseFile(scope.row.newBasisFile)"
            >
              {{ scope.row.newBasisFile.ossInfo.originalName }}
            </el-link>
            <span v-else>--</span>
          </template>
        </el-table-column>
        <el-table-column label="执法文书模版" align="center" min-width="180">
          <template #default="scope">
            <el-link
              type="primary"
              :underline="false"
              @click="handleDownloadCaseFile(scope.row.newDocumentFile)"
            >
              {{ scope.row.newDocumentFile.ossInfo.originalName }}
            </el-link>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 驳回原因、平台反馈处理结果、举报人撤回原因、 -->
    <div v-if="reasonSection.show" class="info-section">
      <h3 class="section-title">{{ reasonSection.title }}</h3>
      <p class="info-paragraph">{{ reasonSection.content }}</p>
    </div>

    <!-- 底部按钮 -->
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { Plus, QuestionFilled } from '@element-plus/icons-vue';

// 举报类别选项数组（与父组件保持一致）
const reportTypeOptions = [
  { value: 1, label: '假种子销售' },
  { value: 2, label: '品种权侵权' },
  { value: 3, label: '虚假宣传' },
  { value: 4, label: '无证生产经营' },
  { value: 5, label: '其他' }
];

// 状态选项数组（与父组件保持一致）
const statusOptions = [
  { value: '0', label: '待处理' },
  { value: '1', label: '处理中' },
  { value: '2', label: '已驳回' },
  { value: '3', label: '已结案' },
  { value: '4', label: '已撤回' }
];

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// 根据举报类别ID获取文本
const getReportTypeText = (reportTypeId: string | number): string => {
  if (!reportTypeId) return '';
  const option = reportTypeOptions.find((item) => item.value === Number(reportTypeId));
  return option ? option.label : String(reportTypeId);
};

// 根据状态值获取状态文本
const getStatusText = (status: string): string => {
  if (!status) return '';
  const option = statusOptions.find((item) => item.value === status);
  return option ? option.label : status;
};

// 是否为处理中状态（仅用于基本信息展示）
const isProcessingStatus = computed(() => props.reportData?.status === '1');

// 撤回阶段判定：reviewStatus === '0' 视为未进入处理流程
const isWithdrawStatus = computed(() => props.reportData?.status === '4');
// caseCode 为空 => 待处理撤回；有 caseCode => 处理中撤回
const isWithdrawPending = computed(() => isWithdrawStatus.value && !props.reportData?.caseCode);
const isWithdrawProcessing = computed(() => isWithdrawStatus.value && !isWithdrawPending.value);

// 举报材料展示：处理中、处理中撤回隐藏，其余展示
const shouldShowMaterials = computed(() => {
  const status = props.reportData?.status;
  if (status === '1') return false;
  if (isWithdrawProcessing.value) return false;
  return true;
});

// 案件类型展示：处理中状态或处理中撤回状态展示
const shouldShowCaseType = computed(() => props.reportData?.status === '1' || isWithdrawProcessing.value);

const getCaseTypeName = (caseTypeId: string | number) => {
  if (!caseTypeId && caseTypeId !== 0) return '--';
  const map: Record<string, string> = {
    '1': '商品侵权',
    '2': '无证经营'
  };
  return map[String(caseTypeId)] || '--';
};

const handleDownloadCaseFile = async (file: any) => {
  const url = file?.ossInfo?.url;
  const name = file?.ossInfo?.originalName;
  if (!url || !name) {
    ElMessage.error('文件信息不完整');
    return;
  }
  try {
    const response = await fetch(url, { credentials: 'include' });
    if (!response.ok) throw new Error(`下载失败: ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    ElMessage.success('文件下载完成');
  } catch (error) {
    console.error('文件下载失败:', error);
    ElMessage.error('文件下载失败');
  }
};

// 案件类型数据
const caseTypeData = computed(() => {
  const list = props.reportData?.reportCaseFiling;
  if (Array.isArray(list) && list.length > 0) {
    return list;
  }
  return [];
});

// 驳回/结案/撤回原因展示
const reasonSection = computed(() => {
  const status = props.reportData?.status;
  const result = {
    show: false,
    title: '',
    content: ''
  };

  if (status === '2') {
    result.show = true;
    result.title = '驳回原因';
    result.content = props.reportData?.rejectReason || '--';
  } else if (status === '3') {
    result.show = true;
    result.title = '平台反馈处理结果';
    result.content = props.reportData?.deal_result || '--';
  } else if (status === '4') {
    result.show = true;
    result.title = '举报人撤回原因';
    result.content = props.reportData?.withdrawCause || '--';
  }

  return result;
});

// Props定义
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  reportData: {
    type: Object,
    default: () => ({
      status: ''
    })
  }
});

// Emits定义
const emit = defineEmits(['update:modelValue', 'close']);

// 弹窗显示状态
const dialogVisible = ref(false);

// 举报状态文本
const reportStatus = ref('');

// 图片数据处理 - 从reportData.reportFiles中获取，根据ossInfo.fileType === '0'判断
const imagesDisplay = computed(() => {
  const files = props.reportData?.reportFiles || [];
  if (!Array.isArray(files)) return [];

  return files
    .filter((file: any) => {
      // 根据ossInfo.fileType判断，'0'为图片
      return file.fileType === '0';
    })
    .map((file: any) => {
      // 使用ossInfo.url作为图片地址
      return file.ossInfo?.url || '';
    })
    .filter((url: string) => url) // 过滤掉空URL
    .slice(0, 5); // 最多展示5张
});

// 视频数据处理 - 从reportData.reportFiles中获取，根据ossInfo.fileType === '1'判断
const videosDisplay = computed(() => {
  const files = props.reportData?.reportFiles || [];
  if (!Array.isArray(files)) return [];

  return files
    .filter((file: any) => {
      // 根据fileType判断，'1'为视频
      return file.fileType === '1';
    })
    .map((file: any) => {
      return {
        name: file.ossInfo.fileName,
        url: file.ossInfo.url || '', // 使用ossInfo.url作为视频地址
        fileSize: file.fileSize
      };
    })
    .filter((video: any) => video.url) // 过滤掉没有URL的视频
    .slice(0, 3); // 最多展示3个
});

// 状态阶段数据 - 根据实际状态值（'0', '1', '2', '3', '4'）配置
const statusScenarios: Record<string, any> = {
  // 待处理状态 '0'
  '0': {
    title: '待处理',
    stages: [
      { id: 1, name: '待处理', time: props.reportData?.createTime || '', active: true, show: true },
      { id: 2, name: '处理中', time: '', active: false, show: true },
      { id: 3, name: '已结案', time: '', active: false, show: true }
    ],
    currentStageId: 1
  },
  // 处理中状态 '1'
  '1': {
    title: '处理中',
    stages: [
      { id: 1, name: '待处理', time: props.reportData?.createTime || '', active: true, show: true },
      { id: 2, name: '处理中', time: props.reportData?.updateTime || props.reportData?.createTime || '', active: true, show: true },
      { id: 3, name: '已结案', time: '', active: false, show: true }
    ],
    currentStageId: 2
  },
  // 已驳回状态 '2'
  '2': {
    title: '已驳回',
    stages: [
      { id: 1, name: '待处理', time: props.reportData?.createTime || '', active: true, show: true },
      { id: 2, name: '已驳回', time: props.reportData?.updateTime || props.reportData?.reviewTime || '', active: true, show: true }
    ],
    currentStageId: 2
  },
  // 已结案状态 '3'
  '3': {
    title: '已结案',
    stages: [
      { id: 1, name: '待处理', time: props.reportData?.createTime || '', active: true, show: true },
      { id: 2, name: '处理中', time: props.reportData?.updateTime || props.reportData?.createTime || '', active: true, show: true },
      { id: 3, name: '已结案', time: props.reportData?.closeTime || props.reportData?.updateTime || '', active: true, show: true }
    ],
    currentStageId: 3
  },
  // 已撤回状态 - 处理中撤回
  '4-processing': {
    title: '已撤回（处理中）',
    stages: [
      { id: 1, name: '待处理', time: props.reportData?.createTime || '', active: true, show: true },
      { id: 2, name: '处理中', time: props.reportData?.updateTime || props.reportData?.createTime || '', active: true, show: true },
      { id: 3, name: '已撤回', time: props.reportData?.withdrawTime || props.reportData?.updateTime || '', active: true, show: true }
    ],
    currentStageId: 3
  },
  // 已撤回状态 - 待处理撤回
  '4-pending': {
    title: '已撤回（待处理）',
    stages: [
      { id: 1, name: '待处理', time: props.reportData?.createTime || '', active: true, show: true },
      { id: 2, name: '已撤回', time: props.reportData?.withdrawTime || props.reportData?.updateTime || '', active: true, show: true }
    ],
    currentStageId: 2
  }
};

// 当前状态场景
const currentScenario = computed(() => {
  const status = props.reportData?.status || '0';
  let scenarioKey = status;
  if (status === '4') {
    scenarioKey = isWithdrawPending.value ? '4-pending' : '4-processing';
  }
  const template = statusScenarios[scenarioKey] || statusScenarios['0'];
  const scenario = {
    title: template.title,
    currentStageId: template.currentStageId,
    stages: template.stages.map((stage: any) => ({ ...stage }))
  };

  scenario.stages = scenario.stages.map((stage: any) => {
    if (stage.id === 1 && !stage.time) {
      stage.time = props.reportData?.createTime || '';
    } else if (stage.id === 2 && !stage.time && status !== '0') {
      stage.time = props.reportData?.updateTime || props.reportData?.createTime || '';
    } else if (stage.id === 3 && !stage.time && (status === '3' || scenarioKey.startsWith('4'))) {
      stage.time = props.reportData?.closeTime || props.reportData?.withdrawTime || props.reportData?.updateTime || '';
    }
    return stage;
  });

  return scenario;
});

const statusStages = computed(() => currentScenario.value.stages);
const currentStatus = computed(() => currentScenario.value.stages.find((s) => s.id === currentScenario.value.currentStageId));

// 监听外部v-model变化
watch(
  () => props.modelValue,
  (newVal) => {
    dialogVisible.value = newVal;
  }
);

// 监听弹窗内部显示状态变化
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal);
});

// 监听举报数据变化，更新显示内容
watch(
  () => props.reportData,
  (newData) => {
    if (newData && newData.status) {
      reportStatus.value = newData.status;
    }
  },
  { deep: true }
);

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;
  emit('close');
};

// 下载视频 - 直接通过a标签下载
const handleDownloadVideo = async (video: any) => {
  if (!video || !video.url) {
    ElMessage.error('视频下载地址不存在');
    return;
  }
  const fileName = video.name || `视频-${Date.now()}.mp4`;
  try {
    const response = await fetch(video.url, { credentials: 'include' });
    if (!response.ok) {
      throw new Error(`下载失败: ${response.status}`);
    }
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(blobUrl);
    ElMessage.success('视频下载完成');
  } catch (error) {
    console.error('视频下载失败:', error);
    ElMessage.error('视频下载失败');
  }
};

// 暴露给父组件的方法
defineExpose({
  // 初始化数据
  initData(data: { reportData: any }) {
    if (data && data.reportData) {
      reportStatus.value = data.reportData.status;
    }
  },
  // 暴露下载方法给父组件
  handleDownloadVideo
});
</script>

<style scoped>
.content-container {
  text-align: center;
  font-size: 16px;
  padding: 20px 0;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 状态部分样式 */
.status-section {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 20px;
  color: #333;
}

.status-timeline {
  display: flex;
  position: relative;
  padding: 20px 0;
}

.timeline-item {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.timeline-node {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid #dcdfe6;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  margin-bottom: 10px;
  transition: all 0.3s;
  position: relative;
}

.timeline-node.active {
  border: 1px solid #409eff;
}

.icon-wrapper {
  font-size: 18px;
  font-weight: bold;
  color: #dcdfe6;
  line-height: 1;
  text-align: center;
}

.timeline-node.active .icon-wrapper {
  color: #409eff;
}

.timeline-content {
  text-align: center;
}

.stage-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.stage-time {
  font-size: 12px;
  color: #909399;
}

/* 基础连接线样式 */
.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  left: calc(50% + 12px);
  width: calc(100% - 24px);
  height: 2px;
  background: #dcdfe6;
  z-index: 0;
}

/* 激活状态的连接线样式 */
.timeline-item.active-connection:not(:last-child)::after {
  background: #409eff;
}

/* 激活状态的文本样式 */
.timeline-item.active-connection .stage-name,
.timeline-item.active-connection .stage-time {
  color: #409eff;
}

.dialog-footer {
  text-align: center;
}

/* 信息区域样式 */
.info-section {
  padding: 10px 0;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-icon {
  color: #909399;
  cursor: help;
}

.report-form {
  margin-bottom: 0;
}

.basic-info-text {
  display: flex;
  flex-direction: column;
  gap: 12px;
  font-size: 14px;
  color: #303133;
}

.info-text-row {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.info-text-item {
  min-width: 240px;
  display: flex;
  align-items: center;
}

.info-text-item.full-width {
  width: 100%;
}

.info-text-item .label {
  color: #606266;
  font-weight: 500;
  margin-right: 8px;
}

.info-text-item .value {
  color: #303133;
  word-break: break-all;
}

.info-text-item .value.description {
  line-height: 1.6;
}

.info-paragraph {
  margin: 0;
  color: #303133;
  line-height: 1.6;
  white-space: pre-wrap;
}

/* 适配Element Plus的form-item间距 */
:deep(.el-form-item) {
  margin-bottom: 16px;
}

/* 举报材料样式 */
.material-section {
  margin-bottom: 20px;
}

.material-label {
  display: inline-block;
  font-weight: 500;
  margin-bottom: 10px;
  color: #606266;
}

.video-size-tag {
  margin-left: 10px;
}

/* 图片列表样式 */
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 10px;
}

.image-item {
  width: 100px;
  height: 100px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.preview-image {
  width: 100%;
  height: 100%;
}

/* 视频列表样式 */
.video-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 10px;
}

.video-item {
  width: 200px;
  height: 150px;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.video-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #606266;
}

.video-size {
  position: absolute;
  top: 8px;
  right: 8px;
  color: #909399;
  font-size: 12px;
}

.download-area {
  height: 25%;
  background-color: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  border-top: 1px solid #dcdfe6;
}

.download-btn {
  padding: 4px 12px;
  font-size: 12px;
}
</style>
