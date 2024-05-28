<script setup>
import {BASE_COLOR, FIELD_COLOR} from "../../composables/constant/colors.js"

defineProps({
  minWidth: {
    type: String,
    default: '52',
    required: false
  },
  maxWidth: {
    type: String,
    default: '52',
    required: false
  }
})

</script>

<template>
  <v-text-field
      :style="[`max-width: ${maxWidth}%`, `min-width: ${minWidth}%`, `max-height: 40px !important;`]"
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