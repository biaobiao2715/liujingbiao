<!--
  标题: WhitePaperDetailDialog.vue
  功能: 维权白皮书详情弹窗
  说明: 用于查看维权白皮书的详细信息（弹窗形式）
  当前版本: 1.0
-->
<template>
  <div class="whitepaper-detail-dialog" v-loading="loading">
    <!-- 标题 -->
    <div class="paper-title">
      <h2>{{ detailData.paperTitle || '维权白皮书' }}</h2>
    </div>

    <!-- 附件部分 -->
    <div class="attachment-section">
      <div class="section-header">
        <el-icon><Paperclip /></el-icon>
        <span class="section-title">附件</span>
      </div>
      <el-table :data="currentAttachments" border style="width: 100%">
        <el-table-column label="附件类型" width="120" align="center">
          <template #default>
            <el-icon class="file-icon"><Document /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="180" align="center" />
        <el-table-column label="附件名称" prop="originalName" :show-overflow-tooltip="true" min-width="200" />
        <el-table-column label="版本号" prop="version" width="120" align="center" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleDownload(scope.row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 历史版本部分 -->
    <div class="history-section">
      <div class="section-header">
        <el-icon><FolderOpened /></el-icon>
        <span class="section-title">历史版本</span>
      </div>
      <el-table :data="historyVersions" border style="width: 100%">
        <el-table-column label="修改时间" prop="updateTime" width="180" align="center" />
        <el-table-column label="历史版本" prop="version" width="120" align="center" />
        <el-table-column label="备注" prop="remark" :show-overflow-tooltip="true" min-width="200" />
        <el-table-column label="操作" width="120" align="center">
          <template #default="scope">
            <el-button type="primary" link @click="handleDownloadHistory(scope.row)">
              下载
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, getCurrentInstance } from 'vue';
import type { ComponentInternalInstance } from 'vue';
import { ElMessage } from 'element-plus';
import { Paperclip, Document, FolderOpened } from '@element-plus/icons-vue';
import { getWhitePaperDetail } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const props = defineProps<{
  id?: string | number | null;
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 加载状态
const loading = ref(false);

// 详情数据
const detailData = ref({
  id: undefined as number | string | undefined,
  paperTitle: '',
  ossVoList: [] as any[],
  historyVersionsList: [] as any[],
  updateTime: '',
  currentVersion: ''
});

// 当前附件列表（从ossVoList获取）
const currentAttachments = computed(() => {
  if (!detailData.value.ossVoList || !Array.isArray(detailData.value.ossVoList)) {
    return [];
  }
  return detailData.value.ossVoList.map((item: any) => ({
    ossId: item.ossId,
    originalName: item.originalName || item.fileName || '',
    updateTime: item.updateTime || detailData.value.updateTime || '',
    version: item.version || detailData.value.currentVersion || '',
    url: item.url || ''
  }));
});

// 历史版本列表
const historyVersions = computed(() => {
  if (!detailData.value.historyVersionsList || !Array.isArray(detailData.value.historyVersionsList)) {
    return [];
  }
  return detailData.value.historyVersionsList.map((item: any) => ({
    ...item,
    updateTime: item.updateTime || item.createTime || '',
    version: item.versionNo || item.version || '', // 使用 versionNo（API文档中的字段名）
    remark: item.remark || '',
    ossId: item.ossId,
    url: item.url || ''
  }));
});

/** 获取白皮书详情 */
const fetchWhitePaperDetail = async () => {
  if (!props.id) {
    ElMessage.error('缺少白皮书ID');
    return;
  }
  
  loading.value = true;
  try {
    const response: any = await getWhitePaperDetail(props.id);
    
    if (response && response.code === 200 && response.data) {
      const data = response.data;
      
      detailData.value = {
        id: data.id,
        paperTitle: data.paperTitle || '',
        ossVoList: data.ossVoList || [],
        historyVersionsList: data.historyVersionsList || [],
        updateTime: data.updateTime || data.createTime || '',
        currentVersion: data.currentVersion || ''
      };
    } else {
      ElMessage.error(response?.msg || '获取白皮书详情失败');
    }
  } catch (error: any) {
    ElMessage.error(error?.msg || '获取白皮书详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

/** 下载当前附件 */
const handleDownload = (file: any) => {
  if (file.ossId) {
    // 使用OSS下载接口
    (proxy as any)?.$download?.oss(file.ossId);
  } else if (file.url) {
    // 备用方案：直接打开URL
    window.open(file.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

/** 下载历史版本附件 */
const handleDownloadHistory = (version: any) => {
  if (version.ossId) {
    // 使用OSS下载接口
    (proxy as any)?.$download?.oss(version.ossId);
  } else if (version.url) {
    // 备用方案：直接打开URL
    window.open(version.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

// 页面加载时获取详情数据
onMounted(() => {
  fetchWhitePaperDetail();
});
</script>

<style scoped lang="scss">
.whitepaper-detail-dialog {
  padding: 24px;
  min-height: 400px;
}

// 标题部分
.paper-title {
  text-align: center;
  margin-bottom: 32px;
  
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
}

// 附件部分
.attachment-section {
  margin-bottom: 32px;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .el-icon {
      font-size: 18px;
      color: #606266;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
  
  .file-icon {
    font-size: 24px;
    color: #409eff;
  }
}

// 历史版本部分
.history-section {
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    .el-icon {
      font-size: 18px;
      color: #606266;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }
}

// 表格样式
:deep(.el-table) {
  .el-table__header {
    th {
      background-color: #fafafa;
      color: #606266;
      font-weight: 600;
    }
  }
  
  .el-table__body {
    tr {
      &:hover {
        background-color: #f5f7fa;
      }
    }
  }
}

// 按钮样式
:deep(.el-button--link) {
  padding: 0;
  font-size: 14px;
}
</style>
