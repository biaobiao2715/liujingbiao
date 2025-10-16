/*
 * @Author: 李刘超
 * @Date: 2025-10-16 14:31:18
 * @LastEditTime: 2025-10-16 14:31:18
 * @FilePath: /grain_sales_web/src/store/modules/registerData.ts
 */

// 注册数据

export const useRegisterDataStore = defineStore('registerData', () => {
  const registerData = ref<any>({});
  return {
    registerData,
    setRegisterData: (data: any) => {
      registerData.value = data;
    }
  };
});
