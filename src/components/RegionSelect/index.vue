<template>
  <el-cascader
    v-model="regionValue"
    filterable
    clearable
    :disabled="disabled"
    :options="options"
    :props="propsCascader"
    :show-all-levels="props.showAllLevels"
    :placeholder="props.placeholder"
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
  },
  //是否禁用
  disabled: {
    type: Boolean,
    default: false
  },
  //是否多选
  multiple: {
    type: Boolean,
    default: false
  },
  //是否选择任意一级选项
  checkStrictly: {
    type: Boolean,
    default: false
  },
  // 是否仅显示最后一级
  showAllLevels: {
    type: Boolean,
    default: true
  },
  // 占位符
  placeholder: {
    type: String,
    default: '请选择区域'
  }
});

const propsCascader = {
  multiple: props.multiple,
  checkStrictly: props.checkStrictly
};
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

const handleChange = (val: string[] | undefined) => {
  if (!val) {
    emits('regionChange', undefined);
    return;
  }

  const [provinceCode, cityCode, districtCode] = val || [];

  const arr = {
    regionPath: val || [],
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
