<!--
  文件名: requests.vue
  功能: 我发布的采购需求
  说明: 展示、编辑、完成、关闭采购需求，分页展示，详情弹窗
  版本: 2.0
  作者: 刘景彪
  创建时间: 2025-10-27
  重构时间: 2025-10-29
-->
<template>
  <div class="address-page">
    <div class="menu-title">我发布的需求</div>
    <div class="pading20">
      <!-- 顶部统计提示 -->
      <div class="summary-alert">已发布{{ total }}条</div>

      <!-- 采购需求表格 -->
      <el-table :data="tableData" v-loading="loading" style="table-layout: fixed; width: 100%" :empty-text="'暂无采购需求'">
        <el-table-column type="index" label="序号" width="55" align="center" />
        <el-table-column prop="categoryName" label="采购类目" align="center" :show-overflow-tooltip="true" />
        <el-table-column label="采购区域" align="center" :show-overflow-tooltip="true">
          <template #default="{ row }">
            {{ [row.deliveryProvince, row.deliveryCity, row.deliveryDistrict].filter(Boolean).join(' - ') || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="demandDescription" label="采购说明" align="center" :show-overflow-tooltip="true"> </el-table-column>
        <el-table-column label="采购数量" align="center">
          <template #default="{ row }"> {{ row.quantity }} {{ row.unit || '' }} </template>
        </el-table-column>
        <el-table-column prop="deliveryDay" label="交付时间/天" align="center" />
        <el-table-column label="发布状态" align="center">
          <template #default="{ row }">
            <dict-text :options="demand_status" :value="row.demandStatus ?? ''" />
          </template>
        </el-table-column>
        <el-table-column prop="publishTime" label="发布时间" align="center" width="180">
          <template #default="scope">
            <span>{{ proxy.parseTime(scope.row.publishTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" min-width="240" align="center">
          <template #default="{ row }">
            <el-button
              v-if="row.hasQuote == '0' && row.demandStatus == '1'"
              v-hasPermi="['grain:HnPurchaseDemand:edit']"
              @click="onEdit(row)"
              v-throttle
              text
              style="color: #ffa113"
              >修改</el-button
            >
            <el-button
              v-if="row.hasQuote == '1' && row.demandStatus == '1'"
              v-hasPermi="['grain:HnPurchaseDemand:edit']"
              @click="onComplete(row)"
              v-throttle
              text
              style="color: #0b79ef"
              >完成</el-button
            >
            <el-button
              v-if="row.demandStatus == '1'"
              v-hasPermi="['grain:HnPurchaseDemand:edit']"
              @click="onDelete(row)"
              v-throttle
              text
              style="color: #ef4d0b"
              >关闭</el-button
            >
            <el-button v-hasPermi="['grain:HnPurchaseDemand:query']" type="primary" v-throttle link @click="onDetails(row)">查看</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex-center pagination">
        <pagination v-show="total > 0" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" :total="total" @pagination="getList" />
      </div>
    </div>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" width="50%" destroy-on-close :close-on-click-modal="false" class="request-detail-dialog" title="采购需求详情">
      <div v-loading="detailLoading" class="detail-body">
        <!-- 采购信息表单 -->
        <el-form ref="formRef" :model="form" label-width="90px" class="detail-form">
          <el-divider content-position="left"><div class="section-title">采购信息</div></el-divider>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="采购类型：" prop="categoryName">
                <el-input v-model="form.categoryName" placeholder="请输入" maxlength="50" show-word-limit disabled />
              </el-form-item>
              <el-form-item label="采购区域：" prop="receiverName">
                <RegionSelect style="width: 100%" v-model="form.regionPath" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="备注：" prop="receiverName">
                <el-input v-model="form.demandDescription" placeholder="请输入" maxlength="100" show-word-limit disabled />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>

        <!-- 供应商信息 -->
        <div class="section">
          <el-divider content-position="left"><div class="section-title">供应商信息</div></el-divider>
          <el-table :data="supplierList" size="small" :empty-text="'暂无供应商回复'" :default-sort="{ prop: 'replyTime', order: 'descending' }">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="supplierName" label="供应商名称" align="center" />
            <el-table-column prop="unitPrice" label="报价" align="center">
              <template #default="{ row }"> {{ row.unitPrice }} 元</template>
            </el-table-column>
            <el-table-column prop="quoteRemarks" label="备注说明" align="center" />
            <el-table-column fixed="right" label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button v-if="row.contactPhone" link type="primary" @click="onContact(row)">立即联系</el-button>
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

    <!-- 供应商信息弹窗 -->
    <el-dialog v-model="contactVisible" width="400px" title="供应商信息" :close-on-click-modal="false">
      <div v-if="contactSupplier">
        <div style="margin-bottom: 12px">供应商名称: {{ contactSupplier.supplierName }}</div>
        <div style="margin-bottom: 12px">联系人: {{ contactSupplier.contactPerson || '-' }}</div>
        <div style="margin-bottom: 12px">联系电话:{{ contactSupplier.contactPhone }}</div>
      </div>
    </el-dialog>

    <!-- 发布需求弹窗 -->
    <PublishDemandComponent ref="publishDemandRef" @submitSuccess="getDemandList"></PublishDemandComponent>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import PublishDemandComponent from '../../Components/PublishDemandComponent.vue';
import {
  hnPurchaseDemandList,
  hnPurchaseQuoteList,
  hnSupplierSupplyDelete,
  hnPurchaseDemandPut,
  HnPurchaseDemandVo
} from '@/api/mall/personalCenter/requests';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { demand_status } = toRefs<any>(proxy?.useDict('demand_status'));

const publishDemandRef = ref(null);

const loading = ref(false);
const tableData = ref<HnPurchaseDemandVo[]>([]);
const total = ref(0);
const queryParams = reactive({ pageNum: 1, pageSize: 10 });

const detailVisible = ref(false);
const detailLoading = ref(false);
const form = ref<HnPurchaseDemandVo>({});
const supplierList = ref([]);
const supplierQuery = reactive({ pageNum: 1, pageSize: 10 });
const supplierTotal = ref(0);
const contactVisible = ref(false);
const contactSupplier = ref<any>(null);

onMounted(() => {
  getList();
});

const getList = async () => {
  loading.value = true;
  try {
    const res: any = await hnPurchaseDemandList({ pageNum: queryParams.pageNum, pageSize: queryParams.pageSize });
    if (res?.code === 200) {
      // 统计供应商回复数
      tableData.value = (res.rows || []).map((item) => ({
        ...item,
        replyCount: item.replyCount || 0
      }));
      total.value = res.total || 0;
    }
  } finally {
    loading.value = false;
  }
};

const getDemandList = async () => {
  queryParams.pageNum = 1;
  await getList();
};

const onEdit = (row: HnPurchaseDemandVo) => {
  publishDemandRef.value.openDialog(row);
};

const onDetails = (row: HnPurchaseDemandVo) => {
  form.value = { ...row };
  form.value.regionPath = [row.deliveryProvinceCode, row.deliveryCityCode, row.deliveryDistrictCode];
  detailVisible.value = true;
  supplierQuery.pageNum = 1;
  getSupplierList();
};

const getSupplierList = async () => {
  detailLoading.value = true;
  try {
    const res: any = await hnPurchaseQuoteList({ demandId: form.value.id, pageNum: supplierQuery.pageNum, pageSize: supplierQuery.pageSize });
    if (res?.code === 200) {
      supplierList.value = res.rows || [];
      supplierTotal.value = res.total || 0;
    }
  } finally {
    detailLoading.value = false;
  }
};

const onContact = (row: any) => {
  contactSupplier.value = {
    supplierName: row.supplierName,
    contactPerson: row.contactPerson,
    contactPhone: row.contactPhone
  };
  contactVisible.value = true;
};

const onDelete = async (row: HnPurchaseDemandVo) => {
  await ElMessageBox.confirm('是否关闭该需求吗？', '提示', { type: 'warning' });
  // TODO: 调用关闭接口
  const arr = {
    ...row,
    demandStatus: '99' // 标记为关闭
  };
  const res: any = await hnPurchaseDemandPut(arr);
  if (res?.code === 200) {
    ElMessage.success('操作成功');
    getList();
  }
};

const onComplete = async (row: HnPurchaseDemandVo) => {
  await ElMessageBox.confirm('是否将该需求标记为完成吗？', '提示', { type: 'success' });
  // TODO: 调用完成接口
  const arr = {
    ...row,
    demandStatus: '4' // 标记为完成
  };
  const res: any = await hnPurchaseDemandPut(arr);
  if (res?.code === 200) {
    ElMessage.success('操作成功');
    getList();
  }
};
</script>

<style scoped>
/* 页面布局样式 */
.menu-title {
  display: flex;
  align-items: center;
  height: 60px;
  padding-left: 20px;
  font-size: 20px;
  font-weight: 500;
  color: #333333;
  background: #fff;
  position: relative;
  border-bottom: 2px solid #d8d8d8;
  border-radius: 8px 8px 0 0;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
}

.menu-title::before {
  content: '';
  display: inline-block;
  width: 24px;
  height: 24px;
  margin-right: 4px;
  background-image: url('@/assets/images/mall/my-posts-icon.png');
}

.pading20 {
  padding: 20px;
  background: #ffffff;
  border-radius: 0 0 8px 8px;
}

/* 顶部提示样式 */
.summary-alert {
  margin: 15px 0;
  height: 36px;
  line-height: 36px;
  background: rgba(255, 123, 0, 0.1);
  border-radius: 4px 4px 4px 4px;
  font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
  font-size: 14px;
  color: #ff7b00;
  text-align: center;
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
</style>
