<template>
  <div class="demand-component">
    <div class="content">
      <!-- banner -->
      <img src="@/assets/mall/demand-banner.png" width="100%" />
      <!-- 筛选条件 -->
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
        <el-button class="mb-12" v-throttle type="primary" :icon="Plus" @click="handleOpenDialog()">发布采购需求</el-button>
      </div>

      <!-- 数据表格 -->
      <el-table :data="tableList" v-loading="loading" stripe :header-cell-style="{ backgroundColor: '#108c58 !important', color: '#fff' }">
        <el-table-column prop="categoryName" label="发布类型" width="200" show-overflow-tooltip></el-table-column>
        <el-table-column prop="region" label="配送范围" min-width="300" show-overflow-tooltip>
          <template #default="scope">
            <el-tooltip class="item" :content="scope.row.region" placement="bottom">
              <!-- 自定义提示内容 -->
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
        <!-- <el-table-column prop="views" label="询问次数" width="100"></el-table-column> -->
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

      <!-- 两个banner -->
      <div class="banners flex-center gap-24">
        <img src="@/assets/mall/demand-bg-1.png" />
        <img src="@/assets/mall/demand-bg-2.png" />
      </div>

      <!-- 采购需求弹窗 -->
      <PublishDemandComponent ref="publishDemandRef" @submitSuccess="getDemandList"></PublishDemandComponent>

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

      <!-- 热销推荐 -->
      <div class="hot-recommendation">
        <div class="title">热销推荐</div>
        <!-- 种子 -->
        <div class="content flex mb-12">
          <div class="bg-img">
            <div>种子系列 ></div>
            <div>热卖品种 产地货源</div>
          </div>
          <el-row :gutter="16" style="width: calc(100% - 376px)">
            <el-col :span="8" v-for="item in seedHotRecommendations" :key="item.id" class="mb-12">
              <GoodsItemComponent :goods="item" />
            </el-col>
          </el-row>
        </div>
        <!-- 农资农具 -->
        <div class="content flex">
          <div class="bg-img2">
            <div>农资农具系列 ></div>
            <div>种类多样 质量把控</div>
          </div>
          <el-row :gutter="16" style="width: calc(100% - 376px)">
            <el-col :span="8" v-for="item in agriculturalToolsHotRecommendations" :key="item.id" class="mb-12">
              <GoodsItemComponent :goods="item" />
            </el-col>
          </el-row>
        </div>
      </div>
      <!-- 好物推荐 -->
      <div class="title mt-24">好物推荐</div>
      <el-carousel height="400" autoplay v-if="goodRecommendations.length > 0">
        <el-carousel-item v-for="(group, index) in groupArray(goodRecommendations, 5)" :key="index">
          <div class="recommendation-grid flex gap-12">
            <GoodsItemComponent v-for="item in group" :key="item.id" :goods="item" />
          </div>
        </el-carousel-item>
      </el-carousel>
      <el-empty v-else></el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import RegionSelect from '@/components/RegionSelect/index.vue';
import GoodsCategorySelect from '@/components/GoodsCategorySelect/index.vue';
import PublishDemandComponent from './PublishDemandComponent.vue';
import GoodsItemComponent from './GoodsItemComponent.vue';
import { getProductCategoryList } from '@/api/platform/mallConfiguration/productCategory';
import { Plus } from '@element-plus/icons-vue';
import { supplyHallList, hotRecommendationList, greatGoodsRecommendList, querySupplyInfoById } from '@/api/mall/demand';

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

const publishDemandRef = ref();

const tableList = ref([]);

const loading = ref(false);

const category = ref([]);

const productCategory = ref([]);

const region = ref([]);

const contactVisible = ref(false);

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

const hotRecommendations = ref([]);
const seedHotRecommendations = ref([]);
const agriculturalToolsHotRecommendations = ref([]);

const goodRecommendations = ref([]);

onMounted(async () => {
  getDemandList();
  await fetchProductCategoryList();
  getHotGoodsList();
  getGoodGoodsList();
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
  queryParams.provinceCode = val.provinceCode || '';
  queryParams.cityCode = val.cityCode || '';
  queryParams.districtCode = val.regionCode || '';
};

// 分类选择
const handleCategoryChange = (value: string[]) => {
  queryParams.supplyCategoryId = value[value?.length - 1];
};

// 获取采购需求列表
const getDemandList = async () => {
  loading.value = true;
  console.log(category.value);

  const res = await supplyHallList({
    ...queryParams
    // supplyCategoryId: category.value[category.value?.length - 1]
  });
  if (res.code === 200) {
    tableList.value = res.rows || [];
    queryParams.total = res.total || 0;
    loading.value = false;
  }
};

// 热销推荐
const getHotGoodsList = async () => {
  const res = await hotRecommendationList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    hotRecommendations.value = res.rows;
    classifyCategories();
    // hotRecommendations.value = res.rows.map((e) => {
    //   return {
    //     hnGoodsSpecificationDataList: [{ goodsPrice: e.minGoodsPrice }],
    //     hnBaseEnterpriseInfo: { province: e.province },
    //     sysOssLists: [{ url: e.ossUrls }],
    //     goodsSales: e.goodsSales || 0,
    //     goodssEnsureName: e.goodsEnsureNames?.split(',') || []
    //   };
    // });
  }
};

// 好物推荐
const getGoodGoodsList = async () => {
  const res = await greatGoodsRecommendList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    goodRecommendations.value = res.rows.map((e) => {
      return {
        id: e.id,
        goodsName: e.goodsName,
        hnGoodsSpecificationDataList: [{ goodsPrice: e.goodsPrice }],
        hnBaseEnterpriseInfo: { province: e.enterpriseProvince },
        sysOssLists: [{ url: e.url }],
        goodsSales: e.goodsSales || 0,
        goodssEnsureName: e.goodsAttributes?.split(',') || []
      };
    });
  }
};

//  把种子和农资农具进行分类
const classifyCategories = () => {
  console.log(hotRecommendations.value);

  hotRecommendations.value.forEach((e) => {
    if (getRootCategoryName(e.goodsCategoryId) === '种子') {
      seedHotRecommendations.value.push({
        id: e.id,
        goodsName: e.goodsName,
        hnGoodsSpecificationDataList: [{ goodsPrice: e.minGoodsPrice }],
        hnBaseEnterpriseInfo: { province: e.province },
        sysOssLists: [{ url: e.ossUrls }],
        goodsSales: e.goodsSales || 0,
        goodssEnsureName: e.goodsEnsureNames?.split(',') || []
      });
    } else if (getRootCategoryName(e.goodsCategoryId) === '农资农具') {
      agriculturalToolsHotRecommendations.value.push({
        id: e.id,
        goodsName: e.goodsName,
        hnGoodsSpecificationDataList: [{ goodsPrice: e.minGoodsPrice }],
        hnBaseEnterpriseInfo: { province: e.province },
        sysOssLists: [{ url: e.ossUrls }],
        goodsSales: e.goodsSales || 0,
        goodssEnsureName: e.goodsEnsureNames?.split(',') || []
      });
    }
  });
};

const getRootCategoryName = (id, list = productCategory.value) => {
  // 1. 先找到当前节点
  const current = list.find((item) => item.id === id);

  if (!current) return null;

  // 2. 解析 ancestors（例如 "0,1988088350648373249,1988088401340731394"）
  const ancestorIds = current.ancestors.split(',').filter((v) => v !== '0');
  // 如果没有父级（本身就是 root）
  if (ancestorIds.length === 0) return current.categoryName;

  // 3. 一级分类是 ancestors 里面的第一个非0节点
  const rootId = ancestorIds[0];

  // 4. 找到这个一级分类
  const rootNode = list.find((item) => item.id === rootId);

  return rootNode ? rootNode.categoryName : null;
};

// 获取商品分类列表
const fetchProductCategoryList = async () => {
  const res = await getProductCategoryList({
    pageNum: 1,
    pageSize: 9999
  });
  if (res.code === 200) {
    productCategory.value = res.data || [];
  }
};

// 打开新增需求弹窗
const handleOpenDialog = () => {
  publishDemandRef.value?.openDialog();
};

const contact = (row: any) => {
  contactForm.value = row;
  contactVisible.value = true;
};

const contactDetail = (value: any) => {
  querySupplyInfoById({ id: value }).then((res) => {
    if (res.code === 200) {
      contactForm.value = res.data || {};
      contactVisible.value = true;
    }
  });
};

// 分组数组，每组groupSize个
const groupArray = (array: any[], groupSize: number = 5) => {
  return array.reduce((result, item, index) => {
    const groupIndex = Math.floor(index / groupSize); // 计算当前对象属于第几组
    if (!result[groupIndex]) {
      result[groupIndex] = []; // 初始化组
    }
    result[groupIndex].push(item); // 将对象添加到对应组
    return result;
  }, []);
};
</script>

<style scoped lang="scss">
.demand-component {
  width: 1500px;
  margin: 0 auto;
  padding: 20px 0;
}

.search-form {
  background-color: #fff;
  border-radius: 4px;
  padding: 20px 20px 0 20px;
  margin-top: 30px;
  margin-bottom: 16px;
}

.banners {
  margin: 30px 0 32px 0;
  img {
    width: calc(50% - 12px);
  }
}

.title {
  color: #3d3d3d;
  font-size: 20px;
  font-weight: bold;
  border-left: 2px solid #108c58;
  padding-left: 8px;
  line-height: 16px;
  margin-bottom: 24px;
}

.hot-recommendation {
  .content {
    gap: 16px;
    .goods-item {
      border-radius: 8px;
      background-color: #fff;
      border: 1px solid #bfbfbf;
    }
    .bg-img,
    .bg-img2 {
      width: 360px;
      height: 936px;
      padding: 80px 40px;
      background: url('@/assets/mall/demand-bg-3.png') no-repeat center center;
      background-size: 100% 100%;
      div:first-child {
        font-size: 30px;
        color: #fff;
      }
      div:last-child {
        margin-top: 24px;
        font-size: 24px;
        color: rgba(255, 255, 255, 0.8);
      }
    }
    .bg-img2 {
      background: url('@/assets/mall/demand-bg-4.png') no-repeat center center;
      background-size: 100% 100%;
    }
  }
}

.recommendation-grid {
  // height: auto;
  .goods-item {
    width: calc((100% - 20px * 4) / 5);
    padding: 12px;
    border-radius: 8px;
    background-color: #fff;
    ::v-deep img {
      border-radius: 8px;
    }
  }
}

.address-list {
  max-height: 200px;
  overflow-y: auto;
}

::v-deep .el-carousel__container {
  height: 400px !important;
}
/* 调整 el-carousel 的箭头位置 */
// .el-carousel__arrow {
//   top: 50% !important;
//   transform: translateY(-50%);
// }

/* 确保 el-carousel 的高度与内容一致 */
// .el-carousel {
//   height: auto !important;
// }
</style>
