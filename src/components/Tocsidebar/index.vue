<!-- TocSidebar.vue 优化版 -->
<template>
  <div class="toc-sidebar" :class="{ 'toc-collapsed': collapsed, 'toc-mobile': isMobile }">
    <!-- 目录头部 -->
    <div class="toc-header">
      <span class="toc-title">文章目录</span>
      <div class="toc-actions">
        <!-- 刷新按钮（可选） -->
        <el-tooltip content="刷新目录">
          <el-button type="text" size="small" @click="refreshToc" class="refresh-btn">
            <el-icon><Refresh /></el-icon>
          </el-button>
        </el-tooltip>
        <!-- 折叠/展开按钮 -->
        <el-tooltip :content="collapsed ? '展开目录' : '折叠目录'">
          <el-button type="text" size="small" @click="toggleCollapse" class="collapse-btn">
            <el-icon><component :is="collapsed ? 'Expand' : 'Fold'" /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>

    <!-- 目录内容 -->
    <div class="toc-content" v-show="!collapsed" :style="{ maxHeight: contentMaxHeight }">
      <div v-if="tocList.length > 0" class="toc-list">
        <div
          v-for="item in tocList"
          :key="item.id"
          :class="['toc-item', `toc-level-${item.level}`, { 'toc-active': activeId === item.id, 'toc-disabled': !item.isValid }]"
          @click="handleTocClick(item)"
          @mouseenter="hoverId = item.id"
          @mouseleave="hoverId = ''"
        >
          <!-- 层级指示器 -->
          <span class="toc-level-indicator" :style="{ backgroundColor: levelColorMap[item.level] }"></span>
          <span class="toc-text" :title="item.text">{{ item.text }}</span>
          <!-- 激活状态动画 -->
          <span class="toc-active-animation" v-if="activeId === item.id"></span>
        </div>
      </div>
      <div v-else class="toc-empty">
        <el-icon class="empty-icon"><Document /></el-icon>
        <p class="empty-text">暂无目录</p>
        <p class="empty-tip">使用 h1-h6 标题格式编辑内容后将自动生成</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted } from 'vue';
import { ElMessage, ElTooltip, ElButton, ElIcon } from 'element-plus';
import { Document, Expand, Fold, Refresh } from '@element-plus/icons-vue';

// ======================================== 类型定义 ========================================
interface TocItem {
  id: string;
  text: string;
  tag: string;
  level: number;
  isValid: boolean; // 标记是否有效（避免定位失败）
}

interface Props {
  content?: string;
  editorContainer?: string;
  autoScroll?: boolean;
  enableContentUpdate?: boolean; // 控制是否修改原内容（默认关闭，避免输入冲突）
  debounceTime?: number; // 防抖时间（默认 300ms）
  maxHeight?: string; // 目录最大高度（默认自适应）
}

interface Emits {
  (e: 'toc-click', item: TocItem): void;
  (e: 'active-change', id: string): void;
  (e: 'content-update', content: string): void;
}

// ======================================== Props/Emits ========================================
const props = withDefaults(defineProps<Props>(), {
  content: '',
  editorContainer: '.w-e-text-container',
  autoScroll: true,
  enableContentUpdate: false, // 关键：默认禁用修改原内容
  debounceTime: 300,
  maxHeight: 'calc(100vh - 200px)'
});

const emit = defineEmits<Emits>();

// ======================================== 状态管理 ========================================
const tocList = ref<TocItem[]>([]);
const activeId = ref<string>('');
const collapsed = ref(false);
const hoverId = ref<string>('');
const isMobile = ref(false);
const contentMaxHeight = computed(() => props.maxHeight);

// 层级颜色映射（优化视觉区分）
const levelColorMap = {
  1: '#0050b3',
  2: '#389e0d',
  3: '#d46b08',
  4: '#722ed1',
  5: '#1890ff',
  6: '#8c8c8c'
};

// ======================================== 工具函数 ========================================
/** 生成唯一ID（优化重复标题处理） */
const generateUniqueId = (text: string, index: number): string => {
  const cleanText = text
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  const baseId = cleanText || `heading-${index}`;
  return `${baseId}-${Date.now().toString(36).slice(-4)}`; // 缩短ID长度
};

/** 防抖函数 */
const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number): T => {
  let timer: NodeJS.Timeout | null = null;
  return ((...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
};

/** 检测是否为移动端 */
const checkIsMobile = () => {
  isMobile.value = window.innerWidth <= 768;
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth <= 768;
  });
};

// ======================================== 核心逻辑 ========================================
/** 生成目录（优化：不修改原内容，仅记录ID用于定位） */
const generateToc = (content: string): { toc: TocItem[]; updatedContent: string } => {
  if (!content) return { toc: [], updatedContent: content };

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, 'text/html');
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');

    const toc = Array.from(headings).map((el, idx) => {
      const tagName = el.tagName.toUpperCase();
      const level = Math.min(parseInt(tagName.substring(1)), 6); // 限制最大层级为6
      const text = el.textContent?.trim() || `标题${idx + 1}`;

      // 生成临时ID（不修改原DOM，仅用于目录内部映射）
      let id = el.id || generateUniqueId(text, idx);

      return {
        id,
        text,
        tag: tagName,
        level,
        isValid: !!text // 空标题标记为无效
      };
    });

    // 仅当启用时才返回修改后的内容（默认禁用）
    const updatedContent = props.enableContentUpdate ? doc.documentElement.innerHTML : content;
    return { toc, updatedContent };
  } catch (error) {
    console.error('生成目录失败:', error);
    return { toc: [], updatedContent: content };
  }
};

/** 滚动到指定标题（优化：兼容iframe + 精准定位 + 防抖动） */
const scrollToHeading = async (item: TocItem): Promise<void> => {
  if (!item.isValid) return ElMessage.warning('该标题无效，无法定位');

  try {
    await nextTick();

    let targetElement: HTMLElement | null = null;
    const editorContainer = document.querySelector(props.editorContainer);

    if (editorContainer) {
      // 1. 优先查找iframe内的元素
      const iframe = editorContainer.querySelector('iframe') as HTMLIFrameElement;
      if (iframe?.contentDocument) {
        // 先通过ID查找，失败则通过文本+层级匹配
        targetElement =
          iframe.contentDocument.getElementById(item.id) ||
          (Array.from(iframe.contentDocument.querySelectorAll(item.tag)).find((el) => el.textContent?.trim() === item.text) as HTMLElement);
      }

      // 2. iframe内未找到，查找容器内直接子元素
      if (!targetElement) {
        targetElement =
          editorContainer.querySelector(`#${item.id}`) ||
          (Array.from(editorContainer.querySelectorAll(item.tag)).find((el) => el.textContent?.trim() === item.text) as HTMLElement);
      }
    }

    // 3. 全局查找（兜底）
    if (!targetElement) {
      targetElement =
        document.getElementById(item.id) ||
        (Array.from(document.querySelectorAll(item.tag)).find((el) => el.textContent?.trim() === item.text) as HTMLElement);
    }

    if (targetElement) {
      // 优化滚动逻辑：避免滚动到视口外
      const container = targetElement.closest(props.editorContainer) || window;
      if (container === window) {
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        (container as HTMLElement).scrollTo({
          top: targetElement.offsetTop - 20, // 偏移20px，避免被导航栏遮挡
          behavior: 'smooth'
        });
      }

      // 高亮动画（优化：使用CSS动画，避免操作DOM）
      targetElement.classList.add('heading-highlight');
      setTimeout(() => targetElement?.classList.remove('heading-highlight'), 1500);

      // 更新激活状态
      activeId.value = item.id;
      emit('active-change', item.id);
    } else {
      console.warn('未找到标题元素:', item);
      ElMessage.info('未找到对应的标题，请检查内容是否已修改');
    }
  } catch (error) {
    console.error('滚动失败:', error);
    ElMessage.error('标题定位失败，请稍后重试');
  }
};

/** 处理目录点击 */
const handleTocClick = (item: TocItem): void => {
  if (props.autoScroll) scrollToHeading(item);
  emit('toc-click', item);
};

/** 切换折叠状态 */
const toggleCollapse = (): void => {
  collapsed.value = !collapsed.value;
  // 移动端折叠时自动隐藏
  if (isMobile.value && collapsed.value) {
    activeId.value = '';
  }
};

/** 刷新目录 */
const refreshToc = (): void => {
  const { toc, updatedContent } = generateToc(props.content);
  tocList.value = toc;
  if (props.enableContentUpdate && updatedContent !== props.content) {
    emit('content-update', updatedContent);
  }
  ElMessage.success('目录已刷新');
};

// ======================================== 监听与初始化 ========================================
// 防抖处理目录更新（避免输入时频繁触发）
const debouncedGenerateToc = debounce((newContent: string) => {
  const { toc, updatedContent } = generateToc(newContent);
  tocList.value = toc;
  if (props.enableContentUpdate && updatedContent !== newContent) {
    emit('content-update', updatedContent);
  }
}, props.debounceTime);

// 监听内容变化生成目录
watch(() => props.content, debouncedGenerateToc, { immediate: true, deep: true });

// 初始化检测设备类型
onMounted(() => {
  checkIsMobile();
});

// ======================================== 暴露方法 ========================================
defineExpose({
  scrollToHeading,
  setActiveToc: (id: string) => (activeId.value = id),
  toggleCollapse,
  refreshToc,
  tocList
});
</script>

<style scoped lang="scss">
.toc-sidebar {
  width: 280px;
  min-width: 280px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  &.toc-collapsed {
    width: 60px;
    min-width: 60px;

    .toc-title {
      display: none;
    }
  }

  .toc-header {
    padding: 16px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #ffffff;
    border-bottom: 1px solid #e4e7ed;
    border-radius: 8px 8px 0 0;

    .toc-title {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
    }

    .toc-actions {
      .collapse-btn {
        padding: 4px;
        color: #606266;

        &:hover {
          color: #409eff;
          background: rgba(64, 158, 255, 0.1);
        }
      }
    }
  }

  .toc-content {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    background: #ffffff;

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
      background-color: #f5f7fa;
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
    border: none;
    background: transparent;

    // 默认状态 - 无背景色和边框
    &:not(:hover):not(.toc-active) {
      background: transparent;
      border: none;
    }

    &:hover {
      background: #f5f7fa;
      color: #409eff;
      transform: translateX(2px);
    }

    &:active {
      background: #ecf5ff;
      transform: translateX(1px);
    }

    &.toc-active {
      color: #409eff;
      font-weight: 600;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 16px;
        background-color: #409eff;
        border-radius: 1px;
      }
    }

    .toc-text {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      transition: all 0.2s ease;
    }

    // 不同层级的缩进和样式
    &.toc-level-1 {
      font-weight: 700;
      font-size: 14px;
      color: #303133;
      padding-left: 12px;

      &:hover {
        color: #0050b3;
      }

      &.toc-active {
        color: #0050b3;

        &::before {
          background-color: #0050b3;
        }
      }
    }

    &.toc-level-2 {
      padding-left: 20px;
      font-size: 13px;
      font-weight: 600;

      &:hover {
        color: #389e0d;
      }

      &.toc-active {
        color: #389e0d;

        &::before {
          background-color: #389e0d;
        }
      }
    }

    &.toc-level-3 {
      padding-left: 28px;
      font-size: 12px;
      color: #595959;

      &:hover {
        color: #d46b08;
      }

      &.toc-active {
        color: #d46b08;

        &::before {
          background-color: #d46b08;
        }
      }
    }

    &.toc-level-4,
    &.toc-level-5,
    &.toc-level-6 {
      padding-left: 36px;
      font-size: 12px;
      color: #8c8c8c;

      &:hover {
        color: #722ed1;
      }

      &.toc-active {
        color: #722ed1;

        &::before {
          background-color: #722ed1;
        }
      }
    }
  }

  .toc-empty {
    text-align: center;
    padding: 60px 20px;
    color: #909399;
    background: transparent;

    .empty-icon {
      font-size: 36px;
      color: #c0c4cc;
      margin-bottom: 12px;
    }

    .empty-text {
      font-size: 14px;
      color: #909399;
      margin: 8px 0 4px;
    }

    .empty-tip {
      font-size: 12px;
      color: #c0c4cc;
      line-height: 1.6;
      margin: 0;
      padding: 0 10px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .toc-sidebar {
    width: 100%;
    min-width: 100%;
    max-height: 300px;

    .toc-list {
      max-height: 200px;
    }
  }
}
</style>
