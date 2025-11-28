<!-- 专项报告 -->
<template>
  <el-dialog v-model="dialogVisible" title="专项价格分析报告" width="90%" destroy-on-close :close-on-click-modal="false">
    <div class="report-header">
      <div class="report-info">
        <span class="info-item">品种: {{ reportInfo.variety }}</span>
        <span class="info-item">产地: {{ reportInfo.origin }}</span>
      </div>
    </div>
    <el-table :data="reportTableData" border v-loading="reportLoading">
      <template #empty>
        <el-empty description="暂无数据" />
      </template>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column prop="goodsName" label="商品名称" align="center" min-width="200" :show-overflow-tooltip="true" />
      <el-table-column label="商品图片" align="center" width="120">
        <template #default="{ row }">
          <el-image
            v-if="row.goodsImage"
            :src="row.goodsImage"
            :preview-src-list="[row.goodsImage]"
            style="width: 60px; height: 60px"
            fit="cover"
          />
          <span v-else class="text-gray">暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="goodsPrice" label="商品价格" align="center" width="120" />
      <el-table-column prop="supplierName" label="供应商名称" align="center" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="credentialLevelText" label="供应商资质等级" align="center" width="150" />
      <el-table-column prop="creditLevelText" label="供应商信用等级" align="center" width="150" />
    </el-table>
    <!-- 分页 -->
    <div class="flex-center pagination">
      <pagination
        v-show="reportTotal > 0"
        v-model:page="reportQueryParams.pageNum"
        v-model:limit="reportQueryParams.pageSize"
        :total="reportTotal"
        @pagination="handleReportPagination"
      />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { priceSpecialReportList } from '@/api/mall/marketComponent';
import Pagination from '@/components/Pagination/index.vue';

interface Props {
  visible: boolean;
  reportInfo: {
    variety: string;
    origin: string;
  };
  goodsCategoryId: string;
  regionCode: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  reportInfo: () => ({
    variety: '--',
    origin: '--'
  }),
  goodsCategoryId: '',
  regionCode: ''
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const dialogVisible = ref(false);
const reportTableData = ref<any[]>([]);
const reportLoading = ref(false);
const reportTotal = ref(0);
const reportQueryParams = reactive({
  goodsCategoryId: '',
  regionCode: '',
  pageNum: 1,
  pageSize: 10
});

const credentialLevelMap: Record<string, string> = {
  '0': '一级认证',
  '1': '二级认证',
  '2': '三级认证'
};

const creditLevelMap: Record<string, string> = {
  '0': '优秀',
  '1': '良好',
  '2': '一般',
  '3': '一般以下',
  '99': '较差'
};

const getCredentialLevelText = (level: any) => {
  if (level === undefined || level === null || level === '') return '--';
  return credentialLevelMap[String(level)] || '--';
};

const getCreditLevelText = (level: any) => {
  if (level === undefined || level === null || level === '') return '--';
  return creditLevelMap[String(level)] || '--';
};

// 监听 visible 变化
watch(
  () => props.visible,
  (newVal) => {
    dialogVisible.value = newVal;
    if (newVal) {
      // 打开弹窗时重置查询参数并加载数据
      reportQueryParams.goodsCategoryId = props.goodsCategoryId;
      reportQueryParams.regionCode = props.regionCode;
      reportQueryParams.pageNum = 1;
      reportQueryParams.pageSize = 10;
      fetchReportList();
    }
  },
  { immediate: true }
);

// 监听 dialogVisible 变化，同步到父组件
watch(dialogVisible, (newVal) => {
  emit('update:visible', newVal);
});

// 获取价格专项报告列表
const fetchReportList = async () => {
  reportLoading.value = true;
  try {
    const params: any = {
      goodsCategoryId: reportQueryParams.goodsCategoryId,
      regionCode: reportQueryParams.regionCode,
      pageNum: reportQueryParams.pageNum,
      pageSize: reportQueryParams.pageSize
    };

    const response = await priceSpecialReportList(params);
    if (response && response.code === 200) {
      const data = response.rows || response.data || [];
      // 映射接口返回的数据到表格需要的格式
      reportTableData.value = (Array.isArray(data) ? data : []).map((item: any) => {
        const credentialLevelValue = item.credentialLevel !== undefined && item.credentialLevel !== null ? String(item.credentialLevel) : '';
        const creditLevelValue = item.creditLevel !== undefined && item.creditLevel !== null ? String(item.creditLevel) : '';
        return {
          id: item.id,
          goodsName: item.goodsName || '--',
          goodsImage: item.goodsImageUrl || '',
          goodsPrice: item.goodsPrice ? `${item.goodsPrice}元/kg` : '--',
          supplierName: item.enterpriseName || '--',
          credentialLevel: credentialLevelValue,
          credentialLevelText: getCredentialLevelText(credentialLevelValue),
          creditLevel: creditLevelValue,
          creditLevelText: getCreditLevelText(creditLevelValue)
        };
      });
      reportTotal.value = response.total || 0;
    } else {
      ElMessage.error(response?.msg || '获取价格专项报告数据失败');
      reportTableData.value = [];
      reportTotal.value = 0;
    }
  } catch (error) {
    console.error('获取价格专项报告数据失败:', error);
    ElMessage.error('获取价格专项报告数据失败，请稍后重试');
    reportTableData.value = [];
    reportTotal.value = 0;
  } finally {
    reportLoading.value = false;
  }
};

// 报告分页处理
const handleReportPagination = (pagination: { page: number; limit: number }) => {
  reportQueryParams.pageNum = pagination.page;
  reportQueryParams.pageSize = pagination.limit;
  fetchReportList();
};
</script>

<style scoped lang="scss">
.report-header {
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;

  .report-info {
    display: flex;
    gap: 24px;
    font-size: 14px;
    color: #606266;

    .info-item {
      font-weight: 500;
    }
  }
}

:deep(.el-dialog__header) {
  text-align: center;
  padding: 20px 20px 10px;
  border-bottom: 1px solid #ebeef5;

  .el-dialog__title {
    font-size: 18px;
    font-weight: bold;
    color: #303133;
  }
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.text-gray {
  color: #909399;
}
</style>

