import { reactive } from 'vue';

export function useFormSchema(schema: any[]) {
  const model: any = reactive({});
  const rules: any = reactive({});

  schema.forEach((item) => {
    model[item.field] = item.default ?? '';
    if (item.rules) rules[item.field] = item.rules;
  });

  return { model, rules };
}
