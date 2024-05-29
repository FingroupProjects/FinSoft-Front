import { defineStore } from 'pinia'
import {useModalCreateBased} from "./modalCreateBased.js";

export const useFilterCanvasVisible = defineStore('filterCanvasVisible', {
  state: () => {
    return { isFilterCanvasVisible: false }
  },
  actions: {
    toggleFilterCanvas() {
      useModalCreateBased().darkenThePage()
      this.isFilterCanvasVisible = !this.isFilterCanvasVisible
    },
    closeFilterCanvas() {
      useModalCreateBased().darkenThePage()
      this.isFilterCanvasVisible = false
    }
  },
})