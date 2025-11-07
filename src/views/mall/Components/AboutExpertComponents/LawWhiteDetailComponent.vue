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
    <div class="description">{{ detailData?.remark }}</div>
    <!-- 附件表格 -->
    <el-table :data="detailData?.latestFiles" style="width: 100%">
      <el-table-column prop="name" label="附件名称" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button type="primary" size="small" :href="scope.row.url" download> 下载 </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { getWhitePaperDetail } from '@/api/expertServicePlatform/legalServiceManage/whitePaperManage';

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const detailData = ref();

onMounted(() => {
  fetchDetail();
});

const fetchDetail = async () => {
  try {
    const response = await getWhitePaperDetail(props.id);
    detailData.value = response.data || {};
  } catch (error) {
    console.error('获取白皮书详情失败:', error);
  }
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
