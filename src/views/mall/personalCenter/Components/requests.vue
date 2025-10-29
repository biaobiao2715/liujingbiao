<!--
        标题: addressManagement.vue
        功能: 我发布的需求
        说明: 新增/修改/删除/设为默认地址，分页展示
        当前版本: 2.0
        开发信息: Created by 刘景彪 2025-10-27, Refactor 2025-10-29
    -->
<template>
  <div class="address-page">
    <div class="title">我发布的需求</div>
    <el-divider />

    <!-- 已保存地址：替换原先的 div.table-title 为告警提示 -->
    <el-alert class="summary-alert" :center="true" type="warning" :closable="false" :title="`已发布${total}条`" />
    <!-- 表格：加边框与紧凑尺寸 -->
    <el-table :data="tableData" v-loading="loading" style="width: 100%" border size="small" header-cell-class-name="table-header">
      <el-table-column type="index" label="序号" width="55" align="center" />
      <el-table-column prop="receiverName" label="我的提问" align="center" />
      <el-table-column prop="receiverPhone" label="发布时间" align="center" />
      <el-table-column label="操作" width="160" align="center">
        <template #default="{ row }">
          <div class="ops">
            <el-button link type="danger" @click="onDelete(row)">关闭</el-button>
            <el-button link type="primary" @click="onEdit(row)">查看</el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="flex-center pagination">
      <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
    </div>

    <!-- 新增：详情弹窗，内容为采购信息 + 供应商信息 -->
    <el-dialog v-model="detailVisible" width="80%" destroy-on-close :close-on-click-modal="false" class="request-detail-dialog" title="详情">
      <div v-loading="detailLoading" class="detail-body">
        <!-- 采购信息 -->
        <div class="section">
          <el-divider content-position="left"><div class="section-title">采购信息</div></el-divider>
          <el-descriptions :column="3" border>
            <el-descriptions-item label="采购类型">
              {{ detailData?.type || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="采购区域" :span="2">
              {{ detailData?.region || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="采购说明" :span="3">
              <div class="desc-text">{{ detailData?.desc || '-' }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 供应商信息 -->
        <div class="section">
          <el-divider content-position="left"><div class="section-title">供应商信息</div></el-divider>
          <el-table :data="supplierList" border size="small" header-cell-class-name="table-header">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="supplierName" label="供应商名称" align="center" />
            <el-table-column prop="content" label="发布报价" />
            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button link type="primary" @click="onContact(row)">立即联系</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="flex-center pagination">
            <pagination
              v-show="supplierTotal > 0"
              v-model:page="supplierQuery.pageNum"
              v-model:limit="supplierQuery.pageSize"
              :total="supplierTotal"
              @pagination="getSupplierList"
            />
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  Address,
  userAddressList
  // ...existing code...
} from '@/api/mall/personalCenter/addressManagement';

// 替换：详情相关类型与状态
interface RequestDetail {
  id: number | string;
  type: string; // 采购类型
  region: string; // 采购区域
  desc: string; // 采购说明
}
interface SupplierQuote {
  id: number | string;
  supplierName: string;
  content: string; // 报价内容
  contactPhone?: string;
}

const loading = ref(false);
const tableData = ref<Address[]>([]);
const total = ref(0);
const queryParams = reactive({ pageNum: 1, pageSize: 10 });

const detailVisible = ref(false);
const detailLoading = ref(false);
const detailData = ref<RequestDetail | null>(null);
const supplierList = ref<SupplierQuote[]>([]);
const supplierTotal = ref(0);
const supplierQuery = reactive({ pageNum: 1, pageSize: 10 });

// 生命周期
onMounted(() => {
  getList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const res: any = await userAddressList({ pageNum: queryParams.pageNum, pageSize: queryParams.pageSize });
    if (res?.code === 200) {
      tableData.value = res.rows || [];
      total.value = res.total || 0;
      const def = tableData.value.find((x) => x.isDefault === '1');
    }
  } finally {
    loading.value = false;
  }
};

// 替换：查看 => 打开详情弹窗并加载供应商报价
const onEdit = (row: any) => {
  detailData.value = {
    id: row.id,
    // 以下字段按你后端实际字段替换
    type: row.typeName || row.receiverName || '-',
    region: row.regionText || [row.province, row.city, row.region].filter(Boolean).join('-') || '-',
    desc: row.remark || row.detailAddress || row.content || '-'
  };
  detailVisible.value = true;
  supplierQuery.pageNum = 1;
  getSupplierList();
};

// 新增：获取供应商报价列表（按项目实际替换接口）
const getSupplierList = async () => {
  detailLoading.value = true;
  try {
    // TODO: 替换为真实接口
    // const res:any = await demandSupplierQuoteList({
    //   demandId: detailData.value?.id,
    //   pageNum: supplierQuery.pageNum,
    //   pageSize: supplierQuery.pageSize
    // });
    // if (res?.code === 200) {
    //   supplierList.value = res.rows || [];
    //   supplierTotal.value = res.total || 0;
    // }
    supplierList.value = []; // 占位
    supplierTotal.value = 0;
  } finally {
    detailLoading.value = false;
  }
};

// 新增：联系供应商（占位逻辑）
const onContact = (row: SupplierQuote) => {
  // 可跳转聊天、拨号或打开详情
  // 例如：window.open(`/im/chat?supplierId=${row.id}`)
  ElMessage.info('联系功能开发中');
};

const onDelete = async (row: Address) => {
  await ElMessageBox.confirm('确定关闭该需求吗？', '提示', { type: 'warning' });
  // const res: any = await questionClose(row.id);
  // if (res?.code === 200) {
  //   ElMessage.success('关闭成功');
  //   // 若删除的是默认，清空默认标记
  //   getList();
  // }
};
</script>

<style scoped>
.address-page {
  padding: 20px;
}
.title {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 6px;
}
/* 表单容器增加描边与圆角，间距更紧凑 */
.address-form {
  background: #fff;
  padding: 12px 16px 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
}
.address-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

/* 顶部提示样式 */
.summary-alert {
  margin: 12px 0;
  border: 1px solid var(--el-color-warning-light-5);
  border-radius: 4px;
}

/* 表格标题背景与单元格内边距优化 */
:deep(.table-header) {
  background: #fafafa !important;
  color: var(--el-text-color-primary);
  font-weight: 600;
}
:deep(.el-table--small .cell) {
  padding: 8px 12px;
}

/* 操作按钮间距 */
.ops :deep(.el-button + .el-button) {
  margin-left: 12px;
}

.flex-center.pagination {
  margin-top: 16px;
  justify-content: end;
  display: flex;
}

/* 新增：详情弹窗样式 */
.request-detail-dialog .section {
  margin-bottom: 16px;
}
.section-title {
  font-weight: 600;
  font-size: 16px;
}
.desc-text {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
