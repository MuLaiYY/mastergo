import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useOriginalCodeStore = defineStore('originalCode', () => {
  const originalCode = ref('')

  function changeOriginalCode(changedCode:string) {
    originalCode.value = changedCode
  }

  return { originalCode, changeOriginalCode }
})
