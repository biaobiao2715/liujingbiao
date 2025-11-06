<!-- ContentWithToc.vue -->
<template>
  <div class="content-with-toc">
    <!-- 文章目录 -->
    <div class="toc-sidebar">
      <div class="toc-content">
        <div v-if="tocList.length > 0" class="toc-list">
          <div 
            v-for="item in tocList" 
            :key="item.id"
            :class="['toc-item', `toc-level-${item.level}`]" 
            @click="scrollToHeading(item.id)"
          >
            <span class="toc-text">{{ item.text }}</span>
          </div>
        </div>
        <div v-else class="toc-empty">
          <el-icon class="empty-icon">
            <Document />
          </el-icon>
          <p class="empty-text">暂无目录</p>
          <p class="empty-tip">文章内容没有标题格式</p>
        </div>
      </div>
    </div>

    <!-- 正文内容 -->
    <div class="detail-content-wrapper">
      <div class="detail-content" ref="contentRef" v-html="processedContent"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

interface TocItem {
  id: string
  text: string
  tag: string
  level: number
}

interface Props {
  content?: string
}

interface Emits {
  (e: 'toc-click', item: TocItem): void
  (e: 'scroll-to-heading', id: string): void
}

const props = withDefaults(defineProps<Props>(), {
  content: ''
})

const emit = defineEmits<Emits>()

// 内容DOM引用
const contentRef = ref<HTMLElement>()
// 文章目录列表
const tocList = ref<TocItem[]>([])
// 处理后的内容（添加了ID）
const processedContent = ref('')

/** 生成唯一ID */
const generateUniqueId = (text: string, index: number): string => {
  const cleanText = text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase()
  return `heading-${cleanText}-${index}-${Date.now()}`
}

/** 处理内容 - 为标题添加ID并生成目录 */
const processContent = (content: string) => {
  if (!content) {
    processedContent.value = ''
    tocList.value = []
    return
  }

  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, 'text/html')
    const headings = doc.querySelectorAll('h1, h2, h3, h4, h5, h6')

    const toc = Array.from(headings).map((el, idx) => {
      const tagName = el.tagName.toUpperCase()
      const level = parseInt(tagName.substring(1))
      const text = el.textContent?.trim() || `标题${idx + 1}`

      // 生成唯一 ID
      let id = el.id
      if (!id || !id.startsWith('heading-')) {
        id = generateUniqueId(text, idx)
        el.id = id
      }

      return {
        id: id,
        text: text,
        tag: tagName,
        level: level
      }
    })

    // 更新目录列表
    tocList.value = toc
    // 更新处理后的内容
    processedContent.value = doc.documentElement.innerHTML

  } catch (error) {
    console.error('处理内容失败:', error)
    processedContent.value = content
    tocList.value = []
  }
}

/** 滚动到指定标题位置 */
const scrollToHeading = async (id: string) => {
  
  try {
    await nextTick()

    let targetElement = null

    // 在内容区域中查找标题元素
    if (contentRef.value) {
      targetElement = contentRef.value.querySelector(`#${id}`)
    }

    // 如果没找到，在整个文档中查找
    if (!targetElement) {
      targetElement = document.getElementById(id)
    }

    if (targetElement) {
      
      // 平滑滚动到目标位置
      targetElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'nearest'
      })

      // 添加高亮效果
      targetElement.classList.add('heading-highlight')
      setTimeout(() => {
        targetElement.classList.remove('heading-highlight')
      }, 2000)

      emit('scroll-to-heading', id)

    } else {
      console.warn('未找到对应的标题元素:', id)
      ElMessage.info('正在定位标题位置...')
      
      // 显示正在定位的标题文本
      const tocItem = tocList.value.find(item => item.id === id)
      if (tocItem) {
        ElMessage.info(`正在定位: ${tocItem.text}`)
      }
    }
  } catch (error) {
    console.error('滚动失败:', error)
    ElMessage.error('跳转失败，请稍后重试')
  }
}

/** 手动处理内容（外部调用） */
const processContentManually = (content: string) => {
  processContent(content)
}

// 监听内容变化
watch(
  () => props.content,
  (newContent) => {
    processContent(newContent)
  },
  { immediate: true }
)

// 暴露方法给父组件
defineExpose({
  scrollToHeading,
  processContent: processContentManually,
  tocList
})
</script>

<style scoped lang="scss">
.content-with-toc {
  display: flex;
  gap: 20px;
  width: 100%;
  margin-top: 8px;

  // 目录侧边栏 - 左侧
  .toc-sidebar {
    width: 280px;
    min-width: 280px;
    background: #ffffff;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
    display: flex;
    flex-direction: column;
    order: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .toc-content {
      flex: 1;
      overflow-y: auto;
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
      &:not(:hover) {
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
      }

      &.toc-level-2 {
        padding-left: 20px;
        font-size: 13px;
        font-weight: 600;
        
        &:hover {
          color: #389e0d;
        }
      }

      &.toc-level-3 {
        padding-left: 28px;
        font-size: 12px;
        color: #595959;
        
        &:hover {
          color: #d46b08;
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

  // 内容区域 - 右侧
  .detail-content-wrapper {
    flex: 1;
    min-width: 0;
    order: 2;
  }

  .detail-content {
    padding: 24px;
    background-color: #ffffff;
    border-radius: 8px;
    min-height: 500px;
    color: #303133;
    line-height: 1.8;
    border: 1px solid #e8e8e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin-top: 1.5em;
      margin-bottom: 0.8em;
      color: #1f2d3d;
      transition: all 0.3s ease;
      cursor: pointer;
      border-radius: 4px;
      padding: 8px 12px;
      margin-left: -12px;
      margin-right: -12px;
      background: transparent;
      border: none;

      &:hover {
        background: #f5f7fa;
        transform: translateX(4px);
      }
    }

    :deep(h1) {
      font-size: 2em;
    //   border-bottom: 3px solid #1890ff;
      padding-bottom: 0.4em;
    }

    :deep(h2) {
      font-size: 1.6em;
    //   border-left: 4px solid #52c41a;
      padding-left: 0.8em;
    }

    :deep(h3) {
      font-size: 1.3em;
    //   border-left: 3px solid #faad14;
      padding-left: 0.6em;
    }

    :deep(h4) {
      font-size: 1.1em;
    //   border-left: 2px solid #722ed1;
      padding-left: 0.5em;
    }

    :deep(p) {
      margin-bottom: 1.2em;
      text-align: justify;
    }

    :deep(ul),
    :deep(ol) {
      margin: 1em 0;
      padding-left: 2em;
    }

    :deep(li) {
      margin-bottom: 0.5em;
    }

    :deep(blockquote) {
      border-left: 4px solid #1890ff;
      background: #f0f7ff;
      padding: 1em 1.5em;
      margin: 1.5em 0;
      border-radius: 0 8px 8px 0;
    }

    :deep(table) {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    :deep(th),
    :deep(td) {
      border: 1px solid #e8e8e8;
      padding: 12px;
      text-align: left;
    }

    :deep(th) {
      background: #fafafa;
      font-weight: 600;
    }

    :deep(tr:nth-child(even)) {
      background: #fafafa;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .content-with-toc {
    flex-direction: column;

    .toc-sidebar {
      width: 100%;
      min-width: 100%;
      max-height: 300px;

      .toc-list {
        max-height: 200px;
      }
    }
  }
}

// 中等屏幕优化
@media (min-width: 769px) and (max-width: 1024px) {
  .content-with-toc {
    .toc-sidebar {
      width: 240px;
      min-width: 240px;
    }
  }
}

// 大屏幕优化
@media (min-width: 1200px) {
  .content-with-toc {
    .toc-sidebar {
      width: 300px;
      min-width: 300px;
    }
  }
}
</style>

<style>
/* 全局样式 - 用于标题高亮效果 */
.heading-highlight {
  background: #e6f7ff !important;
  border-left: 4px solid #1890ff !important;
  padding-left: 12px !important;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
  transform: translateX(4px);
}
</style>