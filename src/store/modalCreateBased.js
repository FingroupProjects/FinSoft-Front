import { defineStore } from 'pinia'

export const useModalCreateBased = defineStore('modalCreateBased', {
  state: () => {
    return {
      isModalCreateBased: false,
      isDarkenThePage: false
    }
  },
  actions: {
    isModal() {
     this.isModalCreateBased = !this.isModalCreateBased
    },
    darkenThePage() {
      this.isDarkenThePage = !this.isDarkenThePage
    }
  },
})