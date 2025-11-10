<!--
  标题: WhitePaperDetailDialog.vue
  功能: 维权白皮书详情弹窗
  说明: 用于查看维权白皮书的详细信息（弹窗形式）
  当前版本: 1.0
-->
<template>
  <div class="whitepaper-detail-dialog" v-loading="loading">
    <div class="paper-title">
      <h2>{{ detailData.paperTitle || '维权白皮书' }}</h2>
    </div>

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
        <el-table-column label="附件名称" :show-overflow-tooltip="true" min-width="200">
          <template #default="scope">
            {{ scope.row.originalName || scope.row.fileName || scope.row.name || '--' }}
          </template>
        </el-table-column>
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
import { listByIds } from '@/api/system/oss';

const props = defineProps<{
  id?: string | number | null;
}>();

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const loading = ref(false);

const detailData = ref({
  id: undefined as number | string | undefined,
  paperTitle: '',
  ossVoList: [] as any[],
  latestFiles: [] as any[],
  historyVersionsList: [] as any[],
  updateTime: '',
  currentVersion: ''
});

const currentAttachments = ref<Array<{
  ossId: number | string;
  originalName: string;
  fileName: string;
  updateTime: string;
  version: string;
  url: string;
}>>([]);

const loadCurrentAttachments = async () => {
  const attachments = detailData.value.latestFiles && detailData.value.latestFiles.length > 0
    ? detailData.value.latestFiles
    : (detailData.value.ossVoList || []);
  
  if (!Array.isArray(attachments) || attachments.length === 0) {
    currentAttachments.value = [];
    return;
  }
  
  const ossIds = attachments.map((item: any) => item.ossId).filter(Boolean);
  
  if (ossIds.length === 0) {
    currentAttachments.value = attachments.map((item: any) => ({
      ossId: item.ossId,
      originalName: item.originalName || item.fileName || item.name || '',
      fileName: item.fileName || item.originalName || item.name || '',
      updateTime: item.updateTime || detailData.value.updateTime || '',
      version: item.version || item.versionNo || detailData.value.currentVersion || '',
      url: item.url || ''
    }));
    return;
  }
  
  try {
    const ossIdsStr = ossIds.join(',');
    const ossResponse: any = await listByIds(ossIdsStr);
    
    const ossMap = new Map();
    if (ossResponse && ossResponse.data && Array.isArray(ossResponse.data)) {
      ossResponse.data.forEach((oss: any) => {
        ossMap.set(String(oss.ossId), oss);
      });
    }
    
    currentAttachments.value = attachments.map((item: any) => {
      const ossInfo = ossMap.get(String(item.ossId)) || {};
      
      return {
        ossId: item.ossId,
        originalName: ossInfo.originalName || item.originalName || ossInfo.fileName || item.fileName || item.name || '',
        fileName: ossInfo.fileName || item.fileName || ossInfo.originalName || item.originalName || item.name || '',
        updateTime: item.updateTime || detailData.value.updateTime || '',
        version: item.version || item.versionNo || detailData.value.currentVersion || '',
        url: ossInfo.url || item.url || ''
      };
    });
  } catch (error) {
    currentAttachments.value = attachments.map((item: any) => ({
      ossId: item.ossId,
      originalName: item.originalName || item.fileName || item.name || '',
      fileName: item.fileName || item.originalName || item.name || '',
      updateTime: item.updateTime || detailData.value.updateTime || '',
      version: item.version || item.versionNo || detailData.value.currentVersion || '',
      url: item.url || ''
    }));
  }
};

const historyVersions = computed(() => {
  if (!detailData.value.historyVersionsList || !Array.isArray(detailData.value.historyVersionsList)) {
    return [];
  }
  
  return detailData.value.historyVersionsList.map((item: any) => {
    const version = item.versionNo 
      || item.version 
      || item.versionNum
      || item.currentVersion
      || (item.ossVoList && item.ossVoList[0] && item.ossVoList[0].version)
      || '';
    
    const attachment = item.ossVoList && item.ossVoList[0] ? item.ossVoList[0] : item;
    
    return {
      ...item,
      updateTime: item.updateTime || item.createTime || '',
      version: version,
      remark: item.remark || '',
      ossId: item.ossId || attachment.ossId,
      url: item.url || attachment.url || ''
    };
  });
});

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
      
      const historyVersionsList = data.historyVersionsList === null 
        ? [] 
        : (Array.isArray(data.historyVersionsList) ? data.historyVersionsList : []);
      
      detailData.value = {
        id: data.id,
        paperTitle: data.paperTitle || '',
        ossVoList: data.ossVoList || [],
        latestFiles: data.latestFiles || [],
        historyVersionsList: historyVersionsList,
        updateTime: data.updateTime || data.createTime || '',
        currentVersion: data.currentVersion || ''
      };
      
      await loadCurrentAttachments();
    } else {
      ElMessage.error(response?.msg || '获取白皮书详情失败');
    }
  } catch (error: any) {
    ElMessage.error(error?.msg || '获取白皮书详情失败，请稍后重试');
  } finally {
    loading.value = false;
  }
};

const handleDownload = (file: any) => {
  if (file.ossId) {
    (proxy as any)?.$download?.oss(file.ossId);
  } else if (file.url) {
    window.open(file.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

const handleDownloadHistory = (version: any) => {
  if (version.ossId) {
    (proxy as any)?.$download?.oss(version.ossId);
  } else if (version.url) {
    window.open(version.url, '_blank');
  } else {
    ElMessage.warning('附件链接不存在');
  }
};

onMounted(() => {
  fetchWhitePaperDetail();
});
</script>

<style scoped lang="scss">
.whitepaper-detail-dialog {
  padding: 24px;
  min-height: 400px;
}

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

:deep(.el-button--link) {
  padding: 0;
  font-size: 14px;
}
</style>
