<template>
  <el-form :model="model" :rules="rules" ref="formRef">
    <el-form-item v-for="item in visibleSchema" :key="item.field" :label="item.label" :prop="item.field">
      <component :is="componentMap[item.component]" v-model="model[item.field]" v-bind="item.componentProps" :options="options[item.optionsKey]" />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { componentMap } from './componentMap';

const props = defineProps<{
  schema: any[];
  model: Record<string, any>;
  rules: Record<string, any>;
  options: Record<string, any>;
}>();

const formRef = ref();

const visibleSchema = computed(() =>
  props.schema.filter((item) => (typeof item.visible === 'function' ? item.visible(props.model) : item.visible !== false))
);

defineExpose({
  validate: () => formRef.value.validate()
});
</script>
