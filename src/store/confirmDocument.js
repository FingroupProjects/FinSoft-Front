import { defineStore } from 'pinia'

export const useConfirmDocumentStore = defineStore('confirmDocument', {
  state: () => {
    return { isUpdateOrCreateDocument: false }
  },
  actions: {
    updateOrCreateDocument() {
      this.isUpdateOrCreateDocument = true

      setTimeout(() => {
        this.isUpdateOrCreateDocument = false
      }, 2000)
    },
  },
})