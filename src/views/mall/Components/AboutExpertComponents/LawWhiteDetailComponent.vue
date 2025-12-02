<!--
  标题: LawWhiteDetailComponent.vue
  功能: 普法白皮书详情组件
  说明: 显示普法白皮书的详细内容
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-07
-->

<template>
  <div class="law-white-detail">
    <!-- 标题 -->
    <div class="title">{{ detailData?.paperTitle }}</div>
    <!-- 描述 -->
    <!-- 最新附件表格 -->
    <div class="file-title">最新附件</div>
    <el-table :data="latestFiles">
      <el-table-column prop="fileSuffix" label="附件类型" />
      <el-table-column prop="fileName" label="附件名称" />
      <el-table-column prop="versionNo" label="版本号" />
      <el-table-column prop="updateTime" label="更新时间" width="200" />
      <el-table-column prop="fileSize" label="文件大小" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleDownloadHistory(scope.row)"> 下载 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { getWhitePaperDetail } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';
import { formatFileSize } from '@/utils/fileUtils';
import { addWhitePaperViewRecords, addWhitePaperDownloadRecords } from '@/api/mall/expert';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const detailData = ref();

const historyFiles = ref([]);

const latestFiles = ref([]);

onMounted(async () => {
  await fetchDetail();
  await addViewRecords();
});

const fetchDetail = async () => {
  try {
    const response: any = await getWhitePaperDetail(props.id);
    detailData.value = response.data || {};

    // 处理最新附件
    response.data?.latestFiles?.forEach((item) => {
      item.sysOssLists.forEach((attachment) => {
        latestFiles.value.push({
          fileName: attachment.originalName,
          url: attachment.url,
          fileSuffix: attachment.fileSuffix,
          versionNo: item.versionNo,
          updateTime: item.updateTime,
          fileSize: formatFileSize(JSON.parse(attachment.ext1)?.fileSize || 0)
        });
      });
    });

    // 处理历史版本附件
    response.data?.historyVersionsList?.forEach((item) => {
      item.sysOssLists.forEach((attachment) => {
        historyFiles.value.push({
          fileName: attachment.originalName,
          url: attachment.url,
          fileSuffix: attachment.fileSuffix,
          fileSize: formatFileSize(JSON.parse(attachment.ext1)?.fileSize || 0)
        });
      });
    });
  } catch (error) {
    console.error('获取白皮书详情失败:', error);
  }
};

// 增加浏览量
const addViewRecords = async () => {
  try {
    await addWhitePaperViewRecords(props.id);
  } catch (error) {
    console.error('增加浏览量失败:', error);
  }
};

const handleDownloadHistory =async (item: any) => {
  console.log(item);
  
  const response = await fetch(item.url);
  const blob = await response.blob();

  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = item.fileName || 'file.txt';
  a.click();

  addWhitePaperDownloadRecords({ id: props.id, ossVoList: detailData.value.latestFiles }).then((res) => {
    console.log(res.data);
    detailData.value.downloadCount++;
  });
};
</script>

<style scoped>
.law-white-detail {
  padding: 20px;
  background-color: #f9f9f9; /* 添加背景色 */
  border-radius: 8px; /* 添加圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
}

.title {
  font-size: 20px; /* 增大标题字体 */
  font-weight: bold; /* 加粗标题 */
  margin-bottom: 10px; /* 增加标题与描述之间的间距 */
  color: #333; /* 设置标题颜色 */
  text-align: center; /* 居中标题 */
}

.file-title {
  font-size: 16px; /* 增大附件标题字体 */
  font-weight: bold; /* 加粗附件标题 */
  margin: 24px 0 12px 0;
}

.description {
  font-size: 14px; /* 调整描述字体大小 */
  color: #666; /* 设置描述文字颜色 */
  margin-bottom: 20px; /* 增加描述与表格之间的间距 */
}

.el-table {
  background-color: #fff; /* 设置表格背景色 */
  border-radius: 8px; /* 表格圆角 */
  overflow: hidden; /* 防止内容溢出 */
}

.el-button {
  font-size: 12px; /* 调整按钮字体大小 */
}
</style>
