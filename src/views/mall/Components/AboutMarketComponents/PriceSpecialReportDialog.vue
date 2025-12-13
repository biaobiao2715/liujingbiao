 <!--
  标题: PriceSpecialReportDialog
  功能: 专项报告
  说明: 专项报告弹窗组件
  当前版本: 1.0
  开发信息: Created by 吴威振 2025-12-13
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    title="专项价格分析报告"
    width="70%"
    destroy-on-close
    :close-on-click-modal="false"
    class="special-report-dialog"
  >
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
      <el-table-column prop="goodsName" label="商品名称" align="center" min-width="200" :show-overflow-tooltip="true">
        <template #default="{ row }">
          <span class="name-text">{{ row.goodsName }}</span>
        </template>
      </el-table-column>
      <el-table-column label="商品图片" align="center" width="120">
        <template #default="{ row }">
          <el-image v-if="row.goodsImage" :src="row.goodsImage" :preview-src-list="[row.goodsImage]" style="width: 60px; height: 60px" fit="cover" />
          <span v-else class="text-gray">暂无图片</span>
        </template>
      </el-table-column>
      <el-table-column prop="goodsPrice" label="商品价格" align="center" width="120">
        <template #default="{ row }">
          <span class="price-text">{{ row.goodsPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="supplierName" label="供应商名称" align="center" min-width="180" :show-overflow-tooltip="true" />
      <el-table-column prop="credentialLevelText" label="供应商资质等级" align="center" width="150">
        <template #default="{ row }">
          <span class="credential-tag" :class="getCredentialLevelClass(row.credentialLevel)">
            {{ row.credentialLevelText }}
          </span>
        </template>
      </el-table-column>
      <el-table-column prop="creditLevelText" label="供应商信用等级" align="center" width="150">
        <template #default="{ row }">
          <span class="credit-text" :class="getCreditLevelClass(row.creditLevel)">
            {{ row.creditLevelText }}
          </span>
        </template>
      </el-table-column>
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
      reportTableData.value = [];
      reportTotal.value = 0;
    }
  } catch (error) {
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

const getCredentialLevelClass = (level: string) => {
  if (level === '0') return 'level-1';
  if (level === '1') return 'level-2';
  if (level === '2') return 'level-3';
  return '';
};

const getCreditLevelClass = (level: string) => {
  if (level === '0') return 'credit-best';
  if (level === '1') return 'credit-good';
  if (level === '2') return 'credit-normal';
  if (level === '3') return 'credit-below';
  if (level === '99') return 'credit-poor';
  return '';
};
</script>

<style scoped lang="scss">
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.text-gray {
  color: #909399;
}

.special-report-dialog {
  :deep(.el-dialog__header) {
    padding: 10px 16px 8px 16px !important;
    text-align: center;
    border-bottom: 1px solid #f2f3f5;
    margin-bottom: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0 24px 24px;
  }
}

.report-header {
  margin-bottom: 0;
  padding: 0px 20px 20px 0px;
  border-bottom: 1px solid #f2f3f5;

  .report-info {
    display: flex;
    justify-content: flex-start;
    font-size: 16px;
    font-weight: 600;
    color: #108c58;

    .info-item {
      position: relative;
      margin-right: 40px;
    }
  }
}

:deep(.el-table) {
  margin-top: 12px;

  .el-table__header {
    th {
      background: #f7f8fa;
      color: #1d2129;
      font-weight: 600;
      border-color: #f0f0f0;
      height: 52px;
    }
  }

  .el-table__body {
    tr {
      height: 64px;
      &:nth-child(even) {
        background: #fbfcff;
      }
      td {
        border-color: #f0f0f0;
      }
    }
  }
}

.price-text {
  color: #108c58;
  font-weight: 600;
}

.name-text {
  color: #108c58;
}

.credential-tag {
  display: inline-flex;
  width: 72px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 22px;
  font-size: 12px;
}

.credential-tag.level-1 {
  color: #009022;
  background: rgba(0, 144, 34, 0.1);
}

.credential-tag.level-2 {
  color: #008cff;
  background: rgba(0, 140, 255, 0.1);
}

.credential-tag.level-3 {
  color: #ff7b00;
  background: rgba(255, 123, 0, 0.1);
}

.credit-text.credit-best {
  color: #009022;
}

.credit-text.credit-good {
  color: #008cff;
}

.credit-text.credit-normal {
  color: #ff7b00;
}

.credit-text.credit-below {
  color: #ff7b00;
}

.credit-text.credit-poor {
  color: #ff4d4f;
}
</style>
