<!-- 
标题：			trainingcourseDetail.vue
功能：			查看培训课程
说明:         
当前版本：	1.0
开发信息：	Created by 张峰 2025-11-5
修改人信息：张峰     2025-11-5
修改内容：查看培训课程
 -->
<template>
  <div class="content-detail-dialog" v-loading="loading">
    <!-- 文章元信息 -->
    <div class="article-meta">
      <div class="meta-left">
        <div class="author-info">
          <el-avatar :size="48" :src="detailData.avatar">{{ detailData.avatar }}</el-avatar>
          <span class="author-name">发布人: {{ detailData.author || '未知' }}</span>
        </div>
        <div class="publish-time">发布时间: {{ detailData.publishTime || '-' }}</div>
      </div>
      <div class="meta-right">
        <el-tag :type="detailData.status === '启用' ? 'success' : 'danger'">
          {{ detailData.status || '-' }}
        </el-tag>
        <div class="stats">
          <span class="stat-item">
            <el-icon>
              <View />
            </el-icon>
            浏览: {{ detailData.pageViews || 0 }}
          </span>
          <span class="stat-item">
            <el-icon>
              <Star />
            </el-icon>
            收藏量: {{ detailData.collectCount || 0 }}
          </span>
        </div>
      </div>
    </div>

    <!-- 分割线 -->
    <el-divider />

    <!-- 内容详细信息 -->
    <div class="content-details">
      <div class="detail-row">
        <span class="detail-label">课程标题:</span>
        <span class="detail-value" style="min-width: 0">
          <el-text truncated>{{ detailData.cultivateName }}</el-text>
        </span>
      </div>

      <div class="detail-row">
        <span class="detail-label">培训课程类别:</span>
        <span class="detail-value">
          <dict-tag :options="cultivate_type" :value="detailData.cultivateType" />
        </span>
      </div>

      <!-- 正文内容区域 - 添加目录和内容左右布局 -->
      <div class="detail-row content-row">
        <span class="detail-label">正文内容:</span>
        <ContentWithToc :content="detailData.cultivateContent" ref="contentWithTocRef" />
      </div>
      <!-- 主图 -->
      <div class="detail-row">
        <span class="detail-label">主图:</span>
        <div class="demo-image__preview">
          <el-image style="width: 100px; height: 100px" :src="detailData.url" :preview-src-list="detailData.srcList"> </el-image>
        </div>
      </div>
      <!-- 附件列表 -->
      <div class="detail-row" v-if="detailData.attachments && detailData.attachments.length > 0">
        <span class="detail-label">附件列表:</span>
        <div class="attachments-list">
          <el-table :data="detailData.attachments" border>
            <el-table-column label="附件名称" prop="originalName" />
            <el-table-column label="文件大小" prop="fileSize" width="120" align="center"></el-table-column>
            <el-table-column label="操作" width="120" align="center">
              <template #default="scope">
                <el-button type="primary" size="small" text @click="handleDownload(scope.row)"> 下载 </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>

    <!-- 底部按钮 -->
    <!-- <div class="dialog-footer">
      <el-button @click="emitCancel">关闭</el-button>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance, toRefs, nextTick, watch } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { View, Download, Star } from '@element-plus/icons-vue';
import { getcourseCultivatequeryDetail } from '@/api/system/courseCultivate';
import ContentWithToc from '@/components/ContentWithToc/index.vue';

const props = defineProps<{
  id?: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 使用字典数据
const { cultivate_type, cultivate_status } = toRefs<any>((proxy as any)?.useDict('cultivate_type', 'cultivate_status'));
const contentWithTocRef = ref(null);
// 加载状态
const loading = ref(false);
// 内容DOM引用
const contentRef = ref<HTMLElement>();
// 文章目录列表
const tocList = ref<
  Array<{
    id: string;
    text: string;
    tag: string;
    level: number;
  }>
>([]);
// 处理后的内容（添加了ID）
const processedContent = ref('');

// 详情数据
const detailData = ref({
  id: undefined as number | undefined,
  contentNo: '',
  cultivateName: '',
  contentTitle: '',
  cultivateType: '',
  cultivateContent: '',
  cultivateStatus: '',
  publishTime: '',
  pageViews: 0,
  collectCount: 0,
  author: '',
  avatar: '',
  status: '',
  attachments: [] as any[],
  url: '', //主图
  srcList: [] //预览
});

/** 格式化文件大小 */
const formatFileSize = (bytes: number): string => {
  if (!bytes) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

/** 获取内容详情 */
const fetchContentDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少内容ID');
    return;
  }

  loading.value = true;
  try {
    const response: any = await getcourseCultivatequeryDetail({ id: props.id as number });

    if (response && response.code === 200) {
      const data = response.data;

      if (!data) {
        ElMessage.error('获取内容详情失败：数据为空');
        return;
      }

      // 状态映射
      let statusText = '';
      if (data.cultivateStatus === '1' || data.cultivateStatus === 1) {
        statusText = '启用';
      } else if (data.cultivateStatus === '2' || data.cultivateStatus === 2) {
        statusText = '禁用';
      } else if (data.cultivateStatus === '0' || data.cultivateStatus === 0) {
        statusText = '草稿';
      }

      // 将接口返回的数据赋值给详情
      detailData.value = {
        id: data.id,
        contentNo: data.contentNo || '',
        cultivateName: data.cultivateName || '',
        contentTitle: data.contentTitle || '',
        cultivateType: data.cultivateType || '',
        cultivateContent: data.cultivateContent || '',
        cultivateStatus: data.cultivateStatus || '',
        publishTime: data.publishTime || '',
        pageViews: data.pageViews || 0,
        collectCount: data.collectCount || 0,
        author: data.createName || '未知',
        avatar: data.avatar || '未知',
        status: statusText,
        attachments: processAttachmentList(data.ossVoList || []),
        url: data.imageFile ? data.imageFile.url : '',
        srcList: [data.imageFile ? data.imageFile.url : '']
      };
    } else {
      ElMessage.error(response?.msg || '获取内容详情失败');
    }
  } catch (error) {
    console.error('获取内容详情失败:', error);
    ElMessage.error('获取内容详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};
/** 处理附件列表，解析文件大小 */
const processAttachmentList = (attachments: any[]): any[] => {
  if (!attachments || !Array.isArray(attachments)) {
    return [];
  }

  return attachments.map((item: any) => {
    let fileSize = '--';
    let fileSuffix = item.fileSuffix || '';

    // 解析 ext1 字段获取文件大小
    if (item.ext1) {
      try {
        const ext1Obj = JSON.parse(item.ext1);
        if (ext1Obj.fileSize !== undefined && ext1Obj.fileSize !== null) {
          fileSize = formatFileSize(Number(ext1Obj.fileSize));
        }

        // 如果有 contentType，可以从中提取文件类型
        if (ext1Obj.contentType) {
          fileSuffix = ext1Obj.contentType;
        }
      } catch (error) {
        console.error('解析附件 ext1 失败:', error, item.ext1);
      }
    }

    return {
      ...item,
      fileName: item.fileName || item.originalName,
      originalName: item.originalName || item.fileName,
      fileSuffix: fileSuffix,
      fileSize: fileSize
    };
  });
};
/** 下载附件 */
const handleDownload = async (file: any) => {
  console.log('file', file);
  try {
    const response = await fetch(file.url);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = file.originalName || file.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    ElMessage.success('文件下载成功');
  } catch (error) {
    ElMessage.error('文件下载失败，请重试');
  }
  // if (file.url) {
  //     window.open(file.url, '_blank');
  // } else {
  //     ElMessage.warning('附件链接不存在');
  // }
};

/** 关闭弹窗 */
// const emitCancel = () => {
//   emit('cancel');
// };

// 页面加载时获取详情数据
onMounted(() => {
  fetchContentDetail();
});
</script>

<style scoped lang="scss">
.content-detail-dialog {
  padding: 20px;
}

// 文章元信息区域
.article-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  .meta-left {
    display: flex;
    align-items: center;
    gap: 24px;

    .author-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .author-name {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }
    }

    .publish-time {
      font-size: 14px;
      color: #909399;
    }
  }

  .meta-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;

    .stats {
      display: flex;
      gap: 16px;

      .stat-item {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        color: #606266;

        .el-icon {
          font-size: 16px;
        }
      }
    }
  }
}

// 内容详细信息
.content-details {
  .detail-row {
    display: flex;
    margin-bottom: 20px;
    line-height: 1.8;

    &.content-row {
      flex-direction: column;
    }

    .detail-label {
      min-width: 100px;
      font-weight: 600;
      color: #606266;
      flex-shrink: 0;
    }

    .detail-value {
      flex: 1;
      color: #303133;
      word-break: break-all;
    }

    // 内容与目录布局 - 目录在左，内容在右
    .content-with-toc {
      display: flex;
      gap: 20px;
      width: 100%;
      margin-top: 8px;

      // 目录侧边栏 - 左侧
      .toc-sidebar {
        width: 280px;
        min-width: 280px;
        background: #f5f5f5;
        border-radius: 8px;
        border: 1px solid #dcdfe6;
        display: flex;
        flex-direction: column;
        order: 1; // 确保目录在左边

        .toc-header {
          padding: 16px 20px;
          font-size: 14px;
          font-weight: 600;
          color: #303133;
          background: linear-gradient(135deg, #f0f2f5 0%, #e4e7ed 100%);
          border-bottom: 1px solid #dcdfe6;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }

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
            background-color: #e4e7ed;
          }
        }

        .toc-list {
          max-height: none;
        }

        .toc-item {
          padding: 10px 12px;
          margin-bottom: 6px;
          border-radius: 6px;
          cursor: pointer; // 鼠标手型效果
          transition: all 0.3s ease;
          color: #606266;
          font-size: 14px;
          line-height: 1.5;
          position: relative;
          border-left: 3px solid transparent;

          &:hover {
            background: linear-gradient(135deg, #e6f7ff 0%, #bae7ff 100%);
            color: #1890ff;
            border-left-color: #1890ff;
            transform: translateX(4px);
            box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
          }

          &:active {
            background: linear-gradient(135deg, #d6e4ff 0%, #adc6ff 100%);
            transform: translateX(2px);
          }

          .toc-text {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            transition: all 0.3s ease;
          }

          // 不同层级的缩进和样式
          &.toc-level-1 {
            font-weight: 700;
            font-size: 15px;
            color: #1f2d3d;
            padding-left: 12px;
            background: #f8f9fa;
            border: 1px solid #e9ecef;

            &:hover {
              background: linear-gradient(135deg, #e6f7ff 0%, #91d5ff 100%);
              color: #0050b3;
              border-left-color: #0050b3;
            }
          }

          &.toc-level-2 {
            padding-left: 24px;
            font-size: 14px;
            font-weight: 600;
            margin-left: 8px;

            &:hover {
              background: linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%);
              color: #389e0d;
              border-left-color: #389e0d;
            }
          }

          &.toc-level-3 {
            padding-left: 36px;
            font-size: 13px;
            color: #595959;
            margin-left: 16px;

            &:hover {
              background: linear-gradient(135deg, #fff7e6 0%, #ffd591 100%);
              color: #d46b08;
              border-left-color: #d46b08;
            }
          }

          &.toc-level-4,
          &.toc-level-5,
          &.toc-level-6 {
            padding-left: 48px;
            font-size: 12px;
            color: #8c8c8c;
            margin-left: 24px;

            &:hover {
              background: linear-gradient(135deg, #f9f0ff 0%, #d3adf7 100%);
              color: #722ed1;
              border-left-color: #722ed1;
            }
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
        order: 2; // 确保内容在右边
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
          cursor: pointer; // 标题也添加手型效果
          border-radius: 4px;
          padding: 8px 12px;
          margin-left: -12px;
          margin-right: -12px;

          &:hover {
            background: linear-gradient(135deg, #f0f7ff 0%, #e6f7ff 100%);
            transform: translateX(4px);
          }
        }

        :deep(h1) {
          font-size: 2em;
          border-bottom: 3px solid #1890ff;
          padding-bottom: 0.4em;
          background: linear-gradient(135deg, #f6ffed 0%, #f0fff3 100%);
        }

        :deep(h2) {
          font-size: 1.6em;
          border-left: 4px solid #52c41a;
          padding-left: 0.8em;
          background: linear-gradient(135deg, #f6ffed 0%, #f0fff3 100%);
        }

        :deep(h3) {
          font-size: 1.3em;
          border-left: 3px solid #faad14;
          padding-left: 0.6em;
          background: linear-gradient(135deg, #fffbe6 0%, #fff7e6 100%);
        }

        :deep(h4) {
          font-size: 1.1em;
          border-left: 2px solid #722ed1;
          padding-left: 0.5em;
          background: linear-gradient(135deg, #f9f0ff 0%, #f0e6ff 100%);
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

    .attachments-list {
      flex: 1;
      margin-top: 8px;
    }
  }
}

// 底部按钮
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e4e7ed;

  .el-button {
    min-width: 100px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .article-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;

    .meta-left {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }

    .meta-right {
      align-items: flex-start;
    }
  }

  .content-details {
    .detail-row {
      flex-direction: column;

      .detail-label {
        margin-bottom: 4px;
      }
    }
  }
}
</style>
