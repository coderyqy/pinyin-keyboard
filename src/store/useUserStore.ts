// Pinia Store
import { defineStore } from "pinia";

export const useUserStore = defineStore("userStore", {
  // 数据
  state: () => ({
    todayNum: 10,
  }),
  getters: {},
  actions: {},
});
