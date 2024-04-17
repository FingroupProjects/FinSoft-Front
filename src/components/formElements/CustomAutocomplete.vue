<script setup>
import {BASE_COLOR, FIELD_COLOR} from "../../composables/constant/colors.js"

defineProps({
  minWidth: {
    type: String,
    default: '250',
    required: false
  },
  maxWidth: {
    type: String,
    default: '250px',
    required: false
  }
})
</script>

<template>
  <v-autocomplete
      :style="[`max-width: ${maxWidth}`, `min-width: ${minWidth}px`, 'max-height: 40px !important']"
      variant="outlined"
      :color="BASE_COLOR"
      hide-details
      rounded="lg"
      no-data-text="Нет данных"
      :base-color="FIELD_COLOR"
      item-title="name"
      item-value="id"
  />
</template>

<style scoped>

</style>