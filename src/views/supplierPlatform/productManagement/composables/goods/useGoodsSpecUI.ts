// useGoodsSpecUI.ts
export const useGoodsSpecUI = () => {
  const confirmRemove = async () => {
    await ElMessageBox.confirm('您确定要删除该数据?', '提示');
  };

  return { confirmRemove };
};
