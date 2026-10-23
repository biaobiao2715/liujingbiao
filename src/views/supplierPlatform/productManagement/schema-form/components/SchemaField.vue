<!-- 单字段渲染器（核心） -->
<!-- SchemaField.vue -->
<template>
  <div v-if="isVisible">
    <label class="label">{{ schema.label }}</label>

    <!-- 编辑态 -->
    <component v-if="mode === 'edit'" :is="component" v-model="model[schema.field]" v-bind="mergedProps" />

    <!-- 只读态 -->
    <component v-else-if="mode === 'readonly'" :is="component" v-model="model[schema.field]" disabled />

    <!-- 展示态 -->
    <div v-else>
      {{ displayValue }}
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { resolveFieldMode } from '../utils/resolveMode';
import { inputBehaviors } from '../behaviors/inputBehaviors';

const props = defineProps<{
  schema: any;
  model: any;
  pageMode: any;
}>();

const mode = computed(() => resolveFieldMode(props.schema.mode, props.pageMode, props.model));

const isVisible = computed(() => (props.schema.visible ? props.schema.visible(props.model) : true));

const behavior = computed(() => (props.schema.inputType ? inputBehaviors[props.schema.inputType] : {}));

const mergedProps = computed(() => ({
  placeholder: behavior.value?.placeholder,
  ...props.schema.componentProps
}));

const displayValue = computed(() => {
  const val = props.model[props.schema.field];
  if (props.schema.formatter) return props.schema.formatter(val, props.model);
  return val ?? '-';
});
</script>
