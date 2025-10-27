<template>
  <div class="category-container">
    <div class="category-selection"></div>
    <div class="weight-selection flex gap-24">
      <div class="local">
        <el-cascader
          style="width: 100%"
          v-model="areaCodes"
          filterable
          :options="optionsAddres"
          :props="{
            value: 'value',
            label: 'label',
            children: 'children'
          }"
          placeholder="请选择"
          @change="handleAreaChange"
        ></el-cascader>
      </div>
      <el-button :type="isLatest ? 'primary' : 'default'" @click="isLatest = !isLatest">最新</el-button>
      <el-button :type="isSales ? 'primary' : 'default'" @click="isSales = !isSales">销量</el-button>
      <div class="price flex-center gap-8">
        <div class="price-label">价格</div>
        <el-input v-model="priceMin" placeholder="最低价" />
        -
        <el-input v-model="priceMax" placeholder="最高价" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import areaData from 'china-area-data'; //注册地址数据

console.log(areaData);
const areaCodes = ref([]);
const isLatest = ref(false);
const isSales = ref(false);
const priceMin = ref(0);
const priceMax = ref(0);

// 处理地址选择变化
const handleAreaChange = (val: string[]) => {
  console.log(val);
};

// 地址选择数据
const optionsAddres = computed(() => {
  const formatData = (parentCode) => {
    const children = areaData[parentCode];
    if (!children) return undefined;

    return Object.keys(children).map((code) => ({
      value: code,
      label: children[code],
      children: formatData(code)
    }));
  };

  return formatData('86') || [];
});
</script>

<style scoped lang="scss">
.category-container {
  padding: 12px;
  border: 1px solid #e4e7ed;
  .weight-selection {
    .local {
      width: 240px;
    }
  }
  .price-label {
    width: 86px;
  }
}
</style>
