<template>
  <div class="demand-table">
    <div class="search-form flex-between">
      <el-form :model="queryParams" inline :label-width="70" label-position="left">
        <el-form-item label="区域">
          <RegionSelect v-model="region" @regionChange="handleRegionChange" />
        </el-form-item>
        <el-form-item label="商品分类">
          <GoodsCategorySelect v-model="category" @categoryChange="handleCategoryChange" />
        </el-form-item>
        <el-form-item>
          <el-button v-throttle @click="resetQuery">重置</el-button>
          <el-button v-throttle type="primary" @click="getDemandList">查询</el-button>
        </el-form-item>
      </el-form>
      <el-button class="mb-12" v-throttle type="primary" :icon="Plus" @click="handleOpenDialog">发布采购需求</el-button>
    </div>

    <el-table :data="tableList" v-loading="loading" stripe :header-cell-style="{ backgroundColor: '#108c58 !important', color: '#fff' }">
      <el-table-column prop="categoryName" label="发布类型" width="200" show-overflow-tooltip></el-table-column>
      <el-table-column prop="region" label="配送范围" min-width="300" show-overflow-tooltip>
        <template #default="scope">
          <el-tooltip class="item" :content="scope.row.region" placement="bottom">
            <template #content>
              <div class="address-list">
                <div v-for="value in scope.row.deliveryAddresses?.split(',')" :key="value">
                  {{ value }}
                </div>
              </div>
            </template>
            <span>{{ scope.row.deliveryAddresses?.split(',')[0] + (scope.row.deliveryAddresses?.split(',').length > 1 ? '等......' : '') }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="supplyDescription" label="备注" width="300" show-overflow-tooltip></el-table-column>
      <el-table-column prop="stock" label="库存"></el-table-column>
      <el-table-column prop="createTime" label="发布时间" width="200"></el-table-column>
      <el-table-column label="操作" width="150">
        <template #default="scope">
          <el-button type="text" @click="contact(scope.row)">
            <div class="flex-center gap-4">
              <img src="@/assets/mall/table-phone-icon.png" width="14" />
              <div>立即联系</div>
            </div>
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination
      v-show="queryParams.total > 0"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      :total="queryParams.total"
      @pagination="getDemandList"
    />

    <!-- 展示供应商联系信息 -->
    <el-dialog title="供应商联系信息" v-model="contactVisible" width="400px">
      <el-form :model="contactForm" label-width="100">
        <el-form-item label="供应商名称">
          <div>{{ contactForm.companyName }}</div>
        </el-form-item>
        <el-form-item label="联系人">
          <div>{{ contactForm.loginUserName }}</div>
        </el-form-item>
        <el-form-item label="联系电话">
          <div>{{ contactForm.phoneNumber }}</div>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 采购需求弹窗 -->
    <PublishDemandComponent ref="publishDemandRef" @submitSuccess="getDemandList"></PublishDemandComponent>
  </div>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import RegionSelect from '@/components/RegionSelect/index.vue';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import { supplyHallList, querySupplyInfoById } from '@/api/mall/demand';
import PublishDemandComponent from '../PublishDemandComponent.vue';

const props = withDefaults(
  defineProps<{
    id?: string | number;
    type?: string;
  }>(),
  {
    id: 0,
    type: ''
  }
);

defineEmits(['contact']);

const tableList = ref([]);
const loading = ref(false);
const category = ref([]);
const region = ref([]);
const contactVisible = ref(false);
const publishDemandRef = ref();

const contactForm = ref({
  companyName: '',
  loginUserName: '',
  phoneNumber: ''
});

const queryParams = reactive({
  total: 0,
  pageNum: 1,
  pageSize: 10,
  provinceCode: '',
  cityCode: '',
  districtCode: '',
  supplyCategoryId: ''
});

onMounted(() => {
  getDemandList();
  if (props.id && props.type === 'supplyDemand') {
    contactDetail(props.id);
  }
});

// 监听 props 变化，若满足条件则重新获取联系方式
watch(
  () => [props.id, props.type],
  ([newId, newType]) => {
    if (newId && newType === 'supplyDemand') {
      contactDetail(newId);
    }
  }
);

// 重置筛选条件
const resetQuery = () => {
  category.value = [];
  region.value = [];
  queryParams.pageNum = 1;
  queryParams.pageSize = 10;
  queryParams.supplyCategoryId = '';
  queryParams.provinceCode = '';
  queryParams.cityCode = '';
  queryParams.districtCode = '';
  getDemandList();
};

// 区域选择
const handleRegionChange = (val: any) => {
  const regionPath = val?.regionPath;
  if (!val || (Array.isArray(regionPath) ? regionPath.length === 0 : !regionPath)) {
    queryParams.provinceCode = '';
    queryParams.cityCode = '';
    queryParams.districtCode = '';
    return;
  }
  queryParams.provinceCode = val.provinceCode || '';
  queryParams.cityCode = val.cityCode || '';
  queryParams.districtCode = val.regionCode || '';
};

// 分类选择
const handleCategoryChange = (value: string[]) => {
  queryParams.supplyCategoryId = Array.isArray(value) ? value[value?.length - 1] : '';
};

// 获取采购需求列表
const getDemandList = async () => {
  loading.value = true;
  const res = await supplyHallList({ ...queryParams });
  if (res.code === 200) {
    tableList.value = res.rows || [];
    queryParams.total = res.total || 0;
    loading.value = false;
  }
};

const contact = (row: any) => {
  contactForm.value = row;
  contactVisible.value = true;
};

// 打开新增需求弹窗
const handleOpenDialog = () => {
  publishDemandRef.value?.openDialog();
};

const contactDetail = (value: any) => {
  querySupplyInfoById({ id: value }).then((res) => {
    if (res.code === 200) {
      contactForm.value = res.data || {};
      contactVisible.value = true;
    }
  });
};
</script>

<style scoped lang="scss">
.demand-table {
  margin-top: 24px;
}
</style>
