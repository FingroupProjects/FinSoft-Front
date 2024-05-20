import { defineStore } from 'pinia'

export const useModalCreateBased = defineStore('modalCreateBased', {
  state: () => {
    return { isModalCreateBased: false }
  },
  actions: {
    isModal() {
     this.isModalCreateBased = !this.isModalCreateBased
    },
  },
})