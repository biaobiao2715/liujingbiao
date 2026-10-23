<template>
  <el-form :model="innerModel" :rules="rules" ref="formRef">
    <el-form-item v-for="item in visibleSchema" :key="item.field" :label="item.label" :prop="item.field">
      <component
        :is="componentMap[item.component]"
        v-model="innerModel[item.field]"
        v-bind="item.componentProps"
        :options="options[item.optionsKey]"
      />
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { componentMap } from './componentMap';

const props = defineProps<{
  schema: any[];
  modelValue: Record<string, any>;
  rules: Record<string, any>;
  options: Record<string, any>;
}>();

const emit = defineEmits(['update:modelValue']);

const formRef = ref();

const visibleSchema = computed(() =>
  props.schema.filter((item) => (typeof item.visible === 'function' ? item.visible(innerModel.value) : item.visible !== false))
);

const innerModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v)
});

defineExpose({
  validate: () => formRef.value.validate()
});
</script>
