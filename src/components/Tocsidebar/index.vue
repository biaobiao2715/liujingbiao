<!-- TocSidebar.vue -->
<template>
    <div class="toc-sidebar" :class="{ 'toc-collapsed': collapsed }">
        <!-- 目录头部 -->
        <div class="toc-header">
            <span class="toc-title">文章目录</span>
            <div class="toc-actions">
                <el-tooltip :content="collapsed ? '展开目录' : '折叠目录'">
                    <el-button type="text" size="small" @click="toggleCollapse" class="collapse-btn">
                        <el-icon>
                            <component :is="collapsed ? 'Expand' : 'Fold'" />
                        </el-icon>
                    </el-button>
                </el-tooltip>
            </div>
        </div>

        <!-- 目录内容 -->
        <div class="toc-content" v-show="!collapsed">
            <div v-if="tocList.length > 0" class="toc-list">
                <div v-for="item in tocList" :key="item.id"
                    :class="['toc-item', `toc-level-${item.level}`, { 'toc-active': activeId === item.id }]"
                    @click="handleTocClick(item)">
                    <span class="toc-text">{{ item.text }}</span>
                </div>
            </div>
            <div v-else class="toc-empty">
                <el-icon class="empty-icon">
                    <Document />
                </el-icon>
                <p class="empty-text">暂无目录</p>
                <p class="empty-tip">使用标题格式编辑内容后将自动生成目录</p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Expand, Fold } from '@element-plus/icons-vue'

interface TocItem {
    id: string
    text: string
    tag: string
    level: number
}

interface Props {
    content?: string
    editorContainer?: string
    autoScroll?: boolean
}

interface Emits {
    (e: 'toc-click', item: TocItem): void
    (e: 'active-change', id: string): void
    (e: 'content-update', content: string): void
}

const props = withDefaults(defineProps<Props>(), {
    content: '',
    editorContainer: '.w-e-text-container',
    autoScroll: true
})

const emit = defineEmits<Emits>()

// 目录列表
const tocList = ref<TocItem[]>([])
// 当前激活的目录项
const activeId = ref<string>('')
// 是否折叠
const collapsed = ref(false)

/** 生成唯一ID */
const generateUniqueId = (text: string, index: number): string => {
    const cleanText = text.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '-').toLowerCase()
    return `heading-${cleanText}-${index}-${Date.now()}`
}

/** 生成目录 */
const generateToc = (content: string): { toc: TocItem[], updatedContent: string } => {
    if (!content) {
        return { toc: [], updatedContent: content }
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

        return {
            toc: toc,
            updatedContent: doc.documentElement.innerHTML
        }
    } catch (error) {
        console.error('生成目录失败:', error)
        return { toc: [], updatedContent: content }
    }
}

/** 滚动到指定标题位置 */
const scrollToHeading = async (id: string): Promise<void> => {
    try {
        await nextTick()

        let targetElement = null

        // 在编辑器中查找
        const editorContainer = document.querySelector(props.editorContainer)
        if (editorContainer) {
            const iframe = editorContainer.querySelector('iframe')
            if (iframe && iframe.contentDocument) {
                targetElement = iframe.contentDocument.getElementById(id)
            }

            if (!targetElement) {
                targetElement = editorContainer.querySelector(`[id="${id}"]`)
            }
        }

        // 在整个页面中查找
        if (!targetElement) {
            targetElement = document.getElementById(id)
        }

        if (targetElement) {
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

            // 更新激活状态
            activeId.value = id
            emit('active-change', id)

        } else {
            console.warn('未找到对应的标题元素:', id)
            ElMessage.info('正在定位标题位置...')
        }
    } catch (error) {
        console.error('滚动失败:', error)
        ElMessage.error('跳转失败，请稍后重试')
    }
}

/** 处理目录项点击 */
const handleTocClick = (item: TocItem): void => {
    if (props.autoScroll) {
        scrollToHeading(item.id)
    }
    emit('toc-click', item)
}

/** 切换折叠状态 */
const toggleCollapse = (): void => {
    collapsed.value = !collapsed.value
}

/** 设置激活的目录项 */
const setActiveToc = (id: string): void => {
    activeId.value = id
}

/** 监听内容变化 */
watch(
    () => props.content,
    (newContent) => {
        if (!newContent) {
            tocList.value = []
            return
        }

        try {
            const { toc, updatedContent } = generateToc(newContent)
            tocList.value = toc
            // 如果启用了内容更新，并且内容有变化，则发出更新事件
            if ( updatedContent !== newContent) {
                emit('content-update', updatedContent)
            }
        } catch (error) {
            console.error('生成目录失败:', error)
            tocList.value = []
        }
    },
    { immediate: true, deep: true }
)

// 暴露方法给父组件
defineExpose({
    scrollToHeading,
    setActiveToc,
    toggleCollapse,
    tocList
})
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