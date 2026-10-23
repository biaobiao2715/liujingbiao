import { ref } from 'vue';

export interface GoodsSpecRow {
  goodsSpecification: string;
  goodsSpecificationValue: string;
  goodsPrice: string | number;
  goodsStock: string | number;
  goodsWeight: string | number;
  status: number;
  // 行级校验错误（供表格展示使用）
  errors?: {
    goodsSpecificationValue?: string;
    goodsPrice?: string;
    goodsStock?: string;
    goodsWeight?: string;
  };
}

export const useGoodsSpecTable = () => {
  const tableData = ref<GoodsSpecRow[]>([]);

  // 创建一个空行
  const createEmptyRow = (spec = ''): GoodsSpecRow => ({
    goodsSpecification: spec,
    goodsSpecificationValue: '',
    goodsPrice: '',
    goodsStock: '',
    goodsWeight: '',
    status: 1
  });

  // 初始化表格数据
  const init = (list: Partial<GoodsSpecRow>[] = []) => {
    tableData.value = list.map((item) => ({
      ...createEmptyRow(item.goodsSpecification),
      ...item
    }));
  };

  // 新增一行
  const addRow = (spec = '') => {
    tableData.value.push(createEmptyRow(spec)); // 直接修改原数组
  };

  // 删除指定行
  const removeRow = (index: number) => {
    if (index >= 0 && index < tableData.value.length) {
      tableData.value.splice(index, 1); // 使用 splice 直接修改原数组
    }
  };

  // 更新所有行的规格字段
  const updateSpecification = (spec: string) => {
    tableData.value.forEach((row) => {
      row.goodsSpecification = spec;
    });
  };

  // 校验所有行数据（可以在提交时进行）
  const validateRows = () => {
    let isValid = true;
    tableData.value.forEach((row) => {
      if (!row.goodsSpecification || !row.goodsSpecificationValue || !row.goodsPrice || !row.goodsStock) {
        isValid = false; // 只要有字段为空就认为无效
      }
    });
    return isValid;
  };

  return {
    state: {
      tableData
    },
    actions: {
      init,
      addRow,
      removeRow,
      updateSpecification,
      validateRows // 暴露校验方法
    }
  };
};
