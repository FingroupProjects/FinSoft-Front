import { defineStore } from 'pinia'

export const useFilterCanvasVisible = defineStore('filterCanvasVisible', {
  state: () => {
    return { isFilterCanvasVisible: false }
  },
  actions: {
    toggleFilterCanvas() {
      this.isFilterCanvasVisible = !this.isFilterCanvasVisible
    },
    closeFilterCanvas() {
      this.isFilterCanvasVisible = false
    }
  },
})