<!--
  标题: CompareDetailComponent.vue
  功能: 对比商品详情
  说明:         
  当前版本: 1.0
  开发信息: Created by 李春雷 2025-11-29
-->
<template>
  <div class="compare-detail-container">
    <!-- 对比商品列表 -->
    <div class="compare-goods-list flex">
      <div class="label flex-center-center">对比商品</div>
      <div class="row-container flex">
        <GoodsItemComponent :goods="item" v-for="(item, index) in compareGoodsList" :key="item.id" class="compare-item" />
      </div>
    </div>
    <div class="title">商品信息</div>
    <div class="table-info">
      <el-table :data="tableData" border class="compare-table" :show-header="false" cell-class-name="row-title">
        <!-- 固定左边标题列 -->
        <el-table-column prop="title" fixed="left" width="150">
          <template #default="scope">
            <div class="left-title">{{ scope.row.title }}</div>
          </template>
        </el-table-column>

        <!-- 后面内容列：循环生成 -->
        <el-table-column v-for="(item, index) in newCompareGoodsList" :key="index" :label="item.name" align="center" min-width="250">
          <template #default="{ row }">
            <!-- 根据 row.title 决定显示对应字段 -->

            <div v-if="row.title === '品种'">
              {{ item.goodsName }}
            </div>

            <div v-if="row.title === '区域'">
              {{ item.hnBaseEnterpriseInfo.province }}
            </div>

            <div v-else-if="row.title === '商品价格'">
              <el-tag v-for="(p, i) in item.hnGoodsSpecificationDataList" :key="i" type="success" class="tag-item">
                {{ p.goodsPrice + '元' + ' / ' + p.goodsSpecificationValue + item.goodsSpecificationName }}
              </el-tag>

              <div v-for="el in item.hnGoodsSpecificationDataList"></div>
            </div>

            <div v-else-if="row.title === '历史价格'">
              <div v-for="(p, i) in item.priceHistories" :key="i" class="history-line flex-center-center gap-4">
                <div class="old-price">{{ p.goodsOldPrice + '元' + ' / ' + p.goodsSpecificationValue + item.goodsSpecificationName }}</div>
                <div>--- 调整至 ---</div>
                <div class="new-price">{{ p.goodsNewPrice + '元' + ' / ' + p.goodsSpecificationValue + item.goodsSpecificationName }}</div>
              </div>
            </div>

            <div v-else-if="row.title === '产品保障'" class="flex-center-center gap-8 wrap">
              <el-tag v-for="value in item.goodssEnsureName" :key="value">{{ value }}</el-tag>
              <div v-if="!item.goodssEnsureName.length">-</div>
            </div>

            <div v-else-if="row.title === '产品功能'" class="flex-center-center gap-8 wrap">
              <el-tag v-for="value in item.goodsAbilityName" :key="value">{{ value }}</el-tag>
              <div v-if="!item.goodssEnsureName.length">-</div>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="title">商家信息</div>
    <div class="table-info">
      <el-table :data="tableData2" border class="compare-table" :show-header="false" cell-class-name="row-title">
        <!-- 固定左边标题列 -->
        <el-table-column prop="title" fixed="left" width="150">
          <template #default="scope">
            <div class="left-title">{{ scope.row.title }}</div>
          </template>
        </el-table-column>

        <!-- 后面内容列：循环生成 -->
        <el-table-column v-for="(item, index) in newCompareGoodsList" :key="index" :label="item.name" align="center" min-width="250">
          <template #default="{ row }">
            <!-- 根据 row.title 决定显示对应字段 -->

            <div v-if="row.title === '卖家名称'">
              {{ item.hnBaseEnterpriseInfo.companyName }}
            </div>
            <div v-else-if="row.title === '资质等级'">
              <dict-tag :options="plat_qualification_grade" :value="item.hnBaseEnterpriseInfo?.credentialLevel" />
            </div>
            <div v-else-if="row.title === '信用等级'">
              <dict-tag :options="plat_credit_rating" :value="item.hnBaseEnterpriseInfo?.creditLevel" />
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { goodsCompareList, goodsDetail, comparePrices } from '@/api/mall/goods/index';
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const { plat_qualification_grade, plat_credit_rating } = toRefs<any>(
  proxy?.useDict('review_status', 'plat_qualification_grade', 'plat_credit_rating')
);

import GoodsItemComponent from '../GoodsItemComponent.vue';

const props = defineProps<{
  compareGoodsList: any[];
}>();

const newCompareGoodsList = ref([]);

const titles = ['品种', '区域', '商品价格', '历史价格', '产品保障', '产品功能'];
const titles2 = ['商家名称', '资质等级', '信用等级'];

// 第 1 列的数据对应 titles
const tableData = titles.map((t) => ({ title: t }));
const tableData2 = titles2.map((t) => ({ title: t }));

onMounted(() => {
  fetchData();
  console.log(props.compareGoodsList);
});

const fetchData = async () => {
  // 跳过第一个商品，因为第一个商品是用户选择的商品
  const comparePricesGoodsIds = props.compareGoodsList
    .slice(1)
    .map((item) => item.id)
    .join(',');

  const res = await comparePrices({ id: props.compareGoodsList[0]?.id, comparePricesGoodsIds });
  newCompareGoodsList.value = [res.data.hnMallVo, ...res.data.comparePrices];
};
</script>

<style scoped lang="scss">
.compare-detail-container {
  padding: 12px;
  .compare-goods-list {
    height: 380px;
  }
  .label {
    height: 100%;
    font-size: 14px;
    color: #108c58;
    padding: 0 32px;
    background: rgba(16, 140, 88, 0.1);
    border-radius: 8px 0px 0px 8px;
  }
  .row-container {
    width: calc(100% - 380px);
    gap: 16px;
    background-color: #fff;
    border-radius: 4px;
    padding: 20px 10px;

    .compare-item {
      // flex: 1;
      width: calc((100% - 16px * 4) / 5);
      border-radius: 8px;
      box-shadow: 0px 2px 5px 0px rgba(0, 0, 0, 0.2);
      ::v-deep img {
        border-radius: 8px;
      }
    }
  }

  .title {
    color: #3d3d3d;
    font-size: 20px;
    font-weight: bold;
    border-left: 2px solid #108c58;
    padding-left: 8px;
    line-height: 16px;
    margin: 30px 0 20px 0;
  }
  .table-info {
    .row-title {
      background-color: rgba(16, 140, 88, 0.1);
    }
    .history-line {
      font-size: 14px;
      .old-price {
        color: #ef4d0b;
      }
      .new-price {
        color: #108c58;
      }
    }
  }
}
.wrap {
  flex-wrap: wrap;
}
</style>
