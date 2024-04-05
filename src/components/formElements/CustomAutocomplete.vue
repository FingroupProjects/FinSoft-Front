<script setup>
import {FIELD_COLOR} from "../../composables/constant/colors.js"

defineProps({
  minWidth: {
    type: String,
    default: '250',
    required: false
  },
  maxWidth: {
    type: String,
    default: '250',
    required: false
  }
})
</script>

<template>
  <v-autocomplete
      :style="[`max-width: ${maxWidth}px`, `min-width: ${minWidth}px`]"
      variant="outlined"
      color="green"
      rounded="lg"
      no-data-text="Нет данных"
      :base-color="FIELD_COLOR"
      item-title="name"
      item-value="id"
  />
</template>

<style scoped>

</style>