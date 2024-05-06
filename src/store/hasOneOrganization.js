import { defineStore } from 'pinia'

export const useHasOneOrganization = defineStore('hasOneOrganization', {
  state: () => {
    return {
      isHasOneOrganization: JSON.parse(localStorage.getItem("user")).hasOneOrganization
    }
  },
  getters: {
    getIsHasOneOrganization: (state) => {
      return state.isHasOneOrganization
    }
  },
})