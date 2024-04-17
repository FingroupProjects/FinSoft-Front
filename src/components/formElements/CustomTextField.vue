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
    default: '250',
    required: false
  }
})

</script>

<template>
  <v-text-field
      :style="[`max-width: ${maxWidth}px`, `min-width: ${minWidth}px`, `max-hieght: 40px !important;`]"
      :color="BASE_COLOR"
      hide-details
      rounded="lg"
      :base-color="FIELD_COLOR"
      variant="outlined"
      class="w-auto text-sm-body-1"
      density="compact"
      clear-icon="close"
  />
</template>

<style scoped>

</style>