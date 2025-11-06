<template>
  <div class="area-cascader">
    <el-cascader
      v-model="selectedValue"
      :options="areaOptions"
      :props="cascaderProps"
      :placeholder="placeholder"
      :clearable="clearable"
      :show-all-levels="showAllLevels"
      :collapse-tags="collapseTags"
      :size="props.size"
      :disabled="disabled"
      @change="handleChange"
      style="width: 100%"
    />

    <!-- 显示选中结果 -->
    <div v-if="showResult && selectedValue.length" class="selected-result">
      <p>选中结果：{{ selectedText }}</p>
      <p>代码数组：{{ selectedValue }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import areaData from 'china-area-data';

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择地区'
  },
  clearable: {
    type: Boolean,
    default: true
  },
  showAllLevels: {
    type: Boolean,
    default: true
  },
  collapseTags: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  showResult: {
    type: Boolean,
    default: false
  },
  includeRegion: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'change']);

const selectedValue = ref([]);
const areaOptions = ref([]);

// 大区配置
const regionConfig = {
  'north': { name: '华北', provinces: ['110000', '120000', '130000', '140000', '150000'] },
  'northeast': { name: '东北', provinces: ['210000', '220000', '230000'] },
  'east': { name: '华东', provinces: ['310000', '320000', '330000', '340000', '350000', '360000', '370000'] },
  'central': { name: '华中', provinces: ['410000', '420000', '430000'] },
  'south': { name: '华南', provinces: ['440000', '450000', '460000'] },
  'southwest': { name: '西南', provinces: ['500000', '510000', '520000', '530000', '540000'] },
  'northwest': { name: '西北', provinces: ['610000', '620000', '630000', '640000', '650000'] }
};

const cascaderProps = {
  value: 'code',
  label: 'name',
  children: 'children',
  expandTrigger: 'hover',
  checkStrictly: false
};

// 计算选中文本
const selectedText = computed(() => {
  if (!selectedValue.value.length) return '';

  const getAreaName = (code, parentCode = '86') => {
    return areaData[parentCode]?.[code] || '';
  };

  if (props.includeRegion && selectedValue.value.length === 4) {
    const [regionCode, provinceCode, cityCode, districtCode] = selectedValue.value;
    const regionName = regionConfig[regionCode]?.name || '';
    const provinceName = getAreaName(provinceCode);
    const cityName = getAreaName(cityCode, provinceCode);
    const districtName = getAreaName(districtCode, cityCode);

    return `${regionName} - ${provinceName} - ${cityName} - ${districtName}`;
  } else if (selectedValue.value.length === 3) {
    const [provinceCode, cityCode, districtCode] = selectedValue.value;
    const provinceName = getAreaName(provinceCode);
    const cityName = getAreaName(cityCode, provinceCode);
    const districtName = getAreaName(districtCode, cityCode);

    return `${provinceName} - ${cityName} - ${districtName}`;
  }

  return selectedValue.value.map((code) => getAreaName(code)).join(' - ');
});

// 初始化数据
const initAreaData = () => {
  const provinces = areaData['86'];

  if (props.includeRegion) {
    // 包含大区的四级数据
    areaOptions.value = Object.keys(regionConfig).map((regionKey) => {
      const region = regionConfig[regionKey];
      const provinceChildren = region.provinces
        .map((provinceCode) => {
          if (!provinces[provinceCode]) return null;

          const cities = areaData[provinceCode] || {};
          const cityChildren = Object.keys(cities)
            .map((cityCode) => {
              const districts = areaData[cityCode] || {};
              const districtChildren = Object.keys(districts).map((districtCode) => ({
                code: districtCode,
                name: districts[districtCode]
              }));

              return {
                code: cityCode,
                name: cities[cityCode],
                children: districtChildren.length ? districtChildren : undefined
              };
            })
            .filter(Boolean);

          return {
            code: provinceCode,
            name: provinces[provinceCode],
            children: cityChildren.length ? cityChildren : undefined
          };
        })
        .filter(Boolean);

      return {
        code: regionKey,
        name: region.name,
        children: provinceChildren
      };
    });
  } else {
    // 标准省市区三级数据
    areaOptions.value = Object.keys(provinces).map((provinceCode) => {
      const cities = areaData[provinceCode] || {};
      const cityChildren = Object.keys(cities).map((cityCode) => {
        const districts = areaData[cityCode] || {};
        const districtChildren = Object.keys(districts).map((districtCode) => ({
          code: districtCode,
          name: districts[districtCode]
        }));

        return {
          code: cityCode,
          name: cities[cityCode],
          children: districtChildren.length ? districtChildren : undefined
        };
      });

      return {
        code: provinceCode,
        name: provinces[provinceCode],
        children: cityChildren
      };
    });
  }
};

// 事件处理
const handleChange = (value) => {
  emit('update:modelValue', value);
  emit('change', value);
};

// 监听props变化
watch(
  () => props.modelValue,
  (newVal) => {
    selectedValue.value = newVal;
  }
);

// 对外暴露方法
defineExpose({
  getSelectedText: () => selectedText.value,
  clear: () => {
    selectedValue.value = [];
  },
  getAreaOptions: () => areaOptions.value
});

onMounted(() => {
  initAreaData();
  selectedValue.value = props.modelValue;
});
</script>

<style scoped>
.area-cascader {
  width: 100%;
}

.selected-result {
  margin-top: 10px;
  padding: 10px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}
</style>
