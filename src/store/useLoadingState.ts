import {defineStore} from "pinia";
import {ref} from "vue";

export const useLoadingState = defineStore('loadingState', () => {
  const isLoadingExport = ref(false);



  return {
    isLoadingExport,
  }
})