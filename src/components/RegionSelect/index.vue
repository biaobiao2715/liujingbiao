<template>
  <el-cascader
    v-model="regionValue"
    filterable
    :options="options"
    :props="{
      value: 'value',
      label: 'label',
      children: 'children'
    }"
    placeholder="请选择区域进行查询"
    @change="handleChange"
  ></el-cascader>
</template>

<script setup lang="ts">
import { computed, defineProps, defineEmits } from 'vue';
import areaData from 'china-area-data';

const emits = defineEmits(['regionChange']);

const props = defineProps({
  modelValue: {
    type: Array as () => string[],
    default: () => []
  }
});
const regionValue = ref<string[]>([]);

watch(
  () => props.modelValue,
  (newValue) => {
    regionValue.value = newValue;
  },
  { immediate: true } // 初始化时立即同步
);

const options = computed(() => {
  const formatData = (parentCode: string) => {
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

const handleChange = (val: string[]) => {
  // console.log(val);
  const [provinceCode, cityCode, districtCode] = val;

  const arr = {
    regionPath: val,
    provinceCode: provinceCode || '',
    cityCode: cityCode || '',
    regionCode: districtCode || '',
    province: areaData['86'][provinceCode] || '',
    city: areaData[provinceCode]?.[cityCode] || '',
    region: areaData[cityCode]?.[districtCode] || ''
  };
  emits('regionChange', arr);
};
</script>

<style scoped lang="scss">
/* 可根据需要添加样式 */
</style>
