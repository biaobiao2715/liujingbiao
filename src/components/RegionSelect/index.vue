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
import { computed, ref, watch, defineProps, defineEmits } from 'vue';
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

const handleChange = (val: string[] | string[][] | undefined) => {
  if (!val) {
    emits('regionChange', undefined);
    return;
  }

  // 多选情况
  if (props.multiple && Array.isArray(val) && Array.isArray(val[0])) {
    const result = (val as string[][]).map((item) => {
      const [provinceCode, cityCode, districtCode] = item;
      return {
        regionPath: item,
        provinceCode: provinceCode || '',
        cityCode: cityCode || '',
        regionCode: districtCode || '',
        province: areaData['86'][provinceCode] || '',
        city: areaData[provinceCode]?.[cityCode] || '',
        region: areaData[cityCode]?.[districtCode] || ''
      };
    });

    emits('regionChange', val, result);
    return;
  }

  // 单选或任意一级
  const path = val as string[];
  // 仅显示最后一级时，path 可能只有一个元素
  const provinceCode = path[0] || '';
  const cityCode = path[1] || '';
  const districtCode = path[2] || '';

  // 判断选中级别
  let province = '',
    city = '',
    region = '';
  if (path.length === 1) {
    province = areaData['86'][provinceCode] || '';
  } else if (path.length === 2) {
    province = areaData['86'][provinceCode] || '';
    city = areaData[provinceCode]?.[cityCode] || '';
  } else if (path.length === 3) {
    province = areaData['86'][provinceCode] || '';
    city = areaData[provinceCode]?.[cityCode] || '';
    region = areaData[cityCode]?.[districtCode] || '';
  }

  const arr = {
    regionPath: path,
    provinceCode,
    cityCode,
    regionCode: districtCode,
    province,
    city,
    region
  };

  emits('regionChange', arr);
};
</script>

<style scoped lang="scss">
/* 可根据需要添加样式 */
</style>
