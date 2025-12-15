<!--
  标题: 知识库案件查看弹窗
  功能: 知识库案件详情查看，包含目录导航和附件列表
  说明: 专门用于查看知识库案件详情，包含目录导航和附件列表功能，支持下载附件
  当前版本: 2.0
  开发信息: Created by 门世超 2025-10-20, Refactored 2025-11-22
-->
<template>
  <el-dialog :model-value="visible" title="查看案件分析" width="50%" destroy-on-close :close-on-click-modal="false" @close="handleClose">
    <div class="case-view-container" v-loading="loading">
      <!-- 案件名称 -->
      <div class="case-name-section">
        <div class="case-name-value">{{ caseName || '--' }}</div>
      </div>

      <!-- 主要内容区域：左侧目录 + 右侧内容 -->
      <div class="content-wrapper">
        <!-- 左侧目录导航 -->
        <div class="toc-sidebar-wrapper" :class="{ 'toc-collapsed': isTocCollapsed }">
          <TocSidebar :content="caseContent" editor-container=".content-area" :auto-scroll="true" @toc-click="handleTocClick" ref="tocSidebarRef" />
        </div>

        <!-- 右侧内容区域 -->
        <div class="content-area">
          <div class="case-content-area" v-html="caseContent"></div>
        </div>
      </div>

      <!-- 附件列表：仅在附件类型有有效值时展示 -->
      <div class="attachment-section" v-if="visibleAttachmentList.length > 0">
        <div class="section-title">附件</div>
        <el-table :data="visibleAttachmentList" stripe border class="attachment-table">
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="附件类型" width="120" align="center">
            <template #default="scope">
              <span>{{ getFileTypeText(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="originalName" label="法律文书模版" align="left" :show-overflow-tooltip="true" />
          <el-table-column prop="fileSize" label="附件大小" width="120" align="center" />
          <el-table-column label="操作" width="120" align="center">
            <template #default="scope">
              <el-button type="primary" link @click="handleDownloadFile(scope.row)">
                <el-icon><Download /></el-icon>
                下载
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleClose">返回</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted, getCurrentInstance, type ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Download } from '@element-plus/icons-vue';
import { fetchKnowledgeCaseDetail } from '@/api/rightsPlatform/knowledgeCaseManage/index';
import { downloadFileByUrl } from '@/utils/downloadFileByUrl';
import TocSidebar from '@/components/Tocsidebar/index.vue';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    detail?: Record<string, any>;
  }>(),
  {
    visible: false
  }
);

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void;
  (e: 'close'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);
const caseName = ref('');
const caseContent = ref('');
const tocSidebarRef = ref();
const isTocCollapsed = ref(false);

const attachmentList = ref<
  Array<{
    ossId?: number;
    fileName?: string;
    originalName: string;
    fileSuffix?: string;
    url: string;
    fileSize?: string;
    fileType?: string;
    foreignType?: string;
  }>
>([]);

// 仅当附件类型有值时才显示在列表中；如果后端未返回附件类型或前端已清空附件，则不展示附件部分
const visibleAttachmentList = computed(() =>
  attachmentList.value.filter((item) => {
    const type = item.fileType != null ? String(item.fileType).trim() : '';
    const ossId = item.ossId != null ? String(item.ossId).trim() : '';
    const originalName = (item.originalName ?? '').trim();
    const fileName = (item.fileName ?? '').trim();
    const nameProvided = originalName !== '' || fileName !== '';
    return type !== '' && ossId !== '' && nameProvided;
  })
);

// 获取文件类型文本
const decodeRichText = (content?: string | null) => {
  if (!content) return '';
  const needDecode = /&lt;|&gt;|&amp;|&quot;|&#39;/.test(content);
  if (!needDecode) return content;
  if (typeof window !== 'undefined') {
    const textarea = document.createElement('textarea');
    textarea.innerHTML = content;
    return textarea.value.replace(/\\n/g, '\n');
  }
  return content
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
};

const getFileTypeText = (file: any): string => {
  const fileType = file.fileType;
  if (fileType === '0') return '图片';
  if (fileType === '1') return '视频';
  if (fileType === '2') return '文档';
  if (fileType === '99') return '其他';
  return '未知';
};

const getFileType = (fileName: string, fileType?: string): string => {
  if (fileType) return fileType;
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  const docExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx'];
  if (docExt.includes(ext)) return '2';
  return '99';
};

const normalizeAttachment = (item: any) => {
  const remote = item.remote || item.remoteOssVos?.[0] || {};
  return {
    ossId: item.ossId || remote.ossId || remote.id,
    fileName: item.fileName || remote.fileName || remote.originalName || '附件',
    originalName: item.originalName || remote.originalName || item.fileName || '附件',
    fileSuffix: item.fileSuffix || remote.fileSuffix || '',
    url: item.url || remote.url || '',
    fileSize: item.fileSize || remote.fileSize || '--',
    fileType: item.fileType || getFileType(item.originalName || item.fileName || remote.originalName || '', item.fileType),
    foreignType: item.foreignType || '1',
    remote
  };
};

// 下载文件
const handleDownloadFile = (row: any) => {
  if (!row) return;
  const ossId = row.ossId || row.remote?.ossId || row.remote?.id;
  if (ossId) {
    (proxy as any)?.$download?.oss(String(ossId));
    return;
  }
  const url = row.url || row.remote?.url;
  if (url) {
    downloadFileByUrl(url, row.originalName || row.fileName || '附件');
    return;
  }
  ElMessage.warning('附件链接不存在，无法下载');
};

// 目录相关回调
const handleTocClick = async (item: any) => {
  // 目录点击行为交由 TocSidebar 内部滚动处理，这里作为备用处理
  // 如果 TocSidebar 的自动滚动失败，则使用此逻辑
  if (item && item.id) {
    await nextTick();
    await nextTick(); // 多等待一个 tick，确保 DOM 完全渲染

    // 滚动容器是 .content-area，内容是 .case-content-area
    const scrollContainer = document.querySelector('.content-area') as HTMLElement;
    const contentArea = document.querySelector('.case-content-area') as HTMLElement;

    if (!scrollContainer || !contentArea) {
      console.warn('未找到滚动容器或内容区域');
      return;
    }

    let targetElement: HTMLElement | null = null;

    // 优先通过ID查找（会在所有后代元素中查找，包括嵌套的）
    // 如果 ID 包含特殊字符，使用 getElementById；否则使用 querySelector
    try {
      targetElement = contentArea.querySelector(`#${item.id}`) as HTMLElement;
      // 如果 querySelector 找不到但 ID 存在，尝试 getElementById
      if (!targetElement) {
        const globalElement = document.getElementById(item.id);
        if (globalElement && contentArea.contains(globalElement)) {
          targetElement = globalElement as HTMLElement;
        }
      }
    } catch (e) {
      // 如果 querySelector 因为特殊字符失败，使用 getElementById
      const globalElement = document.getElementById(item.id);
      if (globalElement && contentArea.contains(globalElement)) {
        targetElement = globalElement as HTMLElement;
      }
    }

    // 如果通过ID找不到，尝试通过标签和文本精确匹配（查找所有后代元素）
    if (!targetElement && item.tag) {
      const headings = Array.from(contentArea.querySelectorAll(item.tag)) as HTMLElement[];
      // 精确匹配文本内容
      targetElement =
        headings.find((heading) => {
          const headingText = heading.textContent?.trim() || '';
          const itemText = item.text?.trim() || '';
          return headingText === itemText;
        }) || null;
    }

    // 如果还是找不到，尝试全局查找（作为最后的兜底方案）
    if (!targetElement) {
      targetElement = document.getElementById(item.id) as HTMLElement;
      // 如果全局找到但不在内容区域内，重新查找
      if (targetElement && !contentArea.contains(targetElement)) {
        targetElement = null;
      }
    }

    if (targetElement) {
      // 使用 getBoundingClientRect 计算相对于滚动容器的位置
      const scrollRect = scrollContainer.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();

      // 计算目标元素相对于滚动容器的滚动位置
      const scrollTop = scrollContainer.scrollTop;
      const relativeTop = targetRect.top - scrollRect.top + scrollTop;

      // 滚动到目标位置，留出20px的偏移量
      scrollContainer.scrollTo({
        top: Math.max(0, relativeTop - 20), // 确保不为负数
        behavior: 'smooth'
      });
    } else {
      console.warn('未找到目标元素:', item);
      ElMessage.warning(`未找到标题"${item.text}"，请检查内容是否已修改`);
    }
  }
};

// 监听内容区域滚动，更新目录激活状态
let scrollTimer: any = null;
const handleContentScroll = () => {
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
  scrollTimer = setTimeout(() => {
    const scrollContainer = document.querySelector('.content-area');
    const contentArea = document.querySelector('.case-content-area');
    if (!scrollContainer || !contentArea || !tocSidebarRef.value) return;

    const headings = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let activeId = '';

    const scrollRect = (scrollContainer as HTMLElement).getBoundingClientRect();

    for (let i = headings.length - 1; i >= 0; i--) {
      const heading = headings[i] as HTMLElement;
      const rect = heading.getBoundingClientRect();

      if (rect.top <= scrollRect.top + 100) {
        activeId = heading.id;
        break;
      }
    }

    if (activeId && tocSidebarRef.value.setActiveToc) {
      tocSidebarRef.value.setActiveToc(activeId);
    }
  }, 100);
};

// 监听目录折叠状态变化
watch(
  () => tocSidebarRef.value?.collapsed,
  (collapsed) => {
    isTocCollapsed.value = collapsed || false;
  },
  { immediate: true, deep: true }
);

onMounted(() => {
  const scrollContainer = document.querySelector('.content-area');
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleContentScroll);
  }
  // 初始化折叠状态
  if (tocSidebarRef.value?.collapsed !== undefined) {
    isTocCollapsed.value = tocSidebarRef.value.collapsed;
  }
});

onUnmounted(() => {
  const scrollContainer = document.querySelector('.content-area');
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleContentScroll);
  }
  if (scrollTimer) {
    clearTimeout(scrollTimer);
  }
});

// 获取详情
const fetchDetail = async () => {
  if (!props.detail?.id) {
    caseName.value = '';
    caseContent.value = '';
    attachmentList.value = [];
    return;
  }

  loading.value = true;
  try {
    const response: any = await fetchKnowledgeCaseDetail(props.detail.id);

    if (response && response.code === 200) {
      const data = response.data;
      caseName.value = data.knowledgeCaseName || '';

      let contentContent = decodeRichText(data.knowledgeCaseContent || '');
      if (!contentContent || (typeof contentContent === 'string' && contentContent.trim() === '')) {
        contentContent = '';
      }

      caseContent.value = contentContent;

      await nextTick();
      await nextTick();

      // 确保标题有ID，以便目录导航
      // 使用与 TocSidebar 相同的 ID 生成逻辑
      const contentArea = document.querySelector('.case-content-area');
      if (contentArea) {
        const headings = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading, index) => {
          if (!heading.id) {
            const text = heading.textContent?.trim() || `heading-${index}`;
            const cleanText = text
              .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            const baseId = cleanText || `heading-${index}`;
            heading.id = `${baseId}-${Date.now().toString(36).slice(-4)}`;
          }
        });
      }

      // 处理附件列表
      // 判断附件是否为空：如果关键字段都是空字符串，则不显示附件
      const isAttachmentEmpty = (file: any) => {
        if (!file || typeof file !== 'object') return true;
        const fileType = (file.fileType || '').trim();
        const originalName = (file.originalName || '').trim();
        // 如果 fileType 和 originalName 都是空字符串，则认为附件为空（即使 ossId 有值）
        return fileType === '' && originalName === '';
      };

      if (data.protectionFiles && Array.isArray(data.protectionFiles)) {
        const validFiles = data.protectionFiles.filter((file) => !isAttachmentEmpty(file));
        attachmentList.value = validFiles.length > 0 ? [normalizeAttachment(validFiles[0])] : [];
      } else if (data.protectionFiles && typeof data.protectionFiles === 'object') {
        // 单个附件对象
        if (!isAttachmentEmpty(data.protectionFiles)) {
          attachmentList.value = [normalizeAttachment(data.protectionFiles)];
        } else {
          attachmentList.value = [];
        }
      } else {
        attachmentList.value = [];
      }
    } else {
      ElMessage.error(response?.msg || '获取详情失败');
    }
  } catch (error) {
    console.error('获取详情失败:', error);
    ElMessage.error('获取详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.visible,
  (val) => {
    if (val) {
      fetchDetail();
    } else {
      caseName.value = '';
      caseContent.value = '';
      attachmentList.value = [];
    }
  },
  { immediate: true }
);

// 监听内容变化，确保目录能够正确生成
watch(
  () => caseContent.value,
  async (newContent) => {
    if (newContent) {
      await nextTick();
      // 确保标题有ID，使用与 TocSidebar 相同的 ID 生成逻辑
      const contentArea = document.querySelector('.case-content-area');
      if (contentArea) {
        const headings = contentArea.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach((heading, index) => {
          if (!heading.id) {
            const text = heading.textContent?.trim() || `heading-${index}`;
            const cleanText = text
              .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '');
            const baseId = cleanText || `heading-${index}`;
            heading.id = `${baseId}-${Date.now().toString(36).slice(-4)}`;
          }
        });
      }
    }
  },
  { immediate: true }
);

const handleClose = () => {
  emit('update:visible', false);
  emit('close');
};
</script>

<style scoped lang="scss">
.case-view-container {
  min-height: 500px;
}

.case-name-section {
  text-align: center;
  margin-bottom: 24px;

  .case-name-label {
    font-size: 14px;
    color: #606266;
    margin-bottom: 8px;
    font-weight: 500;
  }

  .case-name-value {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
    line-height: 1.5;
  }
}

.content-wrapper {
  display: flex;
  gap: 0;
  width: 100%;
  min-height: 500px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 20px;
}

.toc-sidebar-wrapper {
  width: 280px;
  min-width: 280px;
  background: #f5f5f5;
  border-right: 1px solid #dcdfe6;
  overflow: hidden;
  transition:
    width 0.3s ease,
    min-width 0.3s ease;

  &.toc-collapsed {
    width: 60px;
    min-width: 60px;
  }
}

.content-area {
  flex: 1;
  min-width: 0;
  background: #ffffff;
  overflow-y: auto;
  max-height: 600px;

  .case-content-area {
    padding: 20px;
    line-height: 1.8;
    color: #303133;

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 20px;
      margin-bottom: 12px;
      font-weight: 600;
      color: #303133;
    }

    :deep(h1) {
      font-size: 24px;
    }

    :deep(h2) {
      font-size: 20px;
    }

    :deep(h3) {
      font-size: 18px;
    }

    :deep(h4) {
      font-size: 16px;
    }

    :deep(p) {
      margin-bottom: 12px;
      line-height: 1.8;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      margin: 12px 0;
      border-radius: 4px;
    }

    :deep(ul),
    :deep(ol) {
      margin-bottom: 12px;
      padding-left: 24px;
    }

    :deep(li) {
      margin-bottom: 8px;
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 12px 0;

      th,
      td {
        border: 1px solid #dcdfe6;
        padding: 8px 12px;
        text-align: left;
      }

      th {
        background-color: #f5f7fa;
        font-weight: 600;
      }
    }
  }
}

.attachment-section {
  margin-top: 20px;

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
    margin-bottom: 12px;
  }
}

.attachment-table {
  width: 100%;

  :deep(.el-button) {
    padding: 4px 8px;
    font-size: 14px;

    .el-icon {
      margin-right: 4px;
    }
  }
}

:deep(.el-dialog__footer) {
  .el-button {
    font-size: 14px;
  }
}

.attachment-info {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  background-color: #f9fafc;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.attachment-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 14px;
  color: #606266;
}

.attachment-name {
  font-weight: 500;
  color: #303133;
}

.attachment-size {
  color: #909399;
}

.attachment-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dialog-footer {
  text-align: right;
}

:deep(.el-dialog__footer) {
  text-align: center;
}

:deep(.toc-sidebar) {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border: none;
  border-radius: 0;

  .toc-header {
    padding: 16px 20px;
    font-size: 14px;
    font-weight: 500;
    color: #303133;
    background: #ebebeb;
    border-bottom: 1px solid #dcdfe6;
    text-align: center;
  }

  .toc-content {
    flex: 1;
    overflow-y: auto;
    max-height: calc(600px - 60px);
    padding: 16px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #c0c4cc;
      border-radius: 3px;

      &:hover {
        background-color: #909399;
      }
    }

    &::-webkit-scrollbar-track {
      background-color: #e4e7ed;
    }
  }

  .toc-list {
    max-height: none;
  }

  .toc-item {
    padding: 8px 10px;
    margin-bottom: 4px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #606266;
    font-size: 13px;
    line-height: 1.5;
    position: relative;

    &:hover {
      background-color: #e4e7ed;
      color: #409eff;
    }

    &:active {
      background-color: #d9dcdf;
    }

    &.toc-active {
      background-color: #e6f4ff;
      color: #409eff;
      font-weight: 500;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 3px;
        height: 16px;
        background-color: #409eff;
        border-radius: 0 2px 2px 0;
      }
    }

    .toc-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.toc-level-1 {
      font-weight: 600;
      font-size: 13px;
      color: #303133;
      padding-left: 10px;
    }

    &.toc-level-2 {
      padding-left: 20px;
      font-size: 12px;
    }

    &.toc-level-3 {
      padding-left: 30px;
      font-size: 12px;
      color: #909399;
    }

    &.toc-level-4,
    &.toc-level-5,
    &.toc-level-6 {
      padding-left: 40px;
      font-size: 12px;
      color: #a8abb2;
    }
  }

  .toc-empty {
    text-align: center;
    padding: 60px 20px;
    color: #909399;

    .empty-icon {
      font-size: 36px;
      color: #c0c4cc;
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 13px;
      color: #909399;
      margin: 8px 0 4px;
    }

    .empty-tip {
      font-size: 11px;
      color: #c0c4cc;
      line-height: 1.6;
      margin: 0;
      padding: 0 10px;
    }
  }
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }

  .toc-sidebar-wrapper {
    width: 100%;
    min-width: 100%;
    max-height: 300px;

    :deep(.toc-sidebar) {
      .toc-list {
        max-height: 200px;
      }
    }
  }

  .content-area {
    max-height: 400px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .toc-sidebar-wrapper {
    width: 200px;
    min-width: 200px;
  }
}
</style>
