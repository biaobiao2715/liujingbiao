<template>
  <FormRenderer ref="formRef" :schema="schema" v-model="model" :rules="rules" :options="options" />

  <el-button type="primary" @click="submit">提交</el-button>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FormRenderer from './FormRenderer.vue';
import { useFormSchema } from './useFormSchema';
import { requiredRule, chineseLengthRule } from './validationRules';

const schema = [
  {
    field: 'goodsName',
    label: '商品名称',
    component: 'Input',
    rules: [requiredRule('请输入商品名称'), chineseLengthRule(30, '最多30个汉字')]
  },
  {
    field: 'categoryId',
    label: '商品类目',
    component: 'CustomCascader',
    optionsKey: 'categoryOptions',
    rules: [requiredRule('请选择商品类目')]
  },
  {
    field: 'description',
    label: '商品描述',
    component: 'RichEditor',
    rules: [requiredRule('请输入商品描述')]
  },
  {
    field: 'status',
    label: '上架状态',
    component: 'Select',
    componentProps: {
      options: [
        { label: '上架', value: 1 },
        { label: '下架', value: 0 }
      ]
    }
  },
  {
    field: 'launchTime',
    label: '上架时间',
    component: 'DatePicker',
    visible: (model) => model.status === 1
  }
];

const { model, rules } = useFormSchema(schema);

const options = {
  categoryOptions: [
    { label: '手机', value: 1 },
    { label: '电脑', value: 2 }
  ]
};

const formRef = ref();

const submit = async () => {
  await formRef.value.validate();
  console.log('提交数据', model);
};
</script>
