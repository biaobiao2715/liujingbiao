<template>
  <div class="compare-goods-container">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/mall/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item :to="{ path: '/mall/compare-goods', query: route.query.id ? { id: route.query.id } : {} }">加入对比</el-breadcrumb-item>
      <el-breadcrumb-item>对比详情</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 对比商品卡片区域 -->
    <CompareCardsComponent
      :goods-list="compareGoodsList"
      @remove="removeGoods"
    />

    <!-- 商品信息对比表格 -->
    <GoodsInfoCompareTable :goods-list="compareGoodsList" />

    <!-- 供应商信息对比表格 -->
    <SupplierInfoCompareTable :goods-list="compareGoodsList" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { goodsDetail, comparePrices } from '@/api/mall/goods/index';
import type { Goods } from '../../mall';
import CompareCardsComponent from './CompareCardsComponent.vue';
import GoodsInfoCompareTable from './GoodsInfoCompareTable.vue';
import SupplierInfoCompareTable from './SupplierInfoCompareTable.vue';

interface CompareGoodsItem extends Partial<Goods> {
  image?: string;
  price?: string;
  location?: string;
}

const props = defineProps<{
  goodsList?: CompareGoodsItem[];
}>();

const route = useRoute();
const compareGoodsList = ref<CompareGoodsItem[]>([]);

// 移除商品
const removeGoods = (index: number) => {
  compareGoodsList.value.splice(index, 1);
  saveToLocalStorage();
};

// 保存到本地存储
const saveToLocalStorage = () => {
  try {
    localStorage.setItem('compareGoodsList', JSON.stringify(compareGoodsList.value));
  } catch (error) {
    console.error('保存比价商品列表失败:', error);
  }
};

// 从本地存储加载
const loadFromLocalStorage = () => {
  try {
    const saved = localStorage.getItem('compareGoodsList');
    if (saved) {
      compareGoodsList.value = JSON.parse(saved);
    }
  } catch (error) {
    console.error('加载比价商品列表失败:', error);
  }
};

// 添加商品到比价列表
const addGoods = (goods: CompareGoodsItem) => {
  // 检查是否已存在
  if (compareGoodsList.value.some(item => item.id === goods.id)) {
    return;
  }
  
  // 限制最多5个
  if (compareGoodsList.value.length >= 5) {
    compareGoodsList.value.shift();
  }
  
  compareGoodsList.value.push(goods);
  saveToLocalStorage();
};

// 从路由参数获取并加载对比数据
const loadCompareDataFromRoute = async () => {
  const id = route.query.id as string;
  const compareIds = route.query.compareIds as string;
  
  if (id && compareIds) {
    try {
      // 调用比价API获取数据
      const params: any = {
        id: id,
        comparePricesGoodsIds: compareIds.split(',').map(id => String(id))
      };
      
      const res = await comparePrices(params);
      if (res && res.code === 200 && res.data) {
        let goodsData = res.data;
        if (Array.isArray(res.data.comparePrices)) {
          goodsData = res.data.comparePrices;
        } else if (Array.isArray(res.data)) {
          goodsData = res.data;
        }
        
        compareGoodsList.value = goodsData.map((goods: any) => ({
          ...goods,
          price: goods.hnGoodsSpecificationDataList?.[0]?.goodsPrice || '0',
          location: goods.hnBaseEnterpriseInfo?.province,
          priceHistories: goods.priceHistories || []
        }));
        saveToLocalStorage();
      }
    } catch (error) {
      console.error('加载比价数据失败:', error);
      // 失败时从本地存储加载
      loadFromLocalStorage();
    }
  } else {
    // 没有路由参数时，从本地存储加载
    loadFromLocalStorage();
  }
};

onMounted(() => {
  // 如果传入了商品列表，使用传入的列表
  if (props.goodsList && props.goodsList.length > 0) {
    compareGoodsList.value = props.goodsList.map(goods => {
      // 处理价格显示
      const price = goods.hnGoodsSpecificationDataList?.[0]?.goodsPrice || '0';
      return {
        ...goods,
        price: price.toString(),
        location: goods.hnBaseEnterpriseInfo?.province
      };
    });
    saveToLocalStorage();
  } else {
    // 否则从路由参数或本地存储加载
    loadCompareDataFromRoute();
  }
});

defineExpose({
  addGoods,
  removeGoods
});
</script>

<style lang="scss" scoped>
.compare-goods-container {
  padding:  20px 70px;
  background: #fff;

  .breadcrumb {
    margin-bottom: 24px;
    font-size: 14px;
  }
}
</style>

