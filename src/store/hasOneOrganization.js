import { defineStore } from 'pinia'
import organizations from '../api/list/organizations'

export const useHasOneOrganization = defineStore('hasOneOrganization', {
  state: () => {
    return {
      isHasOneOrganization: JSON.parse(localStorage.getItem("user")).hasOneOrganization,
      organization: JSON.parse(localStorage.getItem("user")).organization
    }
  },
  getters: {
    getIsHasOneOrganization: (state) => {
      return state.isHasOneOrganization
    },
    getOrganization: (state) => {
      return state.organization
    }
  },
})